/**
 * Centralized Type Exports
 * Re-exports all types for easy importing
 */

// Theme types
export type {
  ColorPalette,
  NeutralColorPalette,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeAnimations,
  ThemeBreakpoints,
  Theme,
  ThemeVariants,
  ThemeVariant,
  ColorName,
  ColorShade,
  NeutralShade,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  SpacingKey,
  BorderRadiusKey,
  ShadowKey,
  AnimationDuration,
  AnimationEasing,
  BreakpointKey,
  CSSVariableReference,
  ThemeContextValue,
  CSSVariableMap,
  CSSVariableHelpers,
  StorageAdapter,
  ThemeProviderProps,
  UseThemeReturn,
  UseThemeConfigReturn,
  UseThemeVariantReturn,
  UseThemeToggleReturn,
} from './theme';

// I18n types
export type {
  TranslateFunction,
  TranslationNamespace,
  Translations,
  I18nConfig,
  LanguageNames,
  I18nStorageAdapter,
  I18nContextValue,
  I18nProviderProps,
  UseTranslationReturn,
  UseLanguageReturn,
  UseNamespaceTranslationsReturn,
  UseI18nReturn,
  TranslationKeyPath,
  SupportedLanguage,
  LanguageCode,
  TranslationParams,
  TranslationLoadResult,
  TranslationFile,
  PluralizationRules,
  LanguageMetadata,
  LanguageDefinition,
  I18nError,
  I18nErrorInfo,
} from './i18n';

// Common utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// React utility types
export type ReactChildren = React.ReactNode;
export type ReactComponent<P = {}> = React.ComponentType<P>;
export type ReactFC<P = {}> = React.FunctionComponent<P>;

// Event handler types
export type ClickHandler = React.MouseEventHandler<HTMLElement>;
export type ChangeHandler<T = HTMLInputElement> = React.ChangeEventHandler<T>;
export type SubmitHandler = React.FormEventHandler<HTMLFormElement>;
export type KeyboardHandler = React.KeyboardEventHandler<HTMLElement>;

// CSS utility types
export type CSSProperties = React.CSSProperties;
export type ClassName = string;
export type CSSValue = string | number;

// Generic component props
export interface BaseComponentProps {
  className?: ClassName;
  children?: ReactChildren;
  id?: string;
  'data-testid'?: string;
}

// Size variants
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Status variants
export type StatusVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic API response
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// Generic list response
export interface ListResponse<T = any> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
}

// Environment types
export type Environment = 'development' | 'production' | 'test';

// Platform types
export type Platform = 'web' | 'extension' | 'mobile' | 'desktop';

// Feature flags
export interface FeatureFlags {
  [key: string]: boolean;
}

// Configuration interface
export interface AppConfig {
  environment: Environment;
  platform: Platform;
  features: FeatureFlags;
  api?: {
    baseUrl: string;
    timeout: number;
  };
  theme?: {
    defaultVariant: ThemeVariant;
    persistPreference: boolean;
    detectSystemPreference: boolean;
  };
  i18n?: {
    defaultLanguage: SupportedLanguage;
    persistPreference: boolean;
    detectBrowserLanguage: boolean;
  };
}