/**
 * State Migration Utilities - Main migration coordinator
 * Uses the enhanced migration system from migrate.ts
 */

import { migrateVanillaState as enhancedMigrate } from './migrate';
import type { MigrationResult } from './migrate';

// Legacy vanilla JS state interfaces (based on project knowledge)
interface LegacyQuadrantData {
  id: string;
  type: 'smart-bookmarks' | 'ai-chat' | 'task-manager' | 'productivity-tools';
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  zIndex: number;
  data?: {
    bookmarks?: LegacyBookmark[];
    tasks?: LegacyTask[];
    timerConfig?: LegacyTimerConfig;
    chatHistory?: LegacyChatMessage[];
  };
}

interface LegacyBookmark {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  tags: string[];
  priority: number;
  category: string;
  createdAt: number;
  lastAccessed?: number;
}

interface LegacyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 1 | 2 | 3 | 4 | 5;
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  category: string;
}

interface LegacyTimerConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
}

interface LegacyChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: number;
}

interface LegacySettings {
  theme: 'light' | 'dark' | 'auto';
  gridSnap: boolean;
  snapSize: number;
  autoSave: boolean;
  animations: boolean;
  particles: boolean;
  debugMode: boolean;
  language: string;
}

interface LegacyState {
  quadrants: LegacyQuadrantData[];
  settings: LegacySettings;
  workspace: {
    name: string;
    lastSaved: number;
  };
  version: string;
}

// Migration result interface
interface MigrationResult {
  success: boolean;
  panels: PanelLayout[];
  workspace: WorkspaceConfig;
  preferences: UserPreferences;
  performance: PerformanceSettings;
  theme: ThemeVariant;
  errors: string[];
  warnings: string[];
}

// Backup interface for rollback
interface StateBackup {
  timestamp: number;
  data: string;
  version: string;
}

/**
 * Main migration function - converts vanilla JS state to new format
 */
export async function migrateVanillaState(): Promise<MigrationResult> {
  console.log('🔄 Starting state migration using enhanced system...');

  // Use the enhanced migration system
  const result = await enhancedMigrate();

  console.log(`Migration completed: ${result.success ? 'Success' : 'Failed'}`);
  if (result.errors.length > 0) {
    console.warn('Migration errors:', result.errors);
  }
  if (result.warnings.length > 0) {
    console.warn('Migration warnings:', result.warnings);
  }

  return result;
}

// Legacy function wrapper for compatibility
export async function migrateVanillaStateLegacy(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    panels: [],
    workspace: createDefaultWorkspace(),
    preferences: createDefaultPreferences(),
    performance: createDefaultPerformanceSettings(),
    theme: ThemeVariant.Dark,
    errors: [],
    warnings: [],
  };

  try {
    // Create backup before migration
    const backup = createBackup();
    if (backup) {
      console.log('Created state backup before migration');
    }

    // Load legacy state from localStorage
    const legacyState = loadLegacyState();
    if (!legacyState) {
      result.warnings.push('No legacy state found - using defaults');
      result.success = true;
      return result;
    }

    console.log('Found legacy state, starting migration...');

    // Migrate quadrants to panels
    const panelMigrationResult = migrateQuadrantsToPanels(legacyState.quadrants);
    result.panels = panelMigrationResult.panels;
    result.errors.push(...panelMigrationResult.errors);
    result.warnings.push(...panelMigrationResult.warnings);

    // Migrate settings
    const settingsMigrationResult = migrateSettings(legacyState.settings);
    result.preferences = settingsMigrationResult.preferences;
    result.performance = settingsMigrationResult.performance;
    result.theme = settingsMigrationResult.theme;

    // Create migrated workspace
    result.workspace = createMigratedWorkspace(legacyState.workspace, result.panels);

    // Mark migration as successful if no critical errors
    result.success = result.errors.length === 0;

    if (result.success) {
      console.log('State migration completed successfully');

      // Archive legacy state
      archiveLegacyState(legacyState);
    } else {
      console.error('State migration failed with errors:', result.errors);
    }
  } catch (error) {
    result.errors.push(
      `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    console.error('State migration error:', error);
  }

  return result;
}

/**
 * Load legacy state from localStorage
 */
function loadLegacyState(): LegacyState | null {
  try {
    // Check for various legacy storage keys
    const legacyKeys = [
      'lucaverse-state',
      'quadrant-data',
      'lucaverse-quadrants',
      'productivity-hub-state',
    ];

    for (const key of legacyKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Validate basic structure
        if (parsed && typeof parsed === 'object') {
          return normalizeLegacyState(parsed);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to load legacy state:', error);
    return null;
  }
}

/**
 * Normalize legacy state to expected format
 */
function normalizeLegacyState(data: any): LegacyState {
  return {
    quadrants: Array.isArray(data.quadrants) ? data.quadrants : [],
    settings: data.settings || {},
    workspace: data.workspace || { name: 'Default', lastSaved: 0 },
    version: data.version || '1.0.0',
  };
}

/**
 * Migrate quadrants to new panel format
 */
function migrateQuadrantsToPanels(quadrants: LegacyQuadrantData[]): {
  panels: PanelLayout[];
  errors: string[];
  warnings: string[];
} {
  const result = {
    panels: [] as PanelLayout[],
    errors: [] as string[],
    warnings: [] as string[],
  };

  quadrants.forEach((quadrant, index) => {
    try {
      const panel = convertQuadrantToPanel(quadrant);
      if (panel) {
        result.panels.push(panel);
      } else {
        result.warnings.push(`Skipped quadrant ${index}: unable to convert`);
      }
    } catch (error) {
      result.errors.push(
        `Failed to convert quadrant ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });

  return result;
}

/**
 * Convert individual quadrant to panel
 */
function convertQuadrantToPanel(quadrant: LegacyQuadrantData): PanelLayout | null {
  // Map legacy types to new component types
  const componentMapping: Record<string, PanelComponent> = {
    'smart-bookmarks': PanelComponent.SmartHub,
    'ai-chat': PanelComponent.AIChat,
    'task-manager': PanelComponent.TaskManager,
    'productivity-tools': PanelComponent.Productivity,
  };

  const component = componentMapping[quadrant.type];
  if (!component) {
    console.warn(`Unknown quadrant type: ${quadrant.type}`);
    return null;
  }

  // Create panel with migrated data
  const panel: PanelLayout = {
    id: quadrant.id || nanoid(),
    component,
    position: quadrant.position || { x: 0, y: 0 },
    size: quadrant.size || { width: 400, height: 300 },
    zIndex: quadrant.zIndex || 1,
    visible: quadrant.visible !== false,
    constraints: getDefaultConstraintsForComponent(component),
    metadata: {
      title: getDefaultTitleForComponent(component),
      description: getDefaultDescriptionForComponent(component),
      icon: getDefaultIconForComponent(component),
    },
  };

  return panel;
}

/**
 * Migrate legacy settings to new format
 */
function migrateSettings(settings: LegacySettings): {
  preferences: UserPreferences;
  performance: PerformanceSettings;
  theme: ThemeVariant;
} {
  const preferences: UserPreferences = {
    autoSave: settings.autoSave !== false,
    debugMode: settings.debugMode === true,
    showGridByDefault: false,
    snapToGrid: settings.gridSnap !== false,
    confirmBeforeDelete: true,
    showTooltips: true,
    compactMode: false,
    language: settings.language || 'en',
  };

  const performance: PerformanceSettings = {
    animationsEnabled: settings.animations !== false,
    particleEffectsEnabled: settings.particles !== false,
    maxParticleCount: 50,
    renderQuality: 'high',
    backgroundEffectsEnabled: true,
    autoSaveInterval: 30000,
    maxHistorySize: 50,
  };

  const theme: ThemeVariant =
    settings.theme === 'light'
      ? ThemeVariant.Light
      : settings.theme === 'auto'
        ? ThemeVariant.Auto
        : ThemeVariant.Dark;

  return { preferences, performance, theme };
}

/**
 * Create migrated workspace configuration
 */
function createMigratedWorkspace(legacyWorkspace: any, panels: PanelLayout[]): WorkspaceConfig {
  return {
    id: 'migrated-workspace',
    name: legacyWorkspace.name || 'Migrated Workspace',
    description: 'Workspace migrated from vanilla JavaScript version',
    panels,
    gridSettings: {
      enabled: true,
      size: 20,
      visible: false,
      color: '#e5e7eb',
      opacity: 0.5,
      snapThreshold: 10,
    },
    viewport: {
      zoom: 1,
      center: { x: 960, y: 540 },
    },
    createdAt: legacyWorkspace.lastSaved || Date.now(),
    updatedAt: Date.now(),
    tags: ['migrated'],
  };
}

/**
 * Create backup of current state
 */
function createBackup(): StateBackup | null {
  try {
    const allData: Record<string, string> = {};
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (key.startsWith('lucaverse-') || key.includes('quadrant')) {
        const value = localStorage.getItem(key);
        if (value) {
          allData[key] = value;
        }
      }
    });

    const backup: StateBackup = {
      timestamp: Date.now(),
      data: JSON.stringify(allData),
      version: '1.0.0',
    };

    localStorage.setItem('lucaverse-backup', JSON.stringify(backup));
    return backup;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old backups...');
      // Try to clear old backups and legacy data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('lucaverse-backup') || key.startsWith('lucaverse-legacy'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Try again with cleared space
      try {
        localStorage.setItem('lucaverse-backup', JSON.stringify(backup));
        return backup;
      } catch (retryError) {
        console.warn('Could not create backup even after cleanup');
        return null;
      }
    }
    console.error('Failed to create backup:', error);
    return null;
  }
}

/**
 * Archive legacy state after successful migration
 */
function archiveLegacyState(legacyState: LegacyState): void {
  try {
    const archive = {
      timestamp: Date.now(),
      originalState: legacyState,
      migrationVersion: '2.0.0',
    };

    localStorage.setItem('lucaverse-legacy-archive', JSON.stringify(archive));

    // Remove old keys
    const keysToRemove = [
      'lucaverse-state',
      'quadrant-data',
      'lucaverse-quadrants',
      'productivity-hub-state',
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('Legacy state archived and cleaned up');
  } catch (error) {
    console.error('Failed to archive legacy state:', error);
  }
}

/**
 * Restore from backup in case of migration failure
 */
export function restoreFromBackup(): boolean {
  try {
    const backupData = localStorage.getItem('lucaverse-backup');
    if (!backupData) {
      console.warn('No backup found to restore from');
      return false;
    }

    const backup: StateBackup = JSON.parse(backupData);
    const restoredData: Record<string, string> = JSON.parse(backup.data);

    Object.entries(restoredData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log('State restored from backup');
    return true;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
}

// Helper functions for default values
function getDefaultConstraintsForComponent(component: PanelComponent) {
  const baseConstraints = {
    minSize: { width: 300, height: 200 },
    maxSize: { width: 800, height: 600 },
  };

  switch (component) {
    case PanelComponent.SmartHub:
      return { ...baseConstraints, minSize: { width: 400, height: 300 } };
    case PanelComponent.AIChat:
      return { ...baseConstraints, minSize: { width: 350, height: 400 } };
    case PanelComponent.TaskManager:
      return { ...baseConstraints, minSize: { width: 300, height: 350 } };
    case PanelComponent.Productivity:
      return baseConstraints;
    default:
      return baseConstraints;
  }
}

function getDefaultTitleForComponent(component: PanelComponent): string {
  const titles = {
    [PanelComponent.SmartHub]: 'Smart Bookmarks',
    [PanelComponent.AIChat]: 'AI Assistant',
    [PanelComponent.TaskManager]: 'Task Manager',
    [PanelComponent.Productivity]: 'Productivity Tools',
  };
  return titles[component];
}

function getDefaultDescriptionForComponent(component: PanelComponent): string {
  const descriptions = {
    [PanelComponent.SmartHub]: 'Intelligent bookmark management and quick access',
    [PanelComponent.AIChat]: 'AI-powered chat assistant for productivity',
    [PanelComponent.TaskManager]: 'Task tracking and project management',
    [PanelComponent.Productivity]: 'Pomodoro timer and productivity tools',
  };
  return descriptions[component];
}

function getDefaultIconForComponent(component: PanelComponent): string {
  const icons = {
    [PanelComponent.SmartHub]: 'bookmark',
    [PanelComponent.AIChat]: 'message-circle',
    [PanelComponent.TaskManager]: 'check-square',
    [PanelComponent.Productivity]: 'clock',
  };
  return icons[component];
}

function createDefaultWorkspace(): WorkspaceConfig {
  return {
    id: 'default',
    name: 'Default Workspace',
    description: 'Default workspace configuration',
    panels: [],
    gridSettings: {
      enabled: true,
      size: 20,
      visible: false,
      color: '#e5e7eb',
      opacity: 0.5,
      snapThreshold: 10,
    },
    viewport: {
      zoom: 1,
      center: { x: 960, y: 540 },
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createDefaultPreferences(): UserPreferences {
  return {
    autoSave: true,
    debugMode: false,
    showGridByDefault: false,
    snapToGrid: true,
    confirmBeforeDelete: true,
    showTooltips: true,
    compactMode: false,
    language: 'en',
  };
}

function createDefaultPerformanceSettings(): PerformanceSettings {
  return {
    animationsEnabled: true,
    particleEffectsEnabled: true,
    maxParticleCount: 50,
    renderQuality: 'high',
    backgroundEffectsEnabled: true,
    autoSaveInterval: 30000,
    maxHistorySize: 50,
  };
}

// Export types for external use
export type { MigrationResult, StateBackup };
