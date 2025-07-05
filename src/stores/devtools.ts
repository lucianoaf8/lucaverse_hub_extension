/**
 * Zustand DevTools Integration
 * Enhanced debugging for all Zustand stores
 */

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { StateCreator } from 'zustand';

// DevTools configuration interface
export interface DevToolsConfig {
  name: string;
  enabled?: boolean;
  serialize?: boolean;
  trace?: boolean;
  traceLimit?: number;
}

// Enhanced DevTools middleware with time-travel debugging
export const createDevToolsMiddleware = <T>(
  config: DevToolsConfig
) => {
  return (f: StateCreator<T>) => {
    if (typeof window === 'undefined' || !config.enabled) {
      return f;
    }

    return devtools(
      subscribeWithSelector(f),
      {
        name: config.name,
        serialize: config.serialize ?? true,
        trace: config.trace ?? true,
        traceLimit: config.traceLimit ?? 25,
        // Enable action tracking
        actionCreators: {
          // Add custom action creators for better debugging
        }
      }
    );
  };
};

// Store performance tracking
interface StoreMetrics {
  actionCount: number;
  lastActionTime: number;
  renderCount: number;
  averageActionTime: number;
  stateSize: number;
}

class StorePerformanceTracker {
  private metrics = new Map<string, StoreMetrics>();
  
  trackAction(storeName: string, actionName: string, duration: number, stateSize: number) {
    const current = this.metrics.get(storeName) || {
      actionCount: 0,
      lastActionTime: 0,
      renderCount: 0,
      averageActionTime: 0,
      stateSize: 0
    };

    current.actionCount++;
    current.lastActionTime = Date.now();
    current.averageActionTime = (current.averageActionTime * (current.actionCount - 1) + duration) / current.actionCount;
    current.stateSize = stateSize;

    this.metrics.set(storeName, current);

    // Log performance warnings
    if (duration > 100) {
      console.warn(`🐌 Slow action in ${storeName}.${actionName}: ${duration}ms`);
    }
    if (stateSize > 1024 * 1024) { // 1MB
      console.warn(`📦 Large state in ${storeName}: ${(stateSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  getMetrics(storeName: string): StoreMetrics | undefined {
    return this.metrics.get(storeName);
  }

  getAllMetrics(): Map<string, StoreMetrics> {
    return new Map(this.metrics);
  }

  reset(storeName?: string) {
    if (storeName) {
      this.metrics.delete(storeName);
    } else {
      this.metrics.clear();
    }
  }
}

export const storePerformanceTracker = new StorePerformanceTracker();

// Action logging for debugging
export const createActionLogger = (storeName: string) => {
  return <T extends Record<string, any>>(set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void, get: () => T) => {
    const originalSet = set;
    
    return (
      partial: T | Partial<T> | ((state: T) => T | Partial<T>),
      replace?: boolean,
      actionName?: string
    ) => {
      const startTime = performance.now();
      const prevState = get();
      
      originalSet(partial, replace);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const newState = get();
      const stateSize = JSON.stringify(newState).length;
      
      // Track performance
      storePerformanceTracker.trackAction(
        storeName,
        actionName || 'unknown',
        duration,
        stateSize
      );

      // Log action details in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🏪 ${storeName} Action: ${actionName || 'State Update'}`);
        console.log('Previous State:', prevState);
        console.log('New State:', newState);
        console.log('Duration:', `${duration.toFixed(2)}ms`);
        console.log('State Size:', `${(stateSize / 1024).toFixed(2)}KB`);
        console.groupEnd();
      }
    };
  };
};

// State diff utilities for debugging
export const createStateDiffer = () => {
  const getStateChanges = (prevState: any, newState: any, path = ''): string[] => {
    const changes: string[] = [];
    
    if (typeof prevState !== typeof newState) {
      changes.push(`${path}: type changed from ${typeof prevState} to ${typeof newState}`);
      return changes;
    }
    
    if (prevState === newState) {
      return changes;
    }
    
    if (typeof prevState === 'object' && prevState !== null) {
      const allKeys = new Set([...Object.keys(prevState), ...Object.keys(newState)]);
      
      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        
        if (!(key in prevState)) {
          changes.push(`${newPath}: added`);
        } else if (!(key in newState)) {
          changes.push(`${newPath}: removed`);
        } else {
          changes.push(...getStateChanges(prevState[key], newState[key], newPath));
        }
      }
    } else {
      changes.push(`${path}: changed from ${prevState} to ${newState}`);
    }
    
    return changes;
  };
  
  return { getStateChanges };
};

// Cross-platform DevTools integration
export const initializeCrossPlatformDevTools = () => {
  // Web browser DevTools
  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('🛠️ Redux DevTools detected and connected');
  }

  // Electron DevTools
  if (typeof window !== 'undefined' && window.process?.type === 'renderer') {
    console.log('🖥️ Electron DevTools available');
  }

  // Extension DevTools (background script)
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('🔧 Chrome Extension DevTools available');
  }
};

// DevTools state inspection helpers
export const inspectStoreState = (storeName: string, state: any) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group(`🔍 ${storeName} State Inspection`);
  console.log('Current State:', state);
  console.log('State Type:', typeof state);
  console.log('State Size:', `${(JSON.stringify(state).length / 1024).toFixed(2)}KB`);
  
  // Check for potential issues
  const issues: string[] = [];
  
  if (JSON.stringify(state).length > 512 * 1024) { // 512KB
    issues.push('State is very large (>512KB)');
  }
  
  if (hasCircularReferences(state)) {
    issues.push('State contains circular references');
  }
  
  if (issues.length > 0) {
    console.warn('Potential Issues:', issues);
  }
  
  console.groupEnd();
};

// Utility to detect circular references
const hasCircularReferences = (obj: any, seen = new WeakSet()): boolean => {
  if (obj !== null && typeof obj === 'object') {
    if (seen.has(obj)) {
      return true;
    }
    seen.add(obj);
    
    for (const key in obj) {
      if (hasCircularReferences(obj[key], seen)) {
        return true;
      }
    }
  }
  return false;
};

// Global DevTools utilities for console access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__STORE_DEVTOOLS__ = {
    tracker: storePerformanceTracker,
    inspectState: inspectStoreState,
    createDiffer: createStateDiffer
  };
}

// Export default configuration for different environments
export const defaultDevToolsConfig = {
  development: {
    enabled: true,
    serialize: true,
    trace: true,
    traceLimit: 25
  },
  production: {
    enabled: false,
    serialize: false,
    trace: false,
    traceLimit: 0
  }
}[process.env.NODE_ENV as 'development' | 'production'] || defaultDevToolsConfig.development;