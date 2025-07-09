import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDevCenterStore } from '../state/stores/DevCenterState';

// Migration state management
interface MigrationState {
  hasSeenNewExperience: boolean;
  preferredExperience: 'new' | 'legacy' | 'auto';
  migrationProgress: {
    themeMigrated: boolean;
    componentsMigrated: boolean;
    layoutsMigrated: boolean;
    preferencesMigrated: boolean;
  };
  lastMigrationCheck: Date;
  showMigrationBanner: boolean;
}

const useMigrationState = () => {
  const [state, setState] = useState<MigrationState>(() => {
    const saved = localStorage.getItem('dev-center-migration');
    return saved ? JSON.parse(saved) : {
      hasSeenNewExperience: false,
      preferredExperience: 'auto',
      migrationProgress: {
        themeMigrated: false,
        componentsMigrated: false,
        layoutsMigrated: false,
        preferencesMigrated: false
      },
      lastMigrationCheck: new Date(),
      showMigrationBanner: true
    };
  });
  
  const updateMigrationState = (updates: Partial<MigrationState>) => {
    const newState = { ...state, ...updates };
    setState(newState);
    localStorage.setItem('dev-center-migration', JSON.stringify(newState));
  };
  
  const markMigrationComplete = () => {
    updateMigrationState({
      migrationProgress: {
        themeMigrated: true,
        componentsMigrated: true,
        layoutsMigrated: true,
        preferencesMigrated: true
      },
      hasSeenNewExperience: true
    });
  };
  
  const dismissMigrationBanner = () => {
    updateMigrationState({ showMigrationBanner: false });
  };
  
  return {
    ...state,
    updateMigrationState,
    markMigrationComplete,
    dismissMigrationBanner
  };
};

// Migration notification banner
export const MigrationNotification = () => {
  const navigate = useNavigate();
  const { showMigrationBanner, dismissMigrationBanner, hasSeenNewExperience } = useMigrationState();
  
  if (!showMigrationBanner || hasSeenNewExperience) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🚀</div>
            <div>
              <h3 className="font-semibold">New Dev Center Experience Available!</h3>
              <p className="text-sm opacity-90">
                Try the enhanced workflow-driven development environment with improved performance and features.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                navigate('/dev-center');
                dismissMigrationBanner();
              }}
              className="px-4 py-2 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try New Experience
            </button>
            <button
              onClick={() => navigate('/dev-center/legacy')}
              className="px-4 py-2 bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-800 transition-colors"
            >
              Use Legacy Version
            </button>
            <button
              onClick={dismissMigrationBanner}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
              title="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Legacy route handler
export const LegacyRouteHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { preferredExperience } = useMigrationState();
  
  useEffect(() => {
    if (preferredExperience === 'new') {
      const newRoute = mapLegacyToNewRoute(location.pathname);
      if (newRoute) {
        navigate(newRoute);
      }
    }
  }, [location.pathname, preferredExperience, navigate]);
  
  return null;
};

const mapLegacyToNewRoute = (legacyPath: string): string | null => {
  const mappings: Record<string, string> = {
    '/dev-center/theme-playground': '/dev-center/theme/color-harmony',
    '/dev-center/advanced-theme-hub': '/dev-center/theme/typography',
    '/dev-center/component-library': '/dev-center/component/build',
    '/dev-center/component-testing-lab': '/dev-center/component/test-states',
    '/dev-center/validation-runner': '/dev-center/performance/measure',
    '/dev-center/live-dashboard-preview': '/dev-center/layout/structure'
  };
  
  return mappings[legacyPath] || null;
};

// Migration progress tracker
export const MigrationProgressTracker = () => {
  const { migrationProgress, markMigrationComplete } = useMigrationState();
  const [isVisible, setIsVisible] = useState(false);
  
  const totalSteps = Object.keys(migrationProgress).length;
  const completedSteps = Object.values(migrationProgress).filter(Boolean).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  useEffect(() => {
    // Show progress tracker when migration is in progress
    if (completedSteps > 0 && completedSteps < totalSteps) {
      setIsVisible(true);
    }
  }, [completedSteps, totalSteps]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-elevated rounded-xl border border-neutral-700 p-4 shadow-2xl max-w-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-neutral-200">Migration Progress</h4>
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-400 hover:text-neutral-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-neutral-400">
          <span>Progress</span>
          <span>{completedSteps}/{totalSteps}</span>
        </div>
        
        <div className="w-full bg-neutral-700 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="space-y-1">
          {Object.entries(migrationProgress).map(([key, completed]) => (
            <div key={key} className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${completed ? 'bg-success' : 'bg-neutral-600'}`} />
              <span className={completed ? 'text-success' : 'text-neutral-400'}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
            </div>
          ))}
        </div>
        
        {completedSteps === totalSteps && (
          <button
            onClick={markMigrationComplete}
            className="w-full mt-3 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            Complete Migration
          </button>
        )}
      </div>
    </div>
  );
};

// Legacy API wrapper for backward compatibility
export class LegacyDevCenterAPI {
  static getThemeData() {
    const store = useDevCenterStore.getState();
    return {
      colors: store.theme.colors,
      typography: store.theme.typography,
      spacing: store.theme.spacing,
      effects: store.theme.effects
    };
  }
  
  static getComponentData() {
    const store = useDevCenterStore.getState();
    return {
      components: store.component.componentStates,
      selected: store.component.selectedComponent,
      tests: store.component.testResults,
      buildQueue: store.component.buildQueue
    };
  }
  
  static getLayoutData() {
    const store = useDevCenterStore.getState();
    return {
      panels: store.layout.panels,
      grid: store.layout.gridSettings,
      active: store.layout.activeLayout,
      saved: store.layout.savedLayouts
    };
  }
  
  static getPerformanceData() {
    const store = useDevCenterStore.getState();
    return {
      metrics: store.performance.metrics,
      validations: store.performance.validationResults,
      suggestions: store.performance.optimizationSuggestions
    };
  }
  
  // Legacy methods for backward compatibility
  static updateTheme(themeData: any) {
    const store = useDevCenterStore.getState();
    if (themeData.colors) store.updateThemeColors(themeData.colors);
    if (themeData.typography) store.updateThemeTypography(themeData.typography);
    if (themeData.spacing) store.updateThemeSpacing(themeData.spacing);
    if (themeData.effects) store.updateThemeEffects(themeData.effects);
  }
  
  static selectComponent(componentId: string) {
    const store = useDevCenterStore.getState();
    store.selectComponent(componentId);
  }
  
  static updateLayout(layoutData: any) {
    const store = useDevCenterStore.getState();
    if (layoutData.panels) store.updatePanels(layoutData.panels);
    if (layoutData.grid) store.updateGridSettings(layoutData.grid);
    if (layoutData.active) store.setActiveLayout(layoutData.active);
  }
}

// Migration utilities
export class DevCenterMigration {
  static hasLegacyCustomizations(): boolean {
    // Check for legacy customizations in localStorage
    const legacyKeys = [
      'theme-playground-settings',
      'component-library-preferences',
      'validation-runner-config',
      'dashboard-preview-layout'
    ];
    
    return legacyKeys.some(key => localStorage.getItem(key) !== null);
  }
  
  static migrateUserPreferences(): void {
    // Migrate legacy preferences to new system
    const legacyTheme = localStorage.getItem('theme-playground-settings');
    if (legacyTheme) {
      try {
        const themeData = JSON.parse(legacyTheme);
        LegacyDevCenterAPI.updateTheme(themeData);
        localStorage.removeItem('theme-playground-settings');
      } catch (error) {
        console.error('Failed to migrate theme preferences:', error);
      }
    }
    
    const legacyLayout = localStorage.getItem('dashboard-preview-layout');
    if (legacyLayout) {
      try {
        const layoutData = JSON.parse(legacyLayout);
        LegacyDevCenterAPI.updateLayout(layoutData);
        localStorage.removeItem('dashboard-preview-layout');
      } catch (error) {
        console.error('Failed to migrate layout preferences:', error);
      }
    }
  }
  
  static convertLegacyWorkflows(): void {
    // Convert any legacy workflow configurations to new format
    const legacyWorkflows = localStorage.getItem('dev-center-workflows');
    if (legacyWorkflows) {
      try {
        const workflows = JSON.parse(legacyWorkflows);
        // Convert to new workflow format
        // This would map legacy workflow steps to new workflow system
        localStorage.removeItem('dev-center-workflows');
      } catch (error) {
        console.error('Failed to convert legacy workflows:', error);
      }
    }
  }
  
  static getMigrationRecommendations(): string[] {
    const recommendations = [];
    
    if (this.hasLegacyCustomizations()) {
      recommendations.push('We found legacy customizations that can be migrated to the new system');
    }
    
    const usage = localStorage.getItem('dev-center-usage-stats');
    if (usage) {
      const stats = JSON.parse(usage);
      if (stats.mostUsedTool === 'theme-playground') {
        recommendations.push('Start with Theme Studio workflow for familiar experience');
      }
      if (stats.mostUsedTool === 'component-library') {
        recommendations.push('Explore Component Workshop for enhanced testing capabilities');
      }
    }
    
    recommendations.push('Try the new workflow-driven approach for better productivity');
    recommendations.push('Use Quick Actions (Ctrl+K) for faster navigation');
    
    return recommendations;
  }
}

// Main migration manager component
export const MigrationManager = () => {
  const location = useLocation();
  const { preferredExperience } = useMigrationState();
  
  // Auto-migrate preferences on first load
  useEffect(() => {
    if (DevCenterMigration.hasLegacyCustomizations()) {
      DevCenterMigration.migrateUserPreferences();
    }
  }, []);
  
  return (
    <>
      <MigrationNotification />
      <LegacyRouteHandler />
      <MigrationProgressTracker />
    </>
  );
};

export default MigrationManager;