/**
 * ResizeHandle Component
 * Provides 8-directional resize handles for panels
 * Supports constraints, grid snapping, and visual feedback
 */

import React, { useMemo } from 'react';
import { getResizeCursor } from '../ui/utils';
import { usePanelResize } from '@/hooks/usePanelInteractions';
import type { PanelConstraints } from '@/types/panel';

export interface ResizeHandleProps {
  direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  panelId: string;
  constraints?: PanelConstraints;
  onResize?: (direction: string, delta: { x: number; y: number }) => void;
  disabled?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  panelId,
  constraints,
  onResize,
  disabled = false,
  size = 8,
  className = '',
  style = {},
}) => {
  const { isResizing, resizeDirection, handleResizeStart } = usePanelResize(panelId);

  // Calculate handle positioning and styling
  const handleStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      cursor: disabled ? 'default' : getResizeCursor(direction),
      backgroundColor: 'transparent',
      border: 'none',
      zIndex: 100,
      ...style,
    };

    // Position handles based on direction
    switch (direction) {
      case 'n':
        return {
          ...baseStyle,
          top: -size / 2,
          left: size / 2,
          right: size / 2,
          height: size,
          cursor: disabled ? 'default' : 'ns-resize',
        };
      case 's':
        return {
          ...baseStyle,
          bottom: -size / 2,
          left: size / 2,
          right: size / 2,
          height: size,
          cursor: disabled ? 'default' : 'ns-resize',
        };
      case 'e':
        return {
          ...baseStyle,
          right: -size / 2,
          top: size / 2,
          bottom: size / 2,
          width: size,
          cursor: disabled ? 'default' : 'ew-resize',
        };
      case 'w':
        return {
          ...baseStyle,
          left: -size / 2,
          top: size / 2,
          bottom: size / 2,
          width: size,
          cursor: disabled ? 'default' : 'ew-resize',
        };
      case 'ne':
        return {
          ...baseStyle,
          top: -size / 2,
          right: -size / 2,
          width: size,
          height: size,
          cursor: disabled ? 'default' : 'nesw-resize',
        };
      case 'nw':
        return {
          ...baseStyle,
          top: -size / 2,
          left: -size / 2,
          width: size,
          height: size,
          cursor: disabled ? 'default' : 'nwse-resize',
        };
      case 'se':
        return {
          ...baseStyle,
          bottom: -size / 2,
          right: -size / 2,
          width: size,
          height: size,
          cursor: disabled ? 'default' : 'nwse-resize',
        };
      case 'sw':
        return {
          ...baseStyle,
          bottom: -size / 2,
          left: -size / 2,
          width: size,
          height: size,
          cursor: disabled ? 'default' : 'nesw-resize',
        };
      default:
        return baseStyle;
    }
  }, [direction, size, disabled, style]);

  // Visual feedback classes
  const handleClasses = useMemo(() => {
    const baseClasses = [
      'resize-handle',
      'transition-all',
      'duration-150',
      'hover:bg-blue-500',
      'hover:bg-opacity-60',
      className,
    ];

    if (isResizing && resizeDirection === direction) {
      baseClasses.push('bg-blue-500', 'bg-opacity-80', 'shadow-lg');
    } else {
      baseClasses.push('hover:shadow-md');
    }

    if (disabled) {
      baseClasses.push('cursor-not-allowed', 'opacity-50');
    } else {
      baseClasses.push('hover:scale-110');
    }

    // Direction-specific classes for better visual distinction
    switch (direction) {
      case 'n':
      case 's':
        baseClasses.push('rounded-t-sm', 'rounded-b-sm');
        break;
      case 'e':
      case 'w':
        baseClasses.push('rounded-l-sm', 'rounded-r-sm');
        break;
      case 'ne':
      case 'nw':
      case 'se':
      case 'sw':
        baseClasses.push('rounded-sm');
        break;
    }

    return baseClasses.join(' ');
  }, [isResizing, resizeDirection, direction, disabled, className]);

  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();

    handleResizeStart(event, direction);

    // Call custom onResize callback if provided
    if (onResize) {
      onResize(direction, { x: 0, y: 0 });
    }
  };

  return (
    <div
      className={handleClasses}
      style={handleStyle}
      onMouseDown={handleMouseDown}
      data-resize-direction={direction}
      data-panel-id={panelId}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Resize ${direction}`}
      aria-disabled={disabled}
    >
      {/* Handle indicator (optional visual element) */}
      {!disabled && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-150"
          style={{
            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.6))',
            borderRadius: 'inherit',
          }}
        />
      )}

      {/* Active resize indicator */}
      {isResizing && resizeDirection === direction && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 'inherit',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
          }}
        />
      )}
    </div>
  );
};

// Compound component for all resize handles
export interface ResizeHandlesProps {
  panelId: string;
  constraints?: PanelConstraints;
  onResize?: (direction: string, delta: { x: number; y: number }) => void;
  disabled?: boolean;
  size?: number;
  directions?: Array<'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'>;
  className?: string;
  style?: React.CSSProperties;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  panelId,
  constraints,
  onResize,
  disabled = false,
  size = 8,
  directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'],
  className = '',
  style = {},
}) => {
  return (
    <>
      {directions.map(direction => (
        <ResizeHandle
          key={direction}
          direction={direction}
          panelId={panelId}
          constraints={constraints}
          onResize={onResize}
          disabled={disabled}
          size={size}
          className={className}
          style={style}
        />
      ))}
    </>
  );
};

ResizeHandle.displayName = 'ResizeHandle';
ResizeHandles.displayName = 'ResizeHandles';

export default ResizeHandle;
