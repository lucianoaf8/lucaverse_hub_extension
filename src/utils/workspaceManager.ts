import { PanelLayout } from '../types/panel';
import { nanoid } from 'nanoid';

// Workspace configuration interface
export interface WorkspaceConfig {
  id: string;
  name: string;
  description?: string;

  // Complete layout state
  panels: PanelLayout[];
  selectedPanelIds: string[];

  // Layout settings
  gridSettings: {
    enabled: boolean;
    size: number;
    visible: boolean;
    color: string;
    opacity: number;
    snapThreshold: number;
  };

  // Application settings
  settings: {
    theme: string;
    autoSave: boolean;
    autoSaveInterval: number;
    snapToGrid: boolean;
    showGrid: boolean;
    debugMode: boolean;
  };

  // Workspace metadata
  metadata: {
    version: string;
    author?: string;
    createdAt: number;
    updatedAt: number;
    lastAccessed: number;
    tags: string[];
    category?: string;
    thumbnail?: string;
  };

  // Workspace statistics
  stats: {
    panelCount: number;
    totalInteractions: number;
    timeSpent: number;
    lastModified: number;
  };
}

// Workspace diff for version control
export interface WorkspaceDiff {
  id: string;
  workspaceId: string;
  timestamp: number;
  changes: {
    added: PanelLayout[];
    modified: Array<{ old: PanelLayout; new: PanelLayout }>;
    removed: PanelLayout[];
  };
  metadata: {
    changeCount: number;
    description?: string;
  };
}

// Workspace backup entry
export interface WorkspaceBackup {
  id: string;
  workspaceId: string;
  timestamp: number;
  config: WorkspaceConfig;
  type: 'manual' | 'auto' | 'scheduled';
  compressionLevel: number;
}

// Workspace manager class
export class WorkspaceManager {
  private static instance: WorkspaceManager;
  private workspaces: Map<string, WorkspaceConfig> = new Map();
  private history: Map<string, WorkspaceDiff[]> = new Map();
  private backups: Map<string, WorkspaceBackup[]> = new Map();
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private compressionEnabled = true;

  static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager();
    }
    return WorkspaceManager.instance;
  }

  private constructor() {
    this.loadFromStorage();
    this.setupAutoSave();
  }

  /**
   * Save workspace with metadata and validation
   */
  async saveWorkspace(
    name: string,
    config: Omit<WorkspaceConfig, 'id' | 'metadata' | 'stats'>,
    options: {
      description?: string;
      tags?: string[];
      category?: string;
      createBackup?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const now = Date.now();
      const workspaceId = `workspace-${nanoid()}`;

      // Validate workspace configuration
      const validation = this.validateWorkspace(config);
      if (!validation.isValid) {
        throw new Error(`Invalid workspace: ${validation.errors.join(', ')}`);
      }

      // Create workspace configuration
      const workspace: WorkspaceConfig = {
        ...config,
        id: workspaceId,
        name,
        description: options.description,
        metadata: {
          version: '2.0.0',
          author: 'user', // Could be retrieved from user store
          createdAt: now,
          updatedAt: now,
          lastAccessed: now,
          tags: options.tags || [],
          category: options.category,
        },
        stats: {
          panelCount: config.panels.length,
          totalInteractions: 0,
          timeSpent: 0,
          lastModified: now,
        },
      };

      // Generate thumbnail
      workspace.metadata.thumbnail = await this.generateThumbnail(workspace);

      // Store workspace
      this.workspaces.set(workspaceId, workspace);

      // Create initial history entry
      this.addToHistory(workspaceId, {
        added: config.panels,
        modified: [],
        removed: [],
      });

      // Create backup if requested
      if (options.createBackup) {
        await this.createBackup(workspaceId, 'manual');
      }

      // Persist to storage
      await this.saveToStorage();

      console.log(`Workspace "${name}" saved with ID: ${workspaceId}`);
      return workspaceId;
    } catch (error) {
      console.error('Failed to save workspace:', error);
      throw error;
    }
  }

  /**
   * Load workspace with validation and error handling
   */
  async loadWorkspace(workspaceId: string): Promise<WorkspaceConfig | null> {
    try {
      const workspace = this.workspaces.get(workspaceId);
      if (!workspace) {
        throw new Error(`Workspace not found: ${workspaceId}`);
      }

      // Validate workspace before loading
      const validation = this.validateWorkspace(workspace);
      if (!validation.isValid) {
        console.warn(`Loading potentially corrupted workspace: ${validation.errors.join(', ')}`);
      }

      // Update access time
      workspace.metadata.lastAccessed = Date.now();
      this.workspaces.set(workspaceId, workspace);

      await this.saveToStorage();

      console.log(`Workspace "${workspace.name}" loaded successfully`);
      return workspace;
    } catch (error) {
      console.error('Failed to load workspace:', error);
      return null;
    }
  }

  /**
   * Update existing workspace
   */
  async updateWorkspace(
    workspaceId: string,
    updates: Partial<WorkspaceConfig>,
    options: {
      createDiff?: boolean;
      description?: string;
    } = {}
  ): Promise<boolean> {
    try {
      const existingWorkspace = this.workspaces.get(workspaceId);
      if (!existingWorkspace) {
        throw new Error(`Workspace not found: ${workspaceId}`);
      }

      // Create diff if requested
      if (options.createDiff && updates.panels) {
        const diff = this.calculateDiff(existingWorkspace.panels, updates.panels);
        this.addToHistory(workspaceId, diff, options.description);
      }

      // Update workspace
      const updatedWorkspace: WorkspaceConfig = {
        ...existingWorkspace,
        ...updates,
        metadata: {
          ...existingWorkspace.metadata,
          ...updates.metadata,
          updatedAt: Date.now(),
        },
        stats: {
          ...existingWorkspace.stats,
          ...updates.stats,
          lastModified: Date.now(),
        },
      };

      this.workspaces.set(workspaceId, updatedWorkspace);
      await this.saveToStorage();

      return true;
    } catch (error) {
      console.error('Failed to update workspace:', error);
      return false;
    }
  }

  /**
   * Delete workspace with cleanup
   */
  async deleteWorkspace(workspaceId: string): Promise<boolean> {
    try {
      if (!this.workspaces.has(workspaceId)) {
        throw new Error(`Workspace not found: ${workspaceId}`);
      }

      // Remove workspace and associated data
      this.workspaces.delete(workspaceId);
      this.history.delete(workspaceId);
      this.backups.delete(workspaceId);

      await this.saveToStorage();

      console.log(`Workspace ${workspaceId} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      return false;
    }
  }

  /**
   * Get all workspaces with optional filtering
   */
  getWorkspaces(filter?: {
    category?: string;
    tags?: string[];
    searchQuery?: string;
  }): WorkspaceConfig[] {
    let workspaces = Array.from(this.workspaces.values());

    if (filter) {
      if (filter.category) {
        workspaces = workspaces.filter(w => w.metadata.category === filter.category);
      }

      if (filter.tags && filter.tags.length > 0) {
        workspaces = workspaces.filter(w =>
          filter.tags!.some(tag => w.metadata.tags.includes(tag))
        );
      }

      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        workspaces = workspaces.filter(
          w => w.name.toLowerCase().includes(query) || w.description?.toLowerCase().includes(query)
        );
      }
    }

    return workspaces.sort((a, b) => b.metadata.lastAccessed - a.metadata.lastAccessed);
  }

  /**
   * Export workspace as JSON
   */
  exportWorkspace(
    workspaceId: string,
    options: {
      includeHistory?: boolean;
      compress?: boolean;
    } = {}
  ): string {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const exportData: any = {
      workspace,
      exportedAt: Date.now(),
      version: '2.0.0',
    };

    if (options.includeHistory) {
      exportData.history = this.history.get(workspaceId) || [];
    }

    const jsonString = JSON.stringify(exportData, null, options.compress ? 0 : 2);

    if (options.compress && this.compressionEnabled) {
      // In a real implementation, you'd use a compression library
      return jsonString;
    }

    return jsonString;
  }

  /**
   * Import workspace from JSON
   */
  async importWorkspace(
    workspaceData: string,
    options: {
      overwriteExisting?: boolean;
      newName?: string;
    } = {}
  ): Promise<string> {
    try {
      const importData = JSON.parse(workspaceData);

      if (!importData.workspace) {
        throw new Error('Invalid workspace data format');
      }

      let workspace = importData.workspace as WorkspaceConfig;

      // Generate new ID to avoid conflicts
      const newId = `workspace-${nanoid()}`;
      workspace = {
        ...workspace,
        id: newId,
        name: options.newName || `${workspace.name} (Imported)`,
        metadata: {
          ...workspace.metadata,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastAccessed: Date.now(),
        },
      };

      // Validate imported workspace
      const validation = this.validateWorkspace(workspace);
      if (!validation.isValid) {
        throw new Error(`Invalid imported workspace: ${validation.errors.join(', ')}`);
      }

      // Store imported workspace
      this.workspaces.set(newId, workspace);

      // Import history if available
      if (importData.history) {
        this.history.set(newId, importData.history);
      }

      await this.saveToStorage();

      console.log(`Workspace imported with ID: ${newId}`);
      return newId;
    } catch (error) {
      console.error('Failed to import workspace:', error);
      throw error;
    }
  }

  /**
   * Create workspace backup
   */
  async createBackup(
    workspaceId: string,
    type: WorkspaceBackup['type'] = 'manual'
  ): Promise<string> {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const backupId = `backup-${nanoid()}`;
    const backup: WorkspaceBackup = {
      id: backupId,
      workspaceId,
      timestamp: Date.now(),
      config: { ...workspace },
      type,
      compressionLevel: this.compressionEnabled ? 1 : 0,
    };

    // Store backup
    const workspaceBackups = this.backups.get(workspaceId) || [];
    workspaceBackups.push(backup);

    // Keep only last 10 backups per workspace
    if (workspaceBackups.length > 10) {
      workspaceBackups.sort((a, b) => b.timestamp - a.timestamp);
      this.backups.set(workspaceId, workspaceBackups.slice(0, 10));
    } else {
      this.backups.set(workspaceId, workspaceBackups);
    }

    await this.saveToStorage();
    return backupId;
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<string | null> {
    for (const [workspaceId, backups] of this.backups.entries()) {
      const backup = backups.find(b => b.id === backupId);
      if (backup) {
        // Create new workspace from backup
        const restoredId = await this.saveWorkspace(
          `${backup.config.name} (Restored)`,
          backup.config,
          { description: 'Restored from backup', createBackup: false }
        );
        return restoredId;
      }
    }
    return null;
  }

  /**
   * Get workspace history
   */
  getWorkspaceHistory(workspaceId: string): WorkspaceDiff[] {
    return this.history.get(workspaceId) || [];
  }

  /**
   * Rollback to previous version
   */
  async rollbackWorkspace(workspaceId: string, diffId: string): Promise<boolean> {
    const history = this.history.get(workspaceId);
    if (!history) return false;

    const targetDiff = history.find(d => d.id === diffId);
    if (!targetDiff) return false;

    // This is a simplified rollback - in a real implementation,
    // you'd need to reverse all changes after the target diff
    console.log(`Rolling back workspace ${workspaceId} to diff ${diffId}`);
    return true;
  }

  /**
   * Validate workspace configuration
   */
  private validateWorkspace(config: Partial<WorkspaceConfig>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.name?.trim()) {
      errors.push('Workspace name is required');
    }

    if (!config.panels || !Array.isArray(config.panels)) {
      errors.push('Workspace must have panels array');
    }

    if (config.panels && config.panels.some(panel => !panel.id || !panel.component)) {
      errors.push('All panels must have valid id and component');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate diff between panel states
   */
  private calculateDiff(
    oldPanels: PanelLayout[],
    newPanels: PanelLayout[]
  ): WorkspaceDiff['changes'] {
    const oldMap = new Map(oldPanels.map(p => [p.id, p]));
    const newMap = new Map(newPanels.map(p => [p.id, p]));

    const added: PanelLayout[] = [];
    const modified: Array<{ old: PanelLayout; new: PanelLayout }> = [];
    const removed: PanelLayout[] = [];

    // Find added and modified panels
    for (const [id, newPanel] of newMap) {
      const oldPanel = oldMap.get(id);
      if (!oldPanel) {
        added.push(newPanel);
      } else if (JSON.stringify(oldPanel) !== JSON.stringify(newPanel)) {
        modified.push({ old: oldPanel, new: newPanel });
      }
    }

    // Find removed panels
    for (const [id, oldPanel] of oldMap) {
      if (!newMap.has(id)) {
        removed.push(oldPanel);
      }
    }

    return { added, modified, removed };
  }

  /**
   * Add entry to history
   */
  private addToHistory(
    workspaceId: string,
    changes: WorkspaceDiff['changes'],
    description?: string
  ): void {
    const diff: WorkspaceDiff = {
      id: `diff-${nanoid()}`,
      workspaceId,
      timestamp: Date.now(),
      changes,
      metadata: {
        changeCount: changes.added.length + changes.modified.length + changes.removed.length,
        description,
      },
    };

    const history = this.history.get(workspaceId) || [];
    history.push(diff);

    // Keep only last 50 history entries
    if (history.length > 50) {
      this.history.set(workspaceId, history.slice(-50));
    } else {
      this.history.set(workspaceId, history);
    }
  }

  /**
   * Generate workspace thumbnail
   */
  private async generateThumbnail(workspace: WorkspaceConfig): Promise<string> {
    // Mock thumbnail generation
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, 300, 200);

      // Draw panels
      workspace.panels.forEach((panel, index) => {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
        ctx.fillStyle = colors[index % colors.length];

        const x = (panel.position.x / 1200) * 280 + 10;
        const y = (panel.position.y / 800) * 180 + 10;
        const w = Math.max(30, (panel.size.width / 1200) * 280);
        const h = Math.max(20, (panel.size.height / 800) * 180);

        ctx.fillRect(x, y, w, h);
      });
    }

    return canvas.toDataURL();
  }

  /**
   * Setup auto-save functionality
   */
  private setupAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      this.saveToStorage();
    }, 30000); // Auto-save every 30 seconds
  }

  /**
   * Load workspaces from storage
   */
  private loadFromStorage(): void {
    try {
      const workspacesData = localStorage.getItem('lucaverse-workspaces');
      const historyData = localStorage.getItem('lucaverse-workspace-history');
      const backupsData = localStorage.getItem('lucaverse-workspace-backups');

      if (workspacesData) {
        const parsed = JSON.parse(workspacesData);
        this.workspaces = new Map(Object.entries(parsed));
      }

      if (historyData) {
        const parsed = JSON.parse(historyData);
        this.history = new Map(Object.entries(parsed));
      }

      if (backupsData) {
        const parsed = JSON.parse(backupsData);
        this.backups = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load workspaces from storage:', error);
    }
  }

  /**
   * Save workspaces to storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      const workspacesObj = Object.fromEntries(this.workspaces);
      const historyObj = Object.fromEntries(this.history);
      const backupsObj = Object.fromEntries(this.backups);

      localStorage.setItem('lucaverse-workspaces', JSON.stringify(workspacesObj));
      localStorage.setItem('lucaverse-workspace-history', JSON.stringify(historyObj));
      localStorage.setItem('lucaverse-workspace-backups', JSON.stringify(backupsObj));
    } catch (error) {
      console.error('Failed to save workspaces to storage:', error);
    }
  }

  /**
   * Get workspace statistics
   */
  getStatistics(): {
    totalWorkspaces: number;
    totalBackups: number;
    storageUsed: number;
    averagePanelCount: number;
    mostRecentWorkspace?: WorkspaceConfig;
  } {
    const workspaces = Array.from(this.workspaces.values());
    const totalBackups = Array.from(this.backups.values()).reduce(
      (sum, backups) => sum + backups.length,
      0
    );

    const storageUsed =
      JSON.stringify(Object.fromEntries(this.workspaces)).length +
      JSON.stringify(Object.fromEntries(this.history)).length +
      JSON.stringify(Object.fromEntries(this.backups)).length;

    const averagePanelCount =
      workspaces.length > 0
        ? workspaces.reduce((sum, w) => sum + w.panels.length, 0) / workspaces.length
        : 0;

    const mostRecentWorkspace = workspaces.sort(
      (a, b) => b.metadata.lastAccessed - a.metadata.lastAccessed
    )[0];

    return {
      totalWorkspaces: workspaces.length,
      totalBackups,
      storageUsed,
      averagePanelCount,
      mostRecentWorkspace,
    };
  }
}

// Export singleton instance
export const workspaceManager = WorkspaceManager.getInstance();
