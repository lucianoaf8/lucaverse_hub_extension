/**
 * Layout Store - Manages panel layouts, positioning, and interactions
 * Handles panel creation, updates, selection, and grid snapping
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { createDevToolsMiddleware, defaultDevToolsConfig, inspectStoreState } from './devtools';
import type { PanelLayout, Position, Size } from '@/types/panel';
import { PanelComponent } from '@/types/panel';
import type { LayoutState as LayoutStateType, GridSettings, WorkspaceConfig } from '@/types/layout';
import { LayoutActionType } from '@/types/layout';

// Extended layout state for the store
interface LayoutState extends Omit<LayoutStateType, 'panels' | 'panelStates'> {
  // Core panel data
  panels: PanelLayout[];

  // UI state
  selectedPanelIds: string[];

  // Actions
  addPanel: (panel: Omit<PanelLayout, 'id'>) => void;
  updatePanel: (id: string, updates: Partial<PanelLayout>) => void;
  removePanel: (id: string) => void;
  selectPanel: (id: string, multiSelect?: boolean) => void;
  deselectPanel: (id: string) => void;
  clearSelection: () => void;
  reorderPanels: (sourceIndex: number, destinationIndex: number) => void;

  // Grid actions
  setGridSnap: (enabled: boolean) => void;
  updateGridSettings: (settings: Partial<GridSettings>) => void;

  // Drag actions
  startDrag: (panelId: string, startPosition: Position) => void;
  updateDrag: (currentPosition: Position) => void;
  endDrag: () => void;

  // Resize actions
  startResize: (panelId: string, direction: string, startSize: Size) => void;
  updateResize: (currentSize: Size) => void;
  endResize: () => void;

  // Workspace actions
  saveWorkspace: (name: string, description?: string) => void;
  loadWorkspace: (workspaceId: string) => void;
  deleteWorkspace: (workspaceId: string) => void;

  // Computed selectors
  getPanel: (id: string) => PanelLayout | undefined;
  getPanelsByType: (component: PanelComponent) => PanelLayout[];
  getSelectedPanels: () => PanelLayout[];
  getPanelAtPosition: (position: Position) => PanelLayout | undefined;

  // Validation helpers
  isValidPosition: (position: Position, size: Size, excludeId?: string) => boolean;
  canAddPanel: (panel: Omit<PanelLayout, 'id'>) => boolean;

  // Utility actions
  resetLayout: () => void;
  duplicatePanel: (id: string) => void;
  centerPanel: (id: string) => void;
}
// Default layout state
const defaultLayoutState: Omit<LayoutState, keyof LayoutActions> = {
  panels: [],
  gridSettings: {
    enabled: true,
    size: 20,
    visible: false,
    color: '#e5e7eb',
    opacity: 0.5,
    snapThreshold: 10,
  },
  dragState: {
    isDragging: false,
    draggedPanelId: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    constrainToParent: true,
    snapToGrid: true,
  },
  resizeState: {
    isResizing: false,
    resizedPanelId: null,
    startSize: { width: 0, height: 0 },
    currentSize: { width: 0, height: 0 },
    startPosition: { x: 0, y: 0 },
    direction: 'se' as any,
    maintainAspectRatio: false,
  },
  selectedPanelIds: [],
  viewport: {
    zoom: 1,
    center: { x: 960, y: 540 },
    bounds: { width: 1920, height: 1080 },
  },
  workspaces: {},
  activeWorkspaceId: 'default',
  history: {
    past: [],
    present: {
      timestamp: Date.now(),
      panels: {},
      selectedPanelIds: [],
      viewport: { zoom: 1, center: { x: 960, y: 540 }, bounds: { width: 1920, height: 1080 } },
    },
    future: [],
  },
};

// Type for store actions
type LayoutActions = {
  addPanel: LayoutState['addPanel'];
  updatePanel: LayoutState['updatePanel'];
  removePanel: LayoutState['removePanel'];
  selectPanel: LayoutState['selectPanel'];
  deselectPanel: LayoutState['deselectPanel'];
  clearSelection: LayoutState['clearSelection'];
  reorderPanels: LayoutState['reorderPanels'];
  setGridSnap: LayoutState['setGridSnap'];
  updateGridSettings: LayoutState['updateGridSettings'];
  startDrag: LayoutState['startDrag'];
  updateDrag: LayoutState['updateDrag'];
  endDrag: LayoutState['endDrag'];
  startResize: LayoutState['startResize'];
  updateResize: LayoutState['updateResize'];
  endResize: LayoutState['endResize'];
  saveWorkspace: LayoutState['saveWorkspace'];
  loadWorkspace: LayoutState['loadWorkspace'];
  deleteWorkspace: LayoutState['deleteWorkspace'];
  getPanel: LayoutState['getPanel'];
  getPanelsByType: LayoutState['getPanelsByType'];
  getSelectedPanels: LayoutState['getSelectedPanels'];
  getPanelAtPosition: LayoutState['getPanelAtPosition'];
  isValidPosition: LayoutState['isValidPosition'];
  canAddPanel: LayoutState['canAddPanel'];
  resetLayout: LayoutState['resetLayout'];
  duplicatePanel: LayoutState['duplicatePanel'];
  centerPanel: LayoutState['centerPanel'];
};

// Create the layout store
export const useLayoutStore = create<LayoutState>()(
  createDevToolsMiddleware({
    name: 'LayoutStore',
    enabled: defaultDevToolsConfig.enabled,
    serialize: defaultDevToolsConfig.serialize,
    trace: defaultDevToolsConfig.trace,
    traceLimit: defaultDevToolsConfig.traceLimit,
  })((set, get) => ({
    ...defaultLayoutState,

    // Panel management actions
    addPanel: panel => {
      const state = get();

      // Validate panel before adding
      if (!state.canAddPanel(panel)) {
        console.warn('Cannot add panel: validation failed');
        return;
      }

      const newPanel: PanelLayout = {
        ...panel,
        id: nanoid(),
      };

      set(
        state => ({
          panels: [...state.panels, newPanel],
        }),
        false,
        { type: LayoutActionType.ADD_PANEL, panel: newPanel }
      );
    },

    updatePanel: (id, updates) => {
      set(
        state => ({
          panels: state.panels.map(panel => (panel.id === id ? { ...panel, ...updates } : panel)),
        }),
        false,
        { type: LayoutActionType.UPDATE_PANEL, panelId: id, updates }
      );
    },

    removePanel: id => {
      set(
        state => ({
          panels: state.panels.filter(panel => panel.id !== id),
          selectedPanelIds: state.selectedPanelIds.filter(selectedId => selectedId !== id),
        }),
        false,
        { type: LayoutActionType.REMOVE_PANEL, panelId: id }
      );
    },

    selectPanel: (id, multiSelect = false) => {
      set(
        state => {
          if (multiSelect) {
            const isSelected = state.selectedPanelIds.includes(id);
            return {
              selectedPanelIds: isSelected
                ? state.selectedPanelIds.filter(selectedId => selectedId !== id)
                : [...state.selectedPanelIds, id],
            };
          } else {
            return {
              selectedPanelIds: [id],
            };
          }
        },
        false,
        { type: LayoutActionType.SELECT_PANEL, panelId: id }
      );
    },

    deselectPanel: id => {
      set(
        state => ({
          selectedPanelIds: state.selectedPanelIds.filter(selectedId => selectedId !== id),
        }),
        false,
        { type: LayoutActionType.DESELECT_PANEL, panelId: id }
      );
    },

    clearSelection: () => {
      set({ selectedPanelIds: [] }, false, { type: LayoutActionType.CLEAR_SELECTION });
    },

    reorderPanels: (sourceIndex, destinationIndex) => {
      set(state => {
        const newPanels = [...state.panels];
        if (sourceIndex >= 0 && sourceIndex < newPanels.length) {
          const [movedPanel] = newPanels.splice(sourceIndex, 1);
          if (movedPanel) {
            newPanels.splice(destinationIndex, 0, movedPanel);
          }
        }
        return { panels: newPanels };
      });
    },

    // Grid actions
    setGridSnap: enabled => {
      set(
        state => ({
          gridSettings: { ...state.gridSettings, enabled },
        }),
        false,
        { type: LayoutActionType.TOGGLE_GRID }
      );
    },

    updateGridSettings: settings => {
      set(
        state => ({
          gridSettings: { ...state.gridSettings, ...settings },
        }),
        false,
        { type: LayoutActionType.UPDATE_GRID_SETTINGS, settings }
      );
    },

    // Drag actions
    startDrag: (panelId, startPosition) => {
      set(
        {
          dragState: {
            isDragging: true,
            draggedPanelId: panelId,
            startPosition,
            currentPosition: startPosition,
            offset: { x: 0, y: 0 },
            constrainToParent: true,
            snapToGrid: get().gridSettings.enabled,
          },
        },
        false,
        { type: LayoutActionType.START_DRAG, panelId, startPosition }
      );
    },

    updateDrag: currentPosition => {
      const state = get();
      if (!state.dragState.isDragging) return;

      set(
        state => ({
          dragState: { ...state.dragState, currentPosition },
        }),
        false,
        { type: LayoutActionType.UPDATE_DRAG, currentPosition }
      );
    },

    endDrag: () => {
      const state = get();
      if (!state.dragState.isDragging || !state.dragState.draggedPanelId) return;

      // Apply final position to panel
      const finalPosition = state.dragState.currentPosition;
      const panelId = state.dragState.draggedPanelId;

      set(
        state => ({
          dragState: {
            isDragging: false,
            draggedPanelId: null,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            offset: { x: 0, y: 0 },
            constrainToParent: true,
            snapToGrid: true,
          },
          panels: state.panels.map(panel =>
            panel.id === panelId ? { ...panel, position: finalPosition } : panel
          ),
        }),
        false,
        { type: LayoutActionType.END_DRAG }
      );
    },

    // Resize actions
    startResize: (panelId, direction, startSize) => {
      const state = get();
      const panel = state.panels.find(p => p.id === panelId);
      if (!panel) {
        console.warn('Panel not found for resize:', panelId);
        return;
      }

      set(
        {
          resizeState: {
            isResizing: true,
            resizedPanelId: panelId,
            startSize,
            currentSize: startSize,
            startPosition: panel.position,
            direction: direction as any,
            maintainAspectRatio: false,
          },
        },
        false,
        { type: LayoutActionType.START_RESIZE, panelId, direction: direction as any, startSize }
      );
    },

    updateResize: currentSize => {
      const state = get();
      if (!state.resizeState.isResizing) return;

      set(
        state => ({
          resizeState: { ...state.resizeState, currentSize },
        }),
        false,
        { type: LayoutActionType.UPDATE_RESIZE, currentSize }
      );
    },

    endResize: () => {
      const state = get();
      if (!state.resizeState.isResizing || !state.resizeState.resizedPanelId) return;

      // Apply final size to panel
      const finalSize = state.resizeState.currentSize;
      const panelId = state.resizeState.resizedPanelId;

      set(
        state => ({
          resizeState: {
            isResizing: false,
            resizedPanelId: null,
            startSize: { width: 0, height: 0 },
            currentSize: { width: 0, height: 0 },
            startPosition: { x: 0, y: 0 },
            direction: 'se' as any,
            maintainAspectRatio: false,
          },
          panels: state.panels.map(panel =>
            panel.id === panelId ? { ...panel, size: finalSize } : panel
          ),
        }),
        false,
        { type: LayoutActionType.END_RESIZE }
      );
    },

    // Workspace actions
    saveWorkspace: (name, description = '') => {
      const state = get();
      const workspaceId = nanoid();

      const workspace: WorkspaceConfig = {
        id: workspaceId,
        name,
        description,
        panels: state.panels,
        gridSettings: state.gridSettings,
        viewport: {
          zoom: state.viewport.zoom,
          center: state.viewport.center,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set(
        state => ({
          workspaces: { ...state.workspaces, [workspaceId]: workspace },
        }),
        false,
        { type: LayoutActionType.SAVE_WORKSPACE, workspace }
      );
    },

    loadWorkspace: workspaceId => {
      const state = get();
      const workspace = state.workspaces[workspaceId];
      if (!workspace) return;

      set(
        {
          panels: workspace.panels,
          gridSettings: workspace.gridSettings,
          viewport: {
            ...workspace.viewport,
            bounds: get().viewport.bounds, // Preserve current bounds
          },
          activeWorkspaceId: workspaceId,
          selectedPanelIds: [],
        },
        false,
        { type: LayoutActionType.LOAD_WORKSPACE, workspaceId }
      );
    },

    deleteWorkspace: workspaceId => {
      set(
        state => {
          const newWorkspaces = { ...state.workspaces };
          delete newWorkspaces[workspaceId];
          return { workspaces: newWorkspaces };
        },
        false,
        { type: LayoutActionType.DELETE_WORKSPACE, workspaceId }
      );
    },

    // Computed selectors
    getPanel: id => {
      return get().panels.find(panel => panel.id === id);
    },

    getPanelsByType: component => {
      return get().panels.filter(panel => panel.component === component);
    },

    getSelectedPanels: () => {
      const state = get();
      return state.panels.filter(panel => state.selectedPanelIds.includes(panel.id));
    },

    getPanelAtPosition: position => {
      const panels = get().panels;
      return panels.find(panel => {
        const { x, y } = panel.position;
        const { width, height } = panel.size;
        return (
          position.x >= x && position.x <= x + width && position.y >= y && position.y <= y + height
        );
      });
    },

    // Validation helpers
    isValidPosition: (position, size, excludeId = '') => {
      const state = get();
      const bounds = state.viewport.bounds;

      // Check viewport bounds
      if (
        position.x < 0 ||
        position.y < 0 ||
        position.x + size.width > bounds.width ||
        position.y + size.height > bounds.height
      ) {
        return false;
      }

      // Check panel overlap
      const overlapping = state.panels.some(panel => {
        if (panel.id === excludeId) return false;

        return !(
          position.x + size.width <= panel.position.x ||
          position.x >= panel.position.x + panel.size.width ||
          position.y + size.height <= panel.position.y ||
          position.y >= panel.position.y + panel.size.height
        );
      });

      return !overlapping;
    },

    canAddPanel: panel => {
      const state = get();

      // Check if panel type already exists (if restricted)
      const existingPanelsOfType = state.panels.filter(p => p.component === panel.component);
      if (panel.component === PanelComponent.SmartHub && existingPanelsOfType.length > 0) {
        return false; // Only one SmartHub allowed
      }

      // Validate position
      if (!state.isValidPosition(panel.position, panel.size)) {
        return false;
      }

      // Check constraints
      if (panel.constraints) {
        const { minSize, maxSize } = panel.constraints;
        if (panel.size.width < minSize.width || panel.size.height < minSize.height) {
          return false;
        }
        if (maxSize && (panel.size.width > maxSize.width || panel.size.height > maxSize.height)) {
          return false;
        }
      }

      return true;
    },

    // Utility actions
    resetLayout: () => {
      set(
        {
          panels: [],
          selectedPanelIds: [],
          dragState: defaultLayoutState.dragState,
          resizeState: defaultLayoutState.resizeState,
        },
        false,
        { type: 'RESET_LAYOUT' }
      );
    },

    duplicatePanel: id => {
      const state = get();
      const panel = state.getPanel(id);
      if (!panel) return;

      const duplicatedPanel = {
        ...panel,
        position: {
          x: panel.position.x + 20,
          y: panel.position.y + 20,
        },
      };

      // Remove id so addPanel generates a new one
      const { id: _, ...panelWithoutId } = duplicatedPanel;
      state.addPanel(panelWithoutId);
    },

    centerPanel: id => {
      const state = get();
      const panel = state.getPanel(id);
      if (!panel) return;

      const centerPosition = {
        x: (state.viewport.bounds.width - panel.size.width) / 2,
        y: (state.viewport.bounds.height - panel.size.height) / 2,
      };

      state.updatePanel(id, { position: centerPosition });
    },
  }))
);

// Export type for external use
export type LayoutStore = typeof useLayoutStore;
