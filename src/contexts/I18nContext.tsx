/**
 * I18n Context and Hooks
 * Manages internationalization state and provides translation functions
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { i18nConfig, detectUserLanguage, saveLanguagePreference, loadTranslations } from '../config/internationalization';

// Translation function type
type TranslateFunction = (key: string, params?: Record<string, unknown>, namespace?: string) => string;

// I18n context interface
interface I18nContextValue {
  language: string;
  setLanguage: (language: string) => Promise<void>;
  t: TranslateFunction;
  translations: Record<string, unknown>;
  isLoading: boolean;
  availableLanguages: string[];
}

// Create context
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

// Storage adapter interface for multi-platform support
interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

// Storage adapter is now imported from utils/storageAdapter

// I18n provider props
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: string;
  storageAdapter?: StorageAdapter;
}

// Helper function to get nested translation value
function getNestedTranslation(translations: Record<string, unknown>, key: string): unknown {
  const keys = key.split('.');
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return value;
}

// Helper function to interpolate values in translation string
function interpolate(text: string, params: Record<string, unknown>): string {
  let result = text;
  const { prefix, suffix } = i18nConfig.interpolation;

  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `${prefix}${key}${suffix}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return result;
}

// I18n Provider Component
export function I18nProvider({
  children,
  defaultLanguage,
}: I18nProviderProps) {
  // State for current language
  const [language, setLanguageState] = useState<string>(() => {
    return defaultLanguage || detectUserLanguage();
  });

  // State for translations
  const [translations, setTranslations] = useState<Record<string, unknown>>({});
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Available languages
  const availableLanguages = useMemo(() => i18nConfig.supportedLanguages, []);

  // Load translations for a language
  const loadLanguageTranslations = useCallback(async (lang: string) => {
    setIsLoading(true);
    const allTranslations: Record<string, unknown> = {};

    try {
      // Load all namespaces
      await Promise.all(
        i18nConfig.namespaces.map(async (namespace) => {
          const namespaceTranslations = await loadTranslations(lang, namespace);
          allTranslations[namespace] = namespaceTranslations;
        })
      );

      setTranslations(allTranslations);
    } catch (error) {
      console.error('Failed to load translations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set language with persistence
  const setLanguage = useCallback(async (newLanguage: string) => {
    if (!i18nConfig.supportedLanguages.includes(newLanguage)) {
      console.warn(`Language ${newLanguage} is not supported`);
      return;
    }

    setLanguageState(newLanguage);
    saveLanguagePreference(newLanguage);
    await loadLanguageTranslations(newLanguage);
  }, [loadLanguageTranslations]);

  // Translation function
  const t = useCallback<TranslateFunction>((key: string, params?: Record<string, unknown>, namespace?: string) => {
    const ns = namespace || i18nConfig.defaultNamespace;
    const namespaceTranslations = translations[ns] || {};
    
    // Try to get translation from specified namespace
    let translation = getNestedTranslation(namespaceTranslations, key);

    // Fallback to default namespace if not found
    if (translation === undefined && ns !== i18nConfig.defaultNamespace) {
      const defaultTranslations = translations[i18nConfig.defaultNamespace] || {};
      translation = getNestedTranslation(defaultTranslations, key);
    }

    // If translation is not found, return the key
    if (translation === undefined) {
      console.warn(`Translation not found for key: ${key} in namespace: ${ns}`);
      return key;
    }

    // If translation is not a string, return the key
    if (typeof translation !== 'string') {
      console.warn(`Translation for key ${key} is not a string`);
      return key;
    }

    // Interpolate params if provided
    if (params) {
      return interpolate(translation, params);
    }

    return translation;
  }, [translations]);

  // Initialize storage from persistent storage
  useEffect(() => {
    const initializeI18nStorage = async () => {
      try {
        const { storageUtils } = await import('../utils/storageAdapter');
        const { LANGUAGE_STORAGE_KEY } = await import('../config/internationalization');
        
        // Load language from persistent storage
        const persistentLanguage = await storageUtils.getString(LANGUAGE_STORAGE_KEY);
        
        // Update in-memory cache
        const windowWithStorage = window as unknown as { __i18nStorage?: Record<string, string> };
        if (!windowWithStorage.__i18nStorage) {
          windowWithStorage.__i18nStorage = {};
        }
        
        if (persistentLanguage) {
          windowWithStorage.__i18nStorage[LANGUAGE_STORAGE_KEY] = persistentLanguage;
          
          // Update state if different from current
          if (persistentLanguage !== language) {
            setLanguageState(persistentLanguage);
          }
        }
      } catch (error) {
        console.error('Failed to initialize i18n storage:', error);
      }
    };
    
    initializeI18nStorage();
  }, [language]);

  // Load initial translations
  useEffect(() => {
    loadLanguageTranslations(language);
  }, [language, loadLanguageTranslations]);

  // Context value
  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t,
    translations,
    isLoading,
    availableLanguages,
  }), [language, setLanguage, t, translations, isLoading, availableLanguages]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n context
export function useI18n() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}

// Hook for translation function
export function useTranslation(namespace?: string) {
  const { t, language, isLoading } = useI18n();
  
  const translate = useCallback((key: string, params?: Record<string, unknown>) => {
    return t(key, params, namespace);
  }, [t, namespace]);

  return {
    t: translate,
    language,
    isLoading,
  };
}

// Hook for language switching
export function useLanguage() {
  const { language, setLanguage, availableLanguages } = useI18n();
  
  return {
    language,
    setLanguage,
    availableLanguages,
  };
}

// Hook for specific namespace translations
export function useNamespaceTranslations(namespace: string) {
  const { translations } = useI18n();
  
  return useMemo(() => {
    return translations[namespace] || {};
  }, [translations, namespace]);
}