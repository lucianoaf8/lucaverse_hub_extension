import { Position, Size, PanelLayout } from '../types/panel';
import { ResizeConstraints } from './resizeConstraints';

// Performance metrics interface
export interface ResizePerformanceMetrics {
  operationCount: number;
  averageProcessingTime: number;
  maxProcessingTime: number;
  minProcessingTime: number;
  totalProcessingTime: number;
  frameDrops: number;
  memoryUsage?: number;
}

// Resize operation cache entry
interface ResizeOperationCacheEntry {
  key: string;
  operation: 'calculateAspectRatio' | 'enforceConstraints' | 'snapToSize' | 'validateResize';
  input: any;
  output: any;
  timestamp: number;
  accessCount: number;
}

// Global performance tracking
let performanceMetrics: ResizePerformanceMetrics = {
  operationCount: 0,
  averageProcessingTime: 0,
  maxProcessingTime: 0,
  minProcessingTime: Infinity,
  totalProcessingTime: 0,
  frameDrops: 0,
};

// Operation cache for performance
const operationCache = new Map<string, ResizeOperationCacheEntry>();
const CACHE_MAX_SIZE = 100;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Calculate aspect ratio from size dimensions
 */
export const calculateAspectRatio = (size: Size): number => {
  const startTime = performance.now();
  
  try {
    if (size.height === 0) return 0;
    return size.width / size.height;
  } finally {
    trackPerformance(performance.now() - startTime);
  }
};

/**
 * Calculate aspect ratio with precision handling
 */
export const calculatePreciseAspectRatio = (
  size: Size,
  precision: number = 2
): { ratio: number; formatted: string } => {
  const startTime = performance.now();
  
  try {
    const ratio = calculateAspectRatio(size);
    const roundedRatio = Math.round(ratio * Math.pow(10, precision)) / Math.pow(10, precision);
    
    return {
      ratio: roundedRatio,
      formatted: `${roundedRatio.toFixed(precision)}:1`,
    };
  } finally {
    trackPerformance(performance.now() - startTime);
  }
};

/**
 * Enforce minimum and maximum size constraints with detailed feedback
 */
export const enforceMinMaxConstraints = (
  size: Size,
  constraints: ResizeConstraints
): {
  constrainedSize: Size;
  wasConstrained: boolean;
  violations: Array<{
    dimension: 'width' | 'height';
    constraint: 'min' | 'max';
    original: number;
    constrained: number;
  }>;
} => {
  const cacheKey = `enforceConstraints_${JSON.stringify({ size, constraints })}`;
  const cached = getCachedOperation(cacheKey);
  if (cached) return cached.output;
  
  const startTime = performance.now();
  
  try {
    const violations: Array<{
      dimension: 'width' | 'height';
      constraint: 'min' | 'max';
      original: number;
      constrained: number;
    }> = [];
    
    let constrainedSize = { ...size };
    let wasConstrained = false;
    
    // Enforce minimum width
    if (constrainedSize.width < constraints.minSize.width) {
      violations.push({
        dimension: 'width',
        constraint: 'min',
        original: constrainedSize.width,
        constrained: constraints.minSize.width,
      });
      constrainedSize.width = constraints.minSize.width;
      wasConstrained = true;
    }
    
    // Enforce minimum height
    if (constrainedSize.height < constraints.minSize.height) {
      violations.push({
        dimension: 'height',
        constraint: 'min',
        original: constrainedSize.height,
        constrained: constraints.minSize.height,
      });
      constrainedSize.height = constraints.minSize.height;
      wasConstrained = true;
    }
    
    // Enforce maximum width
    if (constraints.maxSize && constrainedSize.width > constraints.maxSize.width) {
      violations.push({
        dimension: 'width',
        constraint: 'max',
        original: constrainedSize.width,
        constrained: constraints.maxSize.width,
      });
      constrainedSize.width = constraints.maxSize.width;
      wasConstrained = true;
    }
    
    // Enforce maximum height
    if (constraints.maxSize && constrainedSize.height > constraints.maxSize.height) {
      violations.push({
        dimension: 'height',
        constraint: 'max',
        original: constrainedSize.height,
        constrained: constraints.maxSize.height,
      });
      constrainedSize.height = constraints.maxSize.height;
      wasConstrained = true;
    }
    
    const result = { constrainedSize, wasConstrained, violations };
    setCachedOperation(cacheKey, 'enforceConstraints', { size, constraints }, result);
    
    return result;
  } finally {
    trackPerformance(performance.now() - startTime);
  }
};

/**
 * Snap size to common dimensions with detailed analysis
 */
export const snapToCommonSizes = (
  size: Size,
  snapThreshold: number = 15,
  commonSizes: Size[] = []
): {
  snappedSize: Size;
  wasSnapped: boolean;
  snapTarget: Size | null;
  snapDistance: number;
  alternatives: Array<{ size: Size; distance: number }>;
} => {
  const cacheKey = `snapToSizes_${JSON.stringify({ size, snapThreshold, commonSizes })}`;
  const cached = getCachedOperation(cacheKey);
  if (cached) return cached.output;
  
  const startTime = performance.now();
  
  try {
    const alternatives: Array<{ size: Size; distance: number }> = [];
    let bestMatch: { size: Size; distance: number } | null = null;
    
    // Calculate distances to all common sizes
    commonSizes.forEach(commonSize => {
      const distance = Math.sqrt(
        Math.pow(size.width - commonSize.width, 2) + 
        Math.pow(size.height - commonSize.height, 2)
      );
      
      alternatives.push({ size: commonSize, distance });
      
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = { size: commonSize, distance };
      }
    });
    
    // Sort alternatives by distance
    alternatives.sort((a, b) => a.distance - b.distance);
    
    const wasSnapped = bestMatch && bestMatch.distance <= snapThreshold;
    const result = {
      snappedSize: wasSnapped ? bestMatch!.size : size,
      wasSnapped: !!wasSnapped,
      snapTarget: wasSnapped ? bestMatch!.size : null,
      snapDistance: bestMatch?.distance || 0,
      alternatives: alternatives.slice(0, 5), // Top 5 alternatives
    };
    
    setCachedOperation(cacheKey, 'snapToSize', { size, snapThreshold, commonSizes }, result);
    return result;
  } finally {
    trackPerformance(performance.now() - startTime);
  }
};

/**
 * Calculate proportional resize for maintaining relationships
 */
export const calculateProportionalResize = (
  panels: PanelLayout[],
  deltaSize: Size,
  anchorPanel: PanelLayout
): Array<{
  panelId: string;
  newSize: Size;
  proportion: number;
  relationship: 'horizontal' | 'vertical' | 'both' | 'none';
}> => {
  const startTime = performance.now();
  
  try {
    const results: Array<{
      panelId: string;
      newSize: Size;
      proportion: number;
      relationship: 'horizontal' | 'vertical' | 'both' | 'none';
    }> = [];
    
    panels.forEach(panel => {
      if (panel.id === anchorPanel.id) return;
      
      // Determine spatial relationship
      const horizontalAlignment = Math.abs(panel.position.y - anchorPanel.position.y) < 50;
      const verticalAlignment = Math.abs(panel.position.x - anchorPanel.position.x) < 50;
      
      let relationship: 'horizontal' | 'vertical' | 'both' | 'none' = 'none';
      if (horizontalAlignment && verticalAlignment) relationship = 'both';
      else if (horizontalAlignment) relationship = 'horizontal';
      else if (verticalAlignment) relationship = 'vertical';
      
      if (relationship === 'none') return;
      
      // Calculate proportional adjustments
      const widthProportion = relationship === 'horizontal' || relationship === 'both' 
        ? panel.size.width / anchorPanel.size.width 
        : 1;
      const heightProportion = relationship === 'vertical' || relationship === 'both'
        ? panel.size.height / anchorPanel.size.height
        : 1;
      
      const newSize: Size = {
        width: relationship === 'horizontal' || relationship === 'both'
          ? panel.size.width + (deltaSize.width * widthProportion)
          : panel.size.width,
        height: relationship === 'vertical' || relationship === 'both'
          ? panel.size.height + (deltaSize.height * heightProportion)
          : panel.size.height,
      };
      
      results.push({
        panelId: panel.id,
        newSize,
        proportion: Math.max(widthProportion, heightProportion),
        relationship,
      });
    });
    
    return results;
  } finally {
    trackPerformance(performance.now() - startTime);
  }
};

/**
 * Validate resize operation with comprehensive checks
 */
export const validateResizeOperation = (
  panel: PanelLayout,
  newSize: Size,
  constraints: ResizeConstraints,
  context: {
    otherPanels?: PanelLayout[];
    viewport?: Size;
    preserveAspectRatio?: boolean;
  } = {}
): {
  isValid: boolean;
  validatedSize: Size;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  confidence: number;
} => {
  const startTime = performance.now();
  
  try {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let validatedSize = { ...newSize };
    let confidence = 1.0;
    
    // 1. Basic size validation
    if (newSize.width <= 0 || newSize.height <= 0) {
      errors.push('Size dimensions must be positive');
      confidence = 0;
    }
    
    // 2. Constraint validation
    const constraintResult = enforceMinMaxConstraints(newSize, constraints);
    if (constraintResult.wasConstrained) {
      validatedSize = constraintResult.constrainedSize;
      constraintResult.violations.forEach(violation => {
        warnings.push(`${violation.dimension} ${violation.constraint} constraint applied`);
        confidence *= 0.9;
      });
    }
    
    // 3. Aspect ratio validation
    if (context.preserveAspectRatio && constraints.aspectRatio) {
      const currentRatio = calculateAspectRatio(validatedSize);
      const targetRatio = constraints.aspectRatio.ratio;
      const tolerance = constraints.aspectRatio.tolerance || 0.1;
      
      if (Math.abs(currentRatio - targetRatio) > tolerance) {
        warnings.push('Aspect ratio deviated from target');
        suggestions.push(`Adjust to maintain ${targetRatio.toFixed(2)}:1 ratio`);
        confidence *= 0.8;
      }
    }
    
    // 4. Collision validation
    if (context.otherPanels && constraints.collisionConstraints?.preventOverlap) {
      const collisions = context.otherPanels.filter(otherPanel => {
        if (otherPanel.id === panel.id) return false;
        
        // Check for overlap
        const panelBounds = {
          left: panel.position.x,
          top: panel.position.y,
          right: panel.position.x + validatedSize.width,
          bottom: panel.position.y + validatedSize.height,
        };
        
        const otherBounds = {
          left: otherPanel.position.x,
          top: otherPanel.position.y,
          right: otherPanel.position.x + otherPanel.size.width,
          bottom: otherPanel.position.y + otherPanel.size.height,
        };
        
        return !(
          panelBounds.right <= otherBounds.left ||
          panelBounds.left >= otherBounds.right ||
          panelBounds.bottom <= otherBounds.top ||
          panelBounds.top >= otherBounds.bottom
        );
      });
      
      if (collisions.length > 0) {
        errors.push(`Collision detected with ${collisions.length} panel(s)`);
        suggestions.push('Reduce size or move panel to avoid overlap');
        confidence *= 0.5;
      }
    }
    
    // 5. Viewport validation
    if (context.viewport) {
      if (panel.position.x + validatedSize.width > context.viewport.width) {
        warnings.push('Panel extends beyond right viewport boundary');
        suggestions.push('Reduce width or move panel left');
        confidence *= 0.9;
      }
      
      if (panel.position.y + validatedSize.height > context.viewport.height) {
        warnings.push('Panel extends beyond bottom viewport boundary');
        suggestions.push('Reduce height or move panel up');
        confidence *= 0.9;
      }
    }
    
    return {
      isValid: errors.length === 0,
      validatedSize,
      errors,
      warnings,
      suggestions,
      confidence: Math.max(0, confidence),
    };
  } finally {
    trackPerformance(performance.now() - startTime);
  }
};

/**
 * Performance tracking utilities
 */
const trackPerformance = (processingTime: number) => {
  performanceMetrics.operationCount++;
  performanceMetrics.totalProcessingTime += processingTime;
  performanceMetrics.averageProcessingTime = 
    performanceMetrics.totalProcessingTime / performanceMetrics.operationCount;
  
  if (processingTime > performanceMetrics.maxProcessingTime) {
    performanceMetrics.maxProcessingTime = processingTime;
  }
  
  if (processingTime < performanceMetrics.minProcessingTime) {
    performanceMetrics.minProcessingTime = processingTime;
  }
  
  // Track frame drops (operations taking longer than 16ms)
  if (processingTime > 16) {
    performanceMetrics.frameDrops++;
  }
};

/**
 * Cache management utilities
 */
const getCachedOperation = (key: string): ResizeOperationCacheEntry | null => {
  const entry = operationCache.get(key);
  if (!entry) return null;
  
  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    operationCache.delete(key);
    return null;
  }
  
  entry.accessCount++;
  return entry;
};

const setCachedOperation = (
  key: string,
  operation: ResizeOperationCacheEntry['operation'],
  input: any,
  output: any
) => {
  // Manage cache size
  if (operationCache.size >= CACHE_MAX_SIZE) {
    // Remove oldest entries
    const entries = Array.from(operationCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    entries.slice(0, Math.floor(CACHE_MAX_SIZE * 0.3)).forEach(([key]) => {
      operationCache.delete(key);
    });
  }
  
  operationCache.set(key, {
    key,
    operation,
    input,
    output,
    timestamp: Date.now(),
    accessCount: 1,
  });
};

/**
 * Get current performance metrics
 */
export const getPerformanceMetrics = (): ResizePerformanceMetrics => {
  return { ...performanceMetrics };
};

/**
 * Reset performance metrics
 */
export const resetPerformanceMetrics = (): void => {
  performanceMetrics = {
    operationCount: 0,
    averageProcessingTime: 0,
    maxProcessingTime: 0,
    minProcessingTime: Infinity,
    totalProcessingTime: 0,
    frameDrops: 0,
  };
};

/**
 * Clear operation cache
 */
export const clearOperationCache = (): void => {
  operationCache.clear();
};

/**
 * Get cache statistics
 */
export const getCacheStatistics = (): {
  size: number;
  hitRate: number;
  totalAccesses: number;
  averageAge: number;
} => {
  const entries = Array.from(operationCache.values());
  const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
  const cacheHits = entries.filter(entry => entry.accessCount > 1).length;
  const averageAge = entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0) / entries.length;
  
  return {
    size: operationCache.size,
    hitRate: entries.length > 0 ? cacheHits / entries.length : 0,
    totalAccesses,
    averageAge: averageAge || 0,
  };
};

/**
 * Utility for common panel size presets
 */
export const PANEL_SIZE_PRESETS = {
  small: { width: 320, height: 240 },
  medium: { width: 480, height: 360 },
  large: { width: 640, height: 480 },
  extraLarge: { width: 800, height: 600 },
  fullHD: { width: 1920, height: 1080 },
  square: { width: 400, height: 400 },
  widescreen: { width: 640, height: 360 },
  portrait: { width: 360, height: 640 },
} as const;

/**
 * Get recommended size for content type
 */
export const getRecommendedSize = (
  contentType: 'text' | 'image' | 'video' | 'chart' | 'form',
  contentAmount: 'minimal' | 'moderate' | 'extensive' = 'moderate'
): Size => {
  const baseSize = PANEL_SIZE_PRESETS.medium;
  const multipliers = {
    minimal: 0.7,
    moderate: 1.0,
    extensive: 1.4,
  };
  
  const contentMultipliers = {
    text: { width: 1.0, height: 1.2 },
    image: { width: 1.3, height: 1.0 },
    video: { width: 1.6, height: 0.9 },
    chart: { width: 1.2, height: 1.0 },
    form: { width: 1.0, height: 1.5 },
  };
  
  const multiplier = multipliers[contentAmount];
  const contentMultiplier = contentMultipliers[contentType];
  
  return {
    width: Math.round(baseSize.width * multiplier * contentMultiplier.width),
    height: Math.round(baseSize.height * multiplier * contentMultiplier.height),
  };
};