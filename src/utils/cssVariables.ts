/**
 * CSS Custom Properties Generator
 * Converts theme configuration to CSS variables
 */

import { Theme, ThemeVariant, themeVariants } from '../config/theme';

// Type for CSS variable references
export type CSSVariableReference = `var(--${string})`;

// Generate CSS variable name from object path
function generateCSSVariableName(path: string[]): string {
  return `--${path.join('-')}`;
}

// Convert a value to CSS-compatible string
function toCSSValue(value: any): string {
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
}

// Recursively convert theme object to CSS variables
function objectToCSSVariables(
  obj: Record<string, any>,
  prefix: string[] = []
): Record<string, string> {
  const variables: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const path = [...prefix, key];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively process nested objects
      Object.assign(variables, objectToCSSVariables(value, path));
    } else {
      // Convert key to CSS-friendly format (e.g., "2xl" -> "2xl")
      const cssKey = key.replace(/\./g, '-');
      const cssPath = [...prefix, cssKey];
      const variableName = generateCSSVariableName(cssPath);
      variables[variableName] = toCSSValue(value);
    }
  });

  return variables;
}

// Generate all CSS variables from theme
export function generateCSSVariables(theme: Theme): Record<string, string> {
  const variables: Record<string, string> = {};

  // Colors
  Object.assign(variables, objectToCSSVariables(theme.colors, ['color']));

  // Typography
  Object.assign(variables, objectToCSSVariables(theme.typography, ['typography']));

  // Spacing
  Object.assign(variables, objectToCSSVariables(theme.spacing, ['spacing']));

  // Border Radius
  Object.assign(variables, objectToCSSVariables(theme.borderRadius, ['radius']));

  // Shadows
  Object.assign(variables, objectToCSSVariables(theme.shadows, ['shadow']));

  // Backgrounds
  Object.assign(variables, objectToCSSVariables(theme.backgrounds, ['background']));

  // Animations
  Object.assign(variables, objectToCSSVariables(theme.animations, ['animation']));

  // Interactions
  Object.assign(variables, objectToCSSVariables(theme.interactions, ['interaction']));

  // Breakpoints
  Object.assign(variables, objectToCSSVariables(theme.breakpoints, ['breakpoint']));

  return variables;
}

// Inject CSS variables into document root
export function injectCSSVariables(variables: Record<string, string>): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

// Update theme by variant
export function applyTheme(variant: ThemeVariant): void {
  const theme = themeVariants[variant];
  const variables = generateCSSVariables(theme);
  injectCSSVariables(variables);

  // Add theme variant to root element for conditional styling
  document.documentElement.setAttribute('data-theme', variant);
}

// Get CSS variable reference
export function cssVar(path: string): CSSVariableReference {
  return `var(--${path})` as CSSVariableReference;
}

// Helper functions for common variable references
export const cssVars = {
  // Colors
  color: (color: string, shade?: string | number): CSSVariableReference => {
    return shade ? cssVar(`color-${color}-${shade}`) : cssVar(`color-${color}`);
  },

  // Typography
  fontSize: (size: string): CSSVariableReference => {
    return cssVar(`typography-fontSize-${size}`);
  },
  fontFamily: (family: string): CSSVariableReference => {
    return cssVar(`typography-fontFamily-${family}`);
  },
  fontWeight: (weight: string): CSSVariableReference => {
    return cssVar(`typography-fontWeight-${weight}`);
  },
  lineHeight: (height: string): CSSVariableReference => {
    return cssVar(`typography-lineHeight-${height}`);
  },

  // Spacing
  spacing: (size: string | number): CSSVariableReference => {
    const sizeKey = String(size).replace(/\./g, '-');
    return cssVar(`spacing-${sizeKey}`);
  },

  // Border Radius
  radius: (size: string): CSSVariableReference => {
    return cssVar(`radius-${size}`);
  },

  // Shadows
  shadow: (size: string): CSSVariableReference => {
    return cssVar(`shadow-${size}`);
  },

  // Backgrounds
  gradient: (type: string): CSSVariableReference => {
    return cssVar(`background-gradients-${type}`);
  },
  pattern: (type: string): CSSVariableReference => {
    return cssVar(`background-patterns-${type}`);
  },
  backdrop: (property: string, size?: string): CSSVariableReference => {
    return size ? cssVar(`background-backdrop-${property}-${size}`) : cssVar(`background-backdrop-${property}`);
  },

  // Animations
  duration: (speed: string): CSSVariableReference => {
    return cssVar(`animation-duration-${speed}`);
  },
  easing: (type: string): CSSVariableReference => {
    return cssVar(`animation-easing-${type}`);
  },

  // Interactions
  interaction: (state: string, property: string): CSSVariableReference => {
    return cssVar(`interaction-${state}-${property}`);
  },

  // Breakpoints
  breakpoint: (size: string): CSSVariableReference => {
    return cssVar(`breakpoint-${size}`);
  },
};

// Export CSS variable string builder for dynamic use
export function buildCSSVariableString(theme: Theme): string {
  const variables = generateCSSVariables(theme);
  return Object.entries(variables)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n');
}

// Get all CSS variables as a style object for inline styles
export function getCSSVariablesAsObject(theme: Theme): Record<string, string> {
  const variables = generateCSSVariables(theme);
  const styleObject: Record<string, string> = {};
  
  Object.entries(variables).forEach(([name, value]) => {
    // Convert CSS variable name to camelCase for React style prop
    const camelCaseName = name.replace(/^--/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    styleObject[camelCaseName] = value;
  });
  
  return styleObject;
}