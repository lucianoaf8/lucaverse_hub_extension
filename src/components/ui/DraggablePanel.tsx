import React, { ReactNode, CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { Position, Size, PanelLayout } from '../../types/panel';
import { useDragDropContext } from '../providers/DragDropProvider';
import clsx from 'clsx';

export interface DraggablePanelProps {
  id: string;
  children: ReactNode;
  position: Position;
  size: Size;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  dragConstraints?: {
    bounds?: 'window' | 'parent' | DOMRect;
    axis?: 'x' | 'y' | 'both';
    snap?: boolean;
    magnetic?: boolean;
  };
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string, newPosition: Position) => void;
  panelData?: Partial<PanelLayout>;
  dragHandle?: string; // CSS selector for drag handle
}

// Custom constraint modifiers for panel-specific boundaries
const createPanelConstraints = (constraints?: DraggablePanelProps['dragConstraints']) => {
  const modifiers = [];

  if (!constraints) {
    modifiers.push(restrictToWindowEdges);
    return modifiers;
  }

  // Add boundary constraints
  switch (constraints.bounds) {
    case 'window':
      modifiers.push(restrictToWindowEdges);
      break;
    case 'parent':
      // Will be handled by CSS containment
      break;
    default:
      modifiers.push(restrictToWindowEdges);
  }

  return modifiers;
};

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  id,
  children,
  position,
  size,
  className = '',
  style = {},
  disabled = false,
  dragConstraints,
  onDragStart,
  onDragEnd,
  panelData,
  dragHandle,
}) => {
  const { dragState } = useDragDropContext();

  // Setup draggable functionality
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
    data: {
      type: 'panel',
      position,
      size,
      panelData,
      ...panelData,
    },
  });

  // Calculate transform styles
  const transformStyle = CSS.Translate.toString(transform);

  // Determine if this panel is currently being dragged
  const isActivelyDragging = dragState.activeId === id;

  // Handle drag start callback
  React.useEffect(() => {
    if (isActivelyDragging && onDragStart) {
      onDragStart(id);
    }
  }, [isActivelyDragging, id, onDragStart]);

  // Handle Escape key to cancel drag
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDragging) {
        // Cancel drag operation
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }
    };

    if (isDragging) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isDragging]);

  // Combine styles with drag state
  const combinedStyle: CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    transform: transformStyle,
    zIndex: isActivelyDragging ? 1000 : 1,
    opacity: isActivelyDragging ? 0.8 : 1,
    cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'all 0.2s ease-out',
    ...style,
  };

  // Apply axis constraints via CSS
  if (dragConstraints?.axis === 'x') {
    combinedStyle.top = position.y;
  } else if (dragConstraints?.axis === 'y') {
    combinedStyle.left = position.x;
  }

  // Panel classes with drag state styling
  const panelClasses = clsx(
    'select-none touch-none', // Prevent text selection and touch conflicts
    'border border-white/20',
    'bg-white/10 backdrop-blur-md',
    'rounded-lg shadow-lg',
    {
      'ring-2 ring-blue-400/50': isActivelyDragging,
      'hover:bg-white/15': !isDragging && !disabled,
      'scale-105': isActivelyDragging,
      'pointer-events-none': disabled,
    },
    className
  );

  // Drag handle attributes - apply to entire panel if no specific handle
  const dragProps = dragHandle
    ? {} // Will be applied to specific handle element
    : { ...listeners, ...attributes };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className={panelClasses}
      data-panel-id={id}
      data-dragging={isDragging}
      aria-label={`Draggable panel ${id}`}
      role="dialog"
      aria-grabbed={isDragging}
      {...dragProps}
    >
      {/* Drag Handle - if specified */}
      {dragHandle && (
        <div
          className={`${dragHandle} cursor-grab active:cursor-grabbing`}
          {...listeners}
          {...attributes}
          aria-label="Drag handle"
        />
      )}

      {/* Panel Content */}
      <div className="relative w-full h-full overflow-hidden">{children}</div>

      {/* Drag State Indicator */}
      {isDragging && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500/80 text-white text-xs rounded backdrop-blur-sm">
          Dragging
        </div>
      )}
    </div>
  );
};
