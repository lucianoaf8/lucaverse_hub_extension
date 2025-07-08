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
  supportedLanguages: ['en', 'es'],
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
  es: 'Español',
};

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY = 'lucaverse-language';

// Function to detect user's preferred language
export function detectUserLanguage(): string {
  // Check localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
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
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
  
  // Also update HTML lang attribute
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
  }
}

// Function to load translation file
export async function loadTranslations(language: string, namespace: string = 'common'): Promise<Record<string, any>> {
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