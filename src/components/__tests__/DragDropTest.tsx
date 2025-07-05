import React from 'react';
import { DragDropProvider } from '../providers/DragDropProvider';
import { DraggablePanel } from '../ui/DraggablePanel';
import { DropZone } from '../ui/DropZone';
import { DragFeedback } from '../ui/DragFeedback';
import { useDragOperations } from '../../hooks/useDragOperations';
import { PanelComponent } from '../../types/panel';

// Test panel data
const testPanels = [
  {
    id: 'test-panel-1',
    component: PanelComponent.SmartHub,
    position: { x: 100, y: 100 },
    size: { width: 300, height: 200 },
    zIndex: 1,
    visible: true,
    constraints: {
      minSize: { width: 200, height: 150 },
    },
    metadata: {
      title: 'Smart Hub Panel',
      description: 'Smart bookmarks and navigation',
      icon: '🔗',
      color: '#3B82F6',
    },
  },
  {
    id: 'test-panel-2',
    component: PanelComponent.AIChat,
    position: { x: 200, y: 200 },
    size: { width: 300, height: 200 },
    zIndex: 1,
    visible: true,
    constraints: {
      minSize: { width: 250, height: 180 },
    },
    metadata: {
      title: 'AI Chat Panel',
      description: 'Intelligent conversation assistant',
      icon: '🤖',
      color: '#10B981',
    },
  },
  {
    id: 'test-panel-3',
    component: PanelComponent.TaskManager,
    position: { x: 450, y: 150 },
    size: { width: 250, height: 300 },
    zIndex: 1,
    visible: true,
    constraints: {
      minSize: { width: 200, height: 250 },
    },
    metadata: {
      title: 'Task Manager',
      description: 'Project and task organization',
      icon: '📋',
      color: '#F59E0B',
    },
  },
];

// Test component content
const TestPanelContent: React.FC<{ panel: typeof testPanels[0] }> = ({ panel }) => {
  return (
    <div className="w-full h-full p-4 text-white">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-2xl">{panel.metadata.icon}</span>
        <h3 className="font-semibold text-lg">{panel.metadata.title}</h3>
      </div>
      <p className="text-white/70 text-sm mb-4">{panel.metadata.description}</p>
      
      <div className="space-y-2 text-xs">
        <div>Position: ({panel.position.x}, {panel.position.y})</div>
        <div>Size: {panel.size.width} × {panel.size.height}</div>
        <div>ID: {panel.id}</div>
      </div>
      
      {/* Drag handle indicator */}
      <div className="absolute top-2 right-2 cursor-grab active:cursor-grabbing">
        <div className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white/80">
          ⋮⋮
        </div>
      </div>
    </div>
  );
};

// Instructions panel
const InstructionsPanel: React.FC = () => {
  return (
    <div className="absolute top-4 left-4 w-80 bg-black/60 backdrop-blur-md rounded-lg p-4 text-white text-sm z-50">
      <h3 className="font-semibold mb-3 text-lg">Drag & Drop Test Instructions</h3>
      <div className="space-y-2">
        <p><strong>🖱️ Basic Dragging:</strong> Click and drag any panel to move it</p>
        <p><strong>🚫 Collision Detection:</strong> Panels should not overlap</p>
        <p><strong>📏 Boundaries:</strong> Panels stay within viewport</p>
        <p><strong>🎯 Drop Zones:</strong> Watch for highlighting when dragging</p>
        <p><strong>⌨️ Keyboard:</strong> Use Tab to navigate, arrow keys to move</p>
        <p><strong>🔄 Multi-Select:</strong> Hold Ctrl/Cmd to select multiple</p>
        <p><strong>⚡ Performance:</strong> Test with 5+ panels simultaneously</p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/20">
        <p className="text-xs text-white/60">
          ESC to cancel drag • Check console for debug info
        </p>
      </div>
    </div>
  );
};

// Main test component
export const DragDropTest: React.FC = () => {
  const [panels, setPanels] = React.useState(testPanels);
  
  // Initialize drag operations hook
  const {
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    isDragInProgress,
    undoLastDrag,
  } = useDragOperations({
    enableOptimisticUpdates: true,
    enableHistoryTracking: true,
    enableBatchUpdates: true,
  });

  // Handle panel position updates
  const handlePanelMove = React.useCallback((panelId: string, newPosition: { x: number; y: number }) => {
    setPanels(prevPanels => 
      prevPanels.map(panel => 
        panel.id === panelId 
          ? { ...panel, position: newPosition }
          : panel
      )
    );
  }, []);

  // Add more test panels for performance testing
  const addTestPanels = React.useCallback(() => {
    const newPanels = Array.from({ length: 3 }, (_, i) => ({
      id: `test-panel-${panels.length + i + 1}`,
      component: PanelComponent.Productivity,
      position: { 
        x: 100 + (i * 150), 
        y: 400 + (i * 50) 
      },
      size: { width: 200, height: 150 },
      zIndex: 1,
      visible: true,
      constraints: {
        minSize: { width: 150, height: 100 },
      },
      metadata: {
        title: `Test Panel ${panels.length + i + 1}`,
        description: 'Performance test panel',
        icon: '🧪',
        color: '#8B5CF6',
      },
    }));
    
    setPanels(prev => [...prev, ...newPanels]);
  }, [panels.length]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'z':
            event.preventDefault();
            undoLastDrag();
            break;
          case 'a':
            event.preventDefault();
            addTestPanels();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [undoLastDrag, addTestPanels]);

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      restrictToContainer={true}
    >
      <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Instructions */}
        <InstructionsPanel />
        
        {/* Control Panel */}
        <div className="absolute top-4 right-4 space-y-2 z-50">
          <button
            onClick={addTestPanels}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Add Test Panels (Ctrl+A)
          </button>
          <button
            onClick={undoLastDrag}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            Undo Last Drag (Ctrl+Z)
          </button>
        </div>

        {/* Workspace Drop Zone */}
        <DropZone
          id="main-workspace"
          type="workspace"
          className="absolute inset-0"
          acceptTypes={['panel']}
          onDropAccept={(draggedId, dropZoneId) => {
            console.log(`Panel ${draggedId} dropped on ${dropZoneId}`);
          }}
        >
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </DropZone>

        {/* Snap Zone Examples */}
        <DropZone
          id="snap-zone-left"
          type="panel-snap"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-48 h-32"
          acceptTypes={['panel']}
          highlight={{ color: 'emerald', style: 'dashed' }}
        >
          <div className="flex items-center justify-center h-full text-white/60 text-sm">
            Snap Zone Left
          </div>
        </DropZone>

        <DropZone
          id="snap-zone-right"
          type="panel-snap"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-48 h-32"
          acceptTypes={['panel']}
          highlight={{ color: 'purple', style: 'dashed' }}
        >
          <div className="flex items-center justify-center h-full text-white/60 text-sm">
            Snap Zone Right
          </div>
        </DropZone>

        {/* Trash Zone */}
        <DropZone
          id="trash-zone"
          type="trash"
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-24"
          acceptTypes={['panel']}
          onDropAccept={(draggedId) => {
            setPanels(prev => prev.filter(p => p.id !== draggedId));
            console.log(`Panel ${draggedId} deleted`);
          }}
        >
          <div className="flex items-center justify-center h-full text-red-400 text-2xl">
            🗑️
          </div>
        </DropZone>

        {/* Draggable Panels */}
        {panels.map((panel) => (
          <DraggablePanel
            key={panel.id}
            id={panel.id}
            position={panel.position}
            size={panel.size}
            panelData={panel}
            onDragEnd={(id, newPosition) => handlePanelMove(id, newPosition)}
            dragConstraints={{
              bounds: 'window',
              axis: 'both',
              snap: true,
              magnetic: true,
            }}
          >
            <TestPanelContent panel={panel} />
          </DraggablePanel>
        ))}

        {/* Drag Feedback System */}
        <DragFeedback
          showGhost={true}
          showSnapLines={true}
          showCollisionWarnings={true}
          showDistanceTooltips={true}
        />

        {/* Status Indicator */}
        {isDragInProgress && (
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600/80 text-white text-sm rounded-lg backdrop-blur-sm">
            Drag in progress...
          </div>
        )}
      </div>
    </DragDropProvider>
  );
};