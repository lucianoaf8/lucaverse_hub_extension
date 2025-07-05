/**
 * Grid System
 * Provides snap-to-grid functionality with configurable grid settings
 */

import type { Position, Size } from '@/types/panel';
import type { GridSettings } from '@/types/layout';

// Grid configuration interface
export interface GridConfig extends GridSettings {
  majorGridMultiplier?: number; // Major grid lines every N grid lines
  magneticRadius?: number;      // Distance within which snapping occurs
  origin?: 'top-left' | 'center'; // Grid origin point
}

// Grid point interface
export interface GridPoint {
  x: number;
  y: number;
  isMajor: boolean;
}

/**
 * Snap position to grid based on grid size and magnetic threshold
 */
export const snapToGrid = (
  position: Position, 
  gridSize: number, 
  magneticThreshold = 10
): Position => {
  if (gridSize <= 0) return position;

  const snappedX = Math.round(position.x / gridSize) * gridSize;
  const snappedY = Math.round(position.y / gridSize) * gridSize;

  // Only snap if within magnetic threshold
  const distanceX = Math.abs(position.x - snappedX);
  const distanceY = Math.abs(position.y - snappedY);

  return {
    x: distanceX <= magneticThreshold ? snappedX : position.x,
    y: distanceY <= magneticThreshold ? snappedY : position.y
  };
};

/**
 * Find the nearest grid point to a given position
 */
export const findNearestGridPoint = (
  position: Position,
  gridSize: number,
  origin: 'top-left' | 'center' = 'top-left'
): Position => {
  if (gridSize <= 0) return position;

  let originX = 0;
  let originY = 0;

  if (origin === 'center') {
    // Calculate center-based grid (would need container dimensions)
    // For now, default to top-left
    originX = 0;
    originY = 0;
  }

  const gridX = Math.round((position.x - originX) / gridSize) * gridSize + originX;
  const gridY = Math.round((position.y - originY) / gridSize) * gridSize + originY;

  return { x: gridX, y: gridY };
};

/**
 * Calculate all grid points within a container
 */
export const calculateGridPoints = (
  containerSize: Size,
  gridConfig: GridConfig
): GridPoint[] => {
  const points: GridPoint[] = [];
  const { size: gridSize, majorGridMultiplier = 5 } = gridConfig;

  if (gridSize <= 0) return points;

  const maxX = containerSize.width;
  const maxY = containerSize.height;

  for (let x = 0; x <= maxX; x += gridSize) {
    for (let y = 0; y <= maxY; y += gridSize) {
      const isMajorX = x % (gridSize * majorGridMultiplier) === 0;
      const isMajorY = y % (gridSize * majorGridMultiplier) === 0;
      
      points.push({
        x,
        y,
        isMajor: isMajorX && isMajorY
      });
    }
  }

  return points;
};

/**
 * Calculate grid lines for visual rendering
 */
export const calculateGridLines = (
  containerSize: Size,
  gridConfig: GridConfig
): {
  major: { horizontal: number[]; vertical: number[] };
  minor: { horizontal: number[]; vertical: number[] };
} => {
  const { size: gridSize, majorGridMultiplier = 5 } = gridConfig;
  
  const result = {
    major: { horizontal: [], vertical: [] },
    minor: { horizontal: [], vertical: [] }
  };

  if (gridSize <= 0) return result;

  // Calculate vertical lines
  for (let x = 0; x <= containerSize.width; x += gridSize) {
    const isMajor = x % (gridSize * majorGridMultiplier) === 0;
    if (isMajor) {
      result.major.vertical.push(x);
    } else {
      result.minor.vertical.push(x);
    }
  }

  // Calculate horizontal lines
  for (let y = 0; y <= containerSize.height; y += gridSize) {
    const isMajor = y % (gridSize * majorGridMultiplier) === 0;
    if (isMajor) {
      result.major.horizontal.push(y);
    } else {
      result.minor.horizontal.push(y);
    }
  }

  return result;
};

/**
 * Snap position with magnetic behavior
 */
export const magneticSnapToGrid = (
  position: Position,
  gridSize: number,
  magneticRadius = 15,
  enabled = true
): {
  position: Position;
  snapped: boolean;
} => {
  if (!enabled || gridSize <= 0) {
    return { position, snapped: false };
  }

  const nearestGridPoint = findNearestGridPoint(position, gridSize);
  const distance = Math.sqrt(
    Math.pow(position.x - nearestGridPoint.x, 2) + 
    Math.pow(position.y - nearestGridPoint.y, 2)
  );

  const snapped = distance <= magneticRadius;

  return {
    position: snapped ? nearestGridPoint : position,
    snapped
  };
};

/**
 * Align multiple panels to grid
 */
export const alignToGrid = (
  panels: Array<{ id: string; position: Position; size: Size }>,
  gridSize: number
): Array<{ id: string; position: Position }> => {
  return panels.map(panel => ({
    id: panel.id,
    position: snapToGrid(panel.position, gridSize, 0) // Force snap with 0 threshold
  }));
};

/**
 * Calculate optimal grid size based on container and typical panel sizes
 */
export const calculateOptimalGridSize = (
  containerSize: Size,
  averagePanelSize: Size,
  targetGridDensity = 20 // Desired number of grid cells across width
): number => {
  const baseGridSize = containerSize.width / targetGridDensity;
  
  // Round to nearest multiple of 5 for cleaner grid
  const roundedGridSize = Math.round(baseGridSize / 5) * 5;
  
  // Ensure minimum grid size for usability
  return Math.max(roundedGridSize, 10);
};

/**
 * Check if position is on grid
 */
export const isOnGrid = (
  position: Position,
  gridSize: number,
  tolerance = 1
): boolean => {
  if (gridSize <= 0) return true;

  const remainderX = position.x % gridSize;
  const remainderY = position.y % gridSize;

  return (remainderX <= tolerance || remainderX >= gridSize - tolerance) &&
         (remainderY <= tolerance || remainderY >= gridSize - tolerance);
};

/**
 * Get grid cell coordinates for a position
 */
export const getGridCell = (
  position: Position,
  gridSize: number
): { cellX: number; cellY: number } => {
  return {
    cellX: Math.floor(position.x / gridSize),
    cellY: Math.floor(position.y / gridSize)
  };
};

/**
 * Get position from grid cell coordinates
 */
export const getPositionFromCell = (
  cellX: number,
  cellY: number,
  gridSize: number
): Position => {
  return {
    x: cellX * gridSize,
    y: cellY * gridSize
  };
};

/**
 * Snap rectangle (position + size) to grid
 */
export const snapRectangleToGrid = (
  position: Position,
  size: Size,
  gridSize: number,
  magneticThreshold = 10,
  snapSize = false
): {
  position: Position;
  size: Size;
  snapped: boolean;
} => {
  const snappedPosition = snapToGrid(position, gridSize, magneticThreshold);
  
  let snappedSize = size;
  let sizeSnapped = false;

  if (snapSize) {
    const nearestWidthGrid = Math.round(size.width / gridSize) * gridSize;
    const nearestHeightGrid = Math.round(size.height / gridSize) * gridSize;
    
    const widthDistance = Math.abs(size.width - nearestWidthGrid);
    const heightDistance = Math.abs(size.height - nearestHeightGrid);
    
    if (widthDistance <= magneticThreshold || heightDistance <= magneticThreshold) {
      snappedSize = {
        width: widthDistance <= magneticThreshold ? nearestWidthGrid : size.width,
        height: heightDistance <= magneticThreshold ? nearestHeightGrid : size.height
      };
      sizeSnapped = true;
    }
  }

  const positionSnapped = 
    Math.abs(position.x - snappedPosition.x) <= magneticThreshold ||
    Math.abs(position.y - snappedPosition.y) <= magneticThreshold;

  return {
    position: snappedPosition,
    size: snappedSize,
    snapped: positionSnapped || sizeSnapped
  };
};

/**
 * Create grid subdivision system for precise positioning
 */
export const createGridSubdivision = (
  baseGridSize: number,
  subdivisions = 4
): {
  majorGrid: number;
  minorGrid: number;
  subdivisions: number;
} => {
  return {
    majorGrid: baseGridSize,
    minorGrid: baseGridSize / subdivisions,
    subdivisions
  };
};

/**
 * Generate grid coordinate system with different origins
 */
export const generateGridCoordinates = (
  containerSize: Size,
  gridSize: number,
  origin: 'top-left' | 'center' | 'bottom-right' = 'top-left'
): Position[] => {
  const coordinates: Position[] = [];
  
  let startX = 0;
  let startY = 0;
  
  switch (origin) {
    case 'center':
      startX = -Math.floor(containerSize.width / (2 * gridSize)) * gridSize;
      startY = -Math.floor(containerSize.height / (2 * gridSize)) * gridSize;
      break;
    case 'bottom-right':
      startX = containerSize.width % gridSize;
      startY = containerSize.height % gridSize;
      break;
    case 'top-left':
    default:
      startX = 0;
      startY = 0;
      break;
  }
  
  for (let x = startX; x <= containerSize.width; x += gridSize) {
    for (let y = startY; y <= containerSize.height; y += gridSize) {
      if (x >= 0 && y >= 0) {
        coordinates.push({ x, y });
      }
    }
  }
  
  return coordinates;
};