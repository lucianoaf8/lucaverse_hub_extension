/**
 * Analytics - User behavior tracking and insights system
 * Privacy-compliant data collection with A/B testing and performance analytics
 */

export interface AnalyticsEvent {
  name: string;
  category: 'user_action' | 'performance' | 'error' | 'feature_usage' | 'conversion';
  properties?: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: number;
  platform: string;
  version: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  platform: string;
  userAgent: string;
  referrer: string;
}

export interface AnalyticsConfig {
  enableAnalytics: boolean;
  enableUserTracking: boolean;
  enablePerformanceAnalytics: boolean;
  enableConversionTracking: boolean;
  enableABTesting: boolean;
  privacyCompliant: boolean;
  samplingRate: number;
  batchSize: number;
  flushInterval: number;
  endpoints: {
    events: string;
    sessions: string;
    conversions: string;
  };
}

class Analytics {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private session: UserSession;
  private userId?: string;
  private abTestVariants: Record<string, string> = {};
  private flushTimer?: NodeJS.Timeout;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enableAnalytics: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
      enableUserTracking: true,
      enablePerformanceAnalytics: true,
      enableConversionTracking: true,
      enableABTesting: false,
      privacyCompliant: true,
      samplingRate: 1.0,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      endpoints: {
        events: `${import.meta.env.VITE_API_BASE_URL}/analytics/events`,
        sessions: `${import.meta.env.VITE_API_BASE_URL}/analytics/sessions`,
        conversions: `${import.meta.env.VITE_API_BASE_URL}/analytics/conversions`,
      },
      ...config,
    };

    this.session = this.createSession();
    this.initializeAnalytics();
  }

  /**
   * Track user event
   */
  track(
    eventName: string,
    properties: Record<string, any> = {},
    category: AnalyticsEvent['category'] = 'user_action'
  ): void {
    if (!this.shouldTrack()) return;

    const event: AnalyticsEvent = {
      name: eventName,
      category,
      properties: this.config.privacyCompliant ? this.sanitizeProperties(properties) : properties,
      userId: this.userId,
      sessionId: this.session.sessionId,
      timestamp: Date.now(),
      platform: this.detectPlatform(),
      version: import.meta.env.VITE_BUILD_VERSION || '1.0.0',
    };

    this.queueEvent(event);
    this.updateSession();
  }

  /**
   * Track page view
   */
  page(pageName: string, properties: Record<string, any> = {}): void {
    this.track(
      'page_view',
      {
        page: pageName,
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        ...properties,
      },
      'user_action'
    );

    this.session.pageViews++;
  }

  /**
   * Track user interaction
   */
  interaction(element: string, action: string, properties: Record<string, any> = {}): void {
    this.track(
      'user_interaction',
      {
        element,
        action,
        ...properties,
      },
      'user_action'
    );
  }

  /**
   * Track feature usage
   */
  feature(featureName: string, action: string, properties: Record<string, any> = {}): void {
    this.track(
      'feature_usage',
      {
        feature: featureName,
        action,
        ...properties,
      },
      'feature_usage'
    );
  }

  /**
   * Track performance metrics
   */
  performance(metric: string, value: number, properties: Record<string, any> = {}): void {
    if (!this.config.enablePerformanceAnalytics) return;

    this.track(
      'performance_metric',
      {
        metric,
        value,
        ...properties,
      },
      'performance'
    );
  }

  /**
   * Track conversion events
   */
  conversion(goal: string, value?: number, properties: Record<string, any> = {}): void {
    if (!this.config.enableConversionTracking) return;

    this.track(
      'conversion',
      {
        goal,
        value,
        ...properties,
      },
      'conversion'
    );
  }

  /**
   * Track error events
   */
  error(errorType: string, message: string, properties: Record<string, any> = {}): void {
    this.track(
      'error',
      {
        errorType,
        message,
        ...properties,
      },
      'error'
    );
  }

  /**
   * Set user identification
   */
  identify(userId: string, traits: Record<string, any> = {}): void {
    this.userId = userId;
    this.session.userId = userId;

    if (this.config.enableUserTracking) {
      this.track(
        'user_identified',
        {
          traits: this.config.privacyCompliant ? this.sanitizeProperties(traits) : traits,
        },
        'user_action'
      );
    }
  }

  /**
   * Get or set A/B test variant
   */
  abTest(testName: string, variants: string[], sticky: boolean = true): string {
    if (!this.config.enableABTesting) {
      return variants[0] || 'control';
    }

    // Check if user already has a variant for this test
    if (sticky && this.abTestVariants[testName]) {
      return this.abTestVariants[testName];
    }

    // Assign variant based on user ID or session ID
    const identifier = this.userId || this.session.sessionId;
    const hash = this.simpleHash(identifier + testName);
    const variantIndex = hash % variants.length;
    const variant = variants[variantIndex];

    // Store variant assignment
    this.abTestVariants[testName] = variant;

    // Track variant assignment
    this.track(
      'ab_test_assigned',
      {
        testName,
        variant,
        variants,
      },
      'feature_usage'
    );

    return variant;
  }

  /**
   * Start timing an operation
   */
  time(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.performance(`timing_${label}`, duration, { label });
    };
  }

  /**
   * Get analytics session data
   */
  getSession(): UserSession {
    return { ...this.session };
  }

  /**
   * Get analytics statistics
   */
  getStatistics(): {
    eventsTracked: number;
    sessionDuration: number;
    pageViews: number;
    queueSize: number;
    samplingRate: number;
  } {
    return {
      eventsTracked: this.session.events,
      sessionDuration: Date.now() - this.session.startTime,
      pageViews: this.session.pageViews,
      queueSize: this.eventQueue.length,
      samplingRate: this.config.samplingRate,
    };
  }

  /**
   * Flush events immediately
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(events);
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Reset analytics session
   */
  reset(): void {
    this.session = this.createSession();
    this.userId = undefined;
    this.abTestVariants = {};
    this.eventQueue = [];
  }

  // Private methods

  private createSession(): UserSession {
    return {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: 0,
      platform: this.detectPlatform(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    };
  }

  private shouldTrack(): boolean {
    if (!this.config.enableAnalytics) return false;

    // Sample based on configured rate
    if (Math.random() > this.config.samplingRate) return false;

    // Don't track in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_ANALYTICS_DEV) {
      return false;
    }

    return true;
  }

  private queueEvent(event: AnalyticsEvent): void {
    this.eventQueue.push(event);
    this.session.events++;

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush().catch(error => {
        console.warn('Auto-flush failed:', error);
      });
    }
  }

  private updateSession(): void {
    this.session.lastActivity = Date.now();
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['email', 'password', 'token', 'apiKey', 'phone', 'address', 'ssn'];
    const sanitized: Record<string, any> = {};

    Object.entries(properties).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeProperties(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.config.endpoints.events) return;

    const response = await fetch(this.config.endpoints.events, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(import.meta.env.VITE_API_KEY
          ? { Authorization: `Bearer ${import.meta.env.VITE_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        events,
        session: this.session,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private detectPlatform(): string {
    if (typeof window !== 'undefined') {
      if ((window as any).chrome?.runtime) return 'extension';
      if ((window as any).require) return 'electron';
    }
    return 'web';
  }

  private generateSessionId(): string {
    return `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeAnalytics(): void {
    if (!this.config.enableAnalytics) return;

    // Set up automatic flushing
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        console.warn('Scheduled flush failed:', error);
      });
    }, this.config.flushInterval);

    // Track session start
    this.track(
      'session_started',
      {
        platform: this.session.platform,
        userAgent: this.session.userAgent,
      },
      'user_action'
    );

    // Set up page visibility change tracking
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.track('page_hidden', {}, 'user_action');
          this.flush(); // Flush events when page becomes hidden
        } else {
          this.track('page_visible', {}, 'user_action');
        }
      });

      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.track(
          'session_ended',
          {
            duration: Date.now() - this.session.startTime,
            events: this.session.events,
            pageViews: this.session.pageViews,
          },
          'user_action'
        );

        // Attempt to flush events synchronously
        if (navigator.sendBeacon && this.config.endpoints.events) {
          navigator.sendBeacon(
            this.config.endpoints.events,
            JSON.stringify({
              events: this.eventQueue,
              session: this.session,
              timestamp: Date.now(),
            })
          );
        }
      });
    }

    console.log('Analytics initialized');
  }

  /**
   * Cleanup analytics
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush().catch(() => {}); // Final flush, ignore errors
  }
}

// Global analytics instance
export const globalAnalytics = new Analytics();

// Make analytics available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__ANALYTICS__ = globalAnalytics;
}

// Export convenience functions
export const analytics = {
  track: (event: string, properties?: Record<string, any>, category?: AnalyticsEvent['category']) =>
    globalAnalytics.track(event, properties, category),
  page: (pageName: string, properties?: Record<string, any>) =>
    globalAnalytics.page(pageName, properties),
  interaction: (element: string, action: string, properties?: Record<string, any>) =>
    globalAnalytics.interaction(element, action, properties),
  feature: (featureName: string, action: string, properties?: Record<string, any>) =>
    globalAnalytics.feature(featureName, action, properties),
  performance: (metric: string, value: number, properties?: Record<string, any>) =>
    globalAnalytics.performance(metric, value, properties),
  conversion: (goal: string, value?: number, properties?: Record<string, any>) =>
    globalAnalytics.conversion(goal, value, properties),
  error: (errorType: string, message: string, properties?: Record<string, any>) =>
    globalAnalytics.error(errorType, message, properties),
  identify: (userId: string, traits?: Record<string, any>) =>
    globalAnalytics.identify(userId, traits),
  abTest: (testName: string, variants: string[], sticky?: boolean) =>
    globalAnalytics.abTest(testName, variants, sticky),
  time: (label: string) => globalAnalytics.time(label),
};

export default Analytics;
