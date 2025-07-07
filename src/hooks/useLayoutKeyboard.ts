/**
 * Layout Keyboard Shortcuts Hook
 * Provides comprehensive keyboard shortcut management for layout operations
 */

import React, { useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLayoutStore } from '@/stores/layoutStore';
import { PANEL_COMPONENTS, createPanelComponent } from '@/components/panels';
import type { Position, Size } from '@/types/panel';
import { PanelComponent } from '@/types/panel';

// Keyboard shortcut configuration
interface ShortcutConfig {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enableOnFormTags?: boolean;
}

// Movement step sizes
const MOVEMENT_STEP = {
  SMALL: 1,
  MEDIUM: 10,
  LARGE: 50,
};

// Resize step sizes
const RESIZE_STEP = {
  SMALL: 5,
  MEDIUM: 20,
  LARGE: 100,
};

/**
 * Main layout keyboard shortcuts hook
 */
export const useLayoutKeyboard = (config: ShortcutConfig = {}) => {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = true,
    enableOnFormTags = false,
  } = config;

  const {
    panels,
    selectedPanelIds,
    gridSettings,
    addPanel,
    removePanel,
    selectPanel,
    clearSelection,
    updatePanel,
    setGridSnap,
    updateGridSettings,
    saveWorkspace,
    resetLayout,
    duplicatePanel,
    centerPanel,
    getSelectedPanels,
  } = useLayoutStore();

  // Helper to get default position for new panels
  const getDefaultPosition = useCallback(
    (size: Size): Position => {
      const existingPositions = panels.map(p => p.position);
      const cascadeOffset = 30;
      let basePosition = { x: 100, y: 100 };

      // Find a position that doesn't overlap
      for (let i = 0; i < 20; i++) {
        const testPosition = {
          x: basePosition.x + i * cascadeOffset,
          y: basePosition.y + i * cascadeOffset,
        };

        const hasOverlap = existingPositions.some(
          pos => Math.abs(pos.x - testPosition.x) < 50 && Math.abs(pos.y - testPosition.y) < 50
        );

        if (!hasOverlap) {
          return testPosition;
        }
      }

      return basePosition;
    },
    [panels]
  );

  // Panel navigation shortcuts
  useHotkeys(
    'tab',
    e => {
      if (!enabled) return;
      e.preventDefault();

      if (panels.length === 0) return;

      const currentIndex =
        selectedPanelIds.length > 0 ? panels.findIndex(p => p.id === selectedPanelIds[0]) : -1;

      const nextIndex = (currentIndex + 1) % panels.length;
      const nextPanel = panels[nextIndex];

      if (nextPanel) {
        selectPanel(nextPanel.id, false);
      }
    },
    {
      preventDefault,
      enableOnFormTags,
    },
    [enabled, panels, selectedPanelIds, selectPanel]
  );

  useHotkeys(
    'shift+tab',
    e => {
      if (!enabled) return;
      e.preventDefault();

      if (panels.length === 0) return;

      const currentIndex =
        selectedPanelIds.length > 0 ? panels.findIndex(p => p.id === selectedPanelIds[0]) : 0;

      const prevIndex = currentIndex <= 0 ? panels.length - 1 : currentIndex - 1;
      const prevPanel = panels[prevIndex];

      if (prevPanel) {
        selectPanel(prevPanel.id, false);
      }
    },
    {
      preventDefault,
      enableOnFormTags,
    },
    [enabled, panels, selectedPanelIds, selectPanel]
  );

  // Panel movement shortcuts
  const moveSelectedPanels = useCallback(
    (deltaX: number, deltaY: number) => {
      const selectedPanels = getSelectedPanels();

      selectedPanels.forEach(panel => {
        const newPosition = {
          x: Math.max(0, panel.position.x + deltaX),
          y: Math.max(0, panel.position.y + deltaY),
        };

        updatePanel(panel.id, { position: newPosition });
      });
    },
    [getSelectedPanels, updatePanel]
  );

  // Fine movement (1px)
  useHotkeys(
    'ctrl+shift+left',
    () => enabled && moveSelectedPanels(-MOVEMENT_STEP.SMALL, 0),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+shift+right',
    () => enabled && moveSelectedPanels(MOVEMENT_STEP.SMALL, 0),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+shift+up',
    () => enabled && moveSelectedPanels(0, -MOVEMENT_STEP.SMALL),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+shift+down',
    () => enabled && moveSelectedPanels(0, MOVEMENT_STEP.SMALL),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );

  // Medium movement (10px)
  useHotkeys(
    'ctrl+left',
    () => enabled && moveSelectedPanels(-MOVEMENT_STEP.MEDIUM, 0),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+right',
    () => enabled && moveSelectedPanels(MOVEMENT_STEP.MEDIUM, 0),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+up',
    () => enabled && moveSelectedPanels(0, -MOVEMENT_STEP.MEDIUM),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+down',
    () => enabled && moveSelectedPanels(0, MOVEMENT_STEP.MEDIUM),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );

  // Large movement (50px)
  useHotkeys(
    'ctrl+alt+left',
    () => enabled && moveSelectedPanels(-MOVEMENT_STEP.LARGE, 0),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+alt+right',
    () => enabled && moveSelectedPanels(MOVEMENT_STEP.LARGE, 0),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+alt+up',
    () => enabled && moveSelectedPanels(0, -MOVEMENT_STEP.LARGE),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );
  useHotkeys(
    'ctrl+alt+down',
    () => enabled && moveSelectedPanels(0, MOVEMENT_STEP.LARGE),
    { preventDefault, enableOnFormTags },
    [enabled, moveSelectedPanels]
  );

  // Panel resizing shortcuts
  const resizeSelectedPanels = useCallback(
    (deltaWidth: number, deltaHeight: number) => {
      const selectedPanels = getSelectedPanels();

      selectedPanels.forEach(panel => {
        const constraints = panel.constraints;
        const minWidth = constraints?.minSize.width || 200;
        const minHeight = constraints?.minSize.height || 150;
        const maxWidth = constraints?.maxSize?.width || 2000;
        const maxHeight = constraints?.maxSize?.height || 1500;

        const newSize = {
          width: Math.max(minWidth, Math.min(maxWidth, panel.size.width + deltaWidth)),
          height: Math.max(minHeight, Math.min(maxHeight, panel.size.height + deltaHeight)),
        };

        updatePanel(panel.id, { size: newSize });
      });
    },
    [getSelectedPanels, updatePanel]
  );

  // Resize shortcuts
  useHotkeys(
    'ctrl+shift+alt+left',
    () => enabled && resizeSelectedPanels(-RESIZE_STEP.MEDIUM, 0),
    { preventDefault, enableOnFormTags },
    [enabled, resizeSelectedPanels]
  );
  useHotkeys(
    'ctrl+shift+alt+right',
    () => enabled && resizeSelectedPanels(RESIZE_STEP.MEDIUM, 0),
    { preventDefault, enableOnFormTags },
    [enabled, resizeSelectedPanels]
  );
  useHotkeys(
    'ctrl+shift+alt+up',
    () => enabled && resizeSelectedPanels(0, -RESIZE_STEP.MEDIUM),
    { preventDefault, enableOnFormTags },
    [enabled, resizeSelectedPanels]
  );
  useHotkeys(
    'ctrl+shift+alt+down',
    () => enabled && resizeSelectedPanels(0, RESIZE_STEP.MEDIUM),
    { preventDefault, enableOnFormTags },
    [enabled, resizeSelectedPanels]
  );

  // Panel management shortcuts
  useHotkeys(
    'delete',
    () => {
      if (!enabled || selectedPanelIds.length === 0) return;

      selectedPanelIds.forEach(id => removePanel(id));
      clearSelection();
    },
    { preventDefault, enableOnFormTags },
    [enabled, selectedPanelIds, removePanel, clearSelection]
  );

  useHotkeys(
    'escape',
    () => {
      if (!enabled) return;
      clearSelection();
    },
    { preventDefault: false, enableOnFormTags },
    [enabled, clearSelection]
  );

  useHotkeys(
    'enter',
    () => {
      if (!enabled || selectedPanelIds.length !== 1) return;
      centerPanel(selectedPanelIds[0]);
    },
    { preventDefault, enableOnFormTags },
    [enabled, selectedPanelIds, centerPanel]
  );

  // Duplication shortcut
  useHotkeys(
    'ctrl+d',
    () => {
      if (!enabled || selectedPanelIds.length !== 1) return;
      duplicatePanel(selectedPanelIds[0]);
    },
    { preventDefault, enableOnFormTags },
    [enabled, selectedPanelIds, duplicatePanel]
  );

  // Selection shortcuts
  useHotkeys(
    'ctrl+a',
    () => {
      if (!enabled) return;
      panels.forEach(panel => selectPanel(panel.id, true));
    },
    { preventDefault, enableOnFormTags },
    [enabled, panels, selectPanel]
  );

  // Workspace shortcuts
  useHotkeys(
    'ctrl+s',
    () => {
      if (!enabled) return;
      const timestamp = new Date().toLocaleString();
      saveWorkspace(`Layout ${timestamp}`, 'Quick save from keyboard shortcut');
    },
    { preventDefault, enableOnFormTags },
    [enabled, saveWorkspace]
  );

  useHotkeys(
    'ctrl+shift+r',
    () => {
      if (!enabled) return;
      if (confirm('Reset layout? This will remove all panels.')) {
        resetLayout();
      }
    },
    { preventDefault, enableOnFormTags },
    [enabled, resetLayout]
  );

  // Grid shortcuts
  useHotkeys(
    'ctrl+g',
    () => {
      if (!enabled) return;
      setGridSnap(!gridSettings.enabled);
    },
    { preventDefault, enableOnFormTags },
    [enabled, gridSettings.enabled, setGridSnap]
  );

  useHotkeys(
    'ctrl+shift+g',
    () => {
      if (!enabled) return;
      updateGridSettings({ visible: !gridSettings.visible });
    },
    { preventDefault, enableOnFormTags },
    [enabled, gridSettings.visible, updateGridSettings]
  );

  // Grid size adjustment
  useHotkeys(
    'ctrl+shift+plus',
    () => {
      if (!enabled) return;
      updateGridSettings({ size: Math.min(100, gridSettings.size + 5) });
    },
    { preventDefault, enableOnFormTags },
    [enabled, gridSettings.size, updateGridSettings]
  );

  useHotkeys(
    'ctrl+shift+minus',
    () => {
      if (!enabled) return;
      updateGridSettings({ size: Math.max(5, gridSettings.size - 5) });
    },
    { preventDefault, enableOnFormTags },
    [enabled, gridSettings.size, updateGridSettings]
  );

  // Quick panel creation shortcuts
  useHotkeys(
    'ctrl+1',
    () => {
      if (!enabled) return;
      const position = getDefaultPosition({ width: 500, height: 600 });
      addPanel({
        component: PanelComponent.SmartHub,
        position,
        size: { width: 500, height: 600 },
        zIndex: 100,
        visible: true,
        constraints: {
          minSize: { width: 400, height: 300 },
          maxSize: { width: 800, height: 700 },
        },
      });
    },
    { preventDefault, enableOnFormTags },
    [enabled, addPanel, getDefaultPosition]
  );

  useHotkeys(
    'ctrl+2',
    () => {
      if (!enabled) return;
      const position = getDefaultPosition({ width: 600, height: 700 });
      addPanel({
        component: PanelComponent.AIChat,
        position,
        size: { width: 600, height: 700 },
        zIndex: 100,
        visible: true,
        constraints: {
          minSize: { width: 400, height: 400 },
          maxSize: { width: 800, height: 800 },
        },
      });
    },
    { preventDefault, enableOnFormTags },
    [enabled, addPanel, getDefaultPosition]
  );

  useHotkeys(
    'ctrl+3',
    () => {
      if (!enabled) return;
      const position = getDefaultPosition({ width: 550, height: 650 });
      addPanel({
        component: PanelComponent.TaskManager,
        position,
        size: { width: 550, height: 650 },
        zIndex: 100,
        visible: true,
        constraints: {
          minSize: { width: 400, height: 400 },
          maxSize: { width: 800, height: 800 },
        },
      });
    },
    { preventDefault, enableOnFormTags },
    [enabled, addPanel, getDefaultPosition]
  );

  useHotkeys(
    'ctrl+4',
    () => {
      if (!enabled) return;
      const position = getDefaultPosition({ width: 500, height: 700 });
      addPanel({
        component: PanelComponent.Productivity,
        position,
        size: { width: 500, height: 700 },
        zIndex: 100,
        visible: true,
        constraints: {
          minSize: { width: 400, height: 500 },
          maxSize: { width: 800, height: 900 },
        },
      });
    },
    { preventDefault, enableOnFormTags },
    [enabled, addPanel, getDefaultPosition]
  );

  // Return current state and methods for external use
  return {
    enabled,
    selectedCount: selectedPanelIds.length,
    gridEnabled: gridSettings.enabled,
    gridVisible: gridSettings.visible,
    shortcuts: {
      navigation: ['Tab', 'Shift+Tab'],
      movement: ['Ctrl+Arrow', 'Ctrl+Shift+Arrow', 'Ctrl+Alt+Arrow'],
      resize: ['Ctrl+Shift+Alt+Arrow'],
      management: ['Delete', 'Escape', 'Enter', 'Ctrl+D'],
      selection: ['Ctrl+A'],
      workspace: ['Ctrl+S', 'Ctrl+Shift+R'],
      grid: ['Ctrl+G', 'Ctrl+Shift+G', 'Ctrl+Shift+Plus/Minus'],
      creation: ['Ctrl+1', 'Ctrl+2', 'Ctrl+3', 'Ctrl+4'],
    },
  };
};

/**
 * Hook for panel-specific keyboard shortcuts
 */
export const usePanelKeyboard = (panelId: string, config: ShortcutConfig = {}) => {
  const { enabled = true } = config;
  const { selectedPanelIds, selectPanel, updatePanel, getPanel } = useLayoutStore();

  const isSelected = selectedPanelIds.includes(panelId);
  const panel = getPanel(panelId);

  // Panel-specific shortcuts only work when this panel is selected
  useHotkeys(
    'f',
    () => {
      if (!enabled || !isSelected || !panel) return;

      // Toggle fullscreen-like behavior
      const isLarge = panel.size.width > 800 || panel.size.height > 600;
      const newSize = isLarge ? { width: 400, height: 300 } : { width: 1000, height: 700 };

      updatePanel(panelId, { size: newSize });
    },
    { preventDefault: true },
    [enabled, isSelected, panel, updatePanel, panelId]
  );

  useHotkeys(
    'space',
    e => {
      if (!enabled) return;
      e.preventDefault();
      selectPanel(panelId, false);
    },
    { preventDefault: true },
    [enabled, selectPanel, panelId]
  );

  return {
    isSelected,
    panel,
  };
};

/**
 * Hook for debugging and help shortcuts
 */
export const useLayoutKeyboardHelp = () => {
  const [showHelp, setShowHelp] = useState(false);

  useHotkeys('ctrl+shift+h', () => setShowHelp(prev => !prev), { preventDefault: true });

  useHotkeys(
    'ctrl+shift+d',
    () => {
      console.group('Layout Keyboard Shortcuts Debug');
      console.log('Navigation:', 'Tab (next), Shift+Tab (previous)');
      console.log('Movement:', 'Ctrl+Arrow (10px), Ctrl+Shift+Arrow (1px), Ctrl+Alt+Arrow (50px)');
      console.log('Resize:', 'Ctrl+Shift+Alt+Arrow');
      console.log(
        'Management:',
        'Delete (remove), Escape (deselect), Enter (center), Ctrl+D (duplicate)'
      );
      console.log('Selection:', 'Ctrl+A (select all)');
      console.log('Workspace:', 'Ctrl+S (save), Ctrl+Shift+R (reset)');
      console.log(
        'Grid:',
        'Ctrl+G (toggle snap), Ctrl+Shift+G (toggle visible), Ctrl+Shift+Plus/Minus (size)'
      );
      console.log(
        'Creation:',
        'Ctrl+1 (SmartHub), Ctrl+2 (AIChat), Ctrl+3 (TaskManager), Ctrl+4 (Productivity)'
      );
      console.groupEnd();
    },
    { preventDefault: true }
  );

  return { showHelp, setShowHelp };
};
