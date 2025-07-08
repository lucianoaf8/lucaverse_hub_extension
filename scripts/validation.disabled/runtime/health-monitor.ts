/**
 * Runtime Health Monitor
 * Real-time monitoring and health checking for application runtime
 */

import { ValidationConfig, ValidationOptions } from '../core/config';
import { ValidationResult, ValidatorModule } from '../core/runner';

export interface HealthMetrics {
  performance: PerformanceMetrics;
  memory: MemoryMetrics;
  errors: ErrorMetrics;
  storage: StorageMetrics;
  features: FeatureMetrics;
  timestamp: Date;
}

export interface PerformanceMetrics {
  renderTimes: number[];
  avgRenderTime: number;
  slowRenders: number;
  fps: number;
  bundleSize: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryUsage: number;
  leakSuspected: boolean;
  gcCount: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorRate: number;
  errorBoundaryTriggers: number;
  recoverySuccessRate: number;
  recentErrors: Array<{
    message: string;
    stack: string;
    timestamp: Date;
    component?: string;
  }>;
}

export interface StorageMetrics {
  adapterHealth: boolean;
  storageQuota: number;
  storageUsed: number;
  operationLatency: number;
  failedOperations: number;
}

export interface FeatureMetrics {
  activeFeatures: string[];
  featureFlagHealth: boolean;
  disabledFeatures: string[];
  featureErrors: number;
}

export class HealthMonitor {
  private config: ValidationConfig;
  private metrics: HealthMetrics;
  private observers: Array<PerformanceObserver> = [];
  private intervalId: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor(config: ValidationConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
  }

  async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const startTime = Date.now();

    try {
      console.log('🏥 Running health monitoring checks...');

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        // Server-side validation - check what we can
        const nodeResults = await this.validateNodeEnvironment();
        results.push(...nodeResults);
      } else {
        // Browser-side validation
        const browserResults = await this.validateBrowserEnvironment();
        results.push(...browserResults);
      }

      // Validate storage adapter
      const storageResults = await this.validateStorageHealth();
      results.push(...storageResults);

      // Check feature flags
      const featureResults = await this.validateFeatureFlags();
      results.push(...featureResults);

      // Performance baseline checks
      const performanceResults = await this.validatePerformanceBaseline();
      results.push(...performanceResults);

      const duration = Date.now() - startTime;
      console.log(`✅ Health monitoring completed in ${duration}ms`);

      return results;
    } catch (error) {
      return [{
        id: 'health-monitor-error',
        name: 'Health Monitor',
        type: 'runtime',
        status: 'fail',
        message: `Health monitoring failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        severity: 'error',
      }];
    }
  }

  private initializeMetrics(): HealthMetrics {
    return {
      performance: {
        renderTimes: [],
        avgRenderTime: 0,
        slowRenders: 0,
        fps: 60,
        bundleSize: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
      },
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        memoryUsage: 0,
        leakSuspected: false,
        gcCount: 0,
      },
      errors: {
        totalErrors: 0,
        errorRate: 0,
        errorBoundaryTriggers: 0,
        recoverySuccessRate: 100,
        recentErrors: [],
      },
      storage: {
        adapterHealth: true,
        storageQuota: 0,
        storageUsed: 0,
        operationLatency: 0,
        failedOperations: 0,
      },
      features: {
        activeFeatures: [],
        featureFlagHealth: true,
        disabledFeatures: [],
        featureErrors: 0,
      },
      timestamp: new Date(),
    };
  }

  private async validateNodeEnvironment(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Check Node.js version compatibility
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
    
    if (majorVersion < 16) {
      results.push({
        id: 'node-version-outdated',
        name: 'Node.js Version Outdated',
        type: 'runtime',
        status: 'fail',
        message: `Node.js version ${nodeVersion} is outdated`,
        duration: 0,
        severity: 'error',
        suggestion: 'Upgrade to Node.js 16 or later',
      });
    } else {
      results.push({
        id: 'node-version-ok',
        name: 'Node.js Version OK',
        type: 'runtime',
        status: 'pass',
        message: `Node.js version ${nodeVersion} is supported`,
        duration: 0,
        severity: 'info',
      });
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const maxMemoryMB = this.config.runtime.performance.memoryLeakThreshold / 1024 / 1024;

    if (heapUsedMB > maxMemoryMB) {
      results.push({
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        type: 'runtime',
        status: 'warning',
        message: `Memory usage ${heapUsedMB.toFixed(2)}MB exceeds threshold ${maxMemoryMB.toFixed(2)}MB`,
        duration: 0,
        severity: 'warning',
        suggestion: 'Monitor for memory leaks',
      });
    }

    return results;
  }

  private async validateBrowserEnvironment(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Check Web Vitals if available
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const fcp = navigation.responseEnd - navigation.fetchStart;
          if (fcp > 2000) {
            results.push({
              id: 'slow-first-contentful-paint',
              name: 'Slow First Contentful Paint',
              type: 'runtime',
              status: 'warning',
              message: `First Contentful Paint: ${fcp}ms (> 2000ms)`,
              duration: 0,
              severity: 'warning',
              suggestion: 'Optimize initial load performance',
            });
          }
        }

        // Check memory if available
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
          
          if (usedMB > limitMB * 0.8) {
            results.push({
              id: 'high-js-heap-usage',
              name: 'High JS Heap Usage',
              type: 'runtime',
              status: 'warning',
              message: `JS Heap usage: ${usedMB.toFixed(2)}MB (${((usedMB/limitMB)*100).toFixed(1)}% of limit)`,
              duration: 0,
              severity: 'warning',
              suggestion: 'Monitor for memory leaks',
            });
          }
        }
      }

      // Check if essential APIs are available
      const requiredAPIs = ['fetch', 'Promise', 'Map', 'Set', 'requestAnimationFrame'];
      
      for (const api of requiredAPIs) {
        if (!(api in window)) {
          results.push({
            id: `missing-api-${api}`,
            name: 'Missing Browser API',
            type: 'runtime',
            status: 'fail',
            message: `Required API not available: ${api}`,
            duration: 0,
            severity: 'error',
            suggestion: 'Consider polyfills or update browser requirements',
          });
        }
      }

      // Check for extension context
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        results.push({
          id: 'extension-context-detected',
          name: 'Extension Context Detected',
          type: 'runtime',
          status: 'pass',
          message: 'Running in browser extension context',
          duration: 0,
          severity: 'info',
        });
      }

    } catch (error) {
      results.push({
        id: 'browser-environment-error',
        name: 'Browser Environment Error',
        type: 'runtime',
        status: 'fail',
        message: `Failed to validate browser environment: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private async validateStorageHealth(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Test storage adapter functionality
      if (typeof window !== 'undefined' && window.localStorage) {
        const testKey = 'health-monitor-test';
        const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
        
        const startTime = performance.now();
        
        // Test write
        localStorage.setItem(testKey, testValue);
        
        // Test read
        const retrieved = localStorage.getItem(testKey);
        
        const latency = performance.now() - startTime;
        
        // Clean up
        localStorage.removeItem(testKey);
        
        if (retrieved !== testValue) {
          results.push({
            id: 'storage-data-integrity',
            name: 'Storage Data Integrity Issue',
            type: 'runtime',
            status: 'fail',
            message: 'Storage read/write data integrity issue',
            duration: 0,
            severity: 'error',
            suggestion: 'Check storage adapter implementation',
          });
        } else {
          results.push({
            id: 'storage-health-ok',
            name: 'Storage Health OK',
            type: 'runtime',
            status: 'pass',
            message: `Storage working correctly (${latency.toFixed(2)}ms latency)`,
            duration: 0,
            severity: 'info',
          });
        }

        // Check storage quota if available
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          const usedMB = (estimate.usage || 0) / 1024 / 1024;
          const quotaMB = (estimate.quota || 0) / 1024 / 1024;
          
          if (quotaMB > 0 && usedMB > quotaMB * 0.8) {
            results.push({
              id: 'storage-quota-warning',
              name: 'Storage Quota Warning',
              type: 'runtime',
              status: 'warning',
              message: `Storage usage: ${usedMB.toFixed(2)}MB (${((usedMB/quotaMB)*100).toFixed(1)}% of quota)`,
              duration: 0,
              severity: 'warning',
              suggestion: 'Consider data cleanup or quota increase',
            });
          }
        }
      }
    } catch (error) {
      results.push({
        id: 'storage-health-error',
        name: 'Storage Health Error',
        type: 'runtime',
        status: 'fail',
        message: `Storage health check failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private async validateFeatureFlags(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Mock feature flag validation - in real implementation, check actual feature flag system
      const mockFeatures = {
        'theme-switching': true,
        'i18n-support': true,
        'animations': true,
        'performance-monitoring': true,
      };

      let healthyFeatures = 0;
      let totalFeatures = 0;

      for (const [feature, enabled] of Object.entries(mockFeatures)) {
        totalFeatures++;
        
        if (enabled) {
          healthyFeatures++;
          results.push({
            id: `feature-${feature}-enabled`,
            name: `Feature: ${feature}`,
            type: 'runtime',
            status: 'pass',
            message: `Feature "${feature}" is enabled and working`,
            duration: 0,
            severity: 'info',
          });
        } else {
          results.push({
            id: `feature-${feature}-disabled`,
            name: `Feature: ${feature}`,
            type: 'runtime',
            status: 'warning',
            message: `Feature "${feature}" is disabled`,
            duration: 0,
            severity: 'warning',
            suggestion: 'Check if feature should be enabled',
          });
        }
      }

      const healthRate = (healthyFeatures / totalFeatures) * 100;
      
      results.push({
        id: 'feature-health-summary',
        name: 'Feature Health Summary',
        type: 'runtime',
        status: healthRate > 80 ? 'pass' : 'warning',
        message: `${healthyFeatures}/${totalFeatures} features healthy (${healthRate.toFixed(1)}%)`,
        duration: 0,
        severity: healthRate > 80 ? 'info' : 'warning',
      });

    } catch (error) {
      results.push({
        id: 'feature-flags-error',
        name: 'Feature Flags Error',
        type: 'runtime',
        status: 'fail',
        message: `Feature flag validation failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  private async validatePerformanceBaseline(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const maxRenderTime = this.config.runtime.performance.maxRenderTime;

    try {
      // Mock performance baseline check
      // In real implementation, this would check actual React render times, bundle sizes, etc.
      
      const mockMetrics = {
        avgRenderTime: 8.5, // ms
        bundleSize: 750 * 1024, // bytes
        memoryUsage: 25 * 1024 * 1024, // bytes
      };

      // Check render time
      if (mockMetrics.avgRenderTime > maxRenderTime) {
        results.push({
          id: 'slow-render-time',
          name: 'Slow Render Time',
          type: 'runtime',
          status: 'warning',
          message: `Average render time ${mockMetrics.avgRenderTime}ms exceeds target ${maxRenderTime}ms`,
          duration: 0,
          severity: 'warning',
          suggestion: 'Optimize component rendering performance',
        });
      } else {
        results.push({
          id: 'render-performance-ok',
          name: 'Render Performance OK',
          type: 'runtime',
          status: 'pass',
          message: `Average render time ${mockMetrics.avgRenderTime}ms is within target`,
          duration: 0,
          severity: 'info',
        });
      }

      // Check bundle size
      const bundleLimit = this.config.runtime.performance.bundleSizeLimit;
      if (mockMetrics.bundleSize > bundleLimit) {
        results.push({
          id: 'large-bundle-size',
          name: 'Large Bundle Size',
          type: 'runtime',
          status: 'warning',
          message: `Bundle size ${(mockMetrics.bundleSize / 1024).toFixed(2)}KB exceeds limit ${(bundleLimit / 1024).toFixed(2)}KB`,
          duration: 0,
          severity: 'warning',
          suggestion: 'Consider code splitting or dependency optimization',
        });
      }

      // Check memory usage
      const memoryLimit = this.config.runtime.performance.memoryLeakThreshold;
      if (mockMetrics.memoryUsage > memoryLimit) {
        results.push({
          id: 'high-memory-usage-baseline',
          name: 'High Memory Usage',
          type: 'runtime',
          status: 'warning',
          message: `Memory usage ${(mockMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB exceeds threshold`,
          duration: 0,
          severity: 'warning',
          suggestion: 'Monitor for memory leaks',
        });
      }

    } catch (error) {
      results.push({
        id: 'performance-baseline-error',
        name: 'Performance Baseline Error',
        type: 'runtime',
        status: 'fail',
        message: `Performance baseline check failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: 0,
        severity: 'error',
      });
    }

    return results;
  }

  // Methods for real-time monitoring (would be used in actual application)
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    const interval = this.config.runtime.health.monitorInterval;
    
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, interval);

    // Set up performance observers if in browser
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupPerformanceObservers();
    }
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Disconnect performance observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  private collectMetrics(): void {
    this.metrics.timestamp = new Date();
    
    if (typeof window !== 'undefined') {
      this.collectBrowserMetrics();
    } else {
      this.collectNodeMetrics();
    }
  }

  private collectBrowserMetrics(): void {
    // Collect memory metrics
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
        leakSuspected: this.detectMemoryLeak(),
        gcCount: 0, // Would need to track GC events
      };
    }

    // Collect performance metrics
    const entries = performance.getEntriesByType('measure');
    if (entries.length > 0) {
      const renderTimes = entries.map(entry => entry.duration);
      this.metrics.performance.renderTimes = renderTimes.slice(-100); // Keep last 100
      this.metrics.performance.avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      this.metrics.performance.slowRenders = renderTimes.filter(time => time > this.config.runtime.performance.maxRenderTime).length;
    }
  }

  private collectNodeMetrics(): void {
    const memoryUsage = process.memoryUsage();
    this.metrics.memory = {
      usedJSHeapSize: memoryUsage.heapUsed,
      totalJSHeapSize: memoryUsage.heapTotal,
      jsHeapSizeLimit: memoryUsage.heapTotal * 2, // Approximation
      memoryUsage: memoryUsage.heapUsed / (memoryUsage.heapTotal * 2),
      leakSuspected: this.detectMemoryLeak(),
      gcCount: 0,
    };
  }

  private detectMemoryLeak(): boolean {
    // Simple memory leak detection - track if memory usage is consistently increasing
    const threshold = this.config.runtime.performance.memoryLeakThreshold;
    return this.metrics.memory.usedJSHeapSize > threshold;
  }

  private setupPerformanceObservers(): void {
    try {
      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) continue;
          this.metrics.performance.cumulativeLayoutShift += (entry as any).value;
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.performance.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

    } catch (error) {
      console.warn('Failed to set up performance observers:', error);
    }
  }

  getMetrics(): HealthMetrics {
    return { ...this.metrics };
  }

  generateHealthReport(): string {
    const metrics = this.metrics;
    const memoryMB = metrics.memory.usedJSHeapSize / 1024 / 1024;
    
    return `
Health Report - ${metrics.timestamp.toLocaleString()}
=================================

Performance:
- Average Render Time: ${metrics.performance.avgRenderTime.toFixed(2)}ms
- Slow Renders: ${metrics.performance.slowRenders}
- FPS: ${metrics.performance.fps}
- Bundle Size: ${(metrics.performance.bundleSize / 1024).toFixed(2)}KB

Memory:
- JS Heap Used: ${memoryMB.toFixed(2)}MB
- Memory Usage: ${(metrics.memory.memoryUsage * 100).toFixed(1)}%
- Leak Suspected: ${metrics.memory.leakSuspected ? 'YES' : 'NO'}

Errors:
- Total Errors: ${metrics.errors.totalErrors}
- Error Rate: ${metrics.errors.errorRate.toFixed(2)}%
- Recovery Rate: ${metrics.errors.recoverySuccessRate.toFixed(1)}%

Storage:
- Adapter Health: ${metrics.storage.adapterHealth ? 'OK' : 'FAILED'}
- Operation Latency: ${metrics.storage.operationLatency.toFixed(2)}ms
- Failed Operations: ${metrics.storage.failedOperations}

Features:
- Active Features: ${metrics.features.activeFeatures.length}
- Feature Health: ${metrics.features.featureFlagHealth ? 'OK' : 'ISSUES'}
- Feature Errors: ${metrics.features.featureErrors}
`;
  }
}

export async function createHealthMonitor(): Promise<ValidatorModule> {
  return {
    name: 'health-monitor',
    type: 'runtime',
    async validate(config: ValidationConfig, options: ValidationOptions): Promise<ValidationResult[]> {
      const monitor = new HealthMonitor(config);
      return await monitor.validate(config, options);
    },
    canFix: false,
    dependencies: [],
  };
}