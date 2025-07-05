/**
 * DragHandle Component
 * Draggable area for panel movement, typically in panel header/title bar
 * Provides smooth animations, magnetic snap zones, and keyboard navigation
 */

import React, { useMemo } from 'react';
import { usePanelDrag, usePanelSelection } from '@/hooks/usePanelInteractions';
import type { Position, PanelConstraints } from '@/types/panel';

export interface DragHandleProps {
  panelId: string;
  onMove?: (position: Position) => void;
  constraints?: PanelConstraints;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  showGrabIndicator?: boolean;
  snapToGrid?: boolean;
  snapDistance?: number;
}

export const DragHandle: React.FC<DragHandleProps> = ({
  panelId,
  onMove,
  constraints,
  disabled = false,
  className = '',
  style = {},
  children,
  showGrabIndicator = true,
  snapToGrid = true,
  snapDistance = 10
}) => {
  const { 
    isDragging, 
    handleDragStart, 
    currentPosition 
  } = usePanelDrag(panelId);
  
  const { 
    isSelected, 
    handleSelect 
  } = usePanelSelection(panelId);

  // Calculate drag handle styling
  const dragHandleStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'none',
      ...style
    };

    // Add visual feedback during drag
    if (isDragging) {
      baseStyle.opacity = 0.8;
      baseStyle.transform = 'scale(1.02)';
      baseStyle.transition = 'all 0.1s ease-out';
    }

    return baseStyle;
  }, [isDragging, disabled, style]);

  // Calculate CSS classes for visual states
  const dragHandleClasses = useMemo(() => {
    const baseClasses = [
      'drag-handle',
      'transition-all',
      'duration-150',
      className
    ];

    if (disabled) {
      baseClasses.push('cursor-not-allowed', 'opacity-50');
    } else {
      baseClasses.push('hover:bg-white', 'hover:bg-opacity-10');
      
      if (isDragging) {
        baseClasses.push('bg-white', 'bg-opacity-20', 'shadow-lg');
      } else {
        baseClasses.push('hover:shadow-sm');
      }
    }

    if (isSelected) {
      baseClasses.push('ring-2', 'ring-blue-400', 'ring-opacity-50');
    }

    return baseClasses.join(' ');
  }, [isDragging, disabled, isSelected, className]);

  // Handle mouse down for drag initiation
  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;

    // Prevent default to avoid text selection
    event.preventDefault();
    
    // Select panel on interaction
    handleSelect(event.ctrlKey || event.metaKey);
    
    // Start drag operation
    handleDragStart(event);

    // Call custom onMove callback if provided
    if (onMove && currentPosition) {
      onMove(currentPosition);
    }
  };

  // Handle double-click for potential actions (like minimize/maximize)
  const handleDoubleClick = (event: React.MouseEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Could emit a custom event or call a callback
    // This could be used for panel maximize/minimize functionality
    const customEvent = new CustomEvent('panelDoubleClick', {
      detail: { panelId }
    });
    document.dispatchEvent(customEvent);
  };

  // Handle keyboard interaction for accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    // Allow Enter or Space to focus/select the panel
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(event.ctrlKey || event.metaKey);
    }
  };

  return (
    <div
      className={dragHandleClasses}
      style={dragHandleStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`Drag handle for panel ${panelId}`}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      data-panel-id={panelId}
      data-dragging={isDragging}
    >
      {/* Grab indicator dots (optional visual element) */}
      {showGrabIndicator && !disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex space-x-1 opacity-30">
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Drag preview overlay (shows during drag) */}
      {isDragging && (
        <div 
          className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-400 border-dashed rounded pointer-events-none animate-pulse"
          style={{ zIndex: 1000 }}
        />
      )}

      {/* Focus indicator for keyboard navigation */}
      <div 
        className={`absolute inset-0 rounded ring-2 ring-blue-500 ring-opacity-0 transition-all duration-150 pointer-events-none ${
          isSelected ? 'ring-opacity-50' : 'focus-within:ring-opacity-75'
        }`}
      />
    </div>
  );
};

// Specialized header drag handle component
export interface HeaderDragHandleProps extends Omit<DragHandleProps, 'children'> {
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  showTitle?: boolean;
}

export const HeaderDragHandle: React.FC<HeaderDragHandleProps> = ({
  title = '',
  icon,
  actions,
  showTitle = true,
  className = '',
  ...dragHandleProps
}) => {
  const headerClasses = useMemo(() => {
    return [
      'flex',
      'items-center',
      'justify-between',
      'w-full',
      'min-h-[32px]',
      'px-3',
      'py-2',
      'rounded-t-lg',
      className
    ].join(' ');
  }, [className]);

  return (
    <DragHandle
      {...dragHandleProps}
      className={headerClasses}
      showGrabIndicator={false}
    >
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        {icon && (
          <div className="flex-shrink-0 w-4 h-4 text-white text-opacity-80">
            {icon}
          </div>
        )}
        
        {showTitle && title && (
          <h3 className="text-sm font-medium text-white text-opacity-90 truncate">
            {title}
          </h3>
        )}
      </div>

      {actions && (
        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
          {actions}
        </div>
      )}
    </DragHandle>
  );
};

DragHandle.displayName = 'DragHandle';
HeaderDragHandle.displayName = 'HeaderDragHandle';

export default DragHandle;