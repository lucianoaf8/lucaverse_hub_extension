# Deployment Preparation - Claude Execution Prompts

## Prompt 20: Build Optimization & Performance Enhancement

**Objective:** Configure advanced build optimization including intelligent code splitting, asset preloading, lazy loading strategies, and comprehensive bundle size monitoring to ensure optimal performance across all deployment targets (web, extension, Electron).

**Execute these steps:**

1. **Configure intelligent code splitting in `vite.config.ts`:**
   - Setup manual chunk splitting for vendor libraries (React, Zustand, Framer Motion)
   - Create separate chunks for each panel component (SmartHub, AIChat, TaskManager, Productivity)
   - Configure platform-specific code splitting (web vs extension vs electron)
   - Add utility libraries to shared chunks (date-fns, lodash equivalents)
   - Implement CSS code splitting with component-specific styles
   - Setup dynamic import boundaries for optimal loading
   - Add chunk size limits and warnings for oversized bundles

2. **Implement asset preloading system in `src/utils/assetPreloader.ts`:**
   - Create `AssetPreloader` class managing critical resource loading
   - Implement preloading for essential fonts (Inter, JetBrains Mono)
   - Add critical CSS and JavaScript preloading during app initialization
   - Build component dependency analysis for smart preloading
   - Include image and icon preloading for common UI elements
   - Add platform-specific asset preloading strategies
   - Create preload priority system (critical, important, normal)
   - Include preload cache management and expiration

3. **Build lazy loading system for panels in `src/components/LazyPanelLoader.tsx`:**
   - Create lazy loading wrapper using React.lazy and Suspense
   - Implement progressive loading with skeleton placeholders
   - Add intersection observer for viewport-based panel loading
   - Build panel dependency preloading (load related panels together)
   - Include error boundaries for lazy loading failures
   - Add loading state management and user feedback
   - Create lazy loading performance monitoring
   - Implement fallback strategies for slow connections

4. **Setup advanced bundle analysis in `scripts/bundleAnalyzer.js`:**
   - Install bundle analyzer: `npm install -D rollup-plugin-visualizer webpack-bundle-analyzer`
   - Create comprehensive bundle size reporting
   - Add dependency tree analysis and duplicate detection
   - Implement bundle size regression testing
   - Create platform-specific bundle analysis (extension limits, Electron optimization)
   - Add automated bundle size alerts for CI/CD
   - Include bundle composition analysis (vendor vs app code ratios)
   - Build bundle optimization recommendations system

5. **Implement resource optimization in `src/utils/resourceOptimizer.ts`:**
   - Create image optimization and format selection (WebP, AVIF fallbacks)
   - Add font subsetting and loading optimization
   - Implement CSS optimization and unused style removal
   - Build JavaScript minification and dead code elimination
   - Add service worker caching strategies for static assets
   - Create resource compression and encoding optimization
   - Include CDN integration and asset distribution
   - Add resource loading priority and scheduling

6. **Configure performance budgets in `performance.config.js`:**
   - Set bundle size limits per platform (extension: 5MB, web: 3MB, electron: 10MB)
   - Define loading performance targets (LCP < 2.5s, FID < 100ms)
   - Add memory usage limits and monitoring
   - Configure network performance budgets for different connection types
   - Set CPU usage targets for smooth interactions
   - Include accessibility performance requirements
   - Add performance regression prevention rules

7. **Build tree shaking optimization in `src/utils/treeshaking.ts`:**
   - Configure aggressive tree shaking for utility libraries
   - Add side-effect detection and elimination
   - Implement conditional feature inclusion based on platform
   - Create module boundary analysis for better tree shaking
   - Add unused export detection and removal
   - Include dynamic import optimization
   - Build dead code elimination reporting

**Success Criteria:**
- [ ] Bundle sizes are within platform-specific limits (extension < 5MB, web < 3MB)
- [ ] Code splitting reduces initial load time by >50%
- [ ] Critical assets preload before user interaction
- [ ] Lazy loading works smoothly without jarring transitions
- [ ] Bundle analyzer shows optimized dependency structure
- [ ] Performance budgets pass for all deployment targets
- [ ] Tree shaking eliminates unused code effectively

**Validation Method:**
Create optimization validation in `scripts/validateOptimization.js`:
```javascript
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const validateBuildOptimization = () => {
  const distPath = 'dist';
  const platforms = ['web', 'extension', 'electron'];
  
  platforms.forEach(platform => {
    const platformPath = join(distPath, platform);
    
    // Check bundle sizes
    const files = readdirSync(platformPath, { recursive: true });
    const totalSize = files.reduce((total, file) => {
      const filePath = join(platformPath, file);
      if (statSync(filePath).isFile()) {
        return total + statSync(filePath).size;
      }
      return total;
    }, 0);
    
    const sizeMB = totalSize / (1024 * 1024);
    console.log(`${platform} bundle size: ${sizeMB.toFixed(2)}MB`);
    
    // Platform-specific limits
    const limits = { web: 3, extension: 5, electron: 10 };
    if (sizeMB > limits[platform]) {
      throw new Error(`${platform} bundle exceeds limit: ${sizeMB}MB > ${limits[platform]}MB`);
    }
    
    // Check code splitting
    const jsFiles = files.filter(f => f.endsWith('.js'));
    console.log(`${platform} JS chunks: ${jsFiles.length}`);
    
    // Verify critical chunks exist
    const hasCritical = jsFiles.some(f => f.includes('critical'));
    const hasVendor = jsFiles.some(f => f.includes('vendor'));
    
    if (!hasCritical || !hasVendor) {
      console.warn(`${platform} missing critical chunks`);
    }
  });
  
  console.log('Build optimization validation complete');
};
```

Validation steps:
```bash
# Build all platforms with optimization
npm run build:all

# Run bundle analysis
npm run analyze:bundle
npm run analyze:web
npm run analyze:extension

# Validate optimization
node scripts/validateOptimization.js

# Performance testing
npm run test:performance
# 1. Measure initial load times
# 2. Test lazy loading performance
# 3. Monitor memory usage during interactions
# 4. Verify preloading improves perceived performance

# Platform-specific validation
# Extension: Check Chrome extension size limits
# Web: Test on slow 3G connection simulation
# Electron: Verify app startup time < 2 seconds
```

---

## Prompt 21: Production Configuration & Monitoring

**Objective:** Configure comprehensive production environment settings including environment variables, error tracking, performance monitoring, and automated build pipelines to ensure reliable deployment and operational excellence across all platforms.

**Execute these steps:**

1. **Setup production environment variables in `.env.production`:**
   - Configure API endpoints for production services
   - Add production API keys and authentication tokens (using secure methods)
   - Set production feature flags and configuration options
   - Include platform-specific production settings
   - Add production logging levels and debugging options
   - Configure production analytics and tracking IDs
   - Include production security headers and CSP policies
   - Add production performance monitoring endpoints

2. **Configure error tracking system in `src/utils/errorTracking.ts`:**
   - Install Sentry or similar: `npm install @sentry/react @sentry/tracing`
   - Setup error tracking initialization with environment detection
   - Configure error filtering and sampling rates for production
   - Add custom error contexts (user actions, application state)
   - Implement performance transaction tracking
   - Include source map uploading for accurate error reporting
   - Add user feedback collection for error reports
   - Configure error alerting and notification systems

3. **Implement performance monitoring in `src/utils/performanceMonitor.ts`:**
   - Setup Web Vitals monitoring (LCP, FID, CLS, TTFB)
   - Add custom performance metrics (panel operations, drag/drop latency)
   - Implement user interaction tracking and timing
   - Include memory usage monitoring and leak detection
   - Add network performance monitoring (API response times)
   - Configure performance data collection and aggregation
   - Include performance regression detection and alerting
   - Add real-user monitoring (RUM) integration

4. **Build logging system in `src/utils/logger.ts`:**
   - Create structured logging with different levels (error, warn, info, debug)
   - Add contextual logging with user and session information
   - Implement log formatting for different platforms (JSON for services, readable for development)
   - Include log filtering and rate limiting to prevent spam
   - Add log aggregation and centralized logging service integration
   - Configure log retention and archival policies
   - Include security-conscious logging (no sensitive data)
   - Add log analysis and searching capabilities

5. **Setup automated build pipeline in `.github/workflows/`:**
   - Create `ci.yml` for continuous integration with comprehensive testing
   - Build `cd.yml` for continuous deployment to different environments
   - Add platform-specific build workflows (web, extension, Electron)
   - Include automated testing, linting, and security scanning
   - Configure automated dependency updates and vulnerability patching
   - Add build artifact storage and versioning
   - Include deployment health checks and rollback procedures
   - Configure build notifications and status reporting

6. **Configure production security in `src/utils/security.ts`:**
   - Implement Content Security Policy (CSP) headers for production
   - Add request/response sanitization and validation
   - Configure secure storage encryption for sensitive data
   - Include XSS and CSRF protection measures
   - Add rate limiting and DDoS protection
   - Configure secure cookie settings and session management
   - Include security header validation and enforcement
   - Add security audit logging and monitoring

7. **Build health monitoring system in `src/utils/healthMonitor.ts`:**
   - Create application health checks and status endpoints
   - Implement dependency health monitoring (APIs, storage, external services)
   - Add system resource monitoring (CPU, memory, network)
   - Include application-specific health metrics (panel operations, user interactions)
   - Configure health check alerting and escalation
   - Add health dashboard and status page integration
   - Include automated recovery and self-healing capabilities
   - Configure health monitoring for different deployment environments

8. **Setup analytics and user insights in `src/utils/analytics.ts`:**
   - Configure user behavior tracking and analytics
   - Add feature usage monitoring and adoption metrics
   - Implement performance analytics and user experience tracking
   - Include privacy-compliant data collection
   - Add custom event tracking for panel operations
   - Configure analytics data processing and reporting
   - Include A/B testing infrastructure for feature optimization
   - Add user feedback collection and analysis

**Success Criteria:**
- [ ] Environment variables are properly configured for all deployment targets
- [ ] Error tracking captures and reports all production errors accurately
- [ ] Performance monitoring provides real-time insights into application health
- [ ] Logging system provides comprehensive operational visibility
- [ ] Automated build pipeline deploys successfully to all platforms
- [ ] Security measures protect against common vulnerabilities
- [ ] Health monitoring detects and alerts on system issues
- [ ] Analytics provide actionable insights into user behavior

**Validation Method:**
Create production configuration test in `scripts/validateProduction.js`:
```javascript
import { validateEnvironment, testErrorTracking, checkSecurityHeaders } from './productionUtils.js';

const validateProductionConfig = async () => {
  console.log('Validating production configuration...');
  
  // Test environment variables
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    throw new Error(`Environment validation failed: ${envValidation.errors.join(', ')}`);
  }
  
  // Test error tracking
  try {
    await testErrorTracking();
    console.log('✓ Error tracking configured correctly');
  } catch (error) {
    console.error('✗ Error tracking configuration failed:', error);
  }
  
  // Test security headers
  const securityCheck = await checkSecurityHeaders();
  if (!securityCheck.isSecure) {
    console.warn('⚠ Security headers need improvement:', securityCheck.issues);
  }
  
  // Test performance monitoring
  const perfMonitor = await import('../src/utils/performanceMonitor.js');
  const metrics = await perfMonitor.getHealthMetrics();
  console.log('Performance monitoring status:', metrics.status);
  
  // Test logging system
  const logger = await import('../src/utils/logger.js');
  logger.info('Production validation test log entry');
  
  console.log('Production configuration validation complete');
};

// Health check endpoint test
const testHealthChecks = async () => {
  const healthEndpoints = [
    '/health',
    '/health/database',
    '/health/external-apis',
    '/health/storage'
  ];
  
  for (const endpoint of healthEndpoints) {
    try {
      const response = await fetch(`${process.env.VITE_API_BASE_URL}${endpoint}`);
      const health = await response.json();
      console.log(`${endpoint}: ${health.status}`);
    } catch (error) {
      console.error(`${endpoint}: ERROR - ${error.message}`);
    }
  }
};
```

Validation steps:
```bash
# Validate production configuration
node scripts/validateProduction.js

# Test error tracking
# 1. Trigger intentional error in production build
# 2. Verify error appears in tracking dashboard
# 3. Check error context and stack trace accuracy
# 4. Test error alerting and notification

# Test performance monitoring
npm run test:performance:production
# 1. Monitor real user metrics in production
# 2. Verify performance data collection
# 3. Check performance alerting thresholds
# 4. Test performance regression detection

# Test build pipeline
git push origin main
# 1. Verify CI/CD pipeline triggers
# 2. Check all tests pass in pipeline
# 3. Verify automated deployment works
# 4. Test rollback procedures

# Security validation
npm audit --audit-level high
npm run security:scan
# 1. Check for known vulnerabilities
# 2. Verify security headers are properly set
# 3. Test CSP policy effectiveness
# 4. Validate secure data handling

# Health monitoring validation
# 1. Check health endpoints respond correctly
# 2. Test health alerting for failures
# 3. Verify dependency monitoring works
# 4. Test automated recovery procedures

# Analytics verification
# 1. Verify user event tracking works
# 2. Check data privacy compliance
# 3. Test feature usage analytics
# 4. Validate performance analytics accuracy
```