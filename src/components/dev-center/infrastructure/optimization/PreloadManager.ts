// Preload manager for progressive loading of dev center tools
class PreloadManager {
  private preloadedModules = new Set<string>();
  private preloadPromises = new Map<string, Promise<any>>();
  
  // Preload a module in the background
  async preloadModule(modulePath: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (this.preloadedModules.has(modulePath)) {
      return;
    }
    
    if (this.preloadPromises.has(modulePath)) {
      return this.preloadPromises.get(modulePath);
    }
    
    // Delay preloading based on priority
    const delay = priority === 'high' ? 0 : priority === 'medium' ? 1000 : 3000;
    
    const preloadPromise = new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          let module;
          switch (modulePath) {
            case 'theme-studio':
              module = await import('../tools/ThemeStudio');
              break;
            case 'component-workshop':
              module = await import('../tools/ComponentWorkshop');
              break;
            case 'layout-designer':
              module = await import('../tools/LayoutDesigner');
              break;
            case 'quality-gate':
              module = await import('../tools/QualityGate');
              break;
            default:
              throw new Error(`Unknown module: ${modulePath}`);
          }
          
          this.preloadedModules.add(modulePath);
          console.log(`Preloaded module: ${modulePath}`);
          resolve(module);
        } catch (error) {
          console.error(`Failed to preload module ${modulePath}:`, error);
          reject(error);
        }
      }, delay);
    });
    
    this.preloadPromises.set(modulePath, preloadPromise);
    return preloadPromise;
  }
  
  // Preload all workflow modules when idle
  preloadAllWorkflows() {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadModule('theme-studio', 'medium');
        this.preloadModule('component-workshop', 'medium');
        this.preloadModule('layout-designer', 'medium');
        this.preloadModule('quality-gate', 'low');
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preloadModule('theme-studio', 'medium');
        this.preloadModule('component-workshop', 'medium');
        this.preloadModule('layout-designer', 'medium');
        this.preloadModule('quality-gate', 'low');
      }, 2000);
    }
  }
  
  // Check if a module is already preloaded
  isPreloaded(modulePath: string): boolean {
    return this.preloadedModules.has(modulePath);
  }
  
  // Get preload status for analytics
  getPreloadStatus() {
    return {
      preloaded: Array.from(this.preloadedModules),
      pending: Array.from(this.preloadPromises.keys()).filter(key => !this.preloadedModules.has(key))
    };
  }
}

export const preloadManager = new PreloadManager();