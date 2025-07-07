/**
 * Electron Window Manager
 * Handles multi-window support, state persistence, and window lifecycle management
 */

import { BrowserWindow, screen, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Window state interface
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullScreen: boolean;
  isMinimized: boolean;
  displayId?: number;
}

// Window template interface
interface WindowTemplate {
  name: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  resizable: boolean;
  maximizable: boolean;
  minimizable: boolean;
  frame: boolean;
  webPreferences?: Electron.WebPreferences;
  show: boolean;
}

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();
  private windowStates: Map<string, WindowState> = new Map();
  private stateFilePath: string;
  private templates: Map<string, WindowTemplate> = new Map();

  constructor() {
    // Initialize state file path
    this.stateFilePath = path.join(app.getPath('userData'), 'window-states.json');
    
    // Load existing window states
    this.loadWindowStates();
    
    // Setup window templates
    this.setupWindowTemplates();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Setup predefined window templates
   */
  private setupWindowTemplates(): void {
    // Main application window
    this.templates.set('main', {
      name: 'Lucaverse Hub',
      defaultWidth: 1400,
      defaultHeight: 900,
      minWidth: 1200,
      minHeight: 800,
      resizable: true,
      maximizable: true,
      minimizable: true,
      frame: true,
      show: false,
    });

    // Settings window
    this.templates.set('settings', {
      name: 'Settings',
      defaultWidth: 800,
      defaultHeight: 600,
      minWidth: 600,
      minHeight: 400,
      resizable: true,
      maximizable: false,
      minimizable: true,
      frame: true,
      show: false,
    });

    // About window
    this.templates.set('about', {
      name: 'About Lucaverse Hub',
      defaultWidth: 500,
      defaultHeight: 400,
      minWidth: 500,
      minHeight: 400,
      resizable: false,
      maximizable: false,
      minimizable: false,
      frame: true,
      show: false,
    });

    // Splash screen
    this.templates.set('splash', {
      name: 'Loading...',
      defaultWidth: 400,
      defaultHeight: 300,
      minWidth: 400,
      minHeight: 300,
      resizable: false,
      maximizable: false,
      minimizable: false,
      frame: false,
      show: true,
    });

    // Developer tools window
    this.templates.set('devtools', {
      name: 'Developer Tools',
      defaultWidth: 1000,
      defaultHeight: 700,
      minWidth: 800,
      minHeight: 500,
      resizable: true,
      maximizable: true,
      minimizable: true,
      frame: true,
      show: false,
    });
  }

  /**
   * Create a new window based on template
   */
  createWindow(templateName: string, options: Partial<Electron.BrowserWindowConstructorOptions> = {}): BrowserWindow {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Window template '${templateName}' not found`);
    }

    // Get saved state or defaults
    const state = this.getWindowState(templateName);
    const displayBounds = this.getDisplayBounds(state.displayId);

    // Ensure window is visible on screen
    const bounds = this.ensureVisibleOnDisplay(state, displayBounds);

    // Create window configuration
    const windowConfig: Electron.BrowserWindowConstructorOptions = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      minWidth: template.minWidth,
      minHeight: template.minHeight,
      resizable: template.resizable,
      maximizable: template.maximizable,
      minimizable: template.minimizable,
      frame: template.frame,
      show: template.show,
      title: template.name,

      // Security settings
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        ...template.webPreferences,
      },

      // Styling
      backgroundColor: '#1F2937',
      darkTheme: true,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      
      // Override with custom options
      ...options,
    };

    // Create the window
    const window = new BrowserWindow(windowConfig);

    // Store window reference
    this.windows.set(templateName, window);

    // Setup window-specific event handlers
    this.setupWindowEventHandlers(window, templateName);

    // Restore maximized/fullscreen state
    if (state.isMaximized) {
      window.maximize();
    }
    if (state.isFullScreen) {
      window.setFullScreen(true);
    }

    console.log(`Created window: ${templateName}`);
    return window;
  }

  /**
   * Get window by template name
   */
  getWindow(templateName: string): BrowserWindow | undefined {
    return this.windows.get(templateName);
  }

  /**
   * Close window by template name
   */
  closeWindow(templateName: string): boolean {
    const window = this.windows.get(templateName);
    if (window && !window.isDestroyed()) {
      window.close();
      return true;
    }
    return false;
  }

  /**
   * Focus window by template name
   */
  focusWindow(templateName: string): boolean {
    const window = this.windows.get(templateName);
    if (window && !window.isDestroyed()) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
      return true;
    }
    return false;
  }

  /**
   * Get all active windows
   */
  getAllWindows(): Map<string, BrowserWindow> {
    // Filter out destroyed windows
    for (const [name, window] of this.windows.entries()) {
      if (window.isDestroyed()) {
        this.windows.delete(name);
      }
    }
    return new Map(this.windows);
  }

  /**
   * Save window state to disk
   */
  saveWindowState(window: BrowserWindow, templateName?: string): void {
    if (window.isDestroyed()) return;

    // Find template name if not provided
    if (!templateName) {
      for (const [name, win] of this.windows.entries()) {
        if (win === window) {
          templateName = name;
          break;
        }
      }
    }

    if (!templateName) return;

    const bounds = window.getBounds();
    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: window.isMaximized(),
      isFullScreen: window.isFullScreen(),
      isMinimized: window.isMinimized(),
      displayId: this.getCurrentDisplayId(window),
    };

    this.windowStates.set(templateName, state);
    this.saveWindowStatesToDisk();
  }

  /**
   * Restore window state from disk
   */
  async restoreWindowState(window: BrowserWindow, templateName?: string): Promise<void> {
    if (!templateName) {
      for (const [name, win] of this.windows.entries()) {
        if (win === window) {
          templateName = name;
          break;
        }
      }
    }

    if (!templateName) return;

    const state = this.getWindowState(templateName);
    const displayBounds = this.getDisplayBounds(state.displayId);
    const bounds = this.ensureVisibleOnDisplay(state, displayBounds);

    window.setBounds(bounds);

    if (state.isMaximized) {
      window.maximize();
    }
    if (state.isFullScreen) {
      window.setFullScreen(true);
    }
  }

  /**
   * Get window state (from memory or defaults)
   */
  private getWindowState(templateName: string): WindowState {
    const saved = this.windowStates.get(templateName);
    if (saved) return saved;

    // Return default state based on template
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    return {
      width: template.defaultWidth,
      height: template.defaultHeight,
      x: Math.floor((screenWidth - template.defaultWidth) / 2),
      y: Math.floor((screenHeight - template.defaultHeight) / 2),
      isMaximized: false,
      isFullScreen: false,
      isMinimized: false,
      displayId: primaryDisplay.id,
    };
  }

  /**
   * Get display bounds for a display ID
   */
  private getDisplayBounds(displayId?: number): Electron.Rectangle {
    if (displayId) {
      const display = screen.getAllDisplays().find(d => d.id === displayId);
      if (display) {
        return display.workArea;
      }
    }

    // Fallback to primary display
    return screen.getPrimaryDisplay().workArea;
  }

  /**
   * Ensure window is visible on the specified display
   */
  private ensureVisibleOnDisplay(state: WindowState, displayBounds: Electron.Rectangle): Electron.Rectangle {
    let { x, y, width, height } = state;

    // Ensure window is not larger than display
    width = Math.min(width, displayBounds.width);
    height = Math.min(height, displayBounds.height);

    // Ensure window is within display bounds
    if (x === undefined || x < displayBounds.x || x + width > displayBounds.x + displayBounds.width) {
      x = displayBounds.x + Math.floor((displayBounds.width - width) / 2);
    }

    if (y === undefined || y < displayBounds.y || y + height > displayBounds.y + displayBounds.height) {
      y = displayBounds.y + Math.floor((displayBounds.height - height) / 2);
    }

    return { x, y, width, height };
  }

  /**
   * Get current display ID for a window
   */
  private getCurrentDisplayId(window: BrowserWindow): number {
    const bounds = window.getBounds();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    const display = screen.getDisplayNearestPoint({ x: centerX, y: centerY });
    return display.id;
  }

  /**
   * Setup window event handlers
   */
  private setupWindowEventHandlers(window: BrowserWindow, templateName: string): void {
    // Save state on various events
    const saveState = () => this.saveWindowState(window, templateName);

    window.on('resize', saveState);
    window.on('move', saveState);
    window.on('maximize', saveState);
    window.on('unmaximize', saveState);
    window.on('minimize', saveState);
    window.on('restore', saveState);
    window.on('enter-full-screen', saveState);
    window.on('leave-full-screen', saveState);

    // Handle window closed
    window.on('closed', () => {
      this.windows.delete(templateName);
      console.log(`Window closed: ${templateName}`);
    });

    // Handle focus events
    window.on('focus', () => {
      console.log(`Window focused: ${templateName}`);
      this.broadcastWindowEvent('focus', templateName);
    });

    window.on('blur', () => {
      console.log(`Window blurred: ${templateName}`);
      this.broadcastWindowEvent('blur', templateName);
    });

    // Handle window ready to show
    window.once('ready-to-show', () => {
      console.log(`Window ready to show: ${templateName}`);
      this.broadcastWindowEvent('ready-to-show', templateName);
    });
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    // Handle display changes
    screen.on('display-added', () => {
      console.log('Display added');
      this.handleDisplayChange();
    });

    screen.on('display-removed', () => {
      console.log('Display removed');
      this.handleDisplayChange();
    });

    screen.on('display-metrics-changed', () => {
      console.log('Display metrics changed');
      this.handleDisplayChange();
    });

    // Save states before app quits
    app.on('before-quit', () => {
      for (const [templateName, window] of this.windows.entries()) {
        if (!window.isDestroyed()) {
          this.saveWindowState(window, templateName);
        }
      }
    });
  }

  /**
   * Handle display configuration changes
   */
  private handleDisplayChange(): void {
    // Ensure all windows are still visible
    for (const [templateName, window] of this.windows.entries()) {
      if (window.isDestroyed()) continue;

      const bounds = window.getBounds();
      const displays = screen.getAllDisplays();
      
      // Check if window is still on a valid display
      const isVisible = displays.some(display => {
        const area = display.workArea;
        return bounds.x < area.x + area.width &&
               bounds.x + bounds.width > area.x &&
               bounds.y < area.y + area.height &&
               bounds.y + bounds.height > area.y;
      });

      if (!isVisible) {
        // Move window to primary display
        const primaryDisplay = screen.getPrimaryDisplay();
        const state = this.getWindowState(templateName);
        const newBounds = this.ensureVisibleOnDisplay(state, primaryDisplay.workArea);
        window.setBounds(newBounds);
        
        console.log(`Moved window '${templateName}' to primary display`);
      }
    }
  }

  /**
   * Broadcast window events to all windows
   */
  private broadcastWindowEvent(eventType: string, templateName: string): void {
    for (const [name, window] of this.windows.entries()) {
      if (name !== templateName && !window.isDestroyed()) {
        window.webContents.send('window-event', { type: eventType, window: templateName });
      }
    }
  }

  /**
   * Load window states from disk
   */
  private loadWindowStates(): void {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const data = fs.readFileSync(this.stateFilePath, 'utf8');
        const states = JSON.parse(data);
        
        for (const [name, state] of Object.entries(states)) {
          this.windowStates.set(name, state as WindowState);
        }
        
        console.log(`Loaded window states for ${this.windowStates.size} windows`);
      }
    } catch (error) {
      console.error('Failed to load window states:', error);
    }
  }

  /**
   * Save window states to disk
   */
  private saveWindowStatesToDisk(): void {
    try {
      const states: Record<string, WindowState> = {};
      
      for (const [name, state] of this.windowStates.entries()) {
        states[name] = state;
      }
      
      fs.writeFileSync(this.stateFilePath, JSON.stringify(states, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save window states:', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Save all window states
    for (const [templateName, window] of this.windows.entries()) {
      if (!window.isDestroyed()) {
        this.saveWindowState(window, templateName);
      }
    }

    // Clear references
    this.windows.clear();
    this.windowStates.clear();
  }
}