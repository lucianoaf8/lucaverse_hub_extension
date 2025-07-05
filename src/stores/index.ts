/**
 * Store Index - Main store exports with composition, hydration, and debugging utilities
 * Handles store initialization, cross-store communication, and development tools
 */

import { useLayoutStore } from './layoutStore';
import { useAppStore } from './appStore';
import { migrateVanillaState, type MigrationResult } from '@/utils/stateMigration';

// Store initialization state
interface StoreInitializationState {
  isInitialized: boolean;
  isHydrating: boolean;
  migrationResult?: MigrationResult;
  errors: string[];
  warnings: string[];
}

let initializationState: StoreInitializationState = {
  isInitialized: false,
  isHydrating: false,
  errors: [],
  warnings: [],
};

// Store event listeners for cross-store communication
const storeEventListeners = new Map<string, Set<(data: any) => void>>();

/**
 * Initialize all stores with persistence, migration, and hydration
 */
export async function initializeStores(): Promise<StoreInitializationState> {
  if (initializationState.isInitialized) {
    return initializationState;
  }

  initializationState.isHydrating = true;

  try {
    console.log('Initializing Lucaverse Hub stores...');

    // Step 1: Migrate legacy state if needed
    console.log('Checking for legacy state migration...');
    const migrationResult = await migrateVanillaState();
    initializationState.migrationResult = migrationResult;

    if (migrationResult.success) {
      console.log('Legacy state migration completed successfully');
      
      // Apply migrated state to stores
      if (migrationResult.panels.length > 0) {
        const layoutStore = useLayoutStore.getState();
        migrationResult.panels.forEach(panel => {
          layoutStore.addPanel(panel);
        });
      }

      if (migrationResult.workspace) {
        const layoutStore = useLayoutStore.getState();
        layoutStore.saveWorkspace(
          migrationResult.workspace.name,
          migrationResult.workspace.description
        );
      }

      const appStore = useAppStore.getState();
      appStore.updateSettings({
        theme: migrationResult.theme,
        preferences: migrationResult.preferences,
        performance: migrationResult.performance,
      });
    } else {
      console.warn('Legacy state migration had errors:', migrationResult.errors);
      initializationState.errors.push(...migrationResult.errors);
    }

    initializationState.warnings.push(...migrationResult.warnings);

    // Step 2: Setup cross-store communication
    setupCrossStoreEventListeners();

    // Step 3: Setup keyboard shortcuts (simplified for now)
    if (typeof window !== 'undefined') {
      // Will setup undo/redo when implemented
      console.log('Keyboard shortcuts ready for future implementation');
    }

    // Step 4: Mark stores as initialized
    useAppStore.getState().markAsInitialized();

    // Step 5: Setup auto-save if enabled
    setupAutoSave();

    initializationState.isInitialized = true;
    initializationState.isHydrating = false;

    console.log('Store initialization completed successfully');

    // Emit initialization complete event
    emitStoreEvent('stores:initialized', initializationState);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    initializationState.errors.push(`Store initialization failed: ${errorMessage}`);
    initializationState.isHydrating = false;
    
    console.error('Store initialization failed:', error);
  }

  return initializationState;
}

/**
 * Setup cross-store event listeners for communication
 */
function setupCrossStoreEventListeners(): void {
  const appStore = useAppStore.getState();

  // Listen for layout changes to update auto-save
  useLayoutStore.subscribe(
    (state) => state.panels,
    (panels) => {
      if (appStore.preferences.autoSave) {
        appStore.updateLastSaved();
        emitStoreEvent('layout:changed', { panelCount: panels.length });
      }
    }
  );

  // Listen for selection changes to emit events
  useLayoutStore.subscribe(
    (state) => state.selectedPanelIds,
    (selectedIds) => {
      emitStoreEvent('layout:selection-changed', { selectedIds });
    }
  );

  // Listen for theme changes to apply to DOM
  useAppStore.subscribe(
    (state) => state.theme,
    (theme) => {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
        emitStoreEvent('app:theme-changed', { theme });
      }
    }
  );

  // Listen for debug mode changes
  useAppStore.subscribe(
    (state) => state.preferences.debugMode,
    (debugMode) => {
      if (typeof window !== 'undefined') {
        (window as any).__LUCAVERSE_DEBUG__ = debugMode;
        emitStoreEvent('app:debug-mode-changed', { debugMode });
      }
    }
  );

  console.log('Cross-store event listeners setup completed');
}

/**
 * Setup auto-save functionality
 */
function setupAutoSave(): void {
  const appStore = useAppStore.getState();
  
  if (!appStore.preferences.autoSave) {
    return;
  }

  const interval = appStore.performance.autoSaveInterval;
  
  setInterval(() => {
    const currentAppStore = useAppStore.getState();
    if (currentAppStore.preferences.autoSave) {
      currentAppStore.updateLastSaved();
      emitStoreEvent('stores:auto-saved', { timestamp: Date.now() });
    }
  }, interval);

  console.log(`Auto-save setup with ${interval}ms interval`);
}

/**
 * Emit store event to all listeners
 */
export function emitStoreEvent(eventType: string, data?: any): void {
  const listeners = storeEventListeners.get(eventType);
  if (listeners) {
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in store event listener for ${eventType}:`, error);
      }
    });
  }
}

/**
 * Subscribe to store events
 */
export function subscribeToStoreEvent(
  eventType: string,
  listener: (data: any) => void
): () => void {
  if (!storeEventListeners.has(eventType)) {
    storeEventListeners.set(eventType, new Set());
  }
  
  const listeners = storeEventListeners.get(eventType)!;
  listeners.add(listener);
  
  // Return unsubscribe function
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      storeEventListeners.delete(eventType);
    }
  };
}

/**
 * Reset all stores to default state (useful for testing)
 */
export function resetAllStores(): void {
  console.log('Resetting all stores to default state...');
  
  const layoutStore = useLayoutStore.getState();
  const appStore = useAppStore.getState();
  
  layoutStore.resetLayout();
  appStore.resetToDefaults();
  
  emitStoreEvent('stores:reset', { timestamp: Date.now() });
  
  console.log('All stores reset to default state');
}

/**
 * Get current store state for debugging
 */
export function getStoreSnapshot(): {
  layout: ReturnType<typeof useLayoutStore.getState>;
  app: ReturnType<typeof useAppStore.getState>;
  initialization: StoreInitializationState;
} {
  return {
    layout: useLayoutStore.getState(),
    app: useAppStore.getState(),
    initialization: initializationState,
  };
}

/**
 * Validate store state integrity
 */
export function validateStoreState(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const layoutStore = useLayoutStore.getState();
    const appStore = useAppStore.getState();

    // Validate layout store
    if (!Array.isArray(layoutStore.panels)) {
      errors.push('Layout store panels is not an array');
    }

    if (!Array.isArray(layoutStore.selectedPanelIds)) {
      errors.push('Layout store selectedPanelIds is not an array');
    }

    // Check for duplicate panel IDs
    const panelIds = layoutStore.panels.map(p => p.id);
    const uniqueIds = new Set(panelIds);
    if (panelIds.length !== uniqueIds.size) {
      errors.push('Duplicate panel IDs found in layout store');
    }

    // Validate selected panels exist
    const invalidSelections = layoutStore.selectedPanelIds.filter(
      id => !layoutStore.panels.find(p => p.id === id)
    );
    if (invalidSelections.length > 0) {
      warnings.push(`Selected panels not found: ${invalidSelections.join(', ')}`);
    }

    // Validate app store
    if (!appStore.initialized) {
      warnings.push('App store not initialized');
    }

    if (!Array.isArray(appStore.notifications)) {
      errors.push('App store notifications is not an array');
    }

    console.log('Store state validation completed');

  } catch (error) {
    errors.push(`Store validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Development-only debugging utilities
 */
export const devtools = (() => {
  if (process.env.NODE_ENV !== 'development') {
    return {};
  }

  return {
    // Expose stores to window for debugging
    exposeStores: () => {
      if (typeof window !== 'undefined') {
        (window as any).__LUCAVERSE_STORES__ = {
          layout: useLayoutStore,
          app: useAppStore,
          utils: {
            reset: resetAllStores,
            snapshot: getStoreSnapshot,
            validate: validateStoreState,
            emit: emitStoreEvent,
            subscribe: subscribeToStoreEvent,
          },
        };
        console.log('Stores exposed to window.__LUCAVERSE_STORES__');
      }
    },

    // Log store state changes
    enableStateLogging: () => {
      useLayoutStore.subscribe((state) => {
        console.log('Layout store state changed:', state);
      });

      useAppStore.subscribe((state) => {
        console.log('App store state changed:', state);
      });

      console.log('Store state logging enabled');
    },

    // Performance monitoring
    enablePerformanceMonitoring: () => {
      const originalLayoutSet = useLayoutStore.setState;
      const originalAppSet = useAppStore.setState;

      useLayoutStore.setState = (...args) => {
        const start = performance.now();
        const result = originalLayoutSet.apply(useLayoutStore, args);
        const end = performance.now();
        console.log(`Layout store update took ${end - start}ms`);
        return result;
      };

      useAppStore.setState = (...args) => {
        const start = performance.now();
        const result = originalAppSet.apply(useAppStore, args);
        const end = performance.now();
        console.log(`App store update took ${end - start}ms`);
        return result;
      };

      console.log('Store performance monitoring enabled');
    },
  };
})();

// Auto-expose stores in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  devtools.exposeStores?.();
}

// Export stores and utilities
export { useLayoutStore, useAppStore };
export type { StoreInitializationState };
