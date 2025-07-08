/**
 * Unified Reporting System
 * Handles output formatting for all validation results
 */

import fs from 'fs/promises';
import path from 'path';

export interface ValidationResult {
  id: string;
  name: string;
  type: 'static' | 'runtime' | 'integration' | 'visual';
  status: 'pass' | 'fail' | 'warning' | 'skip';
  message: string;
  details?: any;
  duration: number;
  timestamp: Date;
  file?: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  fixable?: boolean;
  suggestion?: string;
}

export interface ValidationSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  skipped: number;
  duration: number;
  coverage: {
    static: number;
    runtime: number;
    integration: number;
    visual: number;
  };
}

export interface ValidationReport {
  summary: ValidationSummary;
  results: ValidationResult[];
  metadata: {
    timestamp: Date;
    mode: string;
    version: string;
    environment: string;
  };
}

export class ValidationReporter {
  private results: ValidationResult[] = [];
  private startTime: Date = new Date();

  addResult(result: Omit<ValidationResult, 'timestamp'>): void {
    this.results.push({
      ...result,
      timestamp: new Date(),
    });
  }

  addResults(results: Array<Omit<ValidationResult, 'timestamp'>>): void {
    results.forEach(result => this.addResult(result));
  }

  generateSummary(): ValidationSummary {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const skipped = this.results.filter(r => r.status === 'skip').length;
    const duration = Date.now() - this.startTime.getTime();

    const coverage = {
      static: this.results.filter(r => r.type === 'static').length,
      runtime: this.results.filter(r => r.type === 'runtime').length,
      integration: this.results.filter(r => r.type === 'integration').length,
      visual: this.results.filter(r => r.type === 'visual').length,
    };

    return {
      total,
      passed,
      failed,
      warnings,
      skipped,
      duration,
      coverage,
    };
  }

  generateReport(mode: string = 'development'): ValidationReport {
    return {
      summary: this.generateSummary(),
      results: this.results,
      metadata: {
        timestamp: new Date(),
        mode,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    };
  }

  async outputConsole(): Promise<void> {
    const report = this.generateReport();
    const summary = report.summary;

    console.log('\n🔍 Validation Report Summary');
    console.log('=' .repeat(50));
    
    console.log(`📊 Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${summary.warnings} (${((summary.warnings / summary.total) * 100).toFixed(1)}%)`);
    console.log(`⏭️  Skipped: ${summary.skipped} (${((summary.skipped / summary.total) * 100).toFixed(1)}%)`);
    console.log(`⏱️  Duration: ${(summary.duration / 1000).toFixed(2)}s`);

    console.log('\n📈 Coverage by Type:');
    console.log(`  Static Analysis: ${summary.coverage.static} tests`);
    console.log(`  Runtime Checks: ${summary.coverage.runtime} tests`);
    console.log(`  Integration Tests: ${summary.coverage.integration} tests`);
    console.log(`  Visual Tests: ${summary.coverage.visual} tests`);

    // Show failures and warnings
    const failures = this.results.filter(r => r.status === 'fail');
    const warnings = this.results.filter(r => r.status === 'warning');

    if (failures.length > 0) {
      console.log('\n❌ Failures:');
      failures.forEach(result => {
        console.log(`  ${this.getStatusIcon(result.status)} ${result.name}`);
        console.log(`     ${result.message}`);
        if (result.file) {
          console.log(`     📁 ${result.file}${result.line ? `:${result.line}` : ''}`);
        }
        if (result.suggestion) {
          console.log(`     💡 ${result.suggestion}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(result => {
        console.log(`  ${this.getStatusIcon(result.status)} ${result.name}`);
        console.log(`     ${result.message}`);
        if (result.file) {
          console.log(`     📁 ${result.file}${result.line ? `:${result.line}` : ''}`);
        }
      });
    }

    // Overall status
    const overallStatus = failures.length === 0 ? 'PASSED' : 'FAILED';
    const statusColor = failures.length === 0 ? '🟢' : '🔴';
    console.log(`\n${statusColor} Overall Status: ${overallStatus}\n`);
  }

  async outputJson(outputPath?: string): Promise<void> {
    const report = this.generateReport();
    const filePath = outputPath || path.join('scripts/validation/reports', 'validation-report.json');
    
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
    
    console.log(`📄 JSON report saved to: ${filePath}`);
  }

  async outputHtml(outputPath?: string): Promise<void> {
    const report = this.generateReport();
    const filePath = outputPath || path.join('scripts/validation/reports', 'validation-report.html');
    
    const html = this.generateHtmlReport(report);
    
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, html);
    
    console.log(`🌐 HTML report saved to: ${filePath}`);
  }

  async outputJunit(outputPath?: string): Promise<void> {
    const report = this.generateReport();
    const filePath = outputPath || path.join('scripts/validation/reports', 'junit-results.xml');
    
    const xml = this.generateJunitReport(report);
    
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, xml);
    
    console.log(`📋 JUnit report saved to: ${filePath}`);
  }

  private getStatusIcon(status: ValidationResult['status']): string {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      case 'skip': return '⏭️';
      default: return '❓';
    }
  }

  private generateHtmlReport(report: ValidationReport): string {
    const { summary, results, metadata } = report;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validation Report - ${metadata.timestamp.toLocaleDateString()}</title>
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
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .warning { color: #ffc107; }
        .skip { color: #6c757d; }
        .results {
            margin-top: 30px;
        }
        .result {
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            border-left: 4px solid;
        }
        .result.pass { border-color: #28a745; background: #f8fff9; }
        .result.fail { border-color: #dc3545; background: #fff8f8; }
        .result.warning { border-color: #ffc107; background: #fffdf5; }
        .result.skip { border-color: #6c757d; background: #f8f9fa; }
        .result-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 10px;
        }
        .result-name {
            font-weight: bold;
            flex-grow: 1;
        }
        .result-duration {
            color: #666;
            font-size: 0.9em;
        }
        .result-message {
            margin-bottom: 10px;
        }
        .result-details {
            font-family: monospace;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #666;
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
            <h1>🔍 Validation Report</h1>
            <p><strong>Generated:</strong> ${metadata.timestamp.toLocaleString()}</p>
            <p><strong>Mode:</strong> ${metadata.mode} | <strong>Environment:</strong> ${metadata.environment}</p>
            <p><strong>Duration:</strong> ${(summary.duration / 1000).toFixed(2)}s</p>
        </div>

        <div class="summary">
            <div class="metric">
                <div class="metric-value">${summary.total}</div>
                <div>Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value pass">${summary.passed}</div>
                <div>Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value fail">${summary.failed}</div>
                <div>Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value warning">${summary.warnings}</div>
                <div>Warnings</div>
            </div>
            <div class="metric">
                <div class="metric-value skip">${summary.skipped}</div>
                <div>Skipped</div>
            </div>
        </div>

        <div class="results">
            <h2>Test Results</h2>
            <div class="filter-buttons">
                <button class="filter-btn active" onclick="filterResults('all')">All</button>
                <button class="filter-btn" onclick="filterResults('fail')">Failures</button>
                <button class="filter-btn" onclick="filterResults('warning')">Warnings</button>
                <button class="filter-btn" onclick="filterResults('pass')">Passed</button>
            </div>
            
            ${results.map(result => `
                <div class="result ${result.status}" data-status="${result.status}">
                    <div class="result-header">
                        <div class="result-name">${this.getStatusIcon(result.status)} ${result.name}</div>
                        <div class="result-duration">${result.duration}ms</div>
                    </div>
                    <div class="result-message">${result.message}</div>
                    ${result.file ? `<div class="result-details">📁 ${result.file}${result.line ? `:${result.line}` : ''}</div>` : ''}
                    ${result.suggestion ? `<div class="result-details">💡 ${result.suggestion}</div>` : ''}
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
  }

  private generateJunitReport(report: ValidationReport): string {
    const { summary, results } = report;
    
    const testsuites = results.reduce((acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites tests="${summary.total}" failures="${summary.failed}" errors="0" time="${summary.duration / 1000}">\n`;

    Object.entries(testsuites).forEach(([type, typeResults]) => {
      const typeFailures = typeResults.filter(r => r.status === 'fail').length;
      const typeDuration = typeResults.reduce((sum, r) => sum + r.duration, 0);
      
      xml += `  <testsuite name="${type}" tests="${typeResults.length}" failures="${typeFailures}" errors="0" time="${typeDuration / 1000}">\n`;
      
      typeResults.forEach(result => {
        xml += `    <testcase name="${result.name}" time="${result.duration / 1000}"`;
        if (result.file) {
          xml += ` file="${result.file}"`;
        }
        xml += '>\n';
        
        if (result.status === 'fail') {
          xml += `      <failure message="${this.escapeXml(result.message)}">\n`;
          xml += `        ${this.escapeXml(result.message)}\n`;
          if (result.suggestion) {
            xml += `        Suggestion: ${this.escapeXml(result.suggestion)}\n`;
          }
          xml += '      </failure>\n';
        }
        
        xml += '    </testcase>\n';
      });
      
      xml += '  </testsuite>\n';
    });

    xml += '</testsuites>\n';
    return xml;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  clear(): void {
    this.results = [];
    this.startTime = new Date();
  }

  getResults(): ValidationResult[] {
    return [...this.results];
  }

  hasFailures(): boolean {
    return this.results.some(r => r.status === 'fail');
  }

  getExitCode(): number {
    return this.hasFailures() ? 1 : 0;
  }
}