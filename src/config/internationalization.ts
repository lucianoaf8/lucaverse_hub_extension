/**
 * I18n Configuration
 * Internationalization setup with language detection and storage
 */

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

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  supportedLanguages: ['en', 'pt'],
  languageDetection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
  },
  interpolation: {
    prefix: '{{',
    suffix: '}}',
  },
  namespaces: ['common', 'ui', 'messages', 'errors'],
  defaultNamespace: 'common',
};

// Language names for display
export const languageNames: Record<string, string> = {
  en: 'English',
  pt: 'Português',
};

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY = 'lucaverse-language';

// Function to detect user's preferred language
export function detectUserLanguage(): string {
  // Check storage adapter
  if (typeof window !== 'undefined') {
    const storedLang = (window as unknown as { __i18nStorage?: Record<string, string> }).__i18nStorage?.[LANGUAGE_STORAGE_KEY];
    if (storedLang && i18nConfig.supportedLanguages.includes(storedLang)) {
      return storedLang;
    }
  }

  // Check navigator language
  if (typeof window !== 'undefined' && window.navigator) {
    const browserLang = window.navigator.language.split('-')[0];
    if (i18nConfig.supportedLanguages.includes(browserLang)) {
      return browserLang;
    }
  }

  // Check HTML lang attribute
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.lang.split('-')[0];
    if (htmlLang && i18nConfig.supportedLanguages.includes(htmlLang)) {
      return htmlLang;
    }
  }

  // Return default
  return i18nConfig.defaultLanguage;
}

// Function to save language preference
export function saveLanguagePreference(language: string): void {
  if (typeof window !== 'undefined') {
    // Store in memory cache for synchronous access
    const windowWithStorage = window as unknown as { __i18nStorage?: Record<string, string> };
    if (!windowWithStorage.__i18nStorage) {
      windowWithStorage.__i18nStorage = {};
    }
    windowWithStorage.__i18nStorage[LANGUAGE_STORAGE_KEY] = language;
    
    // Also store in persistent storage asynchronously
    import('../utils/storageAdapter').then(({ storageUtils }) => {
      storageUtils.setString(LANGUAGE_STORAGE_KEY, language).catch(error => {
        console.error('Failed to save language preference:', error);
      });
    });
  }
  
  // Also update HTML lang attribute
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
}

// Function to load translation file
export async function loadTranslations(language: string, namespace: string = 'common'): Promise<Record<string, unknown>> {
  try {
    const module = await import(`../locales/${language}/${namespace}.json`);
    return module.default;
  } catch (error) {
    console.warn(`Failed to load translations for ${language}/${namespace}`, error);
    
    // Try fallback language
    if (language !== i18nConfig.fallbackLanguage) {
      try {
        const fallbackModule = await import(`../locales/${i18nConfig.fallbackLanguage}/${namespace}.json`);
        return fallbackModule.default;
      } catch (fallbackError) {
        console.error(`Failed to load fallback translations for ${namespace}`, fallbackError);
        return {};
      }
    }
    
    return {};
  }
}