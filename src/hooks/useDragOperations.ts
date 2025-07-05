import { useCallback, useRef } from 'react';
import { DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core';
import { Position } from '../types/panel';
import { useLayoutStore } from '../stores/layoutStore';
import { useDragDropContext } from '../components/providers/DragDropProvider';
import { 
  detectCollisions, 
  calculateDragBounds,
  DEFAULT_CONSTRAINTS 
} from '../utils/dragConstraints';

// Hook configuration interface
interface UseDragOperationsConfig {
  enableOptimisticUpdates?: boolean;
  enableHistoryTracking?: boolean;
  enableBatchUpdates?: boolean;
  debounceMs?: number;
  throttleMs?: number;
  maxHistoryEntries?: number;
}

// Drag operation history entry
interface DragHistoryEntry {
  id: string;
  timestamp: number;
  panelId: string;
  fromPosition: Position;
  toPosition: Position;
  operation: 'move' | 'batch-move' | 'group-move';
}

// Custom hook for managing drag operations with layout store integration
export const useDragOperations = (config: UseDragOperationsConfig = {}) => {
  const {
    enableOptimisticUpdates = true,
    enableHistoryTracking = true,
    enableBatchUpdates = true,
    debounceMs = 16, // ~60fps
    throttleMs = 32, // ~30fps for throttled operations
    maxHistoryEntries = 50,
  } = config;

  // Store references
  const layoutStore = useLayoutStore();
  const { dragState } = useDragDropContext();
  
  // Local state references
  const optimisticUpdates = useRef(new Map<string, Position>());
  const dragHistory = useRef<DragHistoryEntry[]>([]);
  const batchedUpdates = useRef(new Map<string, Position>());
  const debounceTimer = useRef<NodeJS.Timeout>();
  const throttleTimer = useRef<NodeJS.Timeout>();

  // Get current panels and viewport
  const panels = layoutStore.panels;
  const selectedPanelIds = layoutStore.selectedPanelIds;
  const viewport = { width: window.innerWidth, height: window.innerHeight };

  // Add entry to drag history
  const addToHistory = useCallback((entry: Omit<DragHistoryEntry, 'id' | 'timestamp'>) => {
    if (!enableHistoryTracking) return;
    
    const historyEntry: DragHistoryEntry = {
      id: `drag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...entry,
    };
    
    dragHistory.current.push(historyEntry);
    
    // Keep history within limits
    if (dragHistory.current.length > maxHistoryEntries) {
      dragHistory.current.shift();
    }
  }, [enableHistoryTracking, maxHistoryEntries]);

  // Apply optimistic update for smooth feedback
  const applyOptimisticUpdate = useCallback((panelId: string, newPosition: Position) => {
    if (!enableOptimisticUpdates) return;
    
    optimisticUpdates.current.set(panelId, newPosition);
    
    // Clear debounce timer and set new one
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      optimisticUpdates.current.clear();
    }, debounceMs);
  }, [enableOptimisticUpdates, debounceMs]);

  // Batch multiple updates for performance
  const batchUpdate = useCallback((panelId: string, newPosition: Position) => {
    if (!enableBatchUpdates) {
      layoutStore.updatePanel(panelId, { position: newPosition });
      return;
    }
    
    batchedUpdates.current.set(panelId, newPosition);
    
    // Clear existing timer
    if (throttleTimer.current) {
      clearTimeout(throttleTimer.current);
    }
    
    // Apply batched updates after throttle period
    throttleTimer.current = setTimeout(() => {
      const updates = Array.from(batchedUpdates.current.entries());
      
      // Apply all batched updates at once
      updates.forEach(([id, position]) => {
        layoutStore.updatePanel(id, { position });
      });
      
      batchedUpdates.current.clear();
    }, throttleMs);
  }, [enableBatchUpdates, throttleMs, layoutStore]);

  // Handle drag start with state management and validation
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const panelId = active.id as string;
    const panel = layoutStore.getPanel(panelId);
    
    if (!panel) return;
    
    // Start drag in layout store
    layoutStore.startDrag(panelId, panel.position);
    
    // Select panel if not already selected
    if (!selectedPanelIds.includes(panelId)) {
      layoutStore.selectPanel(panelId);
    }
    
    // Clear any pending updates
    optimisticUpdates.current.clear();
    batchedUpdates.current.clear();
    
    console.log(`Drag started for panel: ${panelId}`);
  }, [layoutStore, selectedPanelIds]);

  // Handle drag move with real-time updates and constraint checking
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, delta } = event;
    const panelId = active.id as string;
    const panel = layoutStore.getPanel(panelId);
    
    if (!panel || !delta) return;
    
    // Calculate new position
    const newPosition: Position = {
      x: panel.position.x + delta.x,
      y: panel.position.y + delta.y,
    };
    
    // Apply constraints
    const bounds = calculateDragBounds(panel, viewport, panels);
    const constrainedPosition: Position = {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, newPosition.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, newPosition.y)),
    };
    
    // Check for collisions if enabled
    const hasCollision = detectCollisions(
      { position: constrainedPosition, size: panel.size },
      panels.filter(p => p.id !== panelId),
      DEFAULT_CONSTRAINTS.collisionRules.minimumGap
    );
    
    // Apply position if no collision
    if (!hasCollision) {
      // Update layout store drag state
      layoutStore.updateDrag(constrainedPosition);
      
      // Apply optimistic update for visual feedback
      applyOptimisticUpdate(panelId, constrainedPosition);
      
      // Handle multi-panel drag if multiple panels selected
      if (selectedPanelIds.length > 1 && selectedPanelIds.includes(panelId)) {
        const deltaX = constrainedPosition.x - panel.position.x;
        const deltaY = constrainedPosition.y - panel.position.y;
        
        selectedPanelIds.forEach(id => {
          if (id !== panelId) {
            const otherPanel = layoutStore.getPanel(id);
            if (otherPanel) {
              const otherNewPosition: Position = {
                x: otherPanel.position.x + deltaX,
                y: otherPanel.position.y + deltaY,
              };
              
              // Apply constraints to other panels too
              const otherBounds = calculateDragBounds(otherPanel, viewport, panels);
              const otherConstrainedPosition: Position = {
                x: Math.max(otherBounds.minX, Math.min(otherBounds.maxX, otherNewPosition.x)),
                y: Math.max(otherBounds.minY, Math.min(otherBounds.maxY, otherNewPosition.y)),
              };
              
              applyOptimisticUpdate(id, otherConstrainedPosition);
            }
          }
        });
      }
    }
  }, [layoutStore, panels, viewport, selectedPanelIds, applyOptimisticUpdate]);

  // Handle drag end with final positioning and history tracking
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const panelId = active.id as string;
    const panel = layoutStore.getPanel(panelId);
    
    if (!panel) return;
    
    // Get final position from optimistic updates or current position
    const finalPosition = optimisticUpdates.current.get(panelId) || panel.position;
    
    // Add to history before applying final update
    addToHistory({
      panelId,
      fromPosition: panel.position,
      toPosition: finalPosition,
      operation: selectedPanelIds.length > 1 ? 'group-move' : 'move',
    });
    
    // Apply final position update
    batchUpdate(panelId, finalPosition);
    
    // Handle multi-panel group drag completion
    if (selectedPanelIds.length > 1 && selectedPanelIds.includes(panelId)) {
      const deltaX = finalPosition.x - panel.position.x;
      const deltaY = finalPosition.y - panel.position.y;
      
      selectedPanelIds.forEach(id => {
        if (id !== panelId) {
          const otherPanel = layoutStore.getPanel(id);
          if (otherPanel) {
            const otherFinalPosition = optimisticUpdates.current.get(id) || {
              x: otherPanel.position.x + deltaX,
              y: otherPanel.position.y + deltaY,
            };
            
            batchUpdate(id, otherFinalPosition);
            
            addToHistory({
              panelId: id,
              fromPosition: otherPanel.position,
              toPosition: otherFinalPosition,
              operation: 'group-move',
            });
          }
        }
      });
    }
    
    // End drag in layout store
    layoutStore.endDrag();
    
    // Clear optimistic updates
    optimisticUpdates.current.clear();
    
    console.log(`Drag ended for panel: ${panelId}`, { finalPosition, dropZone: over?.id });
  }, [layoutStore, selectedPanelIds, addToHistory, batchUpdate]);

  // Undo last drag operation
  const undoLastDrag = useCallback(() => {
    if (dragHistory.current.length === 0) return;
    
    const lastEntry = dragHistory.current.pop();
    if (!lastEntry) return;
    
    // Restore previous position
    layoutStore.updatePanel(lastEntry.panelId, { 
      position: lastEntry.fromPosition 
    });
    
    console.log(`Undid drag operation for panel: ${lastEntry.panelId}`);
  }, [layoutStore]);

  // Redo drag operation (if implementing redo functionality)
  const getUndoHistory = useCallback(() => {
    return [...dragHistory.current];
  }, []);

  // Clear drag history
  const clearDragHistory = useCallback(() => {
    dragHistory.current = [];
  }, []);

  // Get current optimistic position for a panel
  const getOptimisticPosition = useCallback((panelId: string): Position | null => {
    return optimisticUpdates.current.get(panelId) || null;
  }, []);

  // Check if drag operations are currently in progress
  const isDragInProgress = dragState.isDragging || layoutStore.dragState.isDragging;

  return {
    // Event handlers for @dnd-kit integration
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    
    // History management
    undoLastDrag,
    getUndoHistory,
    clearDragHistory,
    
    // Optimistic updates
    getOptimisticPosition,
    
    // State queries
    isDragInProgress,
    dragHistory: dragHistory.current,
    
    // Direct store access for advanced use cases
    layoutStore,
  };
};