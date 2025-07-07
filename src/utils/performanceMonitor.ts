/**
 * Performance Monitor - Comprehensive performance tracking and analysis
 * Tracks render times, memory usage, frame rates, and interaction responsiveness
 */

import React from 'react';

export interface PerformanceMetrics {
  // Render performance
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime: number;
  lastRenderTime: number;

  // Memory metrics
  memoryUsage: number;
  memoryPeak: number;
  memoryGrowthRate: number;

  // Frame rate metrics
  fps: number;
  frameTime: number;
  droppedFrames: number;

  // Interaction metrics
  dragResponsiveness: number;
  resizeResponsiveness: number;
  scrollResponsiveness: number;

  // Bundle metrics
  bundleSize: number;
  lazyLoadedChunks: number;
  cacheHitRate: number;

  // Component metrics
  componentRenderCounts: Map<string, number>;
  slowComponents: Array<{ name: string; averageTime: number }>;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  category: 'memory' | 'render' | 'interaction' | 'network';
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  suggestions: string[];
}

export interface PerformanceBenchmark {
  name: string;
  duration: number;
  operations: number;
  opsPerSecond: number;
  memoryUsed: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private benchmarks: PerformanceBenchmark[] = [];
  private isProfilering = false;
  private startTime = 0;
  private frameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private renderObserver: PerformanceObserver | null = null;
  private componentTimings = new Map<string, number[]>();

  // Performance thresholds
  private readonly thresholds = {
    maxRenderTime: 16, // 60fps target
    maxMemoryGrowth: 50 * 1024 * 1024, // 50MB
    minFPS: 30,
    maxDragLatency: 32, // 2 frames at 60fps
    maxComponentRenderTime: 10,
  };

  constructor() {
    this.metrics = this.createEmptyMetrics();
    this.initializeObservers();
  }

  /**
   * Start performance profiling
   */
  startProfiling(): void {
    if (this.isProfilering) return;

    this.isProfilering = true;
    this.startTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = this.startTime;

    // Start frame rate monitoring
    this.startFrameRateMonitoring();

    // Start memory monitoring
    this.startMemoryMonitoring();

    console.log('🚀 Performance profiling started');
  }

  /**
   * Stop performance profiling
   */
  stopProfiling(): void {
    if (!this.isProfilering) return;

    this.isProfilering = false;

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    const duration = performance.now() - this.startTime;
    console.log(`⏹️ Performance profiling stopped (${duration.toFixed(2)}ms)`);
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    this.metrics.renderCount++;
    this.metrics.lastRenderTime = renderTime;
    this.metrics.averageRenderTime =
      (this.metrics.averageRenderTime * (this.metrics.renderCount - 1) + renderTime) /
      this.metrics.renderCount;
    this.metrics.maxRenderTime = Math.max(this.metrics.maxRenderTime, renderTime);

    // Track per-component metrics
    const existingTimes = this.componentTimings.get(componentName) || [];
    existingTimes.push(renderTime);

    // Keep only last 100 renders per component
    if (existingTimes.length > 100) {
      existingTimes.shift();
    }

    this.componentTimings.set(componentName, existingTimes);
    this.metrics.componentRenderCounts.set(
      componentName,
      (this.metrics.componentRenderCounts.get(componentName) || 0) + 1
    );

    // Check for slow renders
    if (renderTime > this.thresholds.maxRenderTime) {
      this.addAlert({
        type: 'warning',
        category: 'render',
        message: `Slow render detected in ${componentName}`,
        value: renderTime,
        threshold: this.thresholds.maxRenderTime,
        timestamp: Date.now(),
        suggestions: [
          'Consider memoizing expensive calculations',
          'Break down large components into smaller ones',
          'Use React.memo for pure components',
        ],
      });
    }

    // Update slow components list
    this.updateSlowComponents();
  }

  /**
   * Track drag/drop operation performance
   */
  trackDragOperation(startTime: number, endTime: number): void {
    const duration = endTime - startTime;
    const responsiveness = Math.max(0, 100 - (duration / this.thresholds.maxDragLatency) * 100);

    this.metrics.dragResponsiveness = (this.metrics.dragResponsiveness + responsiveness) / 2;

    if (duration > this.thresholds.maxDragLatency) {
      this.addAlert({
        type: 'warning',
        category: 'interaction',
        message: 'Slow drag operation detected',
        value: duration,
        threshold: this.thresholds.maxDragLatency,
        timestamp: Date.now(),
        suggestions: [
          'Optimize drag event handlers',
          'Reduce DOM manipulations during drag',
          'Consider using transform instead of position changes',
        ],
      });
    }
  }

  /**
   * Track resize operation performance
   */
  trackResizeOperation(startTime: number, endTime: number): void {
    const duration = endTime - startTime;
    const responsiveness = Math.max(0, 100 - (duration / this.thresholds.maxDragLatency) * 100);

    this.metrics.resizeResponsiveness = (this.metrics.resizeResponsiveness + responsiveness) / 2;
  }

  /**
   * Run performance benchmark
   */
  async runBenchmark(
    name: string,
    operation: () => Promise<void> | void,
    iterations = 1000
  ): Promise<PerformanceBenchmark> {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    for (let i = 0; i < iterations; i++) {
      await operation();
    }

    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();

    const duration = endTime - startTime;
    const memoryUsed = endMemory - startMemory;
    const opsPerSecond = (iterations / duration) * 1000;

    const benchmark: PerformanceBenchmark = {
      name,
      duration,
      operations: iterations,
      opsPerSecond,
      memoryUsed,
      timestamp: Date.now(),
    };

    this.benchmarks.push(benchmark);

    // Keep only last 50 benchmarks
    if (this.benchmarks.length > 50) {
      this.benchmarks.shift();
    }

    console.log(`📊 Benchmark ${name}: ${opsPerSecond.toFixed(2)} ops/sec`);
    return benchmark;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    this.updateCurrentMetrics();
    return { ...this.metrics };
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Get benchmark results
   */
  getBenchmarks(): PerformanceBenchmark[] {
    return [...this.benchmarks];
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = this.createEmptyMetrics();
    this.alerts = [];
    this.componentTimings.clear();
    console.log('🔄 Performance metrics reset');
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overallHealth: this.calculateOverallHealth(),
        renderPerformance: this.metrics.averageRenderTime,
        memoryUsage: this.metrics.memoryUsage,
        fps: this.metrics.fps,
      },
      metrics: this.metrics,
      alerts: this.alerts,
      recommendations: this.generateRecommendations(),
      topSlowComponents: this.getTopSlowComponents(),
      benchmarks: this.benchmarks.slice(-10), // Last 10 benchmarks
    };

    return JSON.stringify(report, this.serializeMap, 2);
  }

  /**
   * Monitor memory leaks
   */
  detectMemoryLeaks(): { suspected: boolean; growthRate: number; recommendations: string[] } {
    const growthRate = this.metrics.memoryGrowthRate;
    const suspected = growthRate > 10; // MB per minute

    const recommendations: string[] = [];
    if (suspected) {
      recommendations.push('Check for event listeners not being cleaned up');
      recommendations.push('Verify React components properly unmount');
      recommendations.push('Review closure usage for memory retention');
      recommendations.push('Check for global variable accumulation');
    }

    return { suspected, growthRate, recommendations };
  }

  // Private methods

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      renderCount: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
      lastRenderTime: 0,
      memoryUsage: 0,
      memoryPeak: 0,
      memoryGrowthRate: 0,
      fps: 0,
      frameTime: 0,
      droppedFrames: 0,
      dragResponsiveness: 100,
      resizeResponsiveness: 100,
      scrollResponsiveness: 100,
      bundleSize: 0,
      lazyLoadedChunks: 0,
      cacheHitRate: 0,
      componentRenderCounts: new Map(),
      slowComponents: [],
    };
  }

  private initializeObservers(): void {
    // Performance observer for measuring paint and layout
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        this.renderObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'measure' || entry.entryType === 'paint') {
              this.trackComponentRender('browser-paint', entry.duration);
            }
          });
        });

        this.renderObserver.observe({
          entryTypes: ['measure', 'paint', 'navigation'],
        });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private startFrameRateMonitoring(): void {
    const measureFrame = (currentTime: number) => {
      if (!this.isProfilering) return;

      this.frameCount++;
      const frameTime = currentTime - this.lastFrameTime;

      if (frameTime > 0) {
        this.metrics.frameTime = frameTime;

        // Calculate FPS over last second
        if (this.frameCount % 60 === 0) {
          const totalTime = currentTime - this.startTime;
          this.metrics.fps = (this.frameCount / totalTime) * 1000;

          // Check for dropped frames
          const expectedFrames = Math.floor(totalTime / 16.67); // 60fps
          this.metrics.droppedFrames = Math.max(0, expectedFrames - this.frameCount);

          if (this.metrics.fps < this.thresholds.minFPS) {
            this.addAlert({
              type: 'warning',
              category: 'render',
              message: 'Low frame rate detected',
              value: this.metrics.fps,
              threshold: this.thresholds.minFPS,
              timestamp: Date.now(),
              suggestions: [
                'Reduce DOM manipulations',
                'Optimize expensive calculations',
                'Consider virtualization for large lists',
              ],
            });
          }
        }
      }

      this.lastFrameTime = currentTime;
      this.frameId = requestAnimationFrame(measureFrame);
    };

    this.frameId = requestAnimationFrame(measureFrame);
  }

  private startMemoryMonitoring(): void {
    const monitorMemory = () => {
      if (!this.isProfilering) return;

      const currentMemory = this.getCurrentMemoryUsage();
      const previousMemory = this.metrics.memoryUsage;

      this.metrics.memoryUsage = currentMemory;
      this.metrics.memoryPeak = Math.max(this.metrics.memoryPeak, currentMemory);

      if (previousMemory > 0) {
        const timeDelta = 5000; // 5 seconds
        const memoryDelta = currentMemory - previousMemory;
        this.metrics.memoryGrowthRate = (memoryDelta / timeDelta) * 60000; // MB per minute

        if (memoryDelta > this.thresholds.maxMemoryGrowth) {
          this.addAlert({
            type: 'critical',
            category: 'memory',
            message: 'High memory growth detected',
            value: memoryDelta / 1024 / 1024,
            threshold: this.thresholds.maxMemoryGrowth / 1024 / 1024,
            timestamp: Date.now(),
            suggestions: [
              'Check for memory leaks',
              'Review component cleanup',
              'Monitor large data structures',
            ],
          });
        }
      }

      setTimeout(monitorMemory, 5000); // Check every 5 seconds
    };

    setTimeout(monitorMemory, 5000);
  }

  private getCurrentMemoryUsage(): number {
    if (typeof (performance as any).memory !== 'undefined') {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private updateCurrentMetrics(): void {
    // Update bundle size if available
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      // Would need to implement bundle size tracking
    }

    // Update cache hit rate
    if (typeof caches !== 'undefined') {
      // Would need to implement cache monitoring
    }
  }

  private updateSlowComponents(): void {
    const slowComponents: Array<{ name: string; averageTime: number }> = [];

    this.componentTimings.forEach((times, componentName) => {
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (averageTime > this.thresholds.maxComponentRenderTime) {
        slowComponents.push({ name: componentName, averageTime });
      }
    });

    slowComponents.sort((a, b) => b.averageTime - a.averageTime);
    this.metrics.slowComponents = slowComponents.slice(0, 10); // Top 10
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Log critical alerts
    if (alert.type === 'critical') {
      console.error('🚨 Performance Alert:', alert.message, alert);
    } else {
      console.warn('⚠️ Performance Warning:', alert.message, alert);
    }
  }

  private calculateOverallHealth(): number {
    let score = 100;

    // Deduct for poor render performance
    if (this.metrics.averageRenderTime > this.thresholds.maxRenderTime) {
      score -= 20;
    }

    // Deduct for low FPS
    if (this.metrics.fps < this.thresholds.minFPS) {
      score -= 15;
    }

    // Deduct for high memory usage
    if (this.metrics.memoryGrowthRate > 10) {
      score -= 25;
    }

    // Deduct for alerts
    this.alerts.forEach(alert => {
      score -= alert.type === 'critical' ? 10 : 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.averageRenderTime > this.thresholds.maxRenderTime) {
      recommendations.push('Optimize component render times');
    }

    if (this.metrics.fps < this.thresholds.minFPS) {
      recommendations.push('Improve frame rate performance');
    }

    if (this.metrics.memoryGrowthRate > 5) {
      recommendations.push('Address potential memory leaks');
    }

    if (this.metrics.slowComponents.length > 0) {
      recommendations.push(`Optimize slow components: ${this.metrics.slowComponents[0].name}`);
    }

    return recommendations;
  }

  private getTopSlowComponents(): Array<{
    name: string;
    averageTime: number;
    renderCount: number;
  }> {
    return this.metrics.slowComponents.slice(0, 5).map(component => ({
      ...component,
      renderCount: this.metrics.componentRenderCounts.get(component.name) || 0,
    }));
  }

  private serializeMap(key: string, value: any): any {
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [monitor] = React.useState(() => new PerformanceMonitor());

  React.useEffect(() => {
    monitor.startProfiling();
    return () => monitor.stopProfiling();
  }, [monitor]);

  return monitor;
};

// Global performance utilities
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__PERFORMANCE_MONITOR__ = new PerformanceMonitor();
}
