/**
 * Electron Main Process
 * Handles window creation, lifecycle management, and native system integration
 */

import { app, BrowserWindow, Menu, ipcMain, dialog, shell, nativeTheme, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import isDev from 'electron-is-dev';
import { WindowManager } from './windowManager';
import { MenuBuilder } from './menuBuilder';
import { ElectronUtils } from './utils';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let windowManager: WindowManager;
let menuBuilder: MenuBuilder;
let electronUtils: ElectronUtils;

// App configuration
const APP_CONFIG = {
  name: 'Lucaverse Hub',
  version: app.getVersion(),
  minWidth: 1200,
  minHeight: 800,
  defaultWidth: 1400,
  defaultHeight: 900,
  preloadScript: path.join(__dirname, 'preload.js'),
  devServerUrl: 'http://localhost:5173',
  prodAppPath: path.join(__dirname, '../dist/electron/index.html'),
};

/**
 * Create the main application window
 */
async function createMainWindow(): Promise<BrowserWindow> {
  console.log('Creating main window...');

  // Get display information for optimal window positioning
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Calculate centered position
  const windowWidth = Math.min(APP_CONFIG.defaultWidth, screenWidth - 100);
  const windowHeight = Math.min(APP_CONFIG.defaultHeight, screenHeight - 100);
  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  // Create the browser window with optimized settings
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x,
    y,
    minWidth: APP_CONFIG.minWidth,
    minHeight: APP_CONFIG.minHeight,
    show: false, // Don't show until ready
    frame: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 20, y: 15 },
    
    // Web preferences for security and performance
    webPreferences: {
      nodeIntegration: false, // Security: disable node integration
      contextIsolation: true, // Security: enable context isolation
      enableRemoteModule: false, // Security: disable remote module
      sandbox: false, // Allow preload script access
      preload: APP_CONFIG.preloadScript,
      webSecurity: !isDev, // Disable web security in development
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      spellcheck: true,
      backgroundThrottling: false, // Keep background tabs active
    },

    // Window styling
    backgroundColor: '#1F2937', // Dark theme background
    darkTheme: true,
    vibrancy: process.platform === 'darwin' ? 'ultra-dark' : undefined,
    transparent: false,
    resizable: true,
    fullscreenable: true,
    maximizable: true,
    minimizable: true,
    closable: true,

    // macOS specific settings
    ...(process.platform === 'darwin' && {
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 20, y: 15 },
    }),

    // Window icon
    icon: getAppIcon(),
  });

  // Window state management
  await windowManager.restoreWindowState(mainWindow);

  // Load the application
  await loadApplication(mainWindow);

  // Setup window event handlers
  setupWindowEvents(mainWindow);

  // Setup window ready handler
  mainWindow.once('ready-to-show', () => {
    console.log('Main window ready to show');
    mainWindow?.show();
    
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
    
    // Focus the window
    mainWindow?.focus();
  });

  return mainWindow;
}

/**
 * Load the application content
 */
async function loadApplication(window: BrowserWindow): Promise<void> {
  try {
    if (isDev) {
      // Development: Load from dev server
      await window.loadURL(APP_CONFIG.devServerUrl);
    } else {
      // Production: Load from built files
      await window.loadFile(APP_CONFIG.prodAppPath);
    }
  } catch (error) {
    console.error('Failed to load application:', error);
    
    // Fallback: Show error page
    await window.loadURL(`data:text/html,
      <html>
        <head><title>Error Loading Application</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #1F2937; color: white;">
          <h1>Failed to Load Application</h1>
          <p>Error: ${error}</p>
          <p>Please restart the application or contact support.</p>
        </body>
      </html>
    `);
  }
}

/**
 * Setup window event handlers
 */
function setupWindowEvents(window: BrowserWindow): void {
  // Save window state on resize and move
  window.on('resize', () => windowManager.saveWindowState(window));
  window.on('move', () => windowManager.saveWindowState(window));
  window.on('maximize', () => windowManager.saveWindowState(window));
  window.on('unmaximize', () => windowManager.saveWindowState(window));

  // Handle window closed
  window.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Security: Prevent navigation to external URLs
  window.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!isDev && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Handle zoom changes
  window.webContents.on('zoom-changed', (event, zoomDirection) => {
    const currentZoom = window.webContents.getZoomFactor();
    const newZoom = zoomDirection === 'in' ? currentZoom + 0.1 : currentZoom - 0.1;
    window.webContents.setZoomFactor(Math.max(0.5, Math.min(3.0, newZoom)));
  });

  // Development specific events
  if (isDev) {
    window.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('Failed to load:', errorCode, errorDescription, validatedURL);
    });
  }
}

/**
 * Get application icon based on platform
 */
function getAppIcon(): string | undefined {
  const iconPath = path.join(__dirname, '../assets/icons');
  
  if (process.platform === 'win32') {
    return path.join(iconPath, 'icon.ico');
  } else if (process.platform === 'darwin') {
    return path.join(iconPath, 'icon.icns');
  } else {
    return path.join(iconPath, 'icon.png');
  }
}

/**
 * Setup IPC handlers for communication with renderer process
 */
function setupIpcHandlers(): void {
  console.log('Setting up IPC handlers...');

  // Window management
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.handle('window:fullscreen', () => {
    const isFullScreen = mainWindow?.isFullScreen();
    mainWindow?.setFullScreen(!isFullScreen);
    return !isFullScreen;
  });

  ipcMain.handle('window:get-bounds', () => {
    return mainWindow?.getBounds();
  });

  ipcMain.handle('window:set-bounds', (event, bounds) => {
    mainWindow?.setBounds(bounds);
  });

  // System information
  ipcMain.handle('system:get-platform-info', () => {
    return electronUtils.getPlatformInfo();
  });

  ipcMain.handle('system:get-system-theme', () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });

  // File system operations
  ipcMain.handle('fs:show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow!, options);
    return result;
  });

  ipcMain.handle('fs:show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow!, options);
    return result;
  });

  ipcMain.handle('fs:read-file', async (event, filePath) => {
    return electronUtils.readFile(filePath);
  });

  ipcMain.handle('fs:write-file', async (event, filePath, content) => {
    return electronUtils.writeFile(filePath, content);
  });

  // Storage operations
  ipcMain.handle('storage:get', (event, key) => {
    return electronUtils.getStorageItem(key);
  });

  ipcMain.handle('storage:set', (event, key, value) => {
    return electronUtils.setStorageItem(key, value);
  });

  ipcMain.handle('storage:remove', (event, key) => {
    return electronUtils.removeStorageItem(key);
  });

  ipcMain.handle('storage:clear', () => {
    return electronUtils.clearStorage();
  });

  // Clipboard operations
  ipcMain.handle('clipboard:read-text', () => {
    return electronUtils.readClipboardText();
  });

  ipcMain.handle('clipboard:write-text', (event, text) => {
    return electronUtils.writeClipboardText(text);
  });

  // Notification operations
  ipcMain.handle('notification:show', (event, options) => {
    return electronUtils.showNotification(options);
  });
}

/**
 * Setup auto-updater
 */
function setupAutoUpdater(): void {
  if (isDev) {
    console.log('Auto-updater disabled in development mode');
    return;
  }

  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info);
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
    logMessage += ` - Downloaded ${progressObj.percent}%`;
    logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
    console.log(logMessage);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info);
    autoUpdater.quitAndInstall();
  });
}

/**
 * Initialize application managers
 */
function initializeManagers(): void {
  windowManager = new WindowManager();
  menuBuilder = new MenuBuilder();
  electronUtils = new ElectronUtils();
}

/**
 * App event handlers
 */

// App is ready
app.whenReady().then(async () => {
  console.log('Electron app ready');
  
  // Initialize managers
  initializeManagers();
  
  // Setup IPC handlers
  setupIpcHandlers();
  
  // Setup auto-updater
  setupAutoUpdater();
  
  // Create main window
  await createMainWindow();
  
  // Setup native menus
  menuBuilder.buildMenu(mainWindow!);
  
  // macOS specific: Create window on activate if none exists
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

// All windows closed
app.on('window-all-closed', () => {
  // macOS: Keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// App is about to quit
app.on('before-quit', (event) => {
  console.log('App about to quit');
  
  // Save window state
  if (mainWindow) {
    windowManager.saveWindowState(mainWindow);
  }
  
  // Cleanup
  electronUtils.cleanup();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});

// Disable hardware acceleration if needed (can help with graphics issues)
if (process.platform === 'linux') {
  app.disableHardwareAcceleration();
}

// Set app user model ID for Windows
if (process.platform === 'win32') {
  app.setAppUserModelId('com.lucaverse.hub');
}

// Export for testing
export {
  createMainWindow,
  setupIpcHandlers,
  APP_CONFIG,
};