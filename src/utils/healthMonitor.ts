/**
 * Health Monitor - Application health checks and system monitoring
 * Monitors application dependencies, resources, and overall system health
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  uptime: number;
  checks: Record<string, HealthCheck>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  latency?: number;
  error?: string;
  lastCheck: number;
  metadata?: Record<string, any>;
}

export interface HealthConfig {
  enableHealthChecks: boolean;
  checkInterval: number;
  timeout: number;
  retryCount: number;
  enableAlerts: boolean;
  alertThresholds: {
    degradedCount: number;
    unhealthyCount: number;
  };
}

class HealthMonitor {
  private config: HealthConfig;
  private startTime: number;
  private healthStatus: HealthStatus;
  private checkInterval?: NodeJS.Timeout;
  private dependencies: Map<string, () => Promise<HealthCheck>> = new Map();

  constructor(config: Partial<HealthConfig> = {}) {
    this.config = {
      enableHealthChecks: true,
      checkInterval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      retryCount: 3,
      enableAlerts: true,
      alertThresholds: {
        degradedCount: 2,
        unhealthyCount: 1,
      },
      ...config,
    };

    this.startTime = Date.now();
    this.healthStatus = this.createInitialStatus();

    this.registerDefaultHealthChecks();
    this.startHealthChecks();
  }

  /**
   * Register a custom health check
   */
  registerHealthCheck(name: string, checkFunction: () => Promise<HealthCheck>): void {
    this.dependencies.set(name, checkFunction);
  }

  /**
   * Get current health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    if (this.config.enableHealthChecks) {
      await this.runAllHealthChecks();
    }
    return { ...this.healthStatus };
  }

  /**
   * Get specific health check
   */
  async getHealthCheck(name: string): Promise<HealthCheck | null> {
    const checkFunction = this.dependencies.get(name);
    if (!checkFunction) return null;

    try {
      return await this.executeHealthCheck(checkFunction);
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        message: 'Health check execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: Date.now(),
      };
    }
  }

  /**
   * Force immediate health check
   */
  async forceHealthCheck(): Promise<HealthStatus> {
    await this.runAllHealthChecks();
    return this.getHealthStatus();
  }

  /**
   * Get system uptime
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Check if system is healthy
   */
  isHealthy(): boolean {
    return this.healthStatus.status === 'healthy';
  }

  /**
   * Get health metrics for monitoring dashboard
   */
  getHealthMetrics(): {
    status: string;
    uptime: number;
    checksTotal: number;
    checksHealthy: number;
    memory: number;
    performance: any;
  } {
    return {
      status: this.healthStatus.status,
      uptime: this.getUptime(),
      checksTotal: this.healthStatus.summary.total,
      checksHealthy: this.healthStatus.summary.healthy,
      memory: this.getMemoryUsage(),
      performance: this.getPerformanceMetrics(),
    };
  }

  // Private methods

  private createInitialStatus(): HealthStatus {
    return {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: 0,
      checks: {},
      summary: {
        total: 0,
        healthy: 0,
        degraded: 0,
        unhealthy: 0,
      },
    };
  }

  private registerDefaultHealthChecks(): void {
    // Memory usage check
    this.registerHealthCheck('memory', async () => {
      const memoryUsage = this.getMemoryUsage();
      const memoryLimitMB = 100; // 100MB threshold
      const memoryUsageMB = memoryUsage / (1024 * 1024);

      let status: HealthCheck['status'] = 'healthy';
      let message = `Memory usage: ${memoryUsageMB.toFixed(2)}MB`;

      if (memoryUsageMB > memoryLimitMB * 0.9) {
        status = 'unhealthy';
        message = `High memory usage: ${memoryUsageMB.toFixed(2)}MB (>${memoryLimitMB}MB)`;
      } else if (memoryUsageMB > memoryLimitMB * 0.7) {
        status = 'degraded';
        message = `Elevated memory usage: ${memoryUsageMB.toFixed(2)}MB`;
      }

      return {
        name: 'memory',
        status,
        message,
        lastCheck: Date.now(),
        metadata: {
          usageMB: memoryUsageMB,
          limitMB: memoryLimitMB,
        },
      };
    });

    // Storage availability check
    this.registerHealthCheck('storage', async () => {
      try {
        const testKey = '__health_check_test__';
        const testValue = 'test';

        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        if (retrieved === testValue) {
          return {
            name: 'storage',
            status: 'healthy',
            message: 'Local storage is accessible',
            lastCheck: Date.now(),
          };
        } else {
          return {
            name: 'storage',
            status: 'unhealthy',
            message: 'Local storage read/write failed',
            lastCheck: Date.now(),
          };
        }
      } catch (error) {
        return {
          name: 'storage',
          status: 'unhealthy',
          message: 'Local storage is not available',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: Date.now(),
        };
      }
    });

    // API connectivity check
    this.registerHealthCheck('api', async () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      if (!apiBaseUrl) {
        return {
          name: 'api',
          status: 'degraded',
          message: 'API URL not configured',
          lastCheck: Date.now(),
        };
      }

      try {
        const startTime = performance.now();
        const response = await fetch(`${apiBaseUrl}/health`, {
          method: 'GET',
          timeout: this.config.timeout,
        } as RequestInit);
        const latency = performance.now() - startTime;

        if (response.ok) {
          let status: HealthCheck['status'] = 'healthy';
          let message = `API is responsive (${latency.toFixed(0)}ms)`;

          if (latency > 2000) {
            status = 'degraded';
            message = `API is slow (${latency.toFixed(0)}ms)`;
          }

          return {
            name: 'api',
            status,
            message,
            latency,
            lastCheck: Date.now(),
          };
        } else {
          return {
            name: 'api',
            status: 'unhealthy',
            message: `API returned ${response.status}`,
            latency,
            lastCheck: Date.now(),
          };
        }
      } catch (error) {
        return {
          name: 'api',
          status: 'unhealthy',
          message: 'API is not reachable',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastCheck: Date.now(),
        };
      }
    });

    // Performance check
    this.registerHealthCheck('performance', async () => {
      const performanceMetrics = this.getPerformanceMetrics();

      let status: HealthCheck['status'] = 'healthy';
      let message = 'Performance is good';

      // Check frame rate
      if (performanceMetrics.fps < 30) {
        status = 'degraded';
        message = `Low frame rate: ${performanceMetrics.fps}fps`;
      }

      // Check for high render times
      if (performanceMetrics.averageRenderTime > 50) {
        status = 'degraded';
        message = `Slow rendering: ${performanceMetrics.averageRenderTime}ms avg`;
      }

      return {
        name: 'performance',
        status,
        message,
        lastCheck: Date.now(),
        metadata: performanceMetrics,
      };
    });
  }

  private async runAllHealthChecks(): Promise<void> {
    const checks: Record<string, HealthCheck> = {};
    const summary = { total: 0, healthy: 0, degraded: 0, unhealthy: 0 };

    // Run all health checks in parallel
    const healthCheckPromises = Array.from(this.dependencies.entries()).map(
      async ([name, checkFunction]) => {
        try {
          const check = await this.executeHealthCheck(checkFunction);
          checks[name] = check;
          summary.total++;
          summary[check.status]++;
        } catch (error) {
          checks[name] = {
            name,
            status: 'unhealthy',
            message: 'Health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            lastCheck: Date.now(),
          };
          summary.total++;
          summary.unhealthy++;
        }
      }
    );

    await Promise.all(healthCheckPromises);

    // Determine overall status
    let overallStatus: HealthStatus['status'] = 'healthy';
    if (summary.unhealthy >= this.config.alertThresholds.unhealthyCount) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded >= this.config.alertThresholds.degradedCount) {
      overallStatus = 'degraded';
    }

    // Update health status
    this.healthStatus = {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: this.getUptime(),
      checks,
      summary,
    };

    // Trigger alerts if necessary
    if (this.config.enableAlerts && overallStatus !== 'healthy') {
      this.triggerHealthAlert(overallStatus, summary);
    }
  }

  private async executeHealthCheck(
    checkFunction: () => Promise<HealthCheck>
  ): Promise<HealthCheck> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.config.retryCount) {
      try {
        const result = await Promise.race([
          checkFunction(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), this.config.timeout)
          ),
        ]);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        attempts++;

        if (attempts < this.config.retryCount) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError;
  }

  private startHealthChecks(): void {
    if (!this.config.enableHealthChecks) return;

    this.checkInterval = setInterval(() => {
      this.runAllHealthChecks().catch(error => {
        console.error('Health check execution failed:', error);
      });
    }, this.config.checkInterval);

    // Run initial health check
    this.runAllHealthChecks().catch(error => {
      console.error('Initial health check failed:', error);
    });
  }

  private triggerHealthAlert(status: string, summary: any): void {
    console.warn(`🚨 Health Alert: System status is ${status}`, summary);

    // In production, send alerts to monitoring system
    if (typeof window !== 'undefined' && import.meta.env.VITE_ALERTS_ENDPOINT) {
      fetch(import.meta.env.VITE_ALERTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'health_alert',
          status,
          summary,
          timestamp: Date.now(),
          platform: this.detectPlatform(),
        }),
      }).catch(error => {
        console.error('Failed to send health alert:', error);
      });
    }
  }

  private getMemoryUsage(): number {
    if (typeof (performance as any).memory !== 'undefined') {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private getPerformanceMetrics(): any {
    // Get performance metrics from global performance monitor if available
    if (typeof window !== 'undefined' && (window as any).__PERFORMANCE_MONITOR__) {
      return (window as any).__PERFORMANCE_MONITOR__.getMetrics();
    }

    return {
      fps: 60,
      averageRenderTime: 10,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  private detectPlatform(): string {
    if (typeof window !== 'undefined') {
      if ((window as any).chrome?.runtime) return 'extension';
      if ((window as any).require) return 'electron';
    }
    return 'web';
  }

  /**
   * Cleanup health monitoring
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Global health monitor instance
export const globalHealthMonitor = new HealthMonitor();

// Make health monitor available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__HEALTH_MONITOR__ = globalHealthMonitor;
}

export default HealthMonitor;
