/**
 * Version Management System
 * Handles state version detection, migration paths, and compatibility
 */

export interface VersionInfo {
  version: string;
  releaseDate: string;
  features: string[];
  breaking: boolean;
  migrationNotes?: string;
}

export interface MigrationPath {
  from: string;
  to: string;
  steps: MigrationStep[];
  reversible: boolean;
}

export interface MigrationStep {
  version: string;
  description: string;
  handler: (data: any) => any;
  validate?: (data: any) => boolean;
}

// Version history registry
export const VERSION_HISTORY: { [key: string]: VersionInfo } = {
  '1.0.0': {
    version: '1.0.0',
    releaseDate: '2023-01-01',
    features: ['basic-quadrants', 'localStorage'],
    breaking: false,
  },
  '1.1.0': {
    version: '1.1.0',
    releaseDate: '2023-06-01',
    features: ['bookmarks', 'tasks', 'timer'],
    breaking: false,
  },
  '1.2.0': {
    version: '1.2.0',
    releaseDate: '2023-12-01',
    features: ['ai-chat', 'themes', 'workspace'],
    breaking: false,
  },
  '2.0.0': {
    version: '2.0.0',
    releaseDate: '2024-12-01',
    features: ['react', 'typescript', 'zustand', 'multi-platform'],
    breaking: true,
    migrationNotes: 'Complete architecture migration to React',
  },
};

/**
 * Detect version from state structure
 */
export function detectVersion(data: any): string {
  // Explicit version check
  if (data.version && VERSION_HISTORY[data.version]) {
    return data.version;
  }

  // Structure-based detection
  if (data['lucaverse-state']) {
    try {
      const state = JSON.parse(data['lucaverse-state']);
      if (state.version) return state.version;
    } catch (e) {
      // Continue with structure detection
    }
  }

  // Feature-based detection
  const hasAIChat = data['lucaverse-chat-history'] || data['ai-chat-data'];
  const hasWorkspace = data['lucaverse-workspace'];
  const hasThemes = data['lucaverse-theme'];
  const hasQuadrants = data['lucaverse-quadrants'] || data['quadrant-data'];
  const hasBookmarks = data['lucaverse-bookmarks'];

  if (hasAIChat && hasWorkspace && hasThemes) {
    return '1.2.0';
  } else if (hasBookmarks && hasQuadrants) {
    return '1.1.0';
  } else if (hasQuadrants || data['quadrant-data']) {
    return '1.0.0';
  }

  return 'unknown';
}

/**
 * Check if migration is needed
 */
export function needsMigration(currentVersion: string, targetVersion: string): boolean {
  if (currentVersion === targetVersion) return false;
  if (currentVersion === 'unknown') return true;

  const current = parseVersion(currentVersion);
  const target = parseVersion(targetVersion);

  return compareVersions(current, target) < 0;
}

/**
 * Get migration path between versions
 */
export function getMigrationPath(fromVersion: string, toVersion: string): MigrationPath {
  const steps: MigrationStep[] = [];

  // Define migration steps
  const migrations: { [key: string]: MigrationStep } = {
    '1.0.0-1.1.0': {
      version: '1.1.0',
      description: 'Add bookmarks and tasks support',
      handler: data => {
        // Migration logic for 1.0.0 to 1.1.0
        if (!data['lucaverse-bookmarks']) {
          data['lucaverse-bookmarks'] = JSON.stringify([]);
        }
        if (!data['lucaverse-tasks']) {
          data['lucaverse-tasks'] = JSON.stringify([]);
        }
        return data;
      },
      validate: data => {
        return data['lucaverse-bookmarks'] !== undefined && data['lucaverse-tasks'] !== undefined;
      },
    },
    '1.1.0-1.2.0': {
      version: '1.2.0',
      description: 'Add AI chat and themes',
      handler: data => {
        // Migration logic for 1.1.0 to 1.2.0
        if (!data['lucaverse-chat-history']) {
          data['lucaverse-chat-history'] = JSON.stringify([]);
        }
        if (!data['lucaverse-theme']) {
          data['lucaverse-theme'] = JSON.stringify('dark');
        }
        return data;
      },
    },
    '1.2.0-2.0.0': {
      version: '2.0.0',
      description: 'Migrate to React architecture',
      handler: data => {
        // This is handled by the main migration system
        return data;
      },
    },
  };

  // Build migration path
  const versions = Object.keys(VERSION_HISTORY).sort(compareVersions);
  const fromIndex = versions.indexOf(fromVersion);
  const toIndex = versions.indexOf(toVersion);

  if (fromIndex >= 0 && toIndex >= 0 && fromIndex < toIndex) {
    for (let i = fromIndex; i < toIndex; i++) {
      const stepKey = `${versions[i]}-${versions[i + 1]}`;
      if (migrations[stepKey]) {
        steps.push(migrations[stepKey]);
      }
    }
  }

  return {
    from: fromVersion,
    to: toVersion,
    steps,
    reversible: fromVersion.startsWith('2.'), // Only React versions are reversible
  };
}

/**
 * Execute migration path
 */
export async function executeMigrationPath(
  data: any,
  path: MigrationPath,
  onProgress?: (step: number, total: number, description: string) => void
): Promise<{ success: boolean; data: any; errors: string[] }> {
  const errors: string[] = [];
  let currentData = { ...data };

  for (let i = 0; i < path.steps.length; i++) {
    const step = path.steps[i];

    if (onProgress) {
      onProgress(i + 1, path.steps.length, step.description);
    }

    try {
      // Validate before migration
      if (step.validate && !step.validate(currentData)) {
        errors.push(`Validation failed for migration to ${step.version}`);
        continue;
      }

      // Execute migration
      currentData = await step.handler(currentData);

      // Update version
      if (currentData['lucaverse-state']) {
        try {
          const state = JSON.parse(currentData['lucaverse-state']);
          state.version = step.version;
          currentData['lucaverse-state'] = JSON.stringify(state);
        } catch (e) {
          // Create new state object if parsing fails
          currentData['lucaverse-state'] = JSON.stringify({ version: step.version });
        }
      } else {
        currentData['lucaverse-state'] = JSON.stringify({ version: step.version });
      }
    } catch (error) {
      errors.push(`Migration to ${step.version} failed: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    data: currentData,
    errors,
  };
}

/**
 * Version comparison utilities
 */
function parseVersion(version: string): number[] {
  return version.split('.').map(v => parseInt(v, 10) || 0);
}

function compareVersions(a: string | number[], b: string | number[]): number {
  const versionA = Array.isArray(a) ? a : parseVersion(a);
  const versionB = Array.isArray(b) ? b : parseVersion(b);

  for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
    const partA = versionA[i] || 0;
    const partB = versionB[i] || 0;

    if (partA < partB) return -1;
    if (partA > partB) return 1;
  }

  return 0;
}

/**
 * Get version compatibility information
 */
export function getCompatibilityInfo(version: string): {
  compatible: string[];
  incompatible: string[];
  requiresMigration: string[];
} {
  const info = {
    compatible: [] as string[],
    incompatible: [] as string[],
    requiresMigration: [] as string[],
  };

  const allVersions = Object.keys(VERSION_HISTORY);
  const versionInfo = VERSION_HISTORY[version];

  if (!versionInfo) {
    return info;
  }

  allVersions.forEach(v => {
    if (v === version) {
      info.compatible.push(v);
    } else if (versionInfo.breaking && compareVersions(v, version) < 0) {
      info.requiresMigration.push(v);
    } else if (Math.abs(compareVersions(v, version)) <= 1) {
      info.compatible.push(v);
    } else {
      info.incompatible.push(v);
    }
  });

  return info;
}

/**
 * Migration history tracking
 */
export interface MigrationHistoryEntry {
  timestamp: number;
  fromVersion: string;
  toVersion: string;
  success: boolean;
  duration: number;
  errors?: string[];
}

export class MigrationHistory {
  private static STORAGE_KEY = 'lucaverse-migration-history';
  private static MAX_ENTRIES = 10;

  static add(entry: MigrationHistoryEntry): void {
    try {
      const history = this.getAll();
      history.unshift(entry);

      // Keep only recent entries
      if (history.length > this.MAX_ENTRIES) {
        history.length = this.MAX_ENTRIES;
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save migration history:', error);
    }
  }

  static getAll(): MigrationHistoryEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load migration history:', error);
      return [];
    }
  }

  static getLast(): MigrationHistoryEntry | null {
    const history = this.getAll();
    return history.length > 0 ? history[0] : null;
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
