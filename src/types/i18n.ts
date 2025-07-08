/**
 * I18n Type Definitions
 * TypeScript interfaces for internationalization system
 */

// Translation function type with overloads
export interface TranslateFunction {
  (key: string): string;
  (key: string, params: Record<string, any>): string;
  (key: string, params: Record<string, any>, namespace: string): string;
}

// Translation namespace structure
export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}

// All translations structure
export interface Translations {
  [namespace: string]: TranslationNamespace;
}

// I18n configuration interface
export interface I18nConfig {
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: string[];
  languageDetection: {
    order: ('localStorage' | 'navigator' | 'htmlTag')[];
    caches: string[];
  };
  interpolation: {
    prefix: string;
    suffix: string;
  };
  namespaces: string[];
  defaultNamespace: string;
}

// Language names mapping
export type LanguageNames = Record<string, string>;

// Storage adapter interface for multi-platform support
export interface I18nStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// I18n context value interface
export interface I18nContextValue {
  language: string;
  setLanguage: (language: string) => Promise<void>;
  t: TranslateFunction;
  translations: Translations;
  isLoading: boolean;
  availableLanguages: string[];
}

// I18n provider props interface
export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: string;
  storageAdapter?: I18nStorageAdapter;
}

// Translation hook return type
export interface UseTranslationReturn {
  t: (key: string, params?: Record<string, any>) => string;
  language: string;
  isLoading: boolean;
}

// Language hook return type
export interface UseLanguageReturn {
  language: string;
  setLanguage: (language: string) => Promise<void>;
  availableLanguages: string[];
}

// Namespace translations hook return type
export interface UseNamespaceTranslationsReturn {
  [key: string]: any;
}

// I18n hook return type
export interface UseI18nReturn extends I18nContextValue {}

// Translation key paths - generated types for type safety
export type TranslationKeyPath = 
  // Common namespace
  | 'app.name'
  | 'app.description'
  | 'theme.light'
  | 'theme.dark'
  | 'theme.system'
  | 'theme.toggle'
  | 'language.select'
  | 'language.current'
  | 'navigation.home'
  | 'navigation.dashboard'
  | 'navigation.settings'
  | 'navigation.help'
  | 'navigation.about'
  | 'actions.save'
  | 'actions.cancel'
  | 'actions.delete'
  | 'actions.edit'
  | 'actions.add'
  | 'actions.close'
  | 'actions.confirm'
  | 'actions.back'
  | 'actions.next'
  | 'actions.finish'
  | 'status.loading'
  | 'status.saving'
  | 'status.success'
  | 'status.error'
  | 'status.warning'
  | 'status.info'
  // UI namespace
  | 'panels.smartHub.title'
  | 'panels.smartHub.description'
  | 'panels.aiChat.title'
  | 'panels.aiChat.description'
  | 'panels.taskManager.title'
  | 'panels.taskManager.description'
  | 'panels.productivity.title'
  | 'panels.productivity.description'
  | 'buttons.primary'
  | 'buttons.secondary'
  | 'buttons.danger'
  | 'forms.required'
  | 'forms.optional'
  | 'forms.placeholder.email'
  | 'forms.placeholder.password'
  | 'forms.placeholder.search'
  | 'forms.validation.required'
  | 'forms.validation.email'
  | 'forms.validation.minLength'
  | 'forms.validation.maxLength'
  | 'tooltips.help'
  | 'tooltips.info'
  | 'tooltips.settings'
  // Messages namespace
  | 'welcome.title'
  | 'welcome.subtitle'
  | 'welcome.greeting.morning'
  | 'welcome.greeting.afternoon'
  | 'welcome.greeting.evening'
  | 'welcome.greeting.night'
  | 'notifications.success.saved'
  | 'notifications.success.deleted'
  | 'notifications.success.updated'
  | 'notifications.success.created'
  | 'notifications.error.general'
  | 'notifications.error.network'
  | 'notifications.error.notFound'
  | 'notifications.error.unauthorized'
  | 'notifications.error.validation'
  | 'notifications.warning.unsavedChanges'
  | 'notifications.warning.deleteConfirm'
  | 'notifications.info.newVersion'
  | 'notifications.info.maintenance'
  | 'time.just_now'
  | 'time.minutes_ago'
  | 'time.hours_ago'
  | 'time.days_ago'
  | 'time.weeks_ago'
  | 'time.months_ago'
  | 'time.years_ago';

// Supported languages type
export type SupportedLanguage = 'en' | 'es';

// Language code validation
export type LanguageCode = string;

// Translation parameters for interpolation
export interface TranslationParams {
  [key: string]: string | number | boolean;
}

// Translation loading result
export interface TranslationLoadResult {
  success: boolean;
  namespace: string;
  language: string;
  translations?: TranslationNamespace;
  error?: Error;
}

// Translation file structure for JSON files
export interface TranslationFile {
  [key: string]: string | TranslationFile;
}

// Pluralization rules interface
export interface PluralizationRules {
  cardinal: (count: number) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
  ordinal?: (count: number) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
}

// Language metadata interface
export interface LanguageMetadata {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  pluralizationRules?: PluralizationRules;
}

// Complete language definition
export interface LanguageDefinition extends LanguageMetadata {
  translations: Translations;
}

// I18n error types
export type I18nError = 
  | 'LANGUAGE_NOT_SUPPORTED'
  | 'TRANSLATION_NOT_FOUND'
  | 'NAMESPACE_NOT_FOUND'
  | 'INTERPOLATION_ERROR'
  | 'LOADING_ERROR';

// I18n error interface
export interface I18nErrorInfo {
  type: I18nError;
  message: string;
  language?: string;
  namespace?: string;
  key?: string;
  originalError?: Error;
}