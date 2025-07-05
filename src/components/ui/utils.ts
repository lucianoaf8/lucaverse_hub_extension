/**
 * Component utilities for panel interactions
 * Provides shared functions for drag, resize, grid snapping, and collision detection
 */

import type { Position, Size, PanelLayout, PanelConstraints } from '@/types/panel';
import type { GridSettings } from '@/types/layout';

// Constraint calculation for drag/resize boundaries
export function calculateConstraints(
  size: Size,
  constraints?: PanelConstraints,
  containerBounds = { width: 1920, height: 1080 }
): { minX: number; maxX: number; minY: number; maxY: number } {
  const minX = constraints?.positionBounds?.left ?? 0;
  const minY = constraints?.positionBounds?.top ?? 0;
  const maxX = constraints?.positionBounds?.right ?? containerBounds.width - size.width;
  const maxY = constraints?.positionBounds?.bottom ?? containerBounds.height - size.height;

  return {
    minX: Math.max(0, minX),
    maxX: Math.min(containerBounds.width - size.width, maxX),
    minY: Math.max(0, minY),
    maxY: Math.min(containerBounds.height - size.height, maxY)
  };
}

// Grid snapping utility
export function snapToGrid(
  position: Position,
  gridSettings: GridSettings
): Position {
  if (!gridSettings.enabled) {
    return position;
  }

  const { size } = gridSettings;
  return {
    x: Math.round(position.x / size) * size,
    y: Math.round(position.y / size) * size
  };
}

// Check if position should snap to grid based on threshold
export function shouldSnapToGrid(
  position: Position,
  gridSettings: GridSettings
): boolean {
  if (!gridSettings.enabled) {
    return false;
  }

  const { size, snapThreshold } = gridSettings;
  const snappedPosition = snapToGrid(position, gridSettings);
  
  const distanceX = Math.abs(position.x - snappedPosition.x);
  const distanceY = Math.abs(position.y - snappedPosition.y);
  
  return distanceX <= snapThreshold || distanceY <= snapThreshold;
}

// Collision detection between panels
export function detectCollisions(
  position: Position,
  size: Size,
  panels: PanelLayout[],
  excludeId?: string
): PanelLayout[] {
  const collisions: PanelLayout[] = [];

  for (const panel of panels) {
    if (panel.id === excludeId) continue;

    const isColliding = !(
      position.x + size.width <= panel.position.x ||
      position.x >= panel.position.x + panel.size.width ||
      position.y + size.height <= panel.position.y ||
      position.y >= panel.position.y + panel.size.height
    );

    if (isColliding) {
      collisions.push(panel);
    }
  }

  return collisions;
}

// Z-index calculation for proper panel layering
export function calculateZIndex(panels: PanelLayout[], panelId: string): number {
  const baseLayers = {
    background: 0,
    panel: 100,
    selected: 200,
    dragging: 300,
    resizing: 350,
    floating: 400
  };

  const panel = panels.find(p => p.id === panelId);
  if (!panel) return baseLayers.panel;

  // Get all panels with higher z-index
  const higherPanels = panels.filter(p => p.zIndex > panel.zIndex);
  
  // Return next available z-index
  return baseLayers.panel + panels.length + higherPanels.length;
}

// Constrain position within boundaries
export function getConstrainedPosition(
  position: Position,
  size: Size,
  constraints?: PanelConstraints,
  containerBounds = { width: 1920, height: 1080 }
): Position {
  const bounds = calculateConstraints(size, constraints, containerBounds);
  
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y))
  };
}

// Constrain size within bounds
export function getConstrainedSize(
  size: Size,
  constraints?: PanelConstraints
): Size {
  const minSize = constraints?.minSize ?? { width: 200, height: 150 };
  const maxSize = constraints?.maxSize ?? { width: 1920, height: 1080 };

  let constrainedSize = {
    width: Math.max(minSize.width, Math.min(maxSize.width, size.width)),
    height: Math.max(minSize.height, Math.min(maxSize.height, size.height))
  };

  // Apply aspect ratio constraints if specified
  if (constraints?.aspectRatio?.locked && constraints.aspectRatio.min) {
    const aspectRatio = constraints.aspectRatio.min;
    
    // Adjust height to maintain aspect ratio
    constrainedSize.height = constrainedSize.width / aspectRatio;
    
    // Re-check constraints after aspect ratio adjustment
    if (constrainedSize.height < minSize.height) {
      constrainedSize.height = minSize.height;
      constrainedSize.width = constrainedSize.height * aspectRatio;
    }
    
    if (constrainedSize.height > maxSize.height) {
      constrainedSize.height = maxSize.height;
      constrainedSize.width = constrainedSize.height * aspectRatio;
    }
  }

  return constrainedSize;
}

// Generate unique panel ID
export function generatePanelId(): string {
  return `panel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate magnetic snap zones for panel alignment
export function calculateSnapZones(
  position: Position,
  size: Size,
  panels: PanelLayout[],
  snapDistance = 10
): { position: Position; hasSnapped: boolean } {
  let snappedPosition = { ...position };
  let hasSnapped = false;

  for (const panel of panels) {
    const panelRight = panel.position.x + panel.size.width;
    const panelBottom = panel.position.y + panel.size.height;
    
    // Horizontal alignment
    if (Math.abs(position.x - panel.position.x) <= snapDistance) {
      snappedPosition.x = panel.position.x;
      hasSnapped = true;
    } else if (Math.abs(position.x - panelRight) <= snapDistance) {
      snappedPosition.x = panelRight;
      hasSnapped = true;
    } else if (Math.abs(position.x + size.width - panel.position.x) <= snapDistance) {
      snappedPosition.x = panel.position.x - size.width;
      hasSnapped = true;
    }

    // Vertical alignment
    if (Math.abs(position.y - panel.position.y) <= snapDistance) {
      snappedPosition.y = panel.position.y;
      hasSnapped = true;
    } else if (Math.abs(position.y - panelBottom) <= snapDistance) {
      snappedPosition.y = panelBottom;
      hasSnapped = true;
    } else if (Math.abs(position.y + size.height - panel.position.y) <= snapDistance) {
      snappedPosition.y = panel.position.y - size.height;
      hasSnapped = true;
    }
  }

  return { position: snappedPosition, hasSnapped };
}

// Calculate resize delta for different directions
export function calculateResizeDelta(
  direction: string,
  delta: { x: number; y: number },
  currentPosition: Position,
  currentSize: Size
): { position: Position; size: Size } {
  let newPosition = { ...currentPosition };
  let newSize = { ...currentSize };

  switch (direction) {
    case 'n':
      newPosition.y += delta.y;
      newSize.height -= delta.y;
      break;
    case 's':
      newSize.height += delta.y;
      break;
    case 'e':
      newSize.width += delta.x;
      break;
    case 'w':
      newPosition.x += delta.x;
      newSize.width -= delta.x;
      break;
    case 'ne':
      newPosition.y += delta.y;
      newSize.height -= delta.y;
      newSize.width += delta.x;
      break;
    case 'nw':
      newPosition.x += delta.x;
      newPosition.y += delta.y;
      newSize.width -= delta.x;
      newSize.height -= delta.y;
      break;
    case 'se':
      newSize.width += delta.x;
      newSize.height += delta.y;
      break;
    case 'sw':
      newPosition.x += delta.x;
      newSize.width -= delta.x;
      newSize.height += delta.y;
      break;
    default:
      break;
  }

  return { position: newPosition, size: newSize };
}

// Check if point is within element bounds
export function isPointInBounds(
  point: Position,
  elementPosition: Position,
  elementSize: Size
): boolean {
  return (
    point.x >= elementPosition.x &&
    point.x <= elementPosition.x + elementSize.width &&
    point.y >= elementPosition.y &&
    point.y <= elementPosition.y + elementSize.height
  );
}

// Calculate distance between two points
export function calculateDistance(point1: Position, point2: Position): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Get resize cursor style based on direction
export function getResizeCursor(direction: string): string {
  const cursors: Record<string, string> = {
    n: 'ns-resize',
    s: 'ns-resize',
    e: 'ew-resize',
    w: 'ew-resize',
    ne: 'nesw-resize',
    sw: 'nesw-resize',
    nw: 'nwse-resize',
    se: 'nwse-resize'
  };
  
  return cursors[direction] || 'default';
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for frequent events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}