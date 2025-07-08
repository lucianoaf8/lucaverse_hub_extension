/**
 * Visual Regression Testing System
 * Pixel-perfect image comparison with baseline management and reporting
 */

import { promises as fs } from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { UISimulator, ComponentInfo } from './ui-simulator.js';

export interface VisualTestResult {
  component: string;
  state: string;
  baseline: string;
  current: string;
  diff?: string;
  pixelDiff: number;
  diffPercentage: number;
  passed: boolean;
  threshold: number;
  dimensions: { width: number; height: number };
  timestamp: Date;
}

export interface RegressionReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    newBaselines: number;
  };
  results: VisualTestResult[];
  timestamp: Date;
  configuration: RegressionConfig;
}

export interface RegressionConfig {
  threshold: number;
  updateBaselines: boolean;
  ignoreAntialiasing: boolean;
  includeAA: boolean;
  alpha: number;
  diffMask: boolean;
}

export class VisualRegression {
  private simulator: UISimulator;
  private config: RegressionConfig;
  private baselinesDir: string;
  private currentDir: string;
  private diffsDir: string;
  private reportsDir: string;

  constructor(simulator: UISimulator, config: Partial<RegressionConfig> = {}) {
    this.simulator = simulator;
    this.config = {
      threshold: 0.1,
      updateBaselines: false,
      ignoreAntialiasing: true,
      includeAA: false,
      alpha: 0.1,
      diffMask: true,
      ...config,
    };

    const baseDir = path.join(process.cwd(), 'scripts/validation/reports/visual-regression');
    this.baselinesDir = path.join(baseDir, 'baselines');
    this.currentDir = path.join(baseDir, 'current');
    this.diffsDir = path.join(baseDir, 'diffs');
    this.reportsDir = path.join(baseDir, 'reports');
  }

  async initialize(): Promise<void> {
    await Promise.all([
      fs.mkdir(this.baselinesDir, { recursive: true }),
      fs.mkdir(this.currentDir, { recursive: true }),
      fs.mkdir(this.diffsDir, { recursive: true }),
      fs.mkdir(this.reportsDir, { recursive: true }),
    ]);
  }

  async runRegressionTests(): Promise<RegressionReport> {
    console.log('📊 Running visual regression tests...');

    await this.initialize();
    
    // Capture current screenshots
    const components = await this.simulator.captureComponentStates();
    const results: VisualTestResult[] = [];

    for (const component of components) {
      console.log(`🔍 Testing visual regression for ${component.name}...`);
      
      for (const state of component.states) {
        try {
          const result = await this.compareComponentState(component, state.state, state.screenshot);
          results.push(result);
        } catch (error) {
          console.error(`❌ Failed to test ${component.name} (${state.state}):`, error);
          results.push({
            component: component.name,
            state: state.state,
            baseline: '',
            current: state.screenshot,
            pixelDiff: -1,
            diffPercentage: 100,
            passed: false,
            threshold: this.config.threshold,
            dimensions: { width: 0, height: 0 },
            timestamp: new Date(),
          });
        }
      }
    }

    const report: RegressionReport = {
      summary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        newBaselines: results.filter(r => !r.baseline).length,
      },
      results,
      timestamp: new Date(),
      configuration: this.config,
    };

    // Save report
    const reportPath = path.join(this.reportsDir, `regression-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    await this.generateHTMLReport(report);

    console.log(`✅ Visual regression testing completed. Report saved to ${reportPath}`);
    return report;
  }

  async compareComponentState(component: ComponentInfo, state: string, currentScreenshotPath: string): Promise<VisualTestResult> {
    const fileName = `${component.name}-${state}.png`;
    const baselinePath = path.join(this.baselinesDir, fileName);
    const currentPath = path.join(this.currentDir, fileName);
    const diffPath = path.join(this.diffsDir, fileName);

    // Copy current screenshot to current directory
    if (currentScreenshotPath) {
      await fs.copyFile(currentScreenshotPath, currentPath);
    }

    // Check if baseline exists
    const baselineExists = await this.fileExists(baselinePath);
    
    if (!baselineExists) {
      if (this.config.updateBaselines) {
        // Create new baseline
        await fs.copyFile(currentPath, baselinePath);
        console.log(`📸 Created new baseline for ${component.name} (${state})`);
        
        return {
          component: component.name,
          state,
          baseline: baselinePath,
          current: currentPath,
          pixelDiff: 0,
          diffPercentage: 0,
          passed: true,
          threshold: this.config.threshold,
          dimensions: await this.getImageDimensions(currentPath),
          timestamp: new Date(),
        };
      } else {
        console.warn(`⚠️ No baseline found for ${component.name} (${state}). Run with --update-baselines to create.`);
        
        return {
          component: component.name,
          state,
          baseline: '',
          current: currentPath,
          pixelDiff: -1,
          diffPercentage: 100,
          passed: false,
          threshold: this.config.threshold,
          dimensions: await this.getImageDimensions(currentPath),
          timestamp: new Date(),
        };
      }
    }

    // Compare images
    const comparison = await this.compareImages(baselinePath, currentPath, diffPath);
    
    // Update baseline if requested and test failed
    if (this.config.updateBaselines && !comparison.passed) {
      await fs.copyFile(currentPath, baselinePath);
      console.log(`🔄 Updated baseline for ${component.name} (${state})`);
    }

    return {
      component: component.name,
      state,
      baseline: baselinePath,
      current: currentPath,
      diff: comparison.diffPath,
      pixelDiff: comparison.pixelDiff,
      diffPercentage: comparison.diffPercentage,
      passed: comparison.passed,
      threshold: this.config.threshold,
      dimensions: comparison.dimensions,
      timestamp: new Date(),
    };
  }

  async compareImages(baselinePath: string, currentPath: string, diffPath: string): Promise<{
    pixelDiff: number;
    diffPercentage: number;
    passed: boolean;
    diffPath: string;
    dimensions: { width: number; height: number };
  }> {
    try {
      // Read images
      const baseline = PNG.sync.read(await fs.readFile(baselinePath));
      const current = PNG.sync.read(await fs.readFile(currentPath));

      // Ensure images have the same dimensions
      if (baseline.width !== current.width || baseline.height !== current.height) {
        throw new Error(`Image dimensions don't match: baseline(${baseline.width}x${baseline.height}) vs current(${current.width}x${current.height})`);
      }

      const { width, height } = baseline;
      const diff = new PNG({ width, height });

      // Compare pixels
      const pixelDiff = pixelmatch(
        baseline.data,
        current.data,
        diff.data,
        width,
        height,
        {
          threshold: this.config.threshold,
          includeAA: this.config.includeAA,
          alpha: this.config.alpha,
          diffMask: this.config.diffMask,
        }
      );

      const totalPixels = width * height;
      const diffPercentage = (pixelDiff / totalPixels) * 100;
      const passed = diffPercentage < (this.config.threshold * 100);

      // Save diff image
      await fs.writeFile(diffPath, PNG.sync.write(diff));

      return {
        pixelDiff,
        diffPercentage,
        passed,
        diffPath,
        dimensions: { width, height },
      };
    } catch (error) {
      throw new Error(`Image comparison failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateHTMLReport(report: RegressionReport): Promise<string> {
    const reportPath = path.join(this.reportsDir, 'visual-regression-report.html');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Regression Test Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .metric {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .pass { color: #28a745; background: #f8fff9; border-color: #28a745; }
        .fail { color: #dc3545; background: #fff8f8; border-color: #dc3545; }
        .new { color: #007bff; background: #f8f9ff; border-color: #007bff; }
        .results {
            margin-top: 30px;
        }
        .result {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .result.failed {
            border-color: #dc3545;
            background: #fff8f8;
        }
        .result.passed {
            border-color: #28a745;
            background: #f8fff9;
        }
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .result-title {
            font-weight: bold;
            font-size: 1.1em;
        }
        .result-status {
            padding: 4px 12px;
            border-radius: 4px;
            color: white;
            font-size: 0.9em;
        }
        .result-status.passed { background: #28a745; }
        .result-status.failed { background: #dc3545; }
        .images {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        .image-container {
            text-align: center;
        }
        .image-container img {
            max-width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .image-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin: 15px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        .metrics div {
            text-align: center;
        }
        .metrics .label {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 5px;
        }
        .metrics .value {
            font-weight: bold;
        }
        .filter-buttons {
            margin-bottom: 20px;
        }
        .filter-btn {
            padding: 8px 16px;
            margin-right: 10px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
        }
        .filter-btn.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Visual Regression Test Report</h1>
            <p><strong>Generated:</strong> ${report.timestamp.toLocaleString()}</p>
            <p><strong>Configuration:</strong> Threshold: ${report.configuration.threshold}, Update Baselines: ${report.configuration.updateBaselines}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value">${report.summary.total}</div>
                <div>Total Tests</div>
            </div>
            <div class="metric pass">
                <div class="metric-value">${report.summary.passed}</div>
                <div>Passed</div>
            </div>
            <div class="metric fail">
                <div class="metric-value">${report.summary.failed}</div>
                <div>Failed</div>
            </div>
            <div class="metric new">
                <div class="metric-value">${report.summary.newBaselines}</div>
                <div>New Baselines</div>
            </div>
        </div>

        <div class="results">
            <h2>Test Results</h2>
            <div class="filter-buttons">
                <button class="filter-btn active" onclick="filterResults('all')">All</button>
                <button class="filter-btn" onclick="filterResults('failed')">Failed Only</button>
                <button class="filter-btn" onclick="filterResults('passed')">Passed Only</button>
            </div>
            
            ${report.results.map(result => `
                <div class="result ${result.passed ? 'passed' : 'failed'}" data-status="${result.passed ? 'passed' : 'failed'}">
                    <div class="result-header">
                        <div class="result-title">${result.component} - ${result.state}</div>
                        <div class="result-status ${result.passed ? 'passed' : 'failed'}">
                            ${result.passed ? 'PASSED' : 'FAILED'}
                        </div>
                    </div>
                    
                    <div class="metrics">
                        <div>
                            <div class="label">Pixel Diff</div>
                            <div class="value">${result.pixelDiff}</div>
                        </div>
                        <div>
                            <div class="label">Diff %</div>
                            <div class="value">${result.diffPercentage.toFixed(2)}%</div>
                        </div>
                        <div>
                            <div class="label">Threshold</div>
                            <div class="value">${(result.threshold * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                            <div class="label">Dimensions</div>
                            <div class="value">${result.dimensions.width}x${result.dimensions.height}</div>
                        </div>
                    </div>

                    ${result.baseline && result.current ? `
                        <div class="images">
                            <div class="image-container">
                                <div class="image-title">Baseline</div>
                                <img src="${path.relative(this.reportsDir, result.baseline)}" alt="Baseline">
                            </div>
                            <div class="image-container">
                                <div class="image-title">Current</div>
                                <img src="${path.relative(this.reportsDir, result.current)}" alt="Current">
                            </div>
                            ${result.diff ? `
                                <div class="image-container">
                                    <div class="image-title">Difference</div>
                                    <img src="${path.relative(this.reportsDir, result.diff)}" alt="Difference">
                                </div>
                            ` : ''}
                        </div>
                    ` : `
                        <div class="images">
                            <div class="image-container">
                                <div class="image-title">Current (No Baseline)</div>
                                <img src="${path.relative(this.reportsDir, result.current)}" alt="Current">
                            </div>
                        </div>
                    `}
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        function filterResults(status) {
            const results = document.querySelectorAll('.result');
            const buttons = document.querySelectorAll('.filter-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            results.forEach(result => {
                if (status === 'all' || result.dataset.status === status) {
                    result.style.display = 'block';
                } else {
                    result.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>`;

    await fs.writeFile(reportPath, html);
    console.log(`📄 HTML report generated: ${reportPath}`);
    
    return reportPath;
  }

  async updateBaselines(): Promise<void> {
    console.log('🔄 Updating all baselines...');
    
    this.config.updateBaselines = true;
    await this.runRegressionTests();
    
    console.log('✅ Baselines updated successfully');
  }

  async cleanupOldResults(daysToKeep = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const directories = [this.currentDir, this.diffsDir, this.reportsDir];
    
    for (const dir of directories) {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            console.log(`🗑️ Cleaned up old file: ${file}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup directory ${dir}:`, error);
      }
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async getImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const image = PNG.sync.read(imageBuffer);
      return { width: image.width, height: image.height };
    } catch {
      return { width: 0, height: 0 };
    }
  }

  async generateClaudeReport(report: RegressionReport): Promise<string> {
    const failedTests = report.results.filter(r => !r.passed);
    const newBaselines = report.results.filter(r => !r.baseline);
    
    return `
VISUAL REGRESSION TEST ANALYSIS
===============================

SUMMARY:
- Total Tests: ${report.summary.total}
- Passed: ${report.summary.passed} (${((report.summary.passed / report.summary.total) * 100).toFixed(1)}%)
- Failed: ${report.summary.failed} (${((report.summary.failed / report.summary.total) * 100).toFixed(1)}%)
- New Baselines: ${report.summary.newBaselines}

CONFIGURATION:
- Threshold: ${(report.configuration.threshold * 100).toFixed(1)}%
- Update Baselines: ${report.configuration.updateBaselines}
- Anti-aliasing: ${report.configuration.includeAA ? 'Included' : 'Ignored'}

FAILED TESTS:
${failedTests.length > 0 ? failedTests.map(test => `
- ${test.component} (${test.state})
  Diff: ${test.diffPercentage.toFixed(2)}% (${test.pixelDiff} pixels)
  Dimensions: ${test.dimensions.width}x${test.dimensions.height}
  Status: Visual changes detected
`).join('') : 'No visual regressions detected'}

NEW BASELINES NEEDED:
${newBaselines.length > 0 ? newBaselines.map(test => `
- ${test.component} (${test.state})
  Note: No baseline exists for comparison
`).join('') : 'All components have baselines'}

RECOMMENDATIONS:
${failedTests.length > 0 ? `
1. Review failed tests for intentional vs unintentional changes
2. Update baselines if changes are intentional: npm run update:baselines
3. Fix styling issues if changes are unintentional
4. Consider adjusting threshold if too sensitive
` : `
1. All visual tests passed - UI is stable
2. Consider adding more component states for better coverage
`}

DETAILED RESULTS:
View detailed HTML report: scripts/validation/reports/visual-regression/reports/visual-regression-report.html
`;
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const updateBaselines = args.includes('--update-baselines');
  const threshold = parseFloat(args.find(arg => arg.startsWith('--threshold='))?.split('=')[1] || '0.1');
  
  const simulator = new UISimulator();
  const regression = new VisualRegression(simulator, {
    updateBaselines,
    threshold,
  });
  
  (async () => {
    try {
      console.log('🚀 Starting visual regression testing...');
      
      await simulator.initialize({ headless: true });
      
      if (updateBaselines) {
        await regression.updateBaselines();
      } else {
        const report = await regression.runRegressionTests();
        const claudeReport = await regression.generateClaudeReport(report);
        console.log('\n📋 Claude Analysis:');
        console.log(claudeReport);
      }
      
    } catch (error) {
      console.error('💥 Visual regression testing failed:', error);
      process.exit(1);
    } finally {
      await simulator.cleanup();
    }
  })();
}