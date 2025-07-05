import { PanelLayout, PanelComponent, Position, Size } from '../types/panel';
import { PanelGroup } from '../components/ui/PanelGroup';
import { WorkspaceManager, WorkspaceConfig } from './workspaceManager';
import { ZIndexManager, ZIndexLayer, zIndexUtils } from './zIndexManager';
import { nanoid } from 'nanoid';

// Panel search and filter criteria
export interface PanelSearchCriteria {
  query?: string;
  component?: PanelComponent;
  visible?: boolean;
  locked?: boolean;
  zIndexRange?: { min: number; max: number };
  sizeRange?: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
  positionRange?: { minX: number; maxX: number; minY: number; maxY: number };
  tags?: string[];
  metadata?: Record<string, any>;
}

// Bulk operation result
export interface BulkOperationResult {
  successful: string[];
  failed: Array<{ panelId: string; error: string }>;
  totalProcessed: number;
  operationType: string;
}

// Layout optimization options
export interface LayoutOptimizationOptions {
  algorithm: 'auto-arrange' | 'minimize-gaps' | 'grid-align' | 'cascade' | 'tile';
  respectConstraints: boolean;
  maintainAspectRatio: boolean;
  padding: number;
  groupSpacing: number;
  allowOverlap: boolean;
}

// Panel statistics
export interface PanelStatistics {
  totalPanels: number;
  visiblePanels: number;
  hiddenPanels: number;
  lockedPanels: number;
  componentCounts: Record<PanelComponent, number>;
  averageSize: Size;
  totalArea: number;
  usedViewportPercentage: number;
  overlappingPanels: number;
  groupedPanels: number;
  zIndexConflicts: number;
}

// Panel validation result
export interface PanelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  panelId: string;
}

// Panel performance metrics
export interface PanelPerformanceMetrics {
  renderTime: number;
  updateFrequency: number;
  memoryUsage: number;
  lastRenderTime: number;
  errorCount: number;
  interactionCount: number;
}

/**
 * PanelManager - Comprehensive panel management utility
 * Coordinates all panel operations including CRUD, layout, grouping, and optimization
 */
export class PanelManager {
  private static instance: PanelManager;
  private workspaceManager: WorkspaceManager;
  private zIndexManager: ZIndexManager;
  private panels: Map<string, PanelLayout> = new Map();
  private groups: Map<string, PanelGroup> = new Map();
  private selectedPanelIds: Set<string> = new Set();
  private clipboard: PanelLayout[] = [];
  private performanceMetrics: Map<string, PanelPerformanceMetrics> = new Map();
  private validationCache: Map<string, PanelValidationResult> = new Map();

  static getInstance(): PanelManager {
    if (!PanelManager.instance) {
      PanelManager.instance = new PanelManager();
    }
    return PanelManager.instance;
  }

  private constructor() {
    this.workspaceManager = WorkspaceManager.getInstance();
    this.zIndexManager = ZIndexManager.getInstance();
    this.setupPerformanceMonitoring();
  }

  // ===============================
  // CORE PANEL OPERATIONS
  // ===============================

  /**
   * Create a new panel with automatic positioning and validation
   */
  createPanel(
    component: PanelComponent,
    options: {
      position?: Position;
      size?: Size;
      metadata?: any;
      constraints?: any;
      autoPosition?: boolean;
      layer?: ZIndexLayer;
    } = {}
  ): string {
    const panelId = `panel-${component.toLowerCase()}-${nanoid()}`;

    const defaultPositions = this.calculateOptimalPosition(options.size);
    const position = options.position || defaultPositions;
    const size = options.size || this.getDefaultSize(component);
    const zIndex = options.layer
      ? zIndexUtils.getNextZIndex(this.getPanelArray(), options.layer)
      : zIndexUtils.getNextZIndex(this.getPanelArray());

    const panel: PanelLayout = {
      id: panelId,
      component,
      position,
      size,
      zIndex,
      visible: true,
      constraints: {
        minSize: this.getMinSize(component),
        maxSize: { width: 2000, height: 1500 },
        ...options.constraints,
      },
      metadata: {
        title: this.getDefaultTitle(component),
        icon: this.getDefaultIcon(component),
        color: this.getDefaultColor(component),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        locked: false,
        ...options.metadata,
      },
    };

    // Validate panel before adding
    const validation = this.validatePanel(panel);
    if (!validation.isValid) {
      throw new Error(`Invalid panel configuration: ${validation.errors.join(', ')}`);
    }

    this.panels.set(panelId, panel);
    this.initializePerformanceMetrics(panelId);

    console.log(`Created panel ${panelId} (${component})`);
    return panelId;
  }

  /**
   * Update panel with validation and conflict resolution
   */
  updatePanel(panelId: string, updates: Partial<PanelLayout>): boolean {
    const existingPanel = this.panels.get(panelId);
    if (!existingPanel) return false;

    const updatedPanel: PanelLayout = {
      ...existingPanel,
      ...updates,
      metadata: {
        ...existingPanel.metadata,
        ...updates.metadata,
        updatedAt: Date.now(),
      },
    };

    // Validate updated panel
    const validation = this.validatePanel(updatedPanel);
    if (!validation.isValid) {
      console.warn(`Panel update validation failed for ${panelId}:`, validation.errors);
      return false;
    }

    // Check for conflicts
    const conflicts = this.detectCollisions(
      updatedPanel,
      this.getPanelArray().filter(p => p.id !== panelId)
    );
    if (conflicts.length > 0 && !updates.position) {
      console.warn(`Panel update would cause collisions for ${panelId}`);
    }

    this.panels.set(panelId, updatedPanel);
    this.updatePerformanceMetrics(panelId);
    this.clearValidationCache(panelId);

    return true;
  }

  /**
   * Delete panel with cleanup and dependency checks
   */
  deletePanel(panelId: string): boolean {
    const panel = this.panels.get(panelId);
    if (!panel) return false;

    // Check for group dependencies
    const dependentGroups = Array.from(this.groups.values()).filter(group =>
      group.panelIds.includes(panelId)
    );

    // Remove from groups
    dependentGroups.forEach(group => {
      this.removePanelFromGroup(panelId, group.id);
    });

    // Clean up references
    this.panels.delete(panelId);
    this.selectedPanelIds.delete(panelId);
    this.performanceMetrics.delete(panelId);
    this.clearValidationCache(panelId);

    console.log(`Deleted panel ${panelId}`);
    return true;
  }

  /**
   * Duplicate panel with smart positioning
   */
  duplicatePanel(panelId: string, offset: Position = { x: 20, y: 20 }): string | null {
    const originalPanel = this.panels.get(panelId);
    if (!originalPanel) return null;

    const newId = `panel-${originalPanel.component.toLowerCase()}-${nanoid()}`;
    const newPosition = {
      x: originalPanel.position.x + offset.x,
      y: originalPanel.position.y + offset.y,
    };

    // Ensure new position doesn't cause conflicts
    const safePosition = this.findNonConflictingPosition(newPosition, originalPanel.size);

    const duplicatedPanel: PanelLayout = {
      ...originalPanel,
      id: newId,
      position: safePosition,
      zIndex: zIndexUtils.getNextZIndex(this.getPanelArray()),
      metadata: {
        ...originalPanel.metadata,
        title: `${originalPanel.metadata?.title || originalPanel.id} (Copy)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    this.panels.set(newId, duplicatedPanel);
    this.initializePerformanceMetrics(newId);

    console.log(`Duplicated panel ${panelId} as ${newId}`);
    return newId;
  }

  // ===============================
  // BULK OPERATIONS
  // ===============================

  /**
   * Perform bulk operations on multiple panels
   */
  bulkOperation(
    panelIds: string[],
    operation: 'delete' | 'hide' | 'show' | 'lock' | 'unlock' | 'duplicate',
    options: any = {}
  ): BulkOperationResult {
    const result: BulkOperationResult = {
      successful: [],
      failed: [],
      totalProcessed: panelIds.length,
      operationType: operation,
    };

    panelIds.forEach(panelId => {
      try {
        let success = false;

        switch (operation) {
          case 'delete':
            success = this.deletePanel(panelId);
            break;
          case 'hide':
            success = this.updatePanel(panelId, { visible: false });
            break;
          case 'show':
            success = this.updatePanel(panelId, { visible: true });
            break;
          case 'lock':
            success = this.updatePanel(panelId, {
              metadata: { locked: true },
            });
            break;
          case 'unlock':
            success = this.updatePanel(panelId, {
              metadata: { locked: false },
            });
            break;
          case 'duplicate':
            const newId = this.duplicatePanel(panelId, options.offset);
            success = newId !== null;
            if (success && newId) {
              result.successful.push(newId);
            }
            break;
        }

        if (success) {
          result.successful.push(panelId);
        } else {
          result.failed.push({ panelId, error: `Failed to ${operation} panel` });
        }
      } catch (error) {
        result.failed.push({
          panelId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    console.log(
      `Bulk ${operation} completed: ${result.successful.length} successful, ${result.failed.length} failed`
    );
    return result;
  }

  /**
   * Select multiple panels
   */
  selectPanels(panelIds: string[], addToSelection = false): void {
    if (!addToSelection) {
      this.selectedPanelIds.clear();
    }

    panelIds.forEach(id => {
      if (this.panels.has(id)) {
        this.selectedPanelIds.add(id);
      }
    });
  }

  /**
   * Get selected panels
   */
  getSelectedPanels(): PanelLayout[] {
    return Array.from(this.selectedPanelIds)
      .map(id => this.panels.get(id))
      .filter((panel): panel is PanelLayout => panel !== undefined);
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedPanelIds.clear();
  }

  /**
   * Select all panels
   */
  selectAll(): void {
    this.selectedPanelIds.clear();
    this.panels.forEach((_, id) => this.selectedPanelIds.add(id));
  }

  /**
   * Invert selection
   */
  invertSelection(): void {
    const allIds = new Set(this.panels.keys());
    const currentSelected = new Set(this.selectedPanelIds);

    this.selectedPanelIds.clear();
    allIds.forEach(id => {
      if (!currentSelected.has(id)) {
        this.selectedPanelIds.add(id);
      }
    });
  }

  // ===============================
  // LAYOUT OPTIMIZATION
  // ===============================

  /**
   * Optimize layout using specified algorithm
   */
  optimizeLayout(options: LayoutOptimizationOptions): PanelLayout[] {
    const panels = this.getPanelArray();

    switch (options.algorithm) {
      case 'auto-arrange':
        return this.autoArrangeLayout(panels, options);
      case 'minimize-gaps':
        return this.minimizeGapsLayout(panels, options);
      case 'grid-align':
        return this.gridAlignLayout(panels, options);
      case 'cascade':
        return this.cascadeLayout(panels, options);
      case 'tile':
        return this.tileLayout(panels, options);
      default:
        return panels;
    }
  }

  /**
   * Auto-arrange panels to minimize overlaps and optimize space
   */
  private autoArrangeLayout(
    panels: PanelLayout[],
    options: LayoutOptimizationOptions
  ): PanelLayout[] {
    const viewport = { width: 1920, height: 1080 }; // Could be dynamic
    const sortedPanels = [...panels].sort(
      (a, b) => a.size.width * a.size.height - b.size.width * b.size.height
    );

    let currentX = options.padding;
    let currentY = options.padding;
    let rowHeight = 0;

    return sortedPanels.map(panel => {
      // Check if panel fits in current row
      if (currentX + panel.size.width > viewport.width - options.padding) {
        currentX = options.padding;
        currentY += rowHeight + options.groupSpacing;
        rowHeight = 0;
      }

      const newPosition = { x: currentX, y: currentY };
      currentX += panel.size.width + options.groupSpacing;
      rowHeight = Math.max(rowHeight, panel.size.height);

      return {
        ...panel,
        position: newPosition,
      };
    });
  }

  /**
   * Grid-align layout
   */
  private gridAlignLayout(
    panels: PanelLayout[],
    options: LayoutOptimizationOptions
  ): PanelLayout[] {
    const gridSize = 50; // Could be configurable

    return panels.map(panel => ({
      ...panel,
      position: {
        x: Math.round(panel.position.x / gridSize) * gridSize,
        y: Math.round(panel.position.y / gridSize) * gridSize,
      },
    }));
  }

  /**
   * Cascade layout
   */
  private cascadeLayout(panels: PanelLayout[], options: LayoutOptimizationOptions): PanelLayout[] {
    const offset = 30;

    return panels.map((panel, index) => ({
      ...panel,
      position: {
        x: options.padding + index * offset,
        y: options.padding + index * offset,
      },
    }));
  }

  /**
   * Tile layout
   */
  private tileLayout(panels: PanelLayout[], options: LayoutOptimizationOptions): PanelLayout[] {
    const viewport = { width: 1920, height: 1080 };
    const cols = Math.ceil(Math.sqrt(panels.length));
    const rows = Math.ceil(panels.length / cols);

    const tileWidth =
      (viewport.width - options.padding * 2 - (cols - 1) * options.groupSpacing) / cols;
    const tileHeight =
      (viewport.height - options.padding * 2 - (rows - 1) * options.groupSpacing) / rows;

    return panels.map((panel, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      return {
        ...panel,
        position: {
          x: options.padding + col * (tileWidth + options.groupSpacing),
          y: options.padding + row * (tileHeight + options.groupSpacing),
        },
        size: options.maintainAspectRatio ? panel.size : { width: tileWidth, height: tileHeight },
      };
    });
  }

  /**
   * Minimize gaps between panels
   */
  private minimizeGapsLayout(
    panels: PanelLayout[],
    options: LayoutOptimizationOptions
  ): PanelLayout[] {
    // Implement gap minimization algorithm
    // This is a simplified version - a real implementation would use more sophisticated packing algorithms
    return this.autoArrangeLayout(panels, { ...options, groupSpacing: 5 });
  }

  // ===============================
  // SEARCH AND FILTERING
  // ===============================

  /**
   * Search panels by various criteria
   */
  searchPanels(criteria: PanelSearchCriteria): PanelLayout[] {
    return this.getPanelArray().filter(panel => {
      // Query filter
      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        const searchableText = [
          panel.id,
          panel.metadata?.title,
          panel.metadata?.description,
          panel.component,
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      // Component filter
      if (criteria.component && panel.component !== criteria.component) {
        return false;
      }

      // Visibility filter
      if (criteria.visible !== undefined && panel.visible !== criteria.visible) {
        return false;
      }

      // Lock filter
      if (criteria.locked !== undefined && panel.metadata?.locked !== criteria.locked) {
        return false;
      }

      // Z-index range filter
      if (criteria.zIndexRange) {
        const { min, max } = criteria.zIndexRange;
        if (panel.zIndex < min || panel.zIndex > max) return false;
      }

      // Size range filter
      if (criteria.sizeRange) {
        const { minWidth, maxWidth, minHeight, maxHeight } = criteria.sizeRange;
        if (
          panel.size.width < minWidth ||
          panel.size.width > maxWidth ||
          panel.size.height < minHeight ||
          panel.size.height > maxHeight
        )
          return false;
      }

      // Position range filter
      if (criteria.positionRange) {
        const { minX, maxX, minY, maxY } = criteria.positionRange;
        if (
          panel.position.x < minX ||
          panel.position.x > maxX ||
          panel.position.y < minY ||
          panel.position.y > maxY
        )
          return false;
      }

      // Tags filter
      if (criteria.tags && criteria.tags.length > 0) {
        const panelTags = panel.metadata?.tags || [];
        if (!criteria.tags.some(tag => panelTags.includes(tag))) return false;
      }

      return true;
    });
  }

  /**
   * Filter panels by component type
   */
  filterByComponent(component: PanelComponent): PanelLayout[] {
    return this.getPanelArray().filter(panel => panel.component === component);
  }

  /**
   * Get panels in viewport
   */
  getPanelsInViewport(viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): PanelLayout[] {
    return this.getPanelArray().filter(panel => {
      const panelRight = panel.position.x + panel.size.width;
      const panelBottom = panel.position.y + panel.size.height;
      const viewportRight = viewport.x + viewport.width;
      const viewportBottom = viewport.y + viewport.height;

      return !(
        panel.position.x > viewportRight ||
        panelRight < viewport.x ||
        panel.position.y > viewportBottom ||
        panelBottom < viewport.y
      );
    });
  }

  // ===============================
  // STATISTICS AND ANALYTICS
  // ===============================

  /**
   * Get comprehensive panel statistics
   */
  getStatistics(): PanelStatistics {
    const panels = this.getPanelArray();
    const visiblePanels = panels.filter(p => p.visible);
    const hiddenPanels = panels.filter(p => !p.visible);
    const lockedPanels = panels.filter(p => p.metadata?.locked);

    // Component counts
    const componentCounts = Object.values(PanelComponent).reduce(
      (acc, component) => ({
        ...acc,
        [component]: panels.filter(p => p.component === component).length,
      }),
      {} as Record<PanelComponent, number>
    );

    // Average size
    const totalArea = panels.reduce((sum, p) => sum + p.size.width * p.size.height, 0);
    const averageSize =
      panels.length > 0
        ? {
            width: panels.reduce((sum, p) => sum + p.size.width, 0) / panels.length,
            height: panels.reduce((sum, p) => sum + p.size.height, 0) / panels.length,
          }
        : { width: 0, height: 0 };

    // Overlapping panels
    const overlappingPanels = panels.filter(
      panel =>
        this.detectCollisions(
          panel,
          panels.filter(p => p.id !== panel.id)
        ).length > 0
    ).length;

    // Grouped panels
    const groupedPanels = Array.from(this.groups.values()).reduce(
      (count, group) => count + group.panelIds.length,
      0
    );

    // Z-index conflicts
    const zIndexConflicts = this.zIndexManager.detectConflicts(panels).length;

    return {
      totalPanels: panels.length,
      visiblePanels: visiblePanels.length,
      hiddenPanels: hiddenPanels.length,
      lockedPanels: lockedPanels.length,
      componentCounts,
      averageSize,
      totalArea,
      usedViewportPercentage: (totalArea / (1920 * 1080)) * 100, // Assuming 1920x1080 viewport
      overlappingPanels,
      groupedPanels,
      zIndexConflicts,
    };
  }

  /**
   * Get performance metrics for all panels
   */
  getPerformanceMetrics(): Map<string, PanelPerformanceMetrics> {
    return new Map(this.performanceMetrics);
  }

  // ===============================
  // VALIDATION AND HEALTH CHECKING
  // ===============================

  /**
   * Validate a single panel
   */
  validatePanel(panel: PanelLayout): PanelValidationResult {
    const cached = this.validationCache.get(panel.id);
    if (cached) return cached;

    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!panel.id) errors.push('Panel ID is required');
    if (!panel.component) errors.push('Panel component is required');
    if (!panel.position) errors.push('Panel position is required');
    if (!panel.size) errors.push('Panel size is required');

    // Size constraints
    if (panel.constraints?.minSize) {
      if (panel.size.width < panel.constraints.minSize.width) {
        errors.push(
          `Width ${panel.size.width} is below minimum ${panel.constraints.minSize.width}`
        );
      }
      if (panel.size.height < panel.constraints.minSize.height) {
        errors.push(
          `Height ${panel.size.height} is below minimum ${panel.constraints.minSize.height}`
        );
      }
    }

    if (panel.constraints?.maxSize) {
      if (panel.size.width > panel.constraints.maxSize.width) {
        warnings.push(
          `Width ${panel.size.width} exceeds maximum ${panel.constraints.maxSize.width}`
        );
      }
      if (panel.size.height > panel.constraints.maxSize.height) {
        warnings.push(
          `Height ${panel.size.height} exceeds maximum ${panel.constraints.maxSize.height}`
        );
      }
    }

    // Position validation
    if (panel.position.x < 0 || panel.position.y < 0) {
      warnings.push('Panel position is outside viewport bounds');
    }

    // Z-index validation
    if (panel.zIndex < 0) {
      errors.push('Z-index cannot be negative');
    }

    const result: PanelValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      panelId: panel.id,
    };

    this.validationCache.set(panel.id, result);
    return result;
  }

  /**
   * Validate all panels
   */
  validateAllPanels(): PanelValidationResult[] {
    return this.getPanelArray().map(panel => this.validatePanel(panel));
  }

  /**
   * Health check for the entire panel system
   */
  performHealthCheck(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const stats = this.getStatistics();
    const validationResults = this.validateAllPanels();

    // Check for validation errors
    const errorCount = validationResults.filter(r => !r.isValid).length;
    if (errorCount > 0) {
      issues.push(`${errorCount} panels have validation errors`);
      recommendations.push('Fix panel validation errors');
    }

    // Check for overlapping panels
    if (stats.overlappingPanels > 0) {
      issues.push(`${stats.overlappingPanels} panels are overlapping`);
      recommendations.push('Use layout optimization to resolve overlaps');
    }

    // Check for z-index conflicts
    if (stats.zIndexConflicts > 0) {
      issues.push(`${stats.zIndexConflicts} z-index conflicts detected`);
      recommendations.push('Run z-index auto-arrangement');
    }

    // Check memory usage
    const totalMetrics = Array.from(this.performanceMetrics.values());
    const avgMemoryUsage =
      totalMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / totalMetrics.length;
    if (avgMemoryUsage > 100) {
      // MB threshold
      issues.push('High memory usage detected');
      recommendations.push('Consider reducing panel count or optimizing panel content');
    }

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (issues.length > 0) {
      status = errorCount > 0 || stats.zIndexConflicts > 5 ? 'critical' : 'warning';
    }

    return { status, issues, recommendations };
  }

  // ===============================
  // CLIPBOARD OPERATIONS
  // ===============================

  /**
   * Copy panels to clipboard
   */
  copyToClipboard(panelIds: string[]): void {
    this.clipboard = panelIds
      .map(id => this.panels.get(id))
      .filter((panel): panel is PanelLayout => panel !== undefined);

    console.log(`Copied ${this.clipboard.length} panels to clipboard`);
  }

  /**
   * Paste panels from clipboard
   */
  pasteFromClipboard(offset: Position = { x: 20, y: 20 }): string[] {
    const newPanelIds: string[] = [];

    this.clipboard.forEach(panel => {
      const newId = this.createPanel(panel.component, {
        position: {
          x: panel.position.x + offset.x,
          y: panel.position.y + offset.y,
        },
        size: panel.size,
        metadata: {
          ...panel.metadata,
          title: `${panel.metadata?.title || panel.id} (Pasted)`,
        },
      });
      newPanelIds.push(newId);
    });

    console.log(`Pasted ${newPanelIds.length} panels from clipboard`);
    return newPanelIds;
  }

  /**
   * Check if clipboard has content
   */
  hasClipboardContent(): boolean {
    return this.clipboard.length > 0;
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * Get all panels as array
   */
  getPanelArray(): PanelLayout[] {
    return Array.from(this.panels.values());
  }

  /**
   * Get panel by ID
   */
  getPanel(panelId: string): PanelLayout | undefined {
    return this.panels.get(panelId);
  }

  /**
   * Check if panel exists
   */
  hasPanel(panelId: string): boolean {
    return this.panels.has(panelId);
  }

  /**
   * Get panel count
   */
  getPanelCount(): number {
    return this.panels.size;
  }

  /**
   * Clear all panels
   */
  clearAllPanels(): void {
    this.panels.clear();
    this.groups.clear();
    this.selectedPanelIds.clear();
    this.performanceMetrics.clear();
    this.validationCache.clear();
    console.log('Cleared all panels');
  }

  // ===============================
  // PRIVATE HELPER METHODS
  // ===============================

  private calculateOptimalPosition(size?: Size): Position {
    const defaultSize = size || { width: 400, height: 300 };
    const existingPanels = this.getPanelArray();

    // Simple algorithm: try positions in a grid pattern
    const gridSize = 50;
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = (attempt % 10) * gridSize + 50;
      const y = Math.floor(attempt / 10) * gridSize + 50;
      const position = { x, y };

      if (this.isPositionFree(position, defaultSize, existingPanels)) {
        return position;
      }
    }

    // Fallback to random position
    return {
      x: Math.random() * 500 + 50,
      y: Math.random() * 300 + 50,
    };
  }

  private isPositionFree(position: Position, size: Size, existingPanels: PanelLayout[]): boolean {
    const testPanel: PanelLayout = {
      id: 'test',
      component: PanelComponent.SmartHub,
      position,
      size,
      zIndex: 1,
      visible: true,
    };

    return this.detectCollisions(testPanel, existingPanels).length === 0;
  }

  private detectCollisions(panel: PanelLayout, otherPanels: PanelLayout[]): PanelLayout[] {
    return otherPanels.filter(other => {
      const panelRight = panel.position.x + panel.size.width;
      const panelBottom = panel.position.y + panel.size.height;
      const otherRight = other.position.x + other.size.width;
      const otherBottom = other.position.y + other.size.height;

      return !(
        panel.position.x >= otherRight ||
        panelRight <= other.position.x ||
        panel.position.y >= otherBottom ||
        panelBottom <= other.position.y
      );
    });
  }

  private findNonConflictingPosition(preferredPosition: Position, size: Size): Position {
    const existingPanels = this.getPanelArray();

    if (this.isPositionFree(preferredPosition, size, existingPanels)) {
      return preferredPosition;
    }

    return this.calculateOptimalPosition(size);
  }

  private getDefaultSize(component: PanelComponent): Size {
    const sizes = {
      [PanelComponent.SmartHub]: { width: 350, height: 250 },
      [PanelComponent.AIChat]: { width: 400, height: 350 },
      [PanelComponent.TaskManager]: { width: 300, height: 300 },
      [PanelComponent.Productivity]: { width: 250, height: 400 },
    };
    return sizes[component] || { width: 300, height: 250 };
  }

  private getMinSize(component: PanelComponent): Size {
    const minSizes = {
      [PanelComponent.SmartHub]: { width: 300, height: 200 },
      [PanelComponent.AIChat]: { width: 350, height: 300 },
      [PanelComponent.TaskManager]: { width: 250, height: 200 },
      [PanelComponent.Productivity]: { width: 200, height: 300 },
    };
    return minSizes[component] || { width: 200, height: 150 };
  }

  private getDefaultTitle(component: PanelComponent): string {
    const titles = {
      [PanelComponent.SmartHub]: 'Smart Hub',
      [PanelComponent.AIChat]: 'AI Chat',
      [PanelComponent.TaskManager]: 'Task Manager',
      [PanelComponent.Productivity]: 'Productivity Tools',
    };
    return titles[component] || component;
  }

  private getDefaultIcon(component: PanelComponent): string {
    const icons = {
      [PanelComponent.SmartHub]: '🔗',
      [PanelComponent.AIChat]: '🤖',
      [PanelComponent.TaskManager]: '📋',
      [PanelComponent.Productivity]: '⚡',
    };
    return icons[component] || '📄';
  }

  private getDefaultColor(component: PanelComponent): string {
    const colors = {
      [PanelComponent.SmartHub]: '#3B82F6',
      [PanelComponent.AIChat]: '#10B981',
      [PanelComponent.TaskManager]: '#F59E0B',
      [PanelComponent.Productivity]: '#8B5CF6',
    };
    return colors[component] || '#6B7280';
  }

  private setupPerformanceMonitoring(): void {
    // Set up performance monitoring for panels
    setInterval(() => {
      this.updateAllPerformanceMetrics();
    }, 5000); // Update every 5 seconds
  }

  private initializePerformanceMetrics(panelId: string): void {
    this.performanceMetrics.set(panelId, {
      renderTime: 0,
      updateFrequency: 0,
      memoryUsage: 0,
      lastRenderTime: Date.now(),
      errorCount: 0,
      interactionCount: 0,
    });
  }

  private updatePerformanceMetrics(panelId: string): void {
    const existing = this.performanceMetrics.get(panelId);
    if (existing) {
      existing.updateFrequency++;
      existing.lastRenderTime = Date.now();
    }
  }

  private updateAllPerformanceMetrics(): void {
    // In a real implementation, this would collect actual performance data
    this.performanceMetrics.forEach((metrics, panelId) => {
      metrics.memoryUsage = Math.random() * 50; // Mock memory usage in MB
      metrics.renderTime = Math.random() * 16; // Mock render time in ms
    });
  }

  private clearValidationCache(panelId?: string): void {
    if (panelId) {
      this.validationCache.delete(panelId);
    } else {
      this.validationCache.clear();
    }
  }

  private removePanelFromGroup(panelId: string, groupId: string): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.panelIds = group.panelIds.filter(id => id !== panelId);
      if (group.panelIds.length === 0) {
        this.groups.delete(groupId);
      }
    }
  }
}

// Export singleton instance
export const panelManager = PanelManager.getInstance();

// Utility functions for common panel operations
export const panelUtils = {
  /**
   * Get panels by component type
   */
  getPanelsByComponent: (component: PanelComponent): PanelLayout[] => {
    return panelManager.filterByComponent(component);
  },

  /**
   * Check if panels overlap
   */
  doVPanelsOverlap: (panel1: PanelLayout, panel2: PanelLayout): boolean => {
    const p1Right = panel1.position.x + panel1.size.width;
    const p1Bottom = panel1.position.y + panel1.size.height;
    const p2Right = panel2.position.x + panel2.size.width;
    const p2Bottom = panel2.position.y + panel2.size.height;

    return !(
      panel1.position.x >= p2Right ||
      p1Right <= panel2.position.x ||
      panel1.position.y >= p2Bottom ||
      p1Bottom <= panel2.position.y
    );
  },

  /**
   * Calculate distance between panels
   */
  getDistance: (panel1: PanelLayout, panel2: PanelLayout): number => {
    const centerX1 = panel1.position.x + panel1.size.width / 2;
    const centerY1 = panel1.position.y + panel1.size.height / 2;
    const centerX2 = panel2.position.x + panel2.size.width / 2;
    const centerY2 = panel2.position.y + panel2.size.height / 2;

    return Math.sqrt(Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2));
  },

  /**
   * Get nearest panels to a specific panel
   */
  getNearestPanels: (targetPanel: PanelLayout, count: number = 3): PanelLayout[] => {
    const allPanels = panelManager.getPanelArray().filter(p => p.id !== targetPanel.id);

    return allPanels
      .map(panel => ({ panel, distance: panelUtils.getDistance(targetPanel, panel) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
      .map(item => item.panel);
  },

  /**
   * Check if panel is in viewport
   */
  isInViewport: (panel: PanelLayout, viewport: { width: number; height: number }): boolean => {
    return (
      panel.position.x < viewport.width &&
      panel.position.x + panel.size.width > 0 &&
      panel.position.y < viewport.height &&
      panel.position.y + panel.size.height > 0
    );
  },
};
