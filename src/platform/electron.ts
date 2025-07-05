/**
 * Electron Platform Implementation (Preparation)
 * Provides Electron-specific API wrappers for future desktop app support
 */

import {
  PlatformAPI,
  StorageAPI,
  NotificationAPI,
  WindowAPI,
  SystemAPI,
  PlatformCapabilities,
  PlatformError,
  StorageChange,
  NotificationOptions,
  NotificationInfo,
  WindowCreateOptions,
  WindowUpdateOptions,
  WindowInfo,
  ClipboardAPI,
  FileSystemAPI,
  HardwareAPI,
  SystemInfo,
  MemoryInfo,
  FileDialogOptions,
} from './base.ts';

// Electron IPC Communication Patterns
interface ElectronIPC {
  invoke(channel: string, ...args: any[]): Promise<any>;
  send(channel: string, ...args: any[]): void;
  on(channel: string, listener: (event: any, ...args: any[]) => void): void;
  removeListener(channel: string, listener: Function): void;
}

// Electron Storage Implementation
class ElectronStorageAPI implements StorageAPI {
  private ipc: ElectronIPC;
  private listeners: Set<(changes: StorageChange[]) => void> = new Set();

  constructor(ipc: ElectronIPC) {
    this.ipc = ipc;

    // Listen for storage changes from main process
    this.ipc.on('storage-changed', (event, changes) => {
      this.listeners.forEach(callback => callback(changes));
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      return await this.ipc.invoke('storage-get', key);
    } catch (error) {
      console.error('Electron storage get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      await this.ipc.invoke('storage-set', key, value);
    } catch (error) {
      console.error('Electron storage set error:', error);
      throw new Error(`Failed to set storage key: ${key}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await this.ipc.invoke('storage-remove', key);
    } catch (error) {
      console.error('Electron storage remove error:', error);
      throw new Error(`Failed to remove storage key: ${key}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.ipc.invoke('storage-clear');
    } catch (error) {
      console.error('Electron storage clear error:', error);
      throw new Error('Failed to clear storage');
    }
  }

  watch(callback: (changes: StorageChange[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async getSize(): Promise<number> {
    try {
      return await this.ipc.invoke('storage-get-size');
    } catch (error) {
      console.error('Electron storage getSize error:', error);
      return 0;
    }
  }

  async getQuota(): Promise<number> {
    try {
      return await this.ipc.invoke('storage-get-quota');
    } catch (error) {
      // Default to 100MB for Electron apps
      return 104857600;
    }
  }
}

// Electron Notifications Implementation
class ElectronNotificationAPI implements NotificationAPI {
  private ipc: ElectronIPC;
  private clickListeners: Set<(notificationId: string) => void> = new Set();
  private closeListeners: Set<(notificationId: string, byUser: boolean) => void> = new Set();

  constructor(ipc: ElectronIPC) {
    this.ipc = ipc;

    // Listen for notification events from main process
    this.ipc.on('notification-clicked', (event, notificationId) => {
      this.clickListeners.forEach(callback => callback(notificationId));
    });

    this.ipc.on('notification-closed', (event, notificationId, byUser) => {
      this.closeListeners.forEach(callback => callback(notificationId, byUser));
    });
  }

  async create(options: NotificationOptions): Promise<string | null> {
    try {
      return await this.ipc.invoke('notification-create', options);
    } catch (error) {
      console.error('Electron notification create error:', error);
      return null;
    }
  }

  async update(id: string, options: Partial<NotificationOptions>): Promise<boolean> {
    try {
      return await this.ipc.invoke('notification-update', id, options);
    } catch (error) {
      console.error('Electron notification update error:', error);
      return false;
    }
  }

  async clear(id: string): Promise<boolean> {
    try {
      return await this.ipc.invoke('notification-clear', id);
    } catch (error) {
      console.error('Electron notification clear error:', error);
      return false;
    }
  }

  async getAll(): Promise<NotificationInfo[]> {
    try {
      return await this.ipc.invoke('notification-get-all');
    } catch (error) {
      console.error('Electron notification getAll error:', error);
      return [];
    }
  }

  onClicked(callback: (notificationId: string) => void): () => void {
    this.clickListeners.add(callback);
    return () => this.clickListeners.delete(callback);
  }

  onClosed(callback: (notificationId: string, byUser: boolean) => void): () => void {
    this.closeListeners.add(callback);
    return () => this.closeListeners.delete(callback);
  }

  async requestPermission(): Promise<NotificationPermission> {
    // Electron apps have notification permission by default
    return 'granted';
  }
}

// Electron Window Implementation
class ElectronWindowAPI implements WindowAPI {
  private ipc: ElectronIPC;
  private createListeners: Set<(window: WindowInfo) => void> = new Set();
  private removeListeners: Set<(windowId: string) => void> = new Set();
  private focusListeners: Set<(windowId: string) => void> = new Set();

  constructor(ipc: ElectronIPC) {
    this.ipc = ipc;

    // Listen for window events from main process
    this.ipc.on('window-created', (event, windowInfo) => {
      this.createListeners.forEach(callback => callback(windowInfo));
    });

    this.ipc.on('window-removed', (event, windowId) => {
      this.removeListeners.forEach(callback => callback(windowId));
    });

    this.ipc.on('window-focus-changed', (event, windowId) => {
      this.focusListeners.forEach(callback => callback(windowId));
    });
  }

  async create(options: WindowCreateOptions): Promise<WindowInfo> {
    try {
      return await this.ipc.invoke('window-create', options);
    } catch (error) {
      console.error('Electron window create error:', error);
      throw new Error('Failed to create window');
    }
  }

  async update(windowId: string, options: WindowUpdateOptions): Promise<WindowInfo> {
    try {
      return await this.ipc.invoke('window-update', windowId, options);
    } catch (error) {
      console.error('Electron window update error:', error);
      throw new Error('Failed to update window');
    }
  }

  async close(windowId: string): Promise<void> {
    try {
      await this.ipc.invoke('window-close', windowId);
    } catch (error) {
      console.error('Electron window close error:', error);
      throw new Error('Failed to close window');
    }
  }

  async focus(windowId: string): Promise<void> {
    try {
      await this.ipc.invoke('window-focus', windowId);
    } catch (error) {
      console.error('Electron window focus error:', error);
      throw new Error('Failed to focus window');
    }
  }

  async getCurrent(): Promise<WindowInfo> {
    try {
      return await this.ipc.invoke('window-get-current');
    } catch (error) {
      console.error('Electron window getCurrent error:', error);
      throw new Error('Failed to get current window');
    }
  }

  async getAll(): Promise<WindowInfo[]> {
    try {
      return await this.ipc.invoke('window-get-all');
    } catch (error) {
      console.error('Electron window getAll error:', error);
      return [];
    }
  }

  onCreated(callback: (window: WindowInfo) => void): () => void {
    this.createListeners.add(callback);
    return () => this.createListeners.delete(callback);
  }

  onRemoved(callback: (windowId: string) => void): () => void {
    this.removeListeners.add(callback);
    return () => this.removeListeners.delete(callback);
  }

  onFocusChanged(callback: (windowId: string) => void): () => void {
    this.focusListeners.add(callback);
    return () => this.focusListeners.delete(callback);
  }
}

// Electron System APIs Implementation
class ElectronClipboardAPI implements ClipboardAPI {
  private ipc: ElectronIPC;

  constructor(ipc: ElectronIPC) {
    this.ipc = ipc;
  }

  async read(): Promise<string> {
    try {
      return await this.ipc.invoke('clipboard-read');
    } catch (error) {
      console.error('Electron clipboard read error:', error);
      throw new Error('Failed to read clipboard');
    }
  }

  async write(text: string): Promise<void> {
    try {
      await this.ipc.invoke('clipboard-write', text);
    } catch (error) {
      console.error('Electron clipboard write error:', error);
      throw new Error('Failed to write to clipboard');
    }
  }

  async readImage(): Promise<Blob | null> {
    try {
      const imageData = await this.ipc.invoke('clipboard-read-image');
      return imageData ? new Blob([imageData], { type: 'image/png' }) : null;
    } catch (error) {
      console.error('Electron clipboard readImage error:', error);
      return null;
    }
  }

  async writeImage(blob: Blob): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      await this.ipc.invoke('clipboard-write-image', arrayBuffer);
    } catch (error) {
      console.error('Electron clipboard writeImage error:', error);
      throw new Error('Failed to write image to clipboard');
    }
  }
}

// Electron File System Implementation
class ElectronFileSystemAPI implements FileSystemAPI {
  private ipc: ElectronIPC;

  constructor(ipc: ElectronIPC) {
    this.ipc = ipc;
  }

  async readFile(path: string): Promise<string> {
    try {
      return await this.ipc.invoke('fs-read-file', path);
    } catch (error) {
      console.error('Electron file read error:', error);
      throw new Error(`Failed to read file: ${path}`);
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await this.ipc.invoke('fs-write-file', path, content);
    } catch (error) {
      console.error('Electron file write error:', error);
      throw new Error(`Failed to write file: ${path}`);
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      return await this.ipc.invoke('fs-exists', path);
    } catch (error) {
      console.error('Electron file exists error:', error);
      return false;
    }
  }

  async createDirectory(path: string): Promise<void> {
    try {
      await this.ipc.invoke('fs-create-directory', path);
    } catch (error) {
      console.error('Electron create directory error:', error);
      throw new Error(`Failed to create directory: ${path}`);
    }
  }

  async listFiles(path: string): Promise<string[]> {
    try {
      return await this.ipc.invoke('fs-list-files', path);
    } catch (error) {
      console.error('Electron list files error:', error);
      return [];
    }
  }

  async showOpenDialog(options?: FileDialogOptions): Promise<string[]> {
    try {
      return await this.ipc.invoke('dialog-show-open', options);
    } catch (error) {
      console.error('Electron open dialog error:', error);
      return [];
    }
  }

  async showSaveDialog(options?: FileDialogOptions): Promise<string | null> {
    try {
      return await this.ipc.invoke('dialog-show-save', options);
    } catch (error) {
      console.error('Electron save dialog error:', error);
      return null;
    }
  }
}

// Electron Hardware API Implementation
class ElectronHardwareAPI implements HardwareAPI {
  private ipc: ElectronIPC;

  constructor(ipc: ElectronIPC) {
    this.ipc = ipc;
  }

  async getBatteryLevel(): Promise<number | null> {
    try {
      return await this.ipc.invoke('hardware-get-battery-level');
    } catch (error) {
      console.error('Electron battery level error:', error);
      return null;
    }
  }

  async isOnline(): Promise<boolean> {
    try {
      return await this.ipc.invoke('hardware-is-online');
    } catch (error) {
      return navigator.onLine;
    }
  }

  async getNetworkType(): Promise<string> {
    try {
      return await this.ipc.invoke('hardware-get-network-type');
    } catch (error) {
      return 'unknown';
    }
  }

  async getCPUUsage(): Promise<number> {
    try {
      return await this.ipc.invoke('hardware-get-cpu-usage');
    } catch (error) {
      console.error('Electron CPU usage error:', error);
      return 0;
    }
  }

  async getMemoryUsage(): Promise<MemoryInfo> {
    try {
      return await this.ipc.invoke('hardware-get-memory-usage');
    } catch (error) {
      console.error('Electron memory usage error:', error);
      return { used: 0, total: 0, available: 0 };
    }
  }
}

// Electron System API Implementation
class ElectronSystemAPI implements SystemAPI {
  readonly clipboard: ClipboardAPI;
  readonly fileSystem: FileSystemAPI;
  readonly hardware: HardwareAPI;

  constructor(ipc: ElectronIPC) {
    this.clipboard = new ElectronClipboardAPI(ipc);
    this.fileSystem = new ElectronFileSystemAPI(ipc);
    this.hardware = new ElectronHardwareAPI(ipc);
  }

  async getInfo(): Promise<SystemInfo> {
    try {
      return await (this.hardware as ElectronHardwareAPI)['ipc'].invoke('system-get-info');
    } catch (error) {
      console.error('Electron system info error:', error);
      return {
        platform: 'electron',
        arch: 'unknown',
        version: '1.0.0',
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }
}

// Main Electron Platform API
export class ElectronPlatformAPI implements PlatformAPI {
  readonly type = 'electron' as const;
  readonly storage: StorageAPI;
  readonly notifications: NotificationAPI;
  readonly windows: WindowAPI;
  readonly system: SystemAPI;

  private errorListeners: Set<(error: PlatformError) => void> = new Set();
  private ipc: ElectronIPC;

  constructor() {
    // Initialize IPC communication
    this.ipc = (window as any).electronAPI || {
      invoke: async () => {
        throw new Error('Electron IPC not available');
      },
      send: () => {
        throw new Error('Electron IPC not available');
      },
      on: () => {
        throw new Error('Electron IPC not available');
      },
      removeListener: () => {
        throw new Error('Electron IPC not available');
      },
    };

    this.storage = new ElectronStorageAPI(this.ipc);
    this.notifications = new ElectronNotificationAPI(this.ipc);
    this.windows = new ElectronWindowAPI(this.ipc);
    this.system = new ElectronSystemAPI(this.ipc);
  }

  async initialize(): Promise<void> {
    try {
      // Check if running in Electron context
      if (!(window as any).electronAPI) {
        throw new Error('Not running in Electron context');
      }

      // Initialize Electron-specific features
      await this.ipc.invoke('platform-initialize');

      // Setup IPC error handling
      this.ipc.on('platform-error', (event, error) => {
        this.emitError(error.code, error.message, error.originalError, error.feature);
      });

      console.log('Electron platform initialized');
    } catch (error) {
      this.emitError('INIT_FAILED', 'Failed to initialize Electron platform', error as Error);
      throw error;
    }
  }

  getCapabilities(): PlatformCapabilities {
    return {
      storage: {
        local: true,
        sync: true,
        managed: true,
        unlimited: true,
      },
      notifications: {
        basic: true,
        rich: true,
        actions: true,
        images: true,
      },
      windows: {
        create: true,
        focus: true,
        multiple: true,
        alwaysOnTop: true,
      },
      system: {
        clipboard: true,
        fileSystem: true,
        hardware: true,
        nativeMenus: true,
      },
      background: {
        serviceWorker: false,
        persistentPages: true,
        alarms: true,
      },
    };
  }

  isSupported(feature: string): boolean {
    const capabilities = this.getCapabilities();
    const parts = feature.split('.');

    let current: any = capabilities;
    for (const part of parts) {
      if (current[part] === undefined) return false;
      current = current[part];
    }

    return Boolean(current);
  }

  onError(callback: (error: PlatformError) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private emitError(code: string, message: string, originalError?: Error, feature?: string): void {
    const error: PlatformError = {
      code,
      message,
      platform: this.type,
      feature,
      originalError,
    };

    this.errorListeners.forEach(callback => callback(error));
  }
}

// Check if Electron platform is available
export const isElectronPlatformAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
};
