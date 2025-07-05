/**
 * Project Reorganization Script
 * Run with: npx tsx reorganize-project.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Configuration files to create
const configFiles = {
  'src/config/index.ts': `/**
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
      enabled: __IS_WEB__, 
      features: ['all'] 
    },
    extension: { 
      enabled: __IS_EXTENSION__, 
      manifestVersion: 3,
      permissions: ['storage', 'tabs', 'notifications']
    },
    electron: { 
      enabled: __IS_ELECTRON__, 
      autoUpdater: true,
      defaultWindowSize: { width: 1280, height: 720 }
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
`,

  'src/config/constants.ts': `/**
 * Application constants
 * Immutable values used throughout the application
 */

// Layout constants
export const GRID_SIZE = 20;
export const GRID_SNAP_THRESHOLD = 10;
export const MIN_PANEL_SIZE = { width: 200, height: 150 } as const;
export const MAX_PANEL_SIZE = { width: 1200, height: 900 } as const;
export const DEFAULT_PANEL_SIZE = { width: 400, height: 300 } as const;

// Animation constants
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Panel constants
export const PANEL_HEADER_HEIGHT = 40;
export const PANEL_RESIZE_HANDLE_SIZE = 8;
export const PANEL_MIN_VISIBLE_AREA = 50;

// Z-index layers
export const Z_INDEX = {
  background: -1,
  neural: 0,
  panels: 10,
  selected: 20,
  dragging: 30,
  contextMenu: 40,
  modal: 50,
  toast: 60,
  debug: 100,
} as const;

// Key codes
export const KEY_CODES = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
} as const;

// Storage keys
export const STORAGE_KEYS = {
  WORKSPACE: 'workspace',
  PREFERENCES: 'preferences',
  THEME: 'theme',
  BOOKMARKS: 'bookmarks',
  TASKS: 'tasks',
  CHAT_HISTORY: 'chat-history',
  TIMER_SETTINGS: 'timer-settings',
} as const;
`,

  'src/config/theme.ts': `/**
 * Theme configuration
 * Runtime theme settings and utilities
 */

import { ThemeVariant } from '@/types/components';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Theme {
  name: string;
  variant: ThemeVariant;
  colors: ThemeColors;
  glass: {
    blur: string;
    opacity: number;
    border: string;
  };
}

export const themes: Record<ThemeVariant, Theme> = {
  [ThemeVariant.Dark]: {
    name: 'Dark',
    variant: ThemeVariant.Dark,
    colors: {
      primary: '#00bcd4',
      secondary: '#00ffff',
      accent: '#00e5ff',
      background: '#0a0f1a',
      surface: '#0f1419',
      text: '#f4f4f5',
      textSecondary: '#d4d4d8',
      border: 'rgba(0, 255, 255, 0.1)',
      error: '#ff1744',
      warning: '#ffc107',
      success: '#00ffff',
      info: '#00e5ff',
    },
    glass: {
      blur: '16px',
      opacity: 0.08,
      border: 'rgba(0, 255, 255, 0.1)',
    },
  },
  
  [ThemeVariant.Light]: {
    name: 'Light',
    variant: ThemeVariant.Light,
    colors: {
      primary: '#0891b2',
      secondary: '#06b6d4',
      accent: '#0284c7',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#475569',
      border: 'rgba(0, 0, 0, 0.1)',
      error: '#dc2626',
      warning: '#f59e0b',
      success: '#10b981',
      info: '#3b82f6',
    },
    glass: {
      blur: '12px',
      opacity: 0.05,
      border: 'rgba(0, 0, 0, 0.05)',
    },
  },
  
  [ThemeVariant.Auto]: {
    // Auto theme uses system preference
    name: 'Auto',
    variant: ThemeVariant.Auto,
    colors: {} as ThemeColors, // Dynamically determined
    glass: {} as any,
  },
};

export const getTheme = (variant: ThemeVariant): Theme => {
  if (variant === ThemeVariant.Auto) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return themes[prefersDark ? ThemeVariant.Dark : ThemeVariant.Light];
  }
  return themes[variant];
};

export const themeConfig = {
  defaultTheme: ThemeVariant.Dark,
  themes,
  getTheme,
} as const;
`,

  'src/shared/components/index.ts': `/**
 * Shared components barrel export
 */

// Re-export all shared components
export * from './Button';
export * from './Input';
export * from './Modal';
export * from './Toast';
export * from './Tooltip';
export * from './LoadingSpinner';
export * from './ErrorBoundary';
`,

  'src/features/panels/index.ts': `/**
 * Panels feature module
 */

// Components
export * from './components/Panel';
export * from './components/PanelHeader';
export * from './components/PanelContent';
export * from './components/ResizeHandle';
export * from './components/DragHandle';

// Hooks
export * from './hooks/usePanel';
export * from './hooks/usePanelResize';
export * from './hooks/usePanelDrag';

// Store
export * from './store/panelStore';

// Types
export * from './types';
`,
};

// Folders to create
const folders = [
  'src/app',
  'src/app/providers',
  'src/app/layouts',
  'src/config',
  'src/config/platform',
  'src/features',
  'src/features/panels',
  'src/features/panels/components',
  'src/features/panels/hooks',
  'src/features/panels/store',
  'src/features/panels/types',
  'src/features/smart-hub',
  'src/features/ai-chat',
  'src/features/task-manager',
  'src/features/productivity',
  'src/shared',
  'src/shared/components',
  'src/shared/hooks',
  'src/shared/utils',
  'src/shared/types',
  'src/platform',
  'src/platform/web',
  'src/platform/extension',
  'src/platform/electron',
  'src/tests',
  'src/tests/unit',
  'src/tests/integration',
  'src/tests/e2e',
  'src/tests/utils',
  'scripts/validate',
  'scripts/build',
  'scripts/deploy',
  'docs',
  'docs/architecture',
  'docs/api',
  'docs/guides',
];

// File moves to perform (examples)
const fileMoves = [
  // Move validation scripts
  { from: 'validate-dnd.js', to: 'scripts/validate/drag-drop.js' },
  { from: 'validate-dnd.mjs', to: 'scripts/validate/drag-drop.mjs' },
  { from: 'validate-resize.mjs', to: 'scripts/validate/resize.mjs' },
  { from: 'scripts/validate-electron.bat', to: 'scripts/validate/electron.bat' },
  { from: 'scripts/validate-electron-simple.bat', to: 'scripts/validate/electron-simple.bat' },
  
  // Move test utilities
  { from: 'src/__tests__/utils', to: 'src/tests/utils' },
  { from: 'src/__tests__/setup.ts', to: 'src/tests/setup.ts' },
  
  // Move platform-specific code
  { from: 'src/platform/web', to: 'src/platform/web' },
  { from: 'src/platform/extension', to: 'src/platform/extension' },
  { from: 'electron', to: 'src/platform/electron' },
];

// Main execution
async function reorganizeProject() {
  console.log('🚀 Starting project reorganization...\n');

  // Step 1: Create folders
  console.log('📁 Creating folder structure...');
  for (const folder of folders) {
    const folderPath = path.join(process.cwd(), folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`  ✅ Created: ${folder}`);
    } else {
      console.log(`  ⏭️  Exists: ${folder}`);
    }
  }

  // Step 2: Create configuration files
  console.log('\n📝 Creating configuration files...');
  for (const [filePath, content] of Object.entries(configFiles)) {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content);
      console.log(`  ✅ Created: ${filePath}`);
    } else {
      console.log(`  ⏭️  Exists: ${filePath}`);
    }
  }

  // Step 3: Move files (with safety checks)
  console.log('\n📦 Moving files to new structure...');
  for (const move of fileMoves) {
    const fromPath = path.join(process.cwd(), move.from);
    const toPath = path.join(process.cwd(), move.to);
    
    if (fs.existsSync(fromPath) && !fs.existsSync(toPath)) {
      const toDir = path.dirname(toPath);
      if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir, { recursive: true });
      }
      
      try {
        fs.renameSync(fromPath, toPath);
        console.log(`  ✅ Moved: ${move.from} → ${move.to}`);
      } catch (error) {
        console.log(`  ❌ Failed to move: ${move.from} → ${move.to}`);
        console.error(`     ${error}`);
      }
    } else if (!fs.existsSync(fromPath)) {
      console.log(`  ⏭️  Source not found: ${move.from}`);
    } else {
      console.log(`  ⏭️  Target exists: ${move.to}`);
    }
  }

  // Step 4: Update imports (manual step)
  console.log('\n📋 Manual steps required:');
  console.log('  1. Update import paths in moved files');
  console.log('  2. Update tsconfig.json path aliases if needed');
  console.log('  3. Update jest.config.js for new test location');
  console.log('  4. Move components to feature folders');
  console.log('  5. Create barrel exports for each module');

  console.log('\n✨ Reorganization complete!');
  console.log('Run "npm run type-check" to verify TypeScript compilation');
}

// Execute if run directly
if (require.main === module) {
  reorganizeProject().catch(console.error);
}

export { reorganizeProject };
