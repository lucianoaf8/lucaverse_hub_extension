/**
 * Logger - Comprehensive logging system with structured logging
 * Provides contextual logging with user and session information for production monitoring
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId: string;
  platform: string;
  version: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata: {
    userAgent: string;
    url: string;
    component?: string;
    action?: string;
    performance?: {
      memory: number;
      timestamp: number;
    };
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  remoteEndpoint?: string;
  apiKey?: string;
  enableSensitiveDataFiltering: boolean;
  enableRateLimiting: boolean;
  rateLimitMax: number;
  rateLimitWindow: number;
  enableContextualLogging: boolean;
  enablePerformanceLogging: boolean;
}

class Logger {
  private config: LoggerConfig;
  private sessionId: string;
  private userId?: string;
  private platform: string;
  private version: string;
  private storage: LogEntry[] = [];
  private rateLimitCounts = new Map<string, { count: number; resetTime: number }>();
  private contextStack: Array<Record<string, any>> = [];

  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: this.getConfiguredLogLevel(),
      enableConsole: true,
      enableRemote: process.env.NODE_ENV === 'production',
      enableStorage: true,
      maxStorageEntries: 1000,
      remoteEndpoint: import.meta.env.VITE_API_BASE_URL
        ? `${import.meta.env.VITE_API_BASE_URL}/logs`
        : undefined,
      apiKey: import.meta.env.VITE_API_KEY,
      enableSensitiveDataFiltering: true,
      enableRateLimiting: true,
      rateLimitMax: 100,
      rateLimitWindow: 60000, // 1 minute
      enableContextualLogging: true,
      enablePerformanceLogging: true,
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.platform = this.detectPlatform();
    this.version = import.meta.env.VITE_BUILD_VERSION || '1.0.0';

    this.initializeLogger();
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    const logContext = { ...context };
    if (error) {
      logContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    this.log('error', message, logContext);
  }

  /**
   * Fatal level logging
   */
  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    const logContext = { ...context };
    if (error) {
      logContext.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    this.log('fatal', message, logContext);
  }

  /**
   * Set user context
   */
  setUser(userId: string, userContext?: Record<string, any>): void {
    this.userId = userId;
    if (userContext) {
      this.pushContext({ user: userContext });
    }
  }

  /**
   * Push context onto the stack
   */
  pushContext(context: Record<string, any>): void {
    if (this.config.enableContextualLogging) {
      this.contextStack.push(this.filterSensitiveData(context));
    }
  }

  /**
   * Pop context from the stack
   */
  popContext(): void {
    if (this.config.enableContextualLogging) {
      this.contextStack.pop();
    }
  }

  /**
   * Clear all context
   */
  clearContext(): void {
    this.contextStack = [];
  }

  /**
   * Log performance metrics
   */
  logPerformance(operation: string, duration: number, metadata?: Record<string, any>): void {
    if (this.config.enablePerformanceLogging) {
      this.info(`Performance: ${operation}`, {
        performance: {
          operation,
          duration,
          ...metadata,
        },
      });
    }
  }

  /**
   * Get stored logs
   */
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filteredLogs = this.storage;

    if (level) {
      const minPriority = this.levelPriority[level];
      filteredLogs = this.storage.filter(entry => this.levelPriority[entry.level] >= minPriority);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs;
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(
      {
        sessionId: this.sessionId,
        userId: this.userId,
        platform: this.platform,
        version: this.version,
        timestamp: new Date().toISOString(),
        logs: this.storage,
      },
      null,
      2
    );
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    this.storage = [];
  }

  /**
   * Get logging statistics
   */
  getStatistics(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    errorRate: number;
    storageUsage: number;
    rateLimitHits: number;
  } {
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    };

    this.storage.forEach(entry => {
      logsByLevel[entry.level]++;
    });

    const totalLogs = this.storage.length;
    const errorLogs = logsByLevel.error + logsByLevel.fatal;
    const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;

    const storageUsage = JSON.stringify(this.storage).length;
    const rateLimitHits = Array.from(this.rateLimitCounts.values()).reduce(
      (sum, entry) => sum + entry.count,
      0
    );

    return {
      totalLogs,
      logsByLevel,
      errorRate,
      storageUsage,
      rateLimitHits,
    };
  }

  // Private methods

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Check if level is enabled
    if (this.levelPriority[level] < this.levelPriority[this.config.level]) {
      return;
    }

    // Check rate limiting
    if (this.config.enableRateLimiting && this.isRateLimited(level, message)) {
      return;
    }

    // Create log entry
    const entry = this.createLogEntry(level, message, context);

    // Store locally
    if (this.config.enableStorage) {
      this.storeLog(entry);
    }

    // Log to console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Send to remote endpoint
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    const timestamp = new Date().toISOString();

    // Merge context stack with provided context
    const mergedContext = this.config.enableContextualLogging
      ? { ...this.getMergedContext(), ...context }
      : context;

    // Filter sensitive data
    const filteredContext = this.config.enableSensitiveDataFiltering
      ? this.filterSensitiveData(mergedContext)
      : mergedContext;

    return {
      timestamp,
      level,
      message,
      context: filteredContext,
      userId: this.userId,
      sessionId: this.sessionId,
      platform: this.platform,
      version: this.version,
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
        component: filteredContext?.component,
        action: filteredContext?.action,
        performance: this.config.enablePerformanceLogging
          ? {
              memory: this.getMemoryUsage(),
              timestamp: performance.now(),
            }
          : undefined,
      },
    };
  }

  private storeLog(entry: LogEntry): void {
    this.storage.push(entry);

    // Maintain storage limit
    if (this.storage.length > this.config.maxStorageEntries) {
      this.storage.shift();
    }
  }

  private logToConsole(entry: LogEntry): void {
    const emoji = this.getLevelEmoji(entry.level);
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    const consoleMessage = `${emoji} [${timestamp}] ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(consoleMessage, entry.context);
        break;
      case 'info':
        console.info(consoleMessage, entry.context);
        break;
      case 'warn':
        console.warn(consoleMessage, entry.context);
        break;
      case 'error':
      case 'fatal':
        console.error(consoleMessage, entry.context, entry.error);
        break;
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      const response = await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        console.warn('Failed to send log to remote endpoint:', response.statusText);
      }
    } catch (error) {
      console.warn('Error sending log to remote endpoint:', error);
    }
  }

  private isRateLimited(level: LogLevel, message: string): boolean {
    if (!this.config.enableRateLimiting) return false;

    const key = `${level}:${message.substring(0, 50)}`;
    const now = Date.now();
    const entry = this.rateLimitCounts.get(key);

    if (!entry || now > entry.resetTime) {
      this.rateLimitCounts.set(key, {
        count: 1,
        resetTime: now + this.config.rateLimitWindow,
      });
      return false;
    }

    entry.count++;

    if (entry.count > this.config.rateLimitMax) {
      return true;
    }

    return false;
  }

  private getMergedContext(): Record<string, any> {
    return this.contextStack.reduce((merged, context) => ({ ...merged, ...context }), {});
  }

  private filterSensitiveData(data: any): any {
    if (!this.config.enableSensitiveDataFiltering || !data) return data;

    const sensitiveKeys = [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'creditCard',
      'ssn',
      'email',
      'phone',
      'address',
    ];

    const filtered = JSON.parse(JSON.stringify(data));

    const filterRecursive = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map(filterRecursive);
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          result[key] = '[FILTERED]';
        } else if (typeof value === 'object') {
          result[key] = filterRecursive(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    return filterRecursive(filtered);
  }

  private getConfiguredLogLevel(): LogLevel {
    const envLevel = import.meta.env.VITE_LOGGING_LEVEL?.toLowerCase();

    if (envLevel && this.levelPriority.hasOwnProperty(envLevel)) {
      return envLevel as LogLevel;
    }

    return process.env.NODE_ENV === 'development' ? 'debug' : 'warn';
  }

  private getLevelEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      fatal: '💀',
    };
    return emojis[level];
  }

  private detectPlatform(): string {
    if (typeof window !== 'undefined') {
      if ((window as any).chrome?.runtime) return 'extension';
      if ((window as any).require) return 'electron';
    }
    return 'web';
  }

  private generateSessionId(): string {
    return `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMemoryUsage(): number {
    if (typeof (performance as any).memory !== 'undefined') {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private initializeLogger(): void {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', event => {
        this.error('Unhandled promise rejection', new Error(event.reason), {
          component: 'global',
          action: 'unhandled-rejection',
        });
      });

      // Handle global errors
      window.addEventListener('error', event => {
        this.error('Global error', new Error(event.message), {
          component: 'global',
          action: 'global-error',
          filename: event.filename,
          line: event.lineno,
          column: event.colno,
        });
      });
    }

    this.info('Logger initialized', {
      sessionId: this.sessionId,
      platform: this.platform,
      version: this.version,
      config: {
        level: this.config.level,
        enableRemote: this.config.enableRemote,
        enableStorage: this.config.enableStorage,
      },
    });
  }
}

// Global logger instance
export const globalLogger = new Logger();

// Make logger available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__LOGGER__ = globalLogger;
}

// Export convenience functions
export const log = {
  debug: (message: string, context?: Record<string, any>) => globalLogger.debug(message, context),
  info: (message: string, context?: Record<string, any>) => globalLogger.info(message, context),
  warn: (message: string, context?: Record<string, any>) => globalLogger.warn(message, context),
  error: (message: string, error?: Error, context?: Record<string, any>) =>
    globalLogger.error(message, error, context),
  fatal: (message: string, error?: Error, context?: Record<string, any>) =>
    globalLogger.fatal(message, error, context),
  performance: (operation: string, duration: number, metadata?: Record<string, any>) =>
    globalLogger.logPerformance(operation, duration, metadata),
  setUser: (userId: string, userContext?: Record<string, any>) =>
    globalLogger.setUser(userId, userContext),
  pushContext: (context: Record<string, any>) => globalLogger.pushContext(context),
  popContext: () => globalLogger.popContext(),
  clearContext: () => globalLogger.clearContext(),
};

export default Logger;
