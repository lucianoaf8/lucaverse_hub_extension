/**
 * Platform API Index - Conditional Loading and Factory
 * Provides unified platform API access with automatic platform detection
 */

import { PlatformAPI, PlatformType, PlatformError, PlatformConfig } from './base.ts';
import {
  detectPlatformWithOverrides,
  getPlatformOverride,
  setPlatformOverride,
  logPlatformInfo,
  type PlatformOverride,
  type PlatformDetectionResult,
} from './detector.ts';

// Platform implementations - lazy loaded
let ChromePlatformAPI: any = null;
let WebPlatformAPI: any = null;
let ElectronPlatformAPI: any = null;

// Lazy loading functions
async function loadChromePlatform() {
  if (!ChromePlatformAPI) {
    const module = await import('./chrome.ts');
    ChromePlatformAPI = module.ChromePlatformAPI;
  }
  return ChromePlatformAPI;
}

async function loadWebPlatform() {
  if (!WebPlatformAPI) {
    const module = await import('./web.ts');
    WebPlatformAPI = module.WebPlatformAPI;
  }
  return WebPlatformAPI;
}

async function loadElectronPlatform() {
  if (!ElectronPlatformAPI) {
    const module = await import('./electron.ts');
    ElectronPlatformAPI = module.ElectronPlatformAPI;
  }
  return ElectronPlatformAPI;
}

// Platform factory configuration
interface PlatformFactoryConfig extends PlatformConfig {
  autoInitialize?: boolean;
  fallbackPlatform?: PlatformType;
  retryAttempts?: number;
  retryDelay?: number;
}

const defaultConfig: PlatformFactoryConfig = {
  autoInitialize: true,
  fallbackPlatform: 'web',
  retryAttempts: 3,
  retryDelay: 1000,
  enableSync: true,
  debugMode: false,
};

// Platform Factory Class
class PlatformFactory {
  private currentAPI: PlatformAPI | null = null;
  private config: PlatformFactoryConfig;
  private initializationPromise: Promise<PlatformAPI> | null = null;
  private errorListeners: Set<(error: PlatformError) => void> = new Set();
  private reinitializationCount = 0;

  constructor(config: Partial<PlatformFactoryConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Get or create platform API instance
  async getPlatformAPI(): Promise<PlatformAPI> {
    if (this.currentAPI) {
      return this.currentAPI;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.createPlatformAPI();
    return this.initializationPromise;
  }

  // Create platform API with error handling and retries
  private async createPlatformAPI(): Promise<PlatformAPI> {
    const detection = detectPlatformWithOverrides();

    if (this.config.debugMode) {
      logPlatformInfo();
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const api = await this.instantiatePlatform(detection.type);

        if (this.config.autoInitialize) {
          await api.initialize();
        }

        // Setup error forwarding
        api.onError(error => {
          this.handlePlatformError(error);
        });

        this.currentAPI = api;
        this.initializationPromise = null;

        if (this.config.debugMode) {
          console.log(`✅ Platform API initialized: ${detection.type} (attempt ${attempt})`);
        }

        return api;
      } catch (error) {
        lastError = error as Error;

        if (this.config.debugMode) {
          console.warn(`❌ Platform initialization failed (attempt ${attempt}):`, error);
        }

        if (attempt < this.config.retryAttempts!) {
          await this.delay(this.config.retryDelay!);
        }
      }
    }

    // All attempts failed, try fallback platform
    if (detection.type !== this.config.fallbackPlatform) {
      if (this.config.debugMode) {
        console.warn(`🔄 Falling back to ${this.config.fallbackPlatform} platform`);
      }

      try {
        const fallbackAPI = await this.instantiatePlatform(this.config.fallbackPlatform!);

        if (this.config.autoInitialize) {
          await fallbackAPI.initialize();
        }

        fallbackAPI.onError(error => {
          this.handlePlatformError(error);
        });

        this.currentAPI = fallbackAPI;
        this.initializationPromise = null;

        return fallbackAPI;
      } catch (fallbackError) {
        const combinedError = new Error(
          `Failed to initialize both ${detection.type} and fallback ${this.config.fallbackPlatform} platforms. ` +
            `Last error: ${lastError?.message}. Fallback error: ${(fallbackError as Error).message}`
        );

        this.emitError('PLATFORM_INIT_FAILED', combinedError.message, combinedError);
        throw combinedError;
      }
    }

    const finalError = new Error(
      `Failed to initialize ${detection.type} platform after ${this.config.retryAttempts} attempts: ${lastError?.message}`
    );
    this.emitError('PLATFORM_INIT_FAILED', finalError.message, finalError);
    throw finalError;
  }

  // Instantiate specific platform implementation
  private async instantiatePlatform(type: PlatformType): Promise<PlatformAPI> {
    switch (type) {
      case 'chrome': {
        const ChromeAPI = await loadChromePlatform();
        return new ChromeAPI();
      }
      case 'electron': {
        const ElectronAPI = await loadElectronPlatform();
        return new ElectronAPI();
      }
      case 'web':
      default: {
        const WebAPI = await loadWebPlatform();
        return new WebAPI();
      }
    }
  }

  // Handle platform-specific errors
  private handlePlatformError(error: PlatformError): void {
    if (this.config.debugMode) {
      console.error('Platform error:', error);
    }

    // Emit error to listeners
    this.emitError(error.code, error.message, error.originalError, error.feature);

    // Handle critical errors that might require reinitialization
    if (this.shouldReinitialize(error)) {
      this.reinitialize();
    }
  }

  // Determine if error requires reinitialization
  private shouldReinitialize(error: PlatformError): boolean {
    const criticalErrors = ['STORAGE_QUOTA_EXCEEDED', 'PERMISSION_DENIED', 'CONTEXT_INVALIDATED'];

    return criticalErrors.includes(error.code) && this.reinitializationCount < 3;
  }

  // Reinitialize platform API
  async reinitialize(): Promise<void> {
    this.reinitializationCount++;

    if (this.config.debugMode) {
      console.log(`🔄 Reinitializing platform API (attempt ${this.reinitializationCount})`);
    }

    // Clean up current instance
    this.currentAPI = null;
    this.initializationPromise = null;

    // Trigger reinitialization
    try {
      await this.getPlatformAPI();
    } catch (error) {
      if (this.config.debugMode) {
        console.error('Reinitialization failed:', error);
      }
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<PlatformFactoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Add error listener
  onError(callback: (error: PlatformError) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  // Emit error to all listeners
  private emitError(code: string, message: string, originalError?: Error, feature?: string): void {
    const error: PlatformError = {
      code,
      message,
      platform: this.currentAPI?.type || 'unknown',
      feature,
      originalError,
    };

    this.errorListeners.forEach(callback => callback(error));
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current platform type
  getCurrentPlatformType(): PlatformType | null {
    return this.currentAPI?.type || null;
  }

  // Check if platform API is ready
  isReady(): boolean {
    return this.currentAPI !== null;
  }

  // Force platform change (for testing)
  async changePlatform(type: PlatformType): Promise<void> {
    if (this.config.debugMode) {
      console.log(`🔄 Forcing platform change to: ${type}`);
    }

    // Clean up current instance
    this.currentAPI = null;
    this.initializationPromise = null;

    // Set override and reinitialize
    setPlatformOverride({ forcePlatform: type });
    await this.getPlatformAPI();
  }
}

// Global factory instance
let globalFactory: PlatformFactory | null = null;

// Initialize global factory
export function initializePlatform(config: Partial<PlatformFactoryConfig> = {}): PlatformFactory {
  if (!globalFactory) {
    globalFactory = new PlatformFactory(config);
  } else {
    globalFactory.updateConfig(config);
  }

  return globalFactory;
}

// Get global platform API
export async function getPlatformAPI(): Promise<PlatformAPI> {
  if (!globalFactory) {
    globalFactory = new PlatformFactory();
  }

  return globalFactory.getPlatformAPI();
}

// Convenience export for direct access
export const platformAPI = {
  get: getPlatformAPI,
};

// Development utilities
export const platformDev = {
  // Set platform override for testing
  override: setPlatformOverride,

  // Get current override
  getOverride: getPlatformOverride,

  // Log platform information
  logInfo: logPlatformInfo,

  // Force platform change
  changePlatform: async (type: PlatformType) => {
    if (globalFactory) {
      await globalFactory.changePlatform(type);
    }
  },

  // Get factory instance for advanced usage
  getFactory: () => globalFactory,

  // Reset factory (for testing)
  reset: () => {
    globalFactory = null;
    setPlatformOverride(null);
  },
};

// Error handling utilities
export function onPlatformError(callback: (error: PlatformError) => void): () => void {
  if (!globalFactory) {
    globalFactory = new PlatformFactory();
  }

  return globalFactory.onError(callback);
}

// Platform detection exports
export {
  detectPlatformWithOverrides as detectPlatform,
  getCurrentPlatformType,
  getPlatformContext,
  setPlatformOverride,
  type PlatformOverride,
  type PlatformDetectionResult,
} from './detector.ts';

// Type exports
export type {
  PlatformAPI,
  PlatformType,
  PlatformError,
  PlatformConfig,
  PlatformCapabilities,
  StorageAPI,
  NotificationAPI,
  WindowAPI,
  SystemAPI,
} from './base.ts';

// Default export
export default {
  initialize: initializePlatform,
  getPlatformAPI,
  onError: onPlatformError,
  dev: platformDev,
};
