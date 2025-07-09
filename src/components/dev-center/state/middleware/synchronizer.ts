import { useDevCenterStore } from './DevCenterState';

// State synchronization utilities
export class DevCenterSynchronizer {
  private static instance: DevCenterSynchronizer;
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();
  
  static getInstance(): DevCenterSynchronizer {
    if (!DevCenterSynchronizer.instance) {
      DevCenterSynchronizer.instance = new DevCenterSynchronizer();
    }
    return DevCenterSynchronizer.instance;
  }
  
  // Subscribe to state changes
  subscribe(event: string, callback: (data: any) => void) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }
  
  // Emit state changes
  emit(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  // Theme synchronization
  syncThemeToAllTools() {
    const store = useDevCenterStore.getState();
    const { theme } = store;
    
    // Update CSS custom properties
    this.updateCSSProperties(theme.colors);
    
    // Notify all tools of theme change
    this.emit('theme:updated', theme);
    
    // Update component previews
    this.emit('component:theme-changed', theme);
    
    // Update layout preview
    this.emit('layout:theme-changed', theme);
    
    // Trigger performance recalculation
    this.emit('performance:theme-impact', {
      colorCount: Object.keys(theme.colors).length,
      customProperties: Object.keys(theme.colors).length + 
                        Object.keys(theme.spacing).length +
                        Object.keys(theme.effects.borderRadius).length
    });
  }
  
  // Component synchronization
  syncComponentToLayout(componentId: string, componentData: any) {
    const store = useDevCenterStore.getState();
    const { layout } = store;
    
    // Find panels using this component
    const affectedPanels = layout.panels.filter(panel => panel.content?.componentId === componentId);
    
    if (affectedPanels.length > 0) {
      // Update layout panels with new component data
      const updatedPanels = layout.panels.map(panel => {
        if (panel.content?.componentId === componentId) {
          return {
            ...panel,
            content: { ...panel.content, ...componentData }
          };
        }
        return panel;
      });
      
      store.updatePanels(updatedPanels);
      this.emit('layout:component-updated', { componentId, componentData });
    }
  }
  
  // Layout synchronization
  syncLayoutToPerformance() {
    const store = useDevCenterStore.getState();
    const { layout } = store;
    
    // Calculate performance metrics
    const panelCount = layout.panels.length;
    const gridComplexity = layout.gridSettings.rows * layout.gridSettings.columns;
    const estimatedRenderTime = (panelCount * 2) + (gridComplexity * 0.1);
    
    // Update performance metrics
    store.updateMetrics({
      renderTime: estimatedRenderTime
    });
    
    // Add validation results for complex layouts
    if (panelCount > 20) {
      store.addValidationResult({
        id: `layout-complexity-${Date.now()}`,
        type: 'layout',
        severity: 'warning',
        message: `Layout has ${panelCount} panels, consider reducing complexity`,
        timestamp: new Date()
      });
    }
    
    this.emit('performance:layout-updated', { panelCount, gridComplexity, estimatedRenderTime });
  }
  
  // Performance synchronization
  syncPerformanceToAllTools() {
    const store = useDevCenterStore.getState();
    const { performance } = store;
    
    // Notify theme studio of performance impact
    this.emit('theme:performance-impact', {
      renderTime: performance.metrics.renderTime,
      suggestions: performance.optimizationSuggestions.filter(s => s.includes('theme'))
    });
    
    // Notify component workshop of performance impact
    this.emit('component:performance-impact', {
      renderTime: performance.metrics.renderTime,
      suggestions: performance.optimizationSuggestions.filter(s => s.includes('component'))
    });
    
    // Notify layout designer of performance impact
    this.emit('layout:performance-impact', {
      renderTime: performance.metrics.renderTime,
      suggestions: performance.optimizationSuggestions.filter(s => s.includes('layout'))
    });
  }
  
  // Export/Import synchronization
  syncExportData(type: 'theme' | 'component' | 'layout', data: any) {
    const store = useDevCenterStore.getState();
    
    // Add to export history
    store.addToExportHistory({
      id: `${type}-${Date.now()}`,
      type,
      timestamp: new Date(),
      data
    });
    
    // Set clipboard data
    store.setClipboardData(data);
    
    // Notify all tools of export
    this.emit('export:completed', { type, data });
  }
  
  // Undo/Redo synchronization
  syncUndoRedo(action: 'undo' | 'redo') {
    const store = useDevCenterStore.getState();
    
    if (action === 'undo') {
      store.undo();
    } else {
      store.redo();
    }
    
    // Notify all tools of undo/redo
    this.emit('history:changed', { action });
    
    // Re-sync all tools after state change
    this.syncThemeToAllTools();
    this.syncLayoutToPerformance();
  }
  
  // Validation synchronization
  syncValidationAcrossTools() {
    const store = useDevCenterStore.getState();
    const { theme, component, layout, performance } = store;
    
    // Clear previous validation results
    store.clearValidationResults();
    
    // Theme validation
    if (Object.keys(theme.colors).length > 50) {
      store.addValidationResult({
        id: `theme-colors-${Date.now()}`,
        type: 'theme',
        severity: 'warning',
        message: 'Theme has too many color variables, consider consolidating',
        timestamp: new Date()
      });
    }
    
    // Component validation
    const failedTests = Object.values(component.testResults)
      .reduce((acc, result) => acc + result.failed, 0);
    
    if (failedTests > 0) {
      store.addValidationResult({
        id: `component-tests-${Date.now()}`,
        type: 'component',
        severity: 'error',
        message: `${failedTests} component tests are failing`,
        timestamp: new Date()
      });
    }
    
    // Layout validation
    const overlappingPanels = this.detectOverlappingPanels(layout.panels);
    if (overlappingPanels.length > 0) {
      store.addValidationResult({
        id: `layout-overlap-${Date.now()}`,
        type: 'layout',
        severity: 'warning',
        message: `${overlappingPanels.length} panels are overlapping`,
        timestamp: new Date()
      });
    }
    
    // Performance validation
    if (performance.metrics.renderTime > 100) {
      store.addValidationResult({
        id: `performance-render-${Date.now()}`,
        type: 'performance',
        severity: 'error',
        message: 'Render time exceeds 100ms threshold',
        timestamp: new Date()
      });
    }
    
    this.emit('validation:completed', {
      totalIssues: store.performance.validationResults.length
    });
  }
  
  // Utility methods
  private updateCSSProperties(colors: Record<string, string>) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
  
  private detectOverlappingPanels(panels: any[]) {
    const overlapping = [];
    
    for (let i = 0; i < panels.length; i++) {
      for (let j = i + 1; j < panels.length; j++) {
        const panel1 = panels[i];
        const panel2 = panels[j];
        
        if (this.panelsOverlap(panel1, panel2)) {
          overlapping.push({ panel1: panel1.id, panel2: panel2.id });
        }
      }
    }
    
    return overlapping;
  }
  
  private panelsOverlap(panel1: any, panel2: any): boolean {
    return !(
      panel1.x + panel1.width <= panel2.x ||
      panel2.x + panel2.width <= panel1.x ||
      panel1.y + panel1.height <= panel2.y ||
      panel2.y + panel2.height <= panel1.y
    );
  }
  
  // Initialize synchronization
  initialize() {
    // Set up automatic synchronization
    useDevCenterStore.subscribe(
      (state) => state.theme,
      (theme) => {
        if (theme.isDirty) {
          this.syncThemeToAllTools();
        }
      }
    );
    
    useDevCenterStore.subscribe(
      (state) => state.layout.panels,
      () => {
        this.syncLayoutToPerformance();
      }
    );
    
    useDevCenterStore.subscribe(
      (state) => state.performance.validationResults,
      () => {
        this.syncPerformanceToAllTools();
      }
    );
    
    console.log('DevCenter synchronization initialized');
  }
}

// Export singleton instance
export const devCenterSync = DevCenterSynchronizer.getInstance();