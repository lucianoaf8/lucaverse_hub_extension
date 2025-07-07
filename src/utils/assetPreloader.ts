/**
 * Asset Preloader - Smart resource preloading system
 * Manages critical resource loading with priority-based preloading
 */

export type PreloadPriority = 'critical' | 'important' | 'normal';
export type AssetType = 'font' | 'css' | 'js' | 'image' | 'icon';

export interface PreloadableAsset {
  url: string;
  type: AssetType;
  priority: PreloadPriority;
  crossorigin?: boolean;
  media?: string;
  as?: string;
  platform?: 'web' | 'extension' | 'electron' | 'all';
}

export interface PreloadResult {
  url: string;
  success: boolean;
  loadTime: number;
  cached: boolean;
  error?: string;
}

export interface PreloadConfig {
  enableCache: boolean;
  cacheExpiry: number; // milliseconds
  maxConcurrent: number;
  retryAttempts: number;
  timeout: number;
  enableAnalytics: boolean;
}

export class AssetPreloader {
  private preloadCache = new Map<string, { data: any; timestamp: number; loadTime: number }>();
  private loadingPromises = new Map<string, Promise<PreloadResult>>();
  private analytics = new Map<string, PreloadResult[]>();
  private config: PreloadConfig;
  private platform: string;

  constructor(config: Partial<PreloadConfig> = {}) {
    this.config = {
      enableCache: true,
      cacheExpiry: 30 * 60 * 1000, // 30 minutes
      maxConcurrent: 6,
      retryAttempts: 3,
      timeout: 10000, // 10 seconds
      enableAnalytics: true,
      ...config,
    };

    this.platform = this.detectPlatform();
    this.initializePreloader();
  }

  /**
   * Preload essential fonts
   */
  async preloadFonts(): Promise<PreloadResult[]> {
    const fontAssets: PreloadableAsset[] = [
      {
        url: '/fonts/Inter-Regular.woff2',
        type: 'font',
        priority: 'critical',
        crossorigin: true,
        as: 'font',
        platform: 'all',
      },
      {
        url: '/fonts/Inter-Medium.woff2',
        type: 'font',
        priority: 'critical',
        crossorigin: true,
        as: 'font',
        platform: 'all',
      },
      {
        url: '/fonts/Inter-SemiBold.woff2',
        type: 'font',
        priority: 'important',
        crossorigin: true,
        as: 'font',
        platform: 'all',
      },
      {
        url: '/fonts/JetBrainsMono-Regular.woff2',
        type: 'font',
        priority: 'important',
        crossorigin: true,
        as: 'font',
        platform: 'all',
      },
    ];

    return this.preloadAssets(fontAssets);
  }

  /**
   * Preload critical CSS and JavaScript
   */
  async preloadCriticalResources(): Promise<PreloadResult[]> {
    const criticalAssets: PreloadableAsset[] = [
      {
        url: '/css/critical.css',
        type: 'css',
        priority: 'critical',
        platform: 'all',
      },
      {
        url: '/css/components.css',
        type: 'css',
        priority: 'important',
        platform: 'all',
      },
      {
        url: '/js/vendor-react.js',
        type: 'js',
        priority: 'critical',
        platform: 'all',
      },
      {
        url: '/js/vendor-state.js',
        type: 'js',
        priority: 'critical',
        platform: 'all',
      },
    ];

    return this.preloadAssets(criticalAssets);
  }

  /**
   * Preload component dependencies based on analysis
   */
  async preloadComponentDependencies(componentName: string): Promise<PreloadResult[]> {
    const dependencies = this.analyzeComponentDependencies(componentName);
    const dependencyAssets: PreloadableAsset[] = dependencies.map(dep => ({
      url: dep.url,
      type: dep.type,
      priority: 'important',
      platform: 'all',
    }));

    return this.preloadAssets(dependencyAssets);
  }

  /**
   * Preload images and icons
   */
  async preloadImages(): Promise<PreloadResult[]> {
    const imageAssets: PreloadableAsset[] = [
      {
        url: '/icons/logo.svg',
        type: 'icon',
        priority: 'critical',
        platform: 'all',
      },
      {
        url: '/icons/panels/smarthub.svg',
        type: 'icon',
        priority: 'important',
        platform: 'all',
      },
      {
        url: '/icons/panels/aichat.svg',
        type: 'icon',
        priority: 'important',
        platform: 'all',
      },
      {
        url: '/icons/panels/taskmanager.svg',
        type: 'icon',
        priority: 'important',
        platform: 'all',
      },
      {
        url: '/icons/panels/productivity.svg',
        type: 'icon',
        priority: 'important',
        platform: 'all',
      },
      {
        url: '/images/background-patterns/grid.svg',
        type: 'image',
        priority: 'normal',
        platform: 'all',
      },
    ];

    return this.preloadAssets(imageAssets);
  }

  /**
   * Platform-specific asset preloading
   */
  async preloadPlatformAssets(): Promise<PreloadResult[]> {
    const platformAssets: PreloadableAsset[] = [];

    switch (this.platform) {
      case 'extension':
        platformAssets.push(
          {
            url: '/js/platform-extension.js',
            type: 'js',
            priority: 'critical',
            platform: 'extension',
          },
          {
            url: '/css/extension-styles.css',
            type: 'css',
            priority: 'important',
            platform: 'extension',
          }
        );
        break;

      case 'electron':
        platformAssets.push(
          {
            url: '/js/platform-electron.js',
            type: 'js',
            priority: 'critical',
            platform: 'electron',
          },
          {
            url: '/css/electron-styles.css',
            type: 'css',
            priority: 'important',
            platform: 'electron',
          }
        );
        break;

      case 'web':
        platformAssets.push(
          {
            url: '/js/platform-web.js',
            type: 'js',
            priority: 'critical',
            platform: 'web',
          },
          {
            url: '/css/web-styles.css',
            type: 'css',
            priority: 'important',
            platform: 'web',
          }
        );
        break;
    }

    return this.preloadAssets(platformAssets);
  }

  /**
   * Preload multiple assets with priority-based loading
   */
  async preloadAssets(assets: PreloadableAsset[]): Promise<PreloadResult[]> {
    // Filter assets by platform
    const filteredAssets = assets.filter(
      asset => asset.platform === 'all' || asset.platform === this.platform
    );

    // Sort by priority
    const sortedAssets = filteredAssets.sort((a, b) => {
      const priorityOrder = { critical: 0, important: 1, normal: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Group assets by priority for concurrent loading
    const criticalAssets = sortedAssets.filter(a => a.priority === 'critical');
    const importantAssets = sortedAssets.filter(a => a.priority === 'important');
    const normalAssets = sortedAssets.filter(a => a.priority === 'normal');

    const results: PreloadResult[] = [];

    // Load critical assets first
    if (criticalAssets.length > 0) {
      const criticalResults = await this.loadAssetBatch(criticalAssets);
      results.push(...criticalResults);
    }

    // Load important assets
    if (importantAssets.length > 0) {
      const importantResults = await this.loadAssetBatch(importantAssets);
      results.push(...importantResults);
    }

    // Load normal assets
    if (normalAssets.length > 0) {
      const normalResults = await this.loadAssetBatch(normalAssets);
      results.push(...normalResults);
    }

    return results;
  }

  /**
   * Initialize complete preloading during app startup
   */
  async initializePreloading(): Promise<{
    fonts: PreloadResult[];
    critical: PreloadResult[];
    images: PreloadResult[];
    platform: PreloadResult[];
  }> {
    const startTime = performance.now();

    try {
      // Start all preloading operations concurrently
      const [fonts, critical, images, platform] = await Promise.all([
        this.preloadFonts(),
        this.preloadCriticalResources(),
        this.preloadImages(),
        this.preloadPlatformAssets(),
      ]);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log(`🚀 Asset preloading completed in ${totalTime.toFixed(2)}ms`);
      console.log(`   Fonts: ${fonts.length} assets`);
      console.log(`   Critical: ${critical.length} assets`);
      console.log(`   Images: ${images.length} assets`);
      console.log(`   Platform: ${platform.length} assets`);

      return { fonts, critical, images, platform };
    } catch (error) {
      console.error('Asset preloading failed:', error);
      throw error;
    }
  }

  /**
   * Get preload cache statistics
   */
  getCacheStatistics(): {
    size: number;
    hitRate: number;
    averageLoadTime: number;
    expiredEntries: number;
  } {
    const now = Date.now();
    let totalLoadTime = 0;
    let expiredEntries = 0;

    this.preloadCache.forEach(entry => {
      totalLoadTime += entry.loadTime;
      if (now - entry.timestamp > this.config.cacheExpiry) {
        expiredEntries++;
      }
    });

    const totalRequests = Array.from(this.analytics.values()).flat().length;

    const cacheHits = Array.from(this.analytics.values())
      .flat()
      .filter(result => result.cached).length;

    return {
      size: this.preloadCache.size,
      hitRate: totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0,
      averageLoadTime: this.preloadCache.size > 0 ? totalLoadTime / this.preloadCache.size : 0,
      expiredEntries,
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): number {
    const now = Date.now();
    let clearedCount = 0;

    this.preloadCache.forEach((entry, key) => {
      if (now - entry.timestamp > this.config.cacheExpiry) {
        this.preloadCache.delete(key);
        clearedCount++;
      }
    });

    return clearedCount;
  }

  /**
   * Export preload analytics
   */
  exportAnalytics(): string {
    const analytics = Array.from(this.analytics.entries()).map(([url, results]) => ({
      url,
      totalRequests: results.length,
      successRate: (results.filter(r => r.success).length / results.length) * 100,
      averageLoadTime: results.reduce((sum, r) => sum + r.loadTime, 0) / results.length,
      cacheHitRate: (results.filter(r => r.cached).length / results.length) * 100,
    }));

    return JSON.stringify(
      {
        platform: this.platform,
        config: this.config,
        cacheStatistics: this.getCacheStatistics(),
        assetAnalytics: analytics,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }

  // Private methods

  private async loadAssetBatch(assets: PreloadableAsset[]): Promise<PreloadResult[]> {
    const chunks = this.chunkArray(assets, this.config.maxConcurrent);
    const results: PreloadResult[] = [];

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(asset => this.loadSingleAsset(asset)));
      results.push(...chunkResults);
    }

    return results;
  }

  private async loadSingleAsset(asset: PreloadableAsset): Promise<PreloadResult> {
    // Check if already loading
    if (this.loadingPromises.has(asset.url)) {
      return this.loadingPromises.get(asset.url)!;
    }

    // Check cache first
    if (this.config.enableCache && this.preloadCache.has(asset.url)) {
      const cached = this.preloadCache.get(asset.url)!;
      const now = Date.now();

      if (now - cached.timestamp < this.config.cacheExpiry) {
        const result: PreloadResult = {
          url: asset.url,
          success: true,
          loadTime: 0,
          cached: true,
        };

        this.recordAnalytics(asset.url, result);
        return result;
      } else {
        this.preloadCache.delete(asset.url);
      }
    }

    const loadPromise = this.performAssetLoad(asset);
    this.loadingPromises.set(asset.url, loadPromise);

    try {
      const result = await loadPromise;
      this.loadingPromises.delete(asset.url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(asset.url);
      throw error;
    }
  }

  private async performAssetLoad(asset: PreloadableAsset): Promise<PreloadResult> {
    const startTime = performance.now();
    let attempts = 0;

    while (attempts < this.config.retryAttempts) {
      try {
        attempts++;

        const success = await this.loadAssetByType(asset);
        const loadTime = performance.now() - startTime;

        const result: PreloadResult = {
          url: asset.url,
          success,
          loadTime,
          cached: false,
        };

        if (success && this.config.enableCache) {
          this.preloadCache.set(asset.url, {
            data: null, // Store actual data if needed
            timestamp: Date.now(),
            loadTime,
          });
        }

        this.recordAnalytics(asset.url, result);
        return result;
      } catch (error) {
        if (attempts >= this.config.retryAttempts) {
          const result: PreloadResult = {
            url: asset.url,
            success: false,
            loadTime: performance.now() - startTime,
            cached: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };

          this.recordAnalytics(asset.url, result);
          return result;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    throw new Error('Max retry attempts reached');
  }

  private async loadAssetByType(asset: PreloadableAsset): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Load timeout'));
      }, this.config.timeout);

      switch (asset.type) {
        case 'font':
          this.loadFont(asset.url)
            .then(() => {
              clearTimeout(timeout);
              resolve(true);
            })
            .catch(error => {
              clearTimeout(timeout);
              reject(error);
            });
          break;

        case 'css':
          this.loadCSS(asset)
            .then(() => {
              clearTimeout(timeout);
              resolve(true);
            })
            .catch(error => {
              clearTimeout(timeout);
              reject(error);
            });
          break;

        case 'js':
          this.loadScript(asset.url)
            .then(() => {
              clearTimeout(timeout);
              resolve(true);
            })
            .catch(error => {
              clearTimeout(timeout);
              reject(error);
            });
          break;

        case 'image':
        case 'icon':
          this.loadImage(asset.url)
            .then(() => {
              clearTimeout(timeout);
              resolve(true);
            })
            .catch(error => {
              clearTimeout(timeout);
              reject(error);
            });
          break;

        default:
          clearTimeout(timeout);
          reject(new Error(`Unsupported asset type: ${asset.type}`));
      }
    });
  }

  private async loadFont(url: string): Promise<void> {
    if (document.fonts) {
      const font = new FontFace('preload-font', `url(${url})`);
      await font.load();
      document.fonts.add(font);
    } else {
      // Fallback for browsers without FontFace API
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.crossOrigin = 'anonymous';
      link.href = url;
      document.head.appendChild(link);
    }
  }

  private async loadCSS(asset: PreloadableAsset): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = asset.url;
      if (asset.media) link.media = asset.media;

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${asset.url}`));

      document.head.appendChild(link);
    });
  }

  private async loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = url;

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load script: ${url}`));

      document.head.appendChild(link);
    });
  }

  private async loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private analyzeComponentDependencies(
    componentName: string
  ): Array<{ url: string; type: AssetType }> {
    // Component dependency mapping
    const dependencyMap: Record<string, Array<{ url: string; type: AssetType }>> = {
      SmartHub: [
        { url: '/js/panel-smarthub.js', type: 'js' },
        { url: '/css/panel-smarthub.css', type: 'css' },
      ],
      AIChat: [
        { url: '/js/panel-aichat.js', type: 'js' },
        { url: '/css/panel-aichat.css', type: 'css' },
      ],
      TaskManager: [
        { url: '/js/panel-taskmanager.js', type: 'js' },
        { url: '/css/panel-taskmanager.css', type: 'css' },
      ],
      Productivity: [
        { url: '/js/panel-productivity.js', type: 'js' },
        { url: '/css/panel-productivity.css', type: 'css' },
      ],
    };

    return dependencyMap[componentName] || [];
  }

  private detectPlatform(): string {
    if (typeof window !== 'undefined') {
      if ((window as any).chrome?.runtime) return 'extension';
      if ((window as any).require) return 'electron';
    }
    return 'web';
  }

  private initializePreloader(): void {
    // Clean up expired cache entries on initialization
    this.clearExpiredCache();

    // Set up periodic cache cleanup
    setInterval(
      () => {
        this.clearExpiredCache();
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }

  private recordAnalytics(url: string, result: PreloadResult): void {
    if (!this.config.enableAnalytics) return;

    if (!this.analytics.has(url)) {
      this.analytics.set(url, []);
    }

    this.analytics.get(url)!.push(result);

    // Keep only last 100 results per asset
    const results = this.analytics.get(url)!;
    if (results.length > 100) {
      results.splice(0, results.length - 100);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Global asset preloader instance
export const globalAssetPreloader = new AssetPreloader({
  enableCache: true,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes
  maxConcurrent: 6,
  retryAttempts: 3,
  timeout: 10000,
  enableAnalytics: true,
});

// Make asset preloader available globally for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__ASSET_PRELOADER__ = globalAssetPreloader;
}
