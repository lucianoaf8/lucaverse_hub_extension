/**
 * Panel Interaction Hooks
 * Custom hooks for handling panel drag, resize, selection, and grid snapping
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLayoutStore } from '@/stores/layoutStore';
import type { Position, Size } from '@/types/panel';
import type { ResizeDirection } from '@/types/layout';
import {
  snapToGrid,
  shouldSnapToGrid,
  detectCollisions,
  getConstrainedPosition,
  getConstrainedSize,
  calculateSnapZones,
  calculateResizeDelta,
  throttle,
} from '@/components/ui/utils';

// Panel drag hook
export function usePanelDrag(panelId: string) {
  const { getPanel, panels, gridSettings, startDrag, updateDrag, endDrag, updatePanel, dragState } =
    useLayoutStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const dragStartPosition = useRef<Position>({ x: 0, y: 0 });

  const handleDragStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const panel = getPanel(panelId);
      if (!panel) return;

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const offset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      setDragOffset(offset);
      setIsDragging(true);
      dragStartPosition.current = panel.position;
      startDrag(panelId, panel.position);
    },
    [panelId, getPanel, startDrag]
  );

  const handleDragMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!isDragging) return;

      const panel = getPanel(panelId);
      if (!panel) return;

      let newPosition = {
        x: event.clientX - dragOffset.x,
        y: event.clientY - dragOffset.y,
      };

      // Apply grid snapping
      if (shouldSnapToGrid(newPosition, gridSettings)) {
        newPosition = snapToGrid(newPosition, gridSettings);
      }

      // Apply magnetic snap zones
      const { position: snappedPosition } = calculateSnapZones(
        newPosition,
        panel.size,
        panels.filter(p => p.id !== panelId)
      );

      // Constrain to boundaries
      const constrainedPosition = getConstrainedPosition(
        snappedPosition,
        panel.size,
        panel.constraints
      );

      updateDrag(constrainedPosition);
    }, 16), // ~60fps
    [isDragging, panelId, dragOffset, gridSettings, panels, getPanel, updateDrag]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    endDrag();

    // Update panel position in store
    const panel = getPanel(panelId);
    if (panel && dragState.currentPosition) {
      updatePanel(panelId, { position: dragState.currentPosition });
    }
  }, [isDragging, panelId, endDrag, getPanel, updatePanel, dragState.currentPosition]);

  // Attach global mouse event listeners during drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';

      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return {
    isDragging,
    dragOffset,
    handleDragStart,
    currentPosition:
      dragState.isDragging && dragState.draggedPanelId === panelId
        ? dragState.currentPosition
        : undefined,
  };
}

// Panel resize hook
export function usePanelResize(panelId: string) {
  const {
    getPanel,
    panels,
    gridSettings,
    startResize,
    updateResize,
    endResize,
    updatePanel,
    resizeState,
  } = useLayoutStore();

  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const resizeStartData = useRef<{ position: Position; size: Size } | null>(null);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent, direction: string) => {
      event.preventDefault();
      event.stopPropagation();

      const panel = getPanel(panelId);
      if (!panel) return;

      setIsResizing(true);
      setResizeDirection(direction);
      resizeStartData.current = {
        position: panel.position,
        size: panel.size,
      };

      startResize(panelId, direction, panel.size);
    },
    [panelId, getPanel, startResize]
  );

  const handleResizeMove = useCallback(
    throttle((event: MouseEvent) => {
      if (!isResizing || !resizeStartData.current) return;

      const panel = getPanel(panelId);
      if (!panel) return;

      const deltaX = event.movementX;
      const deltaY = event.movementY;

      const { position: newPosition, size: newSize } = calculateResizeDelta(
        resizeDirection,
        { x: deltaX, y: deltaY },
        resizeState.startPosition,
        resizeState.currentSize
      );

      // Apply constraints
      const constrainedSize = getConstrainedSize(newSize, panel.constraints);
      let constrainedPosition = newPosition;

      // Adjust position if size was constrained
      if (resizeDirection.includes('n') && constrainedSize.height !== newSize.height) {
        constrainedPosition.y =
          resizeStartData.current.position.y +
          (resizeStartData.current.size.height - constrainedSize.height);
      }
      if (resizeDirection.includes('w') && constrainedSize.width !== newSize.width) {
        constrainedPosition.x =
          resizeStartData.current.position.x +
          (resizeStartData.current.size.width - constrainedSize.width);
      }

      // Apply grid snapping to size
      if (gridSettings.enabled) {
        const snappedSize = {
          width: Math.round(constrainedSize.width / gridSettings.size) * gridSettings.size,
          height: Math.round(constrainedSize.height / gridSettings.size) * gridSettings.size,
        };

        if (shouldSnapToGrid({ x: snappedSize.width, y: snappedSize.height }, gridSettings)) {
          updateResize(snappedSize);
          return;
        }
      }

      updateResize(constrainedSize);
    }, 16), // ~60fps
    [isResizing, resizeDirection, panelId, getPanel, gridSettings, updateResize, resizeState]
  );

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    setResizeDirection('');
    resizeStartData.current = null;

    // Update panel in store
    const panel = getPanel(panelId);
    if (panel && resizeState.currentSize) {
      const updates: any = { size: resizeState.currentSize };

      // Update position if resize affected it (north/west directions)
      if (resizeDirection.includes('n') || resizeDirection.includes('w')) {
        const deltaWidth = resizeState.currentSize.width - resizeState.startSize.width;
        const deltaHeight = resizeState.currentSize.height - resizeState.startSize.height;

        updates.position = {
          x: resizeDirection.includes('w') ? panel.position.x - deltaWidth : panel.position.x,
          y: resizeDirection.includes('n') ? panel.position.y - deltaHeight : panel.position.y,
        };
      }

      updatePanel(panelId, updates);
    }

    endResize();
  }, [isResizing, panelId, resizeDirection, getPanel, updatePanel, endResize, resizeState]);

  // Attach global mouse event listeners during resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return {
    isResizing,
    resizeDirection,
    handleResizeStart,
    currentSize:
      resizeState.isResizing && resizeState.resizedPanelId === panelId
        ? resizeState.currentSize
        : undefined,
  };
}

// Panel selection hook
export function usePanelSelection(panelId: string) {
  const { selectedPanelIds, selectPanel, deselectPanel, clearSelection } = useLayoutStore();

  const isSelected = selectedPanelIds.includes(panelId);

  const handleSelect = useCallback(
    (multiSelect = false) => {
      selectPanel(panelId, multiSelect);
    },
    [panelId, selectPanel]
  );

  const handleDeselect = useCallback(() => {
    deselectPanel(panelId);
  }, [panelId, deselectPanel]);

  const handleToggleSelect = useCallback(
    (multiSelect = false) => {
      if (isSelected) {
        handleDeselect();
      } else {
        handleSelect(multiSelect);
      }
    },
    [isSelected, handleSelect, handleDeselect]
  );

  return {
    isSelected,
    handleSelect,
    handleDeselect,
    handleToggleSelect,
    clearSelection,
  };
}

// Grid snapping hook
export function useGridSnap() {
  const { gridSettings, updateGridSettings } = useLayoutStore();

  const snapPositionToGrid = useCallback(
    (position: Position): Position => {
      return snapToGrid(position, gridSettings);
    },
    [gridSettings]
  );

  const snapSizeToGrid = useCallback(
    (size: Size): Size => {
      if (!gridSettings.enabled) return size;

      const { size: gridSize } = gridSettings;
      return {
        width: Math.round(size.width / gridSize) * gridSize,
        height: Math.round(size.height / gridSize) * gridSize,
      };
    },
    [gridSettings]
  );

  const shouldSnap = useCallback(
    (position: Position): boolean => {
      return shouldSnapToGrid(position, gridSettings);
    },
    [gridSettings]
  );

  const toggleGrid = useCallback(() => {
    updateGridSettings({ enabled: !gridSettings.enabled });
  }, [gridSettings.enabled, updateGridSettings]);

  const setGridSize = useCallback(
    (size: number) => {
      updateGridSettings({ size });
    },
    [updateGridSettings]
  );

  const setGridVisibility = useCallback(
    (visible: boolean) => {
      updateGridSettings({ visible });
    },
    [updateGridSettings]
  );

  return {
    gridSettings,
    snapPositionToGrid,
    snapSizeToGrid,
    shouldSnap,
    toggleGrid,
    setGridSize,
    setGridVisibility,
  };
}

// Keyboard shortcuts hook for panel navigation
export function useKeyboardShortcuts(panelId: string) {
  const { getPanel, updatePanel, removePanel, duplicatePanel, centerPanel, selectedPanelIds } =
    useLayoutStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const panel = getPanel(panelId);
      if (!panel || !selectedPanelIds.includes(panelId)) return;

      const step = event.shiftKey ? 10 : 1;
      const gridStep = event.ctrlKey ? 20 : step;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          updatePanel(panelId, {
            position: { x: panel.position.x, y: panel.position.y - gridStep },
          });
          break;
        case 'ArrowDown':
          event.preventDefault();
          updatePanel(panelId, {
            position: { x: panel.position.x, y: panel.position.y + gridStep },
          });
          break;
        case 'ArrowLeft':
          event.preventDefault();
          updatePanel(panelId, {
            position: { x: panel.position.x - gridStep, y: panel.position.y },
          });
          break;
        case 'ArrowRight':
          event.preventDefault();
          updatePanel(panelId, {
            position: { x: panel.position.x + gridStep, y: panel.position.y },
          });
          break;
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          removePanel(panelId);
          break;
        case 'd':
          if (event.ctrlKey) {
            event.preventDefault();
            duplicatePanel(panelId);
          }
          break;
        case 'c':
          if (event.ctrlKey && event.shiftKey) {
            event.preventDefault();
            centerPanel(panelId);
          }
          break;
        default:
          break;
      }
    },
    [panelId, getPanel, updatePanel, removePanel, duplicatePanel, centerPanel, selectedPanelIds]
  );

  // Attach keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    // Expose manual trigger functions if needed
    movePanel: (direction: 'up' | 'down' | 'left' | 'right', distance = 1) => {
      const panel = getPanel(panelId);
      if (!panel) return;

      const deltas = {
        up: { x: 0, y: -distance },
        down: { x: 0, y: distance },
        left: { x: -distance, y: 0 },
        right: { x: distance, y: 0 },
      };

      const delta = deltas[direction];
      updatePanel(panelId, {
        position: {
          x: panel.position.x + delta.x,
          y: panel.position.y + delta.y,
        },
      });
    },
  };
}
