import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';

// Theme state types
export interface ThemeState {
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  spacing: Record<string, string>;
  effects: {
    borderRadius: Record<string, string>;
    boxShadow: Record<string, string>;
    blur: Record<string, string>;
  };
  isDirty: boolean;
  lastModified: Date | null;
}

// Component state types
export interface ComponentState {
  selectedComponent: string | null;
  componentStates: Record<string, any>;
  testResults: Record<string, {
    passed: number;
    failed: number;
    skipped: number;
    timestamp: Date;
  }>;
  buildQueue: string[];
}

// Layout state types
export interface LayoutState {
  panels: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    content: any;
  }>;
  activeLayout: string;
  savedLayouts: Record<string, any>;
  gridSettings: {
    rows: number;
    columns: number;
    gap: number;
  };
}

// Performance state types
export interface PerformanceState {
  metrics: {
    loadTime: number;
    renderTime: number;
    bundleSize: number;
    memoryUsage: number;
  };
  validationResults: Array<{
    id: string;
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  }>;
  optimizationSuggestions: string[];
}

// Shared state types
export interface SharedState {
  exportHistory: Array<{
    id: string;
    type: 'theme' | 'component' | 'layout';
    timestamp: Date;
    data: any;
  }>;
  clipboardData: any;
  undoStack: Array<{
    action: string;
    data: any;
    timestamp: Date;
  }>;
  redoStack: Array<{
    action: string;
    data: any;
    timestamp: Date;
  }>;
}

// Main store interface
export interface DevCenterStore {
  // Theme state
  theme: ThemeState;
  updateThemeColors: (colors: Partial<ThemeState['colors']>) => void;
  updateThemeTypography: (typography: Partial<ThemeState['typography']>) => void;
  updateThemeSpacing: (spacing: Partial<ThemeState['spacing']>) => void;
  updateThemeEffects: (effects: Partial<ThemeState['effects']>) => void;
  resetTheme: () => void;
  
  // Component state
  component: ComponentState;
  selectComponent: (componentId: string | null) => void;
  updateComponentState: (componentId: string, state: any) => void;
  updateTestResults: (componentId: string, results: any) => void;
  addToBuildQueue: (componentId: string) => void;
  removeFromBuildQueue: (componentId: string) => void;
  
  // Layout state
  layout: LayoutState;
  updatePanels: (panels: LayoutState['panels']) => void;
  setActiveLayout: (layoutId: string) => void;
  saveLayout: (layoutId: string, layoutData: any) => void;
  updateGridSettings: (settings: Partial<LayoutState['gridSettings']>) => void;
  
  // Performance state
  performance: PerformanceState;
  updateMetrics: (metrics: Partial<PerformanceState['metrics']>) => void;
  addValidationResult: (result: PerformanceState['validationResults'][0]) => void;
  clearValidationResults: () => void;
  updateOptimizationSuggestions: (suggestions: string[]) => void;
  
  // Shared state
  shared: SharedState;
  addToExportHistory: (exportData: SharedState['exportHistory'][0]) => void;
  setClipboardData: (data: any) => void;
  pushToUndoStack: (action: string, data: any) => void;
  undo: () => void;
  redo: () => void;
  
  // Cross-tool synchronization
  syncThemeToComponents: () => void;
  syncLayoutToPerformance: () => void;
  exportCurrentState: () => any;
  importState: (state: any) => void;
}

// Initial states
const initialThemeState: ThemeState = {
  colors: {},
  typography: {
    fontFamily: 'system-ui',
    fontSize: {},
    fontWeight: {},
    lineHeight: {}
  },
  spacing: {},
  effects: {
    borderRadius: {},
    boxShadow: {},
    blur: {}
  },
  isDirty: false,
  lastModified: null
};

const initialComponentState: ComponentState = {
  selectedComponent: null,
  componentStates: {},
  testResults: {},
  buildQueue: []
};

const initialLayoutState: LayoutState = {
  panels: [],
  activeLayout: 'default',
  savedLayouts: {},
  gridSettings: {
    rows: 12,
    columns: 12,
    gap: 16
  }
};

const initialPerformanceState: PerformanceState = {
  metrics: {
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    memoryUsage: 0
  },
  validationResults: [],
  optimizationSuggestions: []
};

const initialSharedState: SharedState = {
  exportHistory: [],
  clipboardData: null,
  undoStack: [],
  redoStack: []
};

// Create the store
export const useDevCenterStore = create<DevCenterStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Theme state
        theme: initialThemeState,
        
        updateThemeColors: (colors) => set((state) => ({
          theme: {
            ...state.theme,
            colors: { ...state.theme.colors, ...colors },
            isDirty: true,
            lastModified: new Date()
          }
        })),
        
        updateThemeTypography: (typography) => set((state) => ({
          theme: {
            ...state.theme,
            typography: { ...state.theme.typography, ...typography },
            isDirty: true,
            lastModified: new Date()
          }
        })),
        
        updateThemeSpacing: (spacing) => set((state) => ({
          theme: {
            ...state.theme,
            spacing: { ...state.theme.spacing, ...spacing },
            isDirty: true,
            lastModified: new Date()
          }
        })),
        
        updateThemeEffects: (effects) => set((state) => ({
          theme: {
            ...state.theme,
            effects: { ...state.theme.effects, ...effects },
            isDirty: true,
            lastModified: new Date()
          }
        })),
        
        resetTheme: () => set({ theme: initialThemeState }),
        
        // Component state
        component: initialComponentState,
        
        selectComponent: (componentId) => set((state) => ({
          component: { ...state.component, selectedComponent: componentId }
        })),
        
        updateComponentState: (componentId, componentState) => set((state) => ({
          component: {
            ...state.component,
            componentStates: {
              ...state.component.componentStates,
              [componentId]: componentState
            }
          }
        })),
        
        updateTestResults: (componentId, results) => set((state) => ({
          component: {
            ...state.component,
            testResults: {
              ...state.component.testResults,
              [componentId]: { ...results, timestamp: new Date() }
            }
          }
        })),
        
        addToBuildQueue: (componentId) => set((state) => ({
          component: {
            ...state.component,
            buildQueue: [...state.component.buildQueue, componentId]
          }
        })),
        
        removeFromBuildQueue: (componentId) => set((state) => ({
          component: {
            ...state.component,
            buildQueue: state.component.buildQueue.filter(id => id !== componentId)
          }
        })),
        
        // Layout state
        layout: initialLayoutState,
        
        updatePanels: (panels) => set((state) => ({
          layout: { ...state.layout, panels }
        })),
        
        setActiveLayout: (layoutId) => set((state) => ({
          layout: { ...state.layout, activeLayout: layoutId }
        })),
        
        saveLayout: (layoutId, layoutData) => set((state) => ({
          layout: {
            ...state.layout,
            savedLayouts: {
              ...state.layout.savedLayouts,
              [layoutId]: layoutData
            }
          }
        })),
        
        updateGridSettings: (settings) => set((state) => ({
          layout: {
            ...state.layout,
            gridSettings: { ...state.layout.gridSettings, ...settings }
          }
        })),
        
        // Performance state
        performance: initialPerformanceState,
        
        updateMetrics: (metrics) => set((state) => ({
          performance: {
            ...state.performance,
            metrics: { ...state.performance.metrics, ...metrics }
          }
        })),
        
        addValidationResult: (result) => set((state) => ({
          performance: {
            ...state.performance,
            validationResults: [...state.performance.validationResults, result]
          }
        })),
        
        clearValidationResults: () => set((state) => ({
          performance: {
            ...state.performance,
            validationResults: []
          }
        })),
        
        updateOptimizationSuggestions: (suggestions) => set((state) => ({
          performance: {
            ...state.performance,
            optimizationSuggestions: suggestions
          }
        })),
        
        // Shared state
        shared: initialSharedState,
        
        addToExportHistory: (exportData) => set((state) => ({
          shared: {
            ...state.shared,
            exportHistory: [exportData, ...state.shared.exportHistory].slice(0, 10)
          }
        })),
        
        setClipboardData: (data) => set((state) => ({
          shared: { ...state.shared, clipboardData: data }
        })),
        
        pushToUndoStack: (action, data) => {
          const currentState = get();
          set((state) => ({
            shared: {
              ...state.shared,
              undoStack: [...state.shared.undoStack, { action, data, timestamp: new Date() }].slice(-20),
              redoStack: []
            }
          }));
        },
        
        undo: () => {
          const { shared } = get();
          if (shared.undoStack.length === 0) return;
          
          const lastAction = shared.undoStack[shared.undoStack.length - 1];
          // Implement undo logic based on action type
          
          set((state) => ({
            shared: {
              ...state.shared,
              undoStack: state.shared.undoStack.slice(0, -1),
              redoStack: [...state.shared.redoStack, lastAction]
            }
          }));
        },
        
        redo: () => {
          const { shared } = get();
          if (shared.redoStack.length === 0) return;
          
          const nextAction = shared.redoStack[shared.redoStack.length - 1];
          // Implement redo logic based on action type
          
          set((state) => ({
            shared: {
              ...state.shared,
              redoStack: state.shared.redoStack.slice(0, -1),
              undoStack: [...state.shared.undoStack, nextAction]
            }
          }));
        },
        
        // Cross-tool synchronization
        syncThemeToComponents: () => {
          const { theme } = get();
          // Apply theme changes to component preview
          const root = document.documentElement;
          Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
          });
        },
        
        syncLayoutToPerformance: () => {
          const { layout } = get();
          // Calculate performance impact of layout changes
          const panelCount = layout.panels.length;
          const complexity = panelCount * (layout.gridSettings.rows * layout.gridSettings.columns);
          
          set((state) => ({
            performance: {
              ...state.performance,
              metrics: {
                ...state.performance.metrics,
                renderTime: complexity * 0.5 // Simulated calculation
              }
            }
          }));
        },
        
        exportCurrentState: () => {
          const state = get();
          return {
            theme: state.theme,
            component: state.component,
            layout: state.layout,
            performance: state.performance,
            timestamp: new Date().toISOString()
          };
        },
        
        importState: (importedState) => {
          set({
            theme: importedState.theme || initialThemeState,
            component: importedState.component || initialComponentState,
            layout: importedState.layout || initialLayoutState,
            performance: importedState.performance || initialPerformanceState
          });
        }
      }),
      {
        name: 'dev-center-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          theme: state.theme,
          layout: state.layout,
          shared: {
            exportHistory: state.shared.exportHistory
          }
        })
      }
    )
  )
);