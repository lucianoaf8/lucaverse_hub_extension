/**
 * Theme Switcher Component
 * Enhanced theme switching with i18n support and visual feedback
 */

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/I18nContext';

function ThemeSwitcher() {
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


function ThemeToggleButton() {
  const { theme, setTheme, isSystemTheme, setSystemTheme } = useTheme();
  const { t } = useTranslation();

  const handleToggle = () => {
    if (isSystemTheme) {
      setSystemTheme(false);
      setTheme('light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 
                 text-neutral-300 hover:text-primary transition-all duration-base
                 focus:outline-none focus:ring-2 focus:ring-primary/50"
      aria-label={t('theme.toggle')}
      title={t('theme.toggle')}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

export default ThemeSwitcher;
export { ThemeSwitcher, ThemeToggleButton };