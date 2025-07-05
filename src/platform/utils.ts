/**
 * Platform Utilities and Helpers
 * Common operations and utilities for cross-platform functionality
 */

import { PlatformAPI, StorageAPI, NotificationAPI, PlatformType } from './base.ts';
import { getPlatformAPI } from './index.ts';

// Storage Management Utilities
export class StorageManager {
  private api: StorageAPI;
  
  constructor(storageAPI: StorageAPI) {
    this.api = storageAPI;
  }

  // Batch operations
  async setBatch(items: Record<string, any>): Promise<void> {
    const promises = Object.entries(items).map(([key, value]) => 
      this.api.set(key, value)
    );
    await Promise.all(promises);
  }

  async getBatch<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    const promises = keys.map(async key => [key, await this.api.get<T>(key)] as const);
    const results = await Promise.all(promises);
    return Object.fromEntries(results);
  }

  async removeBatch(keys: string[]): Promise<void> {
    const promises = keys.map(key => this.api.remove(key));
    await Promise.all(promises);
  }

  // Size management
  async getStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
    const [used, quota] = await Promise.all([
      this.api.getSize(),
      this.api.getQuota()
    ]);
    
    return {
      used,
      quota,
      percentage: quota > 0 ? (used / quota) * 100 : 0
    };
  }

  async isStorageAvailable(requiredBytes: number = 0): Promise<boolean> {
    const usage = await this.getStorageUsage();
    const available = usage.quota - usage.used;
    return available >= requiredBytes;
  }

  // Data migration utilities
  async migrateData(migrations: Array<{ from: string; to: string; transform?: (data: any) => any }>): Promise<void> {
    for (const migration of migrations) {
      try {
        const data = await this.api.get(migration.from);
        if (data !== null) {
          const transformedData = migration.transform ? migration.transform(data) : data;
          await this.api.set(migration.to, transformedData);
          await this.api.remove(migration.from);
        }
      } catch (error) {
        console.error(`Migration failed for ${migration.from} -> ${migration.to}:`, error);
      }
    }
  }

  // JSON schema validation
  async setWithValidation<T>(key: string, value: T, validator?: (data: T) => boolean): Promise<void> {
    if (validator && !validator(value)) {
      throw new Error(`Validation failed for key: ${key}`);
    }
    await this.api.set(key, value);
  }

  // Versioned storage
  async setVersioned<T>(key: string, value: T, version: number = 1): Promise<void> {
    const versionedData = {
      data: value,
      version,
      timestamp: Date.now()
    };
    await this.api.set(key, versionedData);
  }

  async getVersioned<T>(key: string, expectedVersion?: number): Promise<T | null> {
    const versionedData = await this.api.get(key);
    if (!versionedData || typeof versionedData !== 'object' || !('data' in versionedData)) {
      return null;
    }

    if (expectedVersion && versionedData.version !== expectedVersion) {
      throw new Error(`Version mismatch for key ${key}: expected ${expectedVersion}, got ${versionedData.version}`);
    }

    return versionedData.data;
  }
}

// Notification Queue Management
export class NotificationQueue {
  private api: NotificationAPI;
  private queue: Array<{ options: any; resolve: Function; reject: Function }> = [];
  private isProcessing = false;
  private rateLimitDelay = 1000; // 1 second between notifications
  private maxRetries = 3;

  constructor(notificationAPI: NotificationAPI) {
    this.api = notificationAPI;
  }

  async enqueue(options: any): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.queue.push({ options, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const result = await this.createWithRetry(item.options);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Rate limiting
      if (this.queue.length > 0) {
        await this.delay(this.rateLimitDelay);
      }
    }

    this.isProcessing = false;
  }

  private async createWithRetry(options: any, attempt: number = 1): Promise<string | null> {
    try {
      return await this.api.create(options);
    } catch (error) {
      if (attempt < this.maxRetries) {
        await this.delay(attempt * 1000); // Exponential backoff
        return this.createWithRetry(options, attempt + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setRateLimit(delayMs: number): void {
    this.rateLimitDelay = delayMs;
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue.forEach(item => item.reject(new Error('Queue cleared')));
    this.queue = [];
  }
}

// Cross-platform Keyboard Shortcuts
export class KeyboardShortcuts {
  private platform: PlatformType;
  private handlers: Map<string, Function> = new Map();

  constructor(platform: PlatformType) {
    this.platform = platform;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const shortcut = this.getShortcutString(event);
    const handler = this.handlers.get(shortcut);
    
    if (handler) {
      event.preventDefault();
      handler(event);
    }
  }

  private getShortcutString(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey || (this.platform === 'chrome' && event.metaKey)) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey && this.platform !== 'chrome') parts.push('Meta');
    
    parts.push(event.key);
    
    return parts.join('+');
  }

  register(shortcut: string, handler: Function): () => void {
    // Normalize shortcut for platform
    const normalizedShortcut = this.normalizeShortcut(shortcut);
    this.handlers.set(normalizedShortcut, handler);
    
    return () => this.handlers.delete(normalizedShortcut);
  }

  private normalizeShortcut(shortcut: string): string {
    // Convert platform-specific modifiers
    let normalized = shortcut;
    
    if (this.platform === 'chrome') {
      normalized = normalized.replace(/Cmd\+/g, 'Ctrl+');
    } else if (this.platform === 'web') {
      if (navigator.platform.includes('Mac')) {
        normalized = normalized.replace(/Ctrl\+/g, 'Meta+');
      }
    }
    
    return normalized;
  }

  unregisterAll(): void {
    this.handlers.clear();
  }
}

// Window State Persistence
export class WindowStatePersistence {
  private storage: StorageAPI;
  private storageKey: string;

  constructor(storageAPI: StorageAPI, storageKey: string = 'window_state') {
    this.storage = storageAPI;
    this.storageKey = storageKey;
  }

  async saveWindowState(windowId: string, state: any): Promise<void> {
    const allStates = await this.storage.get(this.storageKey) || {};
    allStates[windowId] = {
      ...state,
      timestamp: Date.now()
    };
    await this.storage.set(this.storageKey, allStates);
  }

  async getWindowState(windowId: string): Promise<any | null> {
    const allStates = await this.storage.get(this.storageKey) || {};
    return allStates[windowId] || null;
  }

  async removeWindowState(windowId: string): Promise<void> {
    const allStates = await this.storage.get(this.storageKey) || {};
    delete allStates[windowId];
    await this.storage.set(this.storageKey, allStates);
  }

  async cleanupOldStates(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const allStates = await this.storage.get(this.storageKey) || {};
    const now = Date.now();
    
    Object.keys(allStates).forEach(windowId => {
      const state = allStates[windowId];
      if (state.timestamp && (now - state.timestamp) > maxAge) {
        delete allStates[windowId];
      }
    });
    
    await this.storage.set(this.storageKey, allStates);
  }
}

// Platform-specific Error Handling
export class PlatformErrorHandler {
  private platform: PlatformType;
  private errorHandlers: Map<string, Function> = new Map();

  constructor(platform: PlatformType) {
    this.platform = platform;
    this.setupDefaultHandlers();
  }

  private setupDefaultHandlers(): void {
    // Chrome extension specific errors
    if (this.platform === 'chrome') {
      this.registerHandler('QUOTA_EXCEEDED', this.handleQuotaExceeded.bind(this));
      this.registerHandler('CONTEXT_INVALIDATED', this.handleContextInvalidated.bind(this));
    }
    
    // Web platform specific errors
    if (this.platform === 'web') {
      this.registerHandler('STORAGE_QUOTA_EXCEEDED', this.handleWebStorageQuota.bind(this));
      this.registerHandler('NOTIFICATION_PERMISSION_DENIED', this.handleNotificationPermission.bind(this));
    }
    
    // Electron specific errors
    if (this.platform === 'electron') {
      this.registerHandler('IPC_ERROR', this.handleIPCError.bind(this));
      this.registerHandler('MAIN_PROCESS_ERROR', this.handleMainProcessError.bind(this));
    }
  }

  registerHandler(errorCode: string, handler: Function): void {
    this.errorHandlers.set(errorCode, handler);
  }

  async handleError(error: any): Promise<boolean> {
    const handler = this.errorHandlers.get(error.code);
    if (handler) {
      try {
        await handler(error);
        return true;
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    }
    return false;
  }

  private async handleQuotaExceeded(error: any): Promise<void> {
    console.warn('Chrome storage quota exceeded, attempting cleanup...');
    // Implement cleanup logic
  }

  private async handleContextInvalidated(error: any): Promise<void> {
    console.warn('Chrome extension context invalidated, reloading...');
    if (chrome?.runtime?.reload) {
      chrome.runtime.reload();
    }
  }

  private async handleWebStorageQuota(error: any): Promise<void> {
    console.warn('Web storage quota exceeded, clearing old data...');
    // Implement web storage cleanup
  }

  private async handleNotificationPermission(error: any): Promise<void> {
    console.warn('Notification permission denied, requesting permission...');
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  }

  private async handleIPCError(error: any): Promise<void> {
    console.warn('Electron IPC error, retrying...');
    // Implement IPC retry logic
  }

  private async handleMainProcessError(error: any): Promise<void> {
    console.error('Electron main process error:', error);
    // Implement main process error handling
  }
}

// Utility factory function
export async function createPlatformUtils(): Promise<{
  storage: StorageManager;
  notifications: NotificationQueue;
  shortcuts: KeyboardShortcuts;
  windowState: WindowStatePersistence;
  errorHandler: PlatformErrorHandler;
}> {
  const platformAPI = await getPlatformAPI();
  
  return {
    storage: new StorageManager(platformAPI.storage),
    notifications: new NotificationQueue(platformAPI.notifications),
    shortcuts: new KeyboardShortcuts(platformAPI.type),
    windowState: new WindowStatePersistence(platformAPI.storage),
    errorHandler: new PlatformErrorHandler(platformAPI.type)
  };
}

// Convenience functions
export async function withStorageManager<T>(fn: (storage: StorageManager) => Promise<T>): Promise<T> {
  const platformAPI = await getPlatformAPI();
  const storage = new StorageManager(platformAPI.storage);
  return fn(storage);
}

export async function withNotificationQueue<T>(fn: (queue: NotificationQueue) => Promise<T>): Promise<T> {
  const platformAPI = await getPlatformAPI();
  const queue = new NotificationQueue(platformAPI.notifications);
  return fn(queue);
}

// Platform detection helpers
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

// Performance monitoring
export class PlatformPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  recordMetric(operation: string, value: number): void {
    const existing = this.metrics.get(operation) || [];
    existing.push(value);
    
    // Keep only last 100 measurements
    if (existing.length > 100) {
      existing.shift();
    }
    
    this.metrics.set(operation, existing);
  }

  getMetrics(operation: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(operation);
    if (!values || values.length === 0) return null;
    
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  getAllMetrics(): Record<string, ReturnType<PlatformPerformanceMonitor['getMetrics']>> {
    const result: Record<string, any> = {};
    for (const [operation] of this.metrics) {
      result[operation] = this.getMetrics(operation);
    }
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PlatformPerformanceMonitor();