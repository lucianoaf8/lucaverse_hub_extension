import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeSwitcher, ThemeToggleButton } from '../ThemeSwitcher';
import { useTranslation, useLanguage } from '../../contexts/I18nContext';
import useNavigation from '../../hooks/useNavigation';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="relative">
      <label htmlFor="language-selector" className="sr-only">
        {t('language.select')}
      </label>
      
      <select
        id="language-selector"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="appearance-none bg-neutral-800 border border-neutral-700 text-neutral-50 
                   rounded-lg px-3 py-2 pr-8 text-sm
                   focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                   transition-all duration-fast cursor-pointer
                   hover:bg-neutral-700 hover:border-neutral-600"
        aria-label={t('language.select')}
      >
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
      
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

export default function DevNavigation() {
  const location = useLocation();
  const { t } = useTranslation('common');
  const { goToDashboard } = useNavigation();

  const navItems = [
    { path: '/', label: 'Dev Center', icon: '🏠' },
    { path: '/theme-demo', label: 'Theme Demo', icon: '🎨' },
    { path: '/animation-demo', label: 'Animations', icon: '⚡' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-elevated border-b border-neutral-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
              {t('app.name')} Dev
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-base ${
                    isActivePath(item.path)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-neutral-300 hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => goToDashboard().catch(console.error)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg 
                         font-medium transition-all duration-base
                         focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                         shadow-lg hover:shadow-xl"
              aria-label="Launch Production Dashboard"
            >
              <span className="mr-2">🚀</span>
              Launch Dashboard
            </button>
            
            <LanguageSwitcher />
            
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            <div className="sm:hidden">
              <ThemeToggleButton />
            </div>
          </div>
        </div>

        <div className="md:hidden mt-4 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-base ${
                isActivePath(item.path)
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-neutral-300 hover:text-primary hover:bg-primary/10'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {location.pathname !== '/' && (
          <div className="mt-4 text-sm text-neutral-400">
            <span className="mr-2">📍</span>
            <Link to="/" className="hover:text-primary transition-colors">
              Dev Center
            </Link>
            <span className="mx-2">→</span>
            <span className="text-primary">
              {navItems.find(item => item.path === location.pathname)?.label || 'Current Section'}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}