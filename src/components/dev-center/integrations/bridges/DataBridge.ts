import { useDevCenterStore } from '../state/DevCenterState';
import { devCenterSync } from '../state/synchronizer';

// Data bridge for seamless data flow between tools
export class DataBridge {
  private static instance: DataBridge;
  private bridgeMap: Map<string, any> = new Map();
  
  static getInstance(): DataBridge {
    if (!DataBridge.instance) {
      DataBridge.instance = new DataBridge();
    }
    return DataBridge.instance;
  }
  
  // Theme-to-Component bridge
  bridgeThemeToComponent(themeChanges: any) {
    const store = useDevCenterStore.getState();
    
    // Apply theme changes to all active components
    Object.keys(store.component.componentStates).forEach(componentId => {
      const currentState = store.component.componentStates[componentId];
      
      // Create updated component state with theme data
      const updatedState = {
        ...currentState,
        theme: {
          ...currentState.theme,
          ...themeChanges
        },
        lastThemeUpdate: new Date(),
        needsRerender: true
      };
      
      store.updateComponentState(componentId, updatedState);
    });
    
    // Trigger component re-evaluation
    devCenterSync.emit('component:theme-bridge-update', {
      affectedComponents: Object.keys(store.component.componentStates),
      themeChanges
    });
  }
  
  // Component-to-Layout bridge
  bridgeComponentToLayout(componentId: string, componentData: any) {
    const store = useDevCenterStore.getState();
    
    // Find and update all layout panels using this component
    const updatedPanels = store.layout.panels.map(panel => {
      if (panel.content?.componentId === componentId) {
        return {
          ...panel,
          content: {
            ...panel.content,
            componentData,
            dimensions: {
              minWidth: componentData.minWidth || 100,
              minHeight: componentData.minHeight || 100,
              maxWidth: componentData.maxWidth || 1000,
              maxHeight: componentData.maxHeight || 1000
            }
          },
          lastComponentUpdate: new Date()
        };
      }
      return panel;
    });
    
    if (updatedPanels.some(p => p.lastComponentUpdate)) {
      store.updatePanels(updatedPanels);
      devCenterSync.emit('layout:component-bridge-update', {
        componentId,
        updatedPanels: updatedPanels.filter(p => p.lastComponentUpdate).length
      });
    }
  }
  
  // Layout-to-Performance bridge
  bridgeLayoutToPerformance(layoutChanges: any) {
    const store = useDevCenterStore.getState();
    
    // Calculate performance impact
    const complexity = this.calculateLayoutComplexity(layoutChanges);
    const renderImpact = complexity.panelCount * 2 + complexity.interactionCount * 0.5;
    
    // Update performance metrics
    store.updateMetrics({
      renderTime: Math.max(0, store.performance.metrics.renderTime + renderImpact)
    });
    
    // Add performance recommendations
    const recommendations = this.generateLayoutPerformanceRecommendations(complexity);
    if (recommendations.length > 0) {
      store.updateOptimizationSuggestions([
        ...store.performance.optimizationSuggestions,
        ...recommendations
      ]);
    }
    
    devCenterSync.emit('performance:layout-bridge-update', {
      complexity,
      renderImpact,
      recommendations
    });
  }
  
  // Performance-to-All bridge
  bridgePerformanceToAll(performanceData: any) {
    const store = useDevCenterStore.getState();
    
    // Theme optimizations
    if (performanceData.themeImpact > 10) {
      const themeOptimizations = this.generateThemeOptimizations(store.theme);
      devCenterSync.emit('theme:performance-bridge-update', {
        impact: performanceData.themeImpact,
        optimizations: themeOptimizations
      });
    }
    
    // Component optimizations
    if (performanceData.componentImpact > 15) {
      const componentOptimizations = this.generateComponentOptimizations(store.component);
      devCenterSync.emit('component:performance-bridge-update', {
        impact: performanceData.componentImpact,
        optimizations: componentOptimizations
      });
    }
    
    // Layout optimizations
    if (performanceData.layoutImpact > 20) {
      const layoutOptimizations = this.generateLayoutOptimizations(store.layout);
      devCenterSync.emit('layout:performance-bridge-update', {
        impact: performanceData.layoutImpact,
        optimizations: layoutOptimizations
      });
    }
  }
  
  // Cross-tool validation bridge
  bridgeValidation() {
    const store = useDevCenterStore.getState();
    
    // Clear previous validation results
    store.clearValidationResults();
    
    // Theme validation
    this.validateTheme(store.theme);
    
    // Component validation
    this.validateComponents(store.component);
    
    // Layout validation
    this.validateLayout(store.layout);
    
    // Performance validation
    this.validatePerformance(store.performance);
    
    // Cross-tool validation
    this.validateCrossTool(store);
    
    devCenterSync.emit('validation:bridge-complete', {
      totalIssues: store.performance.validationResults.length
    });
  }
  
  // Data export bridge
  bridgeExport(exportType: 'theme' | 'component' | 'layout' | 'all') {
    const store = useDevCenterStore.getState();
    
    let exportData: any = {};
    
    switch (exportType) {
      case 'theme':
        exportData = {
          type: 'theme',
          data: store.theme,
          timestamp: new Date(),
          version: '1.0'
        };
        break;
        
      case 'component':
        exportData = {
          type: 'component',
          data: {
            selectedComponent: store.component.selectedComponent,
            componentStates: store.component.componentStates,
            testResults: store.component.testResults
          },
          timestamp: new Date(),
          version: '1.0'
        };
        break;
        
      case 'layout':
        exportData = {
          type: 'layout',
          data: {
            panels: store.layout.panels,
            gridSettings: store.layout.gridSettings,
            activeLayout: store.layout.activeLayout
          },
          timestamp: new Date(),
          version: '1.0'
        };
        break;
        
      case 'all':
        exportData = {
          type: 'complete',
          data: {
            theme: store.theme,
            component: store.component,
            layout: store.layout,
            performance: store.performance
          },
          timestamp: new Date(),
          version: '1.0'
        };
        break;
    }
    
    // Add to export history
    store.addToExportHistory({
      id: `bridge-export-${Date.now()}`,
      type: exportType === 'all' ? 'theme' : exportType,
      timestamp: new Date(),
      data: exportData
    });
    
    // Set clipboard data
    store.setClipboardData(exportData);
    
    devCenterSync.emit('export:bridge-complete', {
      exportType,
      dataSize: JSON.stringify(exportData).length
    });
    
    return exportData;
  }
  
  // Data import bridge
  bridgeImport(importData: any) {
    const store = useDevCenterStore.getState();
    
    try {
      // Validate import data
      if (!importData.type || !importData.data) {
        throw new Error('Invalid import data format');
      }
      
      // Import based on type
      switch (importData.type) {
        case 'theme':
          store.updateThemeColors(importData.data.colors || {});
          store.updateThemeTypography(importData.data.typography || {});
          store.updateThemeSpacing(importData.data.spacing || {});
          store.updateThemeEffects(importData.data.effects || {});
          break;
          
        case 'component':
          if (importData.data.selectedComponent) {
            store.selectComponent(importData.data.selectedComponent);
          }
          Object.entries(importData.data.componentStates || {}).forEach(([id, state]) => {
            store.updateComponentState(id, state);
          });
          break;
          
        case 'layout':
          if (importData.data.panels) {
            store.updatePanels(importData.data.panels);
          }
          if (importData.data.gridSettings) {
            store.updateGridSettings(importData.data.gridSettings);
          }
          if (importData.data.activeLayout) {
            store.setActiveLayout(importData.data.activeLayout);
          }
          break;
          
        case 'complete':
          store.importState(importData.data);
          break;
      }
      
      // Trigger full sync after import
      devCenterSync.syncThemeToAllTools();
      devCenterSync.syncLayoutToPerformance();
      
      devCenterSync.emit('import:bridge-complete', {
        importType: importData.type,
        success: true
      });
      
      return { success: true };
      
    } catch (error) {
      devCenterSync.emit('import:bridge-error', {
        error: error.message,
        importData
      });
      
      return { success: false, error: error.message };
    }
  }
  
  // Utility methods
  private calculateLayoutComplexity(layoutChanges: any) {
    return {
      panelCount: layoutChanges.panels?.length || 0,
      interactionCount: layoutChanges.interactions?.length || 0,
      nestingLevel: this.calculateNestingLevel(layoutChanges.panels || [])
    };
  }
  
  private calculateNestingLevel(panels: any[]): number {
    return panels.reduce((max, panel) => {
      if (panel.children) {
        return Math.max(max, 1 + this.calculateNestingLevel(panel.children));
      }
      return max;
    }, 0);
  }
  
  private generateLayoutPerformanceRecommendations(complexity: any) {
    const recommendations = [];
    
    if (complexity.panelCount > 15) {
      recommendations.push('Consider reducing panel count for better performance');
    }
    
    if (complexity.nestingLevel > 3) {
      recommendations.push('Deep nesting may impact render performance');
    }
    
    if (complexity.interactionCount > 10) {
      recommendations.push('Too many interactions may cause performance issues');
    }
    
    return recommendations;
  }
  
  private generateThemeOptimizations(theme: any) {
    const optimizations = [];
    
    if (Object.keys(theme.colors).length > 25) {
      optimizations.push('Consolidate similar colors');
    }
    
    if (Object.keys(theme.spacing).length > 12) {
      optimizations.push('Simplify spacing scale');
    }
    
    return optimizations;
  }
  
  private generateComponentOptimizations(component: any) {
    const optimizations = [];
    
    if (component.buildQueue.length > 5) {
      optimizations.push('Process build queue to improve performance');
    }
    
    const failedTests = Object.values(component.testResults)
      .reduce((acc: number, result: any) => acc + result.failed, 0);
    
    if (failedTests > 0) {
      optimizations.push('Fix failing tests to improve stability');
    }
    
    return optimizations;
  }
  
  private generateLayoutOptimizations(layout: any) {
    const optimizations = [];
    
    if (layout.panels.length > 20) {
      optimizations.push('Consider breaking layout into smaller sections');
    }
    
    return optimizations;
  }
  
  private validateTheme(theme: any) {
    const store = useDevCenterStore.getState();
    
    // Color validation
    const colorCount = Object.keys(theme.colors).length;
    if (colorCount > 30) {
      store.addValidationResult({
        id: `theme-colors-${Date.now()}`,
        type: 'theme',
        severity: 'warning',
        message: `Theme has ${colorCount} colors, consider consolidating`,
        timestamp: new Date()
      });
    }
    
    // Typography validation
    if (!theme.typography.fontFamily) {
      store.addValidationResult({
        id: `theme-typography-${Date.now()}`,
        type: 'theme',
        severity: 'error',
        message: 'No font family specified in theme',
        timestamp: new Date()
      });
    }
  }
  
  private validateComponents(component: any) {
    const store = useDevCenterStore.getState();
    
    // Test results validation
    const failedTests = Object.values(component.testResults)
      .reduce((acc: number, result: any) => acc + result.failed, 0);
    
    if (failedTests > 0) {
      store.addValidationResult({
        id: `component-tests-${Date.now()}`,
        type: 'component',
        severity: 'error',
        message: `${failedTests} component tests are failing`,
        timestamp: new Date()
      });
    }
    
    // Build queue validation
    if (component.buildQueue.length > 10) {
      store.addValidationResult({
        id: `component-queue-${Date.now()}`,
        type: 'component',
        severity: 'warning',
        message: 'Build queue is getting large, consider processing',
        timestamp: new Date()
      });
    }
  }
  
  private validateLayout(layout: any) {
    const store = useDevCenterStore.getState();
    
    // Panel overlap validation
    const overlaps = this.detectPanelOverlaps(layout.panels);
    if (overlaps.length > 0) {
      store.addValidationResult({
        id: `layout-overlap-${Date.now()}`,
        type: 'layout',
        severity: 'warning',
        message: `${overlaps.length} panels are overlapping`,
        timestamp: new Date()
      });
    }
    
    // Grid validation
    if (layout.gridSettings.rows * layout.gridSettings.columns > 200) {
      store.addValidationResult({
        id: `layout-grid-${Date.now()}`,
        type: 'layout',
        severity: 'warning',
        message: 'Grid may be too complex for optimal performance',
        timestamp: new Date()
      });
    }
  }
  
  private validatePerformance(performance: any) {
    const store = useDevCenterStore.getState();
    
    // Performance metrics validation
    if (performance.metrics.renderTime > 100) {
      store.addValidationResult({
        id: `performance-render-${Date.now()}`,
        type: 'performance',
        severity: 'error',
        message: 'Render time exceeds 100ms threshold',
        timestamp: new Date()
      });
    }
    
    if (performance.metrics.bundleSize > 1024 * 1024) {
      store.addValidationResult({
        id: `performance-bundle-${Date.now()}`,
        type: 'performance',
        severity: 'warning',
        message: 'Bundle size exceeds 1MB',
        timestamp: new Date()
      });
    }
  }
  
  private validateCrossTool(store: any) {
    // Theme-Component consistency
    const themeColors = Object.keys(store.theme.colors);
    const componentThemes = Object.values(store.component.componentStates)
      .map((state: any) => state.theme?.colors || {});
    
    // Check for inconsistencies
    componentThemes.forEach((componentTheme, index) => {
      const missingColors = Object.keys(componentTheme).filter(color => !themeColors.includes(color));
      if (missingColors.length > 0) {
        store.addValidationResult({
          id: `cross-tool-theme-${Date.now()}`,
          type: 'theme',
          severity: 'warning',
          message: `Component uses undefined theme colors: ${missingColors.join(', ')}`,
          timestamp: new Date()
        });
      }
    });
  }
  
  private detectPanelOverlaps(panels: any[]) {
    const overlaps = [];
    
    for (let i = 0; i < panels.length; i++) {
      for (let j = i + 1; j < panels.length; j++) {
        if (this.panelsOverlap(panels[i], panels[j])) {
          overlaps.push({ panel1: panels[i].id, panel2: panels[j].id });
        }
      }
    }
    
    return overlaps;
  }
  
  private panelsOverlap(panel1: any, panel2: any): boolean {
    return !(
      panel1.x + panel1.width <= panel2.x ||
      panel2.x + panel2.width <= panel1.x ||
      panel1.y + panel1.height <= panel2.y ||
      panel2.y + panel2.height <= panel1.y
    );
  }
}

// Export singleton instance
export const dataBridge = DataBridge.getInstance();