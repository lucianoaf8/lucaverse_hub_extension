/**
 * Animation Examples Component
 * Demonstrates the Task 11 animation system in action
 */

import React, { useState } from 'react';
import { useTranslation } from '../contexts/I18nContext';

export function AnimationExamples() {
  const { t } = useTranslation('ui');
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const handleDemoClick = (demoId: string) => {
    setActiveDemo(demoId);
    setTimeout(() => setActiveDemo(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-4 animate-fade-in">
          Animation System Demo
        </h2>
        <p className="text-neutral-300 max-w-2xl mx-auto animate-slide-up">
          Experience the comprehensive animation system with entrance animations, 
          interactive states, background patterns, and accessibility features.
        </p>
      </div>

      {/* Entrance Animations */}
      <section className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary">Entrance Animations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="animate-fade-in bg-primary/10 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-primary rounded mx-auto mb-2"></div>
            <span className="text-sm">Fade In</span>
          </div>
          <div className="animate-slide-up bg-secondary/10 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-secondary rounded mx-auto mb-2"></div>
            <span className="text-sm">Slide Up</span>
          </div>
          <div className="animate-slide-down bg-success/10 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-success rounded mx-auto mb-2"></div>
            <span className="text-sm">Slide Down</span>
          </div>
          <div className="animate-scale-in bg-warning/10 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-warning rounded mx-auto mb-2"></div>
            <span className="text-sm">Scale In</span>
          </div>
        </div>
      </section>

      {/* Interactive Demonstrations */}
      <section className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary">Interactive States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="group bg-primary/20 hover:bg-primary/30 border border-primary/40 
                       rounded-lg p-4 transition-all duration-base
                       hover:scale-hover hover:shadow-lg active:scale-active
                       focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
            onClick={() => handleDemoClick('hover')}
          >
            <div className="text-primary mb-2">🎯</div>
            <div className="font-medium">Hover Effects</div>
            <div className="text-sm text-neutral-400">Scale + brightness + shadow</div>
          </button>

          <button 
            className="group bg-success/20 hover:bg-success/30 border border-success/40 
                       rounded-lg p-4 transition-all duration-base
                       hover:scale-hover hover:brightness-hover active:scale-active active:brightness-active
                       focus:ring-2 focus:ring-success/50 focus:ring-offset-2 focus:ring-offset-background"
            onClick={() => handleDemoClick('press')}
          >
            <div className="text-success mb-2">👆</div>
            <div className="font-medium">Press States</div>
            <div className="text-sm text-neutral-400">Active scaling + focus rings</div>
          </button>

          <button 
            disabled
            className="bg-neutral-700 border border-neutral-600 rounded-lg p-4 
                       opacity-50 cursor-not-allowed grayscale-100"
          >
            <div className="text-neutral-400 mb-2">🚫</div>
            <div className="font-medium">Disabled State</div>
            <div className="text-sm text-neutral-500">Opacity + grayscale + cursor</div>
          </button>
        </div>
      </section>

      {/* Continuous Animations */}
      <section className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary">Continuous Animations</h3>
        <div className="flex flex-wrap gap-6 justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full animate-pulse mx-auto mb-2"></div>
            <span className="text-sm">Pulse</span>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary rounded-full animate-bounce mx-auto mb-2"></div>
            <span className="text-sm">Bounce</span>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-warning rounded-full animate-spin mx-auto mb-2 flex items-center justify-center">
              <div className="w-4 h-4 bg-background rounded-full"></div>
            </div>
            <span className="text-sm">Spin</span>
          </div>
          <div className="text-center relative">
            <div className="w-16 h-16 bg-success rounded-full animate-ping mx-auto mb-2"></div>
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-success rounded-full"></div>
            <span className="text-sm">Ping</span>
          </div>
        </div>
      </section>

      {/* Background Patterns */}
      <section className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary">Background Patterns</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-medium">
            Primary Gradient
          </div>
          <div className="h-24 rounded-lg bg-gradient-hero flex items-center justify-center text-white font-medium">
            Hero Gradient
          </div>
          <div 
            className="h-24 rounded-lg flex items-center justify-center text-primary font-medium border border-neutral-600"
            style={{ 
              backgroundImage: 'var(--background-patterns-dots)',
              backgroundSize: '20px 20px'
            }}
          >
            Dot Pattern
          </div>
          <div 
            className="h-24 rounded-lg flex items-center justify-center text-primary font-medium border border-neutral-600"
            style={{ 
              backgroundImage: 'var(--background-patterns-grid)',
              backgroundSize: '20px 20px'
            }}
          >
            Grid Pattern
          </div>
        </div>
      </section>

      {/* Backdrop Effects */}
      <section className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary">Backdrop Effects</h3>
        <div className="relative h-48 bg-gradient-hero rounded-lg overflow-hidden">
          {/* Background content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl animate-pulse">🌟</div>
          </div>
          
          {/* Backdrop blur overlay */}
          <div className="absolute inset-4 bg-background/60 backdrop-blur-md rounded-lg 
                          border border-primary/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-primary font-semibold mb-2">Backdrop Blur</div>
              <div className="text-sm text-neutral-300">
                Background content visible through blur effect
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animation Triggers */}
      {activeDemo && (
        <section className="bg-elevated rounded-xl p-6 animate-slide-up">
          <h3 className="text-xl font-semibold mb-4 text-success">
            ✨ Animation Triggered: {activeDemo}
          </h3>
          <p className="text-neutral-300">
            This section demonstrates dynamic animation triggers. The animation system 
            supports programmatic control for complex interactive experiences.
          </p>
          <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/30">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-success font-medium">
                Animation system active - accessibility respected
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Accessibility Note */}
      <section className="bg-warning/10 border border-warning/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="text-warning text-xl">♿</div>
          <div>
            <h3 className="text-lg font-semibold text-warning mb-2">
              Accessibility First
            </h3>
            <p className="text-neutral-300 text-sm">
              All animations respect the <code className="bg-neutral-800 px-2 py-1 rounded text-primary">
              prefers-reduced-motion</code> media query. Users who prefer reduced motion 
              will see instant transitions instead of animations, maintaining full 
              functionality while respecting their accessibility needs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AnimationExamples;