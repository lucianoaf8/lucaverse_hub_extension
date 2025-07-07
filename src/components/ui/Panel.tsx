/**
 * Panel Component
 * Main draggable and resizable panel with glassmorphism styling
 * Integrates drag, resize, selection, and accessibility features
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutStore } from '@/stores/layoutStore';
import {
  usePanelDrag,
  usePanelResize,
  usePanelSelection,
  useKeyboardShortcuts,
} from '@/hooks/usePanelInteractions';
import { HeaderDragHandle } from './DragHandle';
import { ErrorBoundary } from './ErrorBoundary';
import { ResizeHandles } from './ResizeHandle';
import type { Position, Size, PanelConstraints } from '@/types/panel';

export interface PanelProps {
  id: string;
  title?: string;
  icon?: React.ReactNode;
  position: Position;
  size: Size;
  isSelected?: boolean;
  children?: React.ReactNode;
  constraints?: PanelConstraints;
  className?: string;
  style?: React.CSSProperties;
  onMove?: (position: Position) => void;
  onResize?: (size: Size) => void;
  onSelect?: (selected: boolean) => void;
  onFocus?: () => void;
  showHeader?: boolean;
  showResizeHandles?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  zIndex?: number;
  headerActions?: React.ReactNode;
  animated?: boolean;
  glassmorphism?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  id,
  title = '',
  icon,
  position,
  size,
  isSelected: propIsSelected,
  children,
  constraints,
  className = '',
  style = {},
  onMove,
  onResize,
  onSelect,
  onFocus,
  showHeader = true,
  showResizeHandles = true,
  resizable = true,
  draggable = true,
  zIndex: propZIndex,
  headerActions,
  animated = true,
  glassmorphism = true,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Store integration
  const { getPanel, updatePanel, dragState, resizeState, selectedPanelIds, panels } =
    useLayoutStore();

  // Get panel data from store
  const storePanel = getPanel(id);
  const effectivePosition = storePanel?.position ?? position;
  const effectiveSize = storePanel?.size ?? size;
  const effectiveZIndex = propZIndex ?? storePanel?.zIndex ?? 100;

  // Hooks for interactions
  const { isDragging, currentPosition } = usePanelDrag(id);
  const { isResizing, currentSize } = usePanelResize(id);
  const { isSelected, handleSelect } = usePanelSelection(id);
  useKeyboardShortcuts(id);

  // Use prop selection state if provided, otherwise use store state
  const effectiveIsSelected = propIsSelected ?? isSelected;

  // Calculate final position and size (including drag/resize states)
  const finalPosition = useMemo(() => {
    if (isDragging && currentPosition) {
      return currentPosition;
    }
    return effectivePosition;
  }, [isDragging, currentPosition, effectivePosition]);

  const finalSize = useMemo(() => {
    if (isResizing && currentSize) {
      return currentSize;
    }
    return effectiveSize;
  }, [isResizing, currentSize, effectiveSize]);

  // Calculate panel styling
  const panelStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: finalPosition.x,
      top: finalPosition.y,
      width: finalSize.width,
      height: finalSize.height,
      zIndex: effectiveZIndex + (isDragging ? 1000 : 0) + (isResizing ? 500 : 0),
      pointerEvents: 'auto',
      ...style,
    };

    return baseStyle;
  }, [finalPosition, finalSize, effectiveZIndex, isDragging, isResizing, style]);

  // Calculate panel CSS classes
  const panelClasses = useMemo(() => {
    const baseClasses = ['panel', 'select-none', 'outline-none', className];

    // Glassmorphism styling
    if (glassmorphism) {
      baseClasses.push(
        'glass-card',
        'backdrop-blur-xl',
        'bg-white/10',
        'border',
        'border-white/20',
        'shadow-2xl'
      );
    }

    // Selection state
    if (effectiveIsSelected) {
      baseClasses.push('ring-2', 'ring-blue-400', 'ring-opacity-75', 'shadow-blue-500/25');
    }

    // Interaction states
    if (isDragging) {
      baseClasses.push('shadow-2xl', 'ring-2', 'ring-blue-300', 'ring-opacity-50');
    }

    if (isResizing) {
      baseClasses.push('shadow-xl', 'ring-2', 'ring-green-300', 'ring-opacity-50');
    }

    // Rounded corners
    baseClasses.push('rounded-lg', 'overflow-hidden');

    return baseClasses.join(' ');
  }, [glassmorphism, effectiveIsSelected, isDragging, isResizing, className]);

  // Handle panel click for selection
  const handlePanelClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    const multiSelect = event.ctrlKey || event.metaKey;
    handleSelect(multiSelect);

    if (onSelect) {
      onSelect(!effectiveIsSelected);
    }

    if (onFocus) {
      onFocus();
    }
  };

  // Update store when position/size changes
  useEffect(() => {
    if (onMove && finalPosition !== effectivePosition) {
      onMove(finalPosition);
    }
  }, [finalPosition, effectivePosition, onMove]);

  useEffect(() => {
    if (onResize && finalSize !== effectiveSize) {
      onResize(finalSize);
    }
  }, [finalSize, effectiveSize, onResize]);

  // Animation variants for framer-motion
  const panelVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15, ease: 'easeIn' },
    },
  };

  const MotionDiv = animated ? motion.div : 'div';
  const motionProps = animated
    ? {
        variants: panelVariants,
        initial: 'initial',
        animate: 'animate',
        exit: 'exit',
        layout: true,
        layoutId: id,
      }
    : {};

  return (
    <MotionDiv
      ref={panelRef}
      className={panelClasses}
      style={panelStyle}
      onClick={handlePanelClick}
      tabIndex={0}
      role="dialog"
      aria-label={title || `Panel ${id}`}
      aria-selected={effectiveIsSelected}
      data-panel-id={id}
      data-dragging={isDragging}
      data-resizing={isResizing}
      data-selected={effectiveIsSelected}
      {...motionProps}
    >
      {/* Header */}
      {showHeader && (
        <HeaderDragHandle
          panelId={id}
          title={title}
          icon={icon}
          actions={headerActions}
          disabled={!draggable}
          className="border-b border-white/10 bg-white/5"
        />
      )}

      {/* Content */}
      <div
        className={`panel-content ${showHeader ? 'h-[calc(100%-48px)]' : 'h-full'} overflow-auto`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
        }}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>

      {/* Resize Handles */}
      {showResizeHandles && resizable && effectiveIsSelected && (
        <ResizeHandles
          panelId={id}
          constraints={constraints}
          size={8}
          className="opacity-70 hover:opacity-100"
        />
      )}

      {/* Panel status indicator (debug mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 right-1 text-xs text-white/50 pointer-events-none bg-black/20 px-1 rounded">
          {isDragging && 'D'}
          {isResizing && 'R'}
          {effectiveIsSelected && 'S'}
        </div>
      )}

      {/* Focus indicator for keyboard navigation */}
      <div className="absolute inset-0 pointer-events-none rounded-lg ring-2 ring-blue-500 ring-opacity-0 focus-within:ring-opacity-50 transition-all duration-150" />
    </MotionDiv>
  );
};

Panel.displayName = 'Panel';

export default Panel;
