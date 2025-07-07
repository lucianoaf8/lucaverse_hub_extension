/**
 * Smart Hub feature module
 * Main entry point for smart hub functionality
 */

// Components (to be moved here)
export * from '@/components/panels/SmartHub/SmartHub';

// Types
export interface SmartHubConfig {
  enableWidgets: boolean;
  enableShortcuts: boolean;
  enableQuickActions: boolean;
  maxWidgets: number;
}

export interface SmartHubWidget {
  id: string;
  type: 'weather' | 'calendar' | 'tasks' | 'news' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, any>;
  enabled: boolean;
}

// Constants
export const SMART_HUB_CONSTANTS = {
  MAX_WIDGETS: 12,
  DEFAULT_WIDGET_SIZE: 'medium' as const,
  SUPPORTED_WIDGET_TYPES: ['weather', 'calendar', 'tasks', 'news', 'custom'] as const,
} as const;
