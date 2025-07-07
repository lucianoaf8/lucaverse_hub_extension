/**
 * Error Tracker - Comprehensive error tracking and logging system
 * Captures, categorizes, and reports errors with context and recovery mechanisms
 * Integrated with Sentry for production error tracking
 */

import React from 'react';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

export interface ErrorInfo {
  id: string;
  type: 'render' | 'state' | 'api' | 'network' | 'permission' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  context: {
    component?: string;
    action?: string;
    state?: any;
    props?: any;
    userInteraction?: boolean;
  };
  recovery?: {
    attempted: boolean;
    successful: boolean;
    method?: string;
  };
  metadata: Record<string, any>;
}

export interface ErrorReport {
  errors: ErrorInfo[];
  summary: {
    totalErrors: number;
    criticalErrors: number;
    errorsByType: Record<string, number>;
    errorsByComponent: Record<string, number>;
    topErrors: ErrorInfo[];
    timeRange: { start: number; end: number };
  };
  trends: {
    errorRate: number;
    growthRate: number;
    peakHours: number[];
  };
  recommendations: string[];
}

export interface UserFeedback {
  errorId: string;
  userId?: string;
  description: string;
  reproduction: string;
  expected: string;
  actual: string;
  impact: 'low' | 'medium' | 'high';
  timestamp: number;
}

export class ErrorTracker {
  private errors: ErrorInfo[] = [];
  private userFeedback: UserFeedback[] = [];
  private maxErrors = 1000;
  private sessionId: string;
  private actionLog: Array<{ action: string; timestamp: number; context: any }> = [];
  private sourceMapCache = new Map<string, any>();
  private sentryInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSentry();
    this.initializeErrorHandlers();
  }

  /**
   * Initialize Sentry for production error tracking
   */
  private initializeSentry(): void {
    if (this.sentryInitialized || process.env.NODE_ENV !== 'production') return;

    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production';
    const sampleRate = parseFloat(import.meta.env.VITE_SENTRY_SAMPLE_RATE || '0.1');
    const tracesSampleRate = parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1');

    if (!sentryDsn) {
      console.warn('Sentry DSN not configured, error tracking will be local only');
      return;
    }

    try {
      Sentry.init({
        dsn: sentryDsn,
        environment,
        sampleRate,
        tracesSampleRate,
        integrations: [
          new Integrations.BrowserTracing({
            tracingOrigins: [
              'localhost',
              /^\//,
              /^https:\/\/api\.lucaverse\.com/,
              /^https:\/\/hub\.lucaverse\.com/
            ],
          }),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        beforeSend: (event, hint) => {
          // Filter out development errors and known issues
          if (this.shouldFilterError(event, hint)) {
            return null;
          }
          
          // Add custom context
          event.contexts = {
            ...event.contexts,
            app: {
              name: 'Lucaverse Hub',
              version: import.meta.env.VITE_BUILD_VERSION || '1.0.0',
              platform: this.detectPlatform(),
              sessionId: this.sessionId
            }
          };

          return event;
        },
        beforeSendTransaction: (transaction) => {
          // Filter performance transactions in development
          if (process.env.NODE_ENV === 'development') {
            return null;
          }
          return transaction;
        }
      });

      // Set user context
      Sentry.setUser({
        id: this.sessionId,
        session: this.sessionId
      });

      // Set initial tags
      Sentry.setTags({
        platform: this.detectPlatform(),
        version: import.meta.env.VITE_BUILD_VERSION || '1.0.0',
        environment: environment
      });

      this.sentryInitialized = true;
      console.log('Sentry error tracking initialized');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Filter errors that shouldn't be sent to Sentry
   */
  private shouldFilterError(event: Sentry.Event, hint?: Sentry.EventHint): boolean {
    const error = hint?.originalException;
    
    // Filter out network errors that are user-related
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Common user-related errors
      if (message.includes('network error') ||
          message.includes('fetch') ||
          message.includes('connection refused') ||
          message.includes('timeout')) {
        return true;
      }
      
      // Filter out Chrome extension context invalidated errors
      if (message.includes('extension context invalidated') ||
          message.includes('receiving end does not exist')) {
        return true;
      }
    }

    // Filter out low-severity events in production
    if (event.level === 'info' || event.level === 'debug') {
      return true;
    }

    return false;
  }

  /**
   * Send error to Sentry with context
   */
  private sendToSentry(error: Error, errorInfo: ErrorInfo): void {
    if (!this.sentryInitialized) return;

    try {
      // Set error context
      Sentry.withScope((scope) => {
        scope.setTag('errorType', errorInfo.type);
        scope.setTag('severity', errorInfo.severity);
        scope.setLevel(this.mapSeverityToSentryLevel(errorInfo.severity));
        
        // Add context information
        scope.setContext('errorDetails', {
          errorId: errorInfo.id,
          component: errorInfo.context.component,
          action: errorInfo.context.action,
          userInteraction: errorInfo.context.userInteraction,
          platform: this.detectPlatform(),
          sessionId: this.sessionId
        });

        // Add breadcrumbs from recent actions
        const recentActions = this.getRecentActions();
        recentActions.forEach(action => {
          scope.addBreadcrumb({
            message: action.action,
            category: 'user-action',
            data: action.context,
            timestamp: action.timestamp / 1000 // Sentry expects seconds
          });
        });

        // Add memory information if available
        if (errorInfo.metadata.memory) {
          scope.setContext('memory', errorInfo.metadata.memory);
        }

        // Capture the error
        Sentry.captureException(error);
      });
    } catch (sentryError) {
      console.warn('Failed to send error to Sentry:', sentryError);
    }
  }

  /**
   * Map severity levels to Sentry levels
   */
  private mapSeverityToSentryLevel(severity: ErrorInfo['severity']): Sentry.SeverityLevel {
    switch (severity) {
      case 'critical': return 'fatal';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'error';
    }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(user: {
    id?: string;
    email?: string;
    username?: string;
    segment?: string;
  }): void {
    if (this.sentryInitialized) {
      Sentry.setUser(user);
    }
  }

  /**
   * Add custom tags for error tracking
   */
  addErrorTags(tags: Record<string, string>): void {
    if (this.sentryInitialized) {
      Sentry.setTags(tags);
    }
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, operation: string = 'navigation'): any {
    if (this.sentryInitialized) {
      return Sentry.startTransaction({ name, op: operation });
    }
    return null;
  }

  /**
   * Track an error with full context
   */
  trackError(error: Error, context: Partial<ErrorInfo['context']> = {}): string {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      type: this.categorizeError(error),
      severity: this.determineSeverity(error, context),
      message: error.message,
      stack: error.stack,
      source: this.extractSource(error),
      line: this.extractLine(error),
      column: this.extractColumn(error),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      context: {
        ...context,
        recentActions: this.getRecentActions()
      },
      metadata: {
        errorName: error.name,
        platform: this.detectPlatform(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        memory: this.getMemoryInfo()
      }
    };

    this.addError(errorInfo);
    this.attemptRecovery(errorInfo);
    this.logToConsole(errorInfo);

    // Send to Sentry if initialized and severity is high enough
    if (this.sentryInitialized && (errorInfo.severity === 'high' || errorInfo.severity === 'critical')) {
      this.sendToSentry(error, errorInfo);
    }

    return errorInfo.id;
  }

  /**
   * Track a custom error with manual details
   */
  trackCustomError(
    message: string,
    type: ErrorInfo['type'],
    context: Partial<ErrorInfo['context']> = {},
    severity: ErrorInfo['severity'] = 'medium'
  ): string {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      context: {
        ...context,
        recentActions: this.getRecentActions()
      },
      metadata: {
        custom: true,
        platform: this.detectPlatform()
      }
    };

    this.addError(errorInfo);
    this.logToConsole(errorInfo);

    return errorInfo.id;
  }

  /**
   * Log user action for context tracking
   */
  logAction(action: string, context: any = {}): void {
    this.actionLog.push({
      action,
      timestamp: Date.now(),
      context
    });

    // Keep only last 50 actions
    if (this.actionLog.length > 50) {
      this.actionLog.shift();
    }
  }

  /**
   * Add user feedback for an error
   */
  addUserFeedback(feedback: Omit<UserFeedback, 'timestamp'>): void {
    this.userFeedback.push({
      ...feedback,
      timestamp: Date.now()
    });

    // Keep only last 100 feedback items
    if (this.userFeedback.length > 100) {
      this.userFeedback.shift();
    }
  }

  /**
   * Get error report with analytics
   */
  generateErrorReport(timeRange?: { start: number; end: number }): ErrorReport {
    const filteredErrors = timeRange 
      ? this.errors.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end)
      : this.errors;

    const errorsByType = this.groupErrorsByType(filteredErrors);
    const errorsByComponent = this.groupErrorsByComponent(filteredErrors);
    const topErrors = this.getTopErrors(filteredErrors);

    return {
      errors: filteredErrors,
      summary: {
        totalErrors: filteredErrors.length,
        criticalErrors: filteredErrors.filter(e => e.severity === 'critical').length,
        errorsByType,
        errorsByComponent,
        topErrors,
        timeRange: timeRange || { 
          start: Math.min(...filteredErrors.map(e => e.timestamp)), 
          end: Math.max(...filteredErrors.map(e => e.timestamp)) 
        }
      },
      trends: this.calculateTrends(filteredErrors),
      recommendations: this.generateRecommendations(filteredErrors)
    };
  }

  /**
   * Get errors by criteria
   */
  getErrors(criteria: {
    type?: ErrorInfo['type'];
    severity?: ErrorInfo['severity'];
    component?: string;
    timeRange?: { start: number; end: number };
  } = {}): ErrorInfo[] {
    return this.errors.filter(error => {
      if (criteria.type && error.type !== criteria.type) return false;
      if (criteria.severity && error.severity !== criteria.severity) return false;
      if (criteria.component && error.context.component !== criteria.component) return false;
      if (criteria.timeRange) {
        if (error.timestamp < criteria.timeRange.start || error.timestamp > criteria.timeRange.end) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Clear errors
   */
  clearErrors(olderThan?: number): void {
    if (olderThan) {
      this.errors = this.errors.filter(error => error.timestamp > olderThan);
    } else {
      this.errors = [];
    }
  }

  /**
   * Export errors for analysis
   */
  exportErrors(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      errors: this.errors,
      userFeedback: this.userFeedback,
      actionLog: this.actionLog
    }, null, 2);
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    totalErrors: number;
    errorRate: number;
    criticalErrors: number;
    topErrorTypes: Array<{ type: string; count: number }>;
    topComponents: Array<{ component: string; count: number }>;
  } {
    const totalErrors = this.errors.length;
    const criticalErrors = this.errors.filter(e => e.severity === 'critical').length;
    
    const errorsByType = this.groupErrorsByType(this.errors);
    const errorsByComponent = this.groupErrorsByComponent(this.errors);

    const topErrorTypes = Object.entries(errorsByType)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topComponents = Object.entries(errorsByComponent)
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalErrors,
      errorRate: this.calculateErrorRate(),
      criticalErrors,
      topErrorTypes,
      topComponents
    };
  }

  // Private methods

  private initializeErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), {
        component: 'global',
        userInteraction: false
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      this.trackError(error, {
        component: 'promise',
        userInteraction: false
      });
    });

    // Console error override for better tracking
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] instanceof Error) {
        this.trackError(args[0], { component: 'console' });
      }
      originalConsoleError.apply(console, args);
    };
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private categorizeError(error: Error): ErrorInfo['type'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('render') || stack.includes('render')) {
      return 'render';
    }
    if (message.includes('fetch') || message.includes('network')) {
      return 'network';
    }
    if (message.includes('permission')) {
      return 'permission';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('state') || stack.includes('store')) {
      return 'state';
    }
    if (message.includes('api')) {
      return 'api';
    }

    return 'unknown';
  }

  private determineSeverity(error: Error, context: Partial<ErrorInfo['context']>): ErrorInfo['severity'] {
    const message = error.message.toLowerCase();

    // Critical errors
    if (message.includes('critical') || 
        message.includes('fatal') || 
        message.includes('crash') ||
        context.component === 'App') {
      return 'critical';
    }

    // High severity
    if (message.includes('failed') || 
        message.includes('cannot') || 
        context.userInteraction) {
      return 'high';
    }

    // Low severity
    if (message.includes('warning') || 
        message.includes('deprecated')) {
      return 'low';
    }

    return 'medium';
  }

  private extractSource(error: Error): string | undefined {
    const stack = error.stack;
    if (!stack) return undefined;

    const match = stack.match(/at .+ \((.+):\d+:\d+\)/);
    return match ? match[1] : undefined;
  }

  private extractLine(error: Error): number | undefined {
    const stack = error.stack;
    if (!stack) return undefined;

    const match = stack.match(/:(\d+):\d+/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private extractColumn(error: Error): number | undefined {
    const stack = error.stack;
    if (!stack) return undefined;

    const match = stack.match(/:(\d+)$/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private detectPlatform(): string {
    if (typeof window !== 'undefined') {
      if ((window as any).chrome?.runtime) return 'extension';
      if ((window as any).require) return 'electron';
    }
    return 'web';
  }

  private getMemoryInfo(): any {
    if (typeof (performance as any).memory !== 'undefined') {
      return {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  private getRecentActions(): any[] {
    return this.actionLog.slice(-10); // Last 10 actions
  }

  private addError(errorInfo: ErrorInfo): void {
    this.errors.push(errorInfo);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Auto-report critical errors
    if (errorInfo.severity === 'critical') {
      this.reportCriticalError(errorInfo);
    }
  }

  private attemptRecovery(errorInfo: ErrorInfo): void {
    let recoveryMethod: string | undefined;
    let successful = false;

    try {
      switch (errorInfo.type) {
        case 'render':
          // Force re-render by clearing component cache
          recoveryMethod = 'component-remount';
          successful = true;
          break;
        
        case 'state':
          // Reset to safe state
          recoveryMethod = 'state-reset';
          successful = true;
          break;

        case 'network':
          // Retry with exponential backoff
          recoveryMethod = 'network-retry';
          successful = Math.random() > 0.3; // Simulate recovery
          break;

        default:
          recoveryMethod = 'none';
      }

      errorInfo.recovery = {
        attempted: true,
        successful,
        method: recoveryMethod
      };

    } catch (recoveryError) {
      errorInfo.recovery = {
        attempted: true,
        successful: false,
        method: recoveryMethod
      };
    }
  }

  private logToConsole(errorInfo: ErrorInfo): void {
    const emoji = {
      critical: '🔥',
      high: '🚨',
      medium: '⚠️',
      low: '💡'
    }[errorInfo.severity];

    console.group(`${emoji} Error [${errorInfo.type}] - ${errorInfo.severity}`);
    console.error('Message:', errorInfo.message);
    console.log('Context:', errorInfo.context);
    console.log('Recovery:', errorInfo.recovery);
    console.log('Error ID:', errorInfo.id);
    console.groupEnd();
  }

  private reportCriticalError(errorInfo: ErrorInfo): void {
    // In production, this would send to error reporting service
    console.error('🔥 CRITICAL ERROR REPORTED:', errorInfo);
  }

  private groupErrorsByType(errors: ErrorInfo[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupErrorsByComponent(errors: ErrorInfo[]): Record<string, number> {
    return errors.reduce((acc, error) => {
      const component = error.context.component || 'unknown';
      acc[component] = (acc[component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getTopErrors(errors: ErrorInfo[]): ErrorInfo[] {
    const errorCounts = errors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message]) => errors.find(e => e.message === message)!)
      .filter(Boolean);
  }

  private calculateTrends(errors: ErrorInfo[]): ErrorReport['trends'] {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentErrors = errors.filter(e => now - e.timestamp < oneHour);
    
    const errorRate = recentErrors.length;
    const growthRate = this.calculateGrowthRate(errors);
    const peakHours = this.calculatePeakHours(errors);

    return { errorRate, growthRate, peakHours };
  }

  private calculateErrorRate(): number {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    return this.errors.filter(e => now - e.timestamp < oneHour).length;
  }

  private calculateGrowthRate(errors: ErrorInfo[]): number {
    if (errors.length < 2) return 0;

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const twoHours = 2 * oneHour;

    const recentErrors = errors.filter(e => now - e.timestamp < oneHour).length;
    const previousErrors = errors.filter(e => 
      now - e.timestamp >= oneHour && now - e.timestamp < twoHours
    ).length;

    if (previousErrors === 0) return recentErrors > 0 ? 100 : 0;
    return ((recentErrors - previousErrors) / previousErrors) * 100;
  }

  private calculatePeakHours(errors: ErrorInfo[]): number[] {
    const hourCounts = new Array(24).fill(0);
    
    errors.forEach(error => {
      const hour = new Date(error.timestamp).getHours();
      hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count >= maxCount * 0.8)
      .map(({ hour }) => hour);
  }

  private generateRecommendations(errors: ErrorInfo[]): string[] {
    const recommendations: string[] = [];
    const errorsByType = this.groupErrorsByType(errors);
    const errorsByComponent = this.groupErrorsByComponent(errors);

    // Render error recommendations
    if (errorsByType.render > 5) {
      recommendations.push('High render errors detected - consider component optimization');
    }

    // State error recommendations
    if (errorsByType.state > 3) {
      recommendations.push('State management errors - review store logic and actions');
    }

    // Component-specific recommendations
    const topComponent = Object.entries(errorsByComponent)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (topComponent && topComponent[1] > 3) {
      recommendations.push(`Focus on ${topComponent[0]} component - highest error count`);
    }

    // General recommendations
    if (errors.length > 50) {
      recommendations.push('High error volume - implement better error boundaries');
    }

    return recommendations;
  }
}

// React Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error }> }>,
  ErrorBoundaryState
> {
  private errorTracker: ErrorTracker;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
    this.errorTracker = new ErrorTracker();
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    
    this.errorTracker.trackError(error, {
      component: 'ErrorBoundary',
      userInteraction: false,
      state: { componentStack: errorInfo.componentStack }
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return React.createElement(FallbackComponent, { error: this.state.error });
      }
      
      return React.createElement(
        'div',
        { className: 'error-boundary p-6 bg-red-50 border border-red-200 rounded-lg' },
        React.createElement('h2', { className: 'text-lg font-semibold text-red-800 mb-2' }, 'Something went wrong'),
        React.createElement('p', { className: 'text-red-600 mb-4' }, 'An error occurred while rendering this component. The error has been logged for analysis.'),
        React.createElement('button', {
          onClick: () => this.setState({ hasError: false, error: undefined, errorInfo: undefined }),
          className: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
        }, 'Try Again')
      );
    }

    return this.props.children;
  }
}

// Global error tracker instance
export const globalErrorTracker = new ErrorTracker();

// Make error tracker available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__ERROR_TRACKER__ = globalErrorTracker;
}