**Visual UI Testing & Simulation System**

## Browser Automation & Visual Testing

```typescript
// scripts/validation/visual/ui-simulator.ts
import { chromium, Page, Browser } from 'playwright';
import { promises as fs } from 'fs';

class UISimulator {
  private browser: Browser;
  private page: Page;

  async initialize() {
    this.browser = await chromium.launch({ headless: false }); // Show browser for debugging
    this.page = await this.browser.newPage();
    await this.page.goto('http://localhost:5173'); // Your dev server
  }

  async captureComponentStates() {
    const components = await this.discoverComponents();
    const results = [];

    for (const component of components) {
      const states = await this.testComponentStates(component);
      results.push({
        component: component.name,
        states,
        screenshots: states.map(s => s.screenshot),
        accessibility: await this.testAccessibility(component),
        performance: await this.measurePerformance(component)
      });
    }

    return results;
  }

  async testComponentStates(component: string) {
    const states = ['default', 'hover', 'focus', 'active', 'disabled', 'loading'];
    const results = [];

    for (const state of states) {
      await this.triggerComponentState(component, state);
    
      const screenshot = await this.page.screenshot({
        clip: await this.getComponentBounds(component)
      });

      const domSnapshot = await this.page.evaluate(() => 
        document.querySelector(`[data-testid="${component}"]`)?.outerHTML
      );

      const computedStyles = await this.getComputedStyles(component);
    
      results.push({
        state,
        screenshot: screenshot.toString('base64'),
        domSnapshot,
        computedStyles,
        timestamp: Date.now()
      });
    }

    return results;
  }

  async simulateUserInteractions() {
    // Test real user workflows
    const workflows = [
      'theme-switching',
      'panel-dragging',
      'form-submission',
      'navigation'
    ];

    for (const workflow of workflows) {
      await this.executeWorkflow(workflow);
    }
  }
}
```

## Visual Regression & Comparison

```typescript
// scripts/validation/visual/visual-regression.ts
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

class VisualRegression {
  async compareScreenshots(baseline: Buffer, current: Buffer) {
    const img1 = PNG.sync.read(baseline);
    const img2 = PNG.sync.read(current);
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const pixelDiff = pixelmatch(
      img1.data, img2.data, diff.data, width, height,
      { threshold: 0.1 }
    );

    return {
      pixelDiff,
      diffPercentage: (pixelDiff / (width * height)) * 100,
      diffImage: PNG.sync.write(diff).toString('base64'),
      passed: pixelDiff < 100 // Configurable threshold
    };
  }

  async generateVisualReport(results: VisualTestResult[]) {
    const report = {
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      },
      results,
      timestamp: new Date().toISOString()
    };

    // Generate HTML report with side-by-side comparisons
    await this.generateHTMLReport(report);
    return report;
  }
}
```

## UI State Serializer for Claude

```typescript
// scripts/validation/visual/ui-serializer.ts
class UIStateSerializer {
  async serializeCurrentState(): Promise<SerializedUIState> {
    const page = await this.getCurrentPage();
  
    return {
      layout: await this.captureLayoutStructure(),
      styling: await this.captureEffectiveStyles(),
      interactions: await this.captureInteractiveElements(),
      accessibility: await this.captureA11yState(),
      performance: await this.capturePerformanceMetrics(),
      visualDescription: await this.generateVisualDescription(),
      userFlowData: await this.captureUserFlowData()
    };
  }

  async generateVisualDescription(): Promise<string> {
    // Create a text description of what's visually displayed
    const elements = await this.page.$$('[data-testid]');
    const descriptions = [];

    for (const element of elements) {
      const bounds = await element.boundingBox();
      const text = await element.textContent();
      const role = await element.getAttribute('role');
      const visible = await element.isVisible();

      descriptions.push({
        element: await element.getAttribute('data-testid'),
        position: bounds,
        content: text,
        role,
        visible,
        styles: await this.getVisualStyles(element)
      });
    }

    return this.formatForClaude(descriptions);
  }

  formatForClaude(data: any): string {
    // Format visual state in a way Claude can understand and debug
    return `
UI STATE REPORT:
================

LAYOUT STRUCTURE:
${this.describeLayout(data)}

VISIBLE ELEMENTS:
${this.describeElements(data)}

STYLING ISSUES:
${this.identifyStyleIssues(data)}

INTERACTION STATES:
${this.describeInteractions(data)}
    `;
  }
}
```

## Automated User Journey Testing

```typescript
// scripts/validation/visual/user-journey.ts
class UserJourneyTester {
  async testCompleteUserFlows() {
    const journeys = [
      {
        name: 'theme-switching',
        steps: [
          'click theme switcher',
          'verify theme change',
          'check all components updated',
          'test accessibility contrast'
        ]
      },
      {
        name: 'panel-management',
        steps: [
          'drag panel to new position',
          'resize panel',
          'verify constraints',
          'test responsive behavior'
        ]
      }
    ];

    for (const journey of journeys) {
      const result = await this.executeJourney(journey);
      await this.captureJourneyEvidence(journey.name, result);
    }
  }

  async captureJourneyEvidence(journeyName: string, result: any) {
    // Create comprehensive evidence package
    return {
      screenshots: result.screenshots,
      videoRecording: result.video,
      performanceProfile: result.performance,
      accessibilityReport: result.a11y,
      consoleErrors: result.errors,
      networkRequests: result.network,
      summary: this.generateJourneySummary(result)
    };
  }
}
```

## Real-time UI Monitoring

```typescript
// scripts/validation/runtime/ui-monitor.ts
class UIMonitor {
  async startRealTimeMonitoring() {
    // Inject monitoring script into running app
    await this.page.addScriptTag({
      content: `
        window.__UI_MONITOR__ = {
          errors: [],
          performance: {},
          interactions: [],
        
          captureError: (error) => {
            window.__UI_MONITOR__.errors.push({
              message: error.message,
              stack: error.stack,
              timestamp: Date.now(),
              component: window.__UI_MONITOR__.getCurrentComponent()
            });
          },
        
          captureInteraction: (type, target, data) => {
            window.__UI_MONITOR__.interactions.push({
              type, target, data, timestamp: Date.now()
            });
          },
        
          capturePerformance: () => {
            return {
              renderTime: performance.now(),
              memoryUsage: performance.memory,
              paintTiming: performance.getEntriesByType('paint')
            };
          }
        };
      
        // Capture all errors
        window.addEventListener('error', window.__UI_MONITOR__.captureError);
      
        // Monitor interactions
        document.addEventListener('click', (e) => {
          window.__UI_MONITOR__.captureInteraction('click', e.target, {
            coordinates: { x: e.clientX, y: e.clientY }
          });
        });
      `
    });
  }

  async getMonitoringData() {
    return await this.page.evaluate(() => window.__UI_MONITOR__);
  }
}
```

## Integration with Validation Runner

```typescript
// scripts/validation/core/visual-validation-runner.ts
class VisualValidationRunner {
  async runCompleteUIValidation() {
    const simulator = new UISimulator();
    const regression = new VisualRegression();
    const serializer = new UIStateSerializer();
    const journeyTester = new UserJourneyTester();

    await simulator.initialize();

    const results = {
      componentStates: await simulator.captureComponentStates(),
      userJourneys: await journeyTester.testCompleteUserFlows(),
      visualRegression: await regression.runRegressionTests(),
      currentState: await serializer.serializeCurrentState(),
      accessibility: await this.runAccessibilityTests(),
      performance: await this.runPerformanceTests()
    };

    // Generate Claude-friendly report
    const claudeReport = await this.generateClaudeReport(results);
    await fs.writeFile('validation-results/ui-state-for-claude.txt', claudeReport);

    return results;
  }

  async generateClaudeReport(results: any): Promise<string> {
    return `
COMPLETE UI VALIDATION REPORT
============================

VISUAL STATE SUMMARY:
${this.summarizeVisualState(results)}

COMPONENT ANALYSIS:
${this.analyzeComponents(results)}

USER INTERACTION VALIDATION:
${this.validateInteractions(results)}

ACCESSIBILITY STATUS:
${this.reportAccessibility(results)}

PERFORMANCE METRICS:
${this.reportPerformance(results)}

ISSUES DETECTED:
${this.listIssues(results)}

RECOMMENDED ACTIONS:
${this.generateRecommendations(results)}
    `;
  }
}
```

## CLI Commands for Visual Testing

```json
{
  "scripts": {
    "test:visual": "tsx scripts/validation/visual/ui-simulator.ts",
    "test:regression": "tsx scripts/validation/visual/visual-regression.ts",
    "test:journeys": "tsx scripts/validation/visual/user-journey.ts",
    "monitor:ui": "tsx scripts/validation/runtime/ui-monitor.ts",
    "validate:ui-complete": "tsx scripts/validation/core/visual-validation-runner.ts",
    "debug:ui-state": "tsx scripts/validation/visual/ui-serializer.ts --output-for-claude"
  }
}
```

## Usage in Development

```bash
# When you see a UI issue, capture complete state for Claude
npm run debug:ui-state

# Run visual regression tests
npm run test:visual

# Test complete user journeys
npm run test:journeys

# Monitor UI in real-time
npm run monitor:ui
```

This system creates a **bridge between visual UI and Claude's CLI perspective** by:

1. **Capturing visual evidence** - Screenshots, videos, visual state
2. **Serializing UI state** - Converting visual information to text Claude can analyze
3. **Simulating real user interactions** - Testing the same flows you would manually test
4. **Providing detailed reports** - Formatted specifically for Claude to understand UI issues
5. **Real-time monitoring** - Capturing issues as they occur

Now when Claude Code debugs, it has access to the same visual information you see in the browser!
