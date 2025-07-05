/**
 * Platform abstraction layer type definitions
 * Provides unified interface across web, extension, and electron platforms
 */

// Platform types
export enum PlatformType {
  Web = 'web',
  Extension = 'extension',
  Electron = 'electron',
}

// Storage API interface
export interface StorageAPI {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAll(): Promise<Record<string, unknown>>;
  subscribe(key: string, callback: (value: unknown) => void): () => void;
}

// Notification API interface
export interface NotificationAPI {
  show(options: NotificationOptions): Promise<string>;
  close(id: string): Promise<void>;
  getPermission(): Promise<NotificationPermission>;
  requestPermission(): Promise<NotificationPermission>;
}

// Notification options
export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  timeout?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

// Notification action
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}
// Window management API interface
export interface WindowAPI {
  open(url: string, options?: WindowOptions): Promise<string>;
  close(windowId: string): Promise<void>;
  focus(windowId?: string): Promise<void>;
  minimize(windowId?: string): Promise<void>;
  maximize(windowId?: string): Promise<void>;
  getBounds(windowId?: string): Promise<WindowBounds>;
  setBounds(bounds: Partial<WindowBounds>, windowId?: string): Promise<void>;
  onClosed(callback: (windowId: string) => void): () => void;
  onFocused(callback: (windowId: string) => void): () => void;
}

// Window options for opening new windows
export interface WindowOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizable?: boolean;
  alwaysOnTop?: boolean;
  modal?: boolean;
  parent?: string;
}

// Window bounds information
export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Platform capabilities detection
export interface PlatformCapabilities {
  hasLocalStorage: boolean;
  hasNotifications: boolean;
  hasWindowManagement: boolean;
  hasFileSystem: boolean;
  hasClipboard: boolean;
  hasSystemTray: boolean;
  hasMenuBar: boolean;
  hasKeyboardShortcuts: boolean;
  hasAutoUpdater: boolean;
  maxStorageSize?: number;
}

// Complete platform API interface
export interface PlatformAPI {
  type: PlatformType;
  capabilities: PlatformCapabilities;
  storage: StorageAPI;
  notifications: NotificationAPI;
  window: WindowAPI;
  
  // Platform-specific methods
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getVersion(): string;
  isOnline(): boolean;
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void;
}

// Platform configuration
export interface PlatformConfig {
  type: PlatformType;
  debug: boolean;
  storage: {
    prefix: string;
    maxSize?: number;
  };
  notifications: {
    enabled: boolean;
    defaultTimeout: number;
  };
  window: {
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
  };
}

// Platform initialization result
export interface PlatformInitResult {
  success: boolean;
  platform: PlatformType;
  capabilities: PlatformCapabilities;
  error?: string;
}
