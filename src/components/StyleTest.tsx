/**
 * Style Test Component - Validates all design system elements
 * Tests glassmorphism, typography, colors, animations, and component variants
 */

import React from 'react';
import {
  buttonStyles,
  panelStyles,
  inputStyles,
  priorityBadgeStyles,
  dragHandleStyles,
  resizeHandleStyles,
  cn,
} from '@/utils/styleUtils';
import { ComponentVariant, ComponentSize } from '@/types/components';

export const StyleTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-primary p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-header-title text-primary-400 glow-sm">
          Lucaverse Hub Design System Test
        </h1>
        <p className="text-header-secondary-info text-text-secondary">
          Validating all visual design elements and components
        </p>
      </div>

      {/* Glass Panels Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Glass Panels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Default Panel */}
          <div className={panelStyles({ variant: ComponentVariant.Default })}>
            <h3 className="text-lg font-medium text-primary-400 mb-2">Default Panel</h3>
            <p className="text-text-secondary text-sm">
              Primary glass panel with subtle glassmorphism effects
            </p>
            <div className="mt-4 flex gap-2">
              <div className={dragHandleStyles()} title="Drag Handle" />
              <div className={resizeHandleStyles('se')} title="Resize Handle" />
            </div>
          </div>

          {/* Card Panel */}
          <div className={panelStyles({ variant: ComponentVariant.Primary })}>
            <h3 className="text-lg font-medium text-secondary-400 mb-2">Card Panel</h3>
            <p className="text-text-secondary text-sm">Enhanced glass card with medium opacity</p>
            <div className="mt-4">
              <div className={priorityBadgeStyles(2)}>High Priority</div>
            </div>
          </div>

          {/* Surface Panel */}
          <div className={panelStyles({ variant: ComponentVariant.Secondary })}>
            <h3 className="text-lg font-medium text-accent-500 mb-2">Surface Panel</h3>
            <p className="text-text-secondary text-sm">
              Light glass surface for subtle backgrounds
            </p>
          </div>

          {/* Overlay Panel */}
          <div className={panelStyles({ variant: ComponentVariant.Accent })}>
            <h3 className="text-lg font-medium text-info mb-2">Overlay Panel</h3>
            <p className="text-text-secondary text-sm">Dark glass overlay for prominent content</p>
          </div>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Button Variants</h2>

        <div className="space-y-4">
          {/* Primary Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              className={buttonStyles({
                variant: ComponentVariant.Primary,
                size: ComponentSize.Small,
              })}
            >
              Small Primary
            </button>
            <button
              className={buttonStyles({
                variant: ComponentVariant.Primary,
                size: ComponentSize.Medium,
              })}
            >
              Medium Primary
            </button>
            <button
              className={buttonStyles({
                variant: ComponentVariant.Primary,
                size: ComponentSize.Large,
              })}
            >
              Large Primary
            </button>
            <button
              className={buttonStyles({
                variant: ComponentVariant.Primary,
                size: ComponentSize.ExtraLarge,
              })}
            >
              XL Primary
            </button>
          </div>

          {/* Variant Types */}
          <div className="flex flex-wrap gap-4">
            <button className={buttonStyles({ variant: ComponentVariant.Default })}>Default</button>
            <button className={buttonStyles({ variant: ComponentVariant.Secondary })}>
              Secondary
            </button>
            <button className={buttonStyles({ variant: ComponentVariant.Accent })}>Accent</button>
            <button className={buttonStyles({ variant: ComponentVariant.Ghost })}>Ghost</button>
            <button className={buttonStyles({ variant: ComponentVariant.Outline })}>Outline</button>
          </div>

          {/* State Variants */}
          <div className="flex flex-wrap gap-4">
            <button className={buttonStyles({ disabled: true })}>Disabled</button>
            <button className={buttonStyles({ loading: true })}>Loading</button>
            <button className={cn(buttonStyles(), 'state-focused')}>Focused</button>
          </div>
        </div>
      </section>

      {/* Input Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Input Components</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input type="text" placeholder="Default input" className={inputStyles()} />
            <input
              type="text"
              placeholder="Primary input"
              className={inputStyles({ variant: ComponentVariant.Primary })}
            />
            <input
              type="text"
              placeholder="Error state"
              className={inputStyles({ error: true })}
              defaultValue="Invalid input"
            />
            <input
              type="text"
              placeholder="Disabled input"
              className={inputStyles({ disabled: true })}
              disabled
            />
          </div>

          <div className="space-y-4">
            <textarea placeholder="Glass textarea" className="glass-textarea" rows={4} />
            <select className="glass-select">
              <option>Select option</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        </div>
      </section>

      {/* Priority Indicators */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Priority System</h2>

        <div className="flex flex-wrap gap-4">
          <div className={priorityBadgeStyles(1)}>Critical</div>
          <div className={priorityBadgeStyles(2)}>High</div>
          <div className={priorityBadgeStyles(3)}>Medium</div>
          <div className={priorityBadgeStyles(4)}>Low</div>
          <div className={priorityBadgeStyles(5)}>Minimal</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="priority-indicator priority-1" title="Critical" />
          <div className="priority-indicator priority-2" title="High" />
          <div className="priority-indicator priority-3" title="Medium" />
          <div className="priority-indicator priority-4" title="Low" />
          <div className="priority-indicator priority-5" title="Minimal" />
        </div>
      </section>

      {/* Typography Scale */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Typography Scale</h2>

        <div className="space-y-3">
          <div className="text-4xl font-primary text-primary-400">Header Title (4xl)</div>
          <div className="text-3xl font-primary text-secondary-400">3XL Primary Font</div>
          <div className="text-2xl font-secondary text-accent-500">2XL Secondary Font</div>
          <div className="text-xl font-tertiary text-text-primary">XL Tertiary Font</div>
          <div className="text-lg text-text-primary">Large Text</div>
          <div className="text-base text-text-secondary">Base Text</div>
          <div className="text-sm text-text-muted">Small Text</div>
          <div className="text-xs text-text-muted">Extra Small Text</div>
        </div>

        <div className="space-y-2">
          <div className="font-mono text-lg text-accent-400">Monospace Font (JetBrains Mono)</div>
          <div className="text-glow text-primary-400">Glowing Text Effect</div>
          <div className="text-shadow-lg text-white">Text with Shadow</div>
        </div>
      </section>

      {/* Animation States */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Animation States</h2>

        <div className="flex flex-wrap gap-4">
          <div className={cn(panelStyles(), 'animate-appear')}>
            <div className="p-4 text-center">Appear Animation</div>
          </div>
          <div className={cn(panelStyles(), 'animate-hover')}>
            <div className="p-4 text-center">Hover Animation</div>
          </div>
          <div className={cn(panelStyles(), 'animate-pulse-glow')}>
            <div className="p-4 text-center">Pulse Glow</div>
          </div>
        </div>
      </section>

      {/* Neural Network Background */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Neural Background</h2>

        <div className="neural-bg h-32 rounded-lg border border-glass-border relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-lg font-medium z-10">Neural Network Background</span>
          </div>
        </div>
      </section>

      {/* State Modifiers */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Interactive States</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={cn(panelStyles(), 'state-selected')}>
            <div className="p-4 text-center text-sm">Selected</div>
          </div>
          <div className={cn(panelStyles(), 'state-dragging')}>
            <div className="p-4 text-center text-sm">Dragging</div>
          </div>
          <div className={cn(panelStyles(), 'state-focused')}>
            <div className="p-4 text-center text-sm">Focused</div>
          </div>
          <div className={cn(panelStyles(), 'state-loading')}>
            <div className="p-4 text-center text-sm">Loading</div>
          </div>
        </div>
      </section>

      {/* Timer Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-accent-400 mb-4">Timer Components</h2>

        <div className={panelStyles()}>
          <div className="p-6 text-center space-y-4">
            <div className="timer-display">25:00</div>
            <div className="timer-controls">
              <button className="timer-btn">Start</button>
              <button className="timer-btn">Pause</button>
              <button className="timer-btn">Reset</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center pt-8 border-t border-glass-border">
        <p className="text-text-muted text-sm">
          Design System Migration Complete - All visual elements preserved
        </p>
      </footer>
    </div>
  );
};

export default StyleTest;
