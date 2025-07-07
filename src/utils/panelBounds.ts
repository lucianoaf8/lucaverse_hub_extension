/**
 * Panel Bounds Calculation
 * Utilities for calculating viewport bounds, panel boundaries, and optimal positioning
 */

import type { Position, Size, PanelLayout, PanelConstraints } from '@/types/panel';

// Bounds interface for viewport constraints
export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Available space calculation result
export interface AvailableSpace {
  regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    area: number;
  }>;
  totalArea: number;
  largestRegion: {
    x: number;
    y: number;
    width: number;
    height: number;
    area: number;
  } | null;
}

/**
 * Calculate viewport bounds for drag constraints
 */
export const calculateViewportBounds = (
  containerSize: Size,
  padding = { top: 0, right: 0, bottom: 0, left: 0 }
): ViewportBounds => {
  return {
    x: padding.left,
    y: padding.top,
    width: containerSize.width - padding.left - padding.right,
    height: containerSize.height - padding.top - padding.bottom,
    padding,
  };
};

/**
 * Get panel boundaries including position and size
 */
export const getPanelBounds = (panel: PanelLayout): ViewportBounds => {
  return {
    x: panel.position.x,
    y: panel.position.y,
    width: panel.size.width,
    height: panel.size.height,
  };
};

/**
 * Constrain position within viewport bounds
 */
export const constrainPosition = (
  position: Position,
  size: Size,
  bounds: ViewportBounds
): Position => {
  const minX = bounds.x;
  const minY = bounds.y;
  const maxX = bounds.x + bounds.width - size.width;
  const maxY = bounds.y + bounds.height - size.height;

  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
};

/**
 * Constrain size within min/max limits and viewport bounds
 */
export const constrainSize = (
  size: Size,
  minSize: Size,
  maxSize: Size | undefined,
  bounds: ViewportBounds,
  position?: Position
): Size => {
  let constrainedWidth = Math.max(minSize.width, size.width);
  let constrainedHeight = Math.max(minSize.height, size.height);

  // Apply maximum size constraints
  if (maxSize) {
    constrainedWidth = Math.min(maxSize.width, constrainedWidth);
    constrainedHeight = Math.min(maxSize.height, constrainedHeight);
  }

  // Constrain to viewport bounds if position is provided
  if (position) {
    const maxWidthInViewport = bounds.x + bounds.width - position.x;
    const maxHeightInViewport = bounds.y + bounds.height - position.y;

    constrainedWidth = Math.min(constrainedWidth, maxWidthInViewport);
    constrainedHeight = Math.min(constrainedHeight, maxHeightInViewport);
  }

  return {
    width: Math.max(minSize.width, constrainedWidth),
    height: Math.max(minSize.height, constrainedHeight),
  };
};

/**
 * Calculate available space in viewport after accounting for existing panels
 */
export const calculateAvailableSpace = (
  panels: PanelLayout[],
  containerSize: Size,
  padding = { top: 0, right: 0, bottom: 0, left: 0 }
): AvailableSpace => {
  const bounds = calculateViewportBounds(containerSize, padding);

  // Create a grid to track occupied space
  const cellSize = 20; // Use smaller cells for better accuracy
  const gridWidth = Math.ceil(bounds.width / cellSize);
  const gridHeight = Math.ceil(bounds.height / cellSize);
  const occupiedGrid: boolean[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(false));

  // Mark occupied cells
  for (const panel of panels) {
    const startX = Math.floor((panel.position.x - bounds.x) / cellSize);
    const startY = Math.floor((panel.position.y - bounds.y) / cellSize);
    const endX = Math.min(
      gridWidth - 1,
      Math.floor((panel.position.x + panel.size.width - bounds.x) / cellSize)
    );
    const endY = Math.min(
      gridHeight - 1,
      Math.floor((panel.position.y + panel.size.height - bounds.y) / cellSize)
    );

    for (let y = Math.max(0, startY); y <= endY; y++) {
      for (let x = Math.max(0, startX); x <= endX; x++) {
        occupiedGrid[y][x] = true;
      }
    }
  }

  // Find rectangular regions of available space
  const regions: AvailableSpace['regions'] = [];
  const visited: boolean[][] = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(false));

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (!occupiedGrid[y][x] && !visited[y][x]) {
        // Find the largest rectangle starting from this point
        const region = findLargestRectangle(occupiedGrid, visited, x, y, gridWidth, gridHeight);
        if (region.width > 0 && region.height > 0) {
          regions.push({
            x: bounds.x + region.x * cellSize,
            y: bounds.y + region.y * cellSize,
            width: region.width * cellSize,
            height: region.height * cellSize,
            area: region.width * region.height * cellSize * cellSize,
          });
        }
      }
    }
  }

  // Calculate total available area
  const totalArea = regions.reduce((sum, region) => sum + region.area, 0);

  // Find largest region
  const largestRegion =
    regions.length > 0
      ? regions.reduce((largest, current) => (current.area > largest.area ? current : largest))
      : null;

  return {
    regions,
    totalArea,
    largestRegion,
  };
};

/**
 * Find largest rectangle of available space using dynamic programming
 */
const findLargestRectangle = (
  occupiedGrid: boolean[][],
  visited: boolean[][],
  startX: number,
  startY: number,
  gridWidth: number,
  gridHeight: number
): { x: number; y: number; width: number; height: number } => {
  let maxArea = 0;
  let bestRect = { x: startX, y: startY, width: 0, height: 0 };

  // Try different rectangle sizes starting from this point
  for (let height = 1; startY + height <= gridHeight; height++) {
    let width = 0;

    // Find maximum width for this height
    for (let x = startX; x < gridWidth; x++) {
      let canExtend = true;

      // Check if we can extend to this width for the current height
      for (let y = startY; y < startY + height; y++) {
        if (occupiedGrid[y][x] || visited[y][x]) {
          canExtend = false;
          break;
        }
      }

      if (canExtend) {
        width++;
      } else {
        break;
      }
    }

    const area = width * height;
    if (area > maxArea) {
      maxArea = area;
      bestRect = { x: startX, y: startY, width, height };
    }

    // If we can't extend width at all, no point trying larger heights
    if (width === 0) break;
  }

  // Mark the found rectangle as visited
  for (let y = bestRect.y; y < bestRect.y + bestRect.height; y++) {
    for (let x = bestRect.x; x < bestRect.x + bestRect.width; x++) {
      visited[y][x] = true;
    }
  }

  return bestRect;
};

/**
 * Find optimal position for a new panel
 */
export const findOptimalPosition = (
  size: Size,
  existingPanels: PanelLayout[],
  containerSize: Size,
  padding = { top: 10, right: 10, bottom: 10, left: 10 },
  preferences: {
    alignment?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    avoidOverlap?: boolean;
    preferLargestSpace?: boolean;
  } = {}
): Position => {
  const { alignment = 'top-left', avoidOverlap = true, preferLargestSpace = true } = preferences;

  const bounds = calculateViewportBounds(containerSize, padding);

  // If we don't need to avoid overlap, use simple alignment
  if (!avoidOverlap) {
    return getAlignedPosition(size, bounds, alignment);
  }

  // Calculate available space
  const availableSpace = calculateAvailableSpace(existingPanels, containerSize, padding);

  if (preferLargestSpace && availableSpace.largestRegion) {
    const region = availableSpace.largestRegion;

    // Check if the panel fits in the largest region
    if (region.width >= size.width && region.height >= size.height) {
      return getAlignedPositionInRegion(size, region, alignment);
    }
  }

  // Try to find a suitable region from available regions
  const suitableRegions = availableSpace.regions.filter(
    region => region.width >= size.width && region.height >= size.height
  );

  if (suitableRegions.length > 0) {
    // Sort by area (largest first) or by alignment preference
    suitableRegions.sort((a, b) => b.area - a.area);
    const selectedRegion = suitableRegions[0];
    return getAlignedPositionInRegion(size, selectedRegion, alignment);
  }

  // If no suitable space found, use cascade positioning
  return getCascadePosition(size, existingPanels, bounds);
};

/**
 * Get aligned position within viewport bounds
 */
const getAlignedPosition = (
  size: Size,
  bounds: ViewportBounds,
  alignment: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
): Position => {
  switch (alignment) {
    case 'top-left':
      return { x: bounds.x, y: bounds.y };
    case 'top-right':
      return { x: bounds.x + bounds.width - size.width, y: bounds.y };
    case 'bottom-left':
      return { x: bounds.x, y: bounds.y + bounds.height - size.height };
    case 'bottom-right':
      return {
        x: bounds.x + bounds.width - size.width,
        y: bounds.y + bounds.height - size.height,
      };
    case 'center':
      return {
        x: bounds.x + (bounds.width - size.width) / 2,
        y: bounds.y + (bounds.height - size.height) / 2,
      };
    default:
      return { x: bounds.x, y: bounds.y };
  }
};

/**
 * Get aligned position within a specific region
 */
const getAlignedPositionInRegion = (
  size: Size,
  region: { x: number; y: number; width: number; height: number },
  alignment: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
): Position => {
  const regionBounds: ViewportBounds = {
    x: region.x,
    y: region.y,
    width: region.width,
    height: region.height,
  };

  return getAlignedPosition(size, regionBounds, alignment);
};

/**
 * Get cascade position (offset from existing panels)
 */
const getCascadePosition = (
  size: Size,
  existingPanels: PanelLayout[],
  bounds: ViewportBounds,
  cascadeOffset = 30
): Position => {
  const basePosition = { x: bounds.x + 20, y: bounds.y + 20 };

  if (existingPanels.length === 0) {
    return basePosition;
  }

  // Find a position that doesn't overlap with existing panels
  for (let i = 0; i < existingPanels.length + 10; i++) {
    const testPosition = {
      x: basePosition.x + i * cascadeOffset,
      y: basePosition.y + i * cascadeOffset,
    };

    // Check if position is within bounds
    if (
      testPosition.x + size.width <= bounds.x + bounds.width &&
      testPosition.y + size.height <= bounds.y + bounds.height
    ) {
      // Check for overlaps
      const hasOverlap = existingPanels.some(panel => {
        return !(
          testPosition.x + size.width <= panel.position.x ||
          testPosition.x >= panel.position.x + panel.size.width ||
          testPosition.y + size.height <= panel.position.y ||
          testPosition.y >= panel.position.y + panel.size.height
        );
      });

      if (!hasOverlap) {
        return testPosition;
      }
    }
  }

  // If no non-overlapping position found, return constrained position
  return constrainPosition(basePosition, size, bounds);
};

/**
 * Calculate minimum bounds required to contain all panels
 */
export const calculateMinimumBounds = (panels: PanelLayout[]): ViewportBounds => {
  if (panels.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const panel of panels) {
    minX = Math.min(minX, panel.position.x);
    minY = Math.min(minY, panel.position.y);
    maxX = Math.max(maxX, panel.position.x + panel.size.width);
    maxY = Math.max(maxY, panel.position.y + panel.size.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/**
 * Validate panel constraints against bounds
 */
export const validatePanelConstraints = (
  panel: PanelLayout,
  bounds: ViewportBounds
): {
  valid: boolean;
  violations: string[];
  adjustedPanel?: PanelLayout;
} => {
  const violations: string[] = [];
  let adjustedPanel: PanelLayout | undefined;

  // Check position bounds
  if (panel.position.x < bounds.x || panel.position.y < bounds.y) {
    violations.push('Panel position is outside viewport bounds');
  }

  if (
    panel.position.x + panel.size.width > bounds.x + bounds.width ||
    panel.position.y + panel.size.height > bounds.y + bounds.height
  ) {
    violations.push('Panel extends beyond viewport bounds');
  }

  // Check size constraints
  if (panel.constraints) {
    const { minSize, maxSize } = panel.constraints;

    if (panel.size.width < minSize.width || panel.size.height < minSize.height) {
      violations.push('Panel size is below minimum constraints');
    }

    if (maxSize && (panel.size.width > maxSize.width || panel.size.height > maxSize.height)) {
      violations.push('Panel size exceeds maximum constraints');
    }
  }

  // Create adjusted panel if there are violations
  if (violations.length > 0) {
    adjustedPanel = { ...panel };

    // Adjust position
    adjustedPanel.position = constrainPosition(panel.position, panel.size, bounds);

    // Adjust size if needed
    if (panel.constraints) {
      adjustedPanel.size = constrainSize(
        panel.size,
        panel.constraints.minSize,
        panel.constraints.maxSize,
        bounds,
        adjustedPanel.position
      );
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    adjustedPanel,
  };
};
