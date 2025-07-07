/**
 * Lazy Panel Loader - Progressive loading system for panel components
 * Implements lazy loading with skeleton placeholders and error boundaries
 */

import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { ErrorBoundary } from '@/utils/errorTracker';
import { globalAssetPreloader } from '@/utils/assetPreloader';

export type PanelType = 'SmartHub' | 'AIChat' | 'TaskManager' | 'Productivity';

export interface LazyPanelProps {
  panelType: PanelType;
  panelId: string;
  isVisible: boolean;
  onLoadStart?: () => void;
  onLoadComplete?: (loadTime: number) => void;
  onLoadError?: (error: Error) => void;
  enableIntersectionObserver?: boolean;
  preloadRelated?: boolean;
  fallbackDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface LoadingState {
  isLoading: boolean;
  hasLoaded: boolean;
  loadTime?: number;
  error?: Error;
  retryCount: number;
}

// Lazy imports with dynamic chunking
const LazySmartHub = React.lazy(() =>
  import('@/components/panels/SmartHub').then(module => ({ default: module.SmartHub }))
);

const LazyAIChat = React.lazy(() =>
  import('@/components/panels/AIChat').then(module => ({ default: module.AIChat }))
);

const LazyTaskManager = React.lazy(() =>
  import('@/components/panels/TaskManager').then(module => ({ default: module.TaskManager }))
);

const LazyProductivity = React.lazy(() =>
  import('@/components/panels/Productivity').then(module => ({ default: module.Productivity }))
);

// Panel component mapping
const PANEL_COMPONENTS = {
  SmartHub: LazySmartHub,
  AIChat: LazyAIChat,
  TaskManager: LazyTaskManager,
  Productivity: LazyProductivity,
} as const;

// Related panel dependencies for preloading
const RELATED_PANELS: Record<PanelType, PanelType[]> = {
  SmartHub: ['AIChat', 'TaskManager'],
  AIChat: ['SmartHub', 'Productivity'],
  TaskManager: ['SmartHub', 'Productivity'],
  Productivity: ['TaskManager', 'AIChat'],
};

// Skeleton component for loading states
const PanelSkeleton: React.FC<{ panelType: PanelType; className?: string }> = ({
  panelType,
  className = '',
}) => {
  const getSkeletonConfig = (type: PanelType) => {
    switch (type) {
      case 'SmartHub':
        return {
          title: 'Smart Hub',
          elements: [
            { type: 'header', width: '60%' },
            { type: 'grid', columns: 3, rows: 2 },
            { type: 'footer', width: '100%' },
          ],
        };
      case 'AIChat':
        return {
          title: 'AI Chat',
          elements: [
            { type: 'header', width: '40%' },
            { type: 'messages', count: 4 },
            { type: 'input', width: '100%' },
          ],
        };
      case 'TaskManager':
        return {
          title: 'Task Manager',
          elements: [
            { type: 'header', width: '50%' },
            { type: 'list', items: 5 },
            { type: 'button', width: '30%' },
          ],
        };
      case 'Productivity':
        return {
          title: 'Productivity',
          elements: [
            { type: 'stats', columns: 2 },
            { type: 'chart', height: '120px' },
            { type: 'controls', width: '80%' },
          ],
        };
    }
  };

  const config = getSkeletonConfig(panelType);

  return (
    <div className={`panel-skeleton animate-pulse ${className}`}>
      {/* Panel Header */}
      <div className="skeleton-header p-4 border-b border-gray-200/20">
        <div
          className="skeleton-title h-6 bg-gray-300/20 rounded"
          style={{ width: config.elements[0].width }}
        />
      </div>

      {/* Panel Content */}
      <div className="skeleton-content p-4 space-y-4">
        {config.elements.slice(1).map((element, index) => (
          <div key={index} className="skeleton-element">
            {element.type === 'grid' && (
              <div className={`grid grid-cols-${element.columns} gap-3`}>
                {Array.from({ length: (element.columns || 1) * (element.rows || 1) }).map(
                  (_, i) => (
                    <div key={i} className="h-16 bg-gray-300/20 rounded" />
                  )
                )}
              </div>
            )}

            {element.type === 'messages' && (
              <div className="space-y-3">
                {Array.from({ length: element.count || 3 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`h-12 bg-gray-300/20 rounded-lg ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {element.type === 'list' && (
              <div className="space-y-2">
                {Array.from({ length: element.items || 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-300/20 rounded" />
                    <div className="flex-1 h-4 bg-gray-300/20 rounded" />
                  </div>
                ))}
              </div>
            )}

            {element.type === 'stats' && (
              <div className={`grid grid-cols-${element.columns || 2} gap-4`}>
                {Array.from({ length: element.columns || 2 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-gray-300/20 rounded mb-2" />
                    <div className="h-4 bg-gray-300/20 rounded w-16 mx-auto" />
                  </div>
                ))}
              </div>
            )}

            {element.type === 'chart' && (
              <div
                className="bg-gray-300/20 rounded"
                style={{ height: element.height || '100px' }}
              />
            )}

            {(element.type === 'header' ||
              element.type === 'footer' ||
              element.type === 'button' ||
              element.type === 'input' ||
              element.type === 'controls') && (
              <div
                className="h-10 bg-gray-300/20 rounded"
                style={{ width: element.width || '100%' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      <div className="absolute top-2 right-2">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full" />
          <span>Loading {config.title}...</span>
        </div>
      </div>
    </div>
  );
};

// Error fallback component
const PanelErrorFallback: React.FC<{
  error: Error;
  onRetry: () => void;
  panelType: PanelType;
}> = ({ error, onRetry, panelType }) => (
  <div className="panel-error p-6 text-center bg-red-50/10 border border-red-200/20 rounded-lg">
    <div className="text-red-400 mb-4">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-red-300 mb-2">Failed to load {panelType}</h3>
    <p className="text-sm text-red-400/80 mb-4">{error.message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Performance monitoring for lazy loading
class LazyLoadingMonitor {
  private static metrics = new Map<
    string,
    {
      loadTime: number;
      retryCount: number;
      success: boolean;
      timestamp: number;
    }
  >();

  static recordLoadStart(panelId: string): void {
    this.metrics.set(panelId, {
      loadTime: performance.now(),
      retryCount: 0,
      success: false,
      timestamp: Date.now(),
    });
  }

  static recordLoadComplete(panelId: string, success: boolean): void {
    const metric = this.metrics.get(panelId);
    if (metric) {
      metric.loadTime = performance.now() - metric.loadTime;
      metric.success = success;
    }
  }

  static recordRetry(panelId: string): void {
    const metric = this.metrics.get(panelId);
    if (metric) {
      metric.retryCount++;
    }
  }

  static getMetrics(): Array<{ panelId: string; metric: any }> {
    return Array.from(this.metrics.entries()).map(([panelId, metric]) => ({
      panelId,
      metric,
    }));
  }

  static getAverageLoadTime(): number {
    const metrics = Array.from(this.metrics.values()).filter(m => m.success);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
  }
}

// Main LazyPanelLoader component
export const LazyPanelLoader: React.FC<LazyPanelProps> = ({
  panelType,
  panelId,
  isVisible,
  onLoadStart,
  onLoadComplete,
  onLoadError,
  enableIntersectionObserver = true,
  preloadRelated = true,
  fallbackDelay = 300,
  className = '',
  style = {},
  ...props
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    hasLoaded: false,
    retryCount: 0,
  });

  const [shouldLoad, setShouldLoad] = useState(!enableIntersectionObserver || isVisible);
  const [showFallback, setShowFallback] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout>();

  // Intersection Observer for viewport-based loading
  useEffect(() => {
    if (!enableIntersectionObserver || shouldLoad) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [enableIntersectionObserver, shouldLoad]);

  // Preload related panels
  useEffect(() => {
    if (shouldLoad && preloadRelated && loadingState.hasLoaded) {
      const relatedPanels = RELATED_PANELS[panelType];
      relatedPanels.forEach(async relatedType => {
        try {
          await globalAssetPreloader.preloadComponentDependencies(relatedType);
        } catch (error) {
          console.warn(`Failed to preload related panel ${relatedType}:`, error);
        }
      });
    }
  }, [shouldLoad, preloadRelated, panelType, loadingState.hasLoaded]);

  // Fallback delay timer
  useEffect(() => {
    if (shouldLoad && !loadingState.hasLoaded) {
      fallbackTimeoutRef.current = setTimeout(() => {
        setShowFallback(true);
      }, fallbackDelay);

      return () => {
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current);
        }
      };
    }
  }, [shouldLoad, loadingState.hasLoaded, fallbackDelay]);

  // Load start tracking
  useEffect(() => {
    if (shouldLoad && !loadingState.isLoading && !loadingState.hasLoaded) {
      setLoadingState(prev => ({ ...prev, isLoading: true }));
      LazyLoadingMonitor.recordLoadStart(panelId);
      onLoadStart?.();
    }
  }, [shouldLoad, loadingState.isLoading, loadingState.hasLoaded, panelId, onLoadStart]);

  const handleLoadComplete = useCallback(
    (loadTime: number) => {
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        hasLoaded: true,
        loadTime,
      }));
      setShowFallback(false);
      LazyLoadingMonitor.recordLoadComplete(panelId, true);
      onLoadComplete?.(loadTime);
    },
    [panelId, onLoadComplete]
  );

  const handleLoadError = useCallback(
    (error: Error) => {
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        error,
        retryCount: prev.retryCount + 1,
      }));
      setShowFallback(false);
      LazyLoadingMonitor.recordLoadComplete(panelId, false);
      LazyLoadingMonitor.recordRetry(panelId);
      onLoadError?.(error);
    },
    [panelId, onLoadError]
  );

  const handleRetry = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      error: undefined,
      isLoading: false,
      hasLoaded: false,
    }));
    setShouldLoad(false);
    // Trigger reload by resetting shouldLoad
    setTimeout(() => setShouldLoad(true), 100);
  }, []);

  // Component loader with error handling
  const ComponentLoader: React.FC = () => {
    const PanelComponent = PANEL_COMPONENTS[panelType];

    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const loadTime = performance.now() - startTime;
        handleLoadComplete(loadTime);
      };
    }, []);

    return <PanelComponent {...props} />;
  };

  // Don't render anything until should load
  if (!shouldLoad) {
    return (
      <div
        ref={observerRef}
        className={`lazy-panel-placeholder ${className}`}
        style={{ minHeight: '200px', ...style }}
      />
    );
  }

  // Show error state
  if (loadingState.error) {
    return (
      <div className={`lazy-panel-error ${className}`} style={style}>
        <PanelErrorFallback
          error={loadingState.error}
          onRetry={handleRetry}
          panelType={panelType}
        />
      </div>
    );
  }

  return (
    <div className={`lazy-panel-container ${className}`} style={style}>
      <ErrorBoundary
        fallback={({ error }) => (
          <PanelErrorFallback error={error} onRetry={handleRetry} panelType={panelType} />
        )}
      >
        <Suspense
          fallback={
            showFallback ? (
              <PanelSkeleton panelType={panelType} className="relative" />
            ) : (
              <div className="lazy-panel-loading flex items-center justify-center h-48">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )
          }
        >
          <ComponentLoader />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

// Hook for lazy loading performance metrics
export const useLazyLoadingMetrics = () => {
  const [metrics, setMetrics] = useState(LazyLoadingMonitor.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(LazyLoadingMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    averageLoadTime: LazyLoadingMonitor.getAverageLoadTime(),
    totalPanelsLoaded: metrics.filter(m => m.metric.success).length,
    totalFailures: metrics.filter(m => !m.metric.success).length,
  };
};

// Global performance monitoring for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__LAZY_LOADING_MONITOR__ = LazyLoadingMonitor;
}

export default LazyPanelLoader;
