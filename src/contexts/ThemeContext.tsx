/**
 * Theme Context Provider
 * Manages global theme state and provides theme switching functionality
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  Theme,
  ThemeVariant,
  getTheme,
  getSystemThemePreference,
  subscribeToSystemThemeChanges,
  applyThemeToDocument,
} from '@/config/theme';

interface ThemeContextValue {
  currentTheme: ThemeVariant;
  setTheme: (theme: ThemeVariant) => void;
  themeConfig: Theme;
  isDarkMode: boolean;
  isLightMode: boolean;
  isAutoMode: boolean;
  toggleTheme: () => void;
  cycleTheme: () => void;
  resetToSystemTheme: () => void;
  isSystemDark: boolean;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeVariant;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Storage utilities
const STORAGE_KEY = 'lucaverse-theme-preference';

const loadThemeFromStorage = (defaultTheme: ThemeVariant): ThemeVariant => {
  if (typeof window === 'undefined') return defaultTheme;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && Object.values(ThemeVariant).includes(stored as ThemeVariant)) {
      return stored as ThemeVariant;
    }
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error);
  }
  
  return defaultTheme;
};

const saveThemeToStorage = (theme: ThemeVariant): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = ThemeVariant.Dark,
}) => {
  // Initialize theme from storage or default
  const [currentTheme, setCurrentThemeState] = useState<ThemeVariant>(() =>
    loadThemeFromStorage(defaultTheme)
  );
  
  // Track system theme preference
  const [systemTheme, setSystemTheme] = useState<ThemeVariant>(() =>
    typeof window !== 'undefined' ? getSystemThemePreference() : ThemeVariant.Dark
  );

  // Get resolved theme configuration
  const themeConfig = getTheme(currentTheme === ThemeVariant.Auto ? systemTheme : currentTheme);

  // Computed theme states
  const isDarkMode = currentTheme === ThemeVariant.Dark || 
    (currentTheme === ThemeVariant.Auto && systemTheme === ThemeVariant.Dark);
  const isLightMode = currentTheme === ThemeVariant.Light || 
    (currentTheme === ThemeVariant.Auto && systemTheme === ThemeVariant.Light);
  const isAutoMode = currentTheme === ThemeVariant.Auto;
  const isSystemDark = systemTheme === ThemeVariant.Dark;

  // Theme setter with validation and persistence
  const setTheme = useCallback((theme: ThemeVariant) => {
    if (!Object.values(ThemeVariant).includes(theme)) {
      console.warn('Invalid theme variant:', theme);
      return;
    }

    setCurrentThemeState(theme);
    saveThemeToStorage(theme);
    
    console.log(`🎨 Theme changed to: ${theme}`);
  }, []);

  // Toggle between dark and light (preserving auto if active)
  const toggleTheme = useCallback(() => {
    if (currentTheme === ThemeVariant.Auto) {
      // When in auto mode, toggle based on current system preference
      setTheme(systemTheme === ThemeVariant.Dark ? ThemeVariant.Light : ThemeVariant.Dark);
    } else if (currentTheme === ThemeVariant.Dark) {
      setTheme(ThemeVariant.Light);
    } else {
      setTheme(ThemeVariant.Dark);
    }
  }, [currentTheme, systemTheme, setTheme]);

  // Cycle through all themes: Dark -> Light -> Auto -> Dark
  const cycleTheme = useCallback(() => {
    const themeOrder = [ThemeVariant.Dark, ThemeVariant.Light, ThemeVariant.Auto];
    const currentIndex = themeOrder.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    const nextTheme = themeOrder[nextIndex];
    if (nextTheme) {
      setTheme(nextTheme);
    }
  }, [currentTheme, setTheme]);

  // Reset to system theme
  const resetToSystemTheme = useCallback(() => {
    setTheme(ThemeVariant.Auto);
  }, [setTheme]);

  // Apply theme to document when theme changes
  useEffect(() => {
    try {
      applyThemeToDocument(themeConfig);
      
      // Add data attribute to document for CSS targeting
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.documentElement.setAttribute('data-theme-resolved', 
          currentTheme === ThemeVariant.Auto ? systemTheme : currentTheme
        );
      }
      
      console.log(`🎨 Applied theme: ${themeConfig.name} (${currentTheme})`);
    } catch (error) {
      console.error('Failed to apply theme to document:', error);
    }
  }, [themeConfig, currentTheme, systemTheme]);

  // Subscribe to system theme changes
  useEffect(() => {
    const unsubscribe = subscribeToSystemThemeChanges((newSystemTheme) => {
      setSystemTheme(newSystemTheme);
      console.log(`🖥️ System theme changed to: ${newSystemTheme}`);
    });

    return unsubscribe;
  }, []);

  // Debug logging in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎨 Theme Debug Info:', {
        currentTheme,
        systemTheme,
        resolvedTheme: themeConfig.name,
        isDarkMode,
        isLightMode,
        isAutoMode,
      });
    }
  }, [currentTheme, systemTheme, themeConfig.name, isDarkMode, isLightMode, isAutoMode]);

  const contextValue: ThemeContextValue = {
    currentTheme,
    setTheme,
    themeConfig,
    isDarkMode,
    isLightMode,
    isAutoMode,
    toggleTheme,
    cycleTheme,
    resetToSystemTheme,
    isSystemDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Make sure to wrap your component tree with <ThemeProvider>.'
    );
  }
  
  return context;
};

// Hook for accessing theme colors directly
export const useThemeColors = () => {
  const { themeConfig } = useTheme();
  return themeConfig.colors;
};

// Hook for accessing theme utilities
export const useThemeUtils = () => {
  const { themeConfig } = useTheme();
  return {
    colors: themeConfig.colors,
    glass: themeConfig.glass,
    shadows: themeConfig.shadows,
    animations: themeConfig.animations,
  };
};

// HOC for components that need theme context
export const withTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
) => {
  const ThemedComponent = (props: P) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
  
  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return ThemedComponent;
};

export default ThemeContext;