import React from 'react';
import { Position, Size } from '../../types/panel';
import { ResizeConstraints } from '../../utils/resizeConstraints';
import clsx from 'clsx';

// Resize preview props
export interface ResizePreviewProps {
  isVisible: boolean;
  originalSize: Size;
  previewSize: Size;
  position: Position;
  constraints?: ResizeConstraints;
  violations?: string[];
  warnings?: string[];
  showDimensions?: boolean;
  showGuidelines?: boolean;
  showSnapIndicators?: boolean;
  showConstraintViolations?: boolean;
  className?: string;
}

// Snap indicator data
interface SnapIndicator {
  id: string;
  type: 'grid' | 'common-size' | 'alignment';
  position: Position;
  size?: Size;
  label: string;
}

// Guidelines for alignment with other panels
interface Guideline {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number;
  length: number;
  offset: number;
  label?: string;
}

// Real-time dimension display component
const DimensionDisplay: React.FC<{
  size: Size;
  originalSize: Size;
  position: Position;
  violations: string[];
  warnings: string[];
}> = ({ size, originalSize, position, violations, warnings }) => {
  const deltaWidth = size.width - originalSize.width;
  const deltaHeight = size.height - originalSize.height;
  
  return (
    <div className="absolute z-50 pointer-events-none">
      {/* Main dimension display */}
      <div 
        className="absolute bg-black/90 text-white text-sm px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm"
        style={{
          left: position.x + size.width + 10,
          top: position.y,
        }}
      >
        <div className="space-y-1">
          <div className="font-mono">
            {Math.round(size.width)} × {Math.round(size.height)}
          </div>
          <div className="text-xs text-white/70">
            ({deltaWidth >= 0 ? '+' : ''}{Math.round(deltaWidth)}, {deltaHeight >= 0 ? '+' : ''}{Math.round(deltaHeight)})
          </div>
          
          {/* Violations */}
          {violations.length > 0 && (
            <div className="text-xs text-red-300 space-y-1">
              {violations.map((violation, i) => (
                <div key={i}>⚠ {violation}</div>
              ))}
            </div>
          )}
          
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="text-xs text-yellow-300 space-y-1">
              {warnings.map((warning, i) => (
                <div key={i}>⚡ {warning}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Snap indicator visualization
const SnapIndicators: React.FC<{
  indicators: SnapIndicator[];
  currentSize: Size;
  position: Position;
}> = ({ indicators, currentSize, position }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {indicators.map((indicator) => (
        <div key={indicator.id}>
          {/* Grid snap indicators */}
          {indicator.type === 'grid' && (
            <div
              className="absolute border border-blue-400/60 bg-blue-400/10 rounded"
              style={{
                left: indicator.position.x,
                top: indicator.position.y,
                width: indicator.size?.width || 20,
                height: indicator.size?.height || 20,
              }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 whitespace-nowrap">
                {indicator.label}
              </div>
            </div>
          )}
          
          {/* Common size snap indicators */}
          {indicator.type === 'common-size' && (
            <div
              className="absolute border-2 border-green-400/60 bg-green-400/10 rounded-lg"
              style={{
                left: position.x,
                top: position.y,
                width: indicator.size?.width || currentSize.width,
                height: indicator.size?.height || currentSize.height,
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm text-green-400 whitespace-nowrap font-medium">
                📐 {indicator.label}
              </div>
            </div>
          )}
          
          {/* Alignment indicators */}
          {indicator.type === 'alignment' && (
            <div
              className="absolute bg-purple-400/60 rounded"
              style={{
                left: indicator.position.x - 1,
                top: indicator.position.y - 1,
                width: 2,
                height: indicator.size?.height || 100,
              }}
            >
              <div className="absolute -left-8 top-0 text-xs text-purple-400 whitespace-nowrap">
                {indicator.label}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Alignment guidelines visualization
const AlignmentGuidelines: React.FC<{
  guidelines: Guideline[];
  viewportSize: { width: number; height: number };
}> = ({ guidelines, viewportSize }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      <svg className="w-full h-full">
        {guidelines.map((guideline) => (
          <g key={guideline.id}>
            {guideline.type === 'vertical' ? (
              <>
                <line
                  x1={guideline.position}
                  y1={guideline.offset}
                  x2={guideline.position}
                  y2={guideline.offset + guideline.length}
                  stroke="#3B82F6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
                {guideline.label && (
                  <text
                    x={guideline.position + 5}
                    y={guideline.offset + 15}
                    fill="#3B82F6"
                    fontSize="12"
                    className="font-mono"
                  >
                    {guideline.label}
                  </text>
                )}
              </>
            ) : (
              <>
                <line
                  x1={guideline.offset}
                  y1={guideline.position}
                  x2={guideline.offset + guideline.length}
                  y2={guideline.position}
                  stroke="#3B82F6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
                {guideline.label && (
                  <text
                    x={guideline.offset + 5}
                    y={guideline.position - 5}
                    fill="#3B82F6"
                    fontSize="12"
                    className="font-mono"
                  >
                    {guideline.label}
                  </text>
                )}
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// Constraint violation warning overlay
const ConstraintViolationOverlay: React.FC<{
  violations: string[];
  position: Position;
  size: Size;
}> = ({ violations, position, size }) => {
  if (violations.length === 0) return null;
  
  return (
    <div
      className="absolute border-2 border-red-500 bg-red-500/10 rounded-lg pointer-events-none z-40"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-red-500/90 text-white text-sm px-3 py-2 rounded-lg backdrop-blur-sm max-w-xs">
          <div className="font-medium mb-1">⚠ Constraint Violations:</div>
          {violations.slice(0, 3).map((violation, i) => (
            <div key={i} className="text-xs">• {violation}</div>
          ))}
          {violations.length > 3 && (
            <div className="text-xs opacity-70">...and {violations.length - 3} more</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Preview outline with animation
const PreviewOutline: React.FC<{
  position: Position;
  size: Size;
  originalSize: Size;
  isValid: boolean;
}> = ({ position, size, originalSize, isValid }) => {
  const isExpanding = size.width > originalSize.width || size.height > originalSize.height;
  const isShrinking = size.width < originalSize.width || size.height < originalSize.height;
  
  return (
    <div
      className={clsx(
        'absolute border-2 rounded-lg pointer-events-none z-30 transition-all duration-150',
        {
          'border-green-400 bg-green-400/5': isValid && isExpanding,
          'border-blue-400 bg-blue-400/5': isValid && isShrinking,
          'border-yellow-400 bg-yellow-400/5': isValid && !isExpanding && !isShrinking,
          'border-red-400 bg-red-400/5': !isValid,
          'animate-pulse': !isValid,
        }
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      {/* Corner indicators */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-current rounded-full" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-current rounded-full" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-current rounded-full" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-current rounded-full" />
    </div>
  );
};

// Main resize preview component
export const ResizePreview: React.FC<ResizePreviewProps> = ({
  isVisible,
  originalSize,
  previewSize,
  position,
  constraints,
  violations = [],
  warnings = [],
  showDimensions = true,
  showGuidelines = true,
  showSnapIndicators = true,
  showConstraintViolations = true,
  className = '',
}) => {
  // Generate mock data for demonstration
  const mockSnapIndicators: SnapIndicator[] = React.useMemo(() => {
    if (!showSnapIndicators) return [];
    
    const indicators: SnapIndicator[] = [];
    
    // Add grid snap indicators if close to grid points
    if (constraints?.snapConstraints?.enabled && constraints.snapConstraints.gridSize) {
      const gridSize = constraints.snapConstraints.gridSize;
      const snapDistance = constraints.snapConstraints.snapDistance || 15;
      
      const nearestGridX = Math.round(previewSize.width / gridSize) * gridSize;
      const nearestGridY = Math.round(previewSize.height / gridSize) * gridSize;
      
      if (Math.abs(previewSize.width - nearestGridX) <= snapDistance) {
        indicators.push({
          id: 'grid-width',
          type: 'grid',
          position: { x: position.x, y: position.y - 30 },
          size: { width: nearestGridX, height: 20 },
          label: `Grid: ${nearestGridX}px`,
        });
      }
      
      if (Math.abs(previewSize.height - nearestGridY) <= snapDistance) {
        indicators.push({
          id: 'grid-height',
          type: 'grid',
          position: { x: position.x - 30, y: position.y },
          size: { width: 20, height: nearestGridY },
          label: `Grid: ${nearestGridY}px`,
        });
      }
    }
    
    // Add common size indicators
    if (constraints?.snapConstraints?.commonSizes) {
      const snapDistance = constraints.snapConstraints.snapDistance || 15;
      
      for (const commonSize of constraints.snapConstraints.commonSizes) {
        const widthDiff = Math.abs(previewSize.width - commonSize.width);
        const heightDiff = Math.abs(previewSize.height - commonSize.height);
        
        if (widthDiff <= snapDistance && heightDiff <= snapDistance) {
          indicators.push({
            id: 'common-size',
            type: 'common-size',
            position: position,
            size: commonSize,
            label: `${commonSize.width}×${commonSize.height}`,
          });
          break;
        }
      }
    }
    
    return indicators;
  }, [showSnapIndicators, constraints, previewSize, position]);

  const mockGuidelines: Guideline[] = React.useMemo(() => {
    if (!showGuidelines) return [];
    
    // Generate alignment guidelines
    return [
      {
        id: 'center-vertical',
        type: 'vertical',
        position: position.x + previewSize.width / 2,
        length: 200,
        offset: Math.max(0, position.y - 50),
        label: 'Center',
      },
      {
        id: 'center-horizontal',
        type: 'horizontal',
        position: position.y + previewSize.height / 2,
        length: 200,
        offset: Math.max(0, position.x - 50),
        label: 'Middle',
      },
    ];
  }, [showGuidelines, position, previewSize]);

  if (!isVisible) return null;

  const isValid = violations.length === 0;

  return (
    <div className={clsx('resize-preview-container', className)}>
      {/* Preview outline */}
      <PreviewOutline
        position={position}
        size={previewSize}
        originalSize={originalSize}
        isValid={isValid}
      />
      
      {/* Dimension display */}
      {showDimensions && (
        <DimensionDisplay
          size={previewSize}
          originalSize={originalSize}
          position={position}
          violations={violations}
          warnings={warnings}
        />
      )}
      
      {/* Snap indicators */}
      {showSnapIndicators && (
        <SnapIndicators
          indicators={mockSnapIndicators}
          currentSize={previewSize}
          position={position}
        />
      )}
      
      {/* Alignment guidelines */}
      {showGuidelines && (
        <AlignmentGuidelines
          guidelines={mockGuidelines}
          viewportSize={{ width: window.innerWidth, height: window.innerHeight }}
        />
      )}
      
      {/* Constraint violation overlay */}
      {showConstraintViolations && violations.length > 0 && (
        <ConstraintViolationOverlay
          violations={violations}
          position={position}
          size={previewSize}
        />
      )}
      
      {/* Aspect ratio indicator */}
      {constraints?.aspectRatio?.enforceOnResize && (
        <div
          className="absolute pointer-events-none z-35"
          style={{
            left: position.x + previewSize.width + 15,
            top: position.y + previewSize.height - 40,
          }}
        >
          <div className="bg-purple-500/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            📏 Ratio: {(previewSize.width / previewSize.height).toFixed(2)}
          </div>
        </div>
      )}
      
      {/* Performance indicator for smooth animations */}
      <style jsx>{`
        .resize-preview-container {
          will-change: transform;
        }
        
        .resize-preview-container * {
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};