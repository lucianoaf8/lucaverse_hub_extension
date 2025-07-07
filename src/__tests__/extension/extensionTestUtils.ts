/**
 * Chrome Extension Testing Utilities
 * Utilities for testing Chrome extension functionality, mocking APIs, and validation
 */

// Mock Chrome APIs for testing
export const createMockChromeAPIs = () => {
  const mockStorage = {
    local: {
      data: new Map<string, any>(),
      quotaBytes: 10 * 1024 * 1024, // 10MB
      usedBytes: 0,

      get: jest
        .fn()
        .mockImplementation((keys: string | string[] | null, callback?: (result: any) => void) => {
          const keysArray =
            keys === null
              ? Array.from(mockStorage.local.data.keys())
              : Array.isArray(keys)
                ? keys
                : [keys];

          const result: any = {};
          keysArray.forEach(key => {
            if (mockStorage.local.data.has(key)) {
              result[key] = mockStorage.local.data.get(key);
            }
          });

          if (callback) callback(result);
          return Promise.resolve(result);
        }),

      set: jest.fn().mockImplementation((items: Record<string, any>, callback?: () => void) => {
        const dataSize = JSON.stringify(items).length;

        if (mockStorage.local.usedBytes + dataSize > mockStorage.local.quotaBytes) {
          const error = new Error('QUOTA_EXCEEDED_ERR');
          if (callback) callback();
          throw error;
        }

        Object.entries(items).forEach(([key, value]) => {
          mockStorage.local.data.set(key, value);
        });

        mockStorage.local.usedBytes += dataSize;

        if (callback) callback();
        return Promise.resolve();
      }),

      remove: jest.fn().mockImplementation((keys: string | string[], callback?: () => void) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];

        keysArray.forEach(key => {
          if (mockStorage.local.data.has(key)) {
            const value = mockStorage.local.data.get(key);
            const dataSize = JSON.stringify(value).length;
            mockStorage.local.usedBytes -= dataSize;
            mockStorage.local.data.delete(key);
          }
        });

        if (callback) callback();
        return Promise.resolve();
      }),

      clear: jest.fn().mockImplementation((callback?: () => void) => {
        mockStorage.local.data.clear();
        mockStorage.local.usedBytes = 0;
        if (callback) callback();
        return Promise.resolve();
      }),

      getBytesInUse: jest
        .fn()
        .mockImplementation((keys?: string | string[], callback?: (bytesInUse: number) => void) => {
          if (callback) callback(mockStorage.local.usedBytes);
          return Promise.resolve(mockStorage.local.usedBytes);
        }),
    },

    sync: {
      data: new Map<string, any>(),
      quotaBytes: 100 * 1024, // 100KB
      usedBytes: 0,

      get: jest
        .fn()
        .mockImplementation((keys: string | string[] | null, callback?: (result: any) => void) => {
          const keysArray =
            keys === null
              ? Array.from(mockStorage.sync.data.keys())
              : Array.isArray(keys)
                ? keys
                : [keys];

          const result: any = {};
          keysArray.forEach(key => {
            if (mockStorage.sync.data.has(key)) {
              result[key] = mockStorage.sync.data.get(key);
            }
          });

          if (callback) callback(result);
          return Promise.resolve(result);
        }),

      set: jest.fn().mockImplementation((items: Record<string, any>, callback?: () => void) => {
        const dataSize = JSON.stringify(items).length;

        if (mockStorage.sync.usedBytes + dataSize > mockStorage.sync.quotaBytes) {
          const error = new Error('QUOTA_EXCEEDED_ERR');
          if (callback) callback();
          throw error;
        }

        Object.entries(items).forEach(([key, value]) => {
          mockStorage.sync.data.set(key, value);
        });

        mockStorage.sync.usedBytes += dataSize;

        if (callback) callback();
        return Promise.resolve();
      }),
    },

    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(),
    },
  };

  const mockRuntime = {
    id: 'test-extension-id',

    getManifest: jest.fn().mockReturnValue({
      manifest_version: 3,
      name: 'Lucaverse Hub Extension',
      version: '2.0.0',
      permissions: ['storage', 'notifications', 'tabs'],
      content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'",
      },
    }),

    sendMessage: jest
      .fn()
      .mockImplementation(
        (
          extensionId?: string,
          message?: any,
          options?: any,
          callback?: (response: any) => void
        ) => {
          const response = { success: true, data: message };
          if (callback) callback(response);
          return Promise.resolve(response);
        }
      ),

    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(),
    },

    onInstalled: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },

    getURL: jest.fn().mockImplementation((path: string) => `chrome-extension://test-id/${path}`),
  };

  const mockTabs = {
    create: jest.fn().mockImplementation((createProperties: any, callback?: (tab: any) => void) => {
      const tab = {
        id: Math.floor(Math.random() * 1000),
        url: createProperties.url,
        active: createProperties.active ?? true,
        index: 0,
        windowId: 1,
      };
      if (callback) callback(tab);
      return Promise.resolve(tab);
    }),

    query: jest.fn().mockImplementation((queryInfo: any, callback?: (tabs: any[]) => void) => {
      const tabs = [
        {
          id: 1,
          url: 'https://example.com',
          active: queryInfo.active ?? true,
          index: 0,
          windowId: 1,
        },
      ];
      if (callback) callback(tabs);
      return Promise.resolve(tabs);
    }),

    update: jest
      .fn()
      .mockImplementation(
        (tabId?: number, updateProperties?: any, callback?: (tab: any) => void) => {
          const tab = {
            id: tabId || 1,
            url: updateProperties?.url || 'https://example.com',
            active: true,
            index: 0,
            windowId: 1,
          };
          if (callback) callback(tab);
          return Promise.resolve(tab);
        }
      ),
  };

  const mockNotifications = {
    create: jest
      .fn()
      .mockImplementation(
        (notificationId?: string, options?: any, callback?: (notificationId: string) => void) => {
          const id = notificationId || `notification-${Date.now()}`;
          if (callback) callback(id);
          return Promise.resolve(id);
        }
      ),

    clear: jest
      .fn()
      .mockImplementation((notificationId: string, callback?: (wasCleared: boolean) => void) => {
        if (callback) callback(true);
        return Promise.resolve(true);
      }),

    getAll: jest.fn().mockImplementation((callback?: (notifications: any) => void) => {
      const notifications = {};
      if (callback) callback(notifications);
      return Promise.resolve(notifications);
    }),
  };

  const mockAction = {
    setIcon: jest.fn().mockImplementation((details: any, callback?: () => void) => {
      if (callback) callback();
      return Promise.resolve();
    }),

    setBadgeText: jest.fn().mockImplementation((details: any, callback?: () => void) => {
      if (callback) callback();
      return Promise.resolve();
    }),

    setBadgeBackgroundColor: jest.fn().mockImplementation((details: any, callback?: () => void) => {
      if (callback) callback();
      return Promise.resolve();
    }),

    onClicked: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  };

  const mockAlarms = {
    create: jest
      .fn()
      .mockImplementation((name?: string, alarmInfo?: any, callback?: () => void) => {
        if (callback) callback();
        return Promise.resolve();
      }),

    clear: jest
      .fn()
      .mockImplementation((name?: string, callback?: (wasCleared: boolean) => void) => {
        if (callback) callback(true);
        return Promise.resolve(true);
      }),

    clearAll: jest.fn().mockImplementation((callback?: (wasCleared: boolean) => void) => {
      if (callback) callback(true);
      return Promise.resolve(true);
    }),

    get: jest.fn().mockImplementation((name?: string, callback?: (alarm?: any) => void) => {
      if (callback) callback(undefined);
      return Promise.resolve(undefined);
    }),

    getAll: jest.fn().mockImplementation((callback?: (alarms: any[]) => void) => {
      if (callback) callback([]);
      return Promise.resolve([]);
    }),

    onAlarm: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  };

  return {
    storage: mockStorage,
    runtime: mockRuntime,
    tabs: mockTabs,
    notifications: mockNotifications,
    action: mockAction,
    alarms: mockAlarms,

    // Helper methods for testing
    _getMockStorage: () => mockStorage,
    _setStorageQuota: (local: number, sync: number) => {
      mockStorage.local.quotaBytes = local;
      mockStorage.sync.quotaBytes = sync;
    },
    _clearAllStorage: () => {
      mockStorage.local.data.clear();
      mockStorage.local.usedBytes = 0;
      mockStorage.sync.data.clear();
      mockStorage.sync.usedBytes = 0;
    },
    _getStorageUsage: () => ({
      local: mockStorage.local.usedBytes,
      sync: mockStorage.sync.usedBytes,
    }),
  };
};

// Extension testing environment setup
export const setupExtensionTestEnvironment = () => {
  const mockChrome = createMockChromeAPIs();

  // Set up global chrome object
  (global as any).chrome = mockChrome;

  // Mock extension-specific globals
  (global as any).browser = mockChrome; // For WebExtensions API compatibility

  return mockChrome;
};

// Manifest validation utilities
export const validateManifestV3 = (manifest: any) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!manifest.manifest_version) {
    errors.push('Missing manifest_version');
  } else if (manifest.manifest_version !== 3) {
    errors.push('manifest_version must be 3 for Manifest V3');
  }

  if (!manifest.name) {
    errors.push('Missing name field');
  }

  if (!manifest.version) {
    errors.push('Missing version field');
  }

  // Service worker validation
  if (manifest.background) {
    if (manifest.background.scripts) {
      errors.push(
        'background.scripts is not allowed in Manifest V3, use background.service_worker'
      );
    }
    if (!manifest.background.service_worker) {
      warnings.push('No service_worker specified in background');
    }
  }

  // CSP validation
  if (manifest.content_security_policy) {
    const csp = manifest.content_security_policy;
    if (typeof csp === 'string') {
      errors.push('content_security_policy must be an object in Manifest V3');
    } else if (csp.extension_pages) {
      if (csp.extension_pages.includes("'unsafe-eval'")) {
        errors.push("'unsafe-eval' is not allowed in extension pages CSP");
      }
      if (csp.extension_pages.includes("'unsafe-inline'")) {
        warnings.push("'unsafe-inline' should be avoided for security");
      }
    }
  }

  // Permissions validation
  if (manifest.permissions) {
    const deprecatedPermissions = ['tabs', 'cookies', 'webRequest'];
    const usedDeprecated = manifest.permissions.filter((p: string) =>
      deprecatedPermissions.includes(p)
    );
    if (usedDeprecated.length > 0) {
      warnings.push(`Deprecated permissions used: ${usedDeprecated.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// CSP violation checker
export const checkCSPCompliance = async () => {
  const violations: string[] = [];

  // Check for inline scripts
  const inlineScripts = document.querySelectorAll('script:not([src])');
  if (inlineScripts.length > 0) {
    violations.push(`Found ${inlineScripts.length} inline script(s)`);
  }

  // Check for inline styles
  const inlineStyles = document.querySelectorAll('style:not([data-styled])'); // Exclude styled-components
  if (inlineStyles.length > 0) {
    violations.push(`Found ${inlineStyles.length} inline style(s)`);
  }

  // Check for eval usage (would need more sophisticated detection in real scenario)
  const scripts = document.querySelectorAll('script[src]');
  for (const script of scripts) {
    const src = script.getAttribute('src');
    if (src && src.includes('eval')) {
      violations.push(`Script ${src} may contain eval()`);
    }
  }

  return violations;
};

// Storage quota testing utilities
export const testStorageQuota = async (chrome: any) => {
  const results = {
    localStorageWorks: false,
    syncStorageWorks: false,
    quotaEnforced: false,
    cleanupWorks: false,
  };

  try {
    // Test local storage
    await chrome.storage.local.set({ testKey: 'testValue' });
    const localResult = await chrome.storage.local.get('testKey');
    results.localStorageWorks = localResult.testKey === 'testValue';

    // Test sync storage
    await chrome.storage.sync.set({ syncTestKey: 'syncTestValue' });
    const syncResult = await chrome.storage.sync.get('syncTestKey');
    results.syncStorageWorks = syncResult.syncTestKey === 'syncTestValue';

    // Test quota enforcement
    try {
      const largeData = 'x'.repeat(chrome._getStorageQuota?.().local || 11 * 1024 * 1024);
      await chrome.storage.local.set({ largeData });
      results.quotaEnforced = false; // Should have thrown error
    } catch (error) {
      results.quotaEnforced = error.message.includes('QUOTA_EXCEEDED');
    }

    // Test cleanup
    await chrome.storage.local.remove(['testKey']);
    await chrome.storage.sync.remove(['syncTestKey']);
    const cleanupCheck = await chrome.storage.local.get(['testKey']);
    results.cleanupWorks = !cleanupCheck.testKey;
  } catch (error) {
    console.error('Storage quota test error:', error);
  }

  return results;
};

// Extension loading automation
export const loadExtensionForTesting = async () => {
  // Simulate extension loading
  const manifest = {
    manifest_version: 3,
    name: 'Lucaverse Hub Test Extension',
    version: '2.0.0',
    permissions: ['storage', 'notifications'],
    background: {
      service_worker: 'background.js',
    },
  };

  const chrome = setupExtensionTestEnvironment();
  chrome.runtime.getManifest.mockReturnValue(manifest);

  // Simulate extension startup events
  if (chrome.runtime.onInstalled.addListener.mock) {
    const listeners = chrome.runtime.onInstalled.addListener.mock.calls;
    listeners.forEach(([listener]: any) => {
      listener({ reason: 'install' });
    });
  }

  return chrome;
};

// Permission testing utilities
export const testPermissions = async (chrome: any, requiredPermissions: string[]) => {
  const results = {
    hasAllPermissions: false,
    missingPermissions: [] as string[],
    extraPermissions: [] as string[],
  };

  const manifest = chrome.runtime.getManifest();
  const declaredPermissions = manifest.permissions || [];

  // Check for missing permissions
  results.missingPermissions = requiredPermissions.filter(
    permission => !declaredPermissions.includes(permission)
  );

  // Check for extra permissions (not necessarily bad, but worth noting)
  results.extraPermissions = declaredPermissions.filter(
    permission => !requiredPermissions.includes(permission)
  );

  results.hasAllPermissions = results.missingPermissions.length === 0;

  return results;
};

// Extension performance testing
export const testExtensionPerformance = async () => {
  const metrics = {
    startupTime: 0,
    memoryUsage: 0,
    backgroundScriptIdle: false,
  };

  const startTime = performance.now();

  // Simulate extension startup
  await loadExtensionForTesting();

  metrics.startupTime = performance.now() - startTime;

  // Check memory usage
  if (typeof (performance as any).memory !== 'undefined') {
    metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
  }

  // Simulate background script idle check
  metrics.backgroundScriptIdle = true; // In real scenario, would check actual idle state

  return metrics;
};

// Export test utilities
export const extensionTestUtils = {
  setupExtensionTestEnvironment,
  createMockChromeAPIs,
  validateManifestV3,
  checkCSPCompliance,
  testStorageQuota,
  loadExtensionForTesting,
  testPermissions,
  testExtensionPerformance,
};
