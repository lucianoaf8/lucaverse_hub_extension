/**
 * Bundle Analyzer - Comprehensive bundle size analysis and optimization
 * Provides detailed analysis of bundle composition, dependencies, and optimization opportunities
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Platform-specific bundle size limits (in MB)
const BUNDLE_LIMITS = {
  web: 3,
  extension: 5,
  electron: 10
};

// Performance budget thresholds
const PERFORMANCE_BUDGETS = {
  initialBundle: 1, // MB
  chunkSize: 0.5, // MB
  totalAssets: 5, // MB
  cssSize: 0.3, // MB
  jsSize: 2, // MB
};

class BundleAnalyzer {
  constructor() {
    this.projectRoot = join(__dirname, '..');
    this.distPath = join(this.projectRoot, 'dist');
    this.platforms = ['web', 'extension', 'electron'];
    this.results = {};
  }

  /**
   * Run comprehensive bundle analysis
   */
  async analyze() {
    console.log('🔍 Starting comprehensive bundle analysis...\n');

    for (const platform of this.platforms) {
      const platformPath = join(this.distPath, platform);
      
      if (!existsSync(platformPath)) {
        console.log(`⚠️  Platform ${platform} not built - skipping analysis`);
        continue;
      }

      console.log(`📊 Analyzing ${platform} bundle...`);
      
      const analysis = await this.analyzePlatform(platform, platformPath);
      this.results[platform] = analysis;
      
      this.printPlatformSummary(platform, analysis);
    }

    // Generate comprehensive report
    this.generateComprehensiveReport();
    this.generateOptimizationRecommendations();
    this.checkPerformanceBudgets();
    
    console.log('\n✅ Bundle analysis complete!');
    console.log(`📋 Full report saved to: ${join(this.projectRoot, 'bundle-analysis-report.json')}`);
  }

  /**
   * Analyze individual platform bundle
   */
  async analyzePlatform(platform, platformPath) {
    const files = this.getAllFiles(platformPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    const cssFiles = files.filter(f => f.endsWith('.css'));
    const assetFiles = files.filter(f => !f.endsWith('.js') && !f.endsWith('.css') && !f.endsWith('.html'));

    const analysis = {
      platform,
      totalSize: 0,
      fileCount: files.length,
      breakdown: {
        javascript: this.analyzeFileGroup(jsFiles, platformPath),
        css: this.analyzeFileGroup(cssFiles, platformPath),
        assets: this.analyzeFileGroup(assetFiles, platformPath)
      },
      chunks: this.analyzeChunks(jsFiles, platformPath),
      dependencies: this.analyzeDependencies(jsFiles, platformPath),
      duplicates: this.findDuplicates(files, platformPath),
      compressionReport: this.analyzeCompression(files, platformPath),
      treeshakingReport: this.analyzeTreeshaking(jsFiles, platformPath)
    };

    analysis.totalSize = analysis.breakdown.javascript.totalSize + 
                        analysis.breakdown.css.totalSize + 
                        analysis.breakdown.assets.totalSize;

    return analysis;
  }

  /**
   * Analyze file group (JS, CSS, assets)
   */
  analyzeFileGroup(files, platformPath) {
    let totalSize = 0;
    const fileDetails = [];

    files.forEach(file => {
      const fullPath = join(platformPath, file);
      const stats = statSync(fullPath);
      const size = stats.size;
      totalSize += size;

      fileDetails.push({
        name: file,
        size: size,
        sizeFormatted: this.formatBytes(size),
        gzipEstimate: Math.round(size * 0.3), // Rough gzip estimate
        lastModified: stats.mtime
      });
    });

    // Sort by size descending
    fileDetails.sort((a, b) => b.size - a.size);

    return {
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      fileCount: files.length,
      files: fileDetails,
      largestFiles: fileDetails.slice(0, 5),
      averageSize: files.length > 0 ? totalSize / files.length : 0
    };
  }

  /**
   * Analyze chunk distribution
   */
  analyzeChunks(jsFiles, platformPath) {
    const chunks = {
      vendor: jsFiles.filter(f => f.includes('vendor')),
      panels: jsFiles.filter(f => f.includes('panel-')),
      utils: jsFiles.filter(f => f.includes('utils')),
      stores: jsFiles.filter(f => f.includes('stores')),
      main: jsFiles.filter(f => f.includes('main') || f.includes('index')),
      other: jsFiles.filter(f => 
        !f.includes('vendor') && 
        !f.includes('panel-') && 
        !f.includes('utils') && 
        !f.includes('stores') && 
        !f.includes('main') && 
        !f.includes('index')
      )
    };

    const chunkAnalysis = {};
    
    Object.entries(chunks).forEach(([chunkType, files]) => {
      const totalSize = files.reduce((sum, file) => {
        const fullPath = join(platformPath, file);
        return sum + statSync(fullPath).size;
      }, 0);

      chunkAnalysis[chunkType] = {
        fileCount: files.length,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        files: files.map(file => ({
          name: file,
          size: statSync(join(platformPath, file)).size
        })).sort((a, b) => b.size - a.size)
      };
    });

    return chunkAnalysis;
  }

  /**
   * Analyze dependency composition
   */
  analyzeDependencies(jsFiles, platformPath) {
    const dependencies = {
      react: { files: [], size: 0 },
      state: { files: [], size: 0 },
      animation: { files: [], size: 0 },
      utils: { files: [], size: 0 },
      testing: { files: [], size: 0 },
      other: { files: [], size: 0 }
    };

    jsFiles.forEach(file => {
      const size = statSync(join(platformPath, file)).size;
      
      if (file.includes('vendor-react')) {
        dependencies.react.files.push(file);
        dependencies.react.size += size;
      } else if (file.includes('vendor-state')) {
        dependencies.state.files.push(file);
        dependencies.state.size += size;
      } else if (file.includes('vendor-animation')) {
        dependencies.animation.files.push(file);
        dependencies.animation.size += size;
      } else if (file.includes('vendor-utils')) {
        dependencies.utils.files.push(file);
        dependencies.utils.size += size;
      } else if (file.includes('vendor-testing')) {
        dependencies.testing.files.push(file);
        dependencies.testing.size += size;
      } else if (file.includes('vendor')) {
        dependencies.other.files.push(file);
        dependencies.other.size += size;
      }
    });

    // Calculate percentages
    const totalVendorSize = Object.values(dependencies).reduce((sum, dep) => sum + dep.size, 0);
    
    Object.keys(dependencies).forEach(key => {
      const dep = dependencies[key];
      dep.percentage = totalVendorSize > 0 ? (dep.size / totalVendorSize) * 100 : 0;
      dep.sizeFormatted = this.formatBytes(dep.size);
    });

    return dependencies;
  }

  /**
   * Find duplicate dependencies and code
   */
  findDuplicates(files, platformPath) {
    const duplicates = [];
    const fileHashes = new Map();

    // Simple duplicate detection based on file size
    // In production, would use actual content hashing
    files.forEach(file => {
      const fullPath = join(platformPath, file);
      const size = statSync(fullPath).size;
      
      if (fileHashes.has(size)) {
        const existing = fileHashes.get(size);
        duplicates.push({
          size,
          files: [existing, file],
          potentialSavings: size
        });
      } else {
        fileHashes.set(size, file);
      }
    });

    return {
      count: duplicates.length,
      duplicates: duplicates.slice(0, 10), // Top 10 duplicates
      totalPotentialSavings: duplicates.reduce((sum, dup) => sum + dup.potentialSavings, 0)
    };
  }

  /**
   * Analyze compression potential
   */
  analyzeCompression(files, platformPath) {
    let totalUncompressed = 0;
    let estimatedCompressed = 0;

    files.forEach(file => {
      const fullPath = join(platformPath, file);
      const size = statSync(fullPath).size;
      totalUncompressed += size;

      // Compression estimates based on file type
      const ext = extname(file);
      let compressionRatio = 0.7; // Default

      switch (ext) {
        case '.js':
          compressionRatio = 0.3; // JavaScript compresses well
          break;
        case '.css':
          compressionRatio = 0.4; // CSS compresses well
          break;
        case '.html':
          compressionRatio = 0.4;
          break;
        case '.svg':
          compressionRatio = 0.5;
          break;
        case '.json':
          compressionRatio = 0.3;
          break;
        default:
          compressionRatio = 0.8; // Assets don't compress as much
      }

      estimatedCompressed += size * compressionRatio;
    });

    return {
      uncompressedSize: totalUncompressed,
      estimatedCompressedSize: estimatedCompressed,
      compressionRatio: totalUncompressed > 0 ? (1 - estimatedCompressed / totalUncompressed) : 0,
      savings: totalUncompressed - estimatedCompressed,
      uncompressedFormatted: this.formatBytes(totalUncompressed),
      compressedFormatted: this.formatBytes(estimatedCompressed),
      savingsFormatted: this.formatBytes(totalUncompressed - estimatedCompressed)
    };
  }

  /**
   * Analyze tree shaking effectiveness
   */
  analyzeTreeshaking(jsFiles, platformPath) {
    const analysis = {
      totalFiles: jsFiles.length,
      estimatedDeadCode: 0,
      optimizationOpportunities: []
    };

    jsFiles.forEach(file => {
      const size = statSync(join(platformPath, file)).size;
      
      // Estimate dead code based on file patterns
      if (file.includes('vendor')) {
        // Vendor files typically have 20-40% unused code
        analysis.estimatedDeadCode += size * 0.3;
        analysis.optimizationOpportunities.push({
          file,
          type: 'vendor-treeshaking',
          estimatedSavings: size * 0.3,
          recommendation: 'Consider using specific imports instead of full libraries'
        });
      }
      
      if (file.includes('utils')) {
        // Utility files may have unused functions
        analysis.estimatedDeadCode += size * 0.15;
        analysis.optimizationOpportunities.push({
          file,
          type: 'utility-optimization',
          estimatedSavings: size * 0.15,
          recommendation: 'Review and remove unused utility functions'
        });
      }
    });

    analysis.estimatedDeadCodeFormatted = this.formatBytes(analysis.estimatedDeadCode);
    return analysis;
  }

  /**
   * Print platform summary
   */
  printPlatformSummary(platform, analysis) {
    console.log(`\n📊 ${platform.toUpperCase()} BUNDLE ANALYSIS:`);
    console.log(`   Total Size: ${analysis.breakdown.javascript.totalSizeFormatted} JS + ${analysis.breakdown.css.totalSizeFormatted} CSS + ${analysis.breakdown.assets.totalSizeFormatted} Assets = ${this.formatBytes(analysis.totalSize)}`);
    console.log(`   Files: ${analysis.fileCount} total`);
    console.log(`   Bundle Limit: ${this.formatBytes(BUNDLE_LIMITS[platform] * 1024 * 1024)} (${analysis.totalSize > BUNDLE_LIMITS[platform] * 1024 * 1024 ? '❌ EXCEEDED' : '✅ OK'})`);
    
    // Top 3 largest files
    const allFiles = [
      ...analysis.breakdown.javascript.files,
      ...analysis.breakdown.css.files,
      ...analysis.breakdown.assets.files
    ].sort((a, b) => b.size - a.size).slice(0, 3);
    
    console.log(`   Largest Files:`);
    allFiles.forEach((file, i) => {
      console.log(`     ${i + 1}. ${file.name} - ${file.sizeFormatted}`);
    });

    // Compression potential
    const compression = analysis.compressionReport;
    console.log(`   Compression: ${compression.savingsFormatted} savings (${Math.round(compression.compressionRatio * 100)}% reduction)`);
  }

  /**
   * Generate comprehensive report
   */
  generateComprehensiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      platforms: this.results,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations(),
      budgetAnalysis: this.analyzeBudgets()
    };

    const reportPath = join(this.projectRoot, 'bundle-analysis-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable report
    this.generateHumanReadableReport(report);
  }

  /**
   * Generate summary across all platforms
   */
  generateSummary() {
    const platforms = Object.keys(this.results);
    const totalSize = platforms.reduce((sum, platform) => sum + this.results[platform].totalSize, 0);
    const totalFiles = platforms.reduce((sum, platform) => sum + this.results[platform].fileCount, 0);

    return {
      totalPlatforms: platforms.length,
      totalSize: totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      totalFiles: totalFiles,
      averageSizePerPlatform: platforms.length > 0 ? totalSize / platforms.length : 0,
      largestPlatform: platforms.reduce((largest, platform) => {
        return this.results[platform].totalSize > (this.results[largest]?.totalSize || 0) ? platform : largest;
      }, ''),
      compressionSavings: platforms.reduce((sum, platform) => sum + this.results[platform].compressionReport.savings, 0)
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    Object.entries(this.results).forEach(([platform, analysis]) => {
      // Size-based recommendations
      if (analysis.totalSize > BUNDLE_LIMITS[platform] * 1024 * 1024) {
        recommendations.push({
          platform,
          type: 'size-limit-exceeded',
          priority: 'high',
          message: `Bundle size exceeds ${BUNDLE_LIMITS[platform]}MB limit`,
          suggestion: 'Consider code splitting, lazy loading, or removing unused dependencies'
        });
      }

      // Large chunk recommendations
      Object.entries(analysis.chunks).forEach(([chunkType, chunk]) => {
        if (chunk.totalSize > 500 * 1024) { // 500KB
          recommendations.push({
            platform,
            type: 'large-chunk',
            priority: 'medium',
            message: `${chunkType} chunk is large (${chunk.totalSizeFormatted})`,
            suggestion: `Consider splitting ${chunkType} chunk further`
          });
        }
      });

      // Duplicate recommendations
      if (analysis.duplicates.count > 0) {
        recommendations.push({
          platform,
          type: 'duplicates-found',
          priority: 'medium',
          message: `Found ${analysis.duplicates.count} potential duplicates`,
          suggestion: `Review and deduplicate shared code. Potential savings: ${this.formatBytes(analysis.duplicates.totalPotentialSavings)}`
        });
      }

      // Tree shaking recommendations
      if (analysis.treeshakingReport.estimatedDeadCode > 100 * 1024) { // 100KB
        recommendations.push({
          platform,
          type: 'dead-code',
          priority: 'high',
          message: `Estimated ${analysis.treeshakingReport.estimatedDeadCodeFormatted} of dead code`,
          suggestion: 'Improve tree shaking configuration and use specific imports'
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Check performance budgets
   */
  checkPerformanceBudgets() {
    console.log('\n💰 PERFORMANCE BUDGET ANALYSIS:');
    
    Object.entries(this.results).forEach(([platform, analysis]) => {
      console.log(`\n  ${platform.toUpperCase()}:`);
      
      // Check bundle size budget
      const totalSizeMB = analysis.totalSize / (1024 * 1024);
      const budgetExceeded = totalSizeMB > PERFORMANCE_BUDGETS.totalAssets;
      console.log(`    Total Assets: ${this.formatBytes(analysis.totalSize)} / ${PERFORMANCE_BUDGETS.totalAssets}MB ${budgetExceeded ? '❌' : '✅'}`);
      
      // Check JS budget
      const jsSizeMB = analysis.breakdown.javascript.totalSize / (1024 * 1024);
      const jsBudgetExceeded = jsSizeMB > PERFORMANCE_BUDGETS.jsSize;
      console.log(`    JavaScript: ${analysis.breakdown.javascript.totalSizeFormatted} / ${PERFORMANCE_BUDGETS.jsSize}MB ${jsBudgetExceeded ? '❌' : '✅'}`);
      
      // Check CSS budget
      const cssSizeMB = analysis.breakdown.css.totalSize / (1024 * 1024);
      const cssBudgetExceeded = cssSizeMB > PERFORMANCE_BUDGETS.cssSize;
      console.log(`    CSS: ${analysis.breakdown.css.totalSizeFormatted} / ${PERFORMANCE_BUDGETS.cssSize}MB ${cssBudgetExceeded ? '❌' : '✅'}`);
      
      // Check largest chunk budget
      const largestChunk = Object.values(analysis.chunks).reduce((largest, chunk) => 
        chunk.totalSize > largest.totalSize ? chunk : largest, { totalSize: 0 });
      const chunkBudgetExceeded = largestChunk.totalSize > PERFORMANCE_BUDGETS.chunkSize * 1024 * 1024;
      console.log(`    Largest Chunk: ${this.formatBytes(largestChunk.totalSize)} / ${PERFORMANCE_BUDGETS.chunkSize}MB ${chunkBudgetExceeded ? '❌' : '✅'}`);
    });
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations() {
    const recommendations = this.generateRecommendations();
    
    console.log('\n🎯 OPTIMIZATION RECOMMENDATIONS:');
    
    if (recommendations.length === 0) {
      console.log('   ✅ No major optimization opportunities found!');
      return;
    }

    recommendations.forEach((rec, index) => {
      const emoji = rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⚠️' : '💡';
      console.log(`\n   ${emoji} ${rec.type.toUpperCase()} (${rec.platform})`);
      console.log(`      ${rec.message}`);
      console.log(`      💡 ${rec.suggestion}`);
    });
  }

  /**
   * Generate human-readable report
   */
  generateHumanReadableReport(report) {
    const lines = [];
    lines.push('# Bundle Analysis Report');
    lines.push(`Generated: ${report.timestamp}`);
    lines.push('');
    
    // Summary
    lines.push('## Summary');
    lines.push(`- Total Platforms: ${report.summary.totalPlatforms}`);
    lines.push(`- Total Size: ${report.summary.totalSizeFormatted}`);
    lines.push(`- Total Files: ${report.summary.totalFiles}`);
    lines.push(`- Largest Platform: ${report.summary.largestPlatform}`);
    lines.push(`- Compression Savings: ${this.formatBytes(report.summary.compressionSavings)}`);
    lines.push('');

    // Platform details
    Object.entries(report.platforms).forEach(([platform, analysis]) => {
      lines.push(`## ${platform.toUpperCase()} Platform`);
      lines.push(`- Total Size: ${this.formatBytes(analysis.totalSize)}`);
      lines.push(`- Bundle Limit: ${this.formatBytes(BUNDLE_LIMITS[platform] * 1024 * 1024)} (${analysis.totalSize > BUNDLE_LIMITS[platform] * 1024 * 1024 ? 'EXCEEDED' : 'OK'})`);
      lines.push(`- JavaScript: ${analysis.breakdown.javascript.totalSizeFormatted} (${analysis.breakdown.javascript.fileCount} files)`);
      lines.push(`- CSS: ${analysis.breakdown.css.totalSizeFormatted} (${analysis.breakdown.css.fileCount} files)`);
      lines.push(`- Assets: ${analysis.breakdown.assets.totalSizeFormatted} (${analysis.breakdown.assets.fileCount} files)`);
      lines.push('');
    });

    // Recommendations
    if (report.recommendations.length > 0) {
      lines.push('## Recommendations');
      report.recommendations.forEach(rec => {
        lines.push(`- **${rec.type}** (${rec.platform}, ${rec.priority} priority): ${rec.message}`);
        lines.push(`  - ${rec.suggestion}`);
      });
    }

    const reportPath = join(this.projectRoot, 'bundle-analysis-report.md');
    writeFileSync(reportPath, lines.join('\n'));
  }

  /**
   * Analyze performance budgets
   */
  analyzeBudgets() {
    const budgetResults = {};

    Object.entries(this.results).forEach(([platform, analysis]) => {
      budgetResults[platform] = {
        totalAssets: {
          current: analysis.totalSize,
          budget: PERFORMANCE_BUDGETS.totalAssets * 1024 * 1024,
          status: analysis.totalSize <= PERFORMANCE_BUDGETS.totalAssets * 1024 * 1024 ? 'pass' : 'fail'
        },
        javascript: {
          current: analysis.breakdown.javascript.totalSize,
          budget: PERFORMANCE_BUDGETS.jsSize * 1024 * 1024,
          status: analysis.breakdown.javascript.totalSize <= PERFORMANCE_BUDGETS.jsSize * 1024 * 1024 ? 'pass' : 'fail'
        },
        css: {
          current: analysis.breakdown.css.totalSize,
          budget: PERFORMANCE_BUDGETS.cssSize * 1024 * 1024,
          status: analysis.breakdown.css.totalSize <= PERFORMANCE_BUDGETS.cssSize * 1024 * 1024 ? 'pass' : 'fail'
        }
      };
    });

    return budgetResults;
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
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

export default BundleAnalyzer;