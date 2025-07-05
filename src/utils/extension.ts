/**
 * Chrome Extension Utilities
 * Provides utility functions for Chrome extension development and functionality
 */

import type {
  ExtensionMessage,
  ExtensionResponse,
  ExtensionSettings,
  StorageData,
  PageContext,
  SmartBookmark,
  ExtensionTask,
  ExtensionError,
  ExtensionDebugInfo,
  MessageAction,
} from '../types/extension';

/**
 * Message Passing Utilities
 */
export class ExtensionMessaging {
  private static instance: ExtensionMessaging;

  static getInstance(): ExtensionMessaging {
    if (!ExtensionMessaging.instance) {
      ExtensionMessaging.instance = new ExtensionMessaging();
    }
    return ExtensionMessaging.instance;
  }

  private constructor() {}

  /**
   * Send message to background script
   */
  async sendToBackground(action: MessageAction, data?: any): Promise<ExtensionResponse> {
    try {
      const message: ExtensionMessage = {
        action,
        data,
        timestamp: Date.now(),
        source: this.detectContext(),
      };

      const response = await chrome.runtime.sendMessage(message);
      return response || { success: false, error: 'No response received' };
    } catch (error) {
      console.error('Failed to send message to background:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Send message to content script
   */
  async sendToContent(
    tabId: number,
    action: MessageAction,
    data?: any
  ): Promise<ExtensionResponse> {
    try {
      const message: ExtensionMessage = {
        action,
        data,
        timestamp: Date.now(),
        source: this.detectContext(),
      };

      const response = await chrome.tabs.sendMessage(tabId, message);
      return response || { success: false, error: 'No response received' };
    } catch (error) {
      console.error('Failed to send message to content script:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Broadcast message to all contexts
   */
  async broadcast(action: MessageAction, data?: any): Promise<ExtensionResponse[]> {
    const results: ExtensionResponse[] = [];

    // Send to background
    try {
      const backgroundResponse = await this.sendToBackground(action, data);
      results.push(backgroundResponse);
    } catch (error) {
      results.push({
        success: false,
        error: 'Failed to reach background',
        timestamp: Date.now(),
      });
    }

    // Send to all tabs
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          try {
            const response = await this.sendToContent(tab.id, action, data);
            results.push(response);
          } catch (error) {
            // Content script might not be injected, ignore errors
          }
        }
      }
    } catch (error) {
      console.error('Failed to query tabs for broadcast:', error);
    }

    return results;
  }

  /**
   * Setup message listener
   */
  onMessage(
    callback: (message: ExtensionMessage, sender: any, sendResponse: Function) => void | boolean
  ): void {
    chrome.runtime.onMessage.addListener(callback);
  }

  /**
   * Detect current extension context
   */
  private detectContext(): 'popup' | 'options' | 'content' | 'background' | 'newtab' {
    if (
      typeof chrome.extension.getBackgroundPage === 'function' &&
      chrome.extension.getBackgroundPage() === window
    ) {
      return 'background';
    }

    if (window.location.pathname.includes('popup.html')) {
      return 'popup';
    }

    if (window.location.pathname.includes('options.html')) {
      return 'options';
    }

    if (window.location.pathname.includes('newtab.html')) {
      return 'newtab';
    }

    return 'content';
  }
}

/**
 * Chrome Storage Utilities
 */
export class ExtensionStorage {
  private static instance: ExtensionStorage;

  static getInstance(): ExtensionStorage {
    if (!ExtensionStorage.instance) {
      ExtensionStorage.instance = new ExtensionStorage();
    }
    return ExtensionStorage.instance;
  }

  private constructor() {}

  /**
   * Get data from local storage
   */
  async getLocal<T = any>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] ?? null;
    } catch (error) {
      console.error(`Failed to get local storage key: ${key}`, error);
      return null;
    }
  }

  /**
   * Set data in local storage
   */
  async setLocal<T = any>(key: string, value: T): Promise<boolean> {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error(`Failed to set local storage key: ${key}`, error);
      return false;
    }
  }

  /**
   * Get data from sync storage
   */
  async getSync<T = any>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.sync.get(key);
      return result[key] ?? null;
    } catch (error) {
      console.error(`Failed to get sync storage key: ${key}`, error);
      return null;
    }
  }

  /**
   * Set data in sync storage
   */
  async setSync<T = any>(key: string, value: T): Promise<boolean> {
    try {
      await chrome.storage.sync.set({ [key]: value });
      return true;
    } catch (error) {
      console.error(`Failed to set sync storage key: ${key}`, error);
      return false;
    }
  }

  /**
   * Get multiple keys from storage
   */
  async getMultiple(keys: string[], useSync = false): Promise<StorageData> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      return await storage.get(keys);
    } catch (error) {
      console.error('Failed to get multiple storage keys:', error);
      return {};
    }
  }

  /**
   * Set multiple key-value pairs
   */
  async setMultiple(data: StorageData, useSync = false): Promise<boolean> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      await storage.set(data);
      return true;
    } catch (error) {
      console.error('Failed to set multiple storage keys:', error);
      return false;
    }
  }

  /**
   * Remove keys from storage
   */
  async remove(keys: string | string[], useSync = false): Promise<boolean> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      await storage.remove(keys);
      return true;
    } catch (error) {
      console.error('Failed to remove storage keys:', error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  async clear(useSync = false): Promise<boolean> {
    try {
      const storage = useSync ? chrome.storage.sync : chrome.storage.local;
      await storage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  async getUsage(): Promise<{
    local: number;
    sync: number;
    localQuota: number;
    syncQuota: number;
  }> {
    try {
      const [localUsage, syncUsage] = await Promise.all([
        chrome.storage.local.getBytesInUse(),
        chrome.storage.sync.getBytesInUse(),
      ]);

      return {
        local: localUsage,
        sync: syncUsage,
        localQuota: chrome.storage.local.QUOTA_BYTES,
        syncQuota: chrome.storage.sync.QUOTA_BYTES,
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { local: 0, sync: 0, localQuota: 0, syncQuota: 0 };
    }
  }

  /**
   * Watch for storage changes
   */
  watchChanges(
    callback: (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void
  ): () => void {
    const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      callback(changes, areaName);
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }
}

/**
 * Permission Management Utilities
 */
export class ExtensionPermissions {
  private static instance: ExtensionPermissions;

  static getInstance(): ExtensionPermissions {
    if (!ExtensionPermissions.instance) {
      ExtensionPermissions.instance = new ExtensionPermissions();
    }
    return ExtensionPermissions.instance;
  }

  private constructor() {}

  /**
   * Check if extension has specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      return await chrome.permissions.contains({ permissions: [permission] });
    } catch (error) {
      console.error(`Failed to check permission: ${permission}`, error);
      return false;
    }
  }

  /**
   * Request permission from user
   */
  async requestPermission(permission: string): Promise<boolean> {
    try {
      return await chrome.permissions.request({ permissions: [permission] });
    } catch (error) {
      console.error(`Failed to request permission: ${permission}`, error);
      return false;
    }
  }

  /**
   * Get all granted permissions
   */
  async getAllPermissions(): Promise<string[]> {
    try {
      const permissions = await chrome.permissions.getAll();
      return permissions.permissions || [];
    } catch (error) {
      console.error('Failed to get all permissions:', error);
      return [];
    }
  }

  /**
   * Remove permission
   */
  async removePermission(permission: string): Promise<boolean> {
    try {
      return await chrome.permissions.remove({ permissions: [permission] });
    } catch (error) {
      console.error(`Failed to remove permission: ${permission}`, error);
      return false;
    }
  }
}

/**
 * Notification Utilities
 */
export class ExtensionNotifications {
  private static instance: ExtensionNotifications;

  static getInstance(): ExtensionNotifications {
    if (!ExtensionNotifications.instance) {
      ExtensionNotifications.instance = new ExtensionNotifications();
    }
    return ExtensionNotifications.instance;
  }

  private constructor() {}

  /**
   * Create notification
   */
  async create(options: {
    title: string;
    message: string;
    iconUrl?: string;
    type?: 'basic' | 'image' | 'list' | 'progress';
    priority?: 0 | 1 | 2;
    requireInteraction?: boolean;
  }): Promise<string | null> {
    try {
      const notificationId = `notification-${Date.now()}`;
      const notificationOptions: chrome.notifications.NotificationOptions = {
        type: options.type || 'basic',
        iconUrl: options.iconUrl || 'icons/icon-48.png',
        title: options.title,
        message: options.message,
        priority: options.priority || 1,
        requireInteraction: options.requireInteraction || false,
      };

      await chrome.notifications.create(notificationId, notificationOptions);
      return notificationId;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  /**
   * Clear notification
   */
  async clear(notificationId: string): Promise<boolean> {
    try {
      return await chrome.notifications.clear(notificationId);
    } catch (error) {
      console.error(`Failed to clear notification: ${notificationId}`, error);
      return false;
    }
  }

  /**
   * Setup notification click handler
   */
  onClicked(callback: (notificationId: string) => void): void {
    chrome.notifications.onClicked.addListener(callback);
  }

  /**
   * Setup notification close handler
   */
  onClosed(callback: (notificationId: string, byUser: boolean) => void): void {
    chrome.notifications.onClosed.addListener(callback);
  }
}

/**
 * Tab Management Utilities
 */
export class ExtensionTabs {
  private static instance: ExtensionTabs;

  static getInstance(): ExtensionTabs {
    if (!ExtensionTabs.instance) {
      ExtensionTabs.instance = new ExtensionTabs();
    }
    return ExtensionTabs.instance;
  }

  private constructor() {}

  /**
   * Get active tab
   */
  async getActiveTab(): Promise<chrome.tabs.Tab | null> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      return tabs[0] || null;
    } catch (error) {
      console.error('Failed to get active tab:', error);
      return null;
    }
  }

  /**
   * Create new tab
   */
  async createTab(url: string, active = true): Promise<chrome.tabs.Tab | null> {
    try {
      return await chrome.tabs.create({ url, active });
    } catch (error) {
      console.error(`Failed to create tab: ${url}`, error);
      return null;
    }
  }

  /**
   * Update tab
   */
  async updateTab(
    tabId: number,
    updateProperties: chrome.tabs.UpdateProperties
  ): Promise<chrome.tabs.Tab | null> {
    try {
      return await chrome.tabs.update(tabId, updateProperties);
    } catch (error) {
      console.error(`Failed to update tab: ${tabId}`, error);
      return null;
    }
  }

  /**
   * Close tab
   */
  async closeTab(tabId: number): Promise<boolean> {
    try {
      await chrome.tabs.remove(tabId);
      return true;
    } catch (error) {
      console.error(`Failed to close tab: ${tabId}`, error);
      return false;
    }
  }

  /**
   * Get all tabs
   */
  async getAllTabs(): Promise<chrome.tabs.Tab[]> {
    try {
      return await chrome.tabs.query({});
    } catch (error) {
      console.error('Failed to get all tabs:', error);
      return [];
    }
  }

  /**
   * Find tabs by URL pattern
   */
  async findTabs(urlPattern: string): Promise<chrome.tabs.Tab[]> {
    try {
      return await chrome.tabs.query({ url: urlPattern });
    } catch (error) {
      console.error(`Failed to find tabs with pattern: ${urlPattern}`, error);
      return [];
    }
  }
}

/**
 * Settings Management Utilities
 */
export class ExtensionSettingsManager {
  private storage = ExtensionStorage.getInstance();
  private static instance: ExtensionSettingsManager;

  static getInstance(): ExtensionSettingsManager {
    if (!ExtensionSettingsManager.instance) {
      ExtensionSettingsManager.instance = new ExtensionSettingsManager();
    }
    return ExtensionSettingsManager.instance;
  }

  private constructor() {}

  /**
   * Get settings
   */
  async getSettings(): Promise<ExtensionSettings> {
    const defaultSettings: ExtensionSettings = {
      autoSyncEnabled: true,
      notificationsEnabled: true,
      newTabOverride: true,
      syncInterval: 300000, // 5 minutes
      theme: 'dark',
      debugMode: false,
      version: '2.0.0',
    };

    const stored = await this.storage.getSync<ExtensionSettings>('extensionSettings');
    return { ...defaultSettings, ...stored };
  }

  /**
   * Update settings
   */
  async updateSettings(updates: Partial<ExtensionSettings>): Promise<boolean> {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    return await this.storage.setSync('extensionSettings', newSettings);
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<boolean> {
    const defaultSettings: ExtensionSettings = {
      autoSyncEnabled: true,
      notificationsEnabled: true,
      newTabOverride: true,
      syncInterval: 300000,
      theme: 'dark',
      debugMode: false,
      version: '2.0.0',
    };

    return await this.storage.setSync('extensionSettings', defaultSettings);
  }
}

/**
 * Error Handling and Logging Utilities
 */
export class ExtensionErrorHandler {
  private static instance: ExtensionErrorHandler;
  private errors: ExtensionError[] = [];

  static getInstance(): ExtensionErrorHandler {
    if (!ExtensionErrorHandler.instance) {
      ExtensionErrorHandler.instance = new ExtensionErrorHandler();
    }
    return ExtensionErrorHandler.instance;
  }

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  /**
   * Log error
   */
  logError(error: Error | string, source?: string, data?: any): void {
    const extensionError: ExtensionError = {
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : error,
      source: (source as any) || 'unknown',
      timestamp: Date.now(),
      stack: error instanceof Error ? error.stack : undefined,
      data,
    };

    this.errors.push(extensionError);
    console.error('Extension Error:', extensionError);

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Store in local storage for debugging
    ExtensionStorage.getInstance().setLocal('extension-errors', this.errors);
  }

  /**
   * Get all errors
   */
  getErrors(): ExtensionError[] {
    return [...this.errors];
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    ExtensionStorage.getInstance().remove('extension-errors');
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.logError(event.reason, 'unhandledrejection', {
        promise: event.promise,
      });
    });

    // Handle runtime errors
    window.addEventListener('error', event => {
      this.logError(event.error || event.message, 'runtime', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }
}

/**
 * Debug and Development Utilities
 */
export class ExtensionDebugger {
  private static instance: ExtensionDebugger;

  static getInstance(): ExtensionDebugger {
    if (!ExtensionDebugger.instance) {
      ExtensionDebugger.instance = new ExtensionDebugger();
    }
    return ExtensionDebugger.instance;
  }

  private constructor() {}

  /**
   * Get comprehensive debug information
   */
  async getDebugInfo(): Promise<ExtensionDebugInfo> {
    const storage = ExtensionStorage.getInstance();
    const permissions = ExtensionPermissions.getInstance();
    const errors = ExtensionErrorHandler.getInstance();

    const [manifest, allPermissions, storageUsage, settings, errorList] = await Promise.all([
      chrome.runtime.getManifest(),
      permissions.getAllPermissions(),
      storage.getUsage(),
      ExtensionSettingsManager.getInstance().getSettings(),
      errors.getErrors(),
    ]);

    return {
      manifest,
      permissions: {
        storage: allPermissions.includes('storage'),
        tabs: allPermissions.includes('tabs'),
        activeTab: allPermissions.includes('activeTab'),
        notifications: allPermissions.includes('notifications'),
        alarms: allPermissions.includes('alarms'),
        contextMenus: allPermissions.includes('contextMenus'),
        bookmarks: allPermissions.includes('bookmarks'),
        history: allPermissions.includes('history'),
        scripting: allPermissions.includes('scripting'),
        unlimitedStorage: allPermissions.includes('unlimitedStorage'),
      },
      capabilities: {
        hasStorage: !!chrome.storage,
        hasNotifications: !!chrome.notifications,
        hasContextMenus: !!chrome.contextMenus,
        hasBookmarks: !!chrome.bookmarks,
        hasHistory: !!chrome.history,
        hasActiveTab: allPermissions.includes('activeTab'),
        hasTabs: !!chrome.tabs,
        hasScripting: !!chrome.scripting,
        hasAlarms: !!chrome.alarms,
        hasUnlimitedStorage: allPermissions.includes('unlimitedStorage'),
      },
      performance: {
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        storageUsage: storageUsage.local,
        backgroundCPU: 0, // Would need performance monitoring
        popupLoadTime: 0, // Would need timing measurement
        contentScriptCount: 0, // Would need tab querying
        messageCount: 0, // Would need message counting
        errorCount: errorList.length,
        lastUpdated: Date.now(),
      },
      errors: errorList,
      state: {
        isInitialized: true,
        activeWorkspace: null,
        lastSyncTime: 0,
        pendingOperations: new Map(),
        version: settings.version,
      },
      storage: {
        bytesInUse: storageUsage.local,
        quotaBytes: storageUsage.localQuota,
        itemCount: 0, // Would need counting
        percentageUsed: (storageUsage.local / storageUsage.localQuota) * 100,
      },
    };
  }

  /**
   * Export debug information as JSON
   */
  async exportDebugInfo(): Promise<string> {
    const debugInfo = await this.getDebugInfo();
    return JSON.stringify(debugInfo, null, 2);
  }

  /**
   * Test extension functionality
   */
  async runDiagnostics(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    // Test storage
    try {
      await chrome.storage.local.set({ 'test-key': 'test-value' });
      const result = await chrome.storage.local.get('test-key');
      results.storage = result['test-key'] === 'test-value';
      await chrome.storage.local.remove('test-key');
    } catch (error) {
      results.storage = false;
    }

    // Test messaging
    try {
      const response = await ExtensionMessaging.getInstance().sendToBackground('ping');
      results.messaging = response.success;
    } catch (error) {
      results.messaging = false;
    }

    // Test tabs API
    try {
      await chrome.tabs.query({ active: true });
      results.tabs = true;
    } catch (error) {
      results.tabs = false;
    }

    // Test notifications
    try {
      const notificationId = await chrome.notifications.create('test', {
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Test',
        message: 'Test notification',
      });
      results.notifications = !!notificationId;
      if (notificationId) {
        await chrome.notifications.clear(notificationId);
      }
    } catch (error) {
      results.notifications = false;
    }

    return results;
  }
}

// Export singleton instances for easy access
export const extensionMessaging = ExtensionMessaging.getInstance();
export const extensionStorage = ExtensionStorage.getInstance();
export const extensionPermissions = ExtensionPermissions.getInstance();
export const extensionNotifications = ExtensionNotifications.getInstance();
export const extensionTabs = ExtensionTabs.getInstance();
export const extensionSettings = ExtensionSettingsManager.getInstance();
export const extensionErrorHandler = ExtensionErrorHandler.getInstance();
export const extensionDebugger = ExtensionDebugger.getInstance();

// Global error handler setup
if (typeof window !== 'undefined') {
  // Initialize error handler
  extensionErrorHandler;

  // Expose debug utilities in development
  if (process.env.NODE_ENV === 'development') {
    (window as any).__LUCAVERSE_EXTENSION_DEBUG__ = {
      messaging: extensionMessaging,
      storage: extensionStorage,
      permissions: extensionPermissions,
      notifications: extensionNotifications,
      tabs: extensionTabs,
      settings: extensionSettings,
      errorHandler: extensionErrorHandler,
      debugger: extensionDebugger,
    };
  }
}
