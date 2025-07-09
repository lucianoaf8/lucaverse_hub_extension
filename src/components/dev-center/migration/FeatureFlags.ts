// Feature flag system for Dev Center migration
interface FeatureFlags {
  ENABLE_NEW_THEME_STUDIO: boolean;
  ENABLE_NEW_COMPONENT_WORKSHOP: boolean;
  ENABLE_NEW_LAYOUT_DESIGNER: boolean;
  ENABLE_NEW_QUALITY_GATE: boolean;
  ENABLE_NEW_NAVIGATION: boolean;
  ENABLE_WORKFLOW_SYSTEM: boolean;
  ENABLE_CENTRALIZED_STATE: boolean;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  ENABLE_INTEGRATION_POINTS: boolean;
  SHOW_MIGRATION_BANNER: boolean;
  LEGACY_FALLBACK_ENABLED: boolean;
  ENABLE_MIGRATION_PROGRESS: boolean;
  ENABLE_AUTO_MIGRATION: boolean;
  ENABLE_LEGACY_API_WRAPPER: boolean;
  ENABLE_ROUTE_MIGRATION: boolean;
}

// Default feature flags for gradual rollout
const DEFAULT_FLAGS: FeatureFlags = {
  ENABLE_NEW_THEME_STUDIO: true,
  ENABLE_NEW_COMPONENT_WORKSHOP: true,
  ENABLE_NEW_LAYOUT_DESIGNER: true,
  ENABLE_NEW_QUALITY_GATE: true,
  ENABLE_NEW_NAVIGATION: true,
  ENABLE_WORKFLOW_SYSTEM: true,
  ENABLE_CENTRALIZED_STATE: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  ENABLE_INTEGRATION_POINTS: true,
  SHOW_MIGRATION_BANNER: true,
  LEGACY_FALLBACK_ENABLED: true,
  ENABLE_MIGRATION_PROGRESS: true,
  ENABLE_AUTO_MIGRATION: true,
  ENABLE_LEGACY_API_WRAPPER: true,
  ENABLE_ROUTE_MIGRATION: true
};

// Feature flag management
class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private flags: FeatureFlags;
  private listeners: Map<string, Array<(value: boolean) => void>> = new Map();
  
  private constructor() {
    this.flags = this.loadFlags();
  }
  
  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }
  
  private loadFlags(): FeatureFlags {
    try {
      // Load from localStorage first
      const saved = localStorage.getItem('dev-center-feature-flags');
      if (saved) {
        const savedFlags = JSON.parse(saved);
        return { ...DEFAULT_FLAGS, ...savedFlags };
      }
      
      // Load from environment variables
      const envFlags: Partial<FeatureFlags> = {};
      Object.keys(DEFAULT_FLAGS).forEach(key => {
        const envKey = `REACT_APP_${key}`;
        if (process.env[envKey]) {
          envFlags[key as keyof FeatureFlags] = process.env[envKey] === 'true';
        }
      });
      
      return { ...DEFAULT_FLAGS, ...envFlags };
    } catch (error) {
      console.error('Failed to load feature flags:', error);
      return DEFAULT_FLAGS;
    }
  }
  
  private saveFlags(): void {
    try {
      localStorage.setItem('dev-center-feature-flags', JSON.stringify(this.flags));
    } catch (error) {
      console.error('Failed to save feature flags:', error);
    }
  }
  
  // Get flag value
  getFlag(flagName: keyof FeatureFlags): boolean {
    return this.flags[flagName];
  }
  
  // Set flag value
  setFlag(flagName: keyof FeatureFlags, value: boolean): void {
    this.flags[flagName] = value;
    this.saveFlags();
    this.notifyListeners(flagName, value);
  }
  
  // Get all flags
  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }
  
  // Reset to defaults
  resetFlags(): void {
    this.flags = { ...DEFAULT_FLAGS };
    this.saveFlags();
    Object.keys(this.flags).forEach(key => {
      this.notifyListeners(key as keyof FeatureFlags, this.flags[key as keyof FeatureFlags]);
    });
  }
  
  // Subscribe to flag changes
  subscribe(flagName: keyof FeatureFlags, callback: (value: boolean) => void): () => void {
    const flagKey = String(flagName);
    if (!this.listeners.has(flagKey)) {
      this.listeners.set(flagKey, []);
    }
    this.listeners.get(flagKey)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(flagKey);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  private notifyListeners(flagName: keyof FeatureFlags, value: boolean): void {
    const callbacks = this.listeners.get(String(flagName));
    if (callbacks) {
      callbacks.forEach(callback => callback(value));
    }
  }
  
  // Gradual rollout methods
  enableGradualRollout(percentage: number): void {
    const userId = this.getUserId();
    const userHash = this.hashUserId(userId);
    const shouldEnable = userHash % 100 < percentage;
    
    if (shouldEnable) {
      this.setFlag('ENABLE_NEW_THEME_STUDIO', true);
      this.setFlag('ENABLE_NEW_COMPONENT_WORKSHOP', true);
      this.setFlag('ENABLE_NEW_LAYOUT_DESIGNER', true);
      this.setFlag('ENABLE_NEW_QUALITY_GATE', true);
    }
  }
  
  private getUserId(): string {
    let userId = localStorage.getItem('dev-center-user-id');
    if (!userId) {
      userId = Math.random().toString(36).substr(2, 9);
      localStorage.setItem('dev-center-user-id', userId);
    }
    return userId;
  }
  
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  // A/B testing support
  isInExperimentGroup(experimentName: string): boolean {
    const userId = this.getUserId();
    const experimentKey = `experiment-${experimentName}`;
    
    let assignment = localStorage.getItem(experimentKey);
    if (!assignment) {
      // Random assignment
      assignment = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(experimentKey, assignment);
    }
    
    return assignment === 'B';
  }
  
  // Performance monitoring
  trackFeatureUsage(flagName: keyof FeatureFlags): void {
    const usage = JSON.parse(localStorage.getItem('feature-usage') || '{}');
    usage[flagName] = (usage[flagName] || 0) + 1;
    usage.lastUsed = new Date().toISOString();
    localStorage.setItem('feature-usage', JSON.stringify(usage));
  }
  
  // Migration phase management
  setMigrationPhase(phase: 1 | 2 | 3 | 4): void {
    switch (phase) {
      case 1:
        // Foundation phase
        this.setFlag('ENABLE_WORKFLOW_SYSTEM', true);
        this.setFlag('ENABLE_CENTRALIZED_STATE', true);
        this.setFlag('ENABLE_PERFORMANCE_MONITORING', true);
        break;
      case 2:
        // Tool enhancement phase
        this.setFlag('ENABLE_NEW_THEME_STUDIO', true);
        this.setFlag('ENABLE_NEW_COMPONENT_WORKSHOP', true);
        this.setFlag('ENABLE_NEW_LAYOUT_DESIGNER', true);
        this.setFlag('ENABLE_NEW_QUALITY_GATE', true);
        break;
      case 3:
        // Integration phase
        this.setFlag('ENABLE_INTEGRATION_POINTS', true);
        this.setFlag('ENABLE_NEW_NAVIGATION', true);
        break;
      case 4:
        // Migration phase
        this.setFlag('SHOW_MIGRATION_BANNER', true);
        this.setFlag('ENABLE_MIGRATION_PROGRESS', true);
        this.setFlag('ENABLE_AUTO_MIGRATION', true);
        break;
    }
  }
  
  // Emergency rollback
  emergencyRollback(): void {
    this.setFlag('ENABLE_NEW_THEME_STUDIO', false);
    this.setFlag('ENABLE_NEW_COMPONENT_WORKSHOP', false);
    this.setFlag('ENABLE_NEW_LAYOUT_DESIGNER', false);
    this.setFlag('ENABLE_NEW_QUALITY_GATE', false);
    this.setFlag('ENABLE_NEW_NAVIGATION', false);
    this.setFlag('LEGACY_FALLBACK_ENABLED', true);
    
    console.warn('Emergency rollback activated - reverting to legacy system');
  }
}

// React hooks for feature flags
export const useFeatureFlag = (flagName: keyof FeatureFlags): boolean => {
  const [value, setValue] = React.useState(() => 
    FeatureFlagManager.getInstance().getFlag(flagName)
  );
  
  React.useEffect(() => {
    const unsubscribe = FeatureFlagManager.getInstance().subscribe(flagName, setValue);
    return unsubscribe;
  }, [flagName]);
  
  return value;
};

export const useFeatureFlags = (): FeatureFlags => {
  const [flags, setFlags] = React.useState(() => 
    FeatureFlagManager.getInstance().getAllFlags()
  );
  
  React.useEffect(() => {
    const unsubscribes = Object.keys(flags).map(flagName => 
      FeatureFlagManager.getInstance().subscribe(
        flagName as keyof FeatureFlags, 
        () => setFlags(FeatureFlagManager.getInstance().getAllFlags())
      )
    );
    
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, []);
  
  return flags;
};

// Feature flag component wrapper
export const FeatureFlag: React.FC<{
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ flag, children, fallback = null }) => {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

// Export the singleton instance
export const featureFlagManager = FeatureFlagManager.getInstance();

// Export flag constants for easy access
export const MIGRATION_FLAGS = DEFAULT_FLAGS;

// Import React for hooks
import React from 'react';