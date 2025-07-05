import React, { ReactNode, useState, useRef, useCallback, useEffect } from 'react';
import { Position, Size } from '../../types/panel';
import clsx from 'clsx';

// Enhanced resize constraints interface
export interface ResizeConstraints {
  minSize: Size;
  maxSize?: Size;
  aspectRatio?: {
    ratio: number;
    lock: boolean;
  };
  snapToGrid?: {
    enabled: boolean;
    gridSize: number;
  };
  preserveAspectRatio?: boolean;
  maintainCenter?: boolean;
}

// Resize handle direction types
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

// Resize event data
export interface ResizeEventData {
  direction: ResizeDirection;
  startSize: Size;
  currentSize: Size;
  deltaSize: { width: number; height: number };
  isShiftPressed: boolean;
  isAltPressed: boolean;
  isCtrlPressed: boolean;
}

export interface ResizablePanelProps {
  id: string;
  children: ReactNode;
  position: Position;
  size: Size;
  constraints?: ResizeConstraints;
  className?: string;
  disabled?: boolean;
  
  // Resize handles configuration
  handles?: ResizeDirection[];
  handleSize?: number;
  handleClassName?: string;
  
  // Event handlers
  onResizeStart?: (event: ResizeEventData) => void;
  onResize?: (newSize: Size, event: ResizeEventData) => void;
  onResizeEnd?: (finalSize: Size, event: ResizeEventData) => void;
  
  // Visual feedback options
  showPreview?: boolean;
  showConstraints?: boolean;
  showSnapGuides?: boolean;
}

// Default constraints
const DEFAULT_CONSTRAINTS: ResizeConstraints = {
  minSize: { width: 100, height: 100 },
  maxSize: { width: 1920, height: 1080 },
  preserveAspectRatio: false,
  maintainCenter: false,
};

// Default handles (all 8 directions)
const DEFAULT_HANDLES: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  id,
  children,
  position,
  size,
  constraints = DEFAULT_CONSTRAINTS,
  className = '',
  disabled = false,
  handles = DEFAULT_HANDLES,
  handleSize = 8,
  handleClassName = '',
  onResizeStart,
  onResize,
  onResizeEnd,
  showPreview = true,
  showConstraints = false,
  showSnapGuides = true,
}) => {
  // State management
  const [isResizing, setIsResizing] = useState(false);
  const [activeDirection, setActiveDirection] = useState<ResizeDirection | null>(null);
  const [previewSize, setPreviewSize] = useState<Size>(size);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });
  const [modifierKeys, setModifierKeys] = useState({
    shift: false,
    alt: false,
    ctrl: false,
  });

  // Refs
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const startSizeRef = useRef<Size>(size);

  // Merged constraints with defaults
  const finalConstraints = { ...DEFAULT_CONSTRAINTS, ...constraints };

  // Calculate cursor style for resize direction
  const getCursorForDirection = (direction: ResizeDirection): string => {
    const cursors = {
      n: 'ns-resize',
      s: 'ns-resize', 
      e: 'ew-resize',
      w: 'ew-resize',
      ne: 'nesw-resize',
      nw: 'nwse-resize',
      se: 'nwse-resize',
      sw: 'nesw-resize',
    };
    return cursors[direction];
  };

  // Enforce size constraints
  const enforceConstraints = useCallback((newSize: Size, aspectRatioLocked: boolean = false): Size => {
    let constrainedSize = { ...newSize };

    // Apply min/max constraints
    constrainedSize.width = Math.max(finalConstraints.minSize.width, constrainedSize.width);
    constrainedSize.height = Math.max(finalConstraints.minSize.height, constrainedSize.height);

    if (finalConstraints.maxSize) {
      constrainedSize.width = Math.min(finalConstraints.maxSize.width, constrainedSize.width);
      constrainedSize.height = Math.min(finalConstraints.maxSize.height, constrainedSize.height);
    }

    // Apply aspect ratio if locked
    if (aspectRatioLocked || finalConstraints.preserveAspectRatio) {
      const originalRatio = startSizeRef.current.width / startSizeRef.current.height;
      const currentRatio = constrainedSize.width / constrainedSize.height;
      
      if (Math.abs(currentRatio - originalRatio) > 0.01) {
        // Adjust to maintain aspect ratio, prioritizing the dimension that changed more
        const widthChange = Math.abs(constrainedSize.width - startSizeRef.current.width);
        const heightChange = Math.abs(constrainedSize.height - startSizeRef.current.height);
        
        if (widthChange > heightChange) {
          constrainedSize.height = constrainedSize.width / originalRatio;
        } else {
          constrainedSize.width = constrainedSize.height * originalRatio;
        }
      }
    }

    // Snap to grid if enabled
    if (finalConstraints.snapToGrid?.enabled) {
      const gridSize = finalConstraints.snapToGrid.gridSize;
      constrainedSize.width = Math.round(constrainedSize.width / gridSize) * gridSize;
      constrainedSize.height = Math.round(constrainedSize.height / gridSize) * gridSize;
    }

    return constrainedSize;
  }, [finalConstraints]);

  // Calculate new size based on resize direction and mouse movement
  const calculateNewSize = useCallback((
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
    originalSize: Size
  ): Size => {
    let newSize = { ...originalSize };

    switch (direction) {
      case 'e':
        newSize.width = originalSize.width + deltaX;
        break;
      case 'w':
        newSize.width = originalSize.width - deltaX;
        break;
      case 's':
        newSize.height = originalSize.height + deltaY;
        break;
      case 'n':
        newSize.height = originalSize.height - deltaY;
        break;
      case 'se':
        newSize.width = originalSize.width + deltaX;
        newSize.height = originalSize.height + deltaY;
        break;
      case 'sw':
        newSize.width = originalSize.width - deltaX;
        newSize.height = originalSize.height + deltaY;
        break;
      case 'ne':
        newSize.width = originalSize.width + deltaX;
        newSize.height = originalSize.height - deltaY;
        break;
      case 'nw':
        newSize.width = originalSize.width - deltaX;
        newSize.height = originalSize.height - deltaY;
        break;
    }

    return newSize;
  }, []);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((
    event: React.MouseEvent,
    direction: ResizeDirection
  ) => {
    if (disabled) return;

    event.preventDefault();
    event.stopPropagation();

    setIsResizing(true);
    setActiveDirection(direction);
    setStartPos({ x: event.clientX, y: event.clientY });
    startSizeRef.current = size;
    setPreviewSize(size);

    // Track modifier keys
    setModifierKeys({
      shift: event.shiftKey,
      alt: event.altKey,
      ctrl: event.ctrlKey,
    });

    // Create resize event data
    const resizeEventData: ResizeEventData = {
      direction,
      startSize: size,
      currentSize: size,
      deltaSize: { width: 0, height: 0 },
      isShiftPressed: event.shiftKey,
      isAltPressed: event.altKey,
      isCtrlPressed: event.ctrlKey,
    };

    onResizeStart?.(resizeEventData);

    // Add global mouse event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }, [disabled, size, onResizeStart]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isResizing || !activeDirection) return;

    // Use requestAnimationFrame for smooth performance
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const deltaX = event.clientX - startPos.x;
      const deltaY = event.clientY - startPos.y;

      const newSize = calculateNewSize(
        activeDirection,
        deltaX,
        deltaY,
        startSizeRef.current
      );

      const aspectRatioLocked = modifierKeys.shift || finalConstraints.preserveAspectRatio;
      const constrainedSize = enforceConstraints(newSize, aspectRatioLocked);

      setPreviewSize(constrainedSize);

      // Create resize event data
      const resizeEventData: ResizeEventData = {
        direction: activeDirection,
        startSize: startSizeRef.current,
        currentSize: constrainedSize,
        deltaSize: {
          width: constrainedSize.width - startSizeRef.current.width,
          height: constrainedSize.height - startSizeRef.current.height,
        },
        isShiftPressed: modifierKeys.shift,
        isAltPressed: modifierKeys.alt,
        isCtrlPressed: modifierKeys.ctrl,
      };

      onResize?.(constrainedSize, resizeEventData);
    });
  }, [
    isResizing,
    activeDirection,
    startPos,
    modifierKeys,
    calculateNewSize,
    enforceConstraints,
    finalConstraints.preserveAspectRatio,
    onResize
  ]);

  // Handle mouse up to end resize
  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!isResizing || !activeDirection) return;

    setIsResizing(false);
    setActiveDirection(null);

    // Create final resize event data
    const resizeEventData: ResizeEventData = {
      direction: activeDirection,
      startSize: startSizeRef.current,
      currentSize: previewSize,
      deltaSize: {
        width: previewSize.width - startSizeRef.current.width,
        height: previewSize.height - startSizeRef.current.height,
      },
      isShiftPressed: modifierKeys.shift,
      isAltPressed: modifierKeys.alt,
      isCtrlPressed: modifierKeys.ctrl,
    };

    onResizeEnd?.(previewSize, resizeEventData);

    // Cleanup event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [isResizing, activeDirection, previewSize, modifierKeys, onResizeEnd, handleMouseMove]);

  // Handle key events for modifier keys
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setModifierKeys(prev => ({
      ...prev,
      shift: event.shiftKey,
      alt: event.altKey,
      ctrl: event.ctrlKey,
    }));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setModifierKeys(prev => ({
      ...prev,
      shift: event.shiftKey,
      alt: event.altKey,
      ctrl: event.ctrlKey,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Render resize handle
  const renderHandle = (direction: ResizeDirection) => {
    const isActive = activeDirection === direction;
    const cursor = getCursorForDirection(direction);

    // Position classes for each direction
    const positionClasses = {
      n: 'absolute top-0 left-0 right-0 h-2 cursor-ns-resize',
      s: 'absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize',
      e: 'absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize',
      w: 'absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize',
      ne: 'absolute top-0 right-0 w-3 h-3 cursor-nesw-resize',
      nw: 'absolute top-0 left-0 w-3 h-3 cursor-nwse-resize',
      se: 'absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize',
      sw: 'absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize',
    };

    return (
      <div
        key={direction}
        className={clsx(
          positionClasses[direction],
          'resize-handle z-10 transition-all duration-150',
          {
            'bg-blue-500/30 hover:bg-blue-500/50': !isActive,
            'bg-blue-600/60': isActive,
            'opacity-0 hover:opacity-100': !isResizing,
            'opacity-100': isResizing || isActive,
          },
          handleClassName
        )}
        style={{ cursor }}
        onMouseDown={(e) => handleMouseDown(e, direction)}
      />
    );
  };

  // Current size (either actual or preview during resize)
  const currentSize = isResizing ? previewSize : size;

  return (
    <div
      ref={panelRef}
      className={clsx(
        'absolute select-none',
        {
          'resize-active': isResizing,
          'transition-all duration-200': !isResizing,
        },
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: currentSize.width,
        height: currentSize.height,
      }}
      data-panel-id={id}
      data-resizing={isResizing}
    >
      {/* Panel Content */}
      <div className="relative w-full h-full overflow-hidden">
        {children}
      </div>

      {/* Resize Handles */}
      {!disabled && handles.map(direction => renderHandle(direction))}

      {/* Resize Info Overlay */}
      {isResizing && showPreview && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 text-white text-xs rounded backdrop-blur-sm pointer-events-none z-20">
          {Math.round(currentSize.width)} × {Math.round(currentSize.height)}
          {modifierKeys.shift && <span className="ml-2 text-blue-300">[Ratio Locked]</span>}
        </div>
      )}

      {/* Constraint Violation Warning */}
      {showConstraints && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-red-500/80 text-white text-xs rounded backdrop-blur-sm pointer-events-none z-20">
          {currentSize.width < finalConstraints.minSize.width && 'Min Width'}
          {currentSize.height < finalConstraints.minSize.height && 'Min Height'}
        </div>
      )}
    </div>
  );
};