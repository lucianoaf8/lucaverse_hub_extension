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
    { path: '/dev-center', label: 'Dev Center', icon: '🏠' },
    { path: '/theme-demo', label: 'Theme Demo', icon: '🎨' },
    { path: '/animation-demo', label: 'Animations', icon: '⚡' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="dev-navigation">
      <style jsx>{`
        .dev-navigation {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .nav-link {
          padding: 6px 12px;
          color: var(--color-neutral-400);
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .nav-link:hover,
        .nav-link.active {
          background: var(--color-neutral-800);
          color: var(--color-neutral-200);
        }
      `}</style>
      <Link to="/dev-center" className="nav-link">Overview</Link>
      <Link to="/dev-center/theme" className="nav-link">Theme</Link>
      <Link to="/dev-center/components" className="nav-link">Components</Link>
      <Link to="/dev-center/layout" className="nav-link">Layout</Link>
      <Link to="/dev-center/validation" className="nav-link">Validation</Link>
    </nav>
  );
}