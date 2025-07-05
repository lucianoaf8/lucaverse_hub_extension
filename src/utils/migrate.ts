/**
 * Enhanced State Migration System
 * Comprehensive migration utilities for converting vanilla JS state to React/Zustand
 */

import { nanoid } from 'nanoid';
import type { PanelLayout } from '@/types/panel';
import { PanelComponent } from '@/types/panel';
import type { WorkspaceConfig } from '@/types/layout';
import { ThemeVariant } from '@/types/components';
import type { UserPreferences, PerformanceSettings } from '@/stores/appStore';

// ===========================
// Migration Result Interfaces
// ===========================

export interface MigrationResult {
  success: boolean;
  timestamp: number;
  version: string;
  data: {
    panels: PanelLayout[];
    workspace: WorkspaceConfig | null;
    preferences: UserPreferences;
    performance: PerformanceSettings;
    theme: ThemeVariant;
    bookmarks: any[];
    tasks: any[];
    chatHistory: any[];
    timerSettings: any;
  };
  errors: string[];
  warnings: string[];
  report: MigrationReport;
}

export interface MigrationReport {
  totalItems: number;
  migratedItems: number;
  failedItems: number;
  duration: number;
  backupCreated: boolean;
  details: {
    [key: string]: {
      attempted: number;
      successful: number;
      failed: number;
      errors: string[];
    };
  };
}

export interface StateBackup {
  timestamp: number;
  version: string;
  data: string;
  checksum?: string;
}

// ===========================
// Legacy State Interfaces
// ===========================

export interface LegacyState {
  // Core localStorage keys
  'lucaverse-state'?: string;
  'lucaverse-quadrants'?: string;
  'quadrant-data'?: string;
  'productivity-hub-state'?: string;
  
  // Component-specific keys
  'lucaverse-bookmarks'?: string;
  'lucaverse-tasks'?: string;
  'lucaverse-chat-history'?: string;
  'lucaverse-timer-settings'?: string;
  'lucaverse-preferences'?: string;
  'lucaverse-theme'?: string;
  'lucaverse-workspace'?: string;
  
  // Additional keys
  'lucaverse-shortcuts'?: string;
  'lucaverse-ai-providers'?: string;
  'lucaverse-session-data'?: string;
}

interface LegacyQuadrantData {
  id: string;
  type: 'smart-bookmarks' | 'ai-chat' | 'task-manager' | 'productivity-tools';
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  zIndex: number;
  data?: any;
}

// ===========================
// Detection & Validation
// ===========================

/**
 * Detect if legacy vanilla JS data exists
 */
export function detectLegacyData(): {
  hasLegacyData: boolean;
  keys: string[];
  version: string | null;
  totalSize: number;
} {
  const legacyKeys = [
    'lucaverse-state',
    'lucaverse-quadrants',
    'quadrant-data',
    'productivity-hub-state',
    'lucaverse-bookmarks',
    'lucaverse-tasks',
    'lucaverse-chat-history',
    'lucaverse-timer-settings',
    'lucaverse-preferences',
    'lucaverse-theme',
    'lucaverse-workspace'
  ];

  const foundKeys: string[] = [];
  let totalSize = 0;
  let version: string | null = null;

  legacyKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      foundKeys.push(key);
      totalSize += value.length;
      
      // Try to detect version from state
      if (key === 'lucaverse-state') {
        try {
          const parsed = JSON.parse(value);
          version = parsed.version || '1.0.0';
        } catch (e) {
          // Invalid JSON, assume oldest version
          version = '1.0.0';
        }
      }
    }
  });

  return {
    hasLegacyData: foundKeys.length > 0,
    keys: foundKeys,
    version: version || '1.0.0',
    totalSize
  };
}

/**
 * Validate legacy data structure and integrity
 */
export function validateLegacyData(data: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data || typeof data !== 'object') {
    errors.push('Invalid or missing legacy data');
    return { isValid: false, errors, warnings };
  }

  // Validate JSON parsing
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      try {
        JSON.parse(value);
      } catch (e) {
        errors.push(`Invalid JSON in ${key}: ${e}`);
      }
    }
  });

  // Check for required keys
  const hasQuadrants = data['lucaverse-quadrants'] || data['quadrant-data'];
  const hasState = data['lucaverse-state'] || data['productivity-hub-state'];
  
  if (!hasQuadrants && !hasState) {
    warnings.push('No quadrant or state data found - using defaults');
  }

  // Check data sizes
  const maxSize = 5 * 1024 * 1024; // 5MB limit
  let totalSize = 0;
  Object.values(data).forEach(value => {
    if (typeof value === 'string') {
      totalSize += value.length;
    }
  });

  if (totalSize > maxSize) {
    warnings.push(`Data size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds recommended limit`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Create backup of legacy data before migration
 */
export async function createBackup(legacyData: LegacyState): Promise<StateBackup | null> {
  try {
    const backup: StateBackup = {
      timestamp: Date.now(),
      version: detectLegacyData().version || '1.0.0',
      data: JSON.stringify(legacyData)
    };

    // Try to store backup
    const backupKey = `lucaverse-backup-${backup.timestamp}`;
    
    try {
      localStorage.setItem(backupKey, JSON.stringify(backup));
      console.log(`Backup created: ${backupKey}`);
      return backup;
    } catch (e) {
      // Handle quota exceeded
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, cleaning old backups...');
        cleanOldBackups();
        
        // Try again
        try {
          localStorage.setItem(backupKey, JSON.stringify(backup));
          return backup;
        } catch (retryError) {
          console.error('Failed to create backup after cleanup');
          return null;
        }
      }
      throw e;
    }
  } catch (error) {
    console.error('Failed to create backup:', error);
    return null;
  }
}

/**
 * Clean old backups to free storage space
 */
function cleanOldBackups(keepCount: number = 3): void {
  const backupKeys: { key: string; timestamp: number }[] = [];
  
  // Find all backup keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('lucaverse-backup-')) {
      const timestamp = parseInt(key.replace('lucaverse-backup-', ''));
      if (!isNaN(timestamp)) {
        backupKeys.push({ key, timestamp });
      }
    }
  }

  // Sort by timestamp (newest first)
  backupKeys.sort((a, b) => b.timestamp - a.timestamp);

  // Remove old backups
  backupKeys.slice(keepCount).forEach(({ key }) => {
    localStorage.removeItem(key);
    console.log(`Removed old backup: ${key}`);
  });
}

/**
 * Generate detailed migration report
 */
export function generateMigrationReport(
  result: Partial<MigrationResult>,
  startTime: number
): MigrationReport {
  const endTime = Date.now();
  const duration = endTime - startTime;

  const report: MigrationReport = {
    totalItems: 0,
    migratedItems: 0,
    failedItems: 0,
    duration,
    backupCreated: false,
    details: {}
  };

  // Calculate totals from result data
  if (result.data) {
    const categories = ['panels', 'bookmarks', 'tasks', 'chatHistory'];
    categories.forEach(category => {
      const items = result.data?.[category as keyof typeof result.data];
      if (Array.isArray(items)) {
        report.details[category] = {
          attempted: items.length,
          successful: items.length,
          failed: 0,
          errors: []
        };
        report.totalItems += items.length;
        report.migratedItems += items.length;
      }
    });
  }

  // Add errors to report
  if (result.errors && result.errors.length > 0) {
    report.failedItems = result.errors.length;
  }

  return report;
}

// ===========================
// Core Migration Functions
// ===========================

/**
 * Migrate quadrant data to new panel system
 */
export function migrateQuadrantData(legacyQuadrants: string | LegacyQuadrantData[]): PanelLayout[] {
  try {
    const quadrants = typeof legacyQuadrants === 'string' 
      ? JSON.parse(legacyQuadrants) 
      : legacyQuadrants;

    if (!Array.isArray(quadrants)) {
      console.warn('Invalid quadrant data format');
      return [];
    }

    return quadrants.map((quad: LegacyQuadrantData) => {
      // Map legacy type to new component
      let component: PanelComponent;
      switch (quad.type) {
        case 'smart-bookmarks':
          component = PanelComponent.SmartHub;
          break;
        case 'ai-chat':
          component = PanelComponent.AIChat;
          break;
        case 'task-manager':
          component = PanelComponent.TaskManager;
          break;
        case 'productivity-tools':
          component = PanelComponent.Productivity;
          break;
        default:
          component = PanelComponent.SmartHub;
      }

      return {
        id: quad.id || nanoid(),
        component,
        position: quad.position || { x: 0, y: 0 },
        size: quad.size || { width: 400, height: 300 },
        zIndex: quad.zIndex || 1,
        visible: quad.visible !== false,
        constraints: {
          minSize: { width: 300, height: 200 },
          maxSize: { width: 800, height: 600 }
        }
      };
    });
  } catch (error) {
    console.error('Failed to migrate quadrant data:', error);
    return [];
  }
}

/**
 * Migrate bookmarks preserving all data
 */
export function migrateBookmarks(legacyBookmarks: string | any[]): any[] {
  try {
    const bookmarks = typeof legacyBookmarks === 'string'
      ? JSON.parse(legacyBookmarks)
      : legacyBookmarks;

    if (!Array.isArray(bookmarks)) {
      return [];
    }

    return bookmarks.map(bookmark => ({
      id: bookmark.id || nanoid(),
      title: bookmark.title || 'Untitled',
      url: bookmark.url || '',
      favicon: bookmark.favicon,
      tags: Array.isArray(bookmark.tags) ? bookmark.tags : [],
      priority: bookmark.priority || 0,
      category: bookmark.category || 'general',
      createdAt: bookmark.createdAt || Date.now(),
      lastAccessed: bookmark.lastAccessed,
      migrated: true
    }));
  } catch (error) {
    console.error('Failed to migrate bookmarks:', error);
    return [];
  }
}

/**
 * Migrate chat history with provider settings
 */
export function migrateChatHistory(legacyChats: string | any[]): any[] {
  try {
    const chats = typeof legacyChats === 'string'
      ? JSON.parse(legacyChats)
      : legacyChats;

    if (!Array.isArray(chats)) {
      return [];
    }

    return chats.map(chat => ({
      id: chat.id || nanoid(),
      content: chat.content || '',
      role: chat.type === 'user' ? 'user' : 'assistant',
      timestamp: chat.timestamp || Date.now(),
      provider: chat.provider || 'openai',
      model: chat.model,
      migrated: true
    }));
  } catch (error) {
    console.error('Failed to migrate chat history:', error);
    return [];
  }
}

/**
 * Migrate tasks preserving all properties
 */
export function migrateTasks(legacyTasks: string | any[]): any[] {
  try {
    const tasks = typeof legacyTasks === 'string'
      ? JSON.parse(legacyTasks)
      : legacyTasks;

    if (!Array.isArray(tasks)) {
      return [];
    }

    return tasks.map(task => ({
      id: task.id || Date.now() + Math.random(),
      text: task.title || task.text || 'Untitled Task',
      completed: task.completed || false,
      priority: task.priority || 3,
      category: task.category,
      tags: Array.isArray(task.tags) ? task.tags : [],
      dueDate: task.dueDate,
      progress: task.progress || 0,
      createdAt: task.createdAt || Date.now(),
      updatedAt: task.updatedAt || Date.now(),
      migrated: true
    }));
  } catch (error) {
    console.error('Failed to migrate tasks:', error);
    return [];
  }
}

/**
 * Migrate timer settings and session data
 */
export function migrateTimerSettings(legacyTimer: string | any): any {
  try {
    const timer = typeof legacyTimer === 'string'
      ? JSON.parse(legacyTimer)
      : legacyTimer;

    return {
      workDuration: timer?.workDuration || 25,
      shortBreakDuration: timer?.shortBreakDuration || 5,
      longBreakDuration: timer?.longBreakDuration || 15,
      sessionsUntilLongBreak: timer?.sessionsUntilLongBreak || 4,
      autoStartBreaks: timer?.autoStartBreaks || false,
      autoStartPomodoros: timer?.autoStartPomodoros || false,
      notifications: timer?.notifications !== false,
      soundEnabled: timer?.soundEnabled !== false,
      migrated: true
    };
  } catch (error) {
    console.error('Failed to migrate timer settings:', error);
    return null;
  }
}

/**
 * Migrate user preferences
 */
export function migrateUserPreferences(legacyPrefs: string | any): UserPreferences {
  try {
    const prefs = typeof legacyPrefs === 'string'
      ? JSON.parse(legacyPrefs)
      : legacyPrefs;

    return {
      language: prefs?.language || 'en',
      autoSave: prefs?.autoSave !== false,
      debugMode: prefs?.debugMode || false,
      showTooltips: prefs?.showTooltips !== false,
      compactMode: prefs?.compactMode || false,
      keyboardShortcutsEnabled: prefs?.keyboardShortcutsEnabled !== false
    };
  } catch (error) {
    console.error('Failed to migrate preferences:', error);
    return {
      language: 'en',
      autoSave: true,
      debugMode: false,
      showTooltips: true,
      compactMode: false,
      keyboardShortcutsEnabled: true
    };
  }
}

// ===========================
// Migration Orchestration
// ===========================

/**
 * Main migration orchestrator
 */
export async function migrateVanillaState(): Promise<MigrationResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Step 1: Detect legacy data
    const detection = detectLegacyData();
    if (!detection.hasLegacyData) {
      return {
        success: true,
        timestamp: Date.now(),
        version: '2.0.0',
        data: generateDefaultData(),
        errors: [],
        warnings: ['No legacy data found - using defaults'],
        report: generateMigrationReport({ data: generateDefaultData() }, startTime)
      };
    }

    console.log(`Found legacy data: ${detection.keys.length} keys, ${(detection.totalSize / 1024).toFixed(2)}KB`);

    // Step 2: Collect all legacy data
    const legacyData: LegacyState = {};
    detection.keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        legacyData[key as keyof LegacyState] = value;
      }
    });

    // Step 3: Validate data
    const validation = validateLegacyData(legacyData);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }
    warnings.push(...validation.warnings);

    // Step 4: Create backup
    const backup = await createBackup(legacyData);
    if (!backup) {
      warnings.push('Failed to create backup - proceeding anyway');
    }

    // Step 5: Migrate each component
    const migrationData = {
      panels: [] as PanelLayout[],
      workspace: null as WorkspaceConfig | null,
      preferences: {} as UserPreferences,
      performance: {} as PerformanceSettings,
      theme: 'dark' as ThemeVariant,
      bookmarks: [] as any[],
      tasks: [] as any[],
      chatHistory: [] as any[],
      timerSettings: null as any
    };

    // Migrate quadrants/panels
    if (legacyData['lucaverse-quadrants']) {
      migrationData.panels = migrateQuadrantData(legacyData['lucaverse-quadrants']);
    } else if (legacyData['quadrant-data']) {
      migrationData.panels = migrateQuadrantData(legacyData['quadrant-data']);
    }

    // Migrate bookmarks
    if (legacyData['lucaverse-bookmarks']) {
      migrationData.bookmarks = migrateBookmarks(legacyData['lucaverse-bookmarks']);
    }

    // Migrate tasks
    if (legacyData['lucaverse-tasks']) {
      migrationData.tasks = migrateTasks(legacyData['lucaverse-tasks']);
    }

    // Migrate chat history
    if (legacyData['lucaverse-chat-history']) {
      migrationData.chatHistory = migrateChatHistory(legacyData['lucaverse-chat-history']);
    }

    // Migrate timer settings
    if (legacyData['lucaverse-timer-settings']) {
      migrationData.timerSettings = migrateTimerSettings(legacyData['lucaverse-timer-settings']);
    }

    // Migrate preferences
    if (legacyData['lucaverse-preferences']) {
      migrationData.preferences = migrateUserPreferences(legacyData['lucaverse-preferences']);
    } else {
      migrationData.preferences = migrateUserPreferences({});
    }

    // Migrate theme
    if (legacyData['lucaverse-theme']) {
      try {
        const theme = JSON.parse(legacyData['lucaverse-theme']);
        migrationData.theme = theme as ThemeVariant;
      } catch (e) {
        migrationData.theme = 'dark';
      }
    }

    // Set performance settings
    migrationData.performance = {
      animations: true,
      particles: true,
      reducedMotion: false,
      gpuAcceleration: true,
      autoSaveInterval: 30000,
      maxPanels: 20
    };

    // Generate report
    const report = generateMigrationReport({ data: migrationData, errors, warnings }, startTime);

    // Step 6: Clean up old data (optional - commented out for safety)
    // if (backup && errors.length === 0) {
    //   archiveLegacyState(legacyData);
    // }

    return {
      success: errors.length === 0,
      timestamp: Date.now(),
      version: '2.0.0',
      data: migrationData,
      errors,
      warnings,
      report
    };

  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      timestamp: Date.now(),
      version: '2.0.0',
      data: generateDefaultData(),
      errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings,
      report: generateMigrationReport({ errors: [`Migration failed: ${error}`] }, startTime)
    };
  }
}

/**
 * Generate default data structure
 */
function generateDefaultData() {
  return {
    panels: [],
    workspace: null,
    preferences: {
      language: 'en',
      autoSave: true,
      debugMode: false,
      showTooltips: true,
      compactMode: false,
      keyboardShortcutsEnabled: true
    },
    performance: {
      animations: true,
      particles: true,
      reducedMotion: false,
      gpuAcceleration: true,
      autoSaveInterval: 30000,
      maxPanels: 20
    },
    theme: 'dark' as ThemeVariant,
    bookmarks: [],
    tasks: [],
    chatHistory: [],
    timerSettings: null
  };
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
    Object.keys(legacyState).forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('Legacy state archived and cleaned up');
  } catch (error) {
    console.error('Failed to archive legacy state:', error);
  }
}

// ===========================
// Version Management
// ===========================

export interface StateVersion {
  version: string;
  features: string[];
  migrationRequired: boolean;
  compatibleWith: string[];
}

/**
 * Detect state version from data structure
 */
export function detectStateVersion(data: any): StateVersion {
  // Check for explicit version
  if (data.version) {
    return {
      version: data.version,
      features: [],
      migrationRequired: data.version !== '2.0.0',
      compatibleWith: ['1.0.0', '1.1.0', '1.2.0']
    };
  }

  // Detect by structure
  if (data['lucaverse-quadrants']) {
    return {
      version: '1.2.0',
      features: ['quadrants', 'preferences'],
      migrationRequired: true,
      compatibleWith: ['1.0.0', '1.1.0']
    };
  }

  if (data['quadrant-data']) {
    return {
      version: '1.0.0',
      features: ['basic-quadrants'],
      migrationRequired: true,
      compatibleWith: []
    };
  }

  return {
    version: 'unknown',
    features: [],
    migrationRequired: true,
    compatibleWith: []
  };
}

/**
 * Calculate migration path between versions
 */
export function calculateMigrationPath(fromVersion: string, toVersion: string): string[] {
  const versionPath: { [key: string]: string[] } = {
    '1.0.0': ['1.1.0', '1.2.0', '2.0.0'],
    '1.1.0': ['1.2.0', '2.0.0'],
    '1.2.0': ['2.0.0'],
    '2.0.0': []
  };

  const path = versionPath[fromVersion];
  if (!path) {
    return ['2.0.0']; // Direct migration for unknown versions
  }

  const targetIndex = path.indexOf(toVersion);
  return targetIndex >= 0 ? path.slice(0, targetIndex + 1) : ['2.0.0'];
}