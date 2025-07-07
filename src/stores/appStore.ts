/**
 * Application Store - Manages global application settings and user preferences
 * Handles theme, shortcuts, notifications, and performance configurations
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { ThemeVariant } from '@/types/components';
import { createDevToolsMiddleware, defaultDevToolsConfig } from './devtools';

// Notification interface
interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  timestamp: number;
  read?: boolean;
}

// Keyboard shortcut configuration
interface KeyboardShortcut {
  key: string;
  modifiers: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
  action: string;
  description: string;
  enabled: boolean;
}

// Performance settings
interface PerformanceSettings {
  animationsEnabled: boolean;
  particleEffectsEnabled: boolean;
  maxParticleCount: number;
  renderQuality: 'low' | 'medium' | 'high';
  backgroundEffectsEnabled: boolean;
  autoSaveInterval: number; // in milliseconds
  maxHistorySize: number;
}

// User preferences
interface UserPreferences {
  autoSave: boolean;
  debugMode: boolean;
  showGridByDefault: boolean;
  snapToGrid: boolean;
  confirmBeforeDelete: boolean;
  showTooltips: boolean;
  compactMode: boolean;
  language: string;
}

// Main application state interface
interface AppState {
  // Theme and UI
  theme: ThemeVariant;

  // User preferences
  preferences: UserPreferences;

  // Performance settings
  performance: PerformanceSettings;

  // Keyboard shortcuts
  shortcuts: Record<string, KeyboardShortcut>;

  // Notification system
  notifications: AppNotification[];
  notificationQueue: AppNotification[];
  maxNotifications: number;

  // Application metadata
  lastSaved: number;
  version: string;
  initialized: boolean;

  // Actions
  updateSettings: (
    settings: Partial<Pick<AppState, 'theme' | 'preferences' | 'performance'>>
  ) => void;
  resetToDefaults: () => void;

  // Theme actions
  setTheme: (theme: ThemeVariant) => void;
  toggleTheme: () => void;

  // Preference actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  toggleDebugMode: () => void;
  toggleAutoSave: () => void;

  // Performance actions
  updatePerformanceSettings: (settings: Partial<PerformanceSettings>) => void;
  toggleAnimations: () => void;

  // Shortcut actions
  updateShortcut: (actionName: string, shortcut: Partial<KeyboardShortcut>) => void;
  addShortcut: (shortcut: KeyboardShortcut) => void;
  removeShortcut: (actionName: string) => void;
  resetShortcutsToDefaults: () => void;

  // Notification actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  clearReadNotifications: () => void;

  // Utility actions
  markAsInitialized: () => void;
  updateLastSaved: () => void;

  // Computed selectors
  getUnreadNotifications: () => AppNotification[];
  getNotificationsByType: (type: AppNotification['type']) => AppNotification[];
  isShortcutEnabled: (actionName: string) => boolean;
}
// Default shortcuts configuration
const defaultShortcuts: Record<string, KeyboardShortcut> = {
  'panel.add': {
    key: 'n',
    modifiers: { ctrl: true },
    action: 'panel.add',
    description: 'Add new panel',
    enabled: true,
  },
  'panel.delete': {
    key: 'Delete',
    modifiers: {},
    action: 'panel.delete',
    description: 'Delete selected panel',
    enabled: true,
  },
  'panel.duplicate': {
    key: 'd',
    modifiers: { ctrl: true },
    action: 'panel.duplicate',
    description: 'Duplicate selected panel',
    enabled: true,
  },
  'layout.undo': {
    key: 'z',
    modifiers: { ctrl: true },
    action: 'layout.undo',
    description: 'Undo last action',
    enabled: true,
  },
  'layout.redo': {
    key: 'y',
    modifiers: { ctrl: true },
    action: 'layout.redo',
    description: 'Redo last action',
    enabled: true,
  },
  'layout.save': {
    key: 's',
    modifiers: { ctrl: true },
    action: 'layout.save',
    description: 'Save layout',
    enabled: true,
  },
  'grid.toggle': {
    key: 'g',
    modifiers: { ctrl: true },
    action: 'grid.toggle',
    description: 'Toggle grid visibility',
    enabled: true,
  },
  'selection.all': {
    key: 'a',
    modifiers: { ctrl: true },
    action: 'selection.all',
    description: 'Select all panels',
    enabled: true,
  },
  'debug.toggle': {
    key: 'F12',
    modifiers: {},
    action: 'debug.toggle',
    description: 'Toggle debug mode',
    enabled: true,
  },
};

// Default application state
const defaultAppState: Omit<AppState, keyof AppActions> = {
  theme: ThemeVariant.Dark,

  preferences: {
    autoSave: true,
    debugMode: false,
    showGridByDefault: false,
    snapToGrid: true,
    confirmBeforeDelete: true,
    showTooltips: true,
    compactMode: false,
    language: 'en',
  },

  performance: {
    animationsEnabled: true,
    particleEffectsEnabled: true,
    maxParticleCount: 50,
    renderQuality: 'high',
    backgroundEffectsEnabled: true,
    autoSaveInterval: 30000, // 30 seconds
    maxHistorySize: 50,
  },

  shortcuts: defaultShortcuts,

  notifications: [],
  notificationQueue: [],
  maxNotifications: 5,

  lastSaved: 0,
  version: '2.0.0',
  initialized: false,
};

// Type for store actions
type AppActions = {
  updateSettings: AppState['updateSettings'];
  resetToDefaults: AppState['resetToDefaults'];
  setTheme: AppState['setTheme'];
  toggleTheme: AppState['toggleTheme'];
  updatePreferences: AppState['updatePreferences'];
  toggleDebugMode: AppState['toggleDebugMode'];
  toggleAutoSave: AppState['toggleAutoSave'];
  updatePerformanceSettings: AppState['updatePerformanceSettings'];
  toggleAnimations: AppState['toggleAnimations'];
  updateShortcut: AppState['updateShortcut'];
  addShortcut: AppState['addShortcut'];
  removeShortcut: AppState['removeShortcut'];
  resetShortcutsToDefaults: AppState['resetShortcutsToDefaults'];
  addNotification: AppState['addNotification'];
  removeNotification: AppState['removeNotification'];
  markNotificationAsRead: AppState['markNotificationAsRead'];
  clearAllNotifications: AppState['clearAllNotifications'];
  clearReadNotifications: AppState['clearReadNotifications'];
  markAsInitialized: AppState['markAsInitialized'];
  updateLastSaved: AppState['updateLastSaved'];
  getUnreadNotifications: AppState['getUnreadNotifications'];
  getNotificationsByType: AppState['getNotificationsByType'];
  isShortcutEnabled: AppState['isShortcutEnabled'];
};

// Create the application store
export const useAppStore = create<AppState>()(
  createDevToolsMiddleware({
    name: 'AppStore',
    enabled: defaultDevToolsConfig.enabled,
    serialize: defaultDevToolsConfig.serialize,
    trace: defaultDevToolsConfig.trace,
    traceLimit: defaultDevToolsConfig.traceLimit,
  })((set, get) => ({
    ...defaultAppState,

    // General settings actions
    updateSettings: settings => {
      set(
        state => ({
          ...state,
          ...settings,
          lastSaved: Date.now(),
        }),
        false,
        'updateSettings'
      );
    },

    resetToDefaults: () => {
      set(
        {
          ...defaultAppState,
          initialized: true,
          lastSaved: Date.now(),
        },
        false,
        'resetToDefaults'
      );
    },

    // Theme actions
    setTheme: theme => {
      set({ theme, lastSaved: Date.now() }, false, 'setTheme');
    },

    toggleTheme: () => {
      const currentTheme = get().theme;
      const newTheme = currentTheme === ThemeVariant.Dark ? ThemeVariant.Light : ThemeVariant.Dark;
      set({ theme: newTheme, lastSaved: Date.now() }, false, 'toggleTheme');
    },

    // Preference actions
    updatePreferences: preferences => {
      set(
        state => ({
          preferences: { ...state.preferences, ...preferences },
          lastSaved: Date.now(),
        }),
        false,
        'updatePreferences'
      );
    },

    toggleDebugMode: () => {
      set(
        state => ({
          preferences: {
            ...state.preferences,
            debugMode: !state.preferences.debugMode,
          },
          lastSaved: Date.now(),
        }),
        false,
        'toggleDebugMode'
      );
    },

    toggleAutoSave: () => {
      set(
        state => ({
          preferences: {
            ...state.preferences,
            autoSave: !state.preferences.autoSave,
          },
          lastSaved: Date.now(),
        }),
        false,
        'toggleAutoSave'
      );
    },

    // Performance actions
    updatePerformanceSettings: settings => {
      set(
        state => ({
          performance: { ...state.performance, ...settings },
          lastSaved: Date.now(),
        }),
        false,
        'updatePerformanceSettings'
      );
    },

    toggleAnimations: () => {
      set(
        state => ({
          performance: {
            ...state.performance,
            animationsEnabled: !state.performance.animationsEnabled,
          },
          lastSaved: Date.now(),
        }),
        false,
        'toggleAnimations'
      );
    },

    // Shortcut actions
    updateShortcut: (actionName, shortcut) => {
      set(
        state => {
          const existingShortcut = state.shortcuts[actionName];
          if (!existingShortcut) return state;

          return {
            shortcuts: {
              ...state.shortcuts,
              [actionName]: { ...existingShortcut, ...shortcut },
            },
            lastSaved: Date.now(),
          };
        },
        false,
        'updateShortcut'
      );
    },

    addShortcut: shortcut => {
      set(
        state => ({
          shortcuts: {
            ...state.shortcuts,
            [shortcut.action]: shortcut,
          },
          lastSaved: Date.now(),
        }),
        false,
        'addShortcut'
      );
    },

    removeShortcut: actionName => {
      set(
        state => {
          const newShortcuts = { ...state.shortcuts };
          delete newShortcuts[actionName];
          return {
            shortcuts: newShortcuts,
            lastSaved: Date.now(),
          };
        },
        false,
        'removeShortcut'
      );
    },

    resetShortcutsToDefaults: () => {
      set(
        {
          shortcuts: defaultShortcuts,
          lastSaved: Date.now(),
        },
        false,
        'resetShortcutsToDefaults'
      );
    },

    // Notification actions
    addNotification: notification => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: AppNotification = {
        ...notification,
        id,
        timestamp: Date.now(),
        read: false,
      };

      set(
        state => {
          const notifications = [newNotification, ...state.notifications];

          // Limit notifications to maxNotifications
          if (notifications.length > state.maxNotifications) {
            notifications.splice(state.maxNotifications);
          }

          return { notifications };
        },
        false,
        'addNotification'
      );

      // Auto-remove non-persistent notifications
      if (!notification.persistent) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          get().removeNotification(id);
        }, duration);
      }
    },

    removeNotification: id => {
      set(
        state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }),
        false,
        'removeNotification'
      );
    },

    markNotificationAsRead: id => {
      set(
        state => ({
          notifications: state.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
        }),
        false,
        'markNotificationAsRead'
      );
    },

    clearAllNotifications: () => {
      set({ notifications: [] }, false, 'clearAllNotifications');
    },

    clearReadNotifications: () => {
      set(
        state => ({
          notifications: state.notifications.filter(n => !n.read),
        }),
        false,
        'clearReadNotifications'
      );
    },

    // Utility actions
    markAsInitialized: () => {
      set({ initialized: true }, false, 'markAsInitialized');
    },

    updateLastSaved: () => {
      set({ lastSaved: Date.now() }, false, 'updateLastSaved');
    },

    // Computed selectors
    getUnreadNotifications: () => {
      return get().notifications.filter(n => !n.read);
    },

    getNotificationsByType: type => {
      return get().notifications.filter(n => n.type === type);
    },

    isShortcutEnabled: actionName => {
      const shortcut = get().shortcuts[actionName];
      return shortcut ? shortcut.enabled : false;
    },
  }))
);

// Export type for external use
export type AppStore = typeof useAppStore;

// Export notification type for external use
export type { AppNotification, KeyboardShortcut, PerformanceSettings, UserPreferences };
