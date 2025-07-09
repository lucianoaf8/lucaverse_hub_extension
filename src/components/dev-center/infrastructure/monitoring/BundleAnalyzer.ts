// Bundle analysis utilities for dev center performance monitoring
export interface BundleChunk {
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface BundleAnalysis {
  totalSize: number;
  totalGzipSize: number;
  chunks: BundleChunk[];
  suggestions: string[];
}

class BundleAnalyzer {
  private sizeThresholds = {
    landing: 50 * 1024, // 50KB
    tool: 200 * 1024,   // 200KB
    total: 1024 * 1024  // 1MB
  };
  
  // Analyze current bundle structure
  analyzeBundles(): BundleAnalysis {
    // This would integrate with actual bundle analysis in production
    // For now, we'll return simulated data
    
    const chunks: BundleChunk[] = [
      {
        name: 'dev-center-landing',
        size: 45 * 1024,
        gzipSize: 12 * 1024,
        modules: ['DevLanding', 'DevToolbar', 'QuickActions'],
        priority: 'critical'
      },
      {
        name: 'theme-studio',
        size: 180 * 1024,
        gzipSize: 48 * 1024,
        modules: ['ThemeStudio', 'ColorHarmony', 'Typography'],
        priority: 'high'
      },
      {
        name: 'component-workshop',
        size: 165 * 1024,
        gzipSize: 42 * 1024,
        modules: ['ComponentWorkshop', 'TestStates', 'BuildComponent'],
        priority: 'high'
      },
      {
        name: 'layout-designer',
        size: 195 * 1024,
        gzipSize: 52 * 1024,
        modules: ['LayoutDesigner', 'StructureDesign', 'ResponsiveDesign'],
        priority: 'medium'
      },
      {
        name: 'quality-gate',
        size: 140 * 1024,
        gzipSize: 38 * 1024,
        modules: ['QualityGate', 'MeasureBaseline', 'AnalyzeIssues'],
        priority: 'medium'
      }
    ];
    
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalGzipSize = chunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
    
    const suggestions = this.generateSuggestions(chunks, totalSize);
    
    return {
      totalSize,
      totalGzipSize,
      chunks,
      suggestions
    };
  }
  
  private generateSuggestions(chunks: BundleChunk[], totalSize: number): string[] {
    const suggestions: string[] = [];
    
    // Check individual chunk sizes
    chunks.forEach(chunk => {
      if (chunk.name === 'dev-center-landing' && chunk.size > this.sizeThresholds.landing) {
        suggestions.push(`Landing chunk (${this.formatSize(chunk.size)}) exceeds ${this.formatSize(this.sizeThresholds.landing)} threshold`);
      }
      
      if (chunk.name !== 'dev-center-landing' && chunk.size > this.sizeThresholds.tool) {
        suggestions.push(`${chunk.name} chunk (${this.formatSize(chunk.size)}) exceeds ${this.formatSize(this.sizeThresholds.tool)} threshold`);
      }
    });
    
    // Check total size
    if (totalSize > this.sizeThresholds.total) {
      suggestions.push(`Total bundle size (${this.formatSize(totalSize)}) exceeds ${this.formatSize(this.sizeThresholds.total)} threshold`);
    }
    
    // Performance suggestions
    if (chunks.length > 6) {
      suggestions.push('Consider consolidating small chunks to reduce HTTP requests');
    }
    
    const avgChunkSize = totalSize / chunks.length;
    if (avgChunkSize < 50 * 1024) {
      suggestions.push('Some chunks are too small - consider bundling related modules');
    }
    
    return suggestions;
  }
  
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  
  // Monitor bundle performance
  monitorBundlePerformance() {
    const analysis = this.analyzeBundles();
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Bundle Analysis');
      console.log('Total Size:', this.formatSize(analysis.totalSize));
      console.log('Total Gzip Size:', this.formatSize(analysis.totalGzipSize));
      console.table(analysis.chunks.map(chunk => ({
        name: chunk.name,
        size: this.formatSize(chunk.size),
        gzipSize: this.formatSize(chunk.gzipSize),
        priority: chunk.priority
      })));
      
      if (analysis.suggestions.length > 0) {
        console.warn('Suggestions:');
        analysis.suggestions.forEach(suggestion => console.warn(`- ${suggestion}`));
      }
      console.groupEnd();
    }
    
    return analysis;
  }
  
  // Set custom thresholds for bundle sizes
  setThresholds(thresholds: Partial<typeof this.sizeThresholds>) {
    this.sizeThresholds = { ...this.sizeThresholds, ...thresholds };
  }
}

export const bundleAnalyzer = new BundleAnalyzer();