/**
 * Component type definitions for UI components and their props
 */

import { ReactNode, CSSProperties } from 'react';
import { PanelLayout, PanelState, Position, Size } from './panel';
import { ResizeDirection } from './layout';

// Base component props
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  testId?: string;
}

// Panel component props
export interface PanelProps extends BaseComponentProps {
  layout: PanelLayout;
  state: PanelState;
  isSelected: boolean;
  onSelect: (panelId: string) => void;
  onDeselect: (panelId: string) => void;
  onMove: (panelId: string, position: Position) => void;
  onResize: (panelId: string, size: Size) => void;
  onFocus: (panelId: string) => void;
  onBlur: (panelId: string) => void;
  onClose?: (panelId: string) => void;
  dragDisabled?: boolean;
  resizeDisabled?: boolean;
}

// Drag handle component props
export interface DragHandleProps extends BaseComponentProps {
  panelId: string;
  position: Position;
  onDragStart: (panelId: string, startPosition: Position) => void;
  onDrag: (currentPosition: Position) => void;
  onDragEnd: () => void;
  disabled?: boolean;
  cursor?: string;
}
// Resize handle component props
export interface ResizeHandleProps extends BaseComponentProps {
  panelId: string;
  direction: ResizeDirection;
  size: Size;
  position: Position;
  onResizeStart: (panelId: string, direction: ResizeDirection, startSize: Size) => void;
  onResize: (currentSize: Size) => void;
  onResizeEnd: () => void;
  disabled?: boolean;
  minSize?: Size;
  maxSize?: Size;
}

// Event handler types for interactions
export interface DragEventHandlers {
  onDragStart: (event: DragStartEvent) => void;
  onDrag: (event: DragEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export interface ResizeEventHandlers {
  onResizeStart: (event: ResizeStartEvent) => void;
  onResize: (event: ResizeEvent) => void;
  onResizeEnd: (event: ResizeEndEvent) => void;
}

export interface SelectionEventHandlers {
  onSelect: (event: SelectionEvent) => void;
  onDeselect: (event: SelectionEvent) => void;
  onMultiSelect: (event: MultiSelectionEvent) => void;
}

// Event interfaces
export interface DragStartEvent {
  panelId: string;
  startPosition: Position;
  mousePosition: Position;
  timestamp: number;
}

export interface DragEvent {
  panelId: string;
  currentPosition: Position;
  deltaPosition: Position;
  mousePosition: Position;
  timestamp: number;
}

export interface DragEndEvent {
  panelId: string;
  finalPosition: Position;
  deltaPosition: Position;
  timestamp: number;
}

export interface ResizeStartEvent {
  panelId: string;
  direction: ResizeDirection;
  startSize: Size;
  startPosition: Position;
  mousePosition: Position;
  timestamp: number;
}

export interface ResizeEvent {
  panelId: string;
  direction: ResizeDirection;
  currentSize: Size;
  deltaSize: { width: number; height: number };
  mousePosition: Position;
  timestamp: number;
}

export interface ResizeEndEvent {
  panelId: string;
  direction: ResizeDirection;
  finalSize: Size;
  deltaSize: { width: number; height: number };
  timestamp: number;
}

export interface SelectionEvent {
  panelId: string;
  timestamp: number;
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
  };
}

export interface MultiSelectionEvent {
  panelIds: string[];
  timestamp: number;
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
  };
}

// Theme and styling types
export enum ThemeVariant {
  Light = 'light',
  Dark = 'dark',
  Auto = 'auto',
}

export enum ComponentVariant {
  Default = 'default',
  Primary = 'primary',
  Secondary = 'secondary',
  Accent = 'accent',
  Ghost = 'ghost',
  Outline = 'outline',
}

export enum ComponentSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  ExtraLarge = 'xl',
}

// Theme configuration
export interface ThemeConfig {
  variant: ThemeVariant;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

// Component styling props
export interface ComponentStylingProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  focused?: boolean;
  active?: boolean;
}

// Layout component props
export interface LayoutComponentProps extends BaseComponentProps {
  theme: ThemeConfig;
  onThemeChange: (theme: ThemeVariant) => void;
}

// Panel content component props
export interface PanelContentProps extends BaseComponentProps {
  panelId: string;
  title: string;
  icon?: string;
  actions?: PanelAction[];
  onAction: (action: string, panelId: string) => void;
}

// Panel action definition
export interface PanelAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  variant?: ComponentVariant;
}
