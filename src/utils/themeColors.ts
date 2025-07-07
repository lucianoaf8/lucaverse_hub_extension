/**
 * Theme Color Utilities
 * Provides runtime access to theme colors for dynamic styling
 */

import { PanelComponent } from '@/types/panel';

/**
 * Get CSS custom property value from the document
 * @param propertyName - CSS custom property name (with or without --)
 * @param fallback - Fallback value if property is not defined
 * @returns The computed CSS custom property value
 */
export const getCSSCustomProperty = (propertyName: string, fallback: string = ''): string => {
  if (typeof document === 'undefined') return fallback;
  
  const property = propertyName.startsWith('--') ? propertyName : `--${propertyName}`;
  const value = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  
  return value || fallback;
};

/**
 * Get current theme colors from CSS custom properties
 * @returns Object with current theme colors
 */
export const getCurrentThemeColors = () => ({
  primary: getCSSCustomProperty('--color-primary', '#00bcd4'),
  secondary: getCSSCustomProperty('--color-secondary', '#00ffff'),
  accent: getCSSCustomProperty('--color-accent', '#00e5ff'),
  background: getCSSCustomProperty('--color-background', '#0a0f1a'),
  surface: getCSSCustomProperty('--color-surface', '#0f1419'),
  text: getCSSCustomProperty('--color-text', '#f4f4f5'),
  textSecondary: getCSSCustomProperty('--color-textSecondary', '#d4d4d8'),
  border: getCSSCustomProperty('--color-border', 'rgba(0, 255, 255, 0.1)'),
  error: getCSSCustomProperty('--color-error', '#ff1744'),
  warning: getCSSCustomProperty('--color-warning', '#ffc107'),
  success: getCSSCustomProperty('--color-success', '#00ffff'),
  info: getCSSCustomProperty('--color-info', '#00e5ff'),
});

/**
 * Get semantic color for a panel component
 * @param component - The panel component type
 * @returns CSS custom property or fallback color
 */
export const getPanelThemeColor = (component: PanelComponent): string => {
  const colors = getCurrentThemeColors();
  
  const componentColorMap: Record<PanelComponent, string> = {
    [PanelComponent.SmartHub]: colors.primary,
    [PanelComponent.AIChat]: colors.success,
    [PanelComponent.TaskManager]: colors.warning,
    [PanelComponent.Productivity]: colors.accent,
  };
  
  return componentColorMap[component] || colors.primary;
};

/**
 * Get theme-aware color with alpha
 * @param colorName - Color name (primary, secondary, etc.)
 * @param alpha - Alpha value (10, 20, 30, etc.)
 * @param fallback - Fallback color if CSS custom property is not available
 * @returns CSS custom property with alpha or rgba fallback
 */
export const getThemeColorWithAlpha = (
  colorName: string, 
  alpha: number, 
  fallback: string = ''
): string => {
  const alphaProperty = `--color-${colorName}-alpha-${alpha}`;
  return getCSSCustomProperty(alphaProperty, fallback);
};

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string
 * @returns RGB values as [r, g, b] array
 */
export const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
};

/**
 * Create rgba color from hex and alpha
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const [r, g, b] = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get theme-aware canvas colors for drawing operations
 * @returns Object with colors suitable for canvas operations
 */
export const getCanvasThemeColors = () => {
  const colors = getCurrentThemeColors();
  
  return {
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };
};

/**
 * Get array of theme colors for color cycling
 * @returns Array of theme colors
 */
export const getThemeColorArray = (): string[] => {
  const colors = getCurrentThemeColors();
  return [colors.primary, colors.success, colors.warning, colors.accent, colors.error];
};

/**
 * Validates that all theme CSS custom properties are applied to the document
 * @returns true if all required theme properties are set
 */
export const validateThemePropertiesApplied = (): boolean => {
  if (typeof document === 'undefined') return false;

  const requiredProperties = [
    '--color-primary',
    '--color-secondary', 
    '--color-accent',
    '--color-background',
    '--color-surface',
    '--color-text',
    '--color-textSecondary',
    '--color-border',
    '--color-error',
    '--color-warning',
    '--color-success',
    '--color-info',
  ];

  const documentStyle = getComputedStyle(document.documentElement);
  
  for (const property of requiredProperties) {
    const value = documentStyle.getPropertyValue(property);
    if (!value || value.trim() === '') {
      console.warn(`Theme property ${property} is not set`);
      return false;
    }
  }

  return true;
};

/**
 * Legacy color mapping for migration purposes
 */
export const legacyColorMap: Record<string, string> = {
  // Blue colors -> Primary
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-blue-700': 'bg-primary/80',
  'text-blue-400': 'text-primary',
  'text-blue-500': 'text-primary',
  'border-blue-400': 'border-primary',
  'border-blue-500': 'border-primary',

  // Green colors -> Success  
  'bg-green-500': 'bg-success',
  'bg-green-600': 'bg-success',
  'bg-green-700': 'bg-success/80',
  'text-green-400': 'text-success',
  'text-green-500': 'text-success',
  'border-green-400': 'border-success',

  // Red colors -> Error
  'bg-red-500': 'bg-error',
  'bg-red-600': 'bg-error',
  'bg-red-700': 'bg-error/80',
  'text-red-400': 'text-error',
  'text-red-500': 'text-error',
  'border-red-400': 'border-error',
  'border-red-500': 'border-error',

  // Yellow/Orange colors -> Warning
  'bg-yellow-500': 'bg-warning',
  'bg-orange-500': 'bg-warning',
  'bg-orange-600': 'bg-warning',
  'bg-orange-700': 'bg-warning/80',
  'text-yellow-400': 'text-warning',
  'text-orange-400': 'text-warning',
  'border-yellow-400': 'border-warning',
  'border-orange-400': 'border-warning',

  // Purple colors -> Accent
  'bg-purple-500': 'bg-accent',
  'bg-purple-600': 'bg-accent',
  'bg-purple-700': 'bg-accent/80',
  'text-purple-400': 'text-accent',
  'text-purple-500': 'text-accent',
  'border-purple-400': 'border-accent',

  // Teal colors -> Secondary
  'bg-teal-600': 'bg-secondary',
  'bg-teal-700': 'bg-secondary/80',
  'text-teal-400': 'text-secondary',
  'border-teal-400': 'border-secondary',

  // Gray/Black/White -> Surface/Text
  'bg-gray-700': 'bg-surface',
  'bg-gray-800': 'bg-surface',
  'bg-gray-900': 'bg-surface',
  'bg-black': 'bg-surface',
  'text-white': 'text-text',
  'text-gray-400': 'text-textSecondary',
  'border-gray-400': 'border-border',
};

// Make theme utilities available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).themeUtils = {
    validateThemePropertiesApplied,
    getCurrentThemeColors,
    getCSSCustomProperty,
    getPanelThemeColor,
    getThemeColorWithAlpha,
    legacyColorMap,
  };
}