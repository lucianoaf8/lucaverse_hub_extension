import { PanelLayout } from '../types/panel';

// Z-index layer types
export enum ZIndexLayer {
  Background = 0,
  Base = 1000,
  Panel = 2000,
  Group = 3000,
  Modal = 4000,
  Tooltip = 5000,
  Debug = 6000,
}

// Z-index operation types
export type ZIndexOperation =
  | 'bring-to-front'
  | 'send-to-back'
  | 'bring-forward'
  | 'send-backward'
  | 'set-layer'
  | 'auto-arrange';

// Z-index history entry
interface ZIndexHistoryEntry {
  id: string;
  timestamp: number;
  operation: ZIndexOperation;
  panelId: string;
  oldZIndex: number;
  newZIndex: number;
  description?: string;
}

// Layer information
interface LayerInfo {
  layer: ZIndexLayer;
  name: string;
  description: string;
  minZ: number;
  maxZ: number;
  panelCount: number;
  panels: PanelLayout[];
}

// Z-index conflict resolution
interface ZIndexConflict {
  panelIds: string[];
  zIndex: number;
  conflictType: 'duplicate' | 'overlap' | 'invalid';
  suggestedResolution: ZIndexOperation[];
}

/**
 * Z-Index Manager Class
 * Manages panel layering, stacking order, and z-index conflicts
 */
export class ZIndexManager {
  private static instance: ZIndexManager;
  private history: ZIndexHistoryEntry[] = [];
  private maxHistoryEntries = 100;
  private autoArrangeEnabled = true;
  private layerSpacing = 10; // Spacing between panels in same layer

  static getInstance(): ZIndexManager {
    if (!ZIndexManager.instance) {
      ZIndexManager.instance = new ZIndexManager();
    }
    return ZIndexManager.instance;
  }

  private constructor() {}

  /**
   * Bring panel to front (highest z-index in its layer)
   */
  bringToFront(
    panelId: string,
    panels: PanelLayout[],
    layer: ZIndexLayer = ZIndexLayer.Panel
  ): PanelLayout[] {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return panels;

    const layerPanels = panels.filter(p => this.getPanelLayer(p.zIndex) === layer);
    const maxZIndex = Math.max(...layerPanels.map(p => p.zIndex), layer);
    const newZIndex = maxZIndex + this.layerSpacing;

    this.addToHistory({
      operation: 'bring-to-front',
      panelId,
      oldZIndex: panel.zIndex,
      newZIndex,
      description: `Brought panel ${panelId} to front`,
    });

    return this.updatePanelZIndex(panels, panelId, newZIndex);
  }

  /**
   * Send panel to back (lowest z-index in its layer)
   */
  sendToBack(
    panelId: string,
    panels: PanelLayout[],
    layer: ZIndexLayer = ZIndexLayer.Panel
  ): PanelLayout[] {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return panels;

    const layerPanels = panels.filter(p => this.getPanelLayer(p.zIndex) === layer);
    const minZIndex = Math.min(...layerPanels.map(p => p.zIndex), layer + 999);
    const newZIndex = Math.max(layer, minZIndex - this.layerSpacing);

    this.addToHistory({
      operation: 'send-to-back',
      panelId,
      oldZIndex: panel.zIndex,
      newZIndex,
      description: `Sent panel ${panelId} to back`,
    });

    return this.updatePanelZIndex(panels, panelId, newZIndex);
  }

  /**
   * Bring panel forward by one level
   */
  bringForward(panelId: string, panels: PanelLayout[]): PanelLayout[] {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return panels;

    const currentLayer = this.getPanelLayer(panel.zIndex);
    const layerPanels = panels
      .filter(p => this.getPanelLayer(p.zIndex) === currentLayer)
      .sort((a, b) => a.zIndex - b.zIndex);

    const currentIndex = layerPanels.findIndex(p => p.id === panelId);
    if (currentIndex >= layerPanels.length - 1) return panels; // Already at front

    const nextPanel = layerPanels[currentIndex + 1];
    const newZIndex = nextPanel.zIndex + 1;

    this.addToHistory({
      operation: 'bring-forward',
      panelId,
      oldZIndex: panel.zIndex,
      newZIndex,
      description: `Brought panel ${panelId} forward`,
    });

    return this.updatePanelZIndex(panels, panelId, newZIndex);
  }

  /**
   * Send panel backward by one level
   */
  sendBackward(panelId: string, panels: PanelLayout[]): PanelLayout[] {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return panels;

    const currentLayer = this.getPanelLayer(panel.zIndex);
    const layerPanels = panels
      .filter(p => this.getPanelLayer(p.zIndex) === currentLayer)
      .sort((a, b) => a.zIndex - b.zIndex);

    const currentIndex = layerPanels.findIndex(p => p.id === panelId);
    if (currentIndex <= 0) return panels; // Already at back

    const previousPanel = layerPanels[currentIndex - 1];
    const newZIndex = Math.max(currentLayer, previousPanel.zIndex - 1);

    this.addToHistory({
      operation: 'send-backward',
      panelId,
      oldZIndex: panel.zIndex,
      newZIndex,
      description: `Sent panel ${panelId} backward`,
    });

    return this.updatePanelZIndex(panels, panelId, newZIndex);
  }

  /**
   * Set panel to specific layer
   */
  setToLayer(panelId: string, panels: PanelLayout[], targetLayer: ZIndexLayer): PanelLayout[] {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return panels;

    const layerPanels = panels.filter(p => this.getPanelLayer(p.zIndex) === targetLayer);
    const newZIndex =
      layerPanels.length > 0
        ? Math.max(...layerPanels.map(p => p.zIndex)) + this.layerSpacing
        : targetLayer + this.layerSpacing;

    this.addToHistory({
      operation: 'set-layer',
      panelId,
      oldZIndex: panel.zIndex,
      newZIndex,
      description: `Moved panel ${panelId} to ${ZIndexLayer[targetLayer]} layer`,
    });

    return this.updatePanelZIndex(panels, panelId, newZIndex);
  }

  /**
   * Auto-arrange panels to eliminate conflicts and optimize layering
   */
  autoArrange(panels: PanelLayout[]): PanelLayout[] {
    if (!this.autoArrangeEnabled) return panels;

    const conflicts = this.detectConflicts(panels);
    if (conflicts.length === 0) return panels;

    let updatedPanels = [...panels];

    // Group panels by layer
    const layerGroups = this.groupPanelsByLayer(panels);

    // Reorganize each layer
    Object.entries(layerGroups).forEach(([layer, layerPanels]) => {
      const layerValue = parseInt(layer) as ZIndexLayer;

      // Sort panels and reassign z-indices with proper spacing
      const sortedPanels = layerPanels.sort((a, b) => a.zIndex - b.zIndex);

      sortedPanels.forEach((panel, index) => {
        const newZIndex = layerValue + index * this.layerSpacing;
        updatedPanels = this.updatePanelZIndex(updatedPanels, panel.id, newZIndex);
      });
    });

    this.addToHistory({
      operation: 'auto-arrange',
      panelId: 'all',
      oldZIndex: 0,
      newZIndex: 0,
      description: 'Auto-arranged all panels',
    });

    return updatedPanels;
  }

  /**
   * Detect z-index conflicts
   */
  detectConflicts(panels: PanelLayout[]): ZIndexConflict[] {
    const conflicts: ZIndexConflict[] = [];
    const zIndexMap = new Map<number, string[]>();

    // Group panels by z-index
    panels.forEach(panel => {
      const panelIds = zIndexMap.get(panel.zIndex) || [];
      panelIds.push(panel.id);
      zIndexMap.set(panel.zIndex, panelIds);
    });

    // Find duplicates
    zIndexMap.forEach((panelIds, zIndex) => {
      if (panelIds.length > 1) {
        conflicts.push({
          panelIds,
          zIndex,
          conflictType: 'duplicate',
          suggestedResolution: ['auto-arrange'],
        });
      }
    });

    // Find invalid z-indices (outside layer bounds)
    panels.forEach(panel => {
      const layer = this.getPanelLayer(panel.zIndex);
      if (panel.zIndex < layer || panel.zIndex >= layer + 1000) {
        conflicts.push({
          panelIds: [panel.id],
          zIndex: panel.zIndex,
          conflictType: 'invalid',
          suggestedResolution: ['set-layer'],
        });
      }
    });

    return conflicts;
  }

  /**
   * Get layer information for all layers
   */
  getLayerInfo(panels: PanelLayout[]): LayerInfo[] {
    const layerGroups = this.groupPanelsByLayer(panels);

    return Object.values(ZIndexLayer)
      .filter(layer => typeof layer === 'number')
      .map(layer => {
        const layerValue = layer as ZIndexLayer;
        const layerPanels = layerGroups[layerValue] || [];
        const zIndices = layerPanels.map(p => p.zIndex);

        return {
          layer: layerValue,
          name: ZIndexLayer[layerValue],
          description: this.getLayerDescription(layerValue),
          minZ: zIndices.length > 0 ? Math.min(...zIndices) : layerValue,
          maxZ: zIndices.length > 0 ? Math.max(...zIndices) : layerValue,
          panelCount: layerPanels.length,
          panels: layerPanels,
        };
      });
  }

  /**
   * Get visual layer indicators for UI
   */
  getLayerIndicators(panels: PanelLayout[]): Array<{
    id: string;
    zIndex: number;
    layer: ZIndexLayer;
    layerName: string;
    panelId: string;
    panelName: string;
    isConflicted: boolean;
  }> {
    const conflicts = this.detectConflicts(panels);
    const conflictedPanels = new Set(conflicts.flatMap(c => c.panelIds));

    return panels
      .sort((a, b) => b.zIndex - a.zIndex)
      .map(panel => ({
        id: `indicator-${panel.id}`,
        zIndex: panel.zIndex,
        layer: this.getPanelLayer(panel.zIndex),
        layerName: ZIndexLayer[this.getPanelLayer(panel.zIndex)],
        panelId: panel.id,
        panelName: panel.metadata?.title || panel.id,
        isConflicted: conflictedPanels.has(panel.id),
      }));
  }

  /**
   * Optimize z-indices to prevent overflow
   */
  optimizeZIndices(panels: PanelLayout[]): PanelLayout[] {
    const MAX_Z_INDEX = 2147483647; // Maximum safe z-index value
    const highestZ = Math.max(...panels.map(p => p.zIndex));

    if (highestZ < MAX_Z_INDEX * 0.8) {
      return panels; // No optimization needed
    }

    console.log('Optimizing z-indices to prevent overflow');

    // Compress z-indices while maintaining relative order
    const sortedPanels = [...panels].sort((a, b) => a.zIndex - b.zIndex);
    let updatedPanels = [...panels];

    sortedPanels.forEach((panel, index) => {
      const layer = this.getPanelLayer(panel.zIndex);
      const newZIndex = layer + index * this.layerSpacing;
      updatedPanels = this.updatePanelZIndex(updatedPanels, panel.id, newZIndex);
    });

    this.addToHistory({
      operation: 'auto-arrange',
      panelId: 'optimization',
      oldZIndex: highestZ,
      newZIndex: Math.max(...updatedPanels.map(p => p.zIndex)),
      description: 'Optimized z-indices to prevent overflow',
    });

    return updatedPanels;
  }

  /**
   * Handle modal and overlay z-index management
   */
  reserveModalLayer(panels: PanelLayout[]): number {
    const modalPanels = panels.filter(p => this.getPanelLayer(p.zIndex) === ZIndexLayer.Modal);
    const maxModalZ =
      modalPanels.length > 0 ? Math.max(...modalPanels.map(p => p.zIndex)) : ZIndexLayer.Modal;

    return maxModalZ + this.layerSpacing;
  }

  /**
   * Get z-index history for undo/redo operations
   */
  getHistory(): ZIndexHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Undo last z-index operation
   */
  undoLastOperation(panels: PanelLayout[]): PanelLayout[] {
    if (this.history.length === 0) return panels;

    const lastEntry = this.history.pop()!;

    if (lastEntry.panelId === 'all' || lastEntry.panelId === 'optimization') {
      // Cannot undo bulk operations easily
      console.warn('Cannot undo bulk z-index operations');
      return panels;
    }

    return this.updatePanelZIndex(panels, lastEntry.panelId, lastEntry.oldZIndex);
  }

  /**
   * Clear z-index history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Configure z-index manager settings
   */
  configure(settings: {
    autoArrangeEnabled?: boolean;
    layerSpacing?: number;
    maxHistoryEntries?: number;
  }): void {
    if (settings.autoArrangeEnabled !== undefined) {
      this.autoArrangeEnabled = settings.autoArrangeEnabled;
    }
    if (settings.layerSpacing !== undefined) {
      this.layerSpacing = settings.layerSpacing;
    }
    if (settings.maxHistoryEntries !== undefined) {
      this.maxHistoryEntries = settings.maxHistoryEntries;
    }
  }

  // Private helper methods

  private updatePanelZIndex(
    panels: PanelLayout[],
    panelId: string,
    newZIndex: number
  ): PanelLayout[] {
    return panels.map(panel => (panel.id === panelId ? { ...panel, zIndex: newZIndex } : panel));
  }

  private getPanelLayer(zIndex: number): ZIndexLayer {
    if (zIndex >= ZIndexLayer.Debug) return ZIndexLayer.Debug;
    if (zIndex >= ZIndexLayer.Tooltip) return ZIndexLayer.Tooltip;
    if (zIndex >= ZIndexLayer.Modal) return ZIndexLayer.Modal;
    if (zIndex >= ZIndexLayer.Group) return ZIndexLayer.Group;
    if (zIndex >= ZIndexLayer.Panel) return ZIndexLayer.Panel;
    if (zIndex >= ZIndexLayer.Base) return ZIndexLayer.Base;
    return ZIndexLayer.Background;
  }

  private getLayerDescription(layer: ZIndexLayer): string {
    const descriptions = {
      [ZIndexLayer.Background]: 'Background elements',
      [ZIndexLayer.Base]: 'Base application layer',
      [ZIndexLayer.Panel]: 'Main content panels',
      [ZIndexLayer.Group]: 'Panel groups and containers',
      [ZIndexLayer.Modal]: 'Modal dialogs and popups',
      [ZIndexLayer.Tooltip]: 'Tooltips and temporary overlays',
      [ZIndexLayer.Debug]: 'Debug and development tools',
    };
    return descriptions[layer];
  }

  private groupPanelsByLayer(panels: PanelLayout[]): Record<ZIndexLayer, PanelLayout[]> {
    const groups: Record<ZIndexLayer, PanelLayout[]> = {
      [ZIndexLayer.Background]: [],
      [ZIndexLayer.Base]: [],
      [ZIndexLayer.Panel]: [],
      [ZIndexLayer.Group]: [],
      [ZIndexLayer.Modal]: [],
      [ZIndexLayer.Tooltip]: [],
      [ZIndexLayer.Debug]: [],
    };

    panels.forEach(panel => {
      const layer = this.getPanelLayer(panel.zIndex);
      groups[layer].push(panel);
    });

    return groups;
  }

  private addToHistory(entry: Omit<ZIndexHistoryEntry, 'id' | 'timestamp'>): void {
    const historyEntry: ZIndexHistoryEntry = {
      id: `z-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...entry,
    };

    this.history.push(historyEntry);

    // Trim history if it exceeds maximum entries
    if (this.history.length > this.maxHistoryEntries) {
      this.history = this.history.slice(-this.maxHistoryEntries);
    }
  }
}

// Export singleton instance
export const zIndexManager = ZIndexManager.getInstance();

// Utility functions for common z-index operations
export const zIndexUtils = {
  /**
   * Get next available z-index in layer
   */
  getNextZIndex(panels: PanelLayout[], layer: ZIndexLayer = ZIndexLayer.Panel): number {
    const layerPanels = panels.filter(p =>
      zIndexManager.getPanelLayer
        ? (zIndexManager as any).getPanelLayer(p.zIndex) === layer
        : p.zIndex >= layer && p.zIndex < layer + 1000
    );

    const maxZ = layerPanels.length > 0 ? Math.max(...layerPanels.map(p => p.zIndex)) : layer;

    return maxZ + 10;
  },

  /**
   * Bring multiple panels to front
   */
  bringMultipleToFront(panelIds: string[], panels: PanelLayout[]): PanelLayout[] {
    let result = panels;
    panelIds.forEach(id => {
      result = zIndexManager.bringToFront(id, result);
    });
    return result;
  },

  /**
   * Check if panel is on top in its layer
   */
  isPanelOnTop(panelId: string, panels: PanelLayout[]): boolean {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return false;

    const layerPanels = panels.filter(
      p => p.zIndex >= ZIndexLayer.Panel && p.zIndex < ZIndexLayer.Group
    );

    const maxZ = Math.max(...layerPanels.map(p => p.zIndex));
    return panel.zIndex === maxZ;
  },

  /**
   * Get stacking order of panels
   */
  getStackingOrder(panels: PanelLayout[]): string[] {
    return panels.sort((a, b) => a.zIndex - b.zIndex).map(p => p.id);
  },
};
