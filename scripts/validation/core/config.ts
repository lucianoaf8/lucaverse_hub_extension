/**
 * Validation Suite Configuration
 * Central configuration for all validation rules and settings
 */

export interface ValidationConfig {
  static: StaticValidationConfig;
  runtime: RuntimeValidationConfig;
  integration: IntegrationValidationConfig;
  visual: VisualValidationConfig;
  reporting: ReportingConfig;
}

export interface StaticValidationConfig {
  architecture: {
    allowedImports: Record<string, string[]>;
    forbiddenPatterns: string[];
    requiredExports: Record<string, string[]>;
    fileNamingRules: {
      components: RegExp;
      hooks: RegExp;
      utils: RegExp;
      types: RegExp;
    };
  };
  guidelines: {
    forbiddenApis: string[];
    storageAdapterRequired: boolean;
    cspCompliant: boolean;
    serializableStateOnly: boolean;
  };
  theme: {
    requiredVariants: string[];
    colorContrastMinimum: number;
    animationDurationLimits: {
      min: number;
      max: number;
    };
    cssVariableNamingPattern: RegExp;
  };
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    requireAltText: boolean;
    requireAriaLabels: boolean;
    colorContrastRatio: number;
  };
}

export interface RuntimeValidationConfig {
  performance: {
    maxRenderTime: number;
    memoryLeakThreshold: number;
    bundleSizeLimit: number;
  };
  health: {
    monitorInterval: number;
    errorThreshold: number;
    recoveryTimeLimit: number;
  };
  storage: {
    testDataPersistence: boolean;
    validateAdapterFunctionality: boolean;
  };
}

export interface IntegrationValidationConfig {
  theme: {
    testAllVariants: boolean;
    validateSwitching: boolean;
    checkPersistence: boolean;
  };
  i18n: {
    testAllLanguages: boolean;
    validateFallbacks: boolean;
    checkKeyCompleteness: boolean;
  };
  platform: {
    testMultiPlatformCompat: boolean;
    validateFeatureFlags: boolean;
  };
}

export interface VisualValidationConfig {
  snapshots: {
    threshold: number;
    updateBaseline: boolean;
    dimensions: Array<{ width: number; height: number }>;
  };
  components: {
    testAllStates: boolean;
    includeInteractions: boolean;
  };
}

export interface ReportingConfig {
  formats: Array<'json' | 'html' | 'console' | 'junit'>;
  outputDir: string;
  includeDetails: boolean;
  generateSummary: boolean;
  historyTracking: boolean;
}

export interface ValidationMode {
  development: Partial<ValidationConfig>;
  ci: Partial<ValidationConfig>;
  production: Partial<ValidationConfig>;
  quick: Partial<ValidationConfig>;
}

// Default configuration
export const defaultConfig: ValidationConfig = {
  static: {
    architecture: {
      allowedImports: {
        'src/components/**': ['src/contexts/**', 'src/utils/**', 'src/types/**', 'src/config/**'],
        'src/contexts/**': ['src/utils/**', 'src/types/**', 'src/config/**'],
        'src/utils/**': ['src/types/**', 'src/config/**'],
        'src/config/**': ['src/types/**'],
      },
      forbiddenPatterns: [
        'src/components/**/index.ts', // Prefer direct imports
        '**/*.test.ts', // Tests should be co-located
        '**/temp/**',
        '**/tmp/**',
      ],
      requiredExports: {
        'src/components/**': ['default'],
        'src/contexts/**': ['default', 'use*'],
        'src/utils/**': ['*'],
      },
      fileNamingRules: {
        components: /^[A-Z][a-zA-Z0-9]*\.tsx?$/,
        hooks: /^use[A-Z][a-zA-Z0-9]*\.ts$/,
        utils: /^[a-z][a-zA-Z0-9]*\.ts$/,
        types: /^[a-z][a-zA-Z0-9]*\.ts$/,
      },
    },
    guidelines: {
      forbiddenApis: [
        'eval',
        'Function',
        'window.open',
        'document.write',
        'localStorage.setItem',
        'localStorage.getItem',
        'sessionStorage.setItem',
        'sessionStorage.getItem',
      ],
      storageAdapterRequired: true,
      cspCompliant: true,
      serializableStateOnly: true,
    },
    theme: {
      requiredVariants: ['light', 'dark'],
      colorContrastMinimum: 4.5,
      animationDurationLimits: {
        min: 50,
        max: 1000,
      },
      cssVariableNamingPattern: /^--[a-z0-9]+(-[a-z0-9]+)*$/,
    },
    accessibility: {
      wcagLevel: 'AA',
      requireAltText: true,
      requireAriaLabels: true,
      colorContrastRatio: 4.5,
    },
  },
  runtime: {
    performance: {
      maxRenderTime: 16, // 60fps
      memoryLeakThreshold: 50 * 1024 * 1024, // 50MB
      bundleSizeLimit: 1024 * 1024, // 1MB
    },
    health: {
      monitorInterval: 5000, // 5 seconds
      errorThreshold: 10,
      recoveryTimeLimit: 1000, // 1 second
    },
    storage: {
      testDataPersistence: true,
      validateAdapterFunctionality: true,
    },
  },
  integration: {
    theme: {
      testAllVariants: true,
      validateSwitching: true,
      checkPersistence: true,
    },
    i18n: {
      testAllLanguages: true,
      validateFallbacks: true,
      checkKeyCompleteness: true,
    },
    platform: {
      testMultiPlatformCompat: true,
      validateFeatureFlags: true,
    },
  },
  visual: {
    snapshots: {
      threshold: 0.2,
      updateBaseline: false,
      dimensions: [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
      ],
    },
    components: {
      testAllStates: true,
      includeInteractions: true,
    },
  },
  reporting: {
    formats: ['json', 'html', 'console'],
    outputDir: 'scripts/validation/reports',
    includeDetails: true,
    generateSummary: true,
    historyTracking: true,
  },
};

// Mode-specific configurations
export const validationModes: ValidationMode = {
  development: {
    reporting: {
      formats: ['console', 'html'],
      includeDetails: true,
    },
    runtime: {
      health: {
        monitorInterval: 2000,
      },
    },
  },
  ci: {
    reporting: {
      formats: ['json', 'junit'],
      includeDetails: false,
      generateSummary: true,
    },
    visual: {
      snapshots: {
        updateBaseline: false,
      },
    },
  },
  production: {
    static: {
      accessibility: {
        wcagLevel: 'AAA',
        colorContrastRatio: 7,
      },
    },
    runtime: {
      performance: {
        maxRenderTime: 12, // Stricter for production
        bundleSizeLimit: 512 * 1024, // 512KB
      },
    },
  },
  quick: {
    static: {
      architecture: {
        allowedImports: {},
        forbiddenPatterns: [],
        requiredExports: {},
        fileNamingRules: {
          components: /^[A-Z]/,
          hooks: /^use/,
          utils: /^[a-z]/,
          types: /^[a-z]/,
        },
      },
    },
    integration: {
      theme: {
        testAllVariants: false,
      },
      i18n: {
        testAllLanguages: false,
      },
    },
    visual: {
      snapshots: {
        threshold: 0.5, // More lenient
      },
    },
  },
};

export function getConfig(mode: keyof ValidationMode = 'development'): ValidationConfig {
  const base = defaultConfig;
  const modeOverrides = validationModes[mode];
  
  return mergeConfig(base, modeOverrides);
}

function mergeConfig(base: ValidationConfig, overrides: Partial<ValidationConfig>): ValidationConfig {
  return {
    static: { ...base.static, ...overrides.static },
    runtime: { ...base.runtime, ...overrides.runtime },
    integration: { ...base.integration, ...overrides.integration },
    visual: { ...base.visual, ...overrides.visual },
    reporting: { ...base.reporting, ...overrides.reporting },
  };
}

export function validateConfig(config: ValidationConfig): string[] {
  const errors: string[] = [];
  
  // Validate static config
  if (config.static.theme.colorContrastMinimum < 1) {
    errors.push('Color contrast minimum must be at least 1');
  }
  
  if (config.static.theme.animationDurationLimits.min >= config.static.theme.animationDurationLimits.max) {
    errors.push('Animation duration min must be less than max');
  }
  
  // Validate runtime config
  if (config.runtime.performance.maxRenderTime <= 0) {
    errors.push('Max render time must be positive');
  }
  
  if (config.runtime.health.monitorInterval < 1000) {
    errors.push('Monitor interval must be at least 1000ms');
  }
  
  // Validate visual config
  if (config.visual.snapshots.threshold < 0 || config.visual.snapshots.threshold > 1) {
    errors.push('Snapshot threshold must be between 0 and 1');
  }
  
  return errors;
}