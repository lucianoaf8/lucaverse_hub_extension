/**
 * Enhanced Theme Context
 * Manages theme state, persistence, and system preference detection
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Theme, ThemeVariant, themeVariants, defaultTheme } from '../config/theme';
import { applyTheme } from '../utils/cssVariables';

// Storage adapter interface for multi-platform support
interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// Default browser storage adapter
const browserStorageAdapter: StorageAdapter = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
};

// Theme context interface
interface ThemeContextValue {
  theme: ThemeVariant;
  themeConfig: Theme;
  setTheme: (theme: ThemeVariant) => void;
  toggleTheme: () => void;
  systemPreference: ThemeVariant | null;
  isSystemTheme: boolean;
  setSystemTheme: (useSystem: boolean) => void;
}

// Create context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  storageAdapter?: StorageAdapter;
  storageKey?: string;
  defaultTheme?: ThemeVariant;
  detectSystemPreference?: boolean;
}

// Storage keys
const THEME_STORAGE_KEY = 'lucaverse-theme';
const SYSTEM_THEME_KEY = 'lucaverse-use-system-theme';

// Detect system color scheme preference
function getSystemThemePreference(): ThemeVariant | null {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDarkMode ? 'dark' : 'light';
}

// Theme Provider Component
export function ThemeProvider({
  children,
  storageAdapter = browserStorageAdapter,
  storageKey = THEME_STORAGE_KEY,
  defaultTheme: defaultThemeProp = defaultTheme,
  detectSystemPreference = true,
}: ThemeProviderProps) {
  // State for current theme
  const [theme, setThemeState] = useState<ThemeVariant>(() => {
    // Check if we should use system theme
    const useSystemTheme = storageAdapter.getItem(SYSTEM_THEME_KEY) === 'true';
    
    if (useSystemTheme && detectSystemPreference) {
      const systemTheme = getSystemThemePreference();
      if (systemTheme) return systemTheme;
    }

    // Check stored theme
    const storedTheme = storageAdapter.getItem(storageKey);
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      return storedTheme as ThemeVariant;
    }

    // Use default
    return defaultThemeProp;
  });

  // State for system preference
  const [systemPreference, setSystemPreference] = useState<ThemeVariant | null>(
    detectSystemPreference ? getSystemThemePreference() : null
  );

  // State for using system theme
  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(() => {
    return storageAdapter.getItem(SYSTEM_THEME_KEY) === 'true';
  });

  // Get current theme configuration
  const themeConfig = useMemo(() => themeVariants[theme], [theme]);

  // Apply theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: ThemeVariant) => {
    setThemeState(newTheme);
    storageAdapter.setItem(storageKey, newTheme);
    setIsSystemTheme(false);
    storageAdapter.setItem(SYSTEM_THEME_KEY, 'false');
  }, [storageAdapter, storageKey]);

  // Toggle between themes
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Set system theme preference
  const setSystemTheme = useCallback((useSystem: boolean) => {
    setIsSystemTheme(useSystem);
    storageAdapter.setItem(SYSTEM_THEME_KEY, String(useSystem));

    if (useSystem && systemPreference) {
      setThemeState(systemPreference);
      // Don't save theme to storage when using system preference
    }
  }, [systemPreference, storageAdapter]);

  // Listen for system theme changes
  useEffect(() => {
    if (!detectSystemPreference || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemPreference(newSystemTheme);
      
      // Update theme if using system preference
      if (isSystemTheme) {
        setThemeState(newSystemTheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    
    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [isSystemTheme, detectSystemPreference]);

  // Context value
  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    themeConfig,
    setTheme,
    toggleTheme,
    systemPreference,
    isSystemTheme,
    setSystemTheme,
  }), [theme, themeConfig, setTheme, toggleTheme, systemPreference, isSystemTheme, setSystemTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Additional hooks for specific use cases
export function useThemeConfig() {
  const { themeConfig } = useTheme();
  return themeConfig;
}

export function useThemeVariant() {
  const { theme } = useTheme();
  return theme;
}

export function useThemeToggle() {
  const { toggleTheme } = useTheme();
  return toggleTheme;
}