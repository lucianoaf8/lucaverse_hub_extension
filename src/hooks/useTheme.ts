/**
 * useTheme Hook
 * Provides easy access to theme values and theme switching functionality
 * This is a re-export from ThemeContext for cleaner imports
 */

export {
  useTheme,
  useThemeColors,
  useThemeUtils,
  withTheme,
} from '@/contexts/ThemeContext';

// Additional theme-related utilities that components might need
import { useTheme as useThemeContext } from '@/contexts/ThemeContext';
import { useMemo } from 'react';

/**
 * Hook that provides CSS custom property names for the current theme
 * Useful for components that need to reference CSS custom properties
 */
export const useThemeCSSProperties = () => {
  const { themeConfig } = useThemeContext();
  
  return useMemo(() => ({
    // Color properties
    colorPrimary: 'var(--color-primary)',
    colorSecondary: 'var(--color-secondary)',
    colorAccent: 'var(--color-accent)',
    colorBackground: 'var(--color-background)',
    colorSurface: 'var(--color-surface)',
    colorText: 'var(--color-text)',
    colorTextSecondary: 'var(--color-textSecondary)',
    colorBorder: 'var(--color-border)',
    colorError: 'var(--color-error)',
    colorWarning: 'var(--color-warning)',
    colorSuccess: 'var(--color-success)',
    colorInfo: 'var(--color-info)',
    
    // Glass properties
    glassBlur: 'var(--glass-blur)',
    glassOpacity: 'var(--glass-opacity)',
    glassBorder: 'var(--glass-border)',
    
    // Animation properties
    animationFast: 'var(--animation-fast)',
    animationNormal: 'var(--animation-normal)',
    animationSlow: 'var(--animation-slow)',
  }), [themeConfig]);
};

/**
 * Hook that provides type-safe access to theme properties
 * with error handling for missing theme context
 */
export const useThemeSafe = () => {
  try {
    return useThemeContext();
  } catch (error) {
    console.warn('useTheme called outside of ThemeProvider context. Using default values.');
    
    // Return safe defaults
    return {
      currentTheme: 'dark' as const,
      setTheme: () => console.warn('Theme switching not available outside ThemeProvider'),
      themeConfig: {
        name: 'Dark',
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
        shadows: {
          sm: '0 1px 2px 0 rgba(0, 255, 255, 0.05)',
          md: '0 4px 6px -1px rgba(0, 255, 255, 0.1)',
          lg: '0 10px 15px -3px rgba(0, 255, 255, 0.1)',
          xl: '0 20px 25px -5px rgba(0, 255, 255, 0.1)',
        },
        animations: {
          duration: { fast: 150, normal: 300, slow: 500 },
          easing: { ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out' },
        },
      },
      isDarkMode: true,
      isLightMode: false,
      isAutoMode: false,
      toggleTheme: () => console.warn('Theme switching not available outside ThemeProvider'),
      cycleTheme: () => console.warn('Theme switching not available outside ThemeProvider'),
      resetToSystemTheme: () => console.warn('Theme switching not available outside ThemeProvider'),
      isSystemDark: true,
    };
  }
};

/**
 * Hook for components that need to style based on theme state
 * Returns className helpers for common theme-based styling
 */
export const useThemeClassNames = () => {
  const { isDarkMode, isLightMode, currentTheme } = useThemeContext();
  
  return useMemo(() => ({
    // Theme state classes
    themeClass: `theme-${currentTheme}`,
    modeClass: isDarkMode ? 'dark-mode' : 'light-mode',
    
    // Common theme-aware class combinations
    background: isDarkMode ? 'bg-gray-900' : 'bg-white',
    surface: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    
    // Glass effect classes
    glass: 'backdrop-blur-md bg-opacity-10 border border-opacity-20',
    glassCard: isDarkMode 
      ? 'backdrop-blur-md bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-20'
      : 'backdrop-blur-md bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20',
  }), [isDarkMode, isLightMode, currentTheme]);
};