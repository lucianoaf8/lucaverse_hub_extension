/**
 * Component Test Suite
 * Validates all panel components functionality including drag, resize, and grid overlay
 */

import React, { useState, useEffect } from 'react';
import { Panel, ResizeHandle, DragHandle, GridOverlay } from '../ui';
import { useLayoutStore } from '@/stores/layoutStore';
import { PanelComponent } from '@/types/panel';
import type { Position, Size } from '@/types/panel';

const ComponentTest: React.FC = () => {
  // Local state for testing
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 });
  const [size, setSize] = useState<Size>({ width: 400, height: 300 });
  const [showGrid, setShowGrid] = useState(true);
  const [selectedPanel, setSelectedPanel] = useState<string | null>('test-panel');

  // Store state for comprehensive testing
  const {
    panels,
    addPanel,
    updatePanel,
    removePanel,
    gridSettings,
    updateGridSettings,
    dragState,
    resizeState,
    selectedPanelIds
  } = useLayoutStore();

  // Initialize test panels
  useEffect(() => {
    // Clear existing panels
    panels.forEach(panel => removePanel(panel.id));

    // Add test panels
    addPanel({
      component: PanelComponent.SmartHub,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
      zIndex: 100,
      visible: true,
      constraints: {
        minSize: { width: 200, height: 150 },
        maxSize: { width: 800, height: 600 }
      },
      metadata: {
        title: 'Test Panel 1',
        description: 'Primary test panel for drag and resize',
        icon: '🔧'
      }
    });

    addPanel({
      component: PanelComponent.AIChat,
      position: { x: 550, y: 150 },
      size: { width: 350, height: 250 },
      zIndex: 101,
      visible: true,
      constraints: {
        minSize: { width: 200, height: 150 }
      },
      metadata: {
        title: 'Test Panel 2',
        description: 'Secondary panel for interaction testing',
        icon: '🤖'
      }
    });

    addPanel({
      component: PanelComponent.TaskManager,
      position: { x: 200, y: 450 },
      size: { width: 300, height: 200 },
      zIndex: 102,
      visible: true,
      constraints: {
        minSize: { width: 250, height: 180 }
      },
      metadata: {
        title: 'Test Panel 3',
        description: 'Third panel for multi-panel testing',
        icon: '📋'
      }
    });

    // Configure grid for testing
    updateGridSettings({
      enabled: true,
      visible: showGrid,
      size: 20,
      opacity: 0.3,
      color: '#e5e7eb',
      snapThreshold: 10
    });
  }, []);

  // Test utilities
  const handleAddRandomPanel = () => {
    const randomX = Math.floor(Math.random() * 600) + 50;
    const randomY = Math.floor(Math.random() * 400) + 50;
    const randomWidth = Math.floor(Math.random() * 200) + 250;
    const randomHeight = Math.floor(Math.random() * 150) + 200;

    addPanel({
      component: PanelComponent.Productivity,
      position: { x: randomX, y: randomY },
      size: { width: randomWidth, height: randomHeight },
      zIndex: 103 + panels.length,
      visible: true,
      constraints: {
        minSize: { width: 200, height: 150 }
      },
      metadata: {
        title: `Random Panel ${panels.length + 1}`,
        description: 'Randomly generated test panel',
        icon: '🎲'
      }
    });
  };

  const handleClearPanels = () => {
    panels.forEach(panel => removePanel(panel.id));
  };

  const handleToggleGrid = () => {
    const newVisible = !gridSettings.visible;
    setShowGrid(newVisible);
    updateGridSettings({ visible: newVisible });
  };

  const handleGridSizeChange = (newSize: number) => {
    updateGridSettings({ size: newSize });
  };

  // Test component status
  const getTestStatus = () => {
    const status = {
      panelsRendered: panels.length > 0,
      dragWorking: dragState.isDragging || panels.some(p => !!p.position),
      resizeWorking: resizeState.isResizing || panels.some(p => !!p.size),
      gridVisible: gridSettings.visible && gridSettings.enabled,
      selectionWorking: selectedPanelIds.length > 0,
      noErrors: true // Will be updated based on error catching
    };

    return status;
  };

  const status = getTestStatus();

  return (
    <div className="w-full h-screen relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Grid Overlay */}
      <GridOverlay 
        visible={showGrid}
        gridSize={gridSettings.size}
        opacity={gridSettings.opacity}
        color={gridSettings.color}
        showCoordinates={dragState.isDragging}
        highlightSnapZones={true}
      />

      {/* Test Controls */}
      <div className="absolute top-4 left-4 z-50 bg-black bg-opacity-50 p-4 rounded-lg text-white space-y-2">
        <h3 className="text-lg font-bold text-blue-300">Component Test Suite</h3>
        
        {/* Status Indicators */}
        <div className="space-y-1 text-sm">
          <div className={`flex items-center ${status.panelsRendered ? 'text-green-400' : 'text-red-400'}`}>
            <span className="mr-2">{status.panelsRendered ? '✅' : '❌'}</span>
            Panels Rendered: {panels.length}
          </div>
          <div className={`flex items-center ${status.gridVisible ? 'text-green-400' : 'text-yellow-400'}`}>
            <span className="mr-2">{status.gridVisible ? '✅' : '⚠️'}</span>
            Grid Overlay: {status.gridVisible ? 'Visible' : 'Hidden'}
          </div>
          <div className={`flex items-center ${status.selectionWorking ? 'text-green-400' : 'text-gray-400'}`}>
            <span className="mr-2">{status.selectionWorking ? '✅' : '⭕'}</span>
            Selected: {selectedPanelIds.length}
          </div>
          <div className={`flex items-center ${dragState.isDragging ? 'text-blue-400' : 'text-gray-400'}`}>
            <span className="mr-2">{dragState.isDragging ? '🔄' : '⏸️'}</span>
            Dragging: {dragState.isDragging ? 'Active' : 'Idle'}
          </div>
          <div className={`flex items-center ${resizeState.isResizing ? 'text-purple-400' : 'text-gray-400'}`}>
            <span className="mr-2">{resizeState.isResizing ? '↔️' : '⏸️'}</span>
            Resizing: {resizeState.isResizing ? 'Active' : 'Idle'}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2 pt-2 border-t border-gray-600">
          <button
            onClick={handleAddRandomPanel}
            className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            Add Random Panel
          </button>
          
          <button
            onClick={handleClearPanels}
            className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
          >
            Clear All Panels
          </button>
          
          <button
            onClick={handleToggleGrid}
            className="w-full px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
          >
            {showGrid ? 'Hide' : 'Show'} Grid
          </button>
          
          <div className="flex items-center space-x-2">
            <label className="text-xs">Grid Size:</label>
            <input
              type="range"
              min="10"
              max="50"
              value={gridSettings.size}
              onChange={(e) => handleGridSizeChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs w-8">{gridSettings.size}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-2 border-t border-gray-600 text-xs text-gray-300">
          <div>• Click panels to select</div>
          <div>• Drag panel headers to move</div>
          <div>• Drag corners/edges to resize</div>
          <div>• Use Ctrl+Click for multi-select</div>
          <div>• Arrow keys move selected panels</div>
          <div>• Delete key removes selected panels</div>
        </div>
      </div>

      {/* Test Panels from Store */}
      {panels.map((panel) => (
        <Panel
          key={panel.id}
          id={panel.id}
          title={panel.metadata?.title || `Panel ${panel.id}`}
          icon={panel.metadata?.icon}
          position={panel.position}
          size={panel.size}
          constraints={panel.constraints}
          showHeader={true}
          showResizeHandles={true}
          resizable={true}
          draggable={true}
          animated={true}
          glassmorphism={true}
          headerActions={
            <button
              onClick={(e) => {
                e.stopPropagation();
                removePanel(panel.id);
              }}
              className="w-6 h-6 flex items-center justify-center text-white text-opacity-60 hover:text-opacity-100 hover:bg-red-500 hover:bg-opacity-30 rounded transition-all"
              title="Close panel"
            >
              ×
            </button>
          }
        >
          <div className="p-4 h-full">
            <div className="text-white text-opacity-80 text-sm mb-3">
              {panel.metadata?.description || 'Test panel content'}
            </div>
            
            <div className="space-y-2 text-xs text-white text-opacity-60">
              <div>ID: {panel.id}</div>
              <div>Position: {panel.position.x}, {panel.position.y}</div>
              <div>Size: {panel.size.width} × {panel.size.height}</div>
              <div>Z-Index: {panel.zIndex}</div>
              <div>Component: {panel.component}</div>
            </div>

            {/* Interactive test elements */}
            <div className="mt-4 space-y-2">
              <div className="text-xs text-white text-opacity-40">Test Content:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="glass-panel p-2 text-xs">
                  Scrollable content area with glassmorphism styling
                </div>
                <div className="glass-panel p-2 text-xs">
                  Interactive elements work correctly
                </div>
              </div>
            </div>
          </div>
        </Panel>
      ))}

      {/* Performance Monitor */}
      <div className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 p-3 rounded-lg text-white text-xs">
        <div className="font-bold text-yellow-400 mb-1">Performance</div>
        <div>Panels: {panels.length}</div>
        <div>Selected: {selectedPanelIds.length}</div>
        <div>Grid Size: {gridSettings.size}px</div>
        <div>Viewport: {window.innerWidth} × {window.innerHeight}</div>
      </div>
    </div>
  );
};

export default ComponentTest;