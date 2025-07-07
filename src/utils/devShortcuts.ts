/**
 * Development Shortcuts and Utilities
 * Keyboard shortcuts, console commands, and quick development tools
 */

import React from 'react';
import { useLayoutStore } from '../stores/layoutStore';
import { useAppStore } from '../stores/appStore';
import { globalErrorTracker } from './errorTracker';
import { StateInspector } from './stateInspector';
import { PerformanceMonitor } from './performanceMonitor';

export interface DevShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  category: 'debug' | 'layout' | 'state' | 'testing' | 'performance';
}

export interface MockDataConfig {
  panels?: number;
  tasks?: number;
  bookmarks?: number;
  chatMessages?: number;
  notifications?: number;
}

export class DevShortcutsManager {
  private shortcuts: DevShortcut[] = [];
  private isEnabled = false;
  private stateInspector: StateInspector;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.stateInspector = new StateInspector();
    this.performanceMonitor = new PerformanceMonitor();
    this.setupDefaultShortcuts();

    if (process.env.NODE_ENV === 'development') {
      this.enable();
    }
  }

  /**
   * Enable development shortcuts
   */
  enable(): void {
    if (this.isEnabled) return;

    this.isEnabled = true;
    document.addEventListener('keydown', this.handleKeyDown);
    this.setupConsoleCommands();
    console.log('🛠️ Development shortcuts enabled');
    this.printShortcutHelp();
  }

  /**
   * Disable development shortcuts
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;
    document.removeEventListener('keydown', this.handleKeyDown);
    console.log('🛠️ Development shortcuts disabled');
  }

  /**
   * Add custom shortcut
   */
  addShortcut(shortcut: DevShortcut): void {
    this.shortcuts.push(shortcut);
  }

  /**
   * Remove shortcut by key combination
   */
  removeShortcut(
    key: string,
    modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
  ): void {
    this.shortcuts = this.shortcuts.filter(
      shortcut =>
        !(
          shortcut.key === key &&
          !!shortcut.ctrlKey === !!modifiers.ctrl &&
          !!shortcut.shiftKey === !!modifiers.shift &&
          !!shortcut.altKey === !!modifiers.alt
        )
    );
  }

  /**
   * Generate mock data for testing
   */
  generateMockData(config: MockDataConfig = {}): void {
    const layoutStore = useLayoutStore.getState();
    const appStore = useAppStore.getState();

    console.group('🎭 Generating mock data...');

    // Generate mock panels
    if (config.panels && config.panels > 0) {
      for (let i = 0; i < config.panels; i++) {
        const components = ['SmartHub', 'AIChat', 'TaskManager', 'Productivity'];
        const component = components[Math.floor(Math.random() * components.length)];

        layoutStore.addPanel({
          component: component as any,
          position: {
            x: Math.random() * 800,
            y: Math.random() * 600,
          },
          size: {
            width: 250 + Math.random() * 200,
            height: 200 + Math.random() * 150,
          },
          zIndex: 1,
          visible: true,
          title: `Mock ${component} ${i + 1}`,
        });
      }
      console.log(`✅ Generated ${config.panels} mock panels`);
    }

    // Generate mock notifications
    if (config.notifications && config.notifications > 0) {
      const types: Array<'info' | 'success' | 'warning' | 'error'> = [
        'info',
        'success',
        'warning',
        'error',
      ];
      for (let i = 0; i < config.notifications; i++) {
        appStore.addNotification({
          type: types[Math.floor(Math.random() * types.length)],
          title: `Mock Notification ${i + 1}`,
          message: `This is a mock notification for testing purposes #${i + 1}`,
          duration: 5000,
        });
      }
      console.log(`✅ Generated ${config.notifications} mock notifications`);
    }

    console.groupEnd();
  }

  /**
   * Quick state reset utilities
   */
  resetState(target: 'layout' | 'app' | 'all' = 'all'): void {
    console.group('🔄 Resetting state...');

    if (target === 'layout' || target === 'all') {
      useLayoutStore.getState().resetLayout();
      console.log('✅ Layout state reset');
    }

    if (target === 'app' || target === 'all') {
      useAppStore.getState().clearAllNotifications();
      console.log('✅ App notifications cleared');
    }

    console.groupEnd();
  }

  /**
   * Theme switching utilities
   */
  switchTheme(theme?: 'light' | 'dark'): void {
    const appStore = useAppStore.getState();

    if (theme) {
      appStore.setTheme(theme === 'dark' ? ('Dark' as any) : ('Light' as any));
      console.log(`🎨 Theme switched to ${theme}`);
    } else {
      appStore.toggleTheme();
      console.log('🎨 Theme toggled');
    }
  }

  /**
   * Performance testing utilities
   */
  runPerformanceTest(duration = 5000): void {
    console.log('🏃‍♂️ Starting performance test...');
    this.performanceMonitor.startProfiling();

    // Simulate heavy operations
    const startTime = Date.now();
    const heavyOperation = () => {
      // Simulate DOM manipulation
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.style.transform = `translate(${Math.random() * 100}px, ${Math.random() * 100}px)`;
        document.body.appendChild(div);
        document.body.removeChild(div);
      }

      if (Date.now() - startTime < duration) {
        requestAnimationFrame(heavyOperation);
      } else {
        this.performanceMonitor.stopProfiling();
        const metrics = this.performanceMonitor.getMetrics();
        console.log('📊 Performance test completed:', metrics);
      }
    };

    requestAnimationFrame(heavyOperation);
  }

  /**
   * Error simulation for testing error handling
   */
  simulateError(type: 'render' | 'state' | 'network' | 'critical' = 'render'): void {
    console.warn(`🧨 Simulating ${type} error...`);

    switch (type) {
      case 'render':
        throw new Error('Simulated render error for testing');

      case 'state':
        try {
          JSON.parse('invalid json');
        } catch (error) {
          globalErrorTracker.trackCustomError(
            'Simulated state error',
            'state',
            { component: 'DevTools' },
            'medium'
          );
        }
        break;

      case 'network':
        fetch('/nonexistent-endpoint').catch(error => {
          globalErrorTracker.trackError(error, { component: 'DevTools' });
        });
        break;

      case 'critical':
        globalErrorTracker.trackCustomError(
          'Simulated critical error',
          'unknown',
          { component: 'DevTools' },
          'critical'
        );
        break;
    }
  }

  /**
   * State inspection utilities
   */
  inspectState(target: 'layout' | 'app' | 'both' = 'both'): void {
    console.group('🔍 State Inspection');

    if (target === 'layout' || target === 'both') {
      const layoutState = useLayoutStore.getState();
      const report = this.stateInspector.generateStateReport(layoutState);
      console.log('Layout State Report:', report);
    }

    if (target === 'app' || target === 'both') {
      const appState = useAppStore.getState();
      console.log('App State:', appState);
    }

    console.groupEnd();
  }

  // Private methods

  private setupDefaultShortcuts(): void {
    this.shortcuts = [
      // Debug shortcuts
      {
        key: 'F12',
        description: 'Toggle debug panel',
        category: 'debug',
        action: () => this.toggleDebugPanel(),
      },
      {
        key: 'd',
        ctrlKey: true,
        shiftKey: true,
        description: 'Toggle debug mode',
        category: 'debug',
        action: () => {
          useAppStore.getState().toggleDebugMode();
          console.log('🐛 Debug mode toggled');
        },
      },

      // Layout shortcuts
      {
        key: 'r',
        ctrlKey: true,
        shiftKey: true,
        description: 'Reset layout',
        category: 'layout',
        action: () => this.resetState('layout'),
      },
      {
        key: 'g',
        ctrlKey: true,
        shiftKey: true,
        description: 'Toggle grid visibility',
        category: 'layout',
        action: () => {
          const layoutStore = useLayoutStore.getState();
          layoutStore.updateGridSettings({
            visible: !layoutStore.gridSettings.visible,
          });
          console.log('📐 Grid visibility toggled');
        },
      },

      // State shortcuts
      {
        key: 'i',
        ctrlKey: true,
        shiftKey: true,
        description: 'Inspect state',
        category: 'state',
        action: () => this.inspectState(),
      },
      {
        key: 's',
        ctrlKey: true,
        shiftKey: true,
        description: 'Save state snapshot',
        category: 'state',
        action: () => this.saveStateSnapshot(),
      },

      // Testing shortcuts
      {
        key: 'm',
        ctrlKey: true,
        shiftKey: true,
        description: 'Generate mock data',
        category: 'testing',
        action: () => this.generateMockData({ panels: 3, notifications: 2 }),
      },
      {
        key: 'e',
        ctrlKey: true,
        shiftKey: true,
        description: 'Simulate error',
        category: 'testing',
        action: () => this.simulateError(),
      },

      // Performance shortcuts
      {
        key: 'p',
        ctrlKey: true,
        shiftKey: true,
        description: 'Run performance test',
        category: 'performance',
        action: () => this.runPerformanceTest(),
      },
      {
        key: 't',
        ctrlKey: true,
        shiftKey: true,
        description: 'Toggle theme',
        category: 'debug',
        action: () => this.switchTheme(),
      },
    ];
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isEnabled) return;

    const matchingShortcut = this.shortcuts.find(
      shortcut =>
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
    );

    if (matchingShortcut) {
      event.preventDefault();
      try {
        matchingShortcut.action();
      } catch (error) {
        console.error('Error executing shortcut:', error);
      }
    }
  };

  private setupConsoleCommands(): void {
    const commands = {
      // State commands
      inspectState: () => this.inspectState(),
      resetState: (target?: 'layout' | 'app' | 'all') => this.resetState(target),
      exportState: () => {
        const layoutState = useLayoutStore.getState();
        const appState = useAppStore.getState();
        return { layout: layoutState, app: appState };
      },

      // Mock data commands
      mockData: (config?: MockDataConfig) => this.generateMockData(config),
      mockPanels: (count = 5) => this.generateMockData({ panels: count }),
      mockNotifications: (count = 3) => this.generateMockData({ notifications: count }),

      // Theme commands
      darkTheme: () => this.switchTheme('dark'),
      lightTheme: () => this.switchTheme('light'),
      toggleTheme: () => this.switchTheme(),

      // Error testing
      simulateError: (type?: 'render' | 'state' | 'network' | 'critical') =>
        this.simulateError(type),

      // Performance testing
      perfTest: (duration?: number) => this.runPerformanceTest(duration),
      perfMetrics: () => this.performanceMonitor.getMetrics(),

      // Help
      help: () => this.printShortcutHelp(),
      shortcuts: () => this.printShortcutHelp(),
    };

    // Add commands to window object
    Object.entries(commands).forEach(([name, fn]) => {
      (window as any)[name] = fn;
    });

    console.log('🚀 Console commands available:', Object.keys(commands));
  }

  private toggleDebugPanel(): void {
    // This would toggle the debug panel visibility
    // Implementation depends on how the debug panel is integrated
    const event = new CustomEvent('toggle-debug-panel');
    window.dispatchEvent(event);
    console.log('🛠️ Debug panel toggle requested');
  }

  private saveStateSnapshot(): void {
    const layoutState = useLayoutStore.getState();
    const appState = useAppStore.getState();

    const snapshot = {
      timestamp: new Date().toISOString(),
      layout: layoutState,
      app: appState,
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('💾 State snapshot saved');
  }

  private printShortcutHelp(): void {
    console.group('⌨️ Development Shortcuts');

    const categories = [...new Set(this.shortcuts.map(s => s.category))];

    categories.forEach(category => {
      console.group(`${category.charAt(0).toUpperCase() + category.slice(1)} Shortcuts:`);

      this.shortcuts
        .filter(s => s.category === category)
        .forEach(shortcut => {
          const keys = [
            shortcut.ctrlKey ? 'Ctrl' : '',
            shortcut.shiftKey ? 'Shift' : '',
            shortcut.altKey ? 'Alt' : '',
            shortcut.key.toUpperCase(),
          ]
            .filter(Boolean)
            .join(' + ');

          console.log(`${keys}: ${shortcut.description}`);
        });

      console.groupEnd();
    });

    console.groupEnd();
  }
}

// React hook for development shortcuts
export const useDevShortcuts = (enabled = true) => {
  const [manager] = React.useState(() => new DevShortcutsManager());

  React.useEffect(() => {
    if (enabled && process.env.NODE_ENV === 'development') {
      manager.enable();
      return () => manager.disable();
    }
  }, [manager, enabled]);

  return manager;
};

// Global shortcuts manager
export const globalDevShortcuts = new DevShortcutsManager();

// Make shortcuts manager available globally
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__DEV_SHORTCUTS__ = globalDevShortcuts;
}
