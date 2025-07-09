import { useDevCenterStore } from '../stores/DevCenterState';

// Theme Studio selectors
export const useThemeStudioState = () => {
  const theme = useDevCenterStore(state => state.theme);
  const updateThemeColors = useDevCenterStore(state => state.updateThemeColors);
  const updateThemeTypography = useDevCenterStore(state => state.updateThemeTypography);
  const updateThemeSpacing = useDevCenterStore(state => state.updateThemeSpacing);
  const updateThemeEffects = useDevCenterStore(state => state.updateThemeEffects);
  const resetTheme = useDevCenterStore(state => state.resetTheme);
  const syncThemeToComponents = useDevCenterStore(state => state.syncThemeToComponents);
  const pushToUndoStack = useDevCenterStore(state => state.pushToUndoStack);
  const clipboardData = useDevCenterStore(state => state.shared.clipboardData);
  const setClipboardData = useDevCenterStore(state => state.setClipboardData);
  
  return {
    theme,
    updateThemeColors,
    updateThemeTypography,
    updateThemeSpacing,
    updateThemeEffects,
    resetTheme,
    syncThemeToComponents,
    pushToUndoStack,
    clipboardData,
    setClipboardData
  };
};

// Component Workshop selectors
export const useComponentWorkshopState = () => {
  const component = useDevCenterStore(state => state.component);
  const theme = useDevCenterStore(state => state.theme);
  const selectComponent = useDevCenterStore(state => state.selectComponent);
  const updateComponentState = useDevCenterStore(state => state.updateComponentState);
  const updateTestResults = useDevCenterStore(state => state.updateTestResults);
  const addToBuildQueue = useDevCenterStore(state => state.addToBuildQueue);
  const removeFromBuildQueue = useDevCenterStore(state => state.removeFromBuildQueue);
  const pushToUndoStack = useDevCenterStore(state => state.pushToUndoStack);
  const exportHistory = useDevCenterStore(state => state.shared.exportHistory);
  const addToExportHistory = useDevCenterStore(state => state.addToExportHistory);
  
  return {
    component,
    theme,
    selectComponent,
    updateComponentState,
    updateTestResults,
    addToBuildQueue,
    removeFromBuildQueue,
    pushToUndoStack,
    exportHistory,
    addToExportHistory
  };
};

// Layout Designer selectors
export const useLayoutDesignerState = () => {
  const layout = useDevCenterStore(state => state.layout);
  const theme = useDevCenterStore(state => state.theme);
  const updatePanels = useDevCenterStore(state => state.updatePanels);
  const setActiveLayout = useDevCenterStore(state => state.setActiveLayout);
  const saveLayout = useDevCenterStore(state => state.saveLayout);
  const updateGridSettings = useDevCenterStore(state => state.updateGridSettings);
  const syncLayoutToPerformance = useDevCenterStore(state => state.syncLayoutToPerformance);
  const pushToUndoStack = useDevCenterStore(state => state.pushToUndoStack);
  const undo = useDevCenterStore(state => state.undo);
  const redo = useDevCenterStore(state => state.redo);
  const undoStack = useDevCenterStore(state => state.shared.undoStack);
  const redoStack = useDevCenterStore(state => state.shared.redoStack);
  
  return {
    layout,
    theme,
    updatePanels,
    setActiveLayout,
    saveLayout,
    updateGridSettings,
    syncLayoutToPerformance,
    pushToUndoStack,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0
  };
};

// Quality Gate selectors
export const useQualityGateState = () => {
  const performance = useDevCenterStore(state => state.performance);
  const theme = useDevCenterStore(state => state.theme);
  const component = useDevCenterStore(state => state.component);
  const layout = useDevCenterStore(state => state.layout);
  const updateMetrics = useDevCenterStore(state => state.updateMetrics);
  const addValidationResult = useDevCenterStore(state => state.addValidationResult);
  const clearValidationResults = useDevCenterStore(state => state.clearValidationResults);
  const updateOptimizationSuggestions = useDevCenterStore(state => state.updateOptimizationSuggestions);
  const exportCurrentState = useDevCenterStore(state => state.exportCurrentState);
  const importState = useDevCenterStore(state => state.importState);
  
  return {
    performance,
    theme,
    component,
    layout,
    updateMetrics,
    addValidationResult,
    clearValidationResults,
    updateOptimizationSuggestions,
    exportCurrentState,
    importState
  };
};

// Shared utilities selectors
export const useSharedUtilities = () => {
  const shared = useDevCenterStore(state => state.shared);
  const pushToUndoStack = useDevCenterStore(state => state.pushToUndoStack);
  const undo = useDevCenterStore(state => state.undo);
  const redo = useDevCenterStore(state => state.redo);
  const setClipboardData = useDevCenterStore(state => state.setClipboardData);
  const addToExportHistory = useDevCenterStore(state => state.addToExportHistory);
  const exportCurrentState = useDevCenterStore(state => state.exportCurrentState);
  const importState = useDevCenterStore(state => state.importState);
  
  return {
    shared,
    pushToUndoStack,
    undo,
    redo,
    setClipboardData,
    addToExportHistory,
    exportCurrentState,
    importState,
    canUndo: shared.undoStack.length > 0,
    canRedo: shared.redoStack.length > 0
  };
};

// Dev Center overview selectors
export const useDevCenterOverview = () => {
  const theme = useDevCenterStore(state => state.theme);
  const component = useDevCenterStore(state => state.component);
  const layout = useDevCenterStore(state => state.layout);
  const performance = useDevCenterStore(state => state.performance);
  const shared = useDevCenterStore(state => state.shared);
  
  // Computed values for dashboard
  const isDirty = theme.isDirty || layout.panels.length > 0 || component.buildQueue.length > 0;
  const totalValidationIssues = performance.validationResults.length;
  const recentActivity = shared.exportHistory.slice(0, 5);
  const componentTestsPassed = Object.values(component.testResults).reduce((acc, result) => acc + result.passed, 0);
  const componentTestsFailed = Object.values(component.testResults).reduce((acc, result) => acc + result.failed, 0);
  
  return {
    theme,
    component,
    layout,
    performance,
    shared,
    isDirty,
    totalValidationIssues,
    recentActivity,
    componentTestsPassed,
    componentTestsFailed
  };
};

// Real-time synchronization hook
export const useDevCenterSync = () => {
  const syncThemeToComponents = useDevCenterStore(state => state.syncThemeToComponents);
  const syncLayoutToPerformance = useDevCenterStore(state => state.syncLayoutToPerformance);
  
  // Subscribe to theme changes and auto-sync
  useDevCenterStore.subscribe(
    (state) => state.theme,
    (theme) => {
      if (theme.isDirty) {
        syncThemeToComponents();
      }
    },
    { equalityFn: (a, b) => a.lastModified === b.lastModified }
  );
  
  // Subscribe to layout changes and auto-sync
  useDevCenterStore.subscribe(
    (state) => state.layout.panels,
    () => {
      syncLayoutToPerformance();
    },
    { equalityFn: (a, b) => a.length === b.length }
  );
  
  return {
    syncThemeToComponents,
    syncLayoutToPerformance
  };
};