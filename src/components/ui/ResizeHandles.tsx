import React, { useState, useCallback } from 'react';
import { Position, Size } from '../../types/panel';
import clsx from 'clsx';

// Resize handle direction type
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

// Handle state interface
interface HandleState {
  isHovered: boolean;
  isActive: boolean;
  isDisabled: boolean;
}

// Resize handle props
export interface ResizeHandleProps {
  direction: ResizeDirection;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  visible?: boolean;
  touchEnabled?: boolean;
  onMouseDown?: (event: React.MouseEvent, direction: ResizeDirection) => void;
  onTouchStart?: (event: React.TouchEvent, direction: ResizeDirection) => void;
  children?: React.ReactNode;
}

// Resize handles group props
export interface ResizeHandlesProps {
  panelSize: Size;
  position: Position;
  handles?: ResizeDirection[];
  handleSize?: number;
  handleClassName?: string;
  disabled?: boolean;
  visible?: boolean;
  touchEnabled?: boolean;
  showOnHover?: boolean;
  collisionDetection?: boolean;
  onResizeStart?: (direction: ResizeDirection, event: React.MouseEvent | React.TouchEvent) => void;
  onHandleStateChange?: (direction: ResizeDirection, state: HandleState) => void;
}

// Default handle configurations
const DEFAULT_HANDLES: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const DEFAULT_HANDLE_SIZE = 8;

// Handle cursor mappings
const HANDLE_CURSORS: Record<ResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  sw: 'nesw-resize',
};

// Handle positioning calculations
const calculateHandlePosition = (
  direction: ResizeDirection,
  panelSize: Size,
  handleSize: number
): { position: React.CSSProperties; size: React.CSSProperties } => {
  const halfHandle = handleSize / 2;

  const positions = {
    // Corner handles
    nw: {
      position: { top: -halfHandle, left: -halfHandle },
      size: { width: handleSize, height: handleSize },
    },
    ne: {
      position: { top: -halfHandle, right: -halfHandle },
      size: { width: handleSize, height: handleSize },
    },
    sw: {
      position: { bottom: -halfHandle, left: -halfHandle },
      size: { width: handleSize, height: handleSize },
    },
    se: {
      position: { bottom: -halfHandle, right: -halfHandle },
      size: { width: handleSize, height: handleSize },
    },

    // Edge handles
    n: {
      position: { top: -halfHandle, left: halfHandle, right: halfHandle },
      size: { height: handleSize },
    },
    s: {
      position: { bottom: -halfHandle, left: halfHandle, right: halfHandle },
      size: { height: handleSize },
    },
    w: {
      position: { left: -halfHandle, top: halfHandle, bottom: halfHandle },
      size: { width: handleSize },
    },
    e: {
      position: { right: -halfHandle, top: halfHandle, bottom: halfHandle },
      size: { width: handleSize },
    },
  };

  return positions[direction];
};

// Individual resize handle component
const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  size = DEFAULT_HANDLE_SIZE,
  className = '',
  style = {},
  disabled = false,
  visible = true,
  touchEnabled = true,
  onMouseDown,
  onTouchStart,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const cursor = HANDLE_CURSORS[direction];
  const { position, size: handleSize } = calculateHandlePosition(
    direction,
    { width: 0, height: 0 },
    size
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;

      event.preventDefault();
      event.stopPropagation();

      setIsActive(true);
      onMouseDown?.(event, direction);

      // Add global mouse up listener to reset active state
      const handleMouseUp = () => {
        setIsActive(false);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mouseup', handleMouseUp);
    },
    [disabled, onMouseDown, direction]
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (disabled || !touchEnabled) return;

      event.preventDefault();
      event.stopPropagation();

      setIsActive(true);
      onTouchStart?.(event, direction);

      // Add global touch end listener to reset active state
      const handleTouchEnd = () => {
        setIsActive(false);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchend', handleTouchEnd);
    },
    [disabled, touchEnabled, onTouchStart, direction]
  );

  if (!visible) return null;

  return (
    <div
      className={clsx(
        'absolute select-none touch-none z-10 transition-all duration-150',
        'flex items-center justify-center',
        {
          // Visibility states
          'opacity-0 hover:opacity-100': !isHovered && !isActive,
          'opacity-100': isHovered || isActive,

          // Interaction states
          'pointer-events-none': disabled,
          'cursor-pointer': !disabled,

          // Visual feedback
          'bg-blue-500/30 hover:bg-blue-500/50': !isActive && !disabled,
          'bg-blue-600/70': isActive,
          'bg-gray-400/30': disabled,

          // Handle shape
          'rounded-full': ['ne', 'nw', 'se', 'sw'].includes(direction),
          rounded: !['ne', 'nw', 'se', 'sw'].includes(direction),

          // Size variations
          'border border-white/20': size >= 6,
          'shadow-sm': size >= 8,
        },
        className
      )}
      style={{
        ...position,
        ...handleSize,
        cursor: disabled ? 'default' : cursor,
        ...style,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-resize-handle={direction}
      data-testid={`resize-handle-${direction}`}
      role="button"
      aria-label={`Resize ${direction}`}
      tabIndex={disabled ? -1 : 0}
    >
      {children || (
        <>
          {/* Corner handle indicators */}
          {['ne', 'nw', 'se', 'sw'].includes(direction) && (
            <div className="w-2 h-2 bg-current rounded-full opacity-60" />
          )}

          {/* Edge handle indicators */}
          {['n', 's'].includes(direction) && (
            <div className="w-4 h-1 bg-current rounded-full opacity-60" />
          )}

          {['e', 'w'].includes(direction) && (
            <div className="w-1 h-4 bg-current rounded-full opacity-60" />
          )}
        </>
      )}
    </div>
  );
};

// Handle collision detection
const detectHandleCollisions = (
  handles: ResizeDirection[],
  panelSize: Size,
  handleSize: number,
  otherPanels: Array<{ position: Position; size: Size }> = []
): ResizeDirection[] => {
  // Simple collision detection - check if handles would overlap with other panels
  const visibleHandles = handles.filter(direction => {
    const { position } = calculateHandlePosition(direction, panelSize, handleSize);

    // For now, return all handles as visible
    // In a real implementation, you would check against otherPanels positions
    return true;
  });

  return visibleHandles;
};

// Smart handle positioning to avoid overlaps
const optimizeHandlePositions = (
  handles: ResizeDirection[],
  panelSize: Size,
  constraints: { minSpacing: number }
): ResizeDirection[] => {
  // If panel is too small, hide some handles
  const minSizeForAllHandles = 60;

  if (panelSize.width < minSizeForAllHandles || panelSize.height < minSizeForAllHandles) {
    // Show only corner handles for small panels
    return handles.filter(direction => ['ne', 'nw', 'se', 'sw'].includes(direction));
  }

  return handles;
};

// Main resize handles component
export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  panelSize,
  position,
  handles = DEFAULT_HANDLES,
  handleSize = DEFAULT_HANDLE_SIZE,
  handleClassName = '',
  disabled = false,
  visible = true,
  touchEnabled = true,
  showOnHover = false,
  collisionDetection = true,
  onResizeStart,
  onHandleStateChange,
}) => {
  const [hoveredHandle, setHoveredHandle] = useState<ResizeDirection | null>(null);
  const [handleStates, setHandleStates] = useState<Map<ResizeDirection, HandleState>>(new Map());

  // Optimize handle visibility based on panel size and collisions
  const visibleHandles = React.useMemo(() => {
    let optimizedHandles = handles;

    // Apply size-based optimization
    optimizedHandles = optimizeHandlePositions(optimizedHandles, panelSize, {
      minSpacing: handleSize,
    });

    // Apply collision detection if enabled
    if (collisionDetection) {
      optimizedHandles = detectHandleCollisions(optimizedHandles, panelSize, handleSize);
    }

    return optimizedHandles;
  }, [handles, panelSize, handleSize, collisionDetection]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent, direction: ResizeDirection) => {
      if (disabled) return;

      setHandleStates(prev => {
        const newMap = new Map(prev);
        newMap.set(direction, {
          ...newMap.get(direction),
          isActive: true,
          isHovered: false,
        } as HandleState);
        return newMap;
      });

      onResizeStart?.(direction, event);

      // Notify of state change
      onHandleStateChange?.(direction, {
        isHovered: false,
        isActive: true,
        isDisabled: disabled,
      });
    },
    [disabled, onResizeStart, onHandleStateChange]
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent, direction: ResizeDirection) => {
      if (disabled || !touchEnabled) return;

      setHandleStates(prev => {
        const newMap = new Map(prev);
        newMap.set(direction, {
          ...newMap.get(direction),
          isActive: true,
          isHovered: false,
        } as HandleState);
        return newMap;
      });

      onResizeStart?.(direction, event);

      // Notify of state change
      onHandleStateChange?.(direction, {
        isHovered: false,
        isActive: true,
        isDisabled: disabled,
      });
    },
    [disabled, touchEnabled, onResizeStart, onHandleStateChange]
  );

  const handleMouseEnter = useCallback(
    (direction: ResizeDirection) => {
      setHoveredHandle(direction);
      setHandleStates(prev => {
        const newMap = new Map(prev);
        newMap.set(direction, {
          ...newMap.get(direction),
          isHovered: true,
        } as HandleState);
        return newMap;
      });

      onHandleStateChange?.(direction, {
        isHovered: true,
        isActive: handleStates.get(direction)?.isActive || false,
        isDisabled: disabled,
      });
    },
    [handleStates, disabled, onHandleStateChange]
  );

  const handleMouseLeave = useCallback(
    (direction: ResizeDirection) => {
      if (hoveredHandle === direction) {
        setHoveredHandle(null);
      }

      setHandleStates(prev => {
        const newMap = new Map(prev);
        newMap.set(direction, {
          ...newMap.get(direction),
          isHovered: false,
        } as HandleState);
        return newMap;
      });

      onHandleStateChange?.(direction, {
        isHovered: false,
        isActive: handleStates.get(direction)?.isActive || false,
        isDisabled: disabled,
      });
    },
    [hoveredHandle, handleStates, disabled, onHandleStateChange]
  );

  if (!visible) return null;

  const shouldShowHandles =
    !showOnHover ||
    hoveredHandle !== null ||
    Array.from(handleStates.values()).some(state => state.isActive);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {visibleHandles.map(direction => {
        const handleState = handleStates.get(direction);
        const isHandleVisible =
          shouldShowHandles || handleState?.isActive || handleState?.isHovered;

        return (
          <ResizeHandle
            key={direction}
            direction={direction}
            size={handleSize}
            className={clsx(
              'pointer-events-auto',
              {
                'opacity-0': !isHandleVisible && showOnHover,
                'opacity-100': isHandleVisible || !showOnHover,
              },
              handleClassName
            )}
            disabled={disabled}
            visible={isHandleVisible || !showOnHover}
            touchEnabled={touchEnabled}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        );
      })}

      {/* Handle interaction overlay for better touch targets */}
      {touchEnabled && (
        <div
          className="absolute inset-0 touch-none"
          onMouseEnter={() => visibleHandles.forEach(direction => handleMouseEnter(direction))}
          onMouseLeave={() => visibleHandles.forEach(direction => handleMouseLeave(direction))}
        />
      )}

      {/* Visual debugging overlay (development only) */}
      {process.env.NODE_ENV === 'development' && hoveredHandle && (
        <div className="absolute top-0 left-0 bg-blue-500/20 text-blue-200 text-xs px-2 py-1 rounded pointer-events-none">
          Handle: {hoveredHandle}
        </div>
      )}
    </div>
  );
};
