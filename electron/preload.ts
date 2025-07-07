/**
 * Electron Preload Script
 * Provides secure IPC communication between main and renderer processes
 */

import { contextBridge, ipcRenderer, clipboard, nativeTheme } from 'electron';

// Define the API interface for type safety
export interface ElectronAPI {
  // Window management
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    fullscreen: () => Promise<boolean>;
    getBounds: () => Promise<Electron.Rectangle>;
    setBounds: (bounds: Electron.Rectangle) => Promise<void>;
    onFocus: (callback: () => void) => void;
    onBlur: (callback: () => void) => void;
    onResize: (callback: (bounds: Electron.Rectangle) => void) => void;
  };

  // System integration
  system: {
    getPlatformInfo: () => Promise<PlatformInfo>;
    getSystemTheme: () => Promise<'light' | 'dark'>;
    onThemeChange: (callback: (theme: 'light' | 'dark') => void) => void;
    showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
    showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
    showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
    showErrorBox: (title: string, content: string) => void;
  };

  // Storage operations
  storage: {
    get: <T = any>(key: string) => Promise<T | null>;
    set: <T = any>(key: string, value: T) => Promise<void>;
    remove: (key: string) => Promise<void>;
    clear: () => Promise<void>;
    has: (key: string) => Promise<boolean>;
    keys: () => Promise<string[]>;
    size: () => Promise<number>;
  };

  // File system operations
  fileSystem: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    mkdir: (path: string) => Promise<void>;
    readdir: (path: string) => Promise<string[]>;
    stat: (path: string) => Promise<FileStats>;
    unlink: (path: string) => Promise<void>;
    copyFile: (src: string, dest: string) => Promise<void>;
  };

  // Clipboard operations
  clipboard: {
    readText: () => Promise<string>;
    writeText: (text: string) => Promise<void>;
    readImage: () => Promise<Electron.NativeImage | null>;
    writeImage: (image: Electron.NativeImage) => Promise<void>;
    clear: () => Promise<void>;
    hasText: () => Promise<boolean>;
    hasImage: () => Promise<boolean>;
  };

  // Notification system
  notifications: {
    show: (options: NotificationOptions) => Promise<void>;
    isSupported: () => boolean;
    requestPermission: () => Promise<'granted' | 'denied' | 'default'>;
  };

  // Performance monitoring
  performance: {
    getMemoryUsage: () => Promise<MemoryUsage>;
    getCPUUsage: () => Promise<CPUUsage>;
    getSystemMetrics: () => Promise<SystemMetrics>;
    startPerformanceMonitoring: (interval: number) => Promise<void>;
    stopPerformanceMonitoring: () => Promise<void>;
  };

  // Developer tools
  devTools: {
    openDevTools: () => Promise<void>;
    closeDevTools: () => Promise<void>;
    toggleDevTools: () => Promise<void>;
    isDevToolsOpened: () => Promise<boolean>;
  };

  // App information
  app: {
    getVersion: () => string;
    getName: () => string;
    getPath: (name: string) => string;
    quit: () => void;
    relaunch: () => void;
    focus: () => void;
  };
}

// Type definitions
interface PlatformInfo {
  platform: NodeJS.Platform;
  arch: string;
  version: string;
  release: string;
  hostname: string;
  username: string;
  homedir: string;
  tmpdir: string;
}

interface FileStats {
  isFile: boolean;
  isDirectory: boolean;
  size: number;
  created: Date;
  modified: Date;
  accessed: Date;
}

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
  tag?: string;
  timeout?: number;
}

interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}

interface CPUUsage {
  percentCPUUsage: number;
  idleWakeupsPerSecond: number;
}

interface SystemMetrics {
  memory: MemoryUsage;
  cpu: CPUUsage;
  platform: PlatformInfo;
}

/**
 * Create the secure API that will be exposed to the renderer process
 */
const electronAPI: ElectronAPI = {
  // Window management APIs
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    fullscreen: () => ipcRenderer.invoke('window:fullscreen'),
    getBounds: () => ipcRenderer.invoke('window:get-bounds'),
    setBounds: (bounds) => ipcRenderer.invoke('window:set-bounds', bounds),
    
    // Event listeners for window events
    onFocus: (callback) => {
      const handler = () => callback();
      ipcRenderer.on('window:focus', handler);
      return () => ipcRenderer.removeListener('window:focus', handler);
    },
    
    onBlur: (callback) => {
      const handler = () => callback();
      ipcRenderer.on('window:blur', handler);
      return () => ipcRenderer.removeListener('window:blur', handler);
    },
    
    onResize: (callback) => {
      const handler = (event: any, bounds: Electron.Rectangle) => callback(bounds);
      ipcRenderer.on('window:resize', handler);
      return () => ipcRenderer.removeListener('window:resize', handler);
    },
  },

  // System integration APIs
  system: {
    getPlatformInfo: () => ipcRenderer.invoke('system:get-platform-info'),
    getSystemTheme: () => ipcRenderer.invoke('system:get-system-theme'),
    
    onThemeChange: (callback) => {
      const handler = (event: any, theme: 'light' | 'dark') => callback(theme);
      ipcRenderer.on('system:theme-changed', handler);
      return () => ipcRenderer.removeListener('system:theme-changed', handler);
    },
    
    showOpenDialog: (options) => ipcRenderer.invoke('fs:show-open-dialog', options),
    showSaveDialog: (options) => ipcRenderer.invoke('fs:show-save-dialog', options),
    showMessageBox: (options) => ipcRenderer.invoke('dialog:show-message-box', options),
    showErrorBox: (title, content) => ipcRenderer.invoke('dialog:show-error-box', title, content),
  },

  // Storage APIs with encryption support
  storage: {
    get: (key) => ipcRenderer.invoke('storage:get', key),
    set: (key, value) => ipcRenderer.invoke('storage:set', key, value),
    remove: (key) => ipcRenderer.invoke('storage:remove', key),
    clear: () => ipcRenderer.invoke('storage:clear'),
    has: (key) => ipcRenderer.invoke('storage:has', key),
    keys: () => ipcRenderer.invoke('storage:keys'),
    size: () => ipcRenderer.invoke('storage:size'),
  },

  // File system APIs with security checks
  fileSystem: {
    readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs:write-file', path, content),
    exists: (path) => ipcRenderer.invoke('fs:exists', path),
    mkdir: (path) => ipcRenderer.invoke('fs:mkdir', path),
    readdir: (path) => ipcRenderer.invoke('fs:readdir', path),
    stat: (path) => ipcRenderer.invoke('fs:stat', path),
    unlink: (path) => ipcRenderer.invoke('fs:unlink', path),
    copyFile: (src, dest) => ipcRenderer.invoke('fs:copy-file', src, dest),
  },

  // Clipboard APIs
  clipboard: {
    readText: () => ipcRenderer.invoke('clipboard:read-text'),
    writeText: (text) => ipcRenderer.invoke('clipboard:write-text', text),
    readImage: () => ipcRenderer.invoke('clipboard:read-image'),
    writeImage: (image) => ipcRenderer.invoke('clipboard:write-image', image),
    clear: () => ipcRenderer.invoke('clipboard:clear'),
    hasText: () => ipcRenderer.invoke('clipboard:has-text'),
    hasImage: () => ipcRenderer.invoke('clipboard:has-image'),
  },

  // Notification APIs
  notifications: {
    show: (options) => ipcRenderer.invoke('notification:show', options),
    isSupported: () => 'Notification' in window,
    requestPermission: () => ipcRenderer.invoke('notification:request-permission'),
  },

  // Performance monitoring APIs
  performance: {
    getMemoryUsage: () => ipcRenderer.invoke('performance:get-memory-usage'),
    getCPUUsage: () => ipcRenderer.invoke('performance:get-cpu-usage'),
    getSystemMetrics: () => ipcRenderer.invoke('performance:get-system-metrics'),
    startPerformanceMonitoring: (interval) => ipcRenderer.invoke('performance:start-monitoring', interval),
    stopPerformanceMonitoring: () => ipcRenderer.invoke('performance:stop-monitoring'),
  },

  // Developer tools APIs
  devTools: {
    openDevTools: () => ipcRenderer.invoke('devtools:open'),
    closeDevTools: () => ipcRenderer.invoke('devtools:close'),
    toggleDevTools: () => ipcRenderer.invoke('devtools:toggle'),
    isDevToolsOpened: () => ipcRenderer.invoke('devtools:is-opened'),
  },

  // App information APIs
  app: {
    getVersion: () => ipcRenderer.sendSync('app:get-version'),
    getName: () => ipcRenderer.sendSync('app:get-name'),
    getPath: (name) => ipcRenderer.sendSync('app:get-path', name),
    quit: () => ipcRenderer.invoke('app:quit'),
    relaunch: () => ipcRenderer.invoke('app:relaunch'),
    focus: () => ipcRenderer.invoke('app:focus'),
  },
};

// Security: Only expose the API if we're in the correct context
if (process.contextIsolated) {
  try {
    // Expose the secure API to the renderer process
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
    
    // Expose platform detection
    contextBridge.exposeInMainWorld('__ELECTRON__', true);
    contextBridge.exposeInMainWorld('__PLATFORM__', 'electron');
    
    // Expose theme information
    contextBridge.exposeInMainWorld('__SYSTEM_THEME__', nativeTheme.shouldUseDarkColors ? 'dark' : 'light');
    
    console.log('✅ Electron preload script loaded successfully');
  } catch (error) {
    console.error('❌ Failed to expose Electron API:', error);
  }
} else {
  console.error('❌ Context isolation is disabled. This is a security risk.');
}

// Listen for theme changes
nativeTheme.on('updated', () => {
  const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  // Send theme change to renderer
  window.postMessage({ type: 'theme-changed', theme }, '*');
});

// Utility functions for internal use
const preloadUtils = {
  /**
   * Validate file paths to prevent directory traversal attacks
   */
  validatePath: (path: string): boolean => {
    // Basic validation - expand as needed
    return !path.includes('..') && !path.startsWith('/') && !path.includes('~');
  },

  /**
   * Sanitize data before sending to main process
   */
  sanitizeData: (data: any): any => {
    if (typeof data === 'string') {
      return data.replace(/[<>]/g, ''); // Basic XSS prevention
    }
    return data;
  },

  /**
   * Create a secure wrapper for IPC calls
   */
  secureInvoke: async (channel: string, ...args: any[]): Promise<any> => {
    try {
      // Sanitize arguments
      const sanitizedArgs = args.map(arg => preloadUtils.sanitizeData(arg));
      
      // Make the IPC call
      const result = await ipcRenderer.invoke(channel, ...sanitizedArgs);
      
      return result;
    } catch (error) {
      console.error(`IPC call failed for channel: ${channel}`, error);
      throw error;
    }
  },
};

// Error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in preload:', event.reason);
  
  // Send error to main process for logging
  ipcRenderer.invoke('error:unhandled-rejection', {
    reason: event.reason?.toString(),
    stack: event.reason?.stack,
    timestamp: Date.now(),
  });
});

// Error handling for uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('Uncaught error in preload:', event.error);
  
  // Send error to main process for logging
  ipcRenderer.invoke('error:uncaught-exception', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.toString(),
    stack: event.error?.stack,
    timestamp: Date.now(),
  });
});

// Export types for TypeScript support
export type { ElectronAPI, PlatformInfo, FileStats, NotificationOptions, MemoryUsage, CPUUsage, SystemMetrics };