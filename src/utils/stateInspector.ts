/**
 * State Inspector - Comprehensive state analysis and debugging utilities
 * Provides deep state analysis, anomaly detection, and reporting
 */

import type { PanelLayout, Position, Size } from '../types/panel';
import type { LayoutState, GridSettings } from '../types/layout';

export interface StateAnalysis {
  isValid: boolean;
  issues: StateIssue[];
  warnings: StateWarning[];
  metrics: StateMetrics;
  timestamp: number;
}

export interface StateIssue {
  type: 'critical' | 'error' | 'warning';
  category: 'layout' | 'data' | 'performance' | 'memory';
  description: string;
  location?: string;
  severity: number; // 1-10
  suggestedFix?: string;
}

export interface StateWarning {
  type: 'performance' | 'usability' | 'accessibility';
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface StateMetrics {
  totalPanels: number;
  selectedPanels: number;
  overlappingPanels: number;
  outOfBoundsPanels: number;
  totalStateSize: number;
  averagePanelSize: number;
  memoryUsage: number;
  renderComplexity: number;
}

export interface StateReport {
  summary: {
    status: 'healthy' | 'warning' | 'critical';
    score: number; // 0-100
    lastAnalyzed: number;
  };
  analysis: StateAnalysis;
  recommendations: string[];
  historyComparison?: {
    previousScore: number;
    trend: 'improving' | 'stable' | 'degrading';
    changedMetrics: string[];
  };
}

export class StateInspector {
  private analysisHistory: StateAnalysis[] = [];
  private maxHistorySize = 50;

  /**
   * Analyze layout state for issues and anomalies
   */
  analyzeLayoutState(layoutState: Partial<LayoutState>): StateAnalysis {
    const issues: StateIssue[] = [];
    const warnings: StateWarning[] = [];

    const panels = layoutState.panels || [];
    const gridSettings = layoutState.gridSettings;
    const viewport = layoutState.viewport;

    // Panel overlap detection
    const overlaps = this.detectPanelOverlaps(panels);
    if (overlaps.length > 0) {
      issues.push({
        type: 'error',
        category: 'layout',
        description: `${overlaps.length} panel overlaps detected`,
        severity: 7,
        suggestedFix: 'Adjust panel positions to eliminate overlaps',
      });
    }

    // Out of bounds detection
    const outOfBounds = this.detectOutOfBoundsPanels(panels, viewport?.bounds);
    if (outOfBounds.length > 0) {
      issues.push({
        type: 'error',
        category: 'layout',
        description: `${outOfBounds.length} panels are outside viewport bounds`,
        severity: 6,
        suggestedFix: 'Move panels within viewport boundaries',
      });
    }

    // Performance warnings
    if (panels.length > 20) {
      warnings.push({
        type: 'performance',
        description: 'High panel count may impact performance',
        impact: 'medium',
      });
    }

    // Memory usage analysis
    const stateSize = this.calculateStateSize(layoutState);
    if (stateSize > 1024 * 1024) {
      // 1MB
      issues.push({
        type: 'warning',
        category: 'memory',
        description: 'Large state size detected',
        severity: 4,
        suggestedFix: 'Consider optimizing state structure',
      });
    }

    // Grid validation
    if (gridSettings && this.validateGridSettings(gridSettings)) {
      // Grid settings are valid
    }

    // Panel size validation
    const invalidSizes = this.detectInvalidPanelSizes(panels);
    if (invalidSizes.length > 0) {
      issues.push({
        type: 'warning',
        category: 'layout',
        description: `${invalidSizes.length} panels have invalid sizes`,
        severity: 3,
        suggestedFix: 'Ensure panels meet minimum size requirements',
      });
    }

    // Calculate metrics
    const metrics: StateMetrics = {
      totalPanels: panels.length,
      selectedPanels: layoutState.selectedPanelIds?.length || 0,
      overlappingPanels: overlaps.length,
      outOfBoundsPanels: outOfBounds.length,
      totalStateSize: stateSize,
      averagePanelSize:
        panels.length > 0
          ? panels.reduce((sum, panel) => sum + panel.size.width * panel.size.height, 0) /
            panels.length
          : 0,
      memoryUsage: this.estimateMemoryUsage(layoutState),
      renderComplexity: this.calculateRenderComplexity(panels),
    };

    const analysis: StateAnalysis = {
      isValid: issues.filter(i => i.type === 'critical' || i.type === 'error').length === 0,
      issues,
      warnings,
      metrics,
      timestamp: Date.now(),
    };

    // Store in history
    this.addToHistory(analysis);

    return analysis;
  }

  /**
   * Detect state anomalies and inconsistencies
   */
  detectStateAnomalies(currentState: any, previousState?: any): StateIssue[] {
    const anomalies: StateIssue[] = [];

    // Circular reference detection
    if (this.hasCircularReferences(currentState)) {
      anomalies.push({
        type: 'critical',
        category: 'data',
        description: 'Circular references detected in state',
        severity: 10,
        suggestedFix: 'Remove circular references to prevent infinite loops',
      });
    }

    // Rapid state changes
    if (previousState && this.detectRapidStateChanges(currentState, previousState)) {
      anomalies.push({
        type: 'warning',
        category: 'performance',
        description: 'Rapid state changes detected',
        severity: 5,
        suggestedFix: 'Consider debouncing or batching state updates',
      });
    }

    // Memory leaks
    const memoryGrowth = this.detectMemoryGrowth();
    if (memoryGrowth > 10) {
      // 10MB growth
      anomalies.push({
        type: 'error',
        category: 'memory',
        description: `Potential memory leak: ${memoryGrowth.toFixed(2)}MB growth`,
        severity: 8,
        suggestedFix: 'Check for retained references and cleanup listeners',
      });
    }

    // Data integrity issues
    const integrityIssues = this.validateDataIntegrity(currentState);
    anomalies.push(...integrityIssues);

    return anomalies;
  }

  /**
   * Generate comprehensive state report
   */
  generateStateReport(layoutState: Partial<LayoutState>, appState?: any): StateReport {
    const analysis = this.analyzeLayoutState(layoutState);

    // Calculate health score
    const score = this.calculateHealthScore(analysis);

    // Determine status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (analysis.issues.some(i => i.type === 'critical')) {
      status = 'critical';
    } else if (analysis.issues.some(i => i.type === 'error') || analysis.warnings.length > 3) {
      status = 'warning';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(analysis);

    // History comparison
    const historyComparison = this.compareWithHistory(analysis);

    return {
      summary: {
        status,
        score,
        lastAnalyzed: Date.now(),
      },
      analysis,
      recommendations,
      historyComparison,
    };
  }

  /**
   * Export state for debugging purposes
   */
  exportState(state: any): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      state: this.sanitizeForExport(state),
      analysis: this.analysisHistory.slice(-5), // Last 5 analyses
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import and validate state
   */
  importState(stateJson: string): { valid: boolean; state?: any; errors: string[] } {
    try {
      const imported = JSON.parse(stateJson);
      const errors: string[] = [];

      // Validate structure
      if (!imported.state) {
        errors.push('Missing state data');
      }

      // Validate version compatibility
      if (imported.version && !this.isVersionCompatible(imported.version)) {
        errors.push(`Incompatible version: ${imported.version}`);
      }

      // Additional validation
      const validationErrors = this.validateImportedState(imported.state);
      errors.push(...validationErrors);

      return {
        valid: errors.length === 0,
        state: errors.length === 0 ? imported.state : undefined,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  // Private helper methods

  private detectPanelOverlaps(panels: PanelLayout[]): Array<{ panel1: string; panel2: string }> {
    const overlaps: Array<{ panel1: string; panel2: string }> = [];

    for (let i = 0; i < panels.length; i++) {
      for (let j = i + 1; j < panels.length; j++) {
        if (this.panelsOverlap(panels[i], panels[j])) {
          overlaps.push({ panel1: panels[i].id, panel2: panels[j].id });
        }
      }
    }

    return overlaps;
  }

  private panelsOverlap(panel1: PanelLayout, panel2: PanelLayout): boolean {
    const rect1 = {
      left: panel1.position.x,
      right: panel1.position.x + panel1.size.width,
      top: panel1.position.y,
      bottom: panel1.position.y + panel1.size.height,
    };

    const rect2 = {
      left: panel2.position.x,
      right: panel2.position.x + panel2.size.width,
      top: panel2.position.y,
      bottom: panel2.position.y + panel2.size.height,
    };

    return !(
      rect1.right <= rect2.left ||
      rect2.right <= rect1.left ||
      rect1.bottom <= rect2.top ||
      rect2.bottom <= rect1.top
    );
  }

  private detectOutOfBoundsPanels(
    panels: PanelLayout[],
    bounds?: { width: number; height: number }
  ): string[] {
    if (!bounds) return [];

    return panels
      .filter(
        panel =>
          panel.position.x < 0 ||
          panel.position.y < 0 ||
          panel.position.x + panel.size.width > bounds.width ||
          panel.position.y + panel.size.height > bounds.height
      )
      .map(panel => panel.id);
  }

  private calculateStateSize(state: any): number {
    return JSON.stringify(state).length;
  }

  private validateGridSettings(gridSettings: GridSettings): boolean {
    return (
      gridSettings.size > 0 &&
      gridSettings.opacity >= 0 &&
      gridSettings.opacity <= 1 &&
      gridSettings.snapThreshold >= 0
    );
  }

  private detectInvalidPanelSizes(panels: PanelLayout[]): string[] {
    return panels
      .filter(
        panel =>
          panel.size.width <= 0 ||
          panel.size.height <= 0 ||
          panel.size.width > 4000 ||
          panel.size.height > 4000
      )
      .map(panel => panel.id);
  }

  private estimateMemoryUsage(state: any): number {
    // Rough estimation of memory usage in bytes
    const stateString = JSON.stringify(state);
    return stateString.length * 2; // Assuming UTF-16 encoding
  }

  private calculateRenderComplexity(panels: PanelLayout[]): number {
    // Simple complexity calculation based on panel count and overlaps
    let complexity = panels.length;

    // Add complexity for overlapping panels
    const overlaps = this.detectPanelOverlaps(panels);
    complexity += overlaps.length * 2;

    // Add complexity for large panels
    complexity += panels.filter(p => p.size.width * p.size.height > 100000).length;

    return complexity;
  }

  private hasCircularReferences(obj: any, seen = new WeakSet()): boolean {
    if (obj !== null && typeof obj === 'object') {
      if (seen.has(obj)) return true;
      seen.add(obj);

      for (const key in obj) {
        if (this.hasCircularReferences(obj[key], seen)) {
          return true;
        }
      }
    }
    return false;
  }

  private detectRapidStateChanges(current: any, previous: any): boolean {
    // Simple implementation - would need more sophisticated tracking in real use
    return JSON.stringify(current) !== JSON.stringify(previous);
  }

  private detectMemoryGrowth(): number {
    if (typeof (performance as any).memory !== 'undefined') {
      const current = (performance as any).memory.usedJSHeapSize;
      // Would need to track previous values for real implementation
      return 0; // Placeholder
    }
    return 0;
  }

  private validateDataIntegrity(state: any): StateIssue[] {
    const issues: StateIssue[] = [];

    // Check for required fields
    if (state.panels && !Array.isArray(state.panels)) {
      issues.push({
        type: 'critical',
        category: 'data',
        description: 'Panels data is not an array',
        severity: 10,
        suggestedFix: 'Ensure panels is always an array',
      });
    }

    return issues;
  }

  private calculateHealthScore(analysis: StateAnalysis): number {
    let score = 100;

    // Deduct points for issues
    analysis.issues.forEach(issue => {
      score -= issue.severity;
    });

    // Deduct points for warnings
    analysis.warnings.forEach(warning => {
      const deduction = warning.impact === 'high' ? 5 : warning.impact === 'medium' ? 3 : 1;
      score -= deduction;
    });

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(analysis: StateAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.metrics.overlappingPanels > 0) {
      recommendations.push('Resolve panel overlaps to improve layout clarity');
    }

    if (analysis.metrics.totalStateSize > 512 * 1024) {
      recommendations.push('Consider optimizing state size to improve performance');
    }

    if (analysis.metrics.totalPanels > 15) {
      recommendations.push('High panel count detected - consider panel grouping or pagination');
    }

    return recommendations;
  }

  private compareWithHistory(analysis: StateAnalysis) {
    if (this.analysisHistory.length < 2) return undefined;

    const previous = this.analysisHistory[this.analysisHistory.length - 2];
    const previousScore = this.calculateHealthScore(previous);
    const currentScore = this.calculateHealthScore(analysis);

    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (currentScore > previousScore + 5) trend = 'improving';
    else if (currentScore < previousScore - 5) trend = 'degrading';

    return {
      previousScore,
      trend,
      changedMetrics: this.getChangedMetrics(previous.metrics, analysis.metrics),
    };
  }

  private getChangedMetrics(prev: StateMetrics, current: StateMetrics): string[] {
    const changed: string[] = [];

    if (prev.totalPanels !== current.totalPanels) changed.push('totalPanels');
    if (prev.overlappingPanels !== current.overlappingPanels) changed.push('overlappingPanels');
    if (Math.abs(prev.totalStateSize - current.totalStateSize) > 1024)
      changed.push('totalStateSize');

    return changed;
  }

  private addToHistory(analysis: StateAnalysis) {
    this.analysisHistory.push(analysis);
    if (this.analysisHistory.length > this.maxHistorySize) {
      this.analysisHistory.shift();
    }
  }

  private sanitizeForExport(state: any): any {
    // Remove sensitive data and circular references
    return JSON.parse(
      JSON.stringify(state, (key, value) => {
        if (typeof value === 'function') return '[Function]';
        if (key.includes('password') || key.includes('token')) return '[REDACTED]';
        return value;
      })
    );
  }

  private isVersionCompatible(version: string): boolean {
    // Simple version compatibility check
    const [major] = version.split('.').map(Number);
    return major === 2; // Only compatible with version 2.x
  }

  private validateImportedState(state: any): string[] {
    const errors: string[] = [];

    if (state.panels && !Array.isArray(state.panels)) {
      errors.push('Invalid panels data structure');
    }

    return errors;
  }
}
