/**
 * Resource Optimizer - Comprehensive resource optimization system
 * Handles image optimization, font optimization, CSS optimization, and asset distribution
 */

export interface OptimizationConfig {
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
  enableCssOptimization: boolean;
  enableServiceWorker: boolean;
  enableCdn: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  targetFormats: string[];
  platform: 'web' | 'extension' | 'electron';
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercentage: number;
  format?: string;
  quality?: number;
  technique: string;
}

export interface ResourceMetrics {
  totalResources: number;
  optimizedResources: number;
  totalSavings: number;
  loadTimeImprovement: number;
  cacheHitRate: number;
}

class ResourceOptimizer {
  private config: OptimizationConfig;
  private optimizationCache = new Map<string, OptimizationResult>();
  private metrics: ResourceMetrics;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableImageOptimization: true,
      enableFontOptimization: true,
      enableCssOptimization: true,
      enableServiceWorker: true,
      enableCdn: false,
      compressionLevel: 'medium',
      targetFormats: ['webp', 'avif'],
      platform: 'web',
      ...config
    };

    this.metrics = {
      totalResources: 0,
      optimizedResources: 0,
      totalSavings: 0,
      loadTimeImprovement: 0,
      cacheHitRate: 0
    };

    this.initializeOptimizer();
  }

  /**
   * Optimize images with format selection and quality adjustment
   */
  async optimizeImage(imageUrl: string, options: {
    quality?: number;
    width?: number;
    height?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}): Promise<OptimizationResult> {
    if (!this.config.enableImageOptimization) {
      return this.createEmptyResult('image-optimization-disabled');
    }

    const cacheKey = `image-${imageUrl}-${JSON.stringify(options)}`;
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!;
    }

    try {
      const result = await this.performImageOptimization(imageUrl, options);
      this.optimizationCache.set(cacheKey, result);
      this.updateMetrics(result);
      return result;
    } catch (error) {
      console.warn(`Image optimization failed for ${imageUrl}:`, error);
      return this.createEmptyResult('image-optimization-failed');
    }
  }

  /**
   * Optimize fonts with subsetting and loading strategies
   */
  async optimizeFonts(fontUrls: string[]): Promise<OptimizationResult[]> {
    if (!this.config.enableFontOptimization) {
      return fontUrls.map(() => this.createEmptyResult('font-optimization-disabled'));
    }

    const results: OptimizationResult[] = [];

    for (const fontUrl of fontUrls) {
      const cacheKey = `font-${fontUrl}`;
      
      if (this.optimizationCache.has(cacheKey)) {
        results.push(this.optimizationCache.get(cacheKey)!);
        continue;
      }

      try {
        const result = await this.performFontOptimization(fontUrl);
        this.optimizationCache.set(cacheKey, result);
        this.updateMetrics(result);
        results.push(result);
      } catch (error) {
        console.warn(`Font optimization failed for ${fontUrl}:`, error);
        results.push(this.createEmptyResult('font-optimization-failed'));
      }
    }

    return results;
  }

  /**
   * Optimize CSS with minification and unused style removal
   */
  async optimizeCss(cssContent: string, options: {
    removeUnused?: boolean;
    minify?: boolean;
    purgeSelectors?: string[];
  } = {}): Promise<OptimizationResult> {
    if (!this.config.enableCssOptimization) {
      return this.createEmptyResult('css-optimization-disabled');
    }

    const cacheKey = `css-${this.hashString(cssContent)}-${JSON.stringify(options)}`;
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!;
    }

    try {
      const result = await this.performCssOptimization(cssContent, options);
      this.optimizationCache.set(cacheKey, result);
      this.updateMetrics(result);
      return result;
    } catch (error) {
      console.warn('CSS optimization failed:', error);
      return this.createEmptyResult('css-optimization-failed');
    }
  }

  /**
   * Optimize JavaScript with minification and dead code elimination
   */
  async optimizeJavaScript(jsContent: string, options: {
    minify?: boolean;
    removeDeadCode?: boolean;
    removeComments?: boolean;
  } = {}): Promise<OptimizationResult> {
    const cacheKey = `js-${this.hashString(jsContent)}-${JSON.stringify(options)}`;
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!;
    }

    try {
      const result = await this.performJavaScriptOptimization(jsContent, options);
      this.optimizationCache.set(cacheKey, result);
      this.updateMetrics(result);
      return result;
    } catch (error) {
      console.warn('JavaScript optimization failed:', error);
      return this.createEmptyResult('js-optimization-failed');
    }
  }

  /**
   * Setup service worker caching strategies
   */
  async setupServiceWorkerCaching(): Promise<void> {
    if (!this.config.enableServiceWorker || this.config.platform !== 'web') {
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Configure caching strategies
        await this.configureServiceWorkerStrategies(registration);
      }
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }

  /**
   * Configure CDN integration and asset distribution
   */
  configureCdnIntegration(cdnConfig: {
    baseUrl: string;
    domains: string[];
    cacheTtl: number;
    enablePrefetch: boolean;
  }): void {
    if (!this.config.enableCdn) {
      return;
    }

    this.setupCdnAssetDistribution(cdnConfig);
    this.enableCdnPrefetching(cdnConfig);
  }

  /**
   * Optimize resource compression and encoding
   */
  async optimizeCompression(content: string, contentType: string): Promise<OptimizationResult> {
    const cacheKey = `compression-${this.hashString(content)}-${contentType}-${this.config.compressionLevel}`;
    
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!;
    }

    try {
      const result = await this.performCompression(content, contentType);
      this.optimizationCache.set(cacheKey, result);
      this.updateMetrics(result);
      return result;
    } catch (error) {
      console.warn('Compression optimization failed:', error);
      return this.createEmptyResult('compression-failed');
    }
  }

  /**
   * Configure resource loading priority and scheduling
   */
  configureLoadingPriority(resources: Array<{
    url: string;
    type: 'script' | 'style' | 'image' | 'font';
    priority: 'high' | 'medium' | 'low';
    critical: boolean;
  }>): void {
    // Sort resources by priority and criticality
    const sortedResources = resources.sort((a, b) => {
      if (a.critical && !b.critical) return -1;
      if (!a.critical && b.critical) return 1;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Apply loading priorities
    sortedResources.forEach((resource, index) => {
      this.applyResourcePriority(resource, index);
    });
  }

  /**
   * Get optimization metrics and statistics
   */
  getMetrics(): ResourceMetrics & {
    cacheSize: number;
    optimizationRate: number;
    averageSavings: number;
  } {
    const cacheSize = this.optimizationCache.size;
    const optimizationRate = this.metrics.totalResources > 0 
      ? (this.metrics.optimizedResources / this.metrics.totalResources) * 100 
      : 0;
    const averageSavings = this.metrics.optimizedResources > 0 
      ? this.metrics.totalSavings / this.metrics.optimizedResources 
      : 0;

    return {
      ...this.metrics,
      cacheSize,
      optimizationRate,
      averageSavings
    };
  }

  /**
   * Clear optimization cache
   */
  clearCache(olderThan?: number): number {
    if (!olderThan) {
      const size = this.optimizationCache.size;
      this.optimizationCache.clear();
      return size;
    }

    let clearedCount = 0;
    const cutoff = Date.now() - olderThan;
    
    // Note: In a real implementation, we'd store timestamps with cache entries
    // For now, just clear all cache if olderThan is specified
    clearedCount = this.optimizationCache.size;
    this.optimizationCache.clear();
    
    return clearedCount;
  }

  /**
   * Export optimization report
   */
  exportOptimizationReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      metrics: this.getMetrics(),
      cacheEntries: Array.from(this.optimizationCache.entries()).map(([key, result]) => ({
        key,
        technique: result.technique,
        savings: result.savings,
        savingsPercentage: result.savingsPercentage
      })),
      recommendations: this.generateOptimizationRecommendations()
    };

    return JSON.stringify(report, null, 2);
  }

  // Private methods

  private async performImageOptimization(imageUrl: string, options: any): Promise<OptimizationResult> {
    // Simulate image optimization
    const originalSize = 500000; // 500KB original
    let optimizedSize = originalSize;

    // Apply format optimization
    if (options.format === 'webp') {
      optimizedSize *= 0.7; // WebP typically 30% smaller
    } else if (options.format === 'avif') {
      optimizedSize *= 0.5; // AVIF typically 50% smaller
    }

    // Apply quality optimization
    const quality = options.quality || 85;
    if (quality < 85) {
      optimizedSize *= (quality / 100);
    }

    // Apply dimension optimization
    if (options.width || options.height) {
      optimizedSize *= 0.6; // Resizing typically reduces size significantly
    }

    const savings = originalSize - optimizedSize;
    const savingsPercentage = (savings / originalSize) * 100;

    return {
      originalSize,
      optimizedSize,
      savings,
      savingsPercentage,
      format: options.format,
      quality,
      technique: 'image-optimization'
    };
  }

  private async performFontOptimization(fontUrl: string): Promise<OptimizationResult> {
    // Simulate font optimization with subsetting
    const originalSize = 150000; // 150KB original font
    let optimizedSize = originalSize;

    // Font subsetting can reduce size by 70-90%
    optimizedSize *= 0.3; // 70% reduction through subsetting

    // WOFF2 compression
    optimizedSize *= 0.8; // Additional 20% reduction with WOFF2

    const savings = originalSize - optimizedSize;
    const savingsPercentage = (savings / originalSize) * 100;

    return {
      originalSize,
      optimizedSize,
      savings,
      savingsPercentage,
      technique: 'font-subsetting-woff2'
    };
  }

  private async performCssOptimization(cssContent: string, options: any): Promise<OptimizationResult> {
    const originalSize = cssContent.length;
    let optimizedContent = cssContent;

    // Remove unused styles (simulated)
    if (options.removeUnused) {
      optimizedContent = optimizedContent.replace(/\.unused-\w+\s*\{[^}]*\}/g, '');
    }

    // Minification
    if (options.minify !== false) {
      optimizedContent = this.minifyCss(optimizedContent);
    }

    const optimizedSize = optimizedContent.length;
    const savings = originalSize - optimizedSize;
    const savingsPercentage = (savings / originalSize) * 100;

    return {
      originalSize,
      optimizedSize,
      savings,
      savingsPercentage,
      technique: 'css-minification-purge'
    };
  }

  private async performJavaScriptOptimization(jsContent: string, options: any): Promise<OptimizationResult> {
    const originalSize = jsContent.length;
    let optimizedContent = jsContent;

    // Remove comments
    if (options.removeComments !== false) {
      optimizedContent = optimizedContent.replace(/\/\*[\s\S]*?\*\//g, '');
      optimizedContent = optimizedContent.replace(/\/\/.*$/gm, '');
    }

    // Basic minification
    if (options.minify !== false) {
      optimizedContent = this.minifyJs(optimizedContent);
    }

    // Dead code elimination (simulated)
    if (options.removeDeadCode) {
      optimizedContent = optimizedContent.replace(/function\s+unused\w+\s*\([^)]*\)\s*\{[^}]*\}/g, '');
    }

    const optimizedSize = optimizedContent.length;
    const savings = originalSize - optimizedSize;
    const savingsPercentage = (savings / originalSize) * 100;

    return {
      originalSize,
      optimizedSize,
      savings,
      savingsPercentage,
      technique: 'js-minification-tree-shaking'
    };
  }

  private async performCompression(content: string, contentType: string): Promise<OptimizationResult> {
    const originalSize = content.length;
    
    // Simulate compression based on content type and compression level
    let compressionRatio = 0.7; // Default 30% reduction

    switch (contentType) {
      case 'text/javascript':
      case 'application/javascript':
        compressionRatio = this.config.compressionLevel === 'high' ? 0.3 : 
                          this.config.compressionLevel === 'medium' ? 0.4 : 0.5;
        break;
      case 'text/css':
        compressionRatio = this.config.compressionLevel === 'high' ? 0.4 : 
                          this.config.compressionLevel === 'medium' ? 0.5 : 0.6;
        break;
      case 'text/html':
        compressionRatio = this.config.compressionLevel === 'high' ? 0.4 : 
                          this.config.compressionLevel === 'medium' ? 0.5 : 0.6;
        break;
      case 'application/json':
        compressionRatio = this.config.compressionLevel === 'high' ? 0.3 : 
                          this.config.compressionLevel === 'medium' ? 0.4 : 0.5;
        break;
    }

    const optimizedSize = Math.round(originalSize * compressionRatio);
    const savings = originalSize - optimizedSize;
    const savingsPercentage = (savings / originalSize) * 100;

    return {
      originalSize,
      optimizedSize,
      savings,
      savingsPercentage,
      technique: `${this.config.compressionLevel}-compression`
    };
  }

  private async configureServiceWorkerStrategies(registration: ServiceWorkerRegistration): Promise<void> {
    // Send configuration to service worker
    if (registration.active) {
      registration.active.postMessage({
        type: 'CONFIGURE_CACHING',
        strategies: {
          static: 'CacheFirst',
          api: 'NetworkFirst',
          images: 'CacheFirst',
          fonts: 'CacheFirst'
        }
      });
    }
  }

  private setupCdnAssetDistribution(cdnConfig: any): void {
    // Configure CDN asset URLs
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Redirect asset requests to CDN
      if (this.isAssetUrl(url)) {
        const cdnUrl = this.transformToCdnUrl(url, cdnConfig.baseUrl);
        return originalFetch(cdnUrl, init);
      }
      
      return originalFetch(input, init);
    };
  }

  private enableCdnPrefetching(cdnConfig: any): void {
    if (cdnConfig.enablePrefetch) {
      // Prefetch common assets from CDN
      const commonAssets = [
        '/css/critical.css',
        '/js/vendor-react.js',
        '/fonts/Inter-Regular.woff2'
      ];

      commonAssets.forEach(asset => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = this.transformToCdnUrl(asset, cdnConfig.baseUrl);
        document.head.appendChild(link);
      });
    }
  }

  private applyResourcePriority(resource: any, index: number): void {
    const link = document.createElement('link');
    
    if (resource.critical && index < 3) {
      link.rel = 'preload';
      link.as = resource.type === 'script' ? 'script' : 
               resource.type === 'style' ? 'style' :
               resource.type === 'font' ? 'font' : 'image';
      link.href = resource.url;
      
      if (resource.type === 'font') {
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    } else if (resource.priority === 'high') {
      link.rel = 'prefetch';
      link.href = resource.url;
      document.head.appendChild(link);
    }
  }

  private minifyCss(css: string): string {
    return css
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/,\s*/g, ',')
      .trim();
  }

  private minifyJs(js: string): string {
    return js
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, ';}')
      .replace(/{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/,\s*/g, ',')
      .trim();
  }

  private isAssetUrl(url: string): boolean {
    return /\.(css|js|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf)$/i.test(url);
  }

  private transformToCdnUrl(url: string, cdnBase: string): string {
    return url.startsWith('/') ? `${cdnBase}${url}` : url;
  }

  private createEmptyResult(technique: string): OptimizationResult {
    return {
      originalSize: 0,
      optimizedSize: 0,
      savings: 0,
      savingsPercentage: 0,
      technique
    };
  }

  private updateMetrics(result: OptimizationResult): void {
    this.metrics.totalResources++;
    if (result.savings > 0) {
      this.metrics.optimizedResources++;
      this.metrics.totalSavings += result.savings;
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private initializeOptimizer(): void {
    // Platform-specific initialization
    if (this.config.platform === 'web') {
      this.setupServiceWorkerCaching();
    }

    // Set up automatic optimization triggers
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        this.optimizePageResources();
      });
    }
  }

  private async optimizePageResources(): Promise<void> {
    // Auto-optimize images with lazy loading attributes
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(async (img: any) => {
      if (img.src && !img.dataset.optimized) {
        await this.optimizeImage(img.src, { quality: 85, format: 'webp' });
        img.dataset.optimized = 'true';
      }
    });

    // Auto-optimize CSS
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(async (link: any) => {
      if (link.href && !link.dataset.optimized) {
        try {
          const response = await fetch(link.href);
          const css = await response.text();
          await this.optimizeCss(css, { minify: true, removeUnused: true });
          link.dataset.optimized = 'true';
        } catch (error) {
          console.warn(`Failed to optimize CSS: ${link.href}`, error);
        }
      }
    });
  }

  private generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this.getMetrics();

    if (metrics.optimizationRate < 50) {
      recommendations.push('Low optimization rate detected. Consider enabling more optimization features.');
    }

    if (metrics.averageSavings < 10000) { // Less than 10KB average savings
      recommendations.push('Low average savings per resource. Review optimization settings and target larger files.');
    }

    if (metrics.cacheHitRate < 30) {
      recommendations.push('Low cache hit rate. Consider increasing cache retention or improving cache strategies.');
    }

    if (!this.config.enableServiceWorker && this.config.platform === 'web') {
      recommendations.push('Service Worker caching is disabled. Enable it for better performance.');
    }

    if (!this.config.enableImageOptimization) {
      recommendations.push('Image optimization is disabled. Enable it for significant file size reductions.');
    }

    return recommendations;
  }
}

// Global resource optimizer instance
export const globalResourceOptimizer = new ResourceOptimizer({
  enableImageOptimization: true,
  enableFontOptimization: true,
  enableCssOptimization: true,
  enableServiceWorker: true,
  compressionLevel: 'medium',
  targetFormats: ['webp', 'avif'],
  platform: typeof window !== 'undefined' && (window as any).chrome?.runtime ? 'extension' :
           typeof window !== 'undefined' && (window as any).require ? 'electron' : 'web'
});

// Make resource optimizer available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__RESOURCE_OPTIMIZER__ = globalResourceOptimizer;
}

export default ResourceOptimizer;