/**
 * Panel Components Registry
 * Central export and registration system for all panel components
 * Provides component metadata and factory functions for dynamic loading
 */

import React from 'react';
import type { Position, Size } from '@/types/panel';

// Import all panel components
import SmartHub from './SmartHub';
import AIChat from './AIChat';
import TaskManager from './TaskManager';
import Productivity from './Productivity';

// Export components for direct import
export { SmartHub, AIChat, TaskManager, Productivity };

// Component metadata interface
export interface PanelComponentMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'communication' | 'organization' | 'utility';
  defaultSize: Size;
  minSize: Size;
  maxSize: Size;
  component: React.ComponentType<{
    id: string;
    position: Position;
    size: Size;
    onMove?: (position: Position) => void;
    onResize?: (size: Size) => void;
    className?: string;
  }>;
  shortcuts?: string[];
  keywords?: string[];
}

// Component registry with metadata
export const PANEL_COMPONENTS: Record<string, PanelComponentMetadata> = {
  'smart-hub': {
    id: 'smart-hub',
    name: 'Smart Access Hub',
    description: 'Intelligent bookmark management with search and quick access',
    icon: '⚡',
    category: 'utility',
    defaultSize: { width: 500, height: 600 },
    minSize: { width: 400, height: 300 },
    maxSize: { width: 800, height: 700 },
    component: SmartHub,
    shortcuts: ['Ctrl+1', 'Alt+B'],
    keywords: ['bookmarks', 'links', 'search', 'quick access', 'favorites'],
  },

  'ai-chat': {
    id: 'ai-chat',
    name: 'AI Command Center',
    description: 'Multi-provider AI chat interface with conversation history',
    icon: '🤖',
    category: 'communication',
    defaultSize: { width: 600, height: 700 },
    minSize: { width: 400, height: 400 },
    maxSize: { width: 800, height: 800 },
    component: AIChat,
    shortcuts: ['Ctrl+2', 'Alt+A'],
    keywords: ['ai', 'chat', 'assistant', 'gpt', 'claude', 'gemini', 'conversation'],
  },

  'task-manager': {
    id: 'task-manager',
    name: 'Mission Control Tasks',
    description: 'Priority-based task management with progress tracking',
    icon: '📋',
    category: 'productivity',
    defaultSize: { width: 550, height: 650 },
    minSize: { width: 400, height: 400 },
    maxSize: { width: 800, height: 800 },
    component: TaskManager,
    shortcuts: ['Ctrl+3', 'Alt+T'],
    keywords: ['tasks', 'todo', 'productivity', 'priorities', 'projects', 'tracking'],
  },

  productivity: {
    id: 'productivity',
    name: 'Productivity Station',
    description: 'Pomodoro timer with focus modes and productivity tracking',
    icon: '⏰',
    category: 'productivity',
    defaultSize: { width: 500, height: 700 },
    minSize: { width: 400, height: 500 },
    maxSize: { width: 800, height: 900 },
    component: Productivity,
    shortcuts: ['Ctrl+4', 'Alt+P'],
    keywords: ['pomodoro', 'timer', 'focus', 'productivity', 'breaks', 'sessions'],
  },
};

// Helper functions for component management

/**
 * Get component metadata by ID
 */
export const getComponentMetadata = (componentId: string): PanelComponentMetadata | null => {
  return PANEL_COMPONENTS[componentId] || null;
};

/**
 * Get all available components
 */
export const getAllComponents = (): PanelComponentMetadata[] => {
  return Object.values(PANEL_COMPONENTS);
};

/**
 * Get components by category
 */
export const getComponentsByCategory = (
  category: PanelComponentMetadata['category']
): PanelComponentMetadata[] => {
  return Object.values(PANEL_COMPONENTS).filter(comp => comp.category === category);
};

/**
 * Search components by keywords
 */
export const searchComponents = (query: string): PanelComponentMetadata[] => {
  const lowerQuery = query.toLowerCase();

  return Object.values(PANEL_COMPONENTS).filter(comp => {
    const searchText = [comp.name, comp.description, ...(comp.keywords || [])]
      .join(' ')
      .toLowerCase();

    return searchText.includes(lowerQuery);
  });
};

/**
 * Create component factory function
 */
export const createPanelComponent = (
  componentId: string,
  props: {
    id: string;
    position: Position;
    size: Size;
    onMove?: (position: Position) => void;
    onResize?: (size: Size) => void;
    className?: string;
  }
): React.ReactElement | null => {
  const metadata = getComponentMetadata(componentId);
  if (!metadata) {
    console.error(`Component ${componentId} not found in registry`);
    return null;
  }

  const ComponentClass = metadata.component;
  return React.createElement(ComponentClass, props);
};

/**
 * Validate component props against metadata constraints
 */
export const validateComponentProps = (
  componentId: string,
  size: Size
): { valid: boolean; errors: string[] } => {
  const metadata = getComponentMetadata(componentId);
  if (!metadata) {
    return { valid: false, errors: [`Component ${componentId} not found`] };
  }

  const errors: string[] = [];

  // Check minimum size constraints
  if (size.width < metadata.minSize.width) {
    errors.push(`Width ${size.width} is below minimum ${metadata.minSize.width}`);
  }
  if (size.height < metadata.minSize.height) {
    errors.push(`Height ${size.height} is below minimum ${metadata.minSize.height}`);
  }

  // Check maximum size constraints
  if (size.width > metadata.maxSize.width) {
    errors.push(`Width ${size.width} exceeds maximum ${metadata.maxSize.width}`);
  }
  if (size.height > metadata.maxSize.height) {
    errors.push(`Height ${size.height} exceeds maximum ${metadata.maxSize.height}`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Get default position for new components (cascade positioning)
 */
export const getDefaultPosition = (
  componentId: string,
  existingPanels: Array<{ position: Position; size: Size }> = []
): Position => {
  const metadata = getComponentMetadata(componentId);
  if (!metadata) {
    return { x: 50, y: 50 };
  }

  // Base position with some offset from top-left
  let baseX = 100;
  let baseY = 100;

  // Calculate cascade offset based on existing panels
  const cascadeOffset = 30;
  const numExisting = existingPanels.length;

  return {
    x: baseX + numExisting * cascadeOffset,
    y: baseY + numExisting * cascadeOffset,
  };
};

/**
 * Component loading utilities for lazy loading
 */
export const componentLoaders = {
  'smart-hub': () => import('./SmartHub'),
  'ai-chat': () => import('./AIChat'),
  'task-manager': () => import('./TaskManager'),
  productivity: () => import('./Productivity'),
};

/**
 * Lazy load component
 */
export const loadComponent = async (componentId: string) => {
  const loader = componentLoaders[componentId as keyof typeof componentLoaders];
  if (!loader) {
    throw new Error(`No loader found for component: ${componentId}`);
  }

  try {
    const module = await loader();
    return module.default;
  } catch (error) {
    console.error(`Failed to load component ${componentId}:`, error);
    throw error;
  }
};

// Default export for convenience
export default {
  SmartHub,
  AIChat,
  TaskManager,
  Productivity,
  PANEL_COMPONENTS,
  getComponentMetadata,
  getAllComponents,
  getComponentsByCategory,
  searchComponents,
  createPanelComponent,
  validateComponentProps,
  getDefaultPosition,
  loadComponent,
};
