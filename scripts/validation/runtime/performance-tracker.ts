/**
 * Performance Tracker
 * Detailed performance monitoring and analysis
 */

import { ValidationConfig, ValidationOptions } from '../core/config.js';
import { ValidationResult, ValidatorModule } from '../core/runner.js';

export interface PerformanceProfile {
  metrics: PerformanceMetrics;
  webVitals: WebVitals;
  bundleAnalysis: BundleAnalysis;
  renderingMetrics: RenderingMetrics;
  networkMetrics: NetworkMetrics;
}

export interface PerformanceMetrics {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  timeToInteractive: number;
}

export interface WebVitals {
  lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  fcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
  ttfb: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: number;
  }>;
  duplicateModules: string[];
  largeDependencies: Array<{
    name: string;
    size: number;
  }>;
}

export interface RenderingMetrics {
  componentRenderTimes: Map<string, number[]>;
  slowComponents: string[];
  rerenderCount: Map<string, number>;
  mountTimes: Map<string, number>;
  updateTimes: Map<string, number>;
}

export interface NetworkMetrics {
  resourceCount: number;
  totalTransferSize: number;
  totalDecodedSize: number;
  cacheHitRate: number;
  slowResources: Array<{
    name: string;
    duration: number;
    size: number;
  }>;
}

export class PerformanceTracker {
  private config: ValidationConfig;
  private profile: PerformanceProfile;
  private observers: PerformanceObserver[] = [];
  private isTracking = false;

  constructor(config: ValidationConfig) {
    this.config = config;
    this.profile = this.initializeProfile();
  }

  async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const startTime = Date.now();

    try {
      console.log('⚡ Running performance tracking validation...');

      // Collect current performance metrics
      const metricsResults = await this.collectPerformanceMetrics();
      results.push(...metricsResults);

      // Analyze Web Vitals
      const webVitalsResults = await this.analyzeWebVitals();
      results.push(...webVitalsResults);

      // Check bundle performance
      const bundleResults = await this.analyzeBundlePerformance();
      results.push(...bundleResults);

      // Analyze rendering performance
      const renderingResults = await this.analyzeRenderingPerformance();
      results.push(...renderingResults);

      // Check network performance
      const networkResults = await this.analyzeNetworkPerformance();
      results.push(...networkResults);

      // Generate performance recommendations
      const recommendationResults = this.generatePerformanceRecommendations();
      results.push(...recommendationResults);

      const duration = Date.now() - startTime;
      console.log(`✅ Performance tracking completed in ${duration}ms`);

      return results;
    } catch (error) {
      return [{
        id: 'performance-tracker-error',
        name: 'Performance Tracker',
        type: 'runtime',
        status: 'fail',
        message: `Performance tracking failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        severity: 'error',
      }];
    }
  }

  private initializeProfile(): PerformanceProfile {
    return {
      metrics: {
        timeToFirstByte: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        totalBlockingTime: 0,
        timeToInteractive: 0,
      },
      webVitals: {
        lcp: { value: 0, rating: 'good' },
        fid: { value: 0, rating: 'good' },
        cls: { value: 0, rating: 'good' },
        fcp: { value: 0, rating: 'good' },
        ttfb: { value: 0, rating: 'good' },
      },
      bundleAnalysis: {
        totalSize: 0,
        gzippedSize: 0,
        chunks: [],
        duplicateModules: [],
        largeDependencies: [],
      },
      renderingMetrics: {
        componentRenderTimes: new Map(),
        slowComponents: [],
        rerenderCount: new Map(),
        mountTimes: new Map(),
        updateTimes: new Map(),
      },
      networkMetrics: {
        resourceCount: 0,
        totalTransferSize: 0,
        totalDecodedSize: 0,
        cacheHitRate: 0,
        slowResources: [],
      },
    };
  }

  private async collectPerformanceMetrics(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      if (typeof window === 'undefined') {
        // Node.js environment - limited metrics
        results.push({
          id: 'performance-node-env',
          name: 'Performance Metrics - Node Environment',
          type: 'runtime',
          status: 'skip',
          message: 'Performance metrics collection skipped in Node.js environment',
          duration: 0,
          severity: 'info',
        });
        return results;
      }

      // Browser environment - collect full metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Calculate metrics
        this.profile.metrics.timeToFirstByte = navigation.responseStart - navigation.requestStart;
        this.profile.metrics.firstContentfulPaint = this.getMetricValue('first-contentful-paint');
        this.profile.metrics.largestContentfulPaint = this.getMetricValue('largest-contentful-paint');
        this.profile.metrics.timeToInteractive = navigation.domInteractive - navigation.navigationStart;

        // Validate metrics against thresholds
        const maxRenderTime = this.config.runtime.performance.maxRenderTime;
        
        if (this.profile.metrics.firstContentfulPaint > 1800) {
          results.push({
            id: 'slow-fcp',
            name: 'Slow First Contentful Paint',
            type: 'runtime',
            status: 'warning',
            message: `FCP: ${this.profile.metrics.firstContentfulPaint}ms (> 1800ms)`,
            duration: 0,
            severity: 'warning',
            suggestion: 'Optimize critical rendering path and reduce blocking resources',
          });
        } else {
          results.push({
            id: 'good-fcp',
            name: 'Good First Contentful Paint',
            type: 'runtime',
            status: 'pass',
            message: `FCP: ${this.profile.metrics.firstContentfulPaint}ms`,
            duration: 0,
            severity: 'info',
          });
        }

        if (this.profile.metrics.largestContentfulPaint > 2500) {
          results.push({
            id: 'slow-lcp',
            name: 'Slow Largest Contentful Paint',
            type: 'runtime',
            status: 'fail',
            message: `LCP: ${this.profile.metrics.largestContentfulPaint}ms (> 2500ms)`,
            duration: 0,
            severity: 'error',
            suggestion: 'Optimize largest content element loading and reduce server response times',
          });
        }

        if (this.profile.metrics.timeToFirstByte > 600) {
          results.push({
            id: 'slow-ttfb',
            name: 'Slow Time to First Byte',
            type: 'runtime',
            status: 'warning',
            message: `TTFB: ${this.profile.metrics.timeToFirstByte}ms (> 600ms)`,
            duration: 0,
            severity: 'warning',
            suggestion: 'Optimize server response times and consider CDN',
          });
        }
      }
    } catch (error) {
      results.push({
        id: 'performance-metrics-error',
        name: 'Performance Metrics Error',
        type: 'runtime',
        status: 'fail',
        message: `Failed to collect performance metrics: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private getMetricValue(metricName: string): number {
    if (typeof window === 'undefined') return 0;
    
    const entries = performance.getEntriesByName(metricName);
    return entries.length > 0 ? entries[entries.length - 1].startTime : 0;
  }

  private async analyzeWebVitals(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Calculate Web Vitals ratings
      this.profile.webVitals.lcp = this.rateMetric(this.profile.metrics.largestContentfulPaint, [2500, 4000]);
      this.profile.webVitals.fcp = this.rateMetric(this.profile.metrics.firstContentfulPaint, [1800, 3000]);
      this.profile.webVitals.ttfb = this.rateMetric(this.profile.metrics.timeToFirstByte, [600, 1200]);
      this.profile.webVitals.cls = this.rateMetric(this.profile.metrics.cumulativeLayoutShift, [0.1, 0.25]);
      this.profile.webVitals.fid = this.rateMetric(this.profile.metrics.firstInputDelay, [100, 300]);

      // Generate results for each vital
      const vitals = [
        { name: 'LCP', data: this.profile.webVitals.lcp, description: 'Largest Contentful Paint' },
        { name: 'FCP', data: this.profile.webVitals.fcp, description: 'First Contentful Paint' },
        { name: 'TTFB', data: this.profile.webVitals.ttfb, description: 'Time to First Byte' },
        { name: 'CLS', data: this.profile.webVitals.cls, description: 'Cumulative Layout Shift' },
        { name: 'FID', data: this.profile.webVitals.fid, description: 'First Input Delay' },
      ];

      for (const vital of vitals) {
        const status = vital.data.rating === 'good' ? 'pass' : 
                      vital.data.rating === 'needs-improvement' ? 'warning' : 'fail';
        const severity = vital.data.rating === 'good' ? 'info' : 
                        vital.data.rating === 'needs-improvement' ? 'warning' : 'error';

        results.push({
          id: `web-vital-${vital.name.toLowerCase()}`,
          name: `${vital.description} (${vital.name})`,
          type: 'runtime',
          status,
          message: `${vital.name}: ${vital.data.value}ms - ${vital.data.rating}`,
          duration: 0,
          severity,
          suggestion: this.getWebVitalSuggestion(vital.name, vital.data.rating),
        });
      }

      // Overall Web Vitals score
      const goodVitals = vitals.filter(v => v.data.rating === 'good').length;
      const vitalScore = (goodVitals / vitals.length) * 100;

      results.push({
        id: 'web-vitals-score',
        name: 'Web Vitals Score',
        type: 'runtime',
        status: vitalScore >= 75 ? 'pass' : vitalScore >= 50 ? 'warning' : 'fail',
        message: `Web Vitals Score: ${vitalScore.toFixed(0)}% (${goodVitals}/${vitals.length} metrics good)`,
        duration: 0,
        severity: vitalScore >= 75 ? 'info' : vitalScore >= 50 ? 'warning' : 'error',
      });

    } catch (error) {
      results.push({
        id: 'web-vitals-error',
        name: 'Web Vitals Analysis Error',
        type: 'runtime',
        status: 'fail',
        message: `Web Vitals analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private rateMetric(value: number, thresholds: [number, number]): { value: number; rating: 'good' | 'needs-improvement' | 'poor' } {
    const [good, poor] = thresholds;
    let rating: 'good' | 'needs-improvement' | 'poor';
    
    if (value <= good) {
      rating = 'good';
    } else if (value <= poor) {
      rating = 'needs-improvement';
    } else {
      rating = 'poor';
    }

    return { value, rating };
  }

  private getWebVitalSuggestion(vital: string, rating: string): string {
    if (rating === 'good') return '';

    const suggestions: Record<string, string> = {
      'LCP': 'Optimize server response times, eliminate render-blocking resources, and optimize images',
      'FCP': 'Reduce server response times, eliminate render-blocking resources, and minimize DOM size',
      'TTFB': 'Optimize server configuration, use CDN, and reduce server processing time',
      'CLS': 'Always include size attributes on images and videos, and avoid inserting content above existing content',
      'FID': 'Reduce JavaScript execution time, break up long tasks, and optimize for interaction readiness',
    };

    return suggestions[vital] || 'Optimize performance for better user experience';
  }

  private async analyzeBundlePerformance(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Mock bundle analysis - in real implementation, integrate with webpack-bundle-analyzer
      const mockBundleData = {
        totalSize: 850 * 1024, // 850KB
        gzippedSize: 280 * 1024, // 280KB
        chunks: [
          { name: 'main', size: 450 * 1024, modules: 120 },
          { name: 'vendor', size: 300 * 1024, modules: 45 },
          { name: 'polyfills', size: 100 * 1024, modules: 12 },
        ],
        duplicateModules: ['lodash', 'moment'],
        largeDependencies: [
          { name: '@emotion/styled', size: 85 * 1024 },
          { name: 'react-dom', size: 120 * 1024 },
        ],
      };

      this.profile.bundleAnalysis = mockBundleData;

      // Check bundle size against limits
      const bundleLimit = this.config.runtime.performance.bundleSizeLimit;
      
      if (mockBundleData.totalSize > bundleLimit) {
        results.push({
          id: 'bundle-size-exceeded',
          name: 'Bundle Size Exceeded',
          type: 'runtime',
          status: 'fail',
          message: `Total bundle size ${(mockBundleData.totalSize / 1024).toFixed(2)}KB exceeds limit ${(bundleLimit / 1024).toFixed(2)}KB`,
          duration: 0,
          severity: 'error',
          suggestion: 'Consider code splitting, tree shaking, or removing unused dependencies',
        });
      } else {
        results.push({
          id: 'bundle-size-ok',
          name: 'Bundle Size OK',
          type: 'runtime',
          status: 'pass',
          message: `Bundle size ${(mockBundleData.totalSize / 1024).toFixed(2)}KB is within limit`,
          duration: 0,
          severity: 'info',
        });
      }

      // Check compression ratio
      const compressionRatio = mockBundleData.gzippedSize / mockBundleData.totalSize;
      if (compressionRatio > 0.4) {
        results.push({
          id: 'poor-compression',
          name: 'Poor Compression Ratio',
          type: 'runtime',
          status: 'warning',
          message: `Compression ratio ${(compressionRatio * 100).toFixed(1)}% could be improved`,
          duration: 0,
          severity: 'warning',
          suggestion: 'Optimize assets for better compression (remove comments, minify, use modern formats)',
        });
      }

      // Check for duplicate modules
      if (mockBundleData.duplicateModules.length > 0) {
        results.push({
          id: 'duplicate-modules',
          name: 'Duplicate Modules Detected',
          type: 'runtime',
          status: 'warning',
          message: `Found ${mockBundleData.duplicateModules.length} duplicate modules: ${mockBundleData.duplicateModules.join(', ')}`,
          duration: 0,
          severity: 'warning',
          suggestion: 'Configure webpack to deduplicate modules or use different versions',
        });
      }

      // Check for large dependencies
      for (const dep of mockBundleData.largeDependencies) {
        if (dep.size > 50 * 1024) { // 50KB threshold
          results.push({
            id: `large-dependency-${dep.name}`,
            name: 'Large Dependency',
            type: 'runtime',
            status: 'warning',
            message: `Dependency "${dep.name}" is ${(dep.size / 1024).toFixed(2)}KB`,
            duration: 0,
            severity: 'warning',
            suggestion: 'Consider alternatives or dynamic imports for large dependencies',
          });
        }
      }

    } catch (error) {
      results.push({
        id: 'bundle-analysis-error',
        name: 'Bundle Analysis Error',
        type: 'runtime',
        status: 'fail',
        message: `Bundle analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private async analyzeRenderingPerformance(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Mock rendering metrics - in real implementation, integrate with React DevTools Profiler
      const mockRenderingData = {
        componentRenderTimes: new Map([
          ['App', [8.2, 9.1, 7.8, 8.5]],
          ['Header', [2.1, 2.3, 2.0, 2.2]],
          ['ThemeSwitcher', [15.2, 16.1, 14.8, 15.5]], // Slow component
          ['AnimationExamples', [12.1, 11.8, 12.5, 12.0]],
        ]),
        slowComponents: ['ThemeSwitcher'],
        rerenderCount: new Map([
          ['App', 5],
          ['Header', 2],
          ['ThemeSwitcher', 8], // High rerender count
        ]),
        mountTimes: new Map([
          ['App', 25.5],
          ['ThemeSwitcher', 18.2],
        ]),
        updateTimes: new Map([
          ['ThemeSwitcher', 15.5],
        ]),
      };

      this.profile.renderingMetrics = mockRenderingData;

      // Analyze component render times
      const maxRenderTime = this.config.runtime.performance.maxRenderTime;
      
      for (const [component, times] of mockRenderingData.componentRenderTimes.entries()) {
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        
        if (avgTime > maxRenderTime) {
          results.push({
            id: `slow-component-${component}`,
            name: 'Slow Component Render',
            type: 'runtime',
            status: 'warning',
            message: `Component "${component}" averages ${avgTime.toFixed(2)}ms render time (> ${maxRenderTime}ms)`,
            duration: 0,
            severity: 'warning',
            suggestion: 'Optimize component with React.memo, useMemo, or useCallback',
          });
        }
      }

      // Analyze rerender counts
      for (const [component, count] of mockRenderingData.rerenderCount.entries()) {
        if (count > 5) {
          results.push({
            id: `high-rerender-${component}`,
            name: 'High Rerender Count',
            type: 'runtime',
            status: 'warning',
            message: `Component "${component}" rerendered ${count} times`,
            duration: 0,
            severity: 'warning',
            suggestion: 'Check for unnecessary state updates or prop changes',
          });
        }
      }

      // Overall rendering health
      const totalComponents = mockRenderingData.componentRenderTimes.size;
      const slowComponents = mockRenderingData.slowComponents.length;
      const healthScore = ((totalComponents - slowComponents) / totalComponents) * 100;

      results.push({
        id: 'rendering-health-score',
        name: 'Rendering Performance Score',
        type: 'runtime',
        status: healthScore >= 80 ? 'pass' : healthScore >= 60 ? 'warning' : 'fail',
        message: `Rendering health: ${healthScore.toFixed(0)}% (${totalComponents - slowComponents}/${totalComponents} components optimal)`,
        duration: 0,
        severity: healthScore >= 80 ? 'info' : healthScore >= 60 ? 'warning' : 'error',
      });

    } catch (error) {
      results.push({
        id: 'rendering-analysis-error',
        name: 'Rendering Analysis Error',
        type: 'runtime',
        status: 'fail',
        message: `Rendering analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private async analyzeNetworkPerformance(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      if (typeof window === 'undefined' || !('performance' in window)) {
        results.push({
          id: 'network-analysis-skipped',
          name: 'Network Analysis Skipped',
          type: 'runtime',
          status: 'skip',
          message: 'Network analysis not available in this environment',
          duration: 0,
          severity: 'info',
        });
        return results;
      }

      // Analyze resource loading
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      let totalTransferSize = 0;
      let totalDecodedSize = 0;
      let cacheHits = 0;
      const slowResources: Array<{ name: string; duration: number; size: number }> = [];

      for (const resource of resources) {
        const duration = resource.responseEnd - resource.requestStart;
        const transferSize = (resource as any).transferSize || 0;
        const decodedSize = (resource as any).decodedBodySize || 0;

        totalTransferSize += transferSize;
        totalDecodedSize += decodedSize;

        // Check if resource was cached
        if (duration < 5 || transferSize === 0) {
          cacheHits++;
        }

        // Identify slow resources
        if (duration > 1000) { // > 1 second
          slowResources.push({
            name: resource.name.split('/').pop() || resource.name,
            duration,
            size: transferSize,
          });
        }
      }

      const cacheHitRate = resources.length > 0 ? (cacheHits / resources.length) * 100 : 0;

      this.profile.networkMetrics = {
        resourceCount: resources.length,
        totalTransferSize,
        totalDecodedSize,
        cacheHitRate,
        slowResources,
      };

      // Generate results
      results.push({
        id: 'resource-count',
        name: 'Resource Count',
        type: 'runtime',
        status: resources.length > 100 ? 'warning' : 'pass',
        message: `Loaded ${resources.length} resources`,
        duration: 0,
        severity: resources.length > 100 ? 'warning' : 'info',
        suggestion: resources.length > 100 ? 'Consider reducing number of resources or bundling' : '',
      });

      results.push({
        id: 'cache-hit-rate',
        name: 'Cache Hit Rate',
        type: 'runtime',
        status: cacheHitRate > 60 ? 'pass' : 'warning',
        message: `Cache hit rate: ${cacheHitRate.toFixed(1)}%`,
        duration: 0,
        severity: cacheHitRate > 60 ? 'info' : 'warning',
        suggestion: cacheHitRate <= 60 ? 'Improve caching strategy for better performance' : '',
      });

      // Report slow resources
      for (const resource of slowResources) {
        results.push({
          id: `slow-resource-${resource.name}`,
          name: 'Slow Resource',
          type: 'runtime',
          status: 'warning',
          message: `Resource "${resource.name}" took ${resource.duration.toFixed(0)}ms to load`,
          duration: 0,
          severity: 'warning',
          suggestion: 'Optimize resource size or loading strategy',
        });
      }

    } catch (error) {
      results.push({
        id: 'network-analysis-error',
        name: 'Network Analysis Error',
        type: 'runtime',
        status: 'fail',
        message: `Network analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private generatePerformanceRecommendations(): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Generate recommendations based on collected data
    const recommendations = [
      {
        condition: this.profile.webVitals.lcp.rating !== 'good',
        id: 'rec-optimize-lcp',
        message: 'Optimize Largest Contentful Paint',
        suggestion: 'Preload key resources, optimize images, and improve server response times',
      },
      {
        condition: this.profile.bundleAnalysis.totalSize > this.config.runtime.performance.bundleSizeLimit,
        id: 'rec-reduce-bundle',
        message: 'Reduce bundle size',
        suggestion: 'Implement code splitting, tree shaking, and remove unused dependencies',
      },
      {
        condition: this.profile.renderingMetrics.slowComponents.length > 0,
        id: 'rec-optimize-components',
        message: 'Optimize component rendering',
        suggestion: 'Use React.memo, useMemo, and useCallback to prevent unnecessary rerenders',
      },
      {
        condition: this.profile.networkMetrics.cacheHitRate < 60,
        id: 'rec-improve-caching',
        message: 'Improve caching strategy',
        suggestion: 'Set proper cache headers and use service workers for better caching',
      },
    ];

    for (const rec of recommendations) {
      if (rec.condition) {
        results.push({
          id: rec.id,
          name: 'Performance Recommendation',
          type: 'runtime',
          status: 'warning',
          message: rec.message,
          duration: 0,
          severity: 'warning',
          suggestion: rec.suggestion,
        });
      }
    }

    return results;
  }

  getProfile(): PerformanceProfile {
    return { ...this.profile };
  }

  generatePerformanceReport(): string {
    const profile = this.profile;
    
    return `
Performance Analysis Report
==========================

Web Vitals:
- LCP: ${profile.webVitals.lcp.value}ms (${profile.webVitals.lcp.rating})
- FCP: ${profile.webVitals.fcp.value}ms (${profile.webVitals.fcp.rating})
- CLS: ${profile.webVitals.cls.value} (${profile.webVitals.cls.rating})
- FID: ${profile.webVitals.fid.value}ms (${profile.webVitals.fid.rating})
- TTFB: ${profile.webVitals.ttfb.value}ms (${profile.webVitals.ttfb.rating})

Bundle Analysis:
- Total Size: ${(profile.bundleAnalysis.totalSize / 1024).toFixed(2)}KB
- Gzipped: ${(profile.bundleAnalysis.gzippedSize / 1024).toFixed(2)}KB
- Chunks: ${profile.bundleAnalysis.chunks.length}
- Duplicate Modules: ${profile.bundleAnalysis.duplicateModules.length}

Rendering Performance:
- Components Tracked: ${profile.renderingMetrics.componentRenderTimes.size}
- Slow Components: ${profile.renderingMetrics.slowComponents.length}
- High Rerender Components: ${Array.from(profile.renderingMetrics.rerenderCount.entries()).filter(([, count]) => count > 5).length}

Network Performance:
- Resources Loaded: ${profile.networkMetrics.resourceCount}
- Total Transfer: ${(profile.networkMetrics.totalTransferSize / 1024).toFixed(2)}KB
- Cache Hit Rate: ${profile.networkMetrics.cacheHitRate.toFixed(1)}%
- Slow Resources: ${profile.networkMetrics.slowResources.length}
`;
  }
}

export async function createPerformanceTracker(): Promise<ValidatorModule> {
  return {
    name: 'performance-tracker',
    type: 'runtime',
    async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
      const tracker = new PerformanceTracker(config);
      return await tracker.validate(config, options);
    },
    canFix: false,
    dependencies: ['health-monitor'],
  };
}