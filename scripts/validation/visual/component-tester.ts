/**
 * Component State Testing System
 * Comprehensive testing for component states with DOM snapshots and style comparisons
 */

import { Page } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { UISimulator, ComponentState, ComponentInfo } from './ui-simulator.js';

export interface StateTransition {
  from: string;
  to: string;
  duration: number;
  smooth: boolean;
  properties: string[];
}

export interface ComponentTestResult {
  component: ComponentInfo;
  stateTransitions: StateTransition[];
  styleComparisons: StyleComparison[];
  domDifferences: DOMDifference[];
  performanceMetrics: StatePerformanceMetrics;
  issues: ComponentIssue[];
}

export interface StyleComparison {
  state: string;
  properties: Record<string, {
    value: string;
    expected?: string;
    matches: boolean;
  }>;
}

export interface DOMDifference {
  state: string;
  additions: string[];
  removals: string[];
  modifications: string[];
}

export interface StatePerformanceMetrics {
  transitionTimes: Record<string, number>;
  repaintCount: Record<string, number>;
  memoryImpact: Record<string, number>;
}

export interface ComponentIssue {
  type: 'accessibility' | 'performance' | 'styling' | 'functionality';
  severity: 'error' | 'warning' | 'info';
  state: string;
  message: string;
  suggestion?: string;
}

export class ComponentTester {
  private simulator: UISimulator;
  private page: Page | null = null;
  private reportsDir: string;

  constructor(simulator: UISimulator) {
    this.simulator = simulator;
    this.reportsDir = path.join(process.cwd(), 'scripts/validation/reports/component-tests');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.reportsDir, { recursive: true });
    this.page = (this.simulator as any).page; // Access private page property
  }

  async testAllComponents(): Promise<ComponentTestResult[]> {
    if (!this.page) throw new Error('Component tester not initialized');

    console.log('🧪 Starting comprehensive component testing...');
    
    const components = await this.simulator.captureComponentStates();
    const results: ComponentTestResult[] = [];

    for (const component of components) {
      console.log(`🔬 Testing component: ${component.name}`);
      
      const result = await this.testComponent(component);
      results.push(result);
      
      // Save individual component result
      const componentResultPath = path.join(this.reportsDir, `${component.name}-test-result.json`);
      await fs.writeFile(componentResultPath, JSON.stringify(result, null, 2));
    }

    // Save combined results
    const allResultsPath = path.join(this.reportsDir, 'all-component-tests.json');
    await fs.writeFile(allResultsPath, JSON.stringify(results, null, 2));

    console.log(`✅ Component testing completed. Results saved to ${this.reportsDir}`);
    return results;
  }

  async testComponent(component: ComponentInfo): Promise<ComponentTestResult> {
    const stateTransitions = await this.testStateTransitions(component);
    const styleComparisons = await this.compareComponentStyles(component);
    const domDifferences = await this.analyzeDOMChanges(component);
    const performanceMetrics = await this.measureStatePerformance(component);
    const issues = await this.detectComponentIssues(component, styleComparisons, domDifferences, performanceMetrics);

    return {
      component,
      stateTransitions,
      styleComparisons,
      domDifferences,
      performanceMetrics,
      issues,
    };
  }

  async testStateTransitions(component: ComponentInfo): Promise<StateTransition[]> {
    if (!this.page) throw new Error('Page not available');

    const transitions: StateTransition[] = [];
    const states = component.states.map(s => s.state);

    console.log(`  🔄 Testing state transitions for ${component.name}...`);

    for (let i = 0; i < states.length; i++) {
      for (let j = 0; j < states.length; j++) {
        if (i === j) continue;

        const fromState = states[i];
        const toState = states[j];

        try {
          const transition = await this.measureStateTransition(component.testId, fromState, toState);
          transitions.push(transition);
        } catch (error) {
          console.warn(`⚠️ Failed to test transition ${fromState} → ${toState}:`, error);
        }
      }
    }

    return transitions;
  }

  async measureStateTransition(componentTestId: string, fromState: string, toState: string): Promise<StateTransition> {
    if (!this.page) throw new Error('Page not available');

    const selector = `[data-testid="${componentTestId}"]`;
    
    // Set initial state
    await this.simulator.triggerComponentState(componentTestId, fromState);
    await this.page.waitForTimeout(100);

    // Start transition measurement
    const startTime = Date.now();
    
    // Get initial computed styles
    const initialStyles = await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return {};
      
      const computed = window.getComputedStyle(element);
      return {
        opacity: computed.opacity,
        transform: computed.transform,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        borderColor: computed.borderColor,
      };
    }, selector);

    // Trigger transition to new state
    await this.simulator.triggerComponentState(componentTestId, toState);

    // Wait for transition to complete
    await this.page.waitForTimeout(300);

    // Get final computed styles
    const finalStyles = await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return {};
      
      const computed = window.getComputedStyle(element);
      return {
        opacity: computed.opacity,
        transform: computed.transform,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        borderColor: computed.borderColor,
      };
    }, selector);

    const duration = Date.now() - startTime;

    // Determine which properties changed
    const changedProperties = Object.keys(initialStyles).filter(
      prop => initialStyles[prop as keyof typeof initialStyles] !== finalStyles[prop as keyof typeof finalStyles]
    );

    // Check if transition is smooth (has CSS transitions)
    const hasTransition = await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      
      const computed = window.getComputedStyle(element);
      const transition = computed.transition || computed.webkitTransition;
      return transition !== 'none' && transition !== '';
    }, selector);

    return {
      from: fromState,
      to: toState,
      duration,
      smooth: hasTransition && duration > 50, // Smooth if has CSS transition and takes time
      properties: changedProperties,
    };
  }

  async compareComponentStyles(component: ComponentInfo): Promise<StyleComparison[]> {
    const comparisons: StyleComparison[] = [];

    console.log(`  🎨 Comparing styles for ${component.name}...`);

    // Define expected style patterns for different states
    const expectedPatterns: Record<string, Record<string, string | RegExp>> = {
      hover: {
        cursor: 'pointer',
        // opacity might change
        // background might change
      },
      focus: {
        outline: /outline/,
        // focus ring should be visible
      },
      disabled: {
        cursor: 'not-allowed',
        opacity: /0\.[3-7]/, // Should be between 0.3 and 0.7
      },
    };

    for (const state of component.states) {
      const properties: Record<string, { value: string; expected?: string; matches: boolean }> = {};
      const expected = expectedPatterns[state.state] || {};

      // Compare computed styles against expectations
      for (const [prop, expectedValue] of Object.entries(expected)) {
        const actualValue = state.computedStyles[prop] || '';
        
        let matches = false;
        if (expectedValue instanceof RegExp) {
          matches = expectedValue.test(actualValue);
        } else {
          matches = actualValue === expectedValue;
        }

        properties[prop] = {
          value: actualValue,
          expected: expectedValue.toString(),
          matches,
        };
      }

      // Also check theme variable usage
      const themeVariableUsage = await this.checkThemeVariableUsage(state.computedStyles);
      Object.assign(properties, themeVariableUsage);

      comparisons.push({
        state: state.state,
        properties,
      });
    }

    return comparisons;
  }

  async checkThemeVariableUsage(computedStyles: Record<string, any>): Promise<Record<string, { value: string; expected?: string; matches: boolean }>> {
    const themeProperties: Record<string, { value: string; expected?: string; matches: boolean }> = {};

    // Check if colors use CSS custom properties
    const colorProperties = ['backgroundColor', 'color', 'borderColor'];
    
    for (const prop of colorProperties) {
      const value = computedStyles[prop];
      if (value) {
        // Check if it's a hardcoded color vs theme variable
        const isHardcoded = /^(#[0-9a-f]{3,6}|rgb\(|rgba\(|hsl\(|hsla\()/i.test(value);
        
        themeProperties[`${prop}-theme-usage`] = {
          value: value,
          expected: 'CSS custom property or theme-based value',
          matches: !isHardcoded,
        };
      }
    }

    return themeProperties;
  }

  async analyzeDOMChanges(component: ComponentInfo): Promise<DOMDifference[]> {
    const differences: DOMDifference[] = [];
    const defaultState = component.states.find(s => s.state === 'default');
    
    if (!defaultState) return differences;

    console.log(`  🔍 Analyzing DOM changes for ${component.name}...`);

    for (const state of component.states) {
      if (state.state === 'default') continue;

      const diff = this.compareDOMSnapshots(defaultState.domSnapshot, state.domSnapshot);
      differences.push({
        state: state.state,
        ...diff,
      });
    }

    return differences;
  }

  private compareDOMSnapshots(baseline: string, current: string): { additions: string[]; removals: string[]; modifications: string[] } {
    // Simple DOM comparison - in a real implementation, you'd use a more sophisticated diff algorithm
    const baselineLines = baseline.split('\n').map(line => line.trim()).filter(Boolean);
    const currentLines = current.split('\n').map(line => line.trim()).filter(Boolean);

    const additions: string[] = [];
    const removals: string[] = [];
    const modifications: string[] = [];

    // Find additions
    currentLines.forEach(line => {
      if (!baselineLines.includes(line)) {
        additions.push(line);
      }
    });

    // Find removals
    baselineLines.forEach(line => {
      if (!currentLines.includes(line)) {
        removals.push(line);
      }
    });

    // Find modifications (simplified - lines with same tag but different attributes/content)
    baselineLines.forEach(baseLine => {
      const baseTag = baseLine.match(/<(\w+)/)?.[1];
      if (baseTag) {
        const currentLine = currentLines.find(line => line.match(/<(\w+)/)?.[1] === baseTag);
        if (currentLine && currentLine !== baseLine) {
          modifications.push(`${baseLine} → ${currentLine}`);
        }
      }
    });

    return { additions, removals, modifications };
  }

  async measureStatePerformance(component: ComponentInfo): Promise<StatePerformanceMetrics> {
    const transitionTimes: Record<string, number> = {};
    const repaintCount: Record<string, number> = {};
    const memoryImpact: Record<string, number> = {};

    console.log(`  ⚡ Measuring performance for ${component.name}...`);

    for (const state of component.states) {
      if (state.state === 'default') continue;

      // Measure transition time
      const startTime = Date.now();
      await this.simulator.triggerComponentState(component.testId, state.state);
      const transitionTime = Date.now() - startTime;
      
      transitionTimes[state.state] = transitionTime;

      // Simplified repaint count (would need more sophisticated measurement)
      repaintCount[state.state] = 1;

      // Memory impact from component's performance metrics
      memoryImpact[state.state] = component.performance.memoryImpact;

      // Reset to default
      await this.simulator.resetComponentState(component.testId);
    }

    return {
      transitionTimes,
      repaintCount,
      memoryImpact,
    };
  }

  async detectComponentIssues(
    component: ComponentInfo,
    styleComparisons: StyleComparison[],
    domDifferences: DOMDifference[],
    performanceMetrics: StatePerformanceMetrics
  ): Promise<ComponentIssue[]> {
    const issues: ComponentIssue[] = [];

    console.log(`  🐛 Detecting issues for ${component.name}...`);

    // Check accessibility issues
    component.accessibility.violations.forEach(violation => {
      issues.push({
        type: 'accessibility',
        severity: 'error',
        state: 'all',
        message: violation,
        suggestion: 'Review accessibility guidelines and add proper ARIA attributes',
      });
    });

    // Check performance issues
    Object.entries(performanceMetrics.transitionTimes).forEach(([state, time]) => {
      if (time > 100) { // Transitions taking more than 100ms
        issues.push({
          type: 'performance',
          severity: 'warning',
          state,
          message: `Slow state transition: ${time}ms`,
          suggestion: 'Optimize CSS transitions or reduce complexity',
        });
      }
    });

    // Check styling issues
    styleComparisons.forEach(comparison => {
      Object.entries(comparison.properties).forEach(([prop, data]) => {
        if (!data.matches && data.expected) {
          issues.push({
            type: 'styling',
            severity: prop.includes('theme') ? 'warning' : 'info',
            state: comparison.state,
            message: `Style mismatch: ${prop} is "${data.value}", expected "${data.expected}"`,
            suggestion: prop.includes('theme') ? 'Use theme variables instead of hardcoded values' : 'Review style implementation',
          });
        }
      });
    });

    // Check functionality issues
    if (component.states.length === 0) {
      issues.push({
        type: 'functionality',
        severity: 'error',
        state: 'all',
        message: 'No component states could be tested',
        suggestion: 'Ensure component has proper data-testid and is interactive',
      });
    }

    // Check for missing interactive states
    if (component.type === 'interactive' || component.type === 'form') {
      const expectedStates = ['hover', 'focus'];
      const actualStates = component.states.map(s => s.state);
      
      expectedStates.forEach(expectedState => {
        if (!actualStates.includes(expectedState)) {
          issues.push({
            type: 'functionality',
            severity: 'warning',
            state: expectedState,
            message: `Missing ${expectedState} state for interactive component`,
            suggestion: `Implement ${expectedState} state styling and behavior`,
          });
        }
      });
    }

    return issues;
  }

  async generateComponentTestReport(results: ComponentTestResult[]): Promise<string> {
    const totalComponents = results.length;
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const errorCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'error').length, 0);
    const warningCount = results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'warning').length, 0);

    const report = `
# Component State Testing Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Components Tested**: ${totalComponents}
- **Total Issues Found**: ${totalIssues}
- **Errors**: ${errorCount}
- **Warnings**: ${warningCount}
- **Info**: ${totalIssues - errorCount - warningCount}

## Component Results

${results.map(result => `
### ${result.component.name}

**Type**: ${result.component.type}  
**States Tested**: ${result.component.states.length}  
**Issues Found**: ${result.issues.length}

#### State Transitions
${result.stateTransitions.map(t => `- ${t.from} → ${t.to}: ${t.duration}ms ${t.smooth ? '(smooth)' : '(no transition)'}`).join('\n')}

#### Performance Metrics
${Object.entries(result.performanceMetrics.transitionTimes).map(([state, time]) => `- ${state}: ${time}ms`).join('\n')}

#### Issues
${result.issues.length > 0 ? result.issues.map(issue => `- **${issue.severity.toUpperCase()}** [${issue.state}]: ${issue.message}${issue.suggestion ? `\n  *Suggestion: ${issue.suggestion}*` : ''}`).join('\n') : 'No issues found'}

#### Screenshots
Component state screenshots: \`scripts/validation/reports/screenshots/${result.component.name}-*.png\`

---
`).join('\n')}

## Recommendations

### High Priority
${results.filter(r => r.issues.some(i => i.severity === 'error')).map(r => `- **${r.component.name}**: ${r.issues.filter(i => i.severity === 'error').length} critical issues`).join('\n')}

### Medium Priority  
${results.filter(r => r.issues.some(i => i.severity === 'warning')).map(r => `- **${r.component.name}**: ${r.issues.filter(i => i.severity === 'warning').length} warnings`).join('\n')}

### Theme Integration
${results.filter(r => r.issues.some(i => i.message.includes('theme'))).map(r => `- **${r.component.name}**: Update to use theme variables`).join('\n')}

## Test Data
Detailed test data saved to: \`${this.reportsDir}/\`
`;

    const reportPath = path.join(this.reportsDir, 'component-test-report.md');
    await fs.writeFile(reportPath, report);

    return report;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const simulator = new UISimulator();
  const tester = new ComponentTester(simulator);
  
  (async () => {
    try {
      console.log('🚀 Starting component state testing...');
      
      await simulator.initialize({ headless: true });
      await tester.initialize();
      
      const results = await tester.testAllComponents();
      const report = await tester.generateComponentTestReport(results);
      
      console.log('📊 Component testing completed!');
      console.log(report);
      
    } catch (error) {
      console.error('💥 Component testing failed:', error);
      process.exit(1);
    } finally {
      await simulator.cleanup();
    }
  })();
}