/**
 * Panels feature module
 * Main entry point for panel functionality
 */

// Components
export * from '@/components/panels/Panel';
export * from '@/components/ui/Panel';
export * from '@/components/ui/DraggablePanel';
export * from '@/components/ui/ResizablePanel';
export * from '@/components/ui/PanelGroup';
export * from '@/components/ui/PanelToolbar';
export * from '@/components/ui/PanelContextMenu';

// Hooks (to be moved here)
export * from '@/hooks/useDragOperations';
export * from '@/hooks/useMultiPanelResize';

// Store
export * from '@/store/dragStore';
export * from '@/store/layoutStore';

// Types
export type {
  PanelProps,
  DragHandleProps,
  ResizeHandleProps,
  DragEventHandlers,
  ResizeEventHandlers,
} from '@/types/components';

export type { Panel, PanelLayout, PanelState, PanelType, Position, Size } from '@/types/panel';
