/**
 * Panel Utility Functions
 * Additional utility functions for panel interactions
 */

import type { Position, Size } from '@/types/panel';
import type { GridSettings } from '@/types/layout';

// Simple throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | undefined;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Check if position should snap to grid
export const shouldSnapToGrid = (
  position: Position, 
  gridSettings: GridSettings,
  threshold = 10
): boolean => {
  if (!gridSettings.enabled) return false;
  
  const { size } = gridSettings;
  const snappedX = Math.round(position.x / size) * size;
  const snappedY = Math.round(position.y / size) * size;
  
  const distanceX = Math.abs(position.x - snappedX);
  const distanceY = Math.abs(position.y - snappedY);
  
  return distanceX <= threshold || distanceY <= threshold;
};

// Alias for constrainPosition
export { constrainPosition as getConstrainedPosition } from './panelBounds';

// Alias for constrainSize  
export { constrainSize as getConstrainedSize } from './panelBounds';

// Calculate snap zones for magnetic snapping
export const calculateSnapZones = (
  position: Position,
  size: Size,
  otherPanels: Array<{ position: Position; size: Size }>,
  snapDistance = 10
): { position: Position; snapped: boolean } => {
  let snappedPosition = { ...position };
  let hasSnapped = false;
  
  for (const panel of otherPanels) {
    // Check for horizontal snapping
    const rightEdge = panel.position.x + panel.size.width;
    const leftEdge = panel.position.x;
    
    if (Math.abs(position.x - rightEdge) <= snapDistance) {
      snappedPosition.x = rightEdge;
      hasSnapped = true;
    } else if (Math.abs(position.x + size.width - leftEdge) <= snapDistance) {
      snappedPosition.x = leftEdge - size.width;
      hasSnapped = true;
    }
    
    // Check for vertical snapping
    const bottomEdge = panel.position.y + panel.size.height;
    const topEdge = panel.position.y;
    
    if (Math.abs(position.y - bottomEdge) <= snapDistance) {
      snappedPosition.y = bottomEdge;
      hasSnapped = true;
    } else if (Math.abs(position.y + size.height - topEdge) <= snapDistance) {
      snappedPosition.y = topEdge - size.height;
      hasSnapped = true;
    }
  }
  
  return { position: snappedPosition, snapped: hasSnapped };
};

// Calculate resize delta
export const calculateResizeDelta = (
  direction: string,
  delta: { x: number; y: number },
  startPosition: Position,
  currentSize: Size
): { position: Position; size: Size } => {
  let newPosition = { ...startPosition };
  let newSize = { ...currentSize };
  
  if (direction.includes('n')) {
    newPosition.y += delta.y;
    newSize.height -= delta.y;
  }
  if (direction.includes('s')) {
    newSize.height += delta.y;
  }
  if (direction.includes('w')) {
    newPosition.x += delta.x;
    newSize.width -= delta.x;
  }
  if (direction.includes('e')) {
    newSize.width += delta.x;
  }
  
  // Ensure minimum size
  if (newSize.width < 100) {
    if (direction.includes('w')) {
      newPosition.x = startPosition.x + currentSize.width - 100;
    }
    newSize.width = 100;
  }
  if (newSize.height < 100) {
    if (direction.includes('n')) {
      newPosition.y = startPosition.y + currentSize.height - 100;
    }
    newSize.height = 100;
  }
  
  return { position: newPosition, size: newSize };
};