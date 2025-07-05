/**
 * Style utility functions for generating dynamic component styles
 * Integrates Tailwind classes with custom design system variants
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ComponentVariant, ComponentSize, ThemeVariant } from '@/types/components';

// Utility for conditional class names with Tailwind conflict resolution
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Color variant generators
export const colorVariants = {
  button: {
    [ComponentVariant.Default]: 'glass-button',
    [ComponentVariant.Primary]: 'btn-primary',
    [ComponentVariant.Secondary]: 'btn-secondary',
    [ComponentVariant.Accent]:
      'bg-accent-500 hover:bg-accent-400 text-white border border-accent-400',
    [ComponentVariant.Ghost]:
      'bg-transparent hover:bg-glass-light text-text-primary border border-transparent hover:border-glass-border',
    [ComponentVariant.Outline]:
      'bg-transparent border-2 border-primary-400 text-primary-400 hover:bg-primary-400 hover:text-white',
  },
  panel: {
    [ComponentVariant.Default]: 'glass-panel',
    [ComponentVariant.Primary]: 'glass-card',
    [ComponentVariant.Secondary]: 'glass-surface',
    [ComponentVariant.Accent]: 'glass-overlay',
    [ComponentVariant.Ghost]: 'bg-transparent border border-glass-border',
    [ComponentVariant.Outline]: 'bg-transparent border-2 border-primary-400/30',
  },
  input: {
    [ComponentVariant.Default]: 'glass-input',
    [ComponentVariant.Primary]: 'glass-input focus:border-primary-500 focus:ring-primary-500/30',
    [ComponentVariant.Secondary]:
      'glass-input focus:border-secondary-400 focus:ring-secondary-400/30',
    [ComponentVariant.Accent]: 'glass-input focus:border-accent-500 focus:ring-accent-500/30',
    [ComponentVariant.Ghost]: 'bg-transparent border border-glass-border',
    [ComponentVariant.Outline]: 'bg-transparent border-2 border-primary-400/50',
  },
  text: {
    [ComponentVariant.Default]: 'text-text-primary',
    [ComponentVariant.Primary]: 'text-primary-400',
    [ComponentVariant.Secondary]: 'text-secondary-400',
    [ComponentVariant.Accent]: 'text-accent-500',
    [ComponentVariant.Ghost]: 'text-text-muted',
    [ComponentVariant.Outline]: 'text-text-secondary',
  },
} as const;

// Size variant generators
export const sizeVariants = {
  button: {
    [ComponentSize.Small]: 'px-3 py-1.5 text-sm',
    [ComponentSize.Medium]: 'px-4 py-2 text-base',
    [ComponentSize.Large]: 'px-6 py-3 text-lg',
    [ComponentSize.ExtraLarge]: 'px-8 py-4 text-xl',
  },
  panel: {
    [ComponentSize.Small]: 'p-3',
    [ComponentSize.Medium]: 'p-4',
    [ComponentSize.Large]: 'p-6',
    [ComponentSize.ExtraLarge]: 'p-8',
  },
  input: {
    [ComponentSize.Small]: 'px-2 py-1 text-sm',
    [ComponentSize.Medium]: 'px-3 py-2 text-base',
    [ComponentSize.Large]: 'px-4 py-3 text-lg',
    [ComponentSize.ExtraLarge]: 'px-5 py-4 text-xl',
  },
  text: {
    [ComponentSize.Small]: 'text-xs',
    [ComponentSize.Medium]: 'text-sm',
    [ComponentSize.Large]: 'text-base',
    [ComponentSize.ExtraLarge]: 'text-lg',
  },
  icon: {
    [ComponentSize.Small]: 'w-4 h-4',
    [ComponentSize.Medium]: 'w-5 h-5',
    [ComponentSize.Large]: 'w-6 h-6',
    [ComponentSize.ExtraLarge]: 'w-8 h-8',
  },
} as const;

// State modifiers
export const stateModifiers = {
  base: '',
  disabled: 'state-disabled',
  loading: 'state-loading',
  error: 'state-error',
  focused: 'state-focused',
  selected: 'state-selected',
  dragging: 'state-dragging',
  resizing: 'state-resizing',
} as const;

// Animation classes
export const animations = {
  none: '',
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  appear: 'animate-appear',
  hover: 'animate-hover',
  pulse: 'animate-pulse-glow',
  float: 'animate-float',
  neural: 'animate-neural',
} as const;

// Glassmorphism opacity calculations
export function calculateGlassOpacity(intensity: number = 1): {
  background: string;
  border: string;
  blur: string;
} {
  const clampedIntensity = Math.max(0, Math.min(1, intensity));

  return {
    background: `rgba(0, 255, 255, ${0.08 * clampedIntensity})`,
    border: `rgba(0, 255, 255, ${0.1 * clampedIntensity})`,
    blur: `${8 + 8 * clampedIntensity}px`,
  };
}

// Dynamic glass style generator
export function createGlassStyle(): string {
  return cn(
    'backdrop-blur-glass backdrop-saturate-glass',
    'border border-glass-border',
    'relative overflow-hidden',
    'transition-all duration-slow'
  );
}

// Priority color mapping
export const priorityColors = {
  1: { bg: 'bg-priority-1/20', text: 'text-priority-1', border: 'border-priority-1/30' },
  2: { bg: 'bg-priority-2/20', text: 'text-priority-2', border: 'border-priority-2/30' },
  3: { bg: 'bg-priority-3/20', text: 'text-priority-3', border: 'border-priority-3/30' },
  4: { bg: 'bg-priority-4/20', text: 'text-priority-4', border: 'border-priority-4/30' },
  5: { bg: 'bg-priority-5/20', text: 'text-priority-5', border: 'border-priority-5/30' },
} as const;

// Theme-based style generators
export function getThemeStyles(theme: ThemeVariant) {
  switch (theme) {
    case ThemeVariant.Light:
      return {
        background: 'bg-white',
        text: 'text-gray-900',
        border: 'border-gray-200',
      };
    case ThemeVariant.Dark:
      return {
        background: 'bg-background-primary',
        text: 'text-text-primary',
        border: 'border-glass-border',
      };
    case ThemeVariant.Auto:
    default:
      return {
        background: 'bg-background-primary dark:bg-background-primary',
        text: 'text-text-primary dark:text-text-primary',
        border: 'border-glass-border dark:border-glass-border',
      };
  }
}

// Component style generators
export interface ButtonStyleOptions {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function buttonStyles({
  variant = ComponentVariant.Default,
  size = ComponentSize.Medium,
  disabled = false,
  loading = false,
  className = '',
}: ButtonStyleOptions = {}): string {
  return cn(
    // Base button styles
    'inline-flex items-center justify-center font-medium',
    'rounded-lg transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',

    // Variant styles
    colorVariants.button[variant],

    // Size styles
    sizeVariants.button[size],

    // State modifiers
    disabled && stateModifiers.disabled,
    loading && stateModifiers.loading,

    // Custom classes
    className
  );
}

export interface PanelStyleOptions {
  variant?: ComponentVariant;
  size?: ComponentSize;
  selected?: boolean;
  dragging?: boolean;
  className?: string;
}

export function panelStyles({
  variant = ComponentVariant.Default,
  size = ComponentSize.Medium,
  selected = false,
  dragging = false,
  className = '',
}: PanelStyleOptions = {}): string {
  return cn(
    // Base panel styles
    colorVariants.panel[variant],

    // Size styles
    sizeVariants.panel[size],

    // State modifiers
    selected && stateModifiers.selected,
    dragging && stateModifiers.dragging,

    // Custom classes
    className
  );
}

export interface InputStyleOptions {
  variant?: ComponentVariant;
  size?: ComponentSize;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function inputStyles({
  variant = ComponentVariant.Default,
  size = ComponentSize.Medium,
  error = false,
  disabled = false,
  className = '',
}: InputStyleOptions = {}): string {
  return cn(
    // Base input styles
    colorVariants.input[variant],

    // Size styles
    sizeVariants.input[size],

    // State modifiers
    error && stateModifiers.error,
    disabled && stateModifiers.disabled,

    // Custom classes
    className
  );
}

// Priority badge generator
export function priorityBadgeStyles(priority: 1 | 2 | 3 | 4 | 5): string {
  const colors = priorityColors[priority];
  return cn(
    'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
    colors.bg,
    colors.text,
    'border',
    colors.border
  );
}

// Drag handle styles
export function dragHandleStyles(className?: string): string {
  return cn('drag-handle w-6 h-6', className);
}

// Resize handle styles
export function resizeHandleStyles(
  direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw',
  className?: string
): string {
  return cn('resize-handle', `resize-handle-${direction}`, className);
}

// Style merging utility for component customization
export function mergeStyles(baseStyles: string, overrideStyles?: string): string {
  return cn(baseStyles, overrideStyles);
}
