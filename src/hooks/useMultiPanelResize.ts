import { useCallback, useRef, useState } from 'react';
import { Position, Size, PanelLayout } from '../types/panel';
import { ResizeConstraints, validateResizeOperation } from '../utils/resizeConstraints';

// Multi-panel resize configuration
interface MultiPanelResizeConfig {
  enableProportionalResize: boolean;
  enableGroupResize: boolean;
  handleOverflow: boolean;
  preserveLayout: boolean;
  distributionAlgorithm: 'proportional' | 'equal' | 'content-based';
  maxOperationsPerFrame: number;
}

// Resize operation data
interface ResizeOperation {
  id: string;
  panelId: string;
  originalSize: Size;
  targetSize: Size;
  priority: number;
  dependencies: string[];
  constraints: ResizeConstraints;
}

// Resize conflict resolution
interface ResizeConflict {
  operations: ResizeOperation[];
  conflictType: 'space' | 'constraints' | 'dependencies';
  resolution: 'queue' | 'merge' | 'reject';
}

// Default configuration
const DEFAULT_CONFIG: MultiPanelResizeConfig = {
  enableProportionalResize: true,
  enableGroupResize: true,
  handleOverflow: true,
  preserveLayout: true,
  distributionAlgorithm: 'proportional',
  maxOperationsPerFrame: 10,
};

export const useMultiPanelResize = (
  panels: PanelLayout[],
  onPanelUpdate: (panelId: string, updates: Partial<PanelLayout>) => void,
  config: Partial<MultiPanelResizeConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // State management
  const [resizeQueue, setResizeQueue] = useState<ResizeOperation[]>([]);
  const [activeOperations, setActiveOperations] = useState<Set<string>>(new Set());
  const [conflicts, setConflicts] = useState<ResizeConflict[]>([]);
  
  // Refs for performance
  const rafRef = useRef<number>();
  const operationHistory = useRef<ResizeOperation[]>([]);
  const layoutSnapshot = useRef<Map<string, PanelLayout>>(new Map());

  /**
   * Calculate proportional resize for adjacent panels
   */
  const calculateProportionalResize = useCallback((
    primaryPanel: PanelLayout,
    newSize: Size,
    adjacentPanels: PanelLayout[],
    container: { width: number; height: number }
  ): Array<{ panelId: string; newSize: Size }> => {
    const results: Array<{ panelId: string; newSize: Size }> = [];
    
    if (!finalConfig.enableProportionalResize || adjacentPanels.length === 0) {
      return results;
    }

    const deltaWidth = newSize.width - primaryPanel.size.width;
    const deltaHeight = newSize.height - primaryPanel.size.height;

    // Find panels that need to adjust based on the primary panel's resize
    const rightAdjacent = adjacentPanels.filter(p => 
      p.position.x >= primaryPanel.position.x + primaryPanel.size.width &&
      Math.abs(p.position.y - primaryPanel.position.y) < 50 // roughly aligned
    );

    const bottomAdjacent = adjacentPanels.filter(p =>
      p.position.y >= primaryPanel.position.y + primaryPanel.size.height &&
      Math.abs(p.position.x - primaryPanel.position.x) < 50 // roughly aligned
    );

    // Calculate proportional adjustments for right-adjacent panels
    if (deltaWidth !== 0 && rightAdjacent.length > 0) {
      const totalRightWidth = rightAdjacent.reduce((sum, p) => sum + p.size.width, 0);
      
      rightAdjacent.forEach(panel => {
        const proportion = panel.size.width / totalRightWidth;
        const adjustment = deltaWidth * proportion;
        
        const newPanelSize: Size = {
          width: Math.max(100, panel.size.width - adjustment), // Minimum width
          height: panel.size.height,
        };

        results.push({
          panelId: panel.id,
          newSize: newPanelSize,
        });
      });
    }

    // Calculate proportional adjustments for bottom-adjacent panels
    if (deltaHeight !== 0 && bottomAdjacent.length > 0) {
      const totalBottomHeight = bottomAdjacent.reduce((sum, p) => sum + p.size.height, 0);
      
      bottomAdjacent.forEach(panel => {
        const proportion = panel.size.height / totalBottomHeight;
        const adjustment = deltaHeight * proportion;
        
        const newPanelSize: Size = {
          width: panel.size.width,
          height: Math.max(100, panel.size.height - adjustment), // Minimum height
        };

        results.push({
          panelId: panel.id,
          newSize: newPanelSize,
        });
      });
    }

    return results;
  }, [finalConfig.enableProportionalResize]);

  /**
   * Handle panel group resizing
   */
  const calculateGroupResize = useCallback((
    selectedPanels: PanelLayout[],
    scaleFactor: { x: number; y: number },
    anchorPoint: Position = { x: 0, y: 0 }
  ): Array<{ panelId: string; newSize: Size; newPosition?: Position }> => {
    const results: Array<{ panelId: string; newSize: Size; newPosition?: Position }> = [];
    
    if (!finalConfig.enableGroupResize || selectedPanels.length <= 1) {
      return results;
    }

    selectedPanels.forEach(panel => {
      // Calculate new size
      const newSize: Size = {
        width: panel.size.width * scaleFactor.x,
        height: panel.size.height * scaleFactor.y,
      };

      // Calculate new position relative to anchor point
      const relativePosition = {
        x: panel.position.x - anchorPoint.x,
        y: panel.position.y - anchorPoint.y,
      };

      const newPosition: Position = {
        x: anchorPoint.x + (relativePosition.x * scaleFactor.x),
        y: anchorPoint.y + (relativePosition.y * scaleFactor.y),
      };

      results.push({
        panelId: panel.id,
        newSize,
        newPosition,
      });
    });

    return results;
  }, [finalConfig.enableGroupResize]);

  /**
   * Handle overflow when panels exceed container boundaries
   */
  const handleOverflow = useCallback((
    panelUpdates: Array<{ panelId: string; newSize: Size; newPosition?: Position }>,
    container: { width: number; height: number }
  ): Array<{ panelId: string; newSize: Size; newPosition?: Position }> => {
    if (!finalConfig.handleOverflow) {
      return panelUpdates;
    }

    return panelUpdates.map(update => {
      const panel = panels.find(p => p.id === update.panelId);
      if (!panel) return update;

      const position = update.newPosition || panel.position;
      let adjustedSize = { ...update.newSize };
      let adjustedPosition = { ...position };

      // Check right boundary
      if (position.x + adjustedSize.width > container.width) {
        adjustedSize.width = container.width - position.x;
      }

      // Check bottom boundary
      if (position.y + adjustedSize.height > container.height) {
        adjustedSize.height = container.height - position.y;
      }

      // Check left boundary (if position was also updated)
      if (adjustedPosition.x < 0) {
        adjustedSize.width += adjustedPosition.x; // Reduce width by overflow amount
        adjustedPosition.x = 0;
      }

      // Check top boundary (if position was also updated)
      if (adjustedPosition.y < 0) {
        adjustedSize.height += adjustedPosition.y; // Reduce height by overflow amount
        adjustedPosition.y = 0;
      }

      return {
        ...update,
        newSize: adjustedSize,
        newPosition: update.newPosition ? adjustedPosition : undefined,
      };
    });
  }, [finalConfig.handleOverflow, panels]);

  /**
   * Preserve layout relationships during complex resize operations
   */
  const preserveLayoutRelationships = useCallback((
    panelUpdates: Array<{ panelId: string; newSize: Size; newPosition?: Position }>
  ): Array<{ panelId: string; newSize: Size; newPosition?: Position }> => {
    if (!finalConfig.preserveLayout) {
      return panelUpdates;
    }

    // Create a map of current panel states
    const currentPanels = new Map(panels.map(p => [p.id, p]));
    
    // Apply updates to create a preview state
    const previewPanels = new Map(currentPanels);
    panelUpdates.forEach(update => {
      const current = previewPanels.get(update.panelId);
      if (current) {
        previewPanels.set(update.panelId, {
          ...current,
          size: update.newSize,
          position: update.newPosition || current.position,
        });
      }
    });

    // Check for layout violations and adjust
    const adjustedUpdates = panelUpdates.map(update => {
      const panel = previewPanels.get(update.panelId);
      if (!panel) return update;

      // Find overlapping panels and adjust positions
      const otherPanels = Array.from(previewPanels.values()).filter(p => p.id !== update.panelId);
      const position = update.newPosition || panel.position;
      
      // Simple overlap resolution - move down/right if overlapping
      let adjustedPosition = { ...position };
      
      for (const otherPanel of otherPanels) {
        const overlap = {
          x: Math.max(0, Math.min(position.x + update.newSize.width, otherPanel.position.x + otherPanel.size.width) - Math.max(position.x, otherPanel.position.x)),
          y: Math.max(0, Math.min(position.y + update.newSize.height, otherPanel.position.y + otherPanel.size.height) - Math.max(position.y, otherPanel.position.y)),
        };

        if (overlap.x > 0 && overlap.y > 0) {
          // Move the panel to avoid overlap
          adjustedPosition.x = otherPanel.position.x + otherPanel.size.width + 10;
        }
      }

      return {
        ...update,
        newPosition: update.newPosition ? adjustedPosition : undefined,
      };
    });

    return adjustedUpdates;
  }, [finalConfig.preserveLayout, panels]);

  /**
   * Distribute space when panels are resized
   */
  const distributeSpace = useCallback((
    panelUpdates: Array<{ panelId: string; newSize: Size }>,
    container: { width: number; height: number }
  ): Array<{ panelId: string; newSize: Size }> => {
    const algorithm = finalConfig.distributionAlgorithm;
    
    if (algorithm === 'equal') {
      // Distribute space equally among all panels
      const totalPanels = panelUpdates.length;
      const averageWidth = container.width / Math.ceil(Math.sqrt(totalPanels));
      const averageHeight = container.height / Math.ceil(Math.sqrt(totalPanels));

      return panelUpdates.map(update => ({
        ...update,
        newSize: {
          width: averageWidth,
          height: averageHeight,
        },
      }));
    }
    
    if (algorithm === 'content-based') {
      // Adjust sizes based on content requirements (mock implementation)
      return panelUpdates.map(update => {
        const panel = panels.find(p => p.id === update.panelId);
        const contentRatio = panel?.metadata?.title?.length || 1;
        const baseSize = 200;
        
        return {
          ...update,
          newSize: {
            width: baseSize + (contentRatio * 10),
            height: baseSize + (contentRatio * 5),
          },
        };
      });
    }
    
    // Default: proportional distribution
    return panelUpdates;
  }, [finalConfig.distributionAlgorithm, panels]);

  /**
   * Detect and resolve resize conflicts
   */
  const resolveConflicts = useCallback((
    operations: ResizeOperation[]
  ): { resolved: ResizeOperation[]; conflicts: ResizeConflict[] } => {
    const conflicts: ResizeConflict[] = [];
    const resolved: ResizeOperation[] = [];
    
    // Group operations by panel
    const operationsByPanel = new Map<string, ResizeOperation[]>();
    operations.forEach(op => {
      const existing = operationsByPanel.get(op.panelId) || [];
      existing.push(op);
      operationsByPanel.set(op.panelId, existing);
    });

    // Check for conflicts
    operationsByPanel.forEach((panelOps, panelId) => {
      if (panelOps.length > 1) {
        // Multiple operations on same panel - conflict
        const sortedOps = panelOps.sort((a, b) => b.priority - a.priority);
        
        conflicts.push({
          operations: panelOps,
          conflictType: 'space',
          resolution: 'queue',
        });
        
        // Resolve by taking highest priority operation
        resolved.push(sortedOps[0]);
      } else {
        resolved.push(panelOps[0]);
      }
    });

    return { resolved, conflicts };
  }, []);

  /**
   * Queue resize operations for batched processing
   */
  const queueResizeOperation = useCallback((
    panelId: string,
    targetSize: Size,
    constraints: ResizeConstraints,
    priority: number = 1
  ) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    const operation: ResizeOperation = {
      id: `resize-${panelId}-${Date.now()}`,
      panelId,
      originalSize: panel.size,
      targetSize,
      priority,
      dependencies: [],
      constraints,
    };

    setResizeQueue(prev => [...prev, operation]);
  }, [panels]);

  /**
   * Process resize operation queue
   */
  const processResizeQueue = useCallback(() => {
    if (resizeQueue.length === 0) return;

    // Cancel any pending frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const operationsToProcess = resizeQueue.slice(0, finalConfig.maxOperationsPerFrame);
      const { resolved, conflicts: newConflicts } = resolveConflicts(operationsToProcess);

      // Update conflicts state
      setConflicts(prev => [...prev, ...newConflicts]);

      // Process resolved operations
      resolved.forEach(operation => {
        const validation = validateResizeOperation(
          panels.find(p => p.id === operation.panelId)!,
          operation.targetSize,
          operation.constraints,
          panels.filter(p => p.id !== operation.panelId)
        );

        if (validation.isValid) {
          onPanelUpdate(operation.panelId, { size: validation.constrainedSize });
          operationHistory.current.push(operation);
        }
      });

      // Remove processed operations from queue
      setResizeQueue(prev => prev.slice(operationsToProcess.length));
      setActiveOperations(prev => {
        const newSet = new Set(prev);
        resolved.forEach(op => newSet.delete(op.id));
        return newSet;
      });
    });
  }, [
    resizeQueue,
    finalConfig.maxOperationsPerFrame,
    resolveConflicts,
    panels,
    onPanelUpdate
  ]);

  /**
   * Clear all queued operations
   */
  const clearResizeQueue = useCallback(() => {
    setResizeQueue([]);
    setActiveOperations(new Set());
    setConflicts([]);
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  /**
   * Get current queue status
   */
  const getQueueStatus = useCallback(() => {
    return {
      queueLength: resizeQueue.length,
      activeOperations: activeOperations.size,
      conflicts: conflicts.length,
      isProcessing: rafRef.current !== undefined,
    };
  }, [resizeQueue.length, activeOperations.size, conflicts.length]);

  return {
    // Core functions
    calculateProportionalResize,
    calculateGroupResize,
    handleOverflow,
    preserveLayoutRelationships,
    distributeSpace,
    
    // Queue management
    queueResizeOperation,
    processResizeQueue,
    clearResizeQueue,
    
    // Conflict resolution
    resolveConflicts,
    
    // Status
    getQueueStatus,
    conflicts,
    
    // History
    operationHistory: operationHistory.current,
  };
};