// Performance monitoring utilities for Dev Center
interface PerformanceMetrics {
  pageLoadTime: number;
  chunkLoadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  bundleSize: number;
}

interface PerformanceThresholds {
  pageLoad: number;
  chunkLoad: number;
  render: number;
  interaction: number;
  memory: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    chunkLoadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    bundleSize: 0
  };
  
  private thresholds: PerformanceThresholds = {
    pageLoad: 2000, // 2s
    chunkLoad: 1000, // 1s
    render: 16, // 16ms (60fps)
    interaction: 100, // 100ms
    memory: 50 * 1024 * 1024 // 50MB
  };
  
  private observers: PerformanceObserver[] = [];
  
  constructor() {
    this.initializeObservers();
  }
  
  private initializeObservers() {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.pageLoadTime = navEntry.loadEventEnd - navEntry.fetchStart;
          }
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
      
      // Resource timing for chunks
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('dev-center') && entry.name.endsWith('.js')) {
            const loadTime = entry.responseEnd - entry.fetchStart;
            this.metrics.chunkLoadTime = Math.max(this.metrics.chunkLoadTime, loadTime);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
      
      // Measure timing for renders
      const measureObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.startsWith('dev-center-render')) {
            this.metrics.renderTime = entry.duration;
          }
        });
      });
      measureObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(measureObserver);
    }
  }
  
  // Start measuring a specific operation
  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }
  
  // End measuring and get duration
  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    return measure ? measure.duration : 0;
  }
  
  // Measure component render time
  measureRender(componentName: string, renderFn: () => void): number {
    const measureName = `dev-center-render-${componentName}`;
    this.startMeasure(measureName);
    renderFn();
    return this.endMeasure(measureName);
  }
  
  // Measure interaction response time
  measureInteraction(interactionName: string, interactionFn: () => Promise<void>): Promise<number> {
    const measureName = `dev-center-interaction-${interactionName}`;
    this.startMeasure(measureName);
    
    return interactionFn().then(() => {
      const duration = this.endMeasure(measureName);
      this.metrics.interactionTime = Math.max(this.metrics.interactionTime, duration);
      return duration;
    });
  }
  
  // Get memory usage
  getMemoryUsage(): number {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.metrics.memoryUsage = memInfo.usedJSHeapSize;
      return memInfo.usedJSHeapSize;
    }
    return 0;
  }
  
  // Check if performance is within thresholds
  checkPerformance(): { passed: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (this.metrics.pageLoadTime > this.thresholds.pageLoad) {
      issues.push(`Page load time (${this.metrics.pageLoadTime.toFixed(0)}ms) exceeds threshold (${this.thresholds.pageLoad}ms)`);
    }
    
    if (this.metrics.chunkLoadTime > this.thresholds.chunkLoad) {
      issues.push(`Chunk load time (${this.metrics.chunkLoadTime.toFixed(0)}ms) exceeds threshold (${this.thresholds.chunkLoad}ms)`);
    }
    
    if (this.metrics.renderTime > this.thresholds.render) {
      issues.push(`Render time (${this.metrics.renderTime.toFixed(2)}ms) exceeds threshold (${this.thresholds.render}ms)`);
    }
    
    if (this.metrics.interactionTime > this.thresholds.interaction) {
      issues.push(`Interaction time (${this.metrics.interactionTime.toFixed(0)}ms) exceeds threshold (${this.thresholds.interaction}ms)`);
    }
    
    if (this.metrics.memoryUsage > this.thresholds.memory) {
      issues.push(`Memory usage (${this.formatBytes(this.metrics.memoryUsage)}) exceeds threshold (${this.formatBytes(this.thresholds.memory)})`);
    }
    
    return {
      passed: issues.length === 0,
      issues
    };
  }
  
  // Generate performance report
  generateReport(): {
    metrics: PerformanceMetrics;
    thresholds: PerformanceThresholds;
    score: number;
    recommendations: string[];
  } {
    const check = this.checkPerformance();
    const score = Math.max(0, 100 - (check.issues.length * 20));
    
    const recommendations: string[] = [];
    
    if (this.metrics.pageLoadTime > 1000) {
      recommendations.push('Consider implementing service worker for caching');
    }
    
    if (this.metrics.chunkLoadTime > 500) {
      recommendations.push('Optimize chunk splitting strategy');
    }
    
    if (this.metrics.renderTime > 8) {
      recommendations.push('Consider React.memo for expensive components');
    }
    
    if (this.metrics.memoryUsage > 30 * 1024 * 1024) {
      recommendations.push('Review memory usage and potential leaks');
    }
    
    return {
      metrics: this.metrics,
      thresholds: this.thresholds,
      score,
      recommendations
    };
  }
  
  // Export performance data
  exportMetrics(): string {
    const report = this.generateReport();
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...report
    }, null, 2);
  }
  
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  
  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
  
  // Set custom thresholds
  setThresholds(thresholds: Partial<PerformanceThresholds>) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
  
  // Get current metrics
  getMetrics(): PerformanceMetrics {
    this.getMemoryUsage(); // Update memory usage
    return { ...this.metrics };
  }
}

export const performanceMonitor = new PerformanceMonitor();