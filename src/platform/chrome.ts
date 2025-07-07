/**
 * Chrome Extension Platform Implementation
 * Provides Chrome-specific API wrappers with proper error handling
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
  PlatformContext,
} from './base.ts';

// Chrome Storage Implementation
class ChromeStorageAPI implements StorageAPI {
  private listeners: Set<(changes: StorageChange[]) => void> = new Set();

  constructor() {
    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] ?? null;
    } catch (error) {
      console.error('Chrome storage get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error('Chrome storage set error:', error);
      throw new Error(`Failed to set storage key: ${key}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error('Chrome storage remove error:', error);
      throw new Error(`Failed to remove storage key: ${key}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('Chrome storage clear error:', error);
      throw new Error('Failed to clear storage');
    }
  }

  watch(callback: (changes: StorageChange[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async getSize(): Promise<number> {
    try {
      const result = await chrome.storage.local.getBytesInUse();
      return result;
    } catch (error) {
      console.error('Chrome storage getSize error:', error);
      return 0;
    }
  }

  async getQuota(): Promise<number> {
    // Chrome local storage quota is approximately 10MB
    return chrome.storage.local.QUOTA_BYTES || 10485760;
  }

  private handleStorageChange(
    changes: Record<string, chrome.storage.StorageChange>,
    namespace: string
  ): void {
    if (namespace !== 'local') return;

    const storageChanges: StorageChange[] = Object.entries(changes).map(([key, change]) => ({
      key,
      oldValue: change.oldValue,
      newValue: change.newValue,
      storageArea: namespace,
    }));

    this.listeners.forEach(callback => callback(storageChanges));
  }
}

// Chrome Notifications Implementation
class ChromeNotificationAPI implements NotificationAPI {
  private clickListeners: Set<(notificationId: string) => void> = new Set();
  private closeListeners: Set<(notificationId: string, byUser: boolean) => void> = new Set();

  constructor() {
    if (chrome?.notifications) {
      chrome.notifications.onClicked.addListener(this.handleClick.bind(this));
      chrome.notifications.onClosed.addListener(this.handleClosed.bind(this));
    }
  }

  async create(options: NotificationOptions): Promise<string | null> {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') return null;

      const chromeOptions: chrome.notifications.NotificationOptions = {
        type: options.type || 'basic',
        iconUrl: options.iconUrl || chrome.runtime.getURL('assets/icon-48.png'),
        title: options.title,
        message: options.message,
        imageUrl: options.imageUrl,
        items: options.items,
        progress: options.progress,
        priority: options.priority || 0,
        silent: options.silent,
        requireInteraction: options.requireInteraction,
      };

      const notificationId = await chrome.notifications.create(chromeOptions);
      return notificationId;
    } catch (error) {
      console.error('Chrome notification create error:', error);
      return null;
    }
  }

  async update(id: string, options: Partial<NotificationOptions>): Promise<boolean> {
    try {
      const chromeOptions: Partial<chrome.notifications.NotificationOptions> = {
        title: options.title,
        message: options.message,
        iconUrl: options.iconUrl,
        imageUrl: options.imageUrl,
        progress: options.progress,
        priority: options.priority,
      };

      const success = await chrome.notifications.update(id, chromeOptions);
      return success;
    } catch (error) {
      console.error('Chrome notification update error:', error);
      return false;
    }
  }

  async clear(id: string): Promise<boolean> {
    try {
      const success = await chrome.notifications.clear(id);
      return success;
    } catch (error) {
      console.error('Chrome notification clear error:', error);
      return false;
    }
  }

  async getAll(): Promise<NotificationInfo[]> {
    try {
      const notifications = await chrome.notifications.getAll();
      return Object.entries(notifications).map(([id, notification]) => ({
        id,
        title: notification.title || '',
        message: notification.message || '',
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Chrome notification getAll error:', error);
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
    // Chrome extensions get notification permission via manifest
    return chrome?.notifications ? 'granted' : 'denied';
  }

  private handleClick(notificationId: string): void {
    this.clickListeners.forEach(callback => callback(notificationId));
  }

  private handleClosed(notificationId: string, byUser: boolean): void {
    this.closeListeners.forEach(callback => callback(notificationId, byUser));
  }
}

// Chrome Windows Implementation
class ChromeWindowAPI implements WindowAPI {
  private createListeners: Set<(window: WindowInfo) => void> = new Set();
  private removeListeners: Set<(windowId: string) => void> = new Set();
  private focusListeners: Set<(windowId: string) => void> = new Set();

  constructor() {
    if (chrome?.windows) {
      chrome.windows.onCreated.addListener(this.handleWindowCreated.bind(this));
      chrome.windows.onRemoved.addListener(this.handleWindowRemoved.bind(this));
      chrome.windows.onFocusChanged.addListener(this.handleFocusChanged.bind(this));
    }
  }

  async create(options: WindowCreateOptions): Promise<WindowInfo> {
    try {
      const chromeOptions: chrome.windows.CreateData = {
        url: options.url,
        type: options.type as chrome.windows.CreateType,
        width: options.width,
        height: options.height,
        left: options.left,
        top: options.top,
        focused: options.focused,
        incognito: options.incognito,
      };

      const window = await chrome.windows.create(chromeOptions);
      return this.convertWindowInfo(window);
    } catch (error) {
      console.error('Chrome window create error:', error);
      throw new Error('Failed to create window');
    }
  }

  async update(windowId: string, options: WindowUpdateOptions): Promise<WindowInfo> {
    try {
      const chromeOptions: chrome.windows.UpdateInfo = {
        width: options.width,
        height: options.height,
        left: options.left,
        top: options.top,
        focused: options.focused,
        drawAttention: options.drawAttention,
        state: options.state as chrome.windows.WindowState,
      };

      const window = await chrome.windows.update(parseInt(windowId), chromeOptions);
      return this.convertWindowInfo(window);
    } catch (error) {
      console.error('Chrome window update error:', error);
      throw new Error('Failed to update window');
    }
  }

  async close(windowId: string): Promise<void> {
    try {
      await chrome.windows.remove(parseInt(windowId));
    } catch (error) {
      console.error('Chrome window close error:', error);
      throw new Error('Failed to close window');
    }
  }

  async focus(windowId: string): Promise<void> {
    try {
      await chrome.windows.update(parseInt(windowId), { focused: true });
    } catch (error) {
      console.error('Chrome window focus error:', error);
      throw new Error('Failed to focus window');
    }
  }

  async getCurrent(): Promise<WindowInfo> {
    try {
      const window = await chrome.windows.getCurrent();
      return this.convertWindowInfo(window);
    } catch (error) {
      console.error('Chrome window getCurrent error:', error);
      throw new Error('Failed to get current window');
    }
  }

  async getAll(): Promise<WindowInfo[]> {
    try {
      const windows = await chrome.windows.getAll();
      return windows.map(this.convertWindowInfo);
    } catch (error) {
      console.error('Chrome window getAll error:', error);
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

  private convertWindowInfo(window: chrome.windows.Window): WindowInfo {
    return {
      id: window.id?.toString() || '',
      focused: window.focused || false,
      top: window.top || 0,
      left: window.left || 0,
      width: window.width || 0,
      height: window.height || 0,
      incognito: window.incognito || false,
      type: window.type || 'normal',
      state: window.state || 'normal',
      alwaysOnTop: window.alwaysOnTop || false,
    };
  }

  private handleWindowCreated(window: chrome.windows.Window): void {
    this.createListeners.forEach(callback => callback(this.convertWindowInfo(window)));
  }

  private handleWindowRemoved(windowId: number): void {
    this.removeListeners.forEach(callback => callback(windowId.toString()));
  }

  private handleFocusChanged(windowId: number): void {
    this.focusListeners.forEach(callback => callback(windowId.toString()));
  }
}

// Chrome System APIs Implementation
class ChromeClipboardAPI implements ClipboardAPI {
  async read(): Promise<string> {
    try {
      // Chrome extensions need clipboardRead permission
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('Chrome clipboard read error:', error);
      throw new Error('Failed to read clipboard');
    }
  }

  async write(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Chrome clipboard write error:', error);
      throw new Error('Failed to write to clipboard');
    }
  }

  async readImage(): Promise<Blob | null> {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            return await item.getType(type);
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Chrome clipboard readImage error:', error);
      return null;
    }
  }

  async writeImage(blob: Blob): Promise<void> {
    try {
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
    } catch (error) {
      console.error('Chrome clipboard writeImage error:', error);
      throw new Error('Failed to write image to clipboard');
    }
  }
}

// Chrome File System Implementation (Limited)
class ChromeFileSystemAPI implements FileSystemAPI {
  async readFile(path: string): Promise<string> {
    throw new Error('File system access not available in Chrome extensions');
  }

  async writeFile(path: string, content: string): Promise<void> {
    throw new Error('File system access not available in Chrome extensions');
  }

  async exists(path: string): Promise<boolean> {
    return false;
  }

  async createDirectory(path: string): Promise<void> {
    throw new Error('File system access not available in Chrome extensions');
  }

  async listFiles(path: string): Promise<string[]> {
    return [];
  }

  async showOpenDialog(options?: FileDialogOptions): Promise<string[]> {
    // Use HTML file input as fallback
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options?.properties?.includes('multiSelections') || false;

      if (options?.filters) {
        const extensions = options.filters.flatMap(f => f.extensions);
        input.accept = extensions.map(ext => `.${ext}`).join(',');
      }

      input.onchange = () => {
        const files = Array.from(input.files || []).map(f => f.name);
        resolve(files);
      };

      input.click();
    });
  }

  async showSaveDialog(options?: FileDialogOptions): Promise<string | null> {
    // Chrome extensions can't show native save dialogs
    // Return a default filename or null
    return options?.defaultPath || null;
  }
}

// Chrome Hardware API Implementation
class ChromeHardwareAPI implements HardwareAPI {
  async getBatteryLevel(): Promise<number | null> {
    try {
      // @ts-ignore - Battery API may not be available in all browsers
      const battery = await navigator.getBattery?.();
      return battery?.level || null;
    } catch (error) {
      return null;
    }
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  async getNetworkType(): Promise<string> {
    try {
      // @ts-ignore - Connection API may not be available
      const connection =
        navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return connection?.effectiveType || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  async getCPUUsage(): Promise<number> {
    // Chrome extensions cannot directly access CPU usage
    return 0;
  }

  async getMemoryUsage(): Promise<MemoryInfo> {
    try {
      // @ts-ignore - Memory API may not be available
      const memory = (performance as any).memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          available: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
        };
      }
    } catch (error) {
      console.error('Chrome memory usage error:', error);
    }

    return { used: 0, total: 0, available: 0 };
  }
}

// Chrome System API Implementation
class ChromeSystemAPI implements SystemAPI {
  readonly clipboard: ClipboardAPI;
  readonly fileSystem: FileSystemAPI;
  readonly hardware: HardwareAPI;

  constructor() {
    this.clipboard = new ChromeClipboardAPI();
    this.fileSystem = new ChromeFileSystemAPI();
    this.hardware = new ChromeHardwareAPI();
  }

  async getInfo(): Promise<SystemInfo> {
    return {
      platform: 'chrome-extension',
      arch: 'unknown',
      version: chrome.runtime.getManifest().version,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

// Main Chrome Platform API
export class ChromePlatformAPI implements PlatformAPI {
  readonly type = 'chrome' as const;
  readonly storage: StorageAPI;
  readonly notifications: NotificationAPI;
  readonly windows: WindowAPI;
  readonly system: SystemAPI;

  private errorListeners: Set<(error: PlatformError) => void> = new Set();

  constructor() {
    this.storage = new ChromeStorageAPI();
    this.notifications = new ChromeNotificationAPI();
    this.windows = new ChromeWindowAPI();
    this.system = new ChromeSystemAPI();
  }

  async initialize(): Promise<void> {
    try {
      // Check if running in Chrome extension context
      if (!chrome?.runtime?.id) {
        throw new Error('Not running in Chrome extension context');
      }

      // Initialize extension lifecycle listeners
      if (chrome.runtime.onInstalled) {
        chrome.runtime.onInstalled.addListener(this.handleInstalled.bind(this));
      }

      if (chrome.runtime.onStartup) {
        chrome.runtime.onStartup.addListener(this.handleStartup.bind(this));
      }

      if (chrome.runtime.onSuspend) {
        chrome.runtime.onSuspend.addListener(this.handleSuspend.bind(this));
      }

      console.log('Chrome platform initialized');
    } catch (error) {
      this.emitError('INIT_FAILED', 'Failed to initialize Chrome platform', error as Error);
      throw error;
    }
  }

  getCapabilities(): PlatformCapabilities {
    return {
      storage: {
        local: !!chrome?.storage?.local,
        sync: !!chrome?.storage?.sync,
        managed: !!chrome?.storage?.managed,
        unlimited: false,
      },
      notifications: {
        basic: !!chrome?.notifications,
        rich: !!chrome?.notifications,
        actions: !!chrome?.notifications,
        images: !!chrome?.notifications,
      },
      windows: {
        create: !!chrome?.windows?.create,
        focus: !!chrome?.windows?.update,
        multiple: true,
        alwaysOnTop: false,
      },
      system: {
        clipboard: !!navigator?.clipboard,
        fileSystem: false,
        hardware: true,
        nativeMenus: false,
      },
      background: {
        serviceWorker: true,
        persistentPages: false,
        alarms: !!chrome?.alarms,
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

  private handleInstalled(details: chrome.runtime.InstalledDetails): void {
    console.log('Extension installed:', details);
  }

  private handleStartup(): void {
    console.log('Extension startup');
  }

  private handleSuspend(): void {
    console.log('Extension suspend');
  }
}

// Check if Chrome extension APIs are available
export const isChromePlatformAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
};
