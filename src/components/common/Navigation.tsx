import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeSwitcher, ThemeToggleButton } from '../ThemeSwitcher';
import { useTranslation, useLanguage } from '../../contexts/I18nContext';
import useNavigation from '../../hooks/useNavigation';

interface NavigationProps {
  showDevCenterLink?: boolean;
  className?: string;
}

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
                   rounded-lg px-4 py-2 pr-8 leading-tight 
                   focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                   transition-all duration-fast cursor-pointer
                   hover:bg-neutral-700 hover:border-neutral-600"
        aria-label={t('language.select')}
      >
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
      
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
  );
}

export default function Navigation({ showDevCenterLink = false, className = '' }: NavigationProps) {
  const { t } = useTranslation('common');
  const { goToDevCenter } = useNavigation();

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
          {t('app.name')}
        </Link>
        
        {showDevCenterLink && (
          <button
            onClick={() => goToDevCenter().catch(console.error)}
            className="px-3 py-1 text-sm bg-primary/20 hover:bg-primary/30 
                       border border-primary/40 rounded-lg transition-all duration-base
                       focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Return to Development Center"
          >
            ← Dev Center
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <LanguageSwitcher />
        <div className="hidden sm:block">
          <ThemeSwitcher />
        </div>
        <div className="sm:hidden">
          <ThemeToggleButton />
        </div>
      </div>
    </nav>
  );
}