/**
 * Main application configuration
 * Centralized configuration for all app settings
 */

export const config = {
  app: {
    name: 'Lucaverse Hub',
    version: '2.0.0',
    environment: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },

  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
    retries: 3,
    headers: {
      'Content-Type': 'application/json',
    },
  },

  features: {
    enableAnalytics: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
    enableDevTools: import.meta.env.DEV,
    enableParticles: true,
    enableAnimations: true,
    maxPanels: 20,
    maxHistorySize: 50,
  },

  storage: {
    prefix: 'lucaverse-',
    version: '2.0.0',
    quotaWarningThreshold: 0.9, // 90% of quota
  },

  platforms: {
    web: {
      enabled:
        typeof window !== 'undefined' &&
        !(window as any).chrome?.runtime &&
        !(window as any).require,
      features: ['all'],
    },
    extension: {
      enabled: typeof window !== 'undefined' && !!(window as any).chrome?.runtime,
      manifestVersion: 3,
      permissions: ['storage', 'tabs', 'notifications'],
    },
    electron: {
      enabled: typeof window !== 'undefined' && !!(window as any).require,
      autoUpdater: true,
      defaultWindowSize: { width: 1280, height: 720 },
    },
  },

  performance: {
    debounceDelay: 300,
    throttleDelay: 100,
    animationDuration: 300,
    autoSaveInterval: 30000,
  },
} as const;

export type AppConfig = typeof config;

// Helper functions
export const getCurrentPlatform = (): 'web' | 'extension' | 'electron' => {
  if (config.platforms.extension.enabled) return 'extension';
  if (config.platforms.electron.enabled) return 'electron';
  return 'web';
};

export const isPlatformEnabled = (platform: keyof typeof config.platforms): boolean => {
  return config.platforms[platform].enabled;
};

export const getFeatureFlag = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};
