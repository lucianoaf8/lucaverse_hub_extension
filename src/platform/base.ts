/**
 * Base Platform Abstraction Layer
 * Defines unified interfaces for cross-platform functionality
 */

// Storage API Interface
export interface StorageAPI {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  watch(callback: (changes: StorageChange[]) => void): () => void;
  getSize(): Promise<number>;
  getQuota(): Promise<number>;
}

export interface StorageChange {
  key: string;
  oldValue?: any;
  newValue?: any;
  storageArea: string;
}

// Notification API Interface
export interface NotificationAPI {
  create(options: NotificationOptions): Promise<string | null>;
  update(id: string, options: Partial<NotificationOptions>): Promise<boolean>;
  clear(id: string): Promise<boolean>;
  getAll(): Promise<NotificationInfo[]>;
  onClicked(callback: (notificationId: string) => void): () => void;
  onClosed(callback: (notificationId: string, byUser: boolean) => void): () => void;
  requestPermission(): Promise<NotificationPermission>;
}

export interface NotificationOptions {
  title: string;
  message: string;
  iconUrl?: string;
  type?: 'basic' | 'image' | 'list' | 'progress';
  imageUrl?: string;
  items?: Array<{ title: string; message: string }>;
  progress?: number;
  priority?: number;
  silent?: boolean;
  requireInteraction?: boolean;
}

export interface NotificationInfo {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

// Window API Interface
export interface WindowAPI {
  create(options: WindowCreateOptions): Promise<WindowInfo>;
  update(windowId: string, options: WindowUpdateOptions): Promise<WindowInfo>;
  close(windowId: string): Promise<void>;
  focus(windowId: string): Promise<void>;
  getCurrent(): Promise<WindowInfo>;
  getAll(): Promise<WindowInfo[]>;
  onCreated(callback: (window: WindowInfo) => void): () => void;
  onRemoved(callback: (windowId: string) => void): () => void;
  onFocusChanged(callback: (windowId: string) => void): () => void;
}

export interface WindowCreateOptions {
  url?: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  type?: 'normal' | 'popup' | 'panel';
  focused?: boolean;
  incognito?: boolean;
}
export interface WindowUpdateOptions {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
  focused?: boolean;
  drawAttention?: boolean;
  state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen';
}

export interface WindowInfo {
  id: string;
  focused: boolean;
  top: number;
  left: number;
  width: number;
  height: number;
  incognito: boolean;
  type: string;
  state: string;
  alwaysOnTop: boolean;
}

// System API Interface
export interface SystemAPI {
  clipboard: ClipboardAPI;
  fileSystem: FileSystemAPI;
  hardware: HardwareAPI;
  getInfo(): Promise<SystemInfo>;
}

export interface ClipboardAPI {
  read(): Promise<string>;
  write(text: string): Promise<void>;
  readImage(): Promise<Blob | null>;
  writeImage(blob: Blob): Promise<void>;
}

export interface FileSystemAPI {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  createDirectory(path: string): Promise<void>;
  listFiles(path: string): Promise<string[]>;
  showOpenDialog(options?: FileDialogOptions): Promise<string[]>;
  showSaveDialog(options?: FileDialogOptions): Promise<string | null>;
}

export interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>;
}

export interface HardwareAPI {
  getBatteryLevel(): Promise<number | null>;
  isOnline(): Promise<boolean>;
  getNetworkType(): Promise<string>;
  getCPUUsage(): Promise<number>;
  getMemoryUsage(): Promise<MemoryInfo>;
}

export interface MemoryInfo {
  used: number;
  total: number;
  available: number;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  userAgent?: string;
  language: string;
  timezone: string;
}

// Capability Detection Interface
export interface PlatformCapabilities {
  storage: {
    local: boolean;
    sync: boolean;
    managed: boolean;
    unlimited: boolean;
  };
  notifications: {
    basic: boolean;
    rich: boolean;
    actions: boolean;
    images: boolean;
  };
  windows: {
    create: boolean;
    focus: boolean;
    multiple: boolean;
    alwaysOnTop: boolean;
  };
  system: {
    clipboard: boolean;
    fileSystem: boolean;
    hardware: boolean;
    nativeMenus: boolean;
  };
  background: {
    serviceWorker: boolean;
    persistentPages: boolean;
    alarms: boolean;
  };
}

// Main Platform API Interface
export interface PlatformAPI {
  readonly type: PlatformType;
  readonly storage: StorageAPI;
  readonly notifications: NotificationAPI;
  readonly windows: WindowAPI;
  readonly system: SystemAPI;
  
  initialize(): Promise<void>;
  getCapabilities(): PlatformCapabilities;
  isSupported(feature: string): boolean;
  onError(callback: (error: PlatformError) => void): () => void;
}

export type PlatformType = 'chrome' | 'web' | 'electron';

export interface PlatformError {
  code: string;
  message: string;
  platform: PlatformType;
  feature?: string;
  originalError?: Error;
}

// Events
export interface PlatformEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
  platform: PlatformType;
}

export interface EventEmitter {
  on(event: string, callback: (data: any) => void): () => void;
  emit(event: string, data?: any): void;
  off(event: string, callback?: (data: any) => void): void;
}

// Utility types
export interface PlatformConfig {
  enableSync?: boolean;
  storageQuota?: number;
  notificationSound?: boolean;
  debugMode?: boolean;
}

export interface PlatformContext {
  isExtension: boolean;
  isWeb: boolean;
  isElectron: boolean;
  hasPermissions: string[];
  manifestVersion?: number;
}
