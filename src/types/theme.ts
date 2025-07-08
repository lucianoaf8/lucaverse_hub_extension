/**
 * Theme Type Definitions
 * Complete TypeScript interfaces for the theme system
 */

// Base color palette structure
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// Extended neutral palette with 950 shade
export interface NeutralColorPalette extends ColorPalette {
  950: string;
}

// Complete theme colors interface
export interface ThemeColors {
  primary: ColorPalette;
  secondary: ColorPalette;
  success: ColorPalette;
  warning: ColorPalette;
  danger: ColorPalette;
  neutral: NeutralColorPalette;
}

// Typography system interface
export interface ThemeTypography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    thin: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
  };
  lineHeight: {
    none: string;
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
}

// Spacing system interface
export interface ThemeSpacing {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

// Border radius system interface
export interface ThemeBorderRadius {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

// Shadow system interface
export interface ThemeShadows {
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

// Animation system interface
export interface ThemeAnimations {
  duration: {
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
  easing: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
  };
}

// Breakpoints system interface
export interface ThemeBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Complete theme interface
export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
  breakpoints: ThemeBreakpoints;
}

// Theme variants
export interface ThemeVariants {
  light: Theme;
  dark: Theme;
}

// Theme variant keys
export type ThemeVariant = keyof ThemeVariants;

// Color names utility type
export type ColorName = keyof ThemeColors;

// Color shade utility type  
export type ColorShade = keyof ColorPalette;

// Neutral shade utility type
export type NeutralShade = keyof NeutralColorPalette;

// Font family utility type
export type FontFamily = keyof ThemeTypography['fontFamily'];

// Font size utility type
export type FontSize = keyof ThemeTypography['fontSize'];

// Font weight utility type
export type FontWeight = keyof ThemeTypography['fontWeight'];

// Line height utility type
export type LineHeight = keyof ThemeTypography['lineHeight'];

// Spacing key utility type
export type SpacingKey = keyof ThemeSpacing;

// Border radius utility type
export type BorderRadiusKey = keyof ThemeBorderRadius;

// Shadow utility type
export type ShadowKey = keyof ThemeShadows;

// Animation duration utility type
export type AnimationDuration = keyof ThemeAnimations['duration'];

// Animation easing utility type
export type AnimationEasing = keyof ThemeAnimations['easing'];

// Breakpoint utility type
export type BreakpointKey = keyof ThemeBreakpoints;

// CSS variable reference type
export type CSSVariableReference = `var(--${string})`;

// Theme context value interface
export interface ThemeContextValue {
  theme: ThemeVariant;
  themeConfig: Theme;
  setTheme: (theme: ThemeVariant) => void;
  toggleTheme: () => void;
  systemPreference: ThemeVariant | null;
  isSystemTheme: boolean;
  setSystemTheme: (useSystem: boolean) => void;
}

// CSS variable generator utility types
export type CSSVariableMap = Record<string, string>;

export interface CSSVariableHelpers {
  color: (color: ColorName, shade?: ColorShade | NeutralShade) => CSSVariableReference;
  fontSize: (size: FontSize) => CSSVariableReference;
  fontFamily: (family: FontFamily) => CSSVariableReference;
  fontWeight: (weight: FontWeight) => CSSVariableReference;
  lineHeight: (height: LineHeight) => CSSVariableReference;
  spacing: (size: SpacingKey) => CSSVariableReference;
  radius: (size: BorderRadiusKey) => CSSVariableReference;
  shadow: (size: ShadowKey) => CSSVariableReference;
  duration: (speed: AnimationDuration) => CSSVariableReference;
  easing: (type: AnimationEasing) => CSSVariableReference;
  breakpoint: (size: BreakpointKey) => CSSVariableReference;
}

// Storage adapter interface for multi-platform support
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// Theme provider props interface
export interface ThemeProviderProps {
  children: React.ReactNode;
  storageAdapter?: StorageAdapter;
  storageKey?: string;
  defaultTheme?: ThemeVariant;
  detectSystemPreference?: boolean;
}

// Theme hook return types
export interface UseThemeReturn extends ThemeContextValue {}

export interface UseThemeConfigReturn {
  themeConfig: Theme;
}

export interface UseThemeVariantReturn {
  theme: ThemeVariant;
}

export interface UseThemeToggleReturn {
  toggleTheme: () => void;
}