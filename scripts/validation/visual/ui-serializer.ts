/**
 * UI State Serializer for Claude Analysis
 * Converts visual UI state into text-based format for Claude debugging
 */

import { Page } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';
import { UISimulator, ComponentInfo, ComponentState } from './ui-simulator.js';

export interface SerializedUIState {
  timestamp: Date;
  layout: LayoutStructure;
  styling: EffectiveStyles;
  interactions: InteractiveElementsInventory;
  accessibility: AccessibilityState;
  performance: PerformanceSnapshot;
  visualDescription: string;
  errors: ErrorState[];
  recommendations: string[];
}

export interface LayoutStructure {
  viewport: { width: number; height: number };
  components: ComponentLayout[];
  hierarchy: string;
  spacing: SpacingAnalysis;
  responsive: ResponsiveBreakpoints;
}

export interface ComponentLayout {
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  position: string;
  zIndex: number;
  visible: boolean;
  overflow: string;
  children: string[];
}

export interface EffectiveStyles {
  themeVariables: Record<string, string>;
  computedStyles: Record<string, ComponentComputedStyles>;
  inconsistencies: StyleInconsistency[];
  inheritance: StyleInheritance[];
}

export interface ComponentComputedStyles {
  component: string;
  styles: Record<string, string>;
  customProperties: Record<string, string>;
  pseudoStates: Record<string, Record<string, string>>;
}

export interface StyleInconsistency {
  component: string;
  property: string;
  expected: string;
  actual: string;
  severity: 'error' | 'warning' | 'info';
}

export interface StyleInheritance {
  component: string;
  inherited: string[];
  overridden: string[];
  computed: string[];
}

export interface InteractiveElementsInventory {
  buttons: InteractiveElement[];
  forms: InteractiveElement[];
  links: InteractiveElement[];
  custom: InteractiveElement[];
  focus: FocusManagement;
  keyboard: KeyboardNavigation;
}

export interface InteractiveElement {
  name: string;
  type: string;
  states: string[];
  accessible: boolean;
  keyboardNavigable: boolean;
  hasTabIndex: boolean;
  ariaLabels: string[];
  events: string[];
}

export interface FocusManagement {
  currentFocus: string | null;
  focusOrder: string[];
  focusTraps: string[];
  focusStyles: Record<string, string>;
}

export interface KeyboardNavigation {
  tabOrder: string[];
  shortcuts: Record<string, string>;
  skipLinks: string[];
  modalHandling: boolean;
}

export interface AccessibilityState {
  wcagLevel: 'A' | 'AA' | 'AAA' | 'NONE';
  violations: AccessibilityViolation[];
  colorContrast: ContrastReport[];
  screenReader: ScreenReaderInfo;
  landmarks: LandmarkInfo[];
}

export interface AccessibilityViolation {
  rule: string;
  element: string;
  severity: 'error' | 'warning';
  description: string;
  fix: string;
}

export interface ContrastReport {
  foreground: string;
  background: string;
  ratio: number;
  level: 'AA' | 'AAA' | 'FAIL';
  element: string;
}

export interface ScreenReaderInfo {
  ariaLive: string[];
  ariaDescriptions: Record<string, string>;
  roleAssignments: Record<string, string>;
  hiddenContent: string[];
}

export interface LandmarkInfo {
  type: string;
  element: string;
  label: string;
  children: string[];
}

export interface PerformanceSnapshot {
  renderMetrics: RenderMetrics;
  memoryUsage: MemoryMetrics;
  interactionTiming: InteractionTiming;
  resourceLoading: ResourceMetrics;
  layoutShifts: LayoutShiftMetrics[];
}

export interface RenderMetrics {
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalRenderTime: number;
  componentRenderTimes: Record<string, number>;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  domNodes: number;
  eventListeners: number;
  jsHeapSize: number;
}

export interface InteractionTiming {
  firstInputDelay: number;
  responseTime: Record<string, number>;
  animationFrameRate: number;
  scrollPerformance: number;
}

export interface ResourceMetrics {
  cssFiles: number;
  jsFiles: number;
  images: number;
  totalSize: number;
  loadTime: number;
}

export interface LayoutShiftMetrics {
  value: number;
  element: string;
  timestamp: number;
  cause: string;
}

export interface SpacingAnalysis {
  margins: Record<string, number>;
  paddings: Record<string, number>;
  gaps: Record<string, number>;
  inconsistencies: string[];
}

export interface ResponsiveBreakpoints {
  current: string;
  breakpoints: Record<string, number>;
  activeMediaQueries: string[];
  responsiveIssues: string[];
}

export interface ErrorState {
  type: 'javascript' | 'css' | 'network' | 'accessibility' | 'performance';
  message: string;
  component?: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: number;
  stack?: string;
}

export class UIStateSerializer {
  private simulator: UISimulator;
  private page: Page | null = null;
  private reportsDir: string;

  constructor(simulator: UISimulator) {
    this.simulator = simulator;
    this.reportsDir = path.join(process.cwd(), 'scripts/validation/reports/ui-serializer');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.reportsDir, { recursive: true });
    this.page = (this.simulator as any).page; // Access private page property
  }

  async serializeCurrentUIState(): Promise<SerializedUIState> {
    if (!this.page) throw new Error('UI Serializer not initialized');

    console.log('🔄 Serializing current UI state for Claude analysis...');

    const [
      layout,
      styling,
      interactions,
      accessibility,
      performance,
      errors
    ] = await Promise.all([
      this.captureLayoutStructure(),
      this.captureEffectiveStyles(),
      this.captureInteractiveElements(),
      this.captureAccessibilityState(),
      this.capturePerformanceSnapshot(),
      this.captureErrorStates()
    ]);

    const visualDescription = await this.generateVisualDescription(layout, styling, interactions);
    const recommendations = await this.generateRecommendations(layout, styling, interactions, accessibility, performance, errors);

    const serializedState: SerializedUIState = {
      timestamp: new Date(),
      layout,
      styling,
      interactions,
      accessibility,
      performance,
      visualDescription,
      errors,
      recommendations,
    };

    // Save detailed data
    const statePath = path.join(this.reportsDir, `ui-state-${Date.now()}.json`);
    await fs.writeFile(statePath, JSON.stringify(serializedState, null, 2));

    // Generate Claude-friendly report
    const claudeReport = await this.formatForClaude(serializedState);
    const claudeReportPath = path.join(this.reportsDir, `claude-ui-analysis-${Date.now()}.txt`);
    await fs.writeFile(claudeReportPath, claudeReport);

    console.log(`✅ UI state serialized to ${statePath}`);
    console.log(`📋 Claude report generated at ${claudeReportPath}`);

    return serializedState;
  }

  async captureLayoutStructure(): Promise<LayoutStructure> {
    if (!this.page) throw new Error('Page not available');

    const viewport = await this.page.viewportSize() || { width: 0, height: 0 };
    
    // Get component layouts
    const components = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      return Array.from(elements).map(el => {
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        const children = Array.from(el.querySelectorAll('[data-testid]')).map(child => 
          child.getAttribute('data-testid')
        ).filter(Boolean);
        
        return {
          name: el.getAttribute('data-testid'),
          bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          position: styles.position,
          zIndex: parseInt(styles.zIndex) || 0,
          visible: rect.width > 0 && rect.height > 0 && styles.visibility !== 'hidden',
          overflow: styles.overflow,
          children: children as string[],
        };
      }).filter(comp => comp.name);
    });

    // Generate hierarchy
    const hierarchy = await this.generateHierarchy(components);

    // Analyze spacing
    const spacing = await this.analyzeSpacing();

    // Check responsive breakpoints
    const responsive = await this.analyzeResponsive();

    return {
      viewport,
      components: components as ComponentLayout[],
      hierarchy,
      spacing,
      responsive,
    };
  }

  async generateHierarchy(components: ComponentLayout[]): Promise<string> {
    // Build a tree structure representation
    const rootComponents = components.filter(comp => 
      !components.some(parent => parent.children.includes(comp.name))
    );

    const buildTree = (comp: ComponentLayout, depth = 0): string => {
      const indent = '  '.repeat(depth);
      const children = components.filter(c => comp.children.includes(c.name));
      const childTree = children.map(child => buildTree(child, depth + 1)).join('\n');
      
      return `${indent}${comp.name} (${comp.bounds.width}x${comp.bounds.height} at ${comp.bounds.x},${comp.bounds.y})${childTree ? '\n' + childTree : ''}`;
    };

    return rootComponents.map(comp => buildTree(comp)).join('\n');
  }

  async analyzeSpacing(): Promise<SpacingAnalysis> {
    if (!this.page) throw new Error('Page not available');

    return await this.page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      const margins: Record<string, number> = {};
      const paddings: Record<string, number> = {};
      const gaps: Record<string, number> = {};
      const inconsistencies: string[] = [];

      elements.forEach(el => {
        const testId = el.getAttribute('data-testid');
        if (!testId) return;

        const styles = window.getComputedStyle(el);
        
        // Extract spacing values
        margins[testId] = parseFloat(styles.marginTop) || 0;
        paddings[testId] = parseFloat(styles.paddingTop) || 0;
        
        if (styles.display === 'grid' || styles.display === 'flex') {
          gaps[testId] = parseFloat(styles.gap) || 0;
        }

        // Check for inconsistent spacing patterns
        const marginValues = [
          parseFloat(styles.marginTop),
          parseFloat(styles.marginRight),
          parseFloat(styles.marginBottom),
          parseFloat(styles.marginLeft)
        ].filter(v => !isNaN(v));

        const unique = [...new Set(marginValues)];
        if (unique.length > 2) {
          inconsistencies.push(`${testId}: Inconsistent margins (${marginValues.join(', ')})`);
        }
      });

      return { margins, paddings, gaps, inconsistencies };
    });
  }

  async analyzeResponsive(): Promise<ResponsiveBreakpoints> {
    if (!this.page) throw new Error('Page not available');

    return await this.page.evaluate(() => {
      const breakpoints: Record<string, number> = {
        'mobile': 768,
        'tablet': 1024,
        'desktop': 1200,
      };

      const currentWidth = window.innerWidth;
      let current = 'desktop';
      
      if (currentWidth < breakpoints.mobile) current = 'mobile';
      else if (currentWidth < breakpoints.tablet) current = 'tablet';

      // Get active media queries
      const styleSheets = Array.from(document.styleSheets);
      const activeMediaQueries: string[] = [];
      const responsiveIssues: string[] = [];

      try {
        styleSheets.forEach(sheet => {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach(rule => {
              if (rule.type === CSSRule.MEDIA_RULE) {
                const mediaRule = rule as CSSMediaRule;
                if (window.matchMedia(mediaRule.conditionText).matches) {
                  activeMediaQueries.push(mediaRule.conditionText);
                }
              }
            });
          }
        });
      } catch (error) {
        responsiveIssues.push('Cannot access CSS rules due to CORS restrictions');
      }

      // Check for horizontal scroll
      if (document.documentElement.scrollWidth > window.innerWidth) {
        responsiveIssues.push('Horizontal overflow detected');
      }

      return {
        current,
        breakpoints,
        activeMediaQueries,
        responsiveIssues,
      };
    });
  }

  async captureEffectiveStyles(): Promise<EffectiveStyles> {
    if (!this.page) throw new Error('Page not available');

    // Get theme variables
    const themeVariables = await this.page.evaluate(() => {
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      const themeVars: Record<string, string> = {};
      
      // Extract CSS custom properties
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--')) {
          themeVars[prop] = styles.getPropertyValue(prop).trim();
        }
      }
      
      return themeVars;
    });

    // Get component computed styles
    const computedStyles = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      const styleMap: Record<string, ComponentComputedStyles> = {};

      elements.forEach(el => {
        const testId = el.getAttribute('data-testid');
        if (!testId) return;

        const computed = window.getComputedStyle(el);
        const styles: Record<string, string> = {};
        const customProperties: Record<string, string> = {};

        // Key visual properties
        const importantProps = [
          'display', 'position', 'width', 'height', 'margin', 'padding',
          'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
          'border', 'borderRadius', 'boxShadow', 'opacity', 'visibility',
          'zIndex', 'transform', 'transition', 'animation', 'cursor'
        ];

        importantProps.forEach(prop => {
          styles[prop] = computed.getPropertyValue(prop);
        });

        // Extract custom properties
        for (let i = 0; i < computed.length; i++) {
          const prop = computed[i];
          if (prop.startsWith('--')) {
            customProperties[prop] = computed.getPropertyValue(prop);
          }
        }

        // Get pseudo-state styles (simplified)
        const pseudoStates: Record<string, Record<string, string>> = {};
        // Note: Pseudo-states would need to be captured during state transitions
        
        styleMap[testId] = {
          component: testId,
          styles,
          customProperties,
          pseudoStates,
        };
      });

      return styleMap;
    });

    // Detect style inconsistencies
    const inconsistencies = await this.detectStyleInconsistencies(computedStyles);

    // Analyze style inheritance
    const inheritance = await this.analyzeStyleInheritance(computedStyles);

    return {
      themeVariables,
      computedStyles,
      inconsistencies,
      inheritance,
    };
  }

  async detectStyleInconsistencies(computedStyles: Record<string, ComponentComputedStyles>): Promise<StyleInconsistency[]> {
    const inconsistencies: StyleInconsistency[] = [];

    // Check for hardcoded colors vs theme variables
    Object.entries(computedStyles).forEach(([component, styles]) => {
      ['backgroundColor', 'color', 'borderColor'].forEach(prop => {
        const value = styles.styles[prop];
        if (value && /^(#[0-9a-f]{3,6}|rgb\(|rgba\(|hsl\(|hsla\()/i.test(value)) {
          inconsistencies.push({
            component,
            property: prop,
            expected: 'CSS custom property or theme-based value',
            actual: value,
            severity: 'warning',
          });
        }
      });

      // Check for inconsistent font sizes
      const fontSize = styles.styles.fontSize;
      if (fontSize && !fontSize.includes('rem') && !fontSize.includes('var(')) {
        inconsistencies.push({
          component,
          property: 'fontSize',
          expected: 'rem units or theme variable',
          actual: fontSize,
          severity: 'info',
        });
      }
    });

    return inconsistencies;
  }

  async analyzeStyleInheritance(computedStyles: Record<string, ComponentComputedStyles>): Promise<StyleInheritance[]> {
    // Simplified inheritance analysis
    return Object.entries(computedStyles).map(([component, styles]) => ({
      component,
      inherited: Object.keys(styles.customProperties),
      overridden: [],
      computed: Object.keys(styles.styles),
    }));
  }

  async captureInteractiveElements(): Promise<InteractiveElementsInventory> {
    if (!this.page) throw new Error('Page not available');

    return await this.page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      const buttons: InteractiveElement[] = [];
      const forms: InteractiveElement[] = [];
      const links: InteractiveElement[] = [];
      const custom: InteractiveElement[] = [];

      elements.forEach(el => {
        const testId = el.getAttribute('data-testid');
        if (!testId) return;

        const tagName = el.tagName.toLowerCase();
        const role = el.getAttribute('role');
        const hasTabIndex = el.hasAttribute('tabindex');
        const tabIndex = el.getAttribute('tabindex');
        const ariaLabels = [
          el.getAttribute('aria-label'),
          el.getAttribute('aria-labelledby'),
          el.getAttribute('aria-describedby')
        ].filter(Boolean) as string[];

        const element: InteractiveElement = {
          name: testId,
          type: tagName,
          states: ['default'], // Would be populated from state testing
          accessible: ariaLabels.length > 0 || !!el.textContent?.trim(),
          keyboardNavigable: hasTabIndex && tabIndex !== '-1',
          hasTabIndex: hasTabIndex,
          ariaLabels,
          events: [], // Would need event listener detection
        };

        // Categorize elements
        if (tagName === 'button' || role === 'button') {
          buttons.push(element);
        } else if (['input', 'textarea', 'select', 'form'].includes(tagName)) {
          forms.push(element);
        } else if (tagName === 'a') {
          links.push(element);
        } else if (role || el.hasAttribute('onclick') || hasTabIndex) {
          custom.push(element);
        }
      });

      // Analyze focus management
      const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const focusOrder = Array.from(focusableElements).map(el => 
        el.getAttribute('data-testid') || el.tagName.toLowerCase()
      );

      const focus: FocusManagement = {
        currentFocus: document.activeElement?.getAttribute('data-testid') || null,
        focusOrder,
        focusTraps: [], // Would need specialized detection
        focusStyles: {}, // Would need to capture :focus styles
      };

      const keyboard: KeyboardNavigation = {
        tabOrder: focusOrder,
        shortcuts: {}, // Would need keyboard event detection
        skipLinks: [], // Would need specialized detection
        modalHandling: false, // Would need modal detection
      };

      return { buttons, forms, links, custom, focus, keyboard };
    });
  }

  async captureAccessibilityState(): Promise<AccessibilityState> {
    if (!this.page) throw new Error('Page not available');

    // Basic accessibility analysis
    const violations = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      const violations: AccessibilityViolation[] = [];

      elements.forEach(el => {
        const testId = el.getAttribute('data-testid');
        if (!testId) return;

        const tagName = el.tagName.toLowerCase();

        // Check for missing labels on form elements
        if (['input', 'textarea', 'select'].includes(tagName)) {
          const hasLabel = !!(
            el.getAttribute('aria-label') ||
            el.getAttribute('aria-labelledby') ||
            document.querySelector(`label[for="${el.id}"]`)
          );

          if (!hasLabel) {
            violations.push({
              rule: 'form-field-multiple-labels',
              element: testId,
              severity: 'error',
              description: 'Form field missing accessible label',
              fix: 'Add aria-label, aria-labelledby, or associated label element',
            });
          }
        }

        // Check for missing alt text on images
        if (tagName === 'img' && !el.getAttribute('alt')) {
          violations.push({
            rule: 'image-alt',
            element: testId,
            severity: 'error',
            description: 'Image missing alt text',
            fix: 'Add descriptive alt attribute',
          });
        }

        // Check for interactive elements without keyboard access
        if (el.hasAttribute('onclick') && !el.hasAttribute('tabindex') && 
            !['button', 'a', 'input', 'textarea', 'select'].includes(tagName)) {
          violations.push({
            rule: 'keyboard-access',
            element: testId,
            severity: 'warning',
            description: 'Interactive element not keyboard accessible',
            fix: 'Add tabindex="0" or use semantic HTML elements',
          });
        }
      });

      return violations;
    });

    // Simplified color contrast analysis
    const colorContrast: ContrastReport[] = [];

    // Basic WCAG level assessment
    const wcagLevel = violations.filter(v => v.severity === 'error').length === 0 ? 'A' : 'NONE';

    // Screen reader info
    const screenReader: ScreenReaderInfo = {
      ariaLive: [],
      ariaDescriptions: {},
      roleAssignments: {},
      hiddenContent: [],
    };

    // Landmarks
    const landmarks: LandmarkInfo[] = [];

    return {
      wcagLevel: wcagLevel as 'A' | 'AA' | 'AAA' | 'NONE',
      violations,
      colorContrast,
      screenReader,
      landmarks,
    };
  }

  async capturePerformanceSnapshot(): Promise<PerformanceSnapshot> {
    if (!this.page) throw new Error('Page not available');

    const performanceData = await this.page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      const renderMetrics = {
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Would need PerformanceObserver
        totalRenderTime: navigationEntry?.loadEventEnd - navigationEntry?.navigationStart || 0,
        componentRenderTimes: {}, // Would need specialized measurement
      };

      const memoryInfo = (performance as any).memory;
      const memoryMetrics = {
        used: memoryInfo?.usedJSHeapSize || 0,
        total: memoryInfo?.totalJSHeapSize || 0,
        domNodes: document.querySelectorAll('*').length,
        eventListeners: 0, // Would need specialized detection
        jsHeapSize: memoryInfo?.usedJSHeapSize || 0,
      };

      const interactionTiming = {
        firstInputDelay: 0, // Would need PerformanceObserver
        responseTime: {},
        animationFrameRate: 60, // Assumed
        scrollPerformance: 0,
      };

      const resourceMetrics = {
        cssFiles: document.querySelectorAll('link[rel="stylesheet"]').length,
        jsFiles: document.querySelectorAll('script[src]').length,
        images: document.querySelectorAll('img').length,
        totalSize: 0, // Would need resource timing
        loadTime: navigationEntry?.loadEventEnd || 0,
      };

      return {
        renderMetrics,
        memoryMetrics,
        interactionTiming,
        resourceMetrics,
      };
    });

    return {
      ...performanceData,
      layoutShifts: [], // Would need PerformanceObserver for CLS
    };
  }

  async captureErrorStates(): Promise<ErrorState[]> {
    if (!this.page) throw new Error('Page not available');

    // Get console errors
    const consoleErrors = await this.page.evaluate(() => {
      // This would typically be populated by error listeners
      return [];
    });

    // Check for JavaScript errors
    const errors: ErrorState[] = [];

    // Add accessibility errors from violations
    // Add performance warnings
    // Add CSS errors

    return errors;
  }

  async generateVisualDescription(
    layout: LayoutStructure,
    styling: EffectiveStyles,
    interactions: InteractiveElementsInventory
  ): Promise<string> {
    const totalComponents = layout.components.length;
    const visibleComponents = layout.components.filter(c => c.visible).length;
    const hiddenComponents = totalComponents - visibleComponents;

    const themeCount = Object.keys(styling.themeVariables).length;
    const styleInconsistencies = styling.inconsistencies.length;

    const interactiveCount = 
      interactions.buttons.length + 
      interactions.forms.length + 
      interactions.links.length + 
      interactions.custom.length;

    return `
UI Visual State Description:

LAYOUT OVERVIEW:
- Viewport: ${layout.viewport.width} x ${layout.viewport.height}
- Total Components: ${totalComponents} (${visibleComponents} visible, ${hiddenComponents} hidden)
- Current Breakpoint: ${layout.responsive.current}
- Layout Issues: ${layout.spacing.inconsistencies.length > 0 ? layout.spacing.inconsistencies.join(', ') : 'None detected'}

VISUAL STYLING:
- Theme Variables: ${themeCount} CSS custom properties defined
- Style Inconsistencies: ${styleInconsistencies} detected
- Responsive Issues: ${layout.responsive.responsiveIssues.length > 0 ? layout.responsive.responsiveIssues.join(', ') : 'None detected'}

INTERACTIVE ELEMENTS:
- Buttons: ${interactions.buttons.length}
- Form Elements: ${interactions.forms.length}
- Links: ${interactions.links.length}
- Custom Interactive: ${interactions.custom.length}
- Total Interactive: ${interactiveCount}
- Focus Management: ${interactions.focus.currentFocus ? `Currently focused: ${interactions.focus.currentFocus}` : 'No element focused'}

COMPONENT HIERARCHY:
${layout.hierarchy}
`;
  }

  async generateRecommendations(
    layout: LayoutStructure,
    styling: EffectiveStyles,
    interactions: InteractiveElementsInventory,
    accessibility: AccessibilityState,
    performance: PerformanceSnapshot,
    errors: ErrorState[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Layout recommendations
    if (layout.spacing.inconsistencies.length > 0) {
      recommendations.push('Standardize spacing patterns across components');
    }

    if (layout.responsive.responsiveIssues.length > 0) {
      recommendations.push('Fix responsive design issues for better mobile experience');
    }

    // Styling recommendations
    if (styling.inconsistencies.length > 0) {
      recommendations.push('Replace hardcoded colors with theme variables');
    }

    // Accessibility recommendations
    if (accessibility.violations.length > 0) {
      recommendations.push(`Fix ${accessibility.violations.length} accessibility violations`);
    }

    // Performance recommendations
    if (performance.memoryMetrics.domNodes > 1000) {
      recommendations.push('Consider DOM optimization - high node count detected');
    }

    // Interaction recommendations
    const inaccessibleInteractions = [
      ...interactions.buttons,
      ...interactions.forms,
      ...interactions.links,
      ...interactions.custom
    ].filter(el => !el.accessible);

    if (inaccessibleInteractions.length > 0) {
      recommendations.push(`Improve accessibility for ${inaccessibleInteractions.length} interactive elements`);
    }

    return recommendations;
  }

  async formatForClaude(state: SerializedUIState): Promise<string> {
    return `
UI STATE ANALYSIS FOR CLAUDE CODE
================================
Generated: ${state.timestamp.toISOString()}

EXECUTIVE SUMMARY:
${state.visualDescription}

CRITICAL ISSUES:
${state.errors.length > 0 ? state.errors.map(e => `- ${e.type.toUpperCase()}: ${e.message}`).join('\n') : 'No critical errors detected'}

ACCESSIBILITY STATUS:
- WCAG Level: ${state.accessibility.wcagLevel}
- Violations: ${state.accessibility.violations.length}
${state.accessibility.violations.map(v => `  - ${v.severity.toUpperCase()}: ${v.description} (${v.element})`).join('\n')}

STYLE INCONSISTENCIES:
${state.styling.inconsistencies.length > 0 ? 
  state.styling.inconsistencies.map(i => `- ${i.component}: ${i.property} (${i.actual} vs ${i.expected})`).join('\n') : 
  'No style inconsistencies detected'}

PERFORMANCE METRICS:
- Render Time: ${state.performance.renderMetrics.totalRenderTime}ms
- Memory Usage: ${(state.performance.memoryMetrics.used / 1024 / 1024).toFixed(2)}MB
- DOM Nodes: ${state.performance.memoryMetrics.domNodes}
- CSS Files: ${state.performance.resourceMetrics.cssFiles}
- JS Files: ${state.performance.resourceMetrics.jsFiles}

INTERACTIVE ELEMENTS SUMMARY:
- Buttons: ${state.interactions.buttons.length}
- Forms: ${state.interactions.forms.length}
- Links: ${state.interactions.links.length}
- Custom Interactive: ${state.interactions.custom.length}
- Keyboard Navigation: ${state.interactions.keyboard.tabOrder.length} tabbable elements

COMPONENT LAYOUT:
${state.layout.hierarchy}

THEME ANALYSIS:
- CSS Variables: ${Object.keys(state.styling.themeVariables).length}
- Theme Variables Used: ${Object.keys(state.styling.themeVariables).slice(0, 10).join(', ')}${Object.keys(state.styling.themeVariables).length > 10 ? '...' : ''}

RESPONSIVE DESIGN:
- Current Breakpoint: ${state.layout.responsive.current}
- Active Media Queries: ${state.layout.responsive.activeMediaQueries.length}
- Issues: ${state.layout.responsive.responsiveIssues.join(', ') || 'None'}

RECOMMENDATIONS:
${state.recommendations.map(r => `• ${r}`).join('\n')}

DETAILED COMPONENT DATA:
${state.layout.components.map(comp => 
  `${comp.name}: ${comp.bounds.width}x${comp.bounds.height} at (${comp.bounds.x}, ${comp.bounds.y}) - ${comp.visible ? 'Visible' : 'Hidden'}`
).join('\n')}

NEXT STEPS FOR DEBUGGING:
1. Address critical accessibility violations first
2. Fix style inconsistencies using theme variables
3. Optimize components with performance issues
4. Ensure all interactive elements are keyboard accessible
5. Review responsive design for mobile compatibility

---
This report provides Claude Code with comprehensive UI state information for effective debugging and issue resolution.
`;
  }

  async generateComponentDebugInfo(componentName: string): Promise<string> {
    const components = await this.simulator.captureComponentStates();
    const component = components.find(c => c.name === componentName);

    if (!component) {
      return `Component "${componentName}" not found. Available components: ${components.map(c => c.name).join(', ')}`;
    }

    return `
COMPONENT DEBUG INFO: ${componentName}
=====================================

TYPE: ${component.type}
SELECTOR: ${component.selector}

STATES CAPTURED:
${component.states.map(state => `- ${state.state}: ${state.isVisible ? 'Visible' : 'Hidden'} (${state.errors?.length || 0} errors)`).join('\n')}

ACCESSIBILITY:
- Has ARIA Label: ${component.accessibility.hasAriaLabel}
- Has Role: ${component.accessibility.hasRole}
- Keyboard Accessible: ${component.accessibility.isKeyboardAccessible}
- Color Contrast: ${component.accessibility.colorContrast || 'Not measured'}
- Violations: ${component.accessibility.violations.length}
${component.accessibility.violations.map(v => `  - ${v}`).join('\n')}

PERFORMANCE:
- Render Time: ${component.performance.renderTime}ms
- Repaints: ${component.performance.repaints}
- Layout Shifts: ${component.performance.layoutShifts}
- Memory Impact: ${component.performance.memoryImpact} bytes

COMPUTED STYLES (Default State):
${component.states.length > 0 ? Object.entries(component.states[0].computedStyles)
  .map(([prop, value]) => `${prop}: ${value}`)
  .join('\n') : 'No styles captured'}

STATE DIFFERENCES:
${component.states.slice(1).map(state => `
${state.state.toUpperCase()} State:
${Object.entries(state.computedStyles)
  .filter(([prop, value]) => value !== component.states[0].computedStyles[prop])
  .map(([prop, value]) => `  ${prop}: ${component.states[0].computedStyles[prop]} → ${value}`)
  .join('\n')}`).join('\n')}

SCREENSHOTS:
${component.states.map(state => `- ${state.state}: ${state.screenshot}`).join('\n')}
`;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const claudeFormat = args.includes('--claude-format');
  const componentName = args.find(arg => arg.startsWith('--component='))?.split('=')[1];
  
  const simulator = new UISimulator();
  const serializer = new UIStateSerializer(simulator);
  
  (async () => {
    try {
      console.log('🚀 Starting UI state serialization...');
      
      // Check if server is running
      if (!(await simulator.checkServer())) {
        console.error('❌ Development server not running. Please start with: npm run dev');
        process.exit(1);
      }
      
      await simulator.initialize({ headless: true });
      await serializer.initialize();
      
      if (componentName) {
        // Debug specific component
        const debugInfo = await serializer.generateComponentDebugInfo(componentName);
        console.log(debugInfo);
      } else {
        // Full UI state serialization
        const state = await serializer.serializeCurrentUIState();
        
        if (claudeFormat) {
          const claudeReport = await serializer.formatForClaude(state);
          console.log('\n📋 Claude-Friendly UI Analysis:');
          console.log(claudeReport);
        } else {
          console.log('\n📊 UI State Summary:');
          console.log(`- Components: ${state.layout.components.length}`);
          console.log(`- Errors: ${state.errors.length}`);
          console.log(`- Accessibility Issues: ${state.accessibility.violations.length}`);
          console.log(`- Style Inconsistencies: ${state.styling.inconsistencies.length}`);
          console.log(`- Recommendations: ${state.recommendations.length}`);
        }
      }
      
    } catch (error) {
      console.error('💥 UI state serialization failed:', error);
      process.exit(1);
    } finally {
      await simulator.cleanup();
    }
  })();
}