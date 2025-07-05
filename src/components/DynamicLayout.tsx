/**
 * DynamicLayout Component
 * Main layout management system that orchestrates panel positioning, interactions, and rendering
 */

import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { useLayoutStore } from '@/stores/layoutStore';
import { useLayoutKeyboard } from '@/hooks/useLayoutKeyboard';
import { SmartHub, AIChat, TaskManager, Productivity } from '@/components/panels';
import { PanelToolbar } from '@/components/ui/PanelToolbar';
import { GridOverlay } from '@/components/ui/GridOverlay';
import { snapToGrid, magneticSnapToGrid } from '@/utils/gridSystem';
import { 
  findCollisions, 
  getCollisionPreview, 
  preventOverlap,
  type CollisionResult 
} from '@/utils/collisionDetection';
import { constrainPosition, calculateViewportBounds } from '@/utils/panelBounds';
import { performanceMonitor } from '@/utils/layoutUtils';
import type { Position, Size, PanelLayout } from '@/types/panel';
import { PanelComponent } from '@/types/panel';

// Props interface for DynamicLayout
export interface DynamicLayoutProps {
  containerSize?: Size;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom' | 'left' | 'right';
  enableKeyboardShortcuts?: boolean;
  enableCollisionDetection?: boolean;
  enableGridSnapping?: boolean;
  className?: string;
  onPanelInteraction?: (panelId: string, action: string) => void;
  onLayoutChange?: (panels: PanelLayout[]) => void;
}

export const DynamicLayout: React.FC<DynamicLayoutProps> = ({
  containerSize,
  showToolbar = true,
  toolbarPosition = 'top',
  enableKeyboardShortcuts = true,
  enableCollisionDetection = true,
  enableGridSnapping = true,
  className = '',
  onPanelInteraction,
  onLayoutChange
}) => {
  // Layout container ref
  const containerRef = useRef<HTMLDivElement>(null);
  const [actualContainerSize, setActualContainerSize] = useState<Size>(
    containerSize || { width: 1920, height: 1080 }
  );

  // Layout store
  const {
    panels,
    selectedPanelIds,
    gridSettings,
    dragState,
    resizeState,
    updatePanel,
    selectPanel,
    clearSelection
  } = useLayoutStore();

  // Performance monitoring
  const performanceRef = useRef(performanceMonitor());

  // Collision preview state
  const [collisionPreview, setCollisionPreview] = useState<{
    panelId: string;
    isValid: boolean;
    suggestedPosition?: Position;
  } | null>(null);

  // Initialize keyboard shortcuts
  useLayoutKeyboard({
    enabled: enableKeyboardShortcuts,
    preventDefault: true,
    enableOnFormTags: false
  });

  // Update container size when component mounts or resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setActualContainerSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update viewport bounds in store when container size changes
  useEffect(() => {
    const bounds = calculateViewportBounds(actualContainerSize);
    const store = useLayoutStore.getState();
    store.updatePanel = store.updatePanel; // Trigger bounds update
  }, [actualContainerSize]);

  // Handle layout changes
  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange(panels);
    }
  }, [panels, onLayoutChange]);

  // Handle panel drag with collision detection and grid snapping
  const handlePanelDrag = useCallback((
    panelId: string,
    position: Position,
    isDragging: boolean
  ) => {
    performanceRef.current.start('drag');

    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    let finalPosition = position;

    // Apply grid snapping if enabled
    if (enableGridSnapping && gridSettings.enabled) {
      const snapResult = magneticSnapToGrid(
        position,
        gridSettings.size,
        gridSettings.snapThreshold
      );
      finalPosition = snapResult.position;
    }

    // Apply viewport constraints
    const bounds = calculateViewportBounds(actualContainerSize);
    finalPosition = constrainPosition(finalPosition, panel.size, bounds);

    // Handle collision detection
    if (enableCollisionDetection && isDragging) {
      const preview = getCollisionPreview(
        finalPosition,
        panel.size,
        panels.filter(p => p.id !== panelId),
        panelId
      );

      setCollisionPreview({
        panelId,
        isValid: preview.isValid,
        suggestedPosition: preview.suggestedPosition
      });

      // If collision detected and prevention is needed
      if (!preview.isValid && preview.suggestedPosition) {
        // Show preview but don't force the position during drag
        // User can decide whether to use suggested position
      }
    } else {
      setCollisionPreview(null);
    }

    // Update panel position
    updatePanel(panelId, { position: finalPosition });

    // Trigger interaction callback
    if (onPanelInteraction) {
      onPanelInteraction(panelId, 'drag');
    }

    performanceRef.current.end(panels.length);
  }, [
    panels,
    gridSettings,
    actualContainerSize,
    enableGridSnapping,
    enableCollisionDetection,
    updatePanel,
    onPanelInteraction
  ]);

  // Handle panel resize with constraints
  const handlePanelResize = useCallback((
    panelId: string,
    size: Size
  ) => {
    performanceRef.current.start('resize');

    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    let finalSize = size;

    // Apply size constraints
    if (panel.constraints) {
      const { minSize, maxSize } = panel.constraints;
      finalSize = {
        width: Math.max(minSize.width, Math.min(maxSize?.width || Infinity, size.width)),
        height: Math.max(minSize.height, Math.min(maxSize?.height || Infinity, size.height))
      };
    }

    // Apply viewport constraints
    const bounds = calculateViewportBounds(actualContainerSize);
    const maxWidth = bounds.width - panel.position.x;
    const maxHeight = bounds.height - panel.position.y;
    
    finalSize = {
      width: Math.min(finalSize.width, maxWidth),
      height: Math.min(finalSize.height, maxHeight)
    };

    // Update panel size
    updatePanel(panelId, { size: finalSize });

    // Trigger interaction callback
    if (onPanelInteraction) {
      onPanelInteraction(panelId, 'resize');
    }

    performanceRef.current.end(panels.length);
  }, [panels, actualContainerSize, updatePanel, onPanelInteraction]);

  // Handle panel selection
  const handlePanelSelect = useCallback((
    panelId: string,
    multiSelect: boolean = false
  ) => {
    selectPanel(panelId, multiSelect);
    
    if (onPanelInteraction) {
      onPanelInteraction(panelId, 'select');
    }
  }, [selectPanel, onPanelInteraction]);

  // Handle background click to clear selection
  const handleBackgroundClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  // Render individual panel component
  const renderPanelComponent = useCallback((panel: PanelLayout) => {
    const baseProps = {
      id: panel.id,
      position: panel.position,
      size: panel.size,
      onMove: (position: Position) => handlePanelDrag(panel.id, position, false),
      onResize: (size: Size) => handlePanelResize(panel.id, size),
      className: `panel-${panel.component} ${selectedPanelIds.includes(panel.id) ? 'selected' : ''}`
    };

    // Add drag and resize handlers
    const enhancedProps = {
      ...baseProps,
      onMouseDown: () => handlePanelSelect(panel.id),
      style: {
        zIndex: panel.zIndex + (selectedPanelIds.includes(panel.id) ? 1000 : 0)
      }
    };

    switch (panel.component) {
      case PanelComponent.SmartHub:
        return <SmartHub key={panel.id} {...enhancedProps} />;
      case PanelComponent.AIChat:
        return <AIChat key={panel.id} {...enhancedProps} />;
      case PanelComponent.TaskManager:
        return <TaskManager key={panel.id} {...enhancedProps} />;
      case PanelComponent.Productivity:
        return <Productivity key={panel.id} {...enhancedProps} />;
      default:
        return (
          <div
            key={panel.id}
            className="flex items-center justify-center bg-red-500/20 border border-red-500 text-red-300 rounded"
            style={{
              position: 'absolute',
              left: panel.position.x,
              top: panel.position.y,
              width: panel.size.width,
              height: panel.size.height,
              zIndex: panel.zIndex
            }}
          >
            Unknown Component: {panel.component}
          </div>
        );
    }
  }, [panels, selectedPanelIds, handlePanelDrag, handlePanelResize, handlePanelSelect]);

  // Error boundary for panel rendering
  const renderPanelWithErrorBoundary = useCallback((panel: PanelLayout) => {
    try {
      return renderPanelComponent(panel);
    } catch (error) {
      console.error(`Error rendering panel ${panel.id}:`, error);
      return (
        <div
          key={panel.id}
          className="flex items-center justify-center bg-red-500/20 border border-red-500 text-red-300 rounded p-4"
          style={{
            position: 'absolute',
            left: panel.position.x,
            top: panel.position.y,
            width: panel.size.width,
            height: panel.size.height,
            zIndex: panel.zIndex
          }}
        >
          <div className="text-center">
            <div className="text-lg mb-2">⚠️</div>
            <div className="text-sm">Panel Error</div>
            <div className="text-xs opacity-75">{panel.id}</div>
          </div>
        </div>
      );
    }
  }, [renderPanelComponent]);

  // Memoize rendered panels for performance
  const renderedPanels = useMemo(() => {
    return panels
      .filter(panel => panel.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(renderPanelWithErrorBoundary);
  }, [panels, renderPanelWithErrorBoundary]);

  // Layout container classes
  const layoutClasses = [
    'dynamic-layout',
    'relative',
    'w-full',
    'h-full',
    'overflow-hidden',
    'bg-gradient-to-br',
    'from-slate-900',
    'via-purple-900',
    'to-slate-900',
    className
  ].join(' ');

  // Toolbar component
  const toolbar = showToolbar && (
    <PanelToolbar
      className={`
        ${toolbarPosition === 'top' ? 'rounded-b-lg' : ''}
        ${toolbarPosition === 'bottom' ? 'rounded-t-lg' : ''}
        ${toolbarPosition === 'left' ? 'rounded-r-lg' : ''}
        ${toolbarPosition === 'right' ? 'rounded-l-lg' : ''}
      `}
      orientation={
        toolbarPosition === 'left' || toolbarPosition === 'right' 
          ? 'vertical' 
          : 'horizontal'
      }
    />
  );

  return (
    <div className={layoutClasses}>
      {/* Toolbar - Top */}
      {showToolbar && toolbarPosition === 'top' && (
        <div className="absolute top-0 left-0 right-0 z-40">
          {toolbar}
        </div>
      )}

      {/* Toolbar - Left */}
      {showToolbar && toolbarPosition === 'left' && (
        <div className="absolute top-0 left-0 bottom-0 z-40">
          {toolbar}
        </div>
      )}

      {/* Main Layout Container */}
      <div
        ref={containerRef}
        className={`
          layout-container absolute inset-0 
          ${showToolbar && toolbarPosition === 'top' ? 'mt-16' : ''}
          ${showToolbar && toolbarPosition === 'bottom' ? 'mb-16' : ''}
          ${showToolbar && toolbarPosition === 'left' ? 'ml-16' : ''}
          ${showToolbar && toolbarPosition === 'right' ? 'mr-16' : ''}
        `}
        onClick={handleBackgroundClick}
        onContextMenu={(e) => {
          e.preventDefault();
          // Could add context menu here
        }}
      >
        {/* Grid Overlay */}
        {gridSettings.visible && (
          <GridOverlay
            gridSize={gridSettings.size}
            color={gridSettings.color}
            opacity={gridSettings.opacity}
            className="absolute inset-0 pointer-events-none z-10"
          />
        )}

        {/* Neural Network Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="neural-network-bg opacity-30">
            {/* Animated background particles/connections */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Panels Layer */}
        <div className="relative z-20">
          {renderedPanels}
        </div>

        {/* Collision Preview Overlay */}
        {collisionPreview && !collisionPreview.isValid && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {collisionPreview.suggestedPosition && (
              <div
                className="absolute border-2 border-green-400 border-dashed bg-green-400/20 rounded"
                style={{
                  left: collisionPreview.suggestedPosition.x,
                  top: collisionPreview.suggestedPosition.y,
                  width: panels.find(p => p.id === collisionPreview.panelId)?.size.width || 200,
                  height: panels.find(p => p.id === collisionPreview.panelId)?.size.height || 150
                }}
              >
                <div className="absolute top-2 left-2 text-green-300 text-xs bg-green-900/50 px-2 py-1 rounded">
                  Suggested Position
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debug Overlay */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 text-white/60 text-xs bg-black/20 p-2 rounded pointer-events-none z-50">
            <div>Panels: {panels.length}</div>
            <div>Selected: {selectedPanelIds.length}</div>
            <div>Grid: {gridSettings.enabled ? 'On' : 'Off'} ({gridSettings.size}px)</div>
            <div>Size: {actualContainerSize.width}×{actualContainerSize.height}</div>
            {dragState.isDragging && <div className="text-blue-300">Dragging</div>}
            {resizeState.isResizing && <div className="text-green-300">Resizing</div>}
          </div>
        )}
      </div>

      {/* Toolbar - Right */}
      {showToolbar && toolbarPosition === 'right' && (
        <div className="absolute top-0 right-0 bottom-0 z-40">
          {toolbar}
        </div>
      )}

      {/* Toolbar - Bottom */}
      {showToolbar && toolbarPosition === 'bottom' && (
        <div className="absolute bottom-0 left-0 right-0 z-40">
          {toolbar}
        </div>
      )}

      {/* Global Event Listeners */}
      {enableKeyboardShortcuts && (
        <div className="sr-only">
          Press Ctrl+Shift+H for keyboard shortcuts help
        </div>
      )}
    </div>
  );
};

export default DynamicLayout;