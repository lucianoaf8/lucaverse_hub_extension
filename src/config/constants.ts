/**
 * Application constants
 * Immutable values used throughout the application
 */

// Layout constants
export const GRID_SIZE = 20;
export const GRID_SNAP_THRESHOLD = 10;
export const MIN_PANEL_SIZE = { width: 200, height: 150 } as const;
export const MAX_PANEL_SIZE = { width: 1200, height: 900 } as const;
export const DEFAULT_PANEL_SIZE = { width: 400, height: 300 } as const;

// Animation constants
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Panel constants
export const PANEL_HEADER_HEIGHT = 40;
export const PANEL_RESIZE_HANDLE_SIZE = 8;
export const PANEL_MIN_VISIBLE_AREA = 50;

// Z-index layers
export const Z_INDEX = {
  background: -1,
  neural: 0,
  panels: 10,
  selected: 20,
  dragging: 30,
  contextMenu: 40,
  modal: 50,
  toast: 60,
  debug: 100,
} as const;

// Key codes
export const KEY_CODES = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  WORKSPACE: 'workspace',
  PREFERENCES: 'preferences',
  THEME: 'theme',
  BOOKMARKS: 'bookmarks',
  TASKS: 'tasks',
  CHAT_HISTORY: 'chat-history',
  TIMER_SETTINGS: 'timer-settings',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: '/auth',
  USER: '/user',
  WORKSPACE: '/workspace',
  PANELS: '/panels',
  ANALYTICS: '/analytics',
} as const;

// Event names
export const EVENTS = {
  PANEL_CREATED: 'panel:created',
  PANEL_UPDATED: 'panel:updated',
  PANEL_DELETED: 'panel:deleted',
  WORKSPACE_SAVED: 'workspace:saved',
  THEME_CHANGED: 'theme:changed',
  USER_AUTHENTICATED: 'user:authenticated',
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Panel types
export const PANEL_TYPES = {
  SMART_HUB: 'smart-hub',
  AI_CHAT: 'ai-chat',
  TASK_MANAGER: 'task-manager',
  POMODORO_TIMER: 'pomodoro-timer',
  BOOKMARKS: 'bookmarks',
  PRODUCTIVITY: 'productivity',
  SETTINGS: 'settings',
  DEBUG: 'debug',
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  MAX_PANELS: 20,
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  ANIMATION_DURATION: 300,
  AUTO_SAVE_INTERVAL: 30000,
  IDLE_TIMEOUT: 300000, // 5 minutes
} as const;
