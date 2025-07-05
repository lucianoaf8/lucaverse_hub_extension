import React, { useState, useCallback } from 'react';
import { ResizablePanel } from '../ui/ResizablePanel';
import { ResizePreview } from '../ui/ResizePreview';
import { ResizeHandles } from '../ui/ResizeHandles';
import { useMultiPanelResize } from '../../hooks/useMultiPanelResize';
import { 
  validateResizeOperation, 
  getPerformanceMetrics, 
  resetPerformanceMetrics,
  PANEL_SIZE_PRESETS,
  getRecommendedSize 
} from '../../utils/resizeUtils';
import { DEFAULT_RESIZE_CONSTRAINTS } from '../../utils/resizeConstraints';
import { Position, Size, PanelLayout, PanelComponent } from '../../types/panel';
import clsx from 'clsx';

// Test panel data
interface TestPanel extends PanelLayout {
  selected: boolean;
  resizing: boolean;
}

// Performance monitoring component
const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState(getPerformanceMetrics());
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getPerformanceMetrics());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute top-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg backdrop-blur-sm max-w-xs">
      <div className="font-semibold mb-2">🚀 Performance Monitor</div>
      <div className="space-y-1">
        <div>Operations: {metrics.operationCount}</div>
        <div>Avg Time: {metrics.averageProcessingTime.toFixed(2)}ms</div>
        <div>Max Time: {metrics.maxProcessingTime.toFixed(2)}ms</div>
        <div>Frame Drops: {metrics.frameDrops}</div>
        <div className={clsx(
          "font-medium",
          metrics.averageProcessingTime > 16 ? "text-red-300" : 
          metrics.averageProcessingTime > 8 ? "text-yellow-300" : "text-green-300"
        )}>
          {metrics.averageProcessingTime > 16 ? "⚠ Poor" : 
           metrics.averageProcessingTime > 8 ? "⚡ Good" : "✨ Excellent"}
        </div>
      </div>
      <button
        onClick={resetPerformanceMetrics}
        className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
      >
        Reset
      </button>
    </div>
  );
};

// Instructions panel
const InstructionsPanel: React.FC = () => {
  return (
    <div className="absolute top-4 left-4 w-80 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white text-sm z-50">
      <h3 className="font-semibold mb-3 text-lg">Panel Resize Test Instructions</h3>
      <div className="space-y-2">
        <p><strong>🔄 Basic Resizing:</strong> Drag resize handles on panel edges/corners</p>
        <p><strong>📐 Aspect Ratio:</strong> Hold Shift while resizing to lock ratio</p>
        <p><strong>📏 Constraints:</strong> Min/max size limits are enforced</p>
        <p><strong>👁️ Preview:</strong> Live dimension display during resize</p>
        <p><strong>🎯 Snap Zones:</strong> Panels snap to common sizes</p>
        <p><strong>🚫 Collision:</strong> Panels prevent overlapping</p>
        <p><strong>👥 Multi-Panel:</strong> Select multiple panels (Ctrl+Click)</p>
        <p><strong>⚡ Performance:</strong> Monitor frame rate in top-right</p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/20">
        <p className="text-xs text-white/60">
          Test all 8 directions • Check constraint violations • Monitor performance
        </p>
      </div>
    </div>
  );
};

// Control panel for testing features
const ControlPanel: React.FC<{
  onAddPanels: () => void;
  onResetPanels: () => void;
  onToggleConstraints: () => void;
  onTogglePreview: () => void;
  constraintsEnabled: boolean;
  previewEnabled: boolean;
}> = ({ 
  onAddPanels, 
  onResetPanels, 
  onToggleConstraints, 
  onTogglePreview,
  constraintsEnabled,
  previewEnabled 
}) => {
  return (
    <div className="absolute bottom-4 left-4 space-y-2 z-50">
      <div className="bg-black/80 text-white text-sm p-3 rounded-lg backdrop-blur-sm">
        <div className="font-semibold mb-2">🎛️ Test Controls</div>
        <div className="space-y-2">
          <button
            onClick={onAddPanels}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Add Test Panels
          </button>
          <button
            onClick={onResetPanels}
            className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
          >
            Reset All Panels
          </button>
          <button
            onClick={onToggleConstraints}
            className={clsx(
              "w-full px-3 py-2 text-white text-sm rounded transition-colors",
              constraintsEnabled 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
            )}
          >
            {constraintsEnabled ? "✅" : "❌"} Constraints
          </button>
          <button
            onClick={onTogglePreview}
            className={clsx(
              "w-full px-3 py-2 text-white text-sm rounded transition-colors",
              previewEnabled 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
            )}
          >
            {previewEnabled ? "✅" : "❌"} Preview
          </button>
        </div>
      </div>
    </div>
  );
};

// Test panel content component
const TestPanelContent: React.FC<{ 
  panel: TestPanel; 
  onSelect: (id: string, multiSelect: boolean) => void; 
}> = ({ panel, onSelect }) => {
  const handleClick = useCallback((event: React.MouseEvent) => {
    onSelect(panel.id, event.ctrlKey || event.metaKey);
  }, [panel.id, onSelect]);
  
  return (
    <div 
      className={clsx(
        "w-full h-full p-4 cursor-pointer transition-all duration-200",
        "border-2 rounded-lg",
        {
          "border-blue-400 bg-blue-400/10": panel.selected,
          "border-white/20 bg-white/5 hover:bg-white/10": !panel.selected,
          "ring-2 ring-yellow-400": panel.resizing,
        }
      )}
      onClick={handleClick}
    >
      <div className="space-y-2 text-white">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📏</span>
          <h3 className="font-semibold">Panel {panel.id}</h3>
        </div>
        
        <div className="text-sm space-y-1">
          <div>Size: {Math.round(panel.size.width)} × {Math.round(panel.size.height)}</div>
          <div>Position: ({Math.round(panel.position.x)}, {Math.round(panel.position.y)})</div>
          <div>Type: {panel.component}</div>
          {panel.selected && <div className="text-blue-300">✓ Selected</div>}
          {panel.resizing && <div className="text-yellow-300">🔄 Resizing</div>}
        </div>
        
        <div className="text-xs text-white/60 mt-3">
          Click to select • Ctrl+Click for multi-select • Drag handles to resize
        </div>
      </div>
    </div>
  );
};

// Main resize test component
export const ResizeTest: React.FC = () => {
  const [panels, setPanels] = useState<TestPanel[]>([
    {
      id: 'resize-test-1',
      component: PanelComponent.SmartHub,
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
      zIndex: 1,
      visible: true,
      selected: false,
      resizing: false,
      constraints: {
        minSize: { width: 200, height: 150 },
      },
      metadata: {
        title: 'Resizable Panel 1',
        description: 'Test panel with standard constraints',
        icon: '📏',
        color: '#3B82F6',
      },
    },
    {
      id: 'resize-test-2',
      component: PanelComponent.AIChat,
      position: { x: 550, y: 150 },
      size: { width: 300, height: 250 },
      zIndex: 1,
      visible: true,
      selected: false,
      resizing: false,
      constraints: {
        minSize: { width: 200, height: 150 },
        maxSize: { width: 600, height: 500 },
      },
      metadata: {
        title: 'Resizable Panel 2',
        description: 'Test panel with max size limits',
        icon: '🤖',
        color: '#10B981',
      },
    },
  ]);
  
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>([]);
  const [resizingPanelId, setResizingPanelId] = useState<string | null>(null);
  const [constraintsEnabled, setConstraintsEnabled] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [resizePreview, setResizePreview] = useState<{
    visible: boolean;
    originalSize: Size;
    previewSize: Size;
    position: Position;
    violations: string[];
    warnings: string[];
  } | null>(null);

  // Multi-panel resize hook
  const multiPanelResize = useMultiPanelResize(
    panels,
    (panelId: string, updates: Partial<PanelLayout>) => {
      setPanels(prev => 
        prev.map(p => 
          p.id === panelId ? { ...p, ...updates } : p
        )
      );
    }
  );

  // Handle panel selection
  const handlePanelSelect = useCallback((panelId: string, multiSelect: boolean) => {
    setSelectedPanelIds(prev => {
      if (multiSelect) {
        return prev.includes(panelId) 
          ? prev.filter(id => id !== panelId)
          : [...prev, panelId];
      } else {
        return [panelId];
      }
    });
    
    // Update panel selection state
    setPanels(prev => 
      prev.map(p => ({
        ...p,
        selected: multiSelect 
          ? (p.id === panelId ? !p.selected : p.selected)
          : p.id === panelId
      }))
    );
  }, []);

  // Handle resize start
  const handleResizeStart = useCallback((panelId: string) => {
    setResizingPanelId(panelId);
    setPanels(prev => 
      prev.map(p => ({
        ...p,
        resizing: p.id === panelId
      }))
    );
  }, []);

  // Handle resize progress
  const handleResize = useCallback((panelId: string, newSize: Size) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    // Validate resize operation
    const validation = validateResizeOperation(
      panel,
      newSize,
      { ...DEFAULT_RESIZE_CONSTRAINTS, ...panel.constraints },
      {
        otherPanels: panels.filter(p => p.id !== panelId),
        viewport: { width: window.innerWidth, height: window.innerHeight },
        preserveAspectRatio: false,
      }
    );

    // Update preview
    if (previewEnabled) {
      setResizePreview({
        visible: true,
        originalSize: panel.size,
        previewSize: validation.validatedSize,
        position: panel.position,
        violations: validation.errors,
        warnings: validation.warnings,
      });
    }

    // Apply constraints if enabled
    if (constraintsEnabled) {
      setPanels(prev => 
        prev.map(p => 
          p.id === panelId 
            ? { ...p, size: validation.validatedSize }
            : p
        )
      );
    } else {
      setPanels(prev => 
        prev.map(p => 
          p.id === panelId 
            ? { ...p, size: newSize }
            : p
        )
      );
    }
  }, [panels, constraintsEnabled, previewEnabled]);

  // Handle resize end
  const handleResizeEnd = useCallback((panelId: string, finalSize: Size) => {
    setResizingPanelId(null);
    setResizePreview(null);
    
    setPanels(prev => 
      prev.map(p => ({
        ...p,
        resizing: false,
        size: p.id === panelId ? finalSize : p.size
      }))
    );
  }, []);

  // Add test panels
  const addTestPanels = useCallback(() => {
    const newPanels = [
      {
        id: `test-panel-${Date.now()}-1`,
        component: PanelComponent.TaskManager,
        position: { x: 200, y: 350 },
        size: getRecommendedSize('chart', 'moderate'),
        zIndex: 1,
        visible: true,
        selected: false,
        resizing: false,
        constraints: {
          minSize: { width: 150, height: 100 },
          aspectRatio: { ratio: 16/9, tolerance: 0.1, enforceOnResize: true },
        },
        metadata: {
          title: 'Chart Panel',
          description: 'Panel with aspect ratio constraints',
          icon: '📊',
          color: '#F59E0B',
        },
      },
      {
        id: `test-panel-${Date.now()}-2`,
        component: PanelComponent.Productivity,
        position: { x: 450, y: 400 },
        size: PANEL_SIZE_PRESETS.small,
        zIndex: 1,
        visible: true,
        selected: false,
        resizing: false,
        constraints: {
          minSize: { width: 100, height: 100 },
          maxSize: { width: 400, height: 400 },
          snapConstraints: {
            enabled: true,
            snapDistance: 20,
            commonSizes: Object.values(PANEL_SIZE_PRESETS),
          },
        },
        metadata: {
          title: 'Snap Panel',
          description: 'Panel with snap-to-size behavior',
          icon: '🎯',
          color: '#8B5CF6',
        },
      },
    ];
    
    setPanels(prev => [...prev, ...newPanels]);
  }, []);

  // Reset all panels
  const resetPanels = useCallback(() => {
    setPanels([
      {
        id: 'resize-test-1',
        component: PanelComponent.SmartHub,
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 },
        zIndex: 1,
        visible: true,
        selected: false,
        resizing: false,
        constraints: {
          minSize: { width: 200, height: 150 },
        },
        metadata: {
          title: 'Resizable Panel 1',
          description: 'Test panel with standard constraints',
          icon: '📏',
          color: '#3B82F6',
        },
      },
      {
        id: 'resize-test-2',
        component: PanelComponent.AIChat,
        position: { x: 550, y: 150 },
        size: { width: 300, height: 250 },
        zIndex: 1,
        visible: true,
        selected: false,
        resizing: false,
        constraints: {
          minSize: { width: 200, height: 150 },
          maxSize: { width: 600, height: 500 },
        },
        metadata: {
          title: 'Resizable Panel 2',
          description: 'Test panel with max size limits',
          icon: '🤖',
          color: '#10B981',
        },
      },
    ]);
    setSelectedPanelIds([]);
    setResizePreview(null);
    resetPerformanceMetrics();
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            event.preventDefault();
            addTestPanels();
            break;
          case 'r':
            event.preventDefault();
            resetPanels();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [addTestPanels, resetPanels]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 overflow-hidden">
      {/* Instructions */}
      <InstructionsPanel />
      
      {/* Performance Monitor */}
      <PerformanceMonitor />
      
      {/* Control Panel */}
      <ControlPanel
        onAddPanels={addTestPanels}
        onResetPanels={resetPanels}
        onToggleConstraints={() => setConstraintsEnabled(prev => !prev)}
        onTogglePreview={() => setPreviewEnabled(prev => !prev)}
        constraintsEnabled={constraintsEnabled}
        previewEnabled={previewEnabled}
      />

      {/* Test Panels */}
      {panels.map((panel) => (
        <ResizablePanel
          key={panel.id}
          id={panel.id}
          position={panel.position}
          size={panel.size}
          constraints={panel.constraints}
          onResizeStart={() => handleResizeStart(panel.id)}
          onResize={(newSize) => handleResize(panel.id, newSize)}
          onResizeEnd={(finalSize) => handleResizeEnd(panel.id, finalSize)}
          showPreview={previewEnabled}
          showConstraints={constraintsEnabled}
        >
          <TestPanelContent 
            panel={panel} 
            onSelect={handlePanelSelect}
          />
        </ResizablePanel>
      ))}

      {/* Resize Preview Overlay */}
      {resizePreview && (
        <ResizePreview
          isVisible={resizePreview.visible}
          originalSize={resizePreview.originalSize}
          previewSize={resizePreview.previewSize}
          position={resizePreview.position}
          violations={resizePreview.violations}
          warnings={resizePreview.warnings}
          showDimensions={true}
          showGuidelines={true}
          showSnapIndicators={true}
          showConstraintViolations={true}
        />
      )}

      {/* Status indicators */}
      {resizingPanelId && (
        <div className="absolute bottom-4 right-4 px-4 py-2 bg-yellow-600/80 text-white text-sm rounded-lg backdrop-blur-sm">
          Resizing panel: {resizingPanelId}
        </div>
      )}
      
      {selectedPanelIds.length > 1 && (
        <div className="absolute bottom-16 right-4 px-4 py-2 bg-blue-600/80 text-white text-sm rounded-lg backdrop-blur-sm">
          {selectedPanelIds.length} panels selected
        </div>
      )}
    </div>
  );
};