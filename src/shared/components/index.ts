/**
 * Shared components barrel export
 * Re-exports all shared UI components for easy importing
 */

// Re-export existing UI components
export * from '@/components/ui/ErrorBoundary';
export * from '@/components/ui/DragFeedback';
export * from '@/components/ui/DragHandle';
export * from '@/components/ui/DropZone';
export * from '@/components/ui/GridOverlay';
export * from '@/components/ui/ResizeHandle';
export * from '@/components/ui/ResizeHandles';
export * from '@/components/ui/ResizePreview';

// Re-export layout components
export * from '@/components/DynamicLayout';
export * from '@/components/LazyPanelLoader';

// Common shared component props and utilities
export type { BaseComponentProps, ComponentStylingProps } from '@/types/components';
export { ComponentVariant, ComponentSize, ThemeVariant } from '@/types/components';
