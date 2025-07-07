/**
 * Simplified Undo/Redo Middleware - Basic undo/redo functionality
 */

// Basic undo/redo actions interface
export interface UndoRedoActions {
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// Utility function to setup keyboard shortcuts
export function setupUndoRedoKeyboards<T extends UndoRedoActions>(store: {
  getState: () => T;
}): () => void {
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        store.getState().undo();
      } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
        event.preventDefault();
        store.getState().redo();
      }
    }
  };

  document.addEventListener('keydown', handleKeydown);

  return () => {
    document.removeEventListener('keydown', handleKeydown);
  };
}

// Basic history implementation (to be enhanced later)
export function createBasicHistory<T>() {
  let history: T[] = [];
  let currentIndex = -1;
  const maxSize = 50;

  return {
    push: (state: T) => {
      // Remove any future entries
      history = history.slice(0, currentIndex + 1);

      // Add new state
      history.push(state);
      currentIndex = history.length - 1;

      // Limit size
      if (history.length > maxSize) {
        history.shift();
        currentIndex--;
      }
    },

    undo: (): T | null => {
      if (currentIndex > 0) {
        currentIndex--;
        return history[currentIndex] || null;
      }
      return null;
    },

    redo: (): T | null => {
      if (currentIndex < history.length - 1) {
        currentIndex++;
        return history[currentIndex] || null;
      }
      return null;
    },

    canUndo: () => currentIndex > 0,
    canRedo: () => currentIndex < history.length - 1,

    clear: () => {
      history = [];
      currentIndex = -1;
    },
  };
}
