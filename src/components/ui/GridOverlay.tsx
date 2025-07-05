/**
 * GridOverlay Component
 * Visual grid system that appears during drag/resize operations
 * Provides snap points and alignment guides for precise positioning
 */

import React, { useMemo } from 'react';
import { useLayoutStore } from '@/stores/layoutStore';
import type { Position } from '@/types/panel';

export interface GridOverlayProps {
  visible?: boolean;
  gridSize?: number;
  opacity?: number;
  color?: string;
  showCoordinates?: boolean;
  highlightSnapZones?: boolean;
  snapZones?: Position[];
  className?: string;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  visible,
  gridSize,
  opacity,
  color,
  showCoordinates = false,
  highlightSnapZones = true,
  snapZones = [],
  className = '',
}) => {
  const { gridSettings, viewport, dragState, resizeState } = useLayoutStore();

  // Use props or fall back to store settings
  const effectiveVisible =
    visible ?? gridSettings.visible ?? (dragState.isDragging || resizeState.isResizing);
  const effectiveGridSize = gridSize ?? gridSettings.size;
  const effectiveOpacity = opacity ?? gridSettings.opacity;
  const effectiveColor = color ?? gridSettings.color;

  // Generate grid lines
  const gridLines = useMemo(() => {
    if (!effectiveVisible) return { vertical: [], horizontal: [] };

    const { width, height } = viewport.bounds;
    const vertical: number[] = [];
    const horizontal: number[] = [];

    // Generate vertical lines
    for (let x = 0; x <= width; x += effectiveGridSize) {
      vertical.push(x);
    }

    // Generate horizontal lines
    for (let y = 0; y <= height; y += effectiveGridSize) {
      horizontal.push(y);
    }

    return { vertical, horizontal };
  }, [effectiveVisible, effectiveGridSize, viewport.bounds]);

  // Generate snap zone highlights
  const snapZoneElements = useMemo(() => {
    if (!highlightSnapZones || snapZones.length === 0) return [];

    return snapZones.map((zone, index) => (
      <div
        key={`snap-zone-${index}`}
        className="absolute pointer-events-none"
        style={{
          left: zone.x - 5,
          top: zone.y - 5,
          width: 10,
          height: 10,
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          zIndex: 1000,
        }}
      />
    ));
  }, [highlightSnapZones, snapZones]);

  // Generate coordinate display
  const coordinateDisplay = useMemo(() => {
    if (!showCoordinates || !dragState.isDragging) return null;

    const { currentPosition } = dragState;
    if (!currentPosition) return null;

    return (
      <div
        className="absolute pointer-events-none bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-[1001]"
        style={{
          left: currentPosition.x + 10,
          top: currentPosition.y - 30,
        }}
      >
        x: {Math.round(currentPosition.x)}, y: {Math.round(currentPosition.y)}
      </div>
    );
  }, [showCoordinates, dragState]);

  if (!effectiveVisible) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: 50 }}>
      {/* Grid lines using SVG for performance */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: effectiveOpacity,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <pattern
            id="grid"
            width={effectiveGridSize}
            height={effectiveGridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${effectiveGridSize} 0 L 0 0 0 ${effectiveGridSize}`}
              fill="none"
              stroke={effectiveColor}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Alternative CSS grid implementation (commented out for performance) */}
      {/* 
      <div
        className="absolute inset-0"
        style={{
          opacity: effectiveOpacity,
          backgroundImage: `
            linear-gradient(to right, ${effectiveColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${effectiveColor} 1px, transparent 1px)
          `,
          backgroundSize: `${effectiveGridSize}px ${effectiveGridSize}px`,
          pointerEvents: 'none'
        }}
      />
      */}

      {/* Highlighted grid intersections during drag */}
      {dragState.isDragging && dragState.currentPosition && (
        <div
          className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-lg pointer-events-none"
          style={{
            left:
              Math.round(dragState.currentPosition.x / effectiveGridSize) * effectiveGridSize - 4,
            top:
              Math.round(dragState.currentPosition.y / effectiveGridSize) * effectiveGridSize - 4,
            zIndex: 100,
            transform: 'translate(0, 0)', // Force GPU acceleration
          }}
        />
      )}

      {/* Snap zone indicators */}
      {snapZoneElements}

      {/* Coordinate display */}
      {coordinateDisplay}

      {/* Magnetic snap indicators */}
      {dragState.isDragging && dragState.snapToGrid && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: dragState.currentPosition?.x ?? 0,
            top: dragState.currentPosition?.y ?? 0,
            zIndex: 99,
          }}
        >
          {/* Horizontal snap line */}
          <div
            className="absolute bg-blue-400 opacity-60"
            style={{
              left: -viewport.bounds.width / 2,
              top: 0,
              width: viewport.bounds.width,
              height: 1,
              pointerEvents: 'none',
            }}
          />
          {/* Vertical snap line */}
          <div
            className="absolute bg-blue-400 opacity-60"
            style={{
              left: 0,
              top: -viewport.bounds.height / 2,
              width: 1,
              height: viewport.bounds.height,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Grid info overlay (debug mode) */}
      {process.env.NODE_ENV === 'development' && showCoordinates && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded pointer-events-none z-[1002]">
          <div>Grid Size: {effectiveGridSize}px</div>
          <div>Visible: {effectiveVisible ? 'Yes' : 'No'}</div>
          <div>Snap Enabled: {gridSettings.enabled ? 'Yes' : 'No'}</div>
          <div>
            Viewport: {viewport.bounds.width} × {viewport.bounds.height}
          </div>
        </div>
      )}
    </div>
  );
};

GridOverlay.displayName = 'GridOverlay';

export default GridOverlay;
