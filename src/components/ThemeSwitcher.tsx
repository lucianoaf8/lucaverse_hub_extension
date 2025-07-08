/**
 * Theme Switcher Component
 * Enhanced theme switching with i18n support and visual feedback
 */

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/I18nContext';

export function ThemeSwitcher() {
  const { theme, setTheme, isSystemTheme, setSystemTheme, systemPreference } = useTheme();
  const { t } = useTranslation();

  // Handle theme change
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    
    if (value === 'system') {
      setSystemTheme(true);
    } else {
      setTheme(value as 'light' | 'dark');
    }
  };

  // Get current selection value
  const currentValue = isSystemTheme ? 'system' : theme;

  return (
    <div className="relative">
      <label htmlFor="theme-selector" className="sr-only">
        {t('theme.toggle')}
      </label>
      
      <div className="relative">
        <select
          id="theme-selector"
          value={currentValue}
          onChange={handleThemeChange}
          className="appearance-none bg-neutral-800 border border-neutral-700 text-neutral-50 
                     rounded-lg px-4 py-2 pr-8 leading-tight 
                     focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                     transition-all duration-fast cursor-pointer
                     hover:bg-neutral-700 hover:border-neutral-600"
          aria-label={t('theme.toggle')}
        >
          <option value="light">{t('theme.light')}</option>
          <option value="dark">{t('theme.dark')}</option>
          <option value="system">{t('theme.system')}</option>
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      
      {/* Visual indicator for current theme */}
      <div className="absolute -top-2 -right-2">
        <span
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs
            ${theme === 'dark' ? 'bg-neutral-700' : 'bg-yellow-400'}
            ${theme === 'dark' ? 'text-neutral-300' : 'text-yellow-900'}
            transition-all duration-base transform scale-100 animate-fade-in`}
          aria-label={theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </div>
      
      {/* System theme indicator */}
      {isSystemTheme && systemPreference && (
        <div className="mt-1 text-xs text-neutral-500">
          {t('theme.system')}: {systemPreference === 'dark' ? t('theme.dark') : t('theme.light')}
        </div>
      )}
    </div>
  );
}

// Compact theme toggle button variant
export function ThemeToggleButton() {
  const { theme, toggleTheme, isSystemTheme, setSystemTheme } = useTheme();
  const { t } = useTranslation();

  const handleClick = () => {
    // If using system theme, switch to manual theme selection
    if (isSystemTheme) {
      setSystemTheme(false);
    }
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center justify-center w-10 h-10 
                 bg-neutral-800 hover:bg-neutral-700 
                 border border-neutral-700 hover:border-neutral-600
                 rounded-lg transition-all duration-fast
                 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      aria-label={t('theme.toggle')}
      title={t('theme.toggle')}
    >
      <span className="sr-only">{t('theme.toggle')}</span>
      
      {/* Sun icon (light theme) */}
      <svg
        className={`absolute w-5 h-5 text-yellow-400 transition-all duration-base
          ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          clipRule="evenodd"
        />
      </svg>
      
      {/* Moon icon (dark theme) */}
      <svg
        className={`absolute w-5 h-5 text-neutral-300 transition-all duration-base
          ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
}