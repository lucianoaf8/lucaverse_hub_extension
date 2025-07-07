/**
 * Electron Menu Builder
 * Creates platform-specific menus and handles system integration
 */

import { Menu, MenuItem, BrowserWindow, app, shell, dialog, Tray, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import isDev from 'electron-is-dev';

export class MenuBuilder {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private isMenuBuilt = false;

  constructor() {
    this.setupApplicationMenu();
  }

  /**
   * Build the main application menu
   */
  buildMenu(mainWindow: BrowserWindow): Menu {
    this.mainWindow = mainWindow;
    
    if (isDev) {
      this.setupDevelopmentEnvironment();
    }

    const template = this.buildMenuTemplate();
    const menu = Menu.buildFromTemplate(template);
    
    Menu.setApplicationMenu(menu);
    this.isMenuBuilt = true;
    
    console.log('Application menu built successfully');
    return menu;
  }

  /**
   * Setup development environment
   */
  private setupDevelopmentEnvironment(): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.on('context-menu', (event, props) => {
        const { x, y } = props;
        
        Menu.buildFromTemplate([
          {
            label: 'Inspect Element',
            click: () => {
              this.mainWindow?.webContents.inspectElement(x, y);
            },
          },
        ]).popup({ window: this.mainWindow! });
      });
    }
  }

  /**
   * Build platform-specific menu template
   */
  private buildMenuTemplate(): Electron.MenuItemConstructorOptions[] {
    if (process.platform === 'darwin') {
      return this.buildDarwinTemplate();
    } else {
      return this.buildDefaultTemplate();
    }
  }

  /**
   * Build macOS menu template
   */
  private buildDarwinTemplate(): Electron.MenuItemConstructorOptions[] {
    const subMenuAbout: Electron.MenuItemConstructorOptions = {
      label: 'Lucaverse Hub',
      submenu: [
        {
          label: 'About Lucaverse Hub',
          click: () => this.showAboutDialog(),
        },
        { type: 'separator' },
        {
          label: 'Services',
          submenu: [],
        },
        { type: 'separator' },
        {
          label: 'Hide Lucaverse Hub',
          accelerator: 'Command+H',
          click: () => app.hide(),
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          click: () => app.hideOthers(),
        },
        {
          label: 'Show All',
          click: () => app.showAll(),
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => app.quit(),
        },
      ],
    };

    const subMenuFile: Electron.MenuItemConstructorOptions = {
      label: 'File',
      submenu: [
        {
          label: 'New Workspace',
          accelerator: 'Command+N',
          click: () => this.sendToRenderer('menu:new-workspace'),
        },
        {
          label: 'Open Workspace...',
          accelerator: 'Command+O',
          click: () => this.openWorkspace(),
        },
        {
          label: 'Save Workspace',
          accelerator: 'Command+S',
          click: () => this.sendToRenderer('menu:save-workspace'),
        },
        {
          label: 'Save Workspace As...',
          accelerator: 'Command+Shift+S',
          click: () => this.saveWorkspaceAs(),
        },
        { type: 'separator' },
        {
          label: 'Import...',
          click: () => this.importData(),
        },
        {
          label: 'Export...',
          click: () => this.exportData(),
        },
        { type: 'separator' },
        {
          label: 'Close Window',
          accelerator: 'Command+W',
          click: () => this.mainWindow?.close(),
        },
      ],
    };

    const subMenuEdit: Electron.MenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          click: () => this.sendToRenderer('menu:undo'),
        },
        {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          click: () => this.sendToRenderer('menu:redo'),
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          role: 'cut',
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          role: 'copy',
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          role: 'paste',
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          role: 'selectAll',
        },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'Command+F',
          click: () => this.sendToRenderer('menu:find'),
        },
        {
          label: 'Find and Replace',
          accelerator: 'Command+Option+F',
          click: () => this.sendToRenderer('menu:find-replace'),
        },
      ],
    };

    const subMenuView: Electron.MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => this.mainWindow?.reload(),
        },
        {
          label: 'Force Reload',
          accelerator: 'Command+Shift+R',
          click: () => this.mainWindow?.webContents.reloadIgnoringCache(),
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => this.mainWindow?.webContents.toggleDevTools(),
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'Command+0',
          click: () => this.mainWindow?.webContents.setZoomFactor(1),
        },
        {
          label: 'Zoom In',
          accelerator: 'Command+Plus',
          click: () => this.zoomIn(),
        },
        {
          label: 'Zoom Out',
          accelerator: 'Command+-',
          click: () => this.zoomOut(),
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            const isFullScreen = this.mainWindow?.isFullScreen();
            this.mainWindow?.setFullScreen(!isFullScreen);
          },
        },
        { type: 'separator' },
        {
          label: 'Show Grid',
          type: 'checkbox',
          click: () => this.sendToRenderer('menu:toggle-grid'),
        },
        {
          label: 'Snap to Grid',
          type: 'checkbox',
          click: () => this.sendToRenderer('menu:toggle-snap'),
        },
      ],
    };

    const subMenuPanels: Electron.MenuItemConstructorOptions = {
      label: 'Panels',
      submenu: [
        {
          label: 'Add Panel',
          submenu: [
            {
              label: 'Smart Bookmarks',
              click: () => this.sendToRenderer('menu:add-panel', 'smart-bookmarks'),
            },
            {
              label: 'AI Chat',
              click: () => this.sendToRenderer('menu:add-panel', 'ai-chat'),
            },
            {
              label: 'Task Manager',
              click: () => this.sendToRenderer('menu:add-panel', 'task-manager'),
            },
            {
              label: 'Productivity Tools',
              click: () => this.sendToRenderer('menu:add-panel', 'productivity'),
            },
          ],
        },
        { type: 'separator' },
        {
          label: 'Select All Panels',
          accelerator: 'Command+A',
          click: () => this.sendToRenderer('menu:select-all-panels'),
        },
        {
          label: 'Clear Selection',
          accelerator: 'Escape',
          click: () => this.sendToRenderer('menu:clear-selection'),
        },
        { type: 'separator' },
        {
          label: 'Lock All Panels',
          click: () => this.sendToRenderer('menu:lock-all-panels'),
        },
        {
          label: 'Unlock All Panels',
          click: () => this.sendToRenderer('menu:unlock-all-panels'),
        },
        { type: 'separator' },
        {
          label: 'Reset Layout',
          click: () => this.resetLayout(),
        },
      ],
    };

    const subMenuWindow: Electron.MenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          role: 'minimize',
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          role: 'close',
        },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          role: 'front',
        },
      ],
    };

    const subMenuHelp: Electron.MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click: () => shell.openExternal('https://lucaverse.com'),
        },
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://docs.lucaverse.com'),
        },
        {
          label: 'Community',
          click: () => shell.openExternal('https://community.lucaverse.com'),
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => shell.openExternal('https://github.com/lucaverse/hub/issues'),
        },
        {
          label: 'Feature Request',
          click: () => shell.openExternal('https://github.com/lucaverse/hub/discussions'),
        },
        { type: 'separator' },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'Command+/',
          click: () => this.showShortcuts(),
        },
        {
          label: 'Check for Updates...',
          click: () => this.checkForUpdates(),
        },
      ],
    };

    return [
      subMenuAbout,
      subMenuFile,
      subMenuEdit,
      subMenuView,
      subMenuPanels,
      subMenuWindow,
      subMenuHelp,
    ];
  }

  /**
   * Build default (Windows/Linux) menu template
   */
  private buildDefaultTemplate(): Electron.MenuItemConstructorOptions[] {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: '&New Workspace',
            accelerator: 'Ctrl+N',
            click: () => this.sendToRenderer('menu:new-workspace'),
          },
          {
            label: '&Open Workspace...',
            accelerator: 'Ctrl+O',
            click: () => this.openWorkspace(),
          },
          {
            label: '&Save Workspace',
            accelerator: 'Ctrl+S',
            click: () => this.sendToRenderer('menu:save-workspace'),
          },
          {
            label: 'Save Workspace &As...',
            accelerator: 'Ctrl+Shift+S',
            click: () => this.saveWorkspaceAs(),
          },
          { type: 'separator' },
          {
            label: '&Import...',
            click: () => this.importData(),
          },
          {
            label: '&Export...',
            click: () => this.exportData(),
          },
          { type: 'separator' },
          {
            label: '&Quit',
            accelerator: 'Ctrl+Q',
            click: () => app.quit(),
          },
        ],
      },
      {
        label: '&Edit',
        submenu: [
          {
            label: '&Undo',
            accelerator: 'Ctrl+Z',
            click: () => this.sendToRenderer('menu:undo'),
          },
          {
            label: '&Redo',
            accelerator: 'Ctrl+Y',
            click: () => this.sendToRenderer('menu:redo'),
          },
          { type: 'separator' },
          {
            label: 'Cu&t',
            accelerator: 'Ctrl+X',
            role: 'cut',
          },
          {
            label: '&Copy',
            accelerator: 'Ctrl+C',
            role: 'copy',
          },
          {
            label: '&Paste',
            accelerator: 'Ctrl+V',
            role: 'paste',
          },
          {
            label: 'Select &All',
            accelerator: 'Ctrl+A',
            role: 'selectAll',
          },
          { type: 'separator' },
          {
            label: '&Find',
            accelerator: 'Ctrl+F',
            click: () => this.sendToRenderer('menu:find'),
          },
        ],
      },
      {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: () => this.mainWindow?.reload(),
          },
          {
            label: '&Force Reload',
            accelerator: 'Ctrl+Shift+R',
            click: () => this.mainWindow?.webContents.reloadIgnoringCache(),
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'F12',
            click: () => this.mainWindow?.webContents.toggleDevTools(),
          },
          { type: 'separator' },
          {
            label: 'Actual &Size',
            accelerator: 'Ctrl+0',
            click: () => this.mainWindow?.webContents.setZoomFactor(1),
          },
          {
            label: 'Zoom &In',
            accelerator: 'Ctrl+Plus',
            click: () => this.zoomIn(),
          },
          {
            label: 'Zoom &Out',
            accelerator: 'Ctrl+-',
            click: () => this.zoomOut(),
          },
          { type: 'separator' },
          {
            label: '&Fullscreen',
            accelerator: 'F11',
            click: () => {
              const isFullScreen = this.mainWindow?.isFullScreen();
              this.mainWindow?.setFullScreen(!isFullScreen);
            },
          },
        ],
      },
      {
        label: '&Panels',
        submenu: [
          {
            label: '&Add Panel',
            submenu: [
              {
                label: '&Smart Bookmarks',
                click: () => this.sendToRenderer('menu:add-panel', 'smart-bookmarks'),
              },
              {
                label: '&AI Chat',
                click: () => this.sendToRenderer('menu:add-panel', 'ai-chat'),
              },
              {
                label: '&Task Manager',
                click: () => this.sendToRenderer('menu:add-panel', 'task-manager'),
              },
              {
                label: '&Productivity Tools',
                click: () => this.sendToRenderer('menu:add-panel', 'productivity'),
              },
            ],
          },
          { type: 'separator' },
          {
            label: '&Reset Layout',
            click: () => this.resetLayout(),
          },
        ],
      },
      {
        label: '&Help',
        submenu: [
          {
            label: '&About',
            click: () => this.showAboutDialog(),
          },
          { type: 'separator' },
          {
            label: '&Learn More',
            click: () => shell.openExternal('https://lucaverse.com'),
          },
          {
            label: '&Documentation',
            click: () => shell.openExternal('https://docs.lucaverse.com'),
          },
          { type: 'separator' },
          {
            label: '&Keyboard Shortcuts',
            accelerator: 'Ctrl+/',
            click: () => this.showShortcuts(),
          },
        ],
      },
    ];

    return templateDefault;
  }

  /**
   * Setup system tray
   */
  setupTray(): void {
    const iconPath = this.getTrayIconPath();
    if (!iconPath || !fs.existsSync(iconPath)) {
      console.log('Tray icon not found, skipping tray setup');
      return;
    }

    try {
      const icon = nativeImage.createFromPath(iconPath);
      this.tray = new Tray(icon);

      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Show Lucaverse Hub',
          click: () => {
            this.mainWindow?.show();
            this.mainWindow?.focus();
          },
        },
        { type: 'separator' },
        {
          label: 'New Workspace',
          click: () => this.sendToRenderer('menu:new-workspace'),
        },
        {
          label: 'Quick Add Task',
          click: () => this.sendToRenderer('menu:quick-add-task'),
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          click: () => this.sendToRenderer('menu:preferences'),
        },
        { type: 'separator' },
        {
          label: 'Quit Lucaverse Hub',
          click: () => app.quit(),
        },
      ]);

      this.tray.setContextMenu(contextMenu);
      this.tray.setToolTip('Lucaverse Hub - Productivity Dashboard');

      // Handle tray click
      this.tray.on('click', () => {
        if (this.mainWindow?.isVisible()) {
          this.mainWindow.hide();
        } else {
          this.mainWindow?.show();
          this.mainWindow?.focus();
        }
      });

      console.log('System tray setup completed');
    } catch (error) {
      console.error('Failed to setup system tray:', error);
    }
  }

  /**
   * Get tray icon path based on platform
   */
  private getTrayIconPath(): string | null {
    const iconDir = path.join(__dirname, '../assets/icons');
    
    if (process.platform === 'win32') {
      return path.join(iconDir, 'tray-icon.ico');
    } else if (process.platform === 'darwin') {
      return path.join(iconDir, 'tray-iconTemplate.png');
    } else {
      return path.join(iconDir, 'tray-icon.png');
    }
  }

  /**
   * Send message to renderer process
   */
  private sendToRenderer(channel: string, data?: any): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  /**
   * Menu action implementations
   */
  private async showAboutDialog(): Promise<void> {
    const options = {
      type: 'info' as const,
      title: 'About Lucaverse Hub',
      message: 'Lucaverse Hub',
      detail: `Version: ${app.getVersion()}\nElectron: ${process.versions.electron}\nNode.js: ${process.versions.node}\nPlatform: ${process.platform} ${process.arch}`,
      buttons: ['OK'],
      icon: this.getAppIcon(),
    };

    await dialog.showMessageBox(this.mainWindow!, options);
  }

  private async openWorkspace(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      title: 'Open Workspace',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'Lucaverse Workspace', extensions: ['lvw'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      this.sendToRenderer('menu:open-workspace', result.filePaths[0]);
    }
  }

  private async saveWorkspaceAs(): Promise<void> {
    const result = await dialog.showSaveDialog(this.mainWindow!, {
      title: 'Save Workspace As',
      defaultPath: path.join(app.getPath('documents'), 'workspace.lvw'),
      filters: [
        { name: 'Lucaverse Workspace', extensions: ['lvw'] },
        { name: 'JSON Files', extensions: ['json'] },
      ],
    });

    if (!result.canceled && result.filePath) {
      this.sendToRenderer('menu:save-workspace-as', result.filePath);
    }
  }

  private async importData(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow!, {
      title: 'Import Data',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'multiSelections'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
      this.sendToRenderer('menu:import-data', result.filePaths);
    }
  }

  private async exportData(): Promise<void> {
    const result = await dialog.showSaveDialog(this.mainWindow!, {
      title: 'Export Data',
      defaultPath: path.join(app.getPath('documents'), 'lucaverse-export.json'),
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'CSV Files', extensions: ['csv'] },
      ],
    });

    if (!result.canceled && result.filePath) {
      this.sendToRenderer('menu:export-data', result.filePath);
    }
  }

  private async resetLayout(): Promise<void> {
    const result = await dialog.showMessageBox(this.mainWindow!, {
      type: 'warning',
      title: 'Reset Layout',
      message: 'Are you sure you want to reset the layout?',
      detail: 'This will remove all panels and restore the default layout. This action cannot be undone.',
      buttons: ['Reset Layout', 'Cancel'],
      defaultId: 1,
      cancelId: 1,
    });

    if (result.response === 0) {
      this.sendToRenderer('menu:reset-layout');
    }
  }

  private zoomIn(): void {
    if (this.mainWindow) {
      const currentZoom = this.mainWindow.webContents.getZoomFactor();
      this.mainWindow.webContents.setZoomFactor(Math.min(currentZoom + 0.1, 3.0));
    }
  }

  private zoomOut(): void {
    if (this.mainWindow) {
      const currentZoom = this.mainWindow.webContents.getZoomFactor();
      this.mainWindow.webContents.setZoomFactor(Math.max(currentZoom - 0.1, 0.5));
    }
  }

  private showShortcuts(): void {
    this.sendToRenderer('menu:show-shortcuts');
  }

  private checkForUpdates(): void {
    this.sendToRenderer('menu:check-updates');
  }

  private getAppIcon(): string | undefined {
    const iconDir = path.join(__dirname, '../assets/icons');
    return path.join(iconDir, 'icon.png');
  }

  /**
   * Setup application menu
   */
  private setupApplicationMenu(): void {
    // This will be called when buildMenu is invoked
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}