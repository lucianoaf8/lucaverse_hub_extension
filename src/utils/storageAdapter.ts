/**
 * Storage Adapter for Multi-Platform Compatibility
 * Provides a unified interface for storage operations across web, extension, and electron
 */

interface ElectronAPI {
  storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Web Storage Adapter (localStorage/sessionStorage)
 * Used for web builds
 */
class WebStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from storage: ${key}`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item in storage: ${key}`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item from storage: ${key}`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Failed to clear storage', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      console.error('Failed to get all keys from storage', error);
      return [];
    }
  }
}

/**
 * Extension Storage Adapter
 * Uses chrome.storage.local for browser extensions
 */
class ExtensionStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await new Promise<{[key: string]: unknown}>((resolve) => {
          chrome.storage.local.get([key], resolve);
        });
        return result[key] || null;
      }
      // Fallback to localStorage
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from extension storage: ${key}`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await new Promise<void>((resolve, reject) => {
          chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Failed to set item in extension storage: ${key}`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await new Promise<void>((resolve, reject) => {
          chrome.storage.local.remove([key], () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove item from extension storage: ${key}`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await new Promise<void>((resolve, reject) => {
          chrome.storage.local.clear(() => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear extension storage', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await new Promise<{[key: string]: unknown}>((resolve) => {
          chrome.storage.local.get(null, resolve);
        });
        return Object.keys(result);
      } else {
        // Fallback to localStorage
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keys.push(key);
        }
        return keys;
      }
    } catch (error) {
      console.error('Failed to get all keys from extension storage', error);
      return [];
    }
  }
}

/**
 * Electron Storage Adapter
 * Uses electron's main process storage
 */
class ElectronStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      // In Electron, we would use ipcRenderer to communicate with main process
      if (typeof window !== 'undefined' && window.electronAPI) {
        return await window.electronAPI.storage.getItem(key);
      }
      // Fallback to localStorage
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from electron storage: ${key}`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.storage.setItem(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Failed to set item in electron storage: ${key}`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.storage.removeItem(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Failed to remove item from electron storage: ${key}`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.storage.clear();
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear electron storage', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        return await window.electronAPI.storage.getAllKeys();
      } else {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) keys.push(key);
        }
        return keys;
      }
    } catch (error) {
      console.error('Failed to get all keys from electron storage', error);
      return [];
    }
  }
}

/**
 * Detect platform and create appropriate storage adapter
 */
function createStorageAdapter(): StorageAdapter {
  // Check if running in browser extension
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new ExtensionStorageAdapter();
  }
  
  // Check if running in Electron
  if (typeof window !== 'undefined' && window.electronAPI) {
    return new ElectronStorageAdapter();
  }
  
  // Default to web storage
  return new WebStorageAdapter();
}

// Export singleton instance
export const storageAdapter = createStorageAdapter();

// Export adapter classes for testing
export { WebStorageAdapter, ExtensionStorageAdapter, ElectronStorageAdapter };

/**
 * Higher-level storage utilities with JSON serialization
 */
export class StorageUtils {
  private adapter: StorageAdapter;

  constructor(adapter: StorageAdapter = storageAdapter) {
    this.adapter = adapter;
  }

  async getObject<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const value = await this.adapter.getItem(key);
      if (value === null) {
        return defaultValue || null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Failed to parse JSON for key: ${key}`, error);
      return defaultValue || null;
    }
  }

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.adapter.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to serialize object for key: ${key}`, error);
      throw error;
    }
  }

  async getString(key: string, defaultValue?: string): Promise<string | null> {
    const value = await this.adapter.getItem(key);
    return value !== null ? value : (defaultValue || null);
  }

  async setString(key: string, value: string): Promise<void> {
    await this.adapter.setItem(key, value);
  }

  async getBoolean(key: string, defaultValue = false): Promise<boolean> {
    const value = await this.adapter.getItem(key);
    if (value === null) return defaultValue;
    return value === 'true';
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    await this.adapter.setItem(key, value.toString());
  }

  async getNumber(key: string, defaultValue = 0): Promise<number> {
    const value = await this.adapter.getItem(key);
    if (value === null) return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  async setNumber(key: string, value: number): Promise<void> {
    await this.adapter.setItem(key, value.toString());
  }

  async remove(key: string): Promise<void> {
    await this.adapter.removeItem(key);
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return await this.adapter.getAllKeys();
  }
}

// Export singleton instance
export const storageUtils = new StorageUtils();