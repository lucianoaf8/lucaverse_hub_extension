import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common';
import DevNavigation from '../components/dev-center/DevNavigation';
import ComponentLibrary from '../components/dev-center/ComponentLibrary';
import ValidationRunner from '../components/dev-center/ValidationRunner';
import ThemePlayground from '../components/dev-center/ThemePlayground';
import useNavigation from '../hooks/useNavigation';

export default function DevCenter() {
  const { goToDashboard } = useNavigation();

  const demoCards = [
    {
      id: 'theme-system',
      title: 'Theme System Demo',
      description: 'Complete design system with light/dark modes and comprehensive theme testing',
      icon: '🎨',
      link: '/theme-demo',
      color: 'primary'
    },
    {
      id: 'animation-showcase',
      title: 'Animation Showcase',
      description: 'Interactive animation controls, performance monitoring, and timing examples',
      icon: '⚡',
      link: '/animation-demo',
      color: 'secondary'
    },
    {
      id: 'component-library',
      title: 'Component Library',
      description: 'Interactive component showcase with code examples and usage documentation',
      icon: '📚',
      link: '#component-library',
      color: 'success'
    },
    {
      id: 'validation-runner',
      title: 'Validation Runner',
      description: 'Comprehensive validation system for guidelines, architecture, and performance',
      icon: '🔍',
      link: '#validation-runner',
      color: 'warning'
    },
    {
      id: 'theme-playground',
      title: 'Theme Playground',
      description: 'Advanced theme testing interface with live preview and property controls',
      icon: '🎛️',
      link: '#theme-playground',
      color: 'info'
    }
  ];

  return (
    <Layout navigation={<DevNavigation />}>
      <div className="space-y-12">
        <section className="text-center">
          <h1 className="text-5xl font-bold text-primary mb-6 animate-fade-in">
            Development Center
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto mb-8 animate-slide-up">
            Your comprehensive development environment for testing, validation, and component exploration.
            Build and test features before deploying to production.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => goToDashboard().catch(console.error)}
              className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg 
                         font-semibold text-lg transition-all duration-base
                         focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                         shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="mr-3">🚀</span>
              Launch Production Dashboard
            </button>
            
            <p className="text-sm text-neutral-400">
              Ready to go live? Launch the production dashboard with full features
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demoCards.map((card) => (
            <div key={card.id} className="group relative">
              {card.link.startsWith('#') ? (
                <div className="panel hover:scale-105 transition-transform duration-base cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-${card.color}/20 rounded-lg flex items-center justify-center mr-4`}>
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                    <h3 className={`text-2xl font-semibold text-${card.color}`}>
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-neutral-300 mb-6 text-lg leading-relaxed">
                    {card.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-${card.color} font-medium`}>
                      Available below ↓
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm text-neutral-400">Scroll to section</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to={card.link} className="block">
                  <div className="panel hover:scale-105 transition-transform duration-base">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-${card.color}/20 rounded-lg flex items-center justify-center mr-4`}>
                        <span className="text-2xl">{card.icon}</span>
                      </div>
                      <h3 className={`text-2xl font-semibold text-${card.color}`}>
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-neutral-300 mb-6 text-lg leading-relaxed">
                      {card.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`text-${card.color} font-medium`}>
                        Explore Demo →
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm text-neutral-400">Click to open</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </section>

        <section id="component-library" className="scroll-mt-20">
          <ComponentLibrary />
        </section>

        <section id="validation-runner" className="scroll-mt-20">
          <ValidationRunner />
        </section>

        <section id="theme-playground" className="scroll-mt-20">
          <ThemePlayground />
        </section>

        <section className="bg-elevated rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-primary mb-6 text-center">
            Development Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-primary text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Theme System</h3>
              <p className="text-neutral-400">
                Complete design system with light/dark modes, system preference detection, 
                and real-time theme switching with instant preview.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-secondary text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Internationalization</h3>
              <p className="text-neutral-400">
                Multi-language support with dynamic translation loading, fallbacks, 
                and seamless language switching across all components.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-success text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Performance</h3>
              <p className="text-neutral-400">
                Optimized CSS custom properties, efficient React contexts, 
                and comprehensive performance monitoring and validation tools.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}