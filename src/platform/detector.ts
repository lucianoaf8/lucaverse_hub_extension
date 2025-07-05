/**
 * Platform Detection System
 * Detects the current runtime environment and determines the appropriate platform API
 */

import { PlatformType, PlatformContext, PlatformCapabilities } from './base.ts';

// Platform Detection Results
export interface PlatformDetectionResult {
  type: PlatformType;
  context: PlatformContext;
  confidence: number;
  features: string[];
  warnings: string[];
}

// Runtime Environment Checks
export const runtimeChecks = {
  // Check for Chrome extension context
  isChromeExtension(): boolean {
    return typeof chrome !== 'undefined' && 
           !!chrome.runtime && 
           !!chrome.runtime.id &&
           !!chrome.runtime.getManifest;
  },

  // Check for Electron context
  isElectron(): boolean {
    return typeof window !== 'undefined' && 
           !!(window as any).electronAPI &&
           typeof process !== 'undefined' &&
           (process as any).type === 'renderer';
  },

  // Check for standard web browser context
  isWebBrowser(): boolean {
    return typeof window !== 'undefined' && 
           typeof document !== 'undefined' &&
           !this.isChromeExtension() &&
           !this.isElectron();
  },

  // Check for service worker context
  isServiceWorker(): boolean {
    return typeof importScripts === 'function' &&
           typeof WorkerGlobalScope !== 'undefined' &&
           typeof ServiceWorkerGlobalScope !== 'undefined';
  },

  // Check for Node.js context
  isNode(): boolean {
    return typeof process !== 'undefined' &&
           process.versions &&
           process.versions.node;
  }
};

// Feature Detection
export const featureDetection = {
  // Chrome-specific feature detection
  chromeFeatures(): string[] {
    const features: string[] = [];
    
    if (chrome?.storage?.local) features.push('chrome.storage.local');
    if (chrome?.storage?.sync) features.push('chrome.storage.sync');
    if (chrome?.notifications) features.push('chrome.notifications');
    if (chrome?.windows) features.push('chrome.windows');
    if (chrome?.tabs) features.push('chrome.tabs');
    if (chrome?.alarms) features.push('chrome.alarms');
    if (chrome?.runtime?.onInstalled) features.push('chrome.runtime.lifecycle');
    
    return features;
  },

  // Web API feature detection
  webFeatures(): string[] {
    const features: string[] = [];
    
    if ('localStorage' in window) features.push('localStorage');
    if ('sessionStorage' in window) features.push('sessionStorage');
    if ('Notification' in window) features.push('Notification');
    if (navigator?.clipboard) features.push('Clipboard API');
    if ('serviceWorker' in navigator) features.push('Service Worker');
    if ('showOpenFilePicker' in window) features.push('File System Access API');
    if ('getBattery' in navigator) features.push('Battery API');
    if ((navigator as any).connection) features.push('Network Information API');
    
    return features;
  },

  // Electron-specific feature detection
  electronFeatures(): string[] {
    const features: string[] = [];
    
    const electronAPI = (window as any).electronAPI;
    if (electronAPI) {
      features.push('electronAPI');
      
      // Check for specific IPC channels
      if (typeof electronAPI.invoke === 'function') features.push('IPC.invoke');
      if (typeof electronAPI.send === 'function') features.push('IPC.send');
      if (typeof electronAPI.on === 'function') features.push('IPC.on');
    }
    
    if (typeof process !== 'undefined') {
      features.push('process');
      if ((process as any).platform) features.push('process.platform');
      if ((process as any).versions?.electron) features.push('electron.versions');
    }
    
    return features;
  },

  // Get all available features for current environment
  getAllFeatures(): string[] {
    const allFeatures: string[] = [];
    
    if (runtimeChecks.isChromeExtension()) {
      allFeatures.push(...this.chromeFeatures());
    }
    
    if (runtimeChecks.isWebBrowser()) {
      allFeatures.push(...this.webFeatures());
    }
    
    if (runtimeChecks.isElectron()) {
      allFeatures.push(...this.electronFeatures());
    }
    
    return allFeatures;
  }
};

// Platform Detection Logic
export function detectPlatform(): PlatformDetectionResult {
  const warnings: string[] = [];
  
  // Check for Electron first (most specific)
  if (runtimeChecks.isElectron()) {
    const features = featureDetection.electronFeatures();
    const hasRequiredFeatures = features.includes('electronAPI') && features.includes('IPC.invoke');
    
    if (!hasRequiredFeatures) {
      warnings.push('Electron detected but required IPC features missing');
    }
    
    return {
      type: 'electron',
      context: {
        isExtension: false,
        isWeb: false,
        isElectron: true,
        hasPermissions: ['all'],
        manifestVersion: undefined
      },
      confidence: hasRequiredFeatures ? 0.95 : 0.7,
      features,
      warnings
    };
  }
  
  // Check for Chrome Extension (next most specific)
  if (runtimeChecks.isChromeExtension()) {
    const features = featureDetection.chromeFeatures();
    const manifest = chrome.runtime.getManifest();
    const manifestVersion = manifest.manifest_version;
    
    // Check for required permissions
    const permissions = manifest.permissions || [];
    const hasStoragePermission = permissions.includes('storage');
    const hasNotificationPermission = permissions.includes('notifications');
    
    if (!hasStoragePermission) {
      warnings.push('Storage permission not found in manifest');
    }
    
    if (manifestVersion === 2) {
      warnings.push('Manifest V2 detected - consider upgrading to V3');
    }
    
    return {
      type: 'chrome',
      context: {
        isExtension: true,
        isWeb: false,
        isElectron: false,
        hasPermissions: permissions,
        manifestVersion
      },
      confidence: features.length > 3 ? 0.9 : 0.8,
      features,
      warnings
    };
  }
  
  // Fallback to Web Browser
  if (runtimeChecks.isWebBrowser()) {
    const features = featureDetection.webFeatures();
    const hasModernFeatures = features.includes('Notification') && 
                             features.includes('Clipboard API') && 
                             features.includes('Service Worker');
    
    if (!features.includes('localStorage')) {
      warnings.push('localStorage not available - storage functionality limited');
    }
    
    if (!features.includes('Notification')) {
      warnings.push('Notification API not available');
    }
    
    return {
      type: 'web',
      context: {
        isExtension: false,
        isWeb: true,
        isElectron: false,
        hasPermissions: [],
        manifestVersion: undefined
      },
      confidence: hasModernFeatures ? 0.85 : 0.6,
      features,
      warnings
    };
  }
  
  // Unknown environment
  warnings.push('Unknown environment detected - falling back to web platform');
  
  return {
    type: 'web',
    context: {
      isExtension: false,
      isWeb: true,
      isElectron: false,
      hasPermissions: [],
      manifestVersion: undefined
    },
    confidence: 0.3,
    features: [],
    warnings
  };
}

// Capability Detection for Environment
export function detectCapabilities(platformType: PlatformType): PlatformCapabilities {
  switch (platformType) {
    case 'chrome':
      return {
        storage: {
          local: !!chrome?.storage?.local,
          sync: !!chrome?.storage?.sync,
          managed: !!chrome?.storage?.managed,
          unlimited: false
        },
        notifications: {
          basic: !!chrome?.notifications,
          rich: !!chrome?.notifications,
          actions: !!chrome?.notifications,
          images: !!chrome?.notifications
        },
        windows: {
          create: !!chrome?.windows?.create,
          focus: !!chrome?.windows?.update,
          multiple: true,
          alwaysOnTop: false
        },
        system: {
          clipboard: !!navigator?.clipboard,
          fileSystem: false,
          hardware: true,
          nativeMenus: false
        },
        background: {
          serviceWorker: true,
          persistentPages: false,
          alarms: !!chrome?.alarms
        }
      };
      
    case 'electron':
      return {
        storage: {
          local: true,
          sync: true,
          managed: true,
          unlimited: true
        },
        notifications: {
          basic: true,
          rich: true,
          actions: true,
          images: true
        },
        windows: {
          create: true,
          focus: true,
          multiple: true,
          alwaysOnTop: true
        },
        system: {
          clipboard: true,
          fileSystem: true,
          hardware: true,
          nativeMenus: true
        },
        background: {
          serviceWorker: false,
          persistentPages: true,
          alarms: true
        }
      };
      
    case 'web':
    default:
      return {
        storage: {
          local: 'localStorage' in window,
          sync: false,
          managed: false,
          unlimited: false
        },
        notifications: {
          basic: 'Notification' in window,
          rich: 'Notification' in window,
          actions: false,
          images: 'Notification' in window
        },
        windows: {
          create: true,
          focus: true,
          multiple: true,
          alwaysOnTop: false
        },
        system: {
          clipboard: !!navigator?.clipboard,
          fileSystem: 'showOpenFilePicker' in window,
          hardware: true,
          nativeMenus: false
        },
        background: {
          serviceWorker: 'serviceWorker' in navigator,
          persistentPages: true,
          alarms: false
        }
      };
  }
}

// Development Mode Overrides
export interface PlatformOverride {
  forcePlatform?: PlatformType;
  enableDebugMode?: boolean;
  mockFeatures?: string[];
  disableFeatures?: string[];
}

let currentOverride: PlatformOverride | null = null;

export function setPlatformOverride(override: PlatformOverride | null): void {
  currentOverride = override;
  
  if (override?.enableDebugMode) {
    console.log('Platform detection override enabled:', override);
  }
}

export function getPlatformOverride(): PlatformOverride | null {
  return currentOverride;
}

// Enhanced detection with override support
export function detectPlatformWithOverrides(): PlatformDetectionResult {
  const override = getPlatformOverride();
  
  // Apply forced platform if specified
  if (override?.forcePlatform) {
    const capabilities = detectCapabilities(override.forcePlatform);
    const features = featureDetection.getAllFeatures();
    
    // Apply feature overrides
    if (override.mockFeatures) {
      features.push(...override.mockFeatures);
    }
    
    if (override.disableFeatures) {
      override.disableFeatures.forEach(feature => {
        const index = features.indexOf(feature);
        if (index > -1) features.splice(index, 1);
      });
    }
    
    return {
      type: override.forcePlatform,
      context: {
        isExtension: override.forcePlatform === 'chrome',
        isWeb: override.forcePlatform === 'web',
        isElectron: override.forcePlatform === 'electron',
        hasPermissions: [],
        manifestVersion: undefined
      },
      confidence: 1.0,
      features,
      warnings: ['Platform forced via override']
    };
  }
  
  // Normal detection
  return detectPlatform();
}

// Utility functions
export function isPlatformSupported(platform: PlatformType): boolean {
  const detection = detectPlatform();
  return detection.type === platform && detection.confidence > 0.5;
}

export function getCurrentPlatformType(): PlatformType {
  const detection = detectPlatformWithOverrides();
  return detection.type;
}

export function getPlatformContext(): PlatformContext {
  const detection = detectPlatformWithOverrides();
  return detection.context;
}

export function logPlatformInfo(): void {
  const detection = detectPlatformWithOverrides();
  const capabilities = detectCapabilities(detection.type);
  
  console.group('🔍 Platform Detection Results');
  console.log('Platform Type:', detection.type);
  console.log('Confidence:', `${(detection.confidence * 100).toFixed(1)}%`);
  console.log('Context:', detection.context);
  console.log('Features:', detection.features);
  console.log('Capabilities:', capabilities);
  
  if (detection.warnings.length > 0) {
    console.warn('Warnings:', detection.warnings);
  }
  
  console.groupEnd();
}