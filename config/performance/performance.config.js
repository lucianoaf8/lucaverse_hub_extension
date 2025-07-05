/**
 * Performance Configuration - Performance budgets and monitoring
 * Defines performance targets and limits for different platforms and metrics
 */

// Bundle size limits per platform (in MB)
export const BUNDLE_SIZE_LIMITS = {
  extension: 5,    // Chrome extension size limit considerations
  web: 3,          // Web performance best practices
  electron: 10     // Desktop app with more flexibility
};

// Loading performance targets (in milliseconds)
export const LOADING_PERFORMANCE_TARGETS = {
  // Core Web Vitals
  largestContentfulPaint: 2500,    // LCP < 2.5s
  firstInputDelay: 100,           // FID < 100ms
  cumulativeLayoutShift: 0.1,     // CLS < 0.1
  timeToFirstByte: 800,           // TTFB < 800ms
  
  // Custom application metrics
  initialPageLoad: 3000,          // Complete page load < 3s
  panelRenderTime: 500,           // Panel rendering < 500ms
  dragDropResponseTime: 16,       // 60fps response time
  stateUpdateTime: 50,            // State updates < 50ms
  assetPreloadTime: 2000,         // Asset preloading < 2s
  
  // Platform-specific targets
  extension: {
    startupTime: 1000,            // Extension startup < 1s
    backgroundScriptIdle: true,   // Background script should be idle
    contentScriptInjection: 200   // Content script injection < 200ms
  },
  
  web: {
    timeToInteractive: 3500,      // TTI < 3.5s
    speedIndex: 3000,             // Speed Index < 3s
    firstMeaningfulPaint: 1500    // FMP < 1.5s
  },
  
  electron: {
    appLaunchTime: 2000,          // App launch < 2s
    windowOpenTime: 500,          // New window < 500ms
    menuResponseTime: 100         // Menu actions < 100ms
  }
};

// Memory usage limits (in MB)
export const MEMORY_USAGE_LIMITS = {
  // JavaScript heap limits
  heapUsed: {
    extension: 50,     // Extensions should be lightweight
    web: 100,          // Web apps can use more memory
    electron: 200      // Desktop apps have more flexibility
  },
  
  // DOM node limits
  domNodes: {
    total: 2000,       // Total DOM nodes
    depth: 20,         // Maximum nesting depth
    breadth: 100       // Maximum siblings at any level
  },
  
  // Resource limits
  imageMemory: 50,     // Images in memory
  assetCache: 30,      // Cached assets
  stateSize: 10        // Application state size
};

// Network performance budgets for different connection types
export const NETWORK_PERFORMANCE_BUDGETS = {
  // Connection types and their constraints
  slow3G: {
    downloadSpeed: 400,    // 400 Kbps
    rtt: 400,             // 400ms round trip time
    budgets: {
      totalAssets: 1.5,   // 1.5MB total
      javascript: 1.0,    // 1MB JavaScript
      css: 0.3,           // 300KB CSS
      images: 0.8,        // 800KB images
      fonts: 0.2          // 200KB fonts
    }
  },
  
  regular3G: {
    downloadSpeed: 1600,   // 1.6 Mbps
    rtt: 300,             // 300ms round trip time
    budgets: {
      totalAssets: 2.5,   // 2.5MB total
      javascript: 1.5,    // 1.5MB JavaScript
      css: 0.4,           // 400KB CSS
      images: 1.2,        // 1.2MB images
      fonts: 0.3          // 300KB fonts
    }
  },
  
  fast3G: {
    downloadSpeed: 4000,   // 4 Mbps
    rtt: 200,             // 200ms round trip time
    budgets: {
      totalAssets: 4.0,   // 4MB total
      javascript: 2.5,    // 2.5MB JavaScript
      css: 0.6,           // 600KB CSS
      images: 2.0,        // 2MB images
      fonts: 0.4          // 400KB fonts
    }
  },
  
  wifi: {
    downloadSpeed: 10000,  // 10 Mbps
    rtt: 50,              // 50ms round trip time
    budgets: {
      totalAssets: 8.0,   // 8MB total
      javascript: 4.0,    // 4MB JavaScript
      css: 1.0,           // 1MB CSS
      images: 4.0,        // 4MB images
      fonts: 0.5          // 500KB fonts
    }
  }
};

// CPU usage targets for smooth interactions
export const CPU_USAGE_TARGETS = {
  // Frame rate targets
  targetFPS: 60,              // 60 FPS for smooth animations
  maxFrameTime: 16.67,        // 16.67ms per frame (60 FPS)
  maxLongTaskTime: 50,        // Long tasks should be < 50ms
  
  // Interaction responsiveness
  clickResponseTime: 100,     // Click response < 100ms
  scrollResponseTime: 16,     // Scroll response per frame
  keyboardResponseTime: 50,   // Keyboard input response
  
  // Background processing
  maxBackgroundCpuTime: 200,  // Background tasks < 200ms
  maxIdleCpuUsage: 5,         // Idle CPU usage < 5%
  
  // Platform-specific CPU targets
  extension: {
    maxContinuousCpu: 10,     // < 10% continuous CPU
    maxBurstCpu: 30,          // < 30% burst CPU
    idleTimeout: 30000        // Idle after 30s
  },
  
  web: {
    maxMainThreadTime: 50,    // Main thread tasks < 50ms
    maxWorkerCpu: 80,         // Web Workers can use more CPU
    maxAnimationCpu: 20       // Animations < 20% CPU
  },
  
  electron: {
    maxRendererCpu: 40,       // Renderer process < 40% CPU
    maxMainCpu: 20,           // Main process < 20% CPU
    maxUtilityCpu: 15         // Utility processes < 15% CPU
  }
};

// Accessibility performance requirements
export const ACCESSIBILITY_PERFORMANCE_REQUIREMENTS = {
  // Keyboard navigation
  tabNavigationTime: 100,     // Tab navigation response < 100ms
  focusIndicatorTime: 50,     // Focus indicator appearance < 50ms
  
  // Screen reader support
  ariaUpdateTime: 200,        // ARIA updates < 200ms
  screenReaderTTS: 1000,      // Text-to-speech processing < 1s
  
  // Visual accessibility
  colorContrastRatio: 4.5,    // WCAG AA contrast ratio
  animationRespectMotion: true, // Respect prefers-reduced-motion
  
  // Motor accessibility
  clickTargetSize: 44,        // Minimum 44px click targets
  doubleClickTime: 500,       // Double-click window
  hoverDelay: 150            // Hover state delay
};

// Performance regression prevention rules
export const PERFORMANCE_REGRESSION_RULES = {
  // Bundle size regression thresholds
  bundleSizeIncrease: {
    warning: 10,              // Warn if bundle increases > 10%
    error: 25                 // Error if bundle increases > 25%
  },
  
  // Performance metric regression thresholds
  performanceRegression: {
    loadTimeIncrease: 20,     // Warn if load time increases > 20%
    memoryIncrease: 30,       // Warn if memory usage increases > 30%
    cpuIncrease: 25           // Warn if CPU usage increases > 25%
  },
  
  // Trend analysis
  trendAnalysis: {
    monitoringPeriod: 7,      // Days to monitor trends
    significantChange: 15,    // % change considered significant
    consecutiveRegressions: 3  // Alert after 3 consecutive regressions
  }
};

// Performance monitoring configuration
export const MONITORING_CONFIG = {
  // Sampling rates
  sampling: {
    production: 0.1,          // 10% sampling in production
    staging: 0.5,             // 50% sampling in staging
    development: 1.0          // 100% sampling in development
  },
  
  // Data collection intervals
  intervals: {
    realTimeMetrics: 1000,    // Collect real-time metrics every 1s
    performanceMarks: 5000,   // Performance marks every 5s
    memorySnapshots: 30000,   // Memory snapshots every 30s
    userInteractions: 0       // Collect all user interactions
  },
  
  // Alert thresholds
  alerts: {
    criticalPerformance: {
      loadTime: 5000,         // Alert if load time > 5s
      memoryUsage: 200,       // Alert if memory > 200MB
      errorRate: 5            // Alert if error rate > 5%
    },
    
    warningPerformance: {
      loadTime: 3000,         // Warn if load time > 3s
      memoryUsage: 100,       // Warn if memory > 100MB
      errorRate: 2            // Warn if error rate > 2%
    }
  },
  
  // Data retention
  retention: {
    rawMetrics: 7,            // Keep raw metrics for 7 days
    aggregatedData: 90,       // Keep aggregated data for 90 days
    trendData: 365           // Keep trend data for 1 year
  }
};

// Performance testing scenarios
export const TESTING_SCENARIOS = {
  // Load testing scenarios
  loadTesting: {
    concurrent_users: [1, 10, 50, 100],
    test_duration: 300,       // 5 minutes
    ramp_up_time: 60         // 1 minute ramp-up
  },
  
  // Stress testing scenarios
  stressTesting: {
    max_panels: 20,           // Test with 20 panels
    rapid_interactions: 100,  // 100 rapid interactions
    memory_pressure: true,    // Enable memory pressure testing
    cpu_pressure: true       // Enable CPU pressure testing
  },
  
  // Real-world scenarios
  realWorldScenarios: [
    {
      name: 'heavy_multitasking',
      description: 'User with multiple panels, frequent switching',
      panels: 8,
      interactions_per_minute: 30,
      duration: 1800          // 30 minutes
    },
    {
      name: 'light_usage',
      description: 'Occasional user with basic functionality',
      panels: 3,
      interactions_per_minute: 5,
      duration: 600           // 10 minutes
    },
    {
      name: 'power_user',
      description: 'Heavy user with maximum functionality',
      panels: 15,
      interactions_per_minute: 60,
      duration: 3600          // 1 hour
    }
  ]
};

// Export default configuration
export default {
  bundleSizeLimits: BUNDLE_SIZE_LIMITS,
  loadingTargets: LOADING_PERFORMANCE_TARGETS,
  memoryLimits: MEMORY_USAGE_LIMITS,
  networkBudgets: NETWORK_PERFORMANCE_BUDGETS,
  cpuTargets: CPU_USAGE_TARGETS,
  accessibilityRequirements: ACCESSIBILITY_PERFORMANCE_REQUIREMENTS,
  regressionRules: PERFORMANCE_REGRESSION_RULES,
  monitoring: MONITORING_CONFIG,
  testing: TESTING_SCENARIOS
};