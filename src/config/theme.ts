/**
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
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
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
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 255, 255, 0.05)',
      md: '0 4px 6px -1px rgba(0, 255, 255, 0.1), 0 2px 4px -1px rgba(0, 255, 255, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 255, 255, 0.1), 0 4px 6px -2px rgba(0, 255, 255, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 255, 255, 0.1), 0 10px 10px -5px rgba(0, 255, 255, 0.04)',
    },
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      easing: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
      },
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
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      easing: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
      },
    },
  },

  [ThemeVariant.Auto]: {
    // Auto theme uses system preference
    name: 'Auto',
    variant: ThemeVariant.Auto,
    colors: {} as ThemeColors, // Dynamically determined
    glass: {} as any,
    shadows: {} as any,
    animations: {
      duration: {
        fast: 150,
        normal: 300,
        slow: 500,
      },
      easing: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
      },
    },
  },
};

export const getTheme = (variant: ThemeVariant): Theme => {
  if (variant === ThemeVariant.Auto) {
    const prefersDark =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : true;
    return themes[prefersDark ? ThemeVariant.Dark : ThemeVariant.Light];
  }
  return themes[variant];
};

export const getSystemThemePreference = (): ThemeVariant => {
  if (typeof window === 'undefined') return ThemeVariant.Dark;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ThemeVariant.Dark
    : ThemeVariant.Light;
};

export const subscribeToSystemThemeChanges = (
  callback: (theme: ThemeVariant) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? ThemeVariant.Dark : ThemeVariant.Light);
  };

  mediaQuery.addEventListener('change', handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
};

/**
 * Utility function to convert hex color to RGB values
 * @param hex - Hex color string (e.g., '#3B82F6')
 * @returns RGB values as an array [r, g, b]
 */
const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
};

/**
 * Generate alpha variations of a color
 * @param colorName - Name of the color (e.g., 'primary')
 * @param hexColor - Hex color value (e.g., '#3B82F6')
 * @param root - Document root element
 */
const generateAlphaVariations = (colorName: string, hexColor: string, root: HTMLElement): void => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return;

  const [r, g, b] = rgb;
  // Extended alpha values to cover all CSS usage
  const alphaValues = [2, 3, 4, 6, 8, 10, 12, 20, 30, 40, 50, 60, 70, 80, 90];
  
  alphaValues.forEach(alpha => {
    const alphaDecimal = alpha / 100;
    root.style.setProperty(
      `--color-${colorName}-alpha-${alpha}`,
      `rgba(${r}, ${g}, ${b}, ${alphaDecimal})`
    );
  });
};

export const applyThemeToDocument = (theme: Theme): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply CSS custom properties for colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
    
    // Generate alpha variations for each color
    generateAlphaVariations(key, value, root);
  });

  // Apply glass morphism properties
  root.style.setProperty('--glass-blur', theme.glass.blur);
  root.style.setProperty('--glass-opacity', theme.glass.opacity.toString());
  root.style.setProperty('--glass-border', theme.glass.border);

  // Apply shadow properties
  root.style.setProperty('--shadow-sm', theme.shadows.sm);
  root.style.setProperty('--shadow-md', theme.shadows.md);
  root.style.setProperty('--shadow-lg', theme.shadows.lg);
  root.style.setProperty('--shadow-xl', theme.shadows.xl);

  // Apply animation properties
  root.style.setProperty('--animation-fast', `${theme.animations.duration.fast}ms`);
  root.style.setProperty('--animation-normal', `${theme.animations.duration.normal}ms`);
  root.style.setProperty('--animation-slow', `${theme.animations.duration.slow}ms`);

  // Apply special content script variables for extension context
  // These provide fallbacks when CSS custom properties aren't available
  root.style.setProperty('--lucaverse-primary', theme.colors.primary);
  root.style.setProperty('--lucaverse-accent', theme.colors.accent);
  root.style.setProperty('--lucaverse-success', theme.colors.success);
  root.style.setProperty('--lucaverse-error', theme.colors.error);
  root.style.setProperty('--lucaverse-success-dark', theme.variant === ThemeVariant.Dark ? '#059669' : '#10b981');
  root.style.setProperty('--lucaverse-error-dark', theme.variant === ThemeVariant.Dark ? '#DC2626' : '#ef4444');
  
  // Generate lucaverse-specific alpha variations for content scripts
  const lucaverseColors = {
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    success: theme.colors.success,
    error: theme.colors.error,
  };
  
  Object.entries(lucaverseColors).forEach(([key, value]) => {
    const rgb = hexToRgb(value);
    if (rgb) {
      const [r, g, b] = rgb;
      [10, 20, 30, 40, 50].forEach(alpha => {
        const alphaDecimal = alpha / 100;
        root.style.setProperty(
          `--lucaverse-${key}-alpha-${alpha}`,
          `rgba(${r}, ${g}, ${b}, ${alphaDecimal})`
        );
      });
    }
  });
};

export const themeConfig = {
  defaultTheme: ThemeVariant.Dark,
  themes,
  getTheme,
  getSystemThemePreference,
  subscribeToSystemThemeChanges,
  applyThemeToDocument,
} as const;

// Re-export ThemeVariant for convenience
export { ThemeVariant } from '@/types/components';

// Re-export for backwards compatibility
export type { Theme, ThemeColors } from '@/types/components';

export type ThemeConfig = typeof themeConfig;
