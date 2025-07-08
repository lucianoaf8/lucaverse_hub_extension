/**
 * UI Simulator - Browser Automation Foundation
 * Provides automated browser testing and component state capture
 */

import { chromium, Page, Browser, BrowserContext, ElementHandle } from 'playwright';
import { promises as fs } from 'fs';
import path from 'path';

export interface ComponentState {
  state: string;
  screenshot: string;
  domSnapshot: string;
  computedStyles: Record<string, any>;
  timestamp: number;
  bounds?: { x: number; y: number; width: number; height: number };
  isVisible: boolean;
  errors?: string[];
}

export interface ComponentInfo {
  name: string;
  selector: string;
  testId: string;
  type: 'interactive' | 'display' | 'form' | 'navigation';
  states: ComponentState[];
  accessibility: AccessibilityReport;
  performance: PerformanceMetrics;
}

export interface AccessibilityReport {
  hasAriaLabel: boolean;
  hasRole: boolean;
  isKeyboardAccessible: boolean;
  colorContrast?: number;
  violations: string[];
}

export interface PerformanceMetrics {
  renderTime: number;
  repaints: number;
  layoutShifts: number;
  memoryImpact: number;
}

export class UISimulator {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private baseUrl: string;
  private screenshotDir: string;
  private isInitialized = false;

  constructor(baseUrl = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
    this.screenshotDir = path.join(process.cwd(), 'scripts/validation/reports/screenshots');
  }

  async initialize(options: { headless?: boolean; viewport?: { width: number; height: number } } = {}): Promise<void> {
    try {
      console.log('🚀 Initializing UI Simulator...');
      
      // Ensure screenshot directory exists
      await fs.mkdir(this.screenshotDir, { recursive: true });

      // Launch browser
      this.browser = await chromium.launch({
        headless: options.headless ?? true,
        devtools: !options.headless,
      });

      // Create context with specific viewport
      this.context = await this.browser.newContext({
        viewport: options.viewport ?? { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      });

      // Create page
      this.page = await this.context.newPage();

      // Set up error capturing
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error('Browser console error:', msg.text());
        }
      });

      this.page.on('pageerror', error => {
        console.error('Page error:', error.message);
      });

      // Navigate to application
      console.log(`📍 Navigating to ${this.baseUrl}...`);
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Wait for React to load
      await this.page.waitForFunction(() => window.React !== undefined, { timeout: 10000 });
      
      this.isInitialized = true;
      console.log('✅ UI Simulator initialized successfully');
    } catch (error) {
      console.error('💥 Failed to initialize UI Simulator:', error);
      await this.cleanup();
      throw error;
    }
  }

  async discoverComponents(): Promise<string[]> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    console.log('🔍 Discovering components with data-testid attributes...');
    
    const components = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('[data-testid]');
      return Array.from(elements).map(el => el.getAttribute('data-testid')).filter(Boolean) as string[];
    });

    console.log(`📦 Found ${components.length} components:`, components);
    return components;
  }

  async captureComponentStates(): Promise<ComponentInfo[]> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    const components = await this.discoverComponents();
    const results: ComponentInfo[] = [];

    console.log('📸 Capturing component states...');

    for (const componentTestId of components) {
      try {
        console.log(`  🧩 Testing component: ${componentTestId}`);
        
        const componentInfo: ComponentInfo = {
          name: componentTestId,
          selector: `[data-testid="${componentTestId}"]`,
          testId: componentTestId,
          type: await this.determineComponentType(componentTestId),
          states: await this.testComponentStates(componentTestId),
          accessibility: await this.testAccessibility(componentTestId),
          performance: await this.measurePerformance(componentTestId),
        };

        results.push(componentInfo);
      } catch (error) {
        console.error(`❌ Failed to test component ${componentTestId}:`, error);
        results.push({
          name: componentTestId,
          selector: `[data-testid="${componentTestId}"]`,
          testId: componentTestId,
          type: 'display',
          states: [],
          accessibility: { hasAriaLabel: false, hasRole: false, isKeyboardAccessible: false, violations: [error instanceof Error ? error.message : String(error)] },
          performance: { renderTime: 0, repaints: 0, layoutShifts: 0, memoryImpact: 0 },
        });
      }
    }

    // Save results to file
    const resultPath = path.join(this.screenshotDir, 'component-states.json');
    await fs.writeFile(resultPath, JSON.stringify(results, null, 2));
    console.log(`💾 Component states saved to ${resultPath}`);

    return results;
  }

  async testComponentStates(componentTestId: string): Promise<ComponentState[]> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    const selector = `[data-testid="${componentTestId}"]`;
    const states = ['default', 'hover', 'focus', 'active', 'disabled'];
    const results: ComponentState[] = [];

    // Check if element exists
    const elementExists = await this.page.locator(selector).count() > 0;
    if (!elementExists) {
      throw new Error(`Component with testid "${componentTestId}" not found`);
    }

    for (const state of states) {
      try {
        console.log(`    📋 Testing state: ${state}`);
        
        // Trigger the state
        await this.triggerComponentState(componentTestId, state);
        
        // Wait for state transition
        await this.page.waitForTimeout(200);

        // Get component bounds
        const bounds = await this.getComponentBounds(componentTestId);
        
        // Capture screenshot
        const screenshotPath = path.join(this.screenshotDir, `${componentTestId}-${state}.png`);
        await this.page.screenshot({
          path: screenshotPath,
          clip: bounds,
        });
        
        // Get DOM snapshot
        const domSnapshot = await this.page.locator(selector).innerHTML();
        
        // Get computed styles
        const computedStyles = await this.getComputedStyles(componentTestId);
        
        // Check visibility
        const isVisible = await this.page.locator(selector).isVisible();

        results.push({
          state,
          screenshot: screenshotPath,
          domSnapshot,
          computedStyles,
          timestamp: Date.now(),
          bounds,
          isVisible,
        });

        // Reset state
        await this.resetComponentState(componentTestId);
        
      } catch (error) {
        console.warn(`⚠️ Failed to test state ${state} for ${componentTestId}:`, error);
        results.push({
          state,
          screenshot: '',
          domSnapshot: '',
          computedStyles: {},
          timestamp: Date.now(),
          isVisible: false,
          errors: [error instanceof Error ? error.message : String(error)],
        });
      }
    }

    return results;
  }

  async triggerComponentState(componentTestId: string, state: string): Promise<void> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    const selector = `[data-testid="${componentTestId}"]`;
    const element = this.page.locator(selector);

    switch (state) {
      case 'default':
        // Do nothing - already in default state
        break;
        
      case 'hover':
        await element.hover();
        break;
        
      case 'focus':
        await element.focus();
        break;
        
      case 'active':
        // Simulate mouse down without mouse up to maintain active state
        await element.dispatchEvent('mousedown');
        break;
        
      case 'disabled':
        // Add disabled attribute if it's a form element
        await this.page.evaluate((sel) => {
          const el = document.querySelector(sel) as HTMLElement;
          if (el && ('disabled' in el)) {
            (el as any).disabled = true;
          } else if (el) {
            el.setAttribute('aria-disabled', 'true');
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
          }
        }, selector);
        break;
        
      case 'loading':
        // Add loading state if supported
        await this.page.evaluate((sel) => {
          const el = document.querySelector(sel) as HTMLElement;
          if (el) {
            el.setAttribute('aria-busy', 'true');
            el.classList.add('loading');
          }
        }, selector);
        break;
    }
  }

  async resetComponentState(componentTestId: string): Promise<void> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    const selector = `[data-testid="${componentTestId}"]`;
    
    // Reset all possible state modifications
    await this.page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement;
      if (el) {
        // Remove event states
        el.dispatchEvent(new Event('mouseup'));
        el.dispatchEvent(new Event('mouseleave'));
        el.blur();
        
        // Reset attributes
        el.removeAttribute('aria-disabled');
        el.removeAttribute('aria-busy');
        el.classList.remove('loading');
        
        // Reset styles
        el.style.pointerEvents = '';
        el.style.opacity = '';
        
        // Reset disabled state for form elements
        if ('disabled' in el) {
          (el as any).disabled = false;
        }
      }
    }, selector);
    
    // Wait for reset
    await this.page.waitForTimeout(100);
  }

  async getComponentBounds(componentTestId: string): Promise<{ x: number; y: number; width: number; height: number }> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    const selector = `[data-testid="${componentTestId}"]`;
    const boundingBox = await this.page.locator(selector).boundingBox();
    
    if (!boundingBox) {
      throw new Error(`Could not get bounds for component ${componentTestId}`);
    }
    
    return boundingBox;
  }

  async getComputedStyles(componentTestId: string): Promise<Record<string, any>> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    const selector = `[data-testid="${componentTestId}"]`;
    
    return await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return {};
      
      const computed = window.getComputedStyle(element);
      const styles: Record<string, any> = {};
      
      // Extract key style properties
      const importantProps = [
        'display', 'position', 'width', 'height', 'margin', 'padding',
        'backgroundColor', 'color', 'fontSize', 'fontFamily', 'fontWeight',
        'border', 'borderRadius', 'boxShadow', 'opacity', 'visibility',
        'zIndex', 'transform', 'transition', 'animation'
      ];
      
      importantProps.forEach(prop => {
        styles[prop] = computed.getPropertyValue(prop);
      });
      
      return styles;
    }, selector);
  }

  async determineComponentType(componentTestId: string): Promise<'interactive' | 'display' | 'form' | 'navigation'> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    const selector = `[data-testid="${componentTestId}"]`;
    
    return await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return 'display';
      
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute('role');
      
      // Check for form elements
      if (['input', 'textarea', 'select', 'button', 'form'].includes(tagName)) {
        return 'form';
      }
      
      // Check for navigation
      if (tagName === 'nav' || role === 'navigation' || element.closest('nav')) {
        return 'navigation';
      }
      
      // Check for interactive elements
      if (
        tagName === 'a' ||
        role === 'button' ||
        role === 'tab' ||
        element.hasAttribute('onclick') ||
        element.hasAttribute('tabindex')
      ) {
        return 'interactive';
      }
      
      return 'display';
    }, selector);
  }

  async testAccessibility(componentTestId: string): Promise<AccessibilityReport> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    const selector = `[data-testid="${componentTestId}"]`;
    
    return await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) {
        return {
          hasAriaLabel: false,
          hasRole: false,
          isKeyboardAccessible: false,
          violations: ['Element not found']
        };
      }
      
      const violations: string[] = [];
      
      // Check ARIA label
      const hasAriaLabel = !!(
        element.getAttribute('aria-label') ||
        element.getAttribute('aria-labelledby') ||
        element.textContent?.trim()
      );
      
      // Check role
      const hasRole = !!(element.getAttribute('role') || element.tagName.toLowerCase());
      
      // Check keyboard accessibility
      const isKeyboardAccessible = !!(
        element.getAttribute('tabindex') !== '-1' &&
        (element.hasAttribute('tabindex') || 
         ['a', 'button', 'input', 'textarea', 'select'].includes(element.tagName.toLowerCase()))
      );
      
      // Add violations
      if (!hasAriaLabel && ['button', 'input', 'textarea'].includes(element.tagName.toLowerCase())) {
        violations.push('Interactive element missing accessible name');
      }
      
      if (!isKeyboardAccessible && element.hasAttribute('onclick')) {
        violations.push('Interactive element not keyboard accessible');
      }
      
      return {
        hasAriaLabel,
        hasRole,
        isKeyboardAccessible,
        violations
      };
    }, selector);
  }

  async measurePerformance(componentTestId: string): Promise<PerformanceMetrics> {
    if (!this.page) throw new Error('UI Simulator not initialized');

    // Start performance measurement
    const startTime = Date.now();
    
    // Trigger a re-render by changing state
    await this.triggerComponentState(componentTestId, 'hover');
    await this.resetComponentState(componentTestId);
    
    const renderTime = Date.now() - startTime;
    
    // Get memory usage (simplified)
    const memoryInfo = await this.page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    return {
      renderTime,
      repaints: 1, // Simplified - would need more complex measurement
      layoutShifts: 0, // Would need PerformanceObserver
      memoryImpact: memoryInfo,
    };
  }

  async generateComponentReport(): Promise<string> {
    const components = await this.captureComponentStates();
    
    const report = `
# UI Component Test Report
Generated: ${new Date().toISOString()}

## Summary
- Total Components: ${components.length}
- Interactive Components: ${components.filter(c => c.type === 'interactive').length}
- Form Components: ${components.filter(c => c.type === 'form').length}
- Navigation Components: ${components.filter(c => c.type === 'navigation').length}

## Component Details

${components.map(component => `
### ${component.name} (${component.type})
- States Tested: ${component.states.length}
- Accessibility Score: ${this.calculateA11yScore(component.accessibility)}/100
- Performance: ${component.performance.renderTime}ms render time
- Issues: ${component.accessibility.violations.length > 0 ? component.accessibility.violations.join(', ') : 'None'}
`).join('\n')}

## Screenshots
Component state screenshots saved to: ${this.screenshotDir}
`;

    const reportPath = path.join(this.screenshotDir, 'ui-test-report.md');
    await fs.writeFile(reportPath, report);
    
    return report;
  }

  private calculateA11yScore(accessibility: AccessibilityReport): number {
    let score = 100;
    if (!accessibility.hasAriaLabel) score -= 25;
    if (!accessibility.hasRole) score -= 25;
    if (!accessibility.isKeyboardAccessible) score -= 25;
    score -= accessibility.violations.length * 5;
    return Math.max(0, score);
  }

  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      this.isInitialized = false;
      console.log('🧹 UI Simulator cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  // Utility method to check if development server is running
  async checkServer(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const simulator = new UISimulator();
  
  (async () => {
    try {
      // Check if server is running
      if (!(await simulator.checkServer())) {
        console.error('❌ Development server not running. Please start with: npm run dev');
        process.exit(1);
      }
      
      await simulator.initialize({ headless: true });
      const report = await simulator.generateComponentReport();
      console.log('📊 Component test report generated:');
      console.log(report);
      
    } catch (error) {
      console.error('💥 UI Simulation failed:', error);
      process.exit(1);
    } finally {
      await simulator.cleanup();
    }
  })();
}