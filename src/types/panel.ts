/**
 * Core panel type definitions for the Lucaverse Hub layout system
 */

// Position coordinates for panel placement
export interface Position {
  x: number;
  y: number;
}

// Size dimensions for panel sizing
export interface Size {
  width: number;
  height: number;
}

// Available panel component types
export enum PanelComponent {
  SmartHub = 'smart-hub',
  AIChat = 'ai-chat',
  TaskManager = 'task-manager',
  Productivity = 'productivity',
}

// Panel constraints for size and position limits
export interface PanelConstraints {
  minSize: Size;
  maxSize?: Size;
  positionBounds?: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  aspectRatio?: {
    min?: number;
    max?: number;
    locked?: boolean;
  };
}

// Complete panel layout configuration
export interface PanelLayout {
  id: string;
  component: PanelComponent;
  position: Position;
  size: Size;
  zIndex: number;
  visible: boolean;
  constraints: PanelConstraints;
  metadata?: {
    title: string;
    description?: string;
    icon?: string;
    color?: string;
  };
}

// Panel state for runtime management
export interface PanelState {
  id: string;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isMinimized: boolean;
  isFocused: boolean;
  lastInteraction: number;
}

// Panel transformation data
export interface PanelTransform {
  translate: Position;
  scale: number;
  rotate: number;
  opacity: number;
}

// Panel animation configuration
export interface PanelAnimation {
  duration: number;
  easing: string;
  delay?: number;
  type: 'fade' | 'slide' | 'scale' | 'rotate';
}
