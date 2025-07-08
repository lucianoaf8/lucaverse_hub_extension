/**
 * Main App Component
 * Integrates theme and i18n systems with sample content
 */

import React from 'react';
import { ThemeSwitcher, ThemeToggleButton } from './components/ThemeSwitcher';
import { useTranslation } from './contexts/I18nContext';
import { useLanguage } from './contexts/I18nContext';
import './index.css';

// Language Switcher Component
function LanguageSwitcher() {
  const { language, setLanguage, availableLanguages } = useLanguage();
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
        <option value="es">Español</option>
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

// Sample Panel Component
function Panel({ title, description, colorClass = 'text-primary' }: { 
  title: string; 
  description: string; 
  colorClass?: string; 
}) {
  return (
    <div className="panel animate-fade-in">
      <h3 className={`text-xl font-semibold mb-3 ${colorClass}`}>
        {title}
      </h3>
      <p className="text-neutral-300 mb-4">
        {description}
      </p>
      <div className="flex gap-2">
        <button className="btn btn-primary">
          Primary Action
        </button>
        <button className="btn btn-secondary">
          Secondary
        </button>
      </div>
    </div>
  );
}

function App() {
  const { t } = useTranslation('ui');
  const { t: tCommon } = useTranslation('common');
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-base">
      {/* Header */}
      <header className="border-b border-neutral-700 bg-surface">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">
                {tCommon('app.name')}
              </h1>
              <p className="text-neutral-400 hidden md:block">
                {tCommon('app.description')}
              </p>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4 text-primary animate-fade-in">
            Welcome to Lucaverse Hub
          </h2>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto animate-slide-up">
            Your centralized productivity dashboard with a beautiful theme system and multilingual support.
          </p>
        </section>

        {/* Dashboard Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Panel
            title={t('panels.smartHub.title')}
            description={t('panels.smartHub.description')}
            colorClass="text-primary"
          />
          
          <Panel
            title={t('panels.aiChat.title')}
            description={t('panels.aiChat.description')}
            colorClass="text-secondary"
          />
          
          <Panel
            title={t('panels.taskManager.title')}
            description={t('panels.taskManager.description')}
            colorClass="text-warning"
          />
          
          <Panel
            title={t('panels.productivity.title')}
            description={t('panels.productivity.description')}
            colorClass="text-success"
          />
        </section>

        {/* Features Section */}
        <section className="bg-elevated rounded-xl p-8 mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center text-primary">
            System Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-2xl">🎨</span>
              </div>
              <h4 className="font-semibold mb-2">Theme System</h4>
              <p className="text-neutral-400 text-sm">
                Complete design system with light/dark modes and system preference detection
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary text-2xl">🌍</span>
              </div>
              <h4 className="font-semibold mb-2">Internationalization</h4>
              <p className="text-neutral-400 text-sm">
                Multi-language support with dynamic translation loading and fallbacks
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-success text-2xl">⚡</span>
              </div>
              <h4 className="font-semibold mb-2">Performance</h4>
              <p className="text-neutral-400 text-sm">
                Optimized CSS custom properties and efficient React contexts
              </p>
            </div>
          </div>
        </section>

        {/* Action Buttons Demo */}
        <section className="text-center">
          <h3 className="text-xl font-semibold mb-6">Component Demo</h3>
          
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <button className="btn btn-primary">
              {tCommon('actions.save')}
            </button>
            <button className="btn btn-secondary">
              {tCommon('actions.cancel')}
            </button>
            <button className="btn" style={{ 
              backgroundColor: 'var(--color-success-500)', 
              color: 'var(--color-neutral-50)',
              borderColor: 'var(--color-success-500)'
            }}>
              {tCommon('status.success')}
            </button>
            <button className="btn" style={{ 
              backgroundColor: 'var(--color-warning-500)', 
              color: 'var(--color-neutral-900)',
              borderColor: 'var(--color-warning-500)'
            }}>
              {tCommon('status.warning')}
            </button>
            <button className="btn" style={{ 
              backgroundColor: 'var(--color-danger-500)', 
              color: 'var(--color-neutral-50)',
              borderColor: 'var(--color-danger-500)'
            }}>
              {tCommon('status.error')}
            </button>
          </div>
          
          <div className="space-y-4 max-w-md mx-auto">
            <input 
              type="text" 
              placeholder={t('forms.placeholder.search')}
              className="input"
            />
            <input 
              type="email" 
              placeholder={t('forms.placeholder.email')}
              className="input"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-700 bg-surface mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-neutral-400">
            <p>&copy; 2024 Lucaverse Hub. Built with React, TypeScript, and Tailwind CSS.</p>
            <p className="text-sm mt-2">
              Theme System • Internationalization • Modern Design
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;