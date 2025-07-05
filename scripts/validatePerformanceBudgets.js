/**
 * Performance Budget Validator
 * Validates current build against performance budgets and targets
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import performanceConfig from '../performance.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PerformanceBudgetValidator {
  constructor() {
    this.projectRoot = join(__dirname, '..');
    this.distPath = join(this.projectRoot, 'dist');
    this.platforms = ['web', 'extension', 'electron'];
    this.results = {};
    this.violations = [];
    this.warnings = [];
  }

  /**
   * Run complete performance budget validation
   */
  async validate() {
    console.log('🎯 Starting performance budget validation...\n');

    // Validate bundle sizes
    await this.validateBundleSizes();
    
    // Validate network budgets
    await this.validateNetworkBudgets();
    
    // Validate memory budgets (simulated)
    await this.validateMemoryBudgets();
    
    // Generate validation report
    this.generateValidationReport();
    
    // Print summary
    this.printValidationSummary();
    
    // Exit with error code if violations found
    if (this.violations.length > 0) {
      console.log('\n❌ Performance budget validation failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All performance budgets passed!');
    }
  }

  /**
   * Validate bundle size budgets
   */
  async validateBundleSizes() {
    console.log('📦 Validating bundle size budgets...');
    
    for (const platform of this.platforms) {
      const platformPath = join(this.distPath, platform);
      
      if (!existsSync(platformPath)) {
        console.log(`⚠️  Platform ${platform} not built - skipping validation`);
        continue;
      }

      const bundleAnalysis = this.analyzeBundleSize(platformPath);
      const limit = performanceConfig.bundleSizeLimits[platform] * 1024 * 1024; // Convert MB to bytes
      
      this.results[platform] = {
        bundleSize: bundleAnalysis,
        budgetStatus: bundleAnalysis.totalSize <= limit ? 'pass' : 'fail'
      };

      if (bundleAnalysis.totalSize > limit) {
        this.violations.push({
          type: 'bundle-size',
          platform,
          message: `Bundle size exceeds limit: ${this.formatBytes(bundleAnalysis.totalSize)} > ${this.formatBytes(limit)}`,
          current: bundleAnalysis.totalSize,
          limit: limit,
          severity: 'error'
        });
      } else {
        // Warn if approaching limit (80% of budget)
        const warningThreshold = limit * 0.8;
        if (bundleAnalysis.totalSize > warningThreshold) {
          this.warnings.push({
            type: 'bundle-size-warning',
            platform,
            message: `Bundle size approaching limit: ${this.formatBytes(bundleAnalysis.totalSize)} (${Math.round((bundleAnalysis.totalSize / limit) * 100)}% of budget)`,
            current: bundleAnalysis.totalSize,
            limit: limit,
            severity: 'warning'
          });
        }
      }

      console.log(`  ${platform}: ${this.formatBytes(bundleAnalysis.totalSize)} / ${this.formatBytes(limit)} ${bundleAnalysis.totalSize <= limit ? '✅' : '❌'}`);
    }
  }

  /**
   * Validate network performance budgets
   */
  async validateNetworkBudgets() {
    console.log('\n🌐 Validating network performance budgets...');
    
    const connectionTypes = ['slow3G', 'regular3G', 'fast3G', 'wifi'];
    
    for (const platform of this.platforms) {
      if (!this.results[platform]) continue;
      
      const bundleSize = this.results[platform].bundleSize;
      
      for (const connectionType of connectionTypes) {
        const budget = performanceConfig.networkBudgets[connectionType].budgets;
        const violations = this.checkNetworkBudget(bundleSize, budget, platform, connectionType);
        
        if (violations.length > 0) {
          this.violations.push(...violations);
        }
      }
    }
  }

  /**
   * Validate memory usage budgets (simulated)
   */
  async validateMemoryBudgets() {
    console.log('\n🧠 Validating memory usage budgets...');
    
    for (const platform of this.platforms) {
      if (!this.results[platform]) continue;
      
      // Simulate memory usage based on bundle size
      const bundleSize = this.results[platform].bundleSize;
      const estimatedMemoryUsage = this.estimateMemoryUsage(bundleSize, platform);
      const memoryLimit = performanceConfig.memoryLimits.heapUsed[platform] * 1024 * 1024; // Convert MB to bytes
      
      this.results[platform].memoryUsage = estimatedMemoryUsage;
      
      if (estimatedMemoryUsage.total > memoryLimit) {
        this.violations.push({
          type: 'memory-usage',
          platform,
          message: `Estimated memory usage exceeds limit: ${this.formatBytes(estimatedMemoryUsage.total)} > ${this.formatBytes(memoryLimit)}`,
          current: estimatedMemoryUsage.total,
          limit: memoryLimit,
          severity: 'error'
        });
      }

      console.log(`  ${platform}: ${this.formatBytes(estimatedMemoryUsage.total)} / ${this.formatBytes(memoryLimit)} ${estimatedMemoryUsage.total <= memoryLimit ? '✅' : '❌'}`);
    }
  }

  /**
   * Analyze bundle size breakdown
   */
  analyzeBundleSize(platformPath) {
    const files = this.getAllFiles(platformPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    const assetFiles = files.filter(f => !f.endsWith('.js') && !f.endsWith('.css') && !f.endsWith('.html'));

    const jsSize = this.calculateTotalSize(jsFiles, platformPath);
    const cssSize = this.calculateTotalSize(cssFiles, platformPath);
    const assetSize = this.calculateTotalSize(assetFiles, platformPath);
    const totalSize = jsSize + cssSize + assetSize;

    return {
      totalSize,
      javascript: jsSize,
      css: cssSize,
      assets: assetSize,
      breakdown: {
        javascript: { size: jsSize, files: jsFiles.length },
        css: { size: cssSize, files: cssFiles.length },
        assets: { size: assetSize, files: assetFiles.length }
      }
    };
  }

  /**
   * Check network budget compliance
   */
  checkNetworkBudget(bundleSize, budget, platform, connectionType) {
    const violations = [];
    
    // Convert budget MB to bytes
    const budgetBytes = {
      totalAssets: budget.totalAssets * 1024 * 1024,
      javascript: budget.javascript * 1024 * 1024,
      css: budget.css * 1024 * 1024,
      images: budget.images * 1024 * 1024
    };

    // Check total assets budget
    if (bundleSize.totalSize > budgetBytes.totalAssets) {
      violations.push({
        type: 'network-budget',
        platform,
        connectionType,
        message: `Total assets exceed ${connectionType} budget: ${this.formatBytes(bundleSize.totalSize)} > ${this.formatBytes(budgetBytes.totalAssets)}`,
        current: bundleSize.totalSize,
        limit: budgetBytes.totalAssets,
        severity: 'error'
      });
    }

    // Check JavaScript budget
    if (bundleSize.javascript > budgetBytes.javascript) {
      violations.push({
        type: 'network-budget',
        platform,
        connectionType,
        message: `JavaScript size exceeds ${connectionType} budget: ${this.formatBytes(bundleSize.javascript)} > ${this.formatBytes(budgetBytes.javascript)}`,
        current: bundleSize.javascript,
        limit: budgetBytes.javascript,
        severity: 'error'
      });
    }

    // Check CSS budget
    if (bundleSize.css > budgetBytes.css) {
      violations.push({
        type: 'network-budget',
        platform,
        connectionType,
        message: `CSS size exceeds ${connectionType} budget: ${this.formatBytes(bundleSize.css)} > ${this.formatBytes(budgetBytes.css)}`,
        current: bundleSize.css,
        limit: budgetBytes.css,
        severity: 'error'
      });
    }

    return violations;
  }

  /**
   * Estimate memory usage based on bundle size
   */
  estimateMemoryUsage(bundleSize, platform) {
    // Memory estimation based on empirical data
    const baseMemory = 10 * 1024 * 1024; // 10MB base memory
    const jsMemoryMultiplier = 3; // JS typically uses 3x its file size in memory
    const cssMemoryMultiplier = 1.5; // CSS uses 1.5x its file size
    const assetMemoryMultiplier = 1; // Assets use roughly their file size

    const jsMemory = bundleSize.javascript * jsMemoryMultiplier;
    const cssMemory = bundleSize.css * cssMemoryMultiplier;
    const assetMemory = bundleSize.assets * assetMemoryMultiplier;

    return {
      total: baseMemory + jsMemory + cssMemory + assetMemory,
      breakdown: {
        base: baseMemory,
        javascript: jsMemory,
        css: cssMemory,
        assets: assetMemory
      }
    };
  }

  /**
   * Generate validation report
   */
  generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      platforms: Object.keys(this.results),
      results: this.results,
      violations: this.violations,
      warnings: this.warnings,
      summary: {
        totalViolations: this.violations.length,
        totalWarnings: this.warnings.length,
        platformsPassed: Object.values(this.results).filter(r => r.budgetStatus === 'pass').length,
        platformsFailed: Object.values(this.results).filter(r => r.budgetStatus === 'fail').length
      },
      budgetConfig: performanceConfig
    };

    // Write report to file
    const reportPath = join(this.projectRoot, 'performance-budget-report.json');
    require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📋 Performance budget report saved to: ${reportPath}`);
  }

  /**
   * Print validation summary
   */
  printValidationSummary() {
    console.log('\n📊 PERFORMANCE BUDGET VALIDATION SUMMARY:');
    
    // Platform summary
    console.log('\n  Platform Results:');
    Object.entries(this.results).forEach(([platform, result]) => {
      const status = result.budgetStatus === 'pass' ? '✅ PASS' : '❌ FAIL';
      const bundleSize = this.formatBytes(result.bundleSize.totalSize);
      const limit = this.formatBytes(performanceConfig.bundleSizeLimits[platform] * 1024 * 1024);
      console.log(`    ${platform}: ${status} (${bundleSize} / ${limit})`);
    });

    // Violations summary
    if (this.violations.length > 0) {
      console.log('\n  ❌ VIOLATIONS:');
      this.violations.forEach((violation, index) => {
        console.log(`    ${index + 1}. ${violation.type} (${violation.platform}): ${violation.message}`);
      });
    }

    // Warnings summary
    if (this.warnings.length > 0) {
      console.log('\n  ⚠️  WARNINGS:');
      this.warnings.forEach((warning, index) => {
        console.log(`    ${index + 1}. ${warning.type} (${warning.platform}): ${warning.message}`);
      });
    }

    // Budget utilization
    console.log('\n  Budget Utilization:');
    Object.entries(this.results).forEach(([platform, result]) => {
      const limit = performanceConfig.bundleSizeLimits[platform] * 1024 * 1024;
      const utilization = (result.bundleSize.totalSize / limit) * 100;
      const utilizationIcon = utilization > 80 ? '🔴' : utilization > 60 ? '🟡' : '🟢';
      console.log(`    ${platform}: ${utilizationIcon} ${utilization.toFixed(1)}% of budget used`);
    });

    // Recommendations
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('\n  💡 RECOMMENDATIONS:');
      recommendations.forEach((rec, index) => {
        console.log(`    ${index + 1}. ${rec}`);
      });
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Bundle size recommendations
    const failedPlatforms = Object.entries(this.results)
      .filter(([, result]) => result.budgetStatus === 'fail')
      .map(([platform]) => platform);

    if (failedPlatforms.length > 0) {
      recommendations.push(`Reduce bundle size for platforms: ${failedPlatforms.join(', ')}`);
      recommendations.push('Consider implementing lazy loading for non-critical components');
      recommendations.push('Review and remove unused dependencies');
      recommendations.push('Enable tree shaking and dead code elimination');
    }

    // Network budget recommendations
    const networkViolations = this.violations.filter(v => v.type === 'network-budget');
    if (networkViolations.length > 0) {
      recommendations.push('Optimize for slower network conditions');
      recommendations.push('Implement progressive loading strategies');
      recommendations.push('Consider using CDN for static assets');
    }

    // Memory recommendations
    const memoryViolations = this.violations.filter(v => v.type === 'memory-usage');
    if (memoryViolations.length > 0) {
      recommendations.push('Optimize memory usage patterns');
      recommendations.push('Implement proper component cleanup and memory management');
      recommendations.push('Consider memory-efficient data structures');
    }

    return recommendations;
  }

  /**
   * Calculate total size of files
   */
  calculateTotalSize(files, basePath) {
    return files.reduce((total, file) => {
      const fullPath = join(basePath, file);
      return total + statSync(fullPath).size;
    }, 0);
  }

  /**
   * Get all files recursively
   */
  getAllFiles(dir, basePath = '') {
    const files = [];
    const items = readdirSync(dir);

    items.forEach(item => {
      const itemPath = join(dir, item);
      const relativePath = join(basePath, item);

      if (statSync(itemPath).isDirectory()) {
        files.push(...this.getAllFiles(itemPath, relativePath));
      } else {
        files.push(relativePath);
      }
    });

    return files;
  }

  /**
   * Format bytes to human-readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new PerformanceBudgetValidator();
  validator.validate().catch(console.error);
}

export default PerformanceBudgetValidator;