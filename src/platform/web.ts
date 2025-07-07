/**
 * Web Platform Implementation
 * Provides web browser API wrappers with localStorage and modern web APIs
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

// Web Storage Implementation
class WebStorageAPI implements StorageAPI {
  private listeners: Set<(changes: StorageChange[]) => void> = new Set();
  private storageKey = 'lucaverse_hub_';

  constructor() {
    // Listen for storage events from other tabs
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = this.storageKey + key;
      const value = localStorage.getItem(fullKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Web storage get error:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.storageKey + key;
      const oldValue = localStorage.getItem(fullKey);
      const newValue = JSON.stringify(value);

      localStorage.setItem(fullKey, newValue);

      // Emit change event
      this.emitStorageChange(key, oldValue ? JSON.parse(oldValue) : undefined, value);
    } catch (error) {
      console.error('Web storage set error:', error);
      throw new Error(`Failed to set storage key: ${key}`);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const fullKey = this.storageKey + key;
      const oldValue = localStorage.getItem(fullKey);

      localStorage.removeItem(fullKey);

      // Emit change event
      if (oldValue) {
        this.emitStorageChange(key, JSON.parse(oldValue), undefined);
      }
    } catch (error) {
      console.error('Web storage remove error:', error);
      throw new Error(`Failed to remove storage key: ${key}`);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storageKey)) {
          keys.push(key.substring(this.storageKey.length));
        }
      }

      // Remove all our keys
      keys.forEach(key => localStorage.removeItem(this.storageKey + key));

      // Emit change events
      keys.forEach(key => this.emitStorageChange(key, undefined, undefined));
    } catch (error) {
      console.error('Web storage clear error:', error);
      throw new Error('Failed to clear storage');
    }
  }

  watch(callback: (changes: StorageChange[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async getSize(): Promise<number> {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storageKey)) {
          const value = localStorage.getItem(key);
          totalSize += (key.length + (value?.length || 0)) * 2; // UTF-16 encoding
        }
      }
      return totalSize;
    } catch (error) {
      console.error('Web storage getSize error:', error);
      return 0;
    }
  }

  async getQuota(): Promise<number> {
    try {
      // Estimate localStorage quota (usually 5-10MB)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.quota || 5242880; // 5MB default
      }
      return 5242880; // 5MB default
    } catch (error) {
      return 5242880; // 5MB default
    }
  }

  private emitStorageChange(key: string, oldValue: any, newValue: any): void {
    const change: StorageChange = {
      key,
      oldValue,
      newValue,
      storageArea: 'local',
    };

    this.listeners.forEach(callback => callback([change]));
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key?.startsWith(this.storageKey)) {
      const key = event.key.substring(this.storageKey.length);
      const change: StorageChange = {
        key,
        oldValue: event.oldValue ? JSON.parse(event.oldValue) : undefined,
        newValue: event.newValue ? JSON.parse(event.newValue) : undefined,
        storageArea: 'local',
      };

      this.listeners.forEach(callback => callback([change]));
    }
  }
}

// Web Notifications Implementation
class WebNotificationAPI implements NotificationAPI {
  private clickListeners: Set<(notificationId: string) => void> = new Set();
  private closeListeners: Set<(notificationId: string, byUser: boolean) => void> = new Set();
  private notifications: Map<string, Notification> = new Map();
  private notificationCounter = 0;

  async create(options: NotificationOptions): Promise<string | null> {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') return null;

      const notificationId = `web_notification_${++this.notificationCounter}`;

      const notification = new Notification(options.title, {
        body: options.message,
        icon: options.iconUrl || '/assets/icon-48.png',
        image: options.imageUrl,
        silent: options.silent,
        requireInteraction: options.requireInteraction,
        tag: notificationId,
      });

      notification.onclick = () => {
        this.clickListeners.forEach(callback => callback(notificationId));
      };

      notification.onclose = () => {
        this.closeListeners.forEach(callback => callback(notificationId, true));
        this.notifications.delete(notificationId);
      };

      this.notifications.set(notificationId, notification);
      return notificationId;
    } catch (error) {
      console.error('Web notification create error:', error);
      return null;
    }
  }

  async update(id: string, options: Partial<NotificationOptions>): Promise<boolean> {
    try {
      // Web Notification API doesn't support updating existing notifications
      // Close existing and create new one
      const existing = this.notifications.get(id);
      if (existing) {
        existing.close();
        this.notifications.delete(id);
      }

      if (options.title && options.message) {
        const newId = await this.create({
          title: options.title,
          message: options.message,
          iconUrl: options.iconUrl,
          imageUrl: options.imageUrl,
          silent: options.silent,
          requireInteraction: options.requireInteraction,
        });

        if (newId) {
          // Replace the old notification with new one using same ID
          const newNotification = this.notifications.get(newId);
          if (newNotification) {
            this.notifications.delete(newId);
            this.notifications.set(id, newNotification);
          }
        }

        return !!newId;
      }

      return false;
    } catch (error) {
      console.error('Web notification update error:', error);
      return false;
    }
  }

  async clear(id: string): Promise<boolean> {
    try {
      const notification = this.notifications.get(id);
      if (notification) {
        notification.close();
        this.notifications.delete(id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Web notification clear error:', error);
      return false;
    }
  }

  async getAll(): Promise<NotificationInfo[]> {
    return Array.from(this.notifications.entries()).map(([id, notification]) => ({
      id,
      title: notification.title,
      message: notification.body,
      timestamp: Date.now(),
    }));
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
    try {
      if (!('Notification' in window)) {
        return 'denied';
      }

      let permission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      return permission;
    } catch (error) {
      console.error('Web notification permission error:', error);
      return 'denied';
    }
  }
}

// Web Window Implementation (Limited)
class WebWindowAPI implements WindowAPI {
  private createListeners: Set<(window: WindowInfo) => void> = new Set();
  private removeListeners: Set<(windowId: string) => void> = new Set();
  private focusListeners: Set<(windowId: string) => void> = new Set();
  private windows: Map<string, Window> = new Map();
  private windowCounter = 0;

  constructor() {
    // Listen for window focus events
    window.addEventListener('focus', () => {
      this.focusListeners.forEach(callback => callback('main'));
    });

    // Listen for beforeunload to detect window closing
    window.addEventListener('beforeunload', () => {
      this.removeListeners.forEach(callback => callback('main'));
    });
  }

  async create(options: WindowCreateOptions): Promise<WindowInfo> {
    try {
      const windowId = `web_window_${++this.windowCounter}`;
      const features = this.buildWindowFeatures(options);

      const newWindow = window.open(options.url || 'about:blank', windowId, features);

      if (!newWindow) {
        throw new Error('Failed to create window - popup blocked');
      }

      this.windows.set(windowId, newWindow);

      const windowInfo: WindowInfo = {
        id: windowId,
        focused: options.focused !== false,
        top: options.top || 0,
        left: options.left || 0,
        width: options.width || 800,
        height: options.height || 600,
        incognito: false,
        type: options.type || 'normal',
        state: 'normal',
        alwaysOnTop: false,
      };

      this.createListeners.forEach(callback => callback(windowInfo));
      return windowInfo;
    } catch (error) {
      console.error('Web window create error:', error);
      throw new Error('Failed to create window');
    }
  }

  async update(windowId: string, options: WindowUpdateOptions): Promise<WindowInfo> {
    try {
      const targetWindow = this.windows.get(windowId) || window;

      if (options.width !== undefined && options.height !== undefined) {
        targetWindow.resizeTo(options.width, options.height);
      }

      if (options.left !== undefined && options.top !== undefined) {
        targetWindow.moveTo(options.left, options.top);
      }

      if (options.focused) {
        targetWindow.focus();
      }

      return this.getWindowInfo(windowId, targetWindow);
    } catch (error) {
      console.error('Web window update error:', error);
      throw new Error('Failed to update window');
    }
  }

  async close(windowId: string): Promise<void> {
    try {
      const targetWindow = this.windows.get(windowId);
      if (targetWindow && !targetWindow.closed) {
        targetWindow.close();
        this.windows.delete(windowId);
        this.removeListeners.forEach(callback => callback(windowId));
      }
    } catch (error) {
      console.error('Web window close error:', error);
      throw new Error('Failed to close window');
    }
  }

  async focus(windowId: string): Promise<void> {
    try {
      const targetWindow = this.windows.get(windowId) || window;
      targetWindow.focus();
      this.focusListeners.forEach(callback => callback(windowId));
    } catch (error) {
      console.error('Web window focus error:', error);
      throw new Error('Failed to focus window');
    }
  }

  async getCurrent(): Promise<WindowInfo> {
    return this.getWindowInfo('main', window);
  }

  async getAll(): Promise<WindowInfo[]> {
    const windows: WindowInfo[] = [this.getWindowInfo('main', window)];

    this.windows.forEach((win, id) => {
      if (!win.closed) {
        windows.push(this.getWindowInfo(id, win));
      } else {
        this.windows.delete(id);
      }
    });

    return windows;
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

  private buildWindowFeatures(options: WindowCreateOptions): string {
    const features: string[] = [];

    if (options.width) features.push(`width=${options.width}`);
    if (options.height) features.push(`height=${options.height}`);
    if (options.left) features.push(`left=${options.left}`);
    if (options.top) features.push(`top=${options.top}`);

    features.push('menubar=no');
    features.push('toolbar=no');
    features.push('location=no');
    features.push('status=no');
    features.push('scrollbars=yes');
    features.push('resizable=yes');

    return features.join(',');
  }

  private getWindowInfo(id: string, win: Window): WindowInfo {
    return {
      id,
      focused: document.hasFocus(),
      top: win.screenY || 0,
      left: win.screenX || 0,
      width: win.outerWidth || 800,
      height: win.outerHeight || 600,
      incognito: false,
      type: 'normal',
      state: 'normal',
      alwaysOnTop: false,
    };
  }
}

// Web Clipboard Implementation
class WebClipboardAPI implements ClipboardAPI {
  async read(): Promise<string> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        return await navigator.clipboard.readText();
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      console.error('Web clipboard read error:', error);
      throw new Error('Failed to read clipboard');
    }
  }

  async write(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Web clipboard write error:', error);
      throw new Error('Failed to write to clipboard');
    }
  }

  async readImage(): Promise<Blob | null> {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              return await item.getType(type);
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Web clipboard readImage error:', error);
      return null;
    }
  }

  async writeImage(blob: Blob): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
      } else {
        throw new Error('Image clipboard not supported');
      }
    } catch (error) {
      console.error('Web clipboard writeImage error:', error);
      throw new Error('Failed to write image to clipboard');
    }
  }
}

// Web File System Implementation (Limited)
class WebFileSystemAPI implements FileSystemAPI {
  async readFile(path: string): Promise<string> {
    throw new Error('Direct file system access not available in web browsers');
  }

  async writeFile(path: string, content: string): Promise<void> {
    throw new Error('Direct file system access not available in web browsers');
  }

  async exists(path: string): Promise<boolean> {
    return false;
  }

  async createDirectory(path: string): Promise<void> {
    throw new Error('Directory creation not available in web browsers');
  }

  async listFiles(path: string): Promise<string[]> {
    return [];
  }

  async showOpenDialog(options?: FileDialogOptions): Promise<string[]> {
    try {
      // Use File System Access API if available
      if ('showOpenFilePicker' in window) {
        const pickerOptions: any = {
          multiple: options?.properties?.includes('multiSelections') || false,
          types: options?.filters?.map(filter => ({
            description: filter.name,
            accept: {
              'application/octet-stream': filter.extensions.map(ext => `.${ext}`),
            },
          })),
        };

        const fileHandles = await (window as any).showOpenFilePicker(pickerOptions);
        return fileHandles.map((handle: any) => handle.name);
      } else {
        // Fallback to HTML file input
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
    } catch (error) {
      console.error('Web file dialog error:', error);
      return [];
    }
  }

  async showSaveDialog(options?: FileDialogOptions): Promise<string | null> {
    try {
      // Use File System Access API if available
      if ('showSaveFilePicker' in window) {
        const pickerOptions: any = {
          suggestedName: options?.defaultPath || 'file.txt',
          types: options?.filters?.map(filter => ({
            description: filter.name,
            accept: {
              'application/octet-stream': filter.extensions.map(ext => `.${ext}`),
            },
          })),
        };

        const fileHandle = await (window as any).showSaveFilePicker(pickerOptions);
        return fileHandle.name;
      } else {
        // Return suggested filename for fallback
        return options?.defaultPath || 'file.txt';
      }
    } catch (error) {
      console.error('Web save dialog error:', error);
      return null;
    }
  }
}

// Web Hardware API Implementation
class WebHardwareAPI implements HardwareAPI {
  async getBatteryLevel(): Promise<number | null> {
    try {
      // @ts-ignore - Battery API may not be available in all browsers
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      }
      return null;
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
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      return connection?.effectiveType || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  async getCPUUsage(): Promise<number> {
    // Web browsers cannot directly access CPU usage
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
      console.error('Web memory usage error:', error);
    }

    return { used: 0, total: 0, available: 0 };
  }
}

// Web System API Implementation
class WebSystemAPI implements SystemAPI {
  readonly clipboard: ClipboardAPI;
  readonly fileSystem: FileSystemAPI;
  readonly hardware: HardwareAPI;

  constructor() {
    this.clipboard = new WebClipboardAPI();
    this.fileSystem = new WebFileSystemAPI();
    this.hardware = new WebHardwareAPI();
  }

  async getInfo(): Promise<SystemInfo> {
    return {
      platform: 'web',
      arch: 'unknown',
      version: '1.0.0',
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

// Main Web Platform API
export class WebPlatformAPI implements PlatformAPI {
  readonly type = 'web' as const;
  readonly storage: StorageAPI;
  readonly notifications: NotificationAPI;
  readonly windows: WindowAPI;
  readonly system: SystemAPI;

  private errorListeners: Set<(error: PlatformError) => void> = new Set();
  private serviceWorker: ServiceWorker | null = null;

  constructor() {
    this.storage = new WebStorageAPI();
    this.notifications = new WebNotificationAPI();
    this.windows = new WebWindowAPI();
    this.system = new WebSystemAPI();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize service worker if available
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          this.serviceWorker = registration.active;
          console.log('Service worker registered');
        } catch (error) {
          console.warn('Service worker registration failed:', error);
        }
      }

      // Listen for online/offline events
      window.addEventListener('online', () => {
        console.log('Browser went online');
      });

      window.addEventListener('offline', () => {
        console.log('Browser went offline');
      });

      // Listen for visibility changes
      document.addEventListener('visibilitychange', () => {
        console.log('Visibility changed:', document.visibilityState);
      });

      console.log('Web platform initialized');
    } catch (error) {
      this.emitError('INIT_FAILED', 'Failed to initialize web platform', error as Error);
      throw error;
    }
  }

  getCapabilities(): PlatformCapabilities {
    return {
      storage: {
        local: true,
        sync: false,
        managed: false,
        unlimited: false,
      },
      notifications: {
        basic: 'Notification' in window,
        rich: 'Notification' in window,
        actions: false,
        images: 'Notification' in window,
      },
      windows: {
        create: true,
        focus: true,
        multiple: true,
        alwaysOnTop: false,
      },
      system: {
        clipboard: !!navigator.clipboard,
        fileSystem: 'showOpenFilePicker' in window,
        hardware: true,
        nativeMenus: false,
      },
      background: {
        serviceWorker: 'serviceWorker' in navigator,
        persistentPages: true,
        alarms: false,
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

// Check if web platform is available
export const isWebPlatformAvailable = (): boolean => {
  return (
    typeof window !== 'undefined' && typeof document !== 'undefined' && !window.chrome?.runtime?.id
  );
};
