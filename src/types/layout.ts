/**
 * Layout system type definitions for workspace management
 */

import { PanelLayout, PanelState, Position, Size } from './panel';

// Grid configuration for snap-to-grid functionality
export interface GridSettings {
  enabled: boolean;
  size: number;
  visible: boolean;
  color: string;
  opacity: number;
  snapThreshold: number;
}

// Drag interaction state
export interface DragState {
  isDragging: boolean;
  draggedPanelId: string | null;
  startPosition: Position;
  currentPosition: Position;
  offset: Position;
  constrainToParent: boolean;
  snapToGrid: boolean;
}

// Resize interaction state
export interface ResizeState {
  isResizing: boolean;
  resizedPanelId: string | null;
  startSize: Size;
  currentSize: Size;
  startPosition: Position;
  direction: ResizeDirection;
  maintainAspectRatio: boolean;
}
// Resize direction for resize handles
export enum ResizeDirection {
  North = 'n',
  South = 's',
  East = 'e',
  West = 'w',
  NorthEast = 'ne',
  NorthWest = 'nw',
  SouthEast = 'se',
  SouthWest = 'sw',
}

// Workspace configuration for saved layouts
export interface WorkspaceConfig {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  panels: PanelLayout[];
  gridSettings: GridSettings;
  viewport: {
    zoom: number;
    center: Position;
  };
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

// Complete layout state for the store
export interface LayoutState {
  panels: Record<string, PanelLayout>;
  panelStates: Record<string, PanelState>;
  gridSettings: GridSettings;
  dragState: DragState;
  resizeState: ResizeState;
  selectedPanelIds: string[];
  viewport: {
    zoom: number;
    center: Position;
    bounds: {
      width: number;
      height: number;
    };
  };
  workspaces: Record<string, WorkspaceConfig>;
  activeWorkspaceId: string;
  history: {
    past: LayoutSnapshot[];
    present: LayoutSnapshot;
    future: LayoutSnapshot[];
  };
}

// Layout snapshot for undo/redo functionality
export interface LayoutSnapshot {
  timestamp: number;
  panels: Record<string, PanelLayout>;
  selectedPanelIds: string[];
  viewport: LayoutState['viewport'];
}

// Layout action types for state management
export enum LayoutActionType {
  // Panel actions
  ADD_PANEL = 'ADD_PANEL',
  REMOVE_PANEL = 'REMOVE_PANEL',
  UPDATE_PANEL = 'UPDATE_PANEL',
  MOVE_PANEL = 'MOVE_PANEL',
  RESIZE_PANEL = 'RESIZE_PANEL',

  // Selection actions
  SELECT_PANEL = 'SELECT_PANEL',
  DESELECT_PANEL = 'DESELECT_PANEL',
  CLEAR_SELECTION = 'CLEAR_SELECTION',
  SELECT_MULTIPLE = 'SELECT_MULTIPLE',

  // Drag actions
  START_DRAG = 'START_DRAG',
  UPDATE_DRAG = 'UPDATE_DRAG',
  END_DRAG = 'END_DRAG',

  // Resize actions
  START_RESIZE = 'START_RESIZE',
  UPDATE_RESIZE = 'UPDATE_RESIZE',
  END_RESIZE = 'END_RESIZE',

  // Grid actions
  UPDATE_GRID_SETTINGS = 'UPDATE_GRID_SETTINGS',
  TOGGLE_GRID = 'TOGGLE_GRID',

  // Workspace actions
  SAVE_WORKSPACE = 'SAVE_WORKSPACE',
  LOAD_WORKSPACE = 'LOAD_WORKSPACE',
  DELETE_WORKSPACE = 'DELETE_WORKSPACE',

  // History actions
  UNDO = 'UNDO',
  REDO = 'REDO',
  CLEAR_HISTORY = 'CLEAR_HISTORY',

  // Viewport actions
  UPDATE_VIEWPORT = 'UPDATE_VIEWPORT',
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_OUT = 'ZOOM_OUT',
  RESET_VIEWPORT = 'RESET_VIEWPORT',
}

// Layout action payloads
export interface LayoutActions {
  [LayoutActionType.ADD_PANEL]: { panel: PanelLayout };
  [LayoutActionType.REMOVE_PANEL]: { panelId: string };
  [LayoutActionType.UPDATE_PANEL]: { panelId: string; updates: Partial<PanelLayout> };
  [LayoutActionType.MOVE_PANEL]: { panelId: string; position: Position };
  [LayoutActionType.RESIZE_PANEL]: { panelId: string; size: Size };
  [LayoutActionType.SELECT_PANEL]: { panelId: string };
  [LayoutActionType.DESELECT_PANEL]: { panelId: string };
  [LayoutActionType.CLEAR_SELECTION]: {};
  [LayoutActionType.SELECT_MULTIPLE]: { panelIds: string[] };
  [LayoutActionType.START_DRAG]: { panelId: string; startPosition: Position };
  [LayoutActionType.UPDATE_DRAG]: { currentPosition: Position };
  [LayoutActionType.END_DRAG]: {};
  [LayoutActionType.START_RESIZE]: { panelId: string; direction: ResizeDirection; startSize: Size };
  [LayoutActionType.UPDATE_RESIZE]: { currentSize: Size };
  [LayoutActionType.END_RESIZE]: {};
  [LayoutActionType.UPDATE_GRID_SETTINGS]: { settings: Partial<GridSettings> };
  [LayoutActionType.TOGGLE_GRID]: {};
  [LayoutActionType.SAVE_WORKSPACE]: { workspace: WorkspaceConfig };
  [LayoutActionType.LOAD_WORKSPACE]: { workspaceId: string };
  [LayoutActionType.DELETE_WORKSPACE]: { workspaceId: string };
  [LayoutActionType.UNDO]: {};
  [LayoutActionType.REDO]: {};
  [LayoutActionType.CLEAR_HISTORY]: {};
  [LayoutActionType.UPDATE_VIEWPORT]: { viewport: Partial<LayoutState['viewport']> };
  [LayoutActionType.ZOOM_IN]: {};
  [LayoutActionType.ZOOM_OUT]: {};
  [LayoutActionType.RESET_VIEWPORT]: {};
}
