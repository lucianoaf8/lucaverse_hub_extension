import { Position, Size, PanelLayout } from '../types/panel';

// Comprehensive resize constraints interface
export interface ResizeConstraints {
  minSize: Size;
  maxSize?: Size;
  aspectRatio?: {
    ratio: number;
    tolerance: number;
    enforceOnResize: boolean;
  };
  contentConstraints?: {
    minContentSize: Size;
    padding: { top: number; right: number; bottom: number; left: number };
  };
  viewportConstraints?: {
    respectBoundaries: boolean;
    margin: number;
  };
  snapConstraints?: {
    enabled: boolean;
    snapDistance: number;
    commonSizes: Size[];
    gridSize?: number;
  };
  collisionConstraints?: {
    preventOverlap: boolean;
    minimumGap: number;
    allowStackingOnAxis?: 'x' | 'y' | 'both' | 'none';
  };
}

// Resize validation result
export interface ResizeValidationResult {
  isValid: boolean;
  constrainedSize: Size;
  violations: string[];
  warnings: string[];
  adjustments: {
    width: number;
    height: number;
    reason: string;
  }[];
}

// Common size presets
export const COMMON_PANEL_SIZES: Size[] = [
  { width: 320, height: 240 },   // Small
  { width: 480, height: 360 },   // Medium
  { width: 640, height: 480 },   // Large
  { width: 800, height: 600 },   // Extra Large
  { width: 1024, height: 768 },  // Desktop
  { width: 1280, height: 720 },  // HD
  { width: 1920, height: 1080 }, // Full HD
];

// Default resize constraints
export const DEFAULT_RESIZE_CONSTRAINTS: ResizeConstraints = {
  minSize: { width: 100, height: 100 },
  maxSize: { width: 1920, height: 1080 },
  aspectRatio: {
    ratio: 16 / 9,
    tolerance: 0.1,
    enforceOnResize: false,
  },
  contentConstraints: {
    minContentSize: { width: 50, height: 50 },
    padding: { top: 8, right: 8, bottom: 8, left: 8 },
  },
  viewportConstraints: {
    respectBoundaries: true,
    margin: 10,
  },
  snapConstraints: {
    enabled: true,
    snapDistance: 15,
    commonSizes: COMMON_PANEL_SIZES,
    gridSize: 20,
  },
  collisionConstraints: {
    preventOverlap: true,
    minimumGap: 8,
    allowStackingOnAxis: 'none',
  },
};

/**
 * Calculate comprehensive resize constraints for a panel
 */
export const calculateResizeConstraints = (
  panel: PanelLayout,
  viewport: { width: number; height: number },
  adjacentPanels: PanelLayout[] = [],
  customConstraints?: Partial<ResizeConstraints>
): ResizeConstraints => {
  const constraints = { ...DEFAULT_RESIZE_CONSTRAINTS, ...customConstraints };
  
  // Adjust max size based on viewport
  if (constraints.viewportConstraints?.respectBoundaries) {
    const margin = constraints.viewportConstraints.margin || 0;
    const maxWidth = viewport.width - panel.position.x - margin;
    const maxHeight = viewport.height - panel.position.y - margin;
    
    if (constraints.maxSize) {
      constraints.maxSize.width = Math.min(constraints.maxSize.width, maxWidth);
      constraints.maxSize.height = Math.min(constraints.maxSize.height, maxHeight);
    } else {
      constraints.maxSize = { width: maxWidth, height: maxHeight };
    }
  }
  
  // Adjust for content requirements
  if (constraints.contentConstraints) {
    const padding = constraints.contentConstraints.padding;
    const minContentSize = constraints.contentConstraints.minContentSize;
    
    const minWidthWithPadding = minContentSize.width + padding.left + padding.right;
    const minHeightWithPadding = minContentSize.height + padding.top + padding.bottom;
    
    constraints.minSize.width = Math.max(constraints.minSize.width, minWidthWithPadding);
    constraints.minSize.height = Math.max(constraints.minSize.height, minHeightWithPadding);
  }
  
  // Adjust for collision constraints with adjacent panels
  if (constraints.collisionConstraints?.preventOverlap && adjacentPanels.length > 0) {
    const gap = constraints.collisionConstraints.minimumGap;
    
    // Find the closest panels in each direction to set maximum bounds
    const rightMostX = Math.min(
      ...adjacentPanels
        .filter(p => p.position.x > panel.position.x)
        .map(p => p.position.x - gap)
    );
    
    const bottomMostY = Math.min(
      ...adjacentPanels
        .filter(p => p.position.y > panel.position.y)
        .map(p => p.position.y - gap)
    );
    
    if (isFinite(rightMostX) && constraints.maxSize) {
      constraints.maxSize.width = Math.min(
        constraints.maxSize.width,
        rightMostX - panel.position.x
      );
    }
    
    if (isFinite(bottomMostY) && constraints.maxSize) {
      constraints.maxSize.height = Math.min(
        constraints.maxSize.height,
        bottomMostY - panel.position.y
      );
    }
  }
  
  return constraints;
};

/**
 * Enforce minimum and maximum size constraints
 */
export const enforceMinMaxConstraints = (
  size: Size,
  constraints: ResizeConstraints
): { size: Size; adjustments: Array<{ dimension: 'width' | 'height'; from: number; to: number; reason: string }> } => {
  const adjustments: Array<{ dimension: 'width' | 'height'; from: number; to: number; reason: string }> = [];
  let constrainedSize = { ...size };
  
  // Enforce minimum constraints
  if (constrainedSize.width < constraints.minSize.width) {
    adjustments.push({
      dimension: 'width',
      from: constrainedSize.width,
      to: constraints.minSize.width,
      reason: 'Minimum width constraint',
    });
    constrainedSize.width = constraints.minSize.width;
  }
  
  if (constrainedSize.height < constraints.minSize.height) {
    adjustments.push({
      dimension: 'height',
      from: constrainedSize.height,
      to: constraints.minSize.height,
      reason: 'Minimum height constraint',
    });
    constrainedSize.height = constraints.minSize.height;
  }
  
  // Enforce maximum constraints
  if (constraints.maxSize) {
    if (constrainedSize.width > constraints.maxSize.width) {
      adjustments.push({
        dimension: 'width',
        from: constrainedSize.width,
        to: constraints.maxSize.width,
        reason: 'Maximum width constraint',
      });
      constrainedSize.width = constraints.maxSize.width;
    }
    
    if (constrainedSize.height > constraints.maxSize.height) {
      adjustments.push({
        dimension: 'height',
        from: constrainedSize.height,
        to: constraints.maxSize.height,
        reason: 'Maximum height constraint',
      });
      constrainedSize.height = constraints.maxSize.height;
    }
  }
  
  return { size: constrainedSize, adjustments };
};

/**
 * Calculate and enforce aspect ratio constraints
 */
export const calculateAspectRatio = (size: Size): number => {
  return size.width / size.height;
};

export const enforceAspectRatio = (
  size: Size,
  targetRatio: number,
  tolerance: number = 0.1,
  prioritizeDimension: 'width' | 'height' | 'auto' = 'auto'
): { size: Size; adjusted: boolean } => {
  const currentRatio = calculateAspectRatio(size);
  const ratioDifference = Math.abs(currentRatio - targetRatio);
  
  if (ratioDifference <= tolerance) {
    return { size, adjusted: false };
  }
  
  let adjustedSize = { ...size };
  
  if (prioritizeDimension === 'width' || 
      (prioritizeDimension === 'auto' && Math.abs(size.width - size.width) > Math.abs(size.height - size.height))) {
    // Adjust height to match width
    adjustedSize.height = size.width / targetRatio;
  } else {
    // Adjust width to match height
    adjustedSize.width = size.height * targetRatio;
  }
  
  return { size: adjustedSize, adjusted: true };
};

/**
 * Snap size to common dimensions or grid
 */
export const snapToCommonSizes = (
  size: Size,
  snapThreshold: number = 15,
  commonSizes: Size[] = COMMON_PANEL_SIZES,
  gridSize?: number
): { size: Size; snapped: boolean; snapTarget?: Size | 'grid' } => {
  // First try snapping to common sizes
  for (const commonSize of commonSizes) {
    const widthDiff = Math.abs(size.width - commonSize.width);
    const heightDiff = Math.abs(size.height - commonSize.height);
    
    if (widthDiff <= snapThreshold && heightDiff <= snapThreshold) {
      return {
        size: commonSize,
        snapped: true,
        snapTarget: commonSize,
      };
    }
  }
  
  // Then try snapping to grid if enabled
  if (gridSize && gridSize > 0) {
    const snappedWidth = Math.round(size.width / gridSize) * gridSize;
    const snappedHeight = Math.round(size.height / gridSize) * gridSize;
    
    const widthDiff = Math.abs(size.width - snappedWidth);
    const heightDiff = Math.abs(size.height - snappedHeight);
    
    if (widthDiff <= snapThreshold || heightDiff <= snapThreshold) {
      return {
        size: { width: snappedWidth, height: snappedHeight },
        snapped: true,
        snapTarget: 'grid',
      };
    }
  }
  
  return { size, snapped: false };
};

/**
 * Check for collisions with other panels
 */
export const detectResizeCollisions = (
  panel: PanelLayout,
  newSize: Size,
  otherPanels: PanelLayout[],
  minimumGap: number = 8
): Array<{ panelId: string; overlap: Size; suggestion?: Size }> => {
  const collisions: Array<{ panelId: string; overlap: Size; suggestion?: Size }> = [];
  
  const newPanelBounds = {
    left: panel.position.x,
    top: panel.position.y,
    right: panel.position.x + newSize.width,
    bottom: panel.position.y + newSize.height,
  };
  
  for (const otherPanel of otherPanels) {
    if (otherPanel.id === panel.id) continue;
    
    const otherBounds = {
      left: otherPanel.position.x - minimumGap,
      top: otherPanel.position.y - minimumGap,
      right: otherPanel.position.x + otherPanel.size.width + minimumGap,
      bottom: otherPanel.position.y + otherPanel.size.height + minimumGap,
    };
    
    // Check for overlap
    const overlapping = !(
      newPanelBounds.right <= otherBounds.left ||
      newPanelBounds.left >= otherBounds.right ||
      newPanelBounds.bottom <= otherBounds.top ||
      newPanelBounds.top >= otherBounds.bottom
    );
    
    if (overlapping) {
      const overlapWidth = Math.min(newPanelBounds.right, otherBounds.right) - 
                          Math.max(newPanelBounds.left, otherBounds.left);
      const overlapHeight = Math.min(newPanelBounds.bottom, otherBounds.bottom) - 
                           Math.max(newPanelBounds.top, otherBounds.top);
      
      // Calculate suggested size to avoid collision
      const suggestedWidth = otherPanel.position.x - panel.position.x - minimumGap;
      const suggestedHeight = otherPanel.position.y - panel.position.y - minimumGap;
      
      collisions.push({
        panelId: otherPanel.id,
        overlap: { width: overlapWidth, height: overlapHeight },
        suggestion: {
          width: Math.max(0, suggestedWidth),
          height: Math.max(0, suggestedHeight),
        },
      });
    }
  }
  
  return collisions;
};

/**
 * Comprehensive resize validation
 */
export const validateResizeOperation = (
  panel: PanelLayout,
  newSize: Size,
  constraints: ResizeConstraints,
  otherPanels: PanelLayout[] = []
): ResizeValidationResult => {
  const violations: string[] = [];
  const warnings: string[] = [];
  const adjustments: Array<{ width: number; height: number; reason: string }> = [];
  
  let validatedSize = { ...newSize };
  
  // 1. Enforce min/max constraints
  const minMaxResult = enforceMinMaxConstraints(validatedSize, constraints);
  validatedSize = minMaxResult.size;
  minMaxResult.adjustments.forEach(adj => {
    adjustments.push({
      width: adj.dimension === 'width' ? adj.to - adj.from : 0,
      height: adj.dimension === 'height' ? adj.to - adj.from : 0,
      reason: adj.reason,
    });
    if (adj.from !== adj.to) {
      violations.push(adj.reason);
    }
  });
  
  // 2. Check aspect ratio if enforced
  if (constraints.aspectRatio?.enforceOnResize) {
    const aspectResult = enforceAspectRatio(
      validatedSize,
      constraints.aspectRatio.ratio,
      constraints.aspectRatio.tolerance
    );
    if (aspectResult.adjusted) {
      adjustments.push({
        width: aspectResult.size.width - validatedSize.width,
        height: aspectResult.size.height - validatedSize.height,
        reason: 'Aspect ratio constraint',
      });
      validatedSize = aspectResult.size;
      warnings.push('Size adjusted to maintain aspect ratio');
    }
  }
  
  // 3. Check for collisions
  if (constraints.collisionConstraints?.preventOverlap) {
    const collisions = detectResizeCollisions(
      panel,
      validatedSize,
      otherPanels,
      constraints.collisionConstraints.minimumGap
    );
    
    if (collisions.length > 0) {
      collisions.forEach(collision => {
        violations.push(`Collision with panel ${collision.panelId}`);
        if (collision.suggestion) {
          adjustments.push({
            width: collision.suggestion.width - validatedSize.width,
            height: collision.suggestion.height - validatedSize.height,
            reason: `Avoid collision with ${collision.panelId}`,
          });
        }
      });
    }
  }
  
  // 4. Apply snapping if enabled
  if (constraints.snapConstraints?.enabled) {
    const snapResult = snapToCommonSizes(
      validatedSize,
      constraints.snapConstraints.snapDistance,
      constraints.snapConstraints.commonSizes,
      constraints.snapConstraints.gridSize
    );
    
    if (snapResult.snapped) {
      adjustments.push({
        width: snapResult.size.width - validatedSize.width,
        height: snapResult.size.height - validatedSize.height,
        reason: `Snapped to ${snapResult.snapTarget === 'grid' ? 'grid' : 'common size'}`,
      });
      validatedSize = snapResult.size;
      warnings.push('Size snapped to nearest target');
    }
  }
  
  return {
    isValid: violations.length === 0,
    constrainedSize: validatedSize,
    violations,
    warnings,
    adjustments,
  };
};