import React, { ReactNode, CSSProperties } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDragDropContext } from '../providers/DragDropProvider';
import clsx from 'clsx';

export type DropZoneType = 
  | 'workspace' 
  | 'panel-snap' 
  | 'dock-area' 
  | 'grid-slot' 
  | 'trash' 
  | 'custom';

export interface DropZoneProps {
  id?: string;
  type: DropZoneType;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  acceptTypes?: string[]; // Types of draggable items this zone accepts
  disabled?: boolean;
  snapDistance?: number; // Distance for magnetic snap behavior
  
  // Visual styling options
  highlight?: {
    color?: string;
    thickness?: number;
    style?: 'solid' | 'dashed' | 'dotted';
  };
  
  // Zone-specific configurations
  grid?: {
    rows: number;
    cols: number;
    gap: number;
  };
  
  // Event handlers
  onDropAccept?: (draggedId: string, dropZoneId: string) => void;
  onDropReject?: (draggedId: string, dropZoneId: string) => void;
  onHover?: (draggedId: string, dropZoneId: string) => void;
  onHoverEnd?: (draggedId: string, dropZoneId: string) => void;
}

// Utility function to check if dropped item is accepted
const isAcceptableType = (
  draggedData: any,
  acceptTypes?: string[]
): boolean => {
  if (!acceptTypes || acceptTypes.length === 0) return true;
  
  const draggedType = draggedData?.type || 'unknown';
  return acceptTypes.includes(draggedType);
};

// Generate zone styles based on state and type
const getZoneStyles = (
  type: DropZoneType,
  isOver: boolean,
  canDrop: boolean,
  disabled: boolean,
  highlight?: DropZoneProps['highlight']
) => {
  const baseStyles = 'transition-all duration-200 ease-in-out';
  
  // Type-specific base styles
  const typeStyles = {
    workspace: 'min-h-full border-2 border-transparent',
    'panel-snap': 'border-2 border-dashed border-transparent rounded-lg',
    'dock-area': 'border-2 border-transparent bg-white/5 rounded-xl',
    'grid-slot': 'border border-transparent bg-gradient-to-br from-white/5 to-transparent rounded',
    trash: 'border-2 border-red-500/30 bg-red-500/10 rounded-xl',
    custom: 'border-2 border-transparent',
  };

  // State-based styles
  let stateStyles = '';
  
  if (disabled) {
    stateStyles = 'opacity-50 cursor-not-allowed';
  } else if (isOver && canDrop) {
    // Valid drop target
    const color = highlight?.color || 'emerald';
    const thickness = highlight?.thickness || 2;
    const style = highlight?.style || 'solid';
    
    stateStyles = `
      border-${color}-400 
      bg-${color}-400/20 
      shadow-lg 
      shadow-${color}-400/25
      border-${style}
      ${thickness === 1 ? 'border' : `border-${thickness}`}
    `;
  } else if (isOver && !canDrop) {
    // Invalid drop target
    stateStyles = 'border-red-400 bg-red-400/20 shadow-lg shadow-red-400/25';
  }
  
  return clsx(baseStyles, typeStyles[type], stateStyles);
};

export const DropZone: React.FC<DropZoneProps> = ({
  id = `dropzone-${Math.random().toString(36).substr(2, 9)}`,
  type,
  children,
  className = '',
  style = {},
  acceptTypes,
  disabled = false,
  snapDistance = 20,
  highlight,
  grid,
  onDropAccept,
  onDropReject,
  onHover,
  onHoverEnd,
}) => {
  const { dragState } = useDragDropContext();
  
  // Setup droppable functionality
  const {
    setNodeRef,
    isOver,
    active,
  } = useDroppable({
    id,
    disabled,
    data: {
      type,
      acceptTypes,
      snapDistance,
    },
  });

  // Check if current dragged item can be dropped here
  const canDrop = active ? isAcceptableType(active.data.current, acceptTypes) : false;
  
  // Track hover state for callbacks
  const wasOver = React.useRef(false);
  
  React.useEffect(() => {
    if (isOver && !wasOver.current && active) {
      wasOver.current = true;
      onHover?.(active.id as string, id);
    } else if (!isOver && wasOver.current && active) {
      wasOver.current = false;
      onHoverEnd?.(active.id as string, id);
    }
  }, [isOver, active, onHover, onHoverEnd, id]);

  // Generate dynamic styles
  const zoneClasses = getZoneStyles(type, isOver, canDrop, disabled, highlight);
  
  // Combine with custom className
  const finalClassName = clsx(zoneClasses, className);
  
  // Grid overlay for grid-slot type
  const renderGridOverlay = () => {
    if (type !== 'grid-slot' || !grid || !isOver) return null;
    
    const { rows, cols, gap } = grid;
    const slots = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        slots.push(
          <div
            key={`${row}-${col}`}
            className="border border-white/20 bg-white/5 rounded"
            style={{
              gridRow: row + 1,
              gridColumn: col + 1,
            }}
          />
        );
      }
    }
    
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${gap}px`,
          padding: `${gap}px`,
        }}
      >
        {slots}
      </div>
    );
  };

  // Magnetic snap visualization
  const renderSnapLines = () => {
    if (!isOver || type === 'workspace') return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-400/50 transform -translate-x-0.5" />
        {/* Horizontal center line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400/50 transform -translate-y-0.5" />
      </div>
    );
  };

  // Zone content with indicators
  const renderZoneContent = () => {
    return (
      <>
        {children}
        {renderGridOverlay()}
        {renderSnapLines()}
        
        {/* Drop instruction overlay */}
        {isOver && canDrop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 bg-black/60 text-white text-sm rounded-lg backdrop-blur-sm">
              {type === 'trash' ? 'Drop to delete' : 'Drop here'}
            </div>
          </div>
        )}
        
        {/* Invalid drop overlay */}
        {isOver && !canDrop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 bg-red-500/80 text-white text-sm rounded-lg backdrop-blur-sm">
              Cannot drop here
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      ref={setNodeRef}
      className={finalClassName}
      style={style}
      data-dropzone-id={id}
      data-dropzone-type={type}
      data-is-over={isOver}
      data-can-drop={canDrop}
      aria-label={`Drop zone: ${type}`}
      role="region"
    >
      <div className="relative w-full h-full">
        {renderZoneContent()}
      </div>
    </div>
  );
};