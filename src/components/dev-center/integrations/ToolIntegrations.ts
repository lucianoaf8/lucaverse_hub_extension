import { useDevCenterStore } from '../state/DevCenterState';
import { devCenterSync } from '../state/synchronizer';

// Tool integration manager for bidirectional sync
export class ToolIntegrations {
  private static instance: ToolIntegrations;
  private integrationMap: Map<string, Array<string>> = new Map();
  
  static getInstance(): ToolIntegrations {
    if (!ToolIntegrations.instance) {
      ToolIntegrations.instance = new ToolIntegrations();
    }
    return ToolIntegrations.instance;
  }
  
  constructor() {
    this.setupIntegrationMap();
    this.initializeIntegrations();
  }
  
  private setupIntegrationMap() {
    // Define which tools are integrated with each other
    this.integrationMap.set('theme', ['component', 'layout', 'performance']);
    this.integrationMap.set('component', ['theme', 'layout', 'performance']);
    this.integrationMap.set('layout', ['theme', 'component', 'performance']);
    this.integrationMap.set('performance', ['theme', 'component', 'layout']);
  }
  
  private initializeIntegrations() {
    // Theme Studio integrations
    this.setupThemeStudioIntegrations();
    
    // Component Workshop integrations
    this.setupComponentWorkshopIntegrations();
    
    // Layout Designer integrations
    this.setupLayoutDesignerIntegrations();
    
    // Quality Gate integrations
    this.setupQualityGateIntegrations();
    
    console.log('Tool integrations initialized');
  }
  
  // Theme Studio integrations
  private setupThemeStudioIntegrations() {
    // Theme → Component integration
    devCenterSync.subscribe('theme:updated', (theme) => {
      const store = useDevCenterStore.getState();
      
      // Update component previews with new theme
      Object.keys(store.component.componentStates).forEach(componentId => {
        const currentState = store.component.componentStates[componentId];
        store.updateComponentState(componentId, {
          ...currentState,
          theme: theme,
          needsRender: true
        });
      });
      
      // Trigger component re-evaluation
      devCenterSync.emit('component:theme-applied', { theme, affectedComponents: Object.keys(store.component.componentStates) });
    });
    
    // Theme → Layout integration
    devCenterSync.subscribe('theme:updated', (theme) => {
      const store = useDevCenterStore.getState();
      
      // Update layout panels with new theme
      const updatedPanels = store.layout.panels.map(panel => ({
        ...panel,
        style: {
          ...panel.style,
          '--panel-bg': theme.colors.elevated || '#1a1a1a',
          '--panel-border': theme.colors.border || '#404040'
        }
      }));
      
      store.updatePanels(updatedPanels);
      devCenterSync.emit('layout:theme-applied', { theme, updatedPanels: updatedPanels.length });
    });
    
    // Theme → Performance integration
    devCenterSync.subscribe('theme:updated', (theme) => {
      const store = useDevCenterStore.getState();
      
      // Calculate theme complexity impact
      const colorCount = Object.keys(theme.colors).length;
      const customPropsCount = colorCount + Object.keys(theme.spacing).length;
      const complexityScore = Math.min(100, (customPropsCount / 50) * 100);
      
      // Update performance metrics
      store.updateMetrics({
        renderTime: store.performance.metrics.renderTime + (complexityScore * 0.1)
      });
      
      // Add validation if theme is too complex
      if (colorCount > 30) {
        store.addValidationResult({
          id: `theme-complexity-${Date.now()}`,
          type: 'theme',
          severity: 'warning',
          message: `Theme has ${colorCount} colors, consider consolidating`,
          timestamp: new Date()
        });
      }
    });
  }
  
  // Component Workshop integrations
  private setupComponentWorkshopIntegrations() {
    // Component → Theme integration
    devCenterSync.subscribe('component:theme-changed', (data) => {
      const store = useDevCenterStore.getState();
      
      // Extract theme data from component usage
      if (data.extractedColors) {
        store.updateThemeColors(data.extractedColors);
      }
      
      devCenterSync.emit('theme:component-feedback', { 
        componentId: data.componentId,
        themeUsage: data.themeUsage 
      });
    });
    
    // Component → Layout integration
    devCenterSync.subscribe('component:updated', (data) => {
      const store = useDevCenterStore.getState();
      
      // Update layout panels that use this component
      const updatedPanels = store.layout.panels.map(panel => {
        if (panel.content?.componentId === data.componentId) {
          return {
            ...panel,
            content: {
              ...panel.content,
              component: data.componentData,
              lastUpdated: new Date()
            }
          };
        }
        return panel;
      });
      
      store.updatePanels(updatedPanels);
      devCenterSync.syncLayoutToPerformance();
    });
    
    // Component → Performance integration
    devCenterSync.subscribe('component:test-completed', (data) => {
      const store = useDevCenterStore.getState();
      
      // Calculate performance impact of component tests
      const testComplexity = data.testCount * 2;
      const failureImpact = data.failures * 5;
      
      store.updateMetrics({
        renderTime: store.performance.metrics.renderTime + testComplexity + failureImpact
      });
      
      // Add validation for failed tests
      if (data.failures > 0) {
        store.addValidationResult({
          id: `component-test-${Date.now()}`,
          type: 'component',
          severity: 'error',
          message: `Component ${data.componentId} has ${data.failures} failing tests`,
          timestamp: new Date()
        });
      }
    });
  }
  
  // Layout Designer integrations
  private setupLayoutDesignerIntegrations() {
    // Layout → Theme integration
    devCenterSync.subscribe('layout:updated', (data) => {
      const store = useDevCenterStore.getState();
      
      // Extract theme requirements from layout
      const themeRequirements = this.extractThemeRequirements(data.panels);
      
      if (themeRequirements.missingColors.length > 0) {
        // Suggest theme colors based on layout needs
        const suggestedColors = this.generateSuggestedColors(themeRequirements.missingColors);
        devCenterSync.emit('theme:layout-suggestions', { suggestedColors });
      }
    });
    
    // Layout → Component integration
    devCenterSync.subscribe('layout:panel-added', (data) => {
      const store = useDevCenterStore.getState();
      
      // If panel contains a component, ensure it's selected
      if (data.panel.content?.componentId) {
        store.selectComponent(data.panel.content.componentId);
        
        // Trigger component state update
        devCenterSync.emit('component:layout-integration', {
          componentId: data.panel.content.componentId,
          panelId: data.panel.id,
          constraints: {
            width: data.panel.width,
            height: data.panel.height
          }
        });
      }
    });
    
    // Layout → Performance integration (already handled in synchronizer)
  }
  
  // Quality Gate integrations
  private setupQualityGateIntegrations() {
    // Performance → Theme integration
    devCenterSync.subscribe('performance:threshold-exceeded', (data) => {
      const store = useDevCenterStore.getState();
      
      if (data.type === 'render-time' && data.cause === 'theme') {
        // Suggest theme optimizations
        const suggestions = this.generateThemeOptimizations(store.theme);
        store.updateOptimizationSuggestions([
          ...store.performance.optimizationSuggestions,
          ...suggestions
        ]);
      }
    });
    
    // Performance → Component integration
    devCenterSync.subscribe('performance:component-impact', (data) => {
      const store = useDevCenterStore.getState();
      
      // Mark slow components for optimization
      if (data.renderTime > 50) {
        store.updateComponentState(data.componentId, {
          ...store.component.componentStates[data.componentId],
          performanceFlag: 'slow',
          optimizationSuggestions: data.suggestions
        });
      }
    });
    
    // Performance → Layout integration
    devCenterSync.subscribe('performance:layout-impact', (data) => {
      const store = useDevCenterStore.getState();
      
      // Flag complex layouts
      if (data.panelCount > 15) {
        store.addValidationResult({
          id: `layout-performance-${Date.now()}`,
          type: 'layout',
          severity: 'warning',
          message: `Layout complexity may impact performance (${data.panelCount} panels)`,
          timestamp: new Date()
        });
      }
    });
  }
  
  // Integration utilities
  private extractThemeRequirements(panels: any[]) {
    const usedColors = new Set<string>();
    const missingColors = [];
    
    panels.forEach(panel => {
      if (panel.style) {
        Object.values(panel.style).forEach(value => {
          if (typeof value === 'string' && value.includes('var(--')) {
            const colorVar = value.match(/var\(--color-(\w+)\)/);
            if (colorVar) {
              usedColors.add(colorVar[1]);
            }
          }
        });
      }
    });
    
    const store = useDevCenterStore.getState();
    const definedColors = Object.keys(store.theme.colors);
    
    usedColors.forEach(color => {
      if (!definedColors.includes(color)) {
        missingColors.push(color);
      }
    });
    
    return { usedColors: Array.from(usedColors), missingColors };
  }
  
  private generateSuggestedColors(missingColors: string[]) {
    const colorSuggestions: Record<string, string> = {};
    
    missingColors.forEach(color => {
      // Generate appropriate colors based on semantic naming
      switch (color) {
        case 'primary':
          colorSuggestions[color] = '#3b82f6';
          break;
        case 'secondary':
          colorSuggestions[color] = '#6b7280';
          break;
        case 'success':
          colorSuggestions[color] = '#10b981';
          break;
        case 'warning':
          colorSuggestions[color] = '#f59e0b';
          break;
        case 'error':
          colorSuggestions[color] = '#ef4444';
          break;
        default:
          colorSuggestions[color] = '#6b7280';
      }
    });
    
    return colorSuggestions;
  }
  
  private generateThemeOptimizations(theme: any) {
    const suggestions = [];
    
    const colorCount = Object.keys(theme.colors).length;
    if (colorCount > 20) {
      suggestions.push('Consider consolidating similar colors to reduce CSS custom properties');
    }
    
    const spacingCount = Object.keys(theme.spacing).length;
    if (spacingCount > 15) {
      suggestions.push('Reduce spacing scale complexity for better performance');
    }
    
    return suggestions;
  }
  
  // Manual integration triggers
  syncAllTools() {
    devCenterSync.syncThemeToAllTools();
    devCenterSync.syncLayoutToPerformance();
    devCenterSync.syncValidationAcrossTools();
  }
  
  // Get integration status
  getIntegrationStatus() {
    const store = useDevCenterStore.getState();
    
    return {
      theme: {
        connected: ['component', 'layout', 'performance'],
        lastSync: store.theme.lastModified,
        health: store.theme.isDirty ? 'pending' : 'synced'
      },
      component: {
        connected: ['theme', 'layout', 'performance'],
        lastSync: new Date(),
        health: store.component.buildQueue.length > 0 ? 'pending' : 'synced'
      },
      layout: {
        connected: ['theme', 'component', 'performance'],
        lastSync: new Date(),
        health: store.layout.panels.length > 0 ? 'active' : 'idle'
      },
      performance: {
        connected: ['theme', 'component', 'layout'],
        lastSync: new Date(),
        health: store.performance.validationResults.length > 0 ? 'issues' : 'healthy'
      }
    };
  }
}

// Export singleton instance
export const toolIntegrations = ToolIntegrations.getInstance();