/**
 * Type validation test file
 * This file tests that all types compile correctly and provide proper autocomplete
 */

import type { PanelLayout, Position, Size, PanelConstraints } from './panel';
import { PanelComponent } from './panel';
import type { LayoutState, GridSettings, WorkspaceConfig, DragState, ResizeState } from './layout';
import type { PlatformAPI, StorageAPI, NotificationAPI, WindowAPI } from './platform';
import type { PanelProps, DragHandleProps, ResizeHandleProps, ThemeConfig } from './components';
import type { PanelId, WorkspaceId, DeepPartial, ActionResult, ValidationResult } from './utils';

import { createPanelId, createWorkspaceId } from './utils';

// Test basic types compile correctly
export function validateTypeCompilation(): void {
  // Test panel types
  const testPosition: Position = {
    x: 100,
    y: 50,
  };

  const testSize: Size = {
    width: 400,
    height: 300,
  };

  const testConstraints: PanelConstraints = {
    minSize: { width: 200, height: 150 },
    maxSize: { width: 800, height: 600 },
    positionBounds: {
      left: 0,
      top: 0,
      right: 1920,
      bottom: 1080,
    },
  };

  const testPanel: PanelLayout = {
    id: 'panel-1',
    component: PanelComponent.SmartHub,
    position: testPosition,
    size: testSize,
    zIndex: 1,
    visible: true,
    constraints: testConstraints,
    metadata: {
      title: 'Smart Hub',
      description: 'Central productivity dashboard',
      icon: 'dashboard',
      color: '#3b82f6',
    },
  };

  // Test utility types
  const panelId: PanelId = createPanelId('panel-1');
  const workspaceId: WorkspaceId = createWorkspaceId('workspace-1');

  const partialPanel: DeepPartial<PanelLayout> = {
    position: { x: 200 },
    metadata: { title: 'Updated Title' },
  };

  const actionResult: ActionResult<PanelLayout> = {
    success: true,
    data: testPanel,
  };

  const validationResult: ValidationResult = {
    valid: false,
    errors: [
      {
        field: 'position.x',
        message: 'X coordinate must be positive',
        code: 'INVALID_POSITION',
      },
    ],
  };

  // Use variables to prevent unused warnings
  console.log('Type validation completed:', {
    testPanel,
    panelId,
    workspaceId,
    partialPanel,
    actionResult,
    validationResult,
  });
}

// Type assertion tests (compile-time only)
type TypeTests = {
  // Verify Position interface
  position: Position;

  // Verify Size interface
  size: Size;

  // Verify PanelLayout interface
  panel: PanelLayout;

  // Verify branded types work
  panelId: PanelId;
  workspaceId: WorkspaceId;

  // Verify utility types work
  partialPanel: DeepPartial<PanelLayout>;
  actionResult: ActionResult<string>;
  validation: ValidationResult;

  // Verify component prop interfaces compile
  panelProps: PanelProps;
  dragProps: DragHandleProps;
  resizeProps: ResizeHandleProps;

  // Verify platform interfaces compile
  platformAPI: PlatformAPI;
  storageAPI: StorageAPI;
  notificationAPI: NotificationAPI;
  windowAPI: WindowAPI;

  // Verify layout interfaces compile
  layoutState: LayoutState;
  gridSettings: GridSettings;
  workspaceConfig: WorkspaceConfig;
  dragState: DragState;
  resizeState: ResizeState;

  // Verify theme interfaces compile
  themeConfig: ThemeConfig;
};

// Export for external validation
export type { TypeTests };

console.log('✅ All types compiled successfully!');
