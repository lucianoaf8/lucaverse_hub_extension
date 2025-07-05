/**
 * Simplified Persistence Middleware - Basic localStorage persistence for Zustand stores
 */

import { StateCreator } from 'zustand';

// Simple persistence configuration
interface SimplePersistConfig<T> {
  name: string;
  partialize?: (state: T) => Partial<T>;
  version?: number;
}

// Simple storage implementation
const storage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Ignore storage errors
    }
  },
};

// Simple persist middleware
export function simplePersist<T>(
  config: SimplePersistConfig<T>,
  stateCreator: StateCreator<T>
): StateCreator<T> {
  return (set, get, store) => {
    const { name, partialize, version = 1 } = config;

    // Load initial state
    const loadState = () => {
      try {
        const stored = storage.getItem(name);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.version === version) {
            return parsed.state;
          }
        }
      } catch {
        // Ignore errors
      }
      return null;
    };

    // Save state with debouncing
    let saveTimeout: NodeJS.Timeout;
    const saveState = (state: T) => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        try {
          const stateToSave = partialize ? partialize(state) : state;
          const dataToStore = {
            state: stateToSave,
            version,
            timestamp: Date.now(),
          };
          storage.setItem(name, JSON.stringify(dataToStore));
        } catch {
          // Ignore errors
        }
      }, 100);
    };

    // Initialize store
    const initialState = stateCreator(
      (partial, replace) => {
        set(partial, replace);
        saveState(get());
      },
      get,
      store
    );

    // Load and merge persisted state
    const persistedState = loadState();
    if (persistedState) {
      store.setState({ ...initialState, ...persistedState }, true);
    }

    return initialState;
  };
}

// Export utilities
export function clearPersistedData(pattern = 'lucaverse-'): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(pattern)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore errors
  }
}
