/**
 * Layout Utilities
 * Comprehensive utilities for layout optimization, export/import, and performance monitoring
 */

import type { PanelLayout, Position, Size } from '@/types/panel';
import type { WorkspaceConfig } from '@/types/layout';
import { findOptimalPosition } from './panelBounds';
import { snapToGrid } from './gridSystem';

// Layout metrics interface
export interface LayoutMetrics {
  totalPanels: number;
  totalArea: number;
  usedArea: number;
  freeArea: number;
  utilization: number; // percentage
  averagePanelSize: Size;
  panelDensity: number;
  overlappingPanels: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  centerOfMass: Position;
  gaps: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    area: number;
  }>;
}

// Layout optimization options
export interface OptimizationOptions {
  containerSize: Size;
  gridSize?: number;
  padding?: number;
  preserveRelativePositions?: boolean;
  minimizeOverlaps?: boolean;
  compactLayout?: boolean;
  alignToGrid?: boolean;
  sortBy?: 'size' | 'creation' | 'usage' | 'type';
}

// Performance monitoring result
export interface PerformanceMetrics {
  operationTime: number;
  memoryUsage?: number;
  panelCount: number;
  renderTime?: number;
  optimizationSuggestions: string[];
}

/**
 * Calculate comprehensive layout metrics
 */
export const calculateLayoutMetrics = (
  panels: PanelLayout[],
  containerSize: Size
): LayoutMetrics => {
  if (panels.length === 0) {
    return {
      totalPanels: 0,
      totalArea: containerSize.width * containerSize.height,
      usedArea: 0,
      freeArea: containerSize.width * containerSize.height,
      utilization: 0,
      averagePanelSize: { width: 0, height: 0 },
      panelDensity: 0,
      overlappingPanels: 0,
      boundingBox: { x: 0, y: 0, width: 0, height: 0 },
      centerOfMass: { x: 0, y: 0 },
      gaps: [],
    };
  }

  // Calculate basic metrics
  const totalArea = containerSize.width * containerSize.height;
  const usedArea = panels.reduce((sum, panel) => sum + panel.size.width * panel.size.height, 0);
  const averagePanelSize = {
    width: panels.reduce((sum, panel) => sum + panel.size.width, 0) / panels.length,
    height: panels.reduce((sum, panel) => sum + panel.size.height, 0) / panels.length,
  };

  // Calculate bounding box
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const panel of panels) {
    minX = Math.min(minX, panel.position.x);
    minY = Math.min(minY, panel.position.y);
    maxX = Math.max(maxX, panel.position.x + panel.size.width);
    maxY = Math.max(maxY, panel.position.y + panel.size.height);
  }

  const boundingBox = {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };

  // Calculate center of mass
  const centerOfMass = {
    x:
      panels.reduce((sum, panel) => sum + panel.position.x + panel.size.width / 2, 0) /
      panels.length,
    y:
      panels.reduce((sum, panel) => sum + panel.position.y + panel.size.height / 2, 0) /
      panels.length,
  };

  // Count overlapping panels
  let overlappingPanels = 0;
  for (let i = 0; i < panels.length; i++) {
    for (let j = i + 1; j < panels.length; j++) {
      if (panelsOverlap(panels[i], panels[j])) {
        overlappingPanels++;
      }
    }
  }

  // Calculate gaps (simplified version - just find major empty rectangles)
  const gaps = findLargeGaps(panels, containerSize);

  return {
    totalPanels: panels.length,
    totalArea,
    usedArea,
    freeArea: totalArea - usedArea,
    utilization: (usedArea / totalArea) * 100,
    averagePanelSize,
    panelDensity: panels.length / (totalArea / 10000), // panels per 100x100 area
    overlappingPanels,
    boundingBox,
    centerOfMass,
    gaps,
  };
};

/**
 * Check if two panels overlap
 */
const panelsOverlap = (panel1: PanelLayout, panel2: PanelLayout): boolean => {
  return !(
    panel1.position.x + panel1.size.width <= panel2.position.x ||
    panel1.position.x >= panel2.position.x + panel2.size.width ||
    panel1.position.y + panel1.size.height <= panel2.position.y ||
    panel1.position.y >= panel2.position.y + panel2.size.height
  );
};

/**
 * Find large gaps in the layout
 */
const findLargeGaps = (panels: PanelLayout[], containerSize: Size): LayoutMetrics['gaps'] => {
  const gaps: LayoutMetrics['gaps'] = [];
  const gridSize = 50; // Use 50px grid for gap detection

  // Create occupation grid
  const gridWidth = Math.ceil(containerSize.width / gridSize);
  const gridHeight = Math.ceil(containerSize.height / gridSize);
  const occupied = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(false));

  // Mark occupied cells
  for (const panel of panels) {
    const startX = Math.floor(panel.position.x / gridSize);
    const startY = Math.floor(panel.position.y / gridSize);
    const endX = Math.min(
      gridWidth - 1,
      Math.floor((panel.position.x + panel.size.width) / gridSize)
    );
    const endY = Math.min(
      gridHeight - 1,
      Math.floor((panel.position.y + panel.size.height) / gridSize)
    );

    for (let y = Math.max(0, startY); y <= endY; y++) {
      for (let x = Math.max(0, startX); x <= endX; x++) {
        occupied[y][x] = true;
      }
    }
  }

  // Find rectangular gaps
  const visited = Array(gridHeight)
    .fill(null)
    .map(() => Array(gridWidth).fill(false));

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (!occupied[y][x] && !visited[y][x]) {
        const gap = findLargestGapRectangle(
          occupied,
          visited,
          x,
          y,
          gridWidth,
          gridHeight,
          gridSize
        );
        if (gap.area > gridSize * gridSize * 4) {
          // Only consider gaps larger than 4 grid cells
          gaps.push(gap);
        }
      }
    }
  }

  return gaps.sort((a, b) => b.area - a.area); // Sort by area, largest first
};

/**
 * Find largest gap rectangle using flood fill
 */
const findLargestGapRectangle = (
  occupied: boolean[][],
  visited: boolean[][],
  startX: number,
  startY: number,
  gridWidth: number,
  gridHeight: number,
  gridSize: number
): { x: number; y: number; width: number; height: number; area: number } => {
  let maxWidth = 0;
  let maxHeight = 0;
  let bestRect = { x: startX, y: startY, width: 0, height: 0 };

  // Try different rectangle sizes
  for (let height = 1; startY + height <= gridHeight; height++) {
    let width = 0;

    for (let x = startX; x < gridWidth; x++) {
      let canExtend = true;

      for (let y = startY; y < startY + height; y++) {
        if (occupied[y][x] || visited[y][x]) {
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

    if (width * height > bestRect.width * bestRect.height) {
      bestRect = { x: startX, y: startY, width, height };
    }

    if (width === 0) break;
  }

  // Mark as visited
  for (let y = bestRect.y; y < bestRect.y + bestRect.height; y++) {
    for (let x = bestRect.x; x < bestRect.x + bestRect.width; x++) {
      visited[y][x] = true;
    }
  }

  return {
    x: bestRect.x * gridSize,
    y: bestRect.y * gridSize,
    width: bestRect.width * gridSize,
    height: bestRect.height * gridSize,
    area: bestRect.width * bestRect.height * gridSize * gridSize,
  };
};

/**
 * Optimize layout automatically
 */
export const optimizeLayout = (
  panels: PanelLayout[],
  options: OptimizationOptions
): PanelLayout[] => {
  const {
    containerSize,
    gridSize = 20,
    padding = 20,
    preserveRelativePositions = false,
    minimizeOverlaps = true,
    compactLayout = true,
    alignToGrid = true,
    sortBy = 'size',
  } = options;

  let optimizedPanels = [...panels];

  // Sort panels based on criteria
  if (sortBy === 'size') {
    optimizedPanels.sort((a, b) => b.size.width * b.size.height - a.size.width * a.size.height);
  } else if (sortBy === 'creation') {
    optimizedPanels.sort((a, b) =>
      (a.metadata?.title || a.id).localeCompare(b.metadata?.title || b.id)
    );
  }

  if (!preserveRelativePositions) {
    // Reposition panels optimally
    const repositioned: PanelLayout[] = [];

    for (const panel of optimizedPanels) {
      const optimalPosition = findOptimalPosition(
        panel.size,
        repositioned,
        containerSize,
        { top: padding, right: padding, bottom: padding, left: padding },
        { avoidOverlap: minimizeOverlaps, preferLargestSpace: true }
      );

      const finalPosition = alignToGrid ? snapToGrid(optimalPosition, gridSize) : optimalPosition;

      repositioned.push({
        ...panel,
        position: finalPosition,
      });
    }

    optimizedPanels = repositioned;
  }

  // Compact layout if requested
  if (compactLayout && !preserveRelativePositions) {
    optimizedPanels = compactPanelLayout(optimizedPanels, containerSize, padding);
  }

  return optimizedPanels;
};

/**
 * Compact layout by reducing gaps
 */
const compactPanelLayout = (
  panels: PanelLayout[],
  containerSize: Size,
  padding: number
): PanelLayout[] => {
  const compacted = [...panels];
  const step = 10;

  // Try to move each panel towards top-left while avoiding collisions
  for (let i = 0; i < compacted.length; i++) {
    const panel = compacted[i];
    let bestPosition = panel.position;
    let bestDistance = calculateDistanceFromOrigin(panel.position);

    // Try positions closer to origin
    for (let x = padding; x <= panel.position.x; x += step) {
      for (let y = padding; y <= panel.position.y; y += step) {
        const testPosition = { x, y };
        const distance = calculateDistanceFromOrigin(testPosition);

        if (distance < bestDistance) {
          // Check if this position causes overlaps
          const hasOverlap = compacted.some((otherPanel, otherIndex) => {
            if (otherIndex === i) return false;
            return panelsOverlap({ ...panel, position: testPosition }, otherPanel);
          });

          if (
            !hasOverlap &&
            testPosition.x + panel.size.width <= containerSize.width &&
            testPosition.y + panel.size.height <= containerSize.height
          ) {
            bestPosition = testPosition;
            bestDistance = distance;
          }
        }
      }
    }

    compacted[i] = { ...panel, position: bestPosition };
  }

  return compacted;
};

/**
 * Calculate distance from origin (0,0)
 */
const calculateDistanceFromOrigin = (position: Position): number => {
  return Math.sqrt(position.x * position.x + position.y * position.y);
};

/**
 * Export layout to JSON
 */
export const exportLayout = (
  panels: PanelLayout[],
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
  }
): string => {
  const exportData = {
    version: '1.0.0',
    timestamp: Date.now(),
    metadata: {
      name: metadata?.name || `Layout Export ${new Date().toLocaleString()}`,
      description: metadata?.description || 'Exported layout configuration',
      tags: metadata?.tags || [],
      panelCount: panels.length,
    },
    panels: panels.map(panel => ({
      id: panel.id,
      component: panel.component,
      position: panel.position,
      size: panel.size,
      zIndex: panel.zIndex,
      visible: panel.visible,
      constraints: panel.constraints,
      metadata: panel.metadata,
    })),
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Import layout from JSON
 */
export const importLayout = (
  jsonData: string
): {
  success: boolean;
  panels?: PanelLayout[];
  error?: string;
  metadata?: any;
} => {
  try {
    const data = JSON.parse(jsonData);

    // Validate format
    if (!data.panels || !Array.isArray(data.panels)) {
      return { success: false, error: 'Invalid layout format: missing panels array' };
    }

    // Validate each panel
    const validatedPanels: PanelLayout[] = [];

    for (const panelData of data.panels) {
      if (!panelData.component || !panelData.position || !panelData.size) {
        continue; // Skip invalid panels
      }

      validatedPanels.push({
        id: panelData.id || `imported_${Date.now()}_${Math.random()}`,
        component: panelData.component,
        position: panelData.position,
        size: panelData.size,
        zIndex: panelData.zIndex || 100,
        visible: panelData.visible !== false,
        constraints: panelData.constraints || {
          minSize: { width: 200, height: 150 },
        },
        metadata: panelData.metadata,
      });
    }

    return {
      success: true,
      panels: validatedPanels,
      metadata: data.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse layout: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Generate layout preview/thumbnail
 */
export const generateLayoutPreview = (
  panels: PanelLayout[],
  previewSize: Size = { width: 200, height: 150 }
): {
  svg: string;
  boundingBox: { x: number; y: number; width: number; height: number };
} => {
  if (panels.length === 0) {
    return {
      svg: `<svg width="${previewSize.width}" height="${previewSize.height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/></svg>`,
      boundingBox: { x: 0, y: 0, width: previewSize.width, height: previewSize.height },
    };
  }

  // Calculate actual layout bounds
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const panel of panels) {
    minX = Math.min(minX, panel.position.x);
    minY = Math.min(minY, panel.position.y);
    maxX = Math.max(maxX, panel.position.x + panel.size.width);
    maxY = Math.max(maxY, panel.position.y + panel.size.height);
  }

  const layoutWidth = maxX - minX;
  const layoutHeight = maxY - minY;
  const boundingBox = { x: minX, y: minY, width: layoutWidth, height: layoutHeight };

  // Calculate scale to fit preview
  const scaleX = previewSize.width / layoutWidth;
  const scaleY = previewSize.height / layoutHeight;
  const scale = Math.min(scaleX, scaleY) * 0.9; // Leave some padding

  // Generate SVG
  const svgElements: string[] = [];

  // Background
  svgElements.push(
    `<rect width="${previewSize.width}" height="${previewSize.height}" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1"/>`
  );

  // Panel rectangles
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  panels.forEach((panel, index) => {
    const x = (panel.position.x - minX) * scale + (previewSize.width - layoutWidth * scale) / 2;
    const y = (panel.position.y - minY) * scale + (previewSize.height - layoutHeight * scale) / 2;
    const width = panel.size.width * scale;
    const height = panel.size.height * scale;
    const color = colors[index % colors.length];

    svgElements.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${color}" fill-opacity="0.7" stroke="${color}" stroke-width="1" rx="2"/>`
    );
  });

  const svg = `<svg width="${previewSize.width}" height="${previewSize.height}" xmlns="http://www.w3.org/2000/svg">${svgElements.join('')}</svg>`;

  return { svg, boundingBox };
};

/**
 * Validate layout integrity
 */
export const validateLayout = (
  panels: PanelLayout[],
  containerSize: Size
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for duplicate IDs
  const ids = new Set();
  for (const panel of panels) {
    if (ids.has(panel.id)) {
      errors.push(`Duplicate panel ID: ${panel.id}`);
    }
    ids.add(panel.id);
  }

  // Check bounds
  for (const panel of panels) {
    if (panel.position.x < 0 || panel.position.y < 0) {
      errors.push(`Panel ${panel.id} has negative position`);
    }

    if (
      panel.position.x + panel.size.width > containerSize.width ||
      panel.position.y + panel.size.height > containerSize.height
    ) {
      warnings.push(`Panel ${panel.id} extends beyond container bounds`);
    }

    if (panel.size.width < 100 || panel.size.height < 100) {
      warnings.push(`Panel ${panel.id} is very small and may be unusable`);
    }
  }

  // Check for overlaps
  for (let i = 0; i < panels.length; i++) {
    for (let j = i + 1; j < panels.length; j++) {
      if (panelsOverlap(panels[i], panels[j])) {
        warnings.push(`Panels ${panels[i].id} and ${panels[j].id} overlap`);
      }
    }
  }

  // Performance suggestions
  if (panels.length > 20) {
    suggestions.push('Consider reducing the number of panels for better performance');
  }

  const metrics = calculateLayoutMetrics(panels, containerSize);
  if (metrics.utilization > 80) {
    suggestions.push(
      'Layout is very dense - consider increasing container size or reducing panel sizes'
    );
  }

  if (metrics.overlappingPanels > 0) {
    suggestions.push('Run layout optimization to resolve overlapping panels');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
};

/**
 * Performance monitoring for layout operations
 */
export const performanceMonitor = () => {
  const startTime = performance.now();
  let operationName = 'unknown';

  return {
    start: (name: string) => {
      operationName = name;
    },

    end: (panelCount: number = 0): PerformanceMetrics => {
      const endTime = performance.now();
      const operationTime = endTime - startTime;

      const suggestions: string[] = [];

      if (operationTime > 100) {
        suggestions.push('Operation took longer than 100ms - consider optimization');
      }

      if (panelCount > 50) {
        suggestions.push('Large number of panels may impact performance');
      }

      return {
        operationTime,
        panelCount,
        optimizationSuggestions: suggestions,
      };
    },
  };
};
