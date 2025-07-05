/**
 * UI Components Index
 * Exports all panel-related UI components
 */

// Main components
export { default as Panel } from './Panel';
export type { PanelProps } from './Panel';

export { default as ResizeHandle, ResizeHandles } from './ResizeHandle';
export type { ResizeHandleProps, ResizeHandlesProps } from './ResizeHandle';

export { default as DragHandle, HeaderDragHandle } from './DragHandle';
export type { DragHandleProps, HeaderDragHandleProps } from './DragHandle';

export { default as GridOverlay } from './GridOverlay';
export type { GridOverlayProps } from './GridOverlay';

// Panel management components
export { PanelToolbar } from './PanelToolbar';
export type { PanelToolbarProps } from './PanelToolbar';

export { PanelGroup, GroupManager } from './PanelGroup';
export type { PanelGroupProps } from './PanelGroup';

export { PanelContextMenu, useContextMenu } from './PanelContextMenu';
export type { PanelContextMenuProps } from './PanelContextMenu';

// Test components (development only)
export { PanelManagementTest } from '../__tests__';

// Utilities
export * from './utils';

// Type re-exports for convenience
export type { Position, Size, PanelLayout, PanelConstraints } from '@/types/panel';
export type { GridSettings, ResizeDirection } from '@/types/layout';
