/**
 * Electron Utilities
 * Platform detection, file operations, storage, and system integration utilities
 */

import { app, Notification, clipboard, nativeImage, crashReporter } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { autoUpdater } from 'electron-updater';

// Platform information interface
export interface PlatformInfo {
  platform: NodeJS.Platform;
  arch: string;
  version: string;
  release: string;
  hostname: string;
  username: string;
  homedir: string;
  tmpdir: string;
  electron: string;
  chrome: string;
  node: string;
}

// Storage item interface
interface StorageItem {
  value: any;
  encrypted: boolean;
  timestamp: number;
  checksum?: string;
}

// Performance metrics interface
interface PerformanceMetrics {
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  timestamp: number;
}

export class ElectronUtils {
  private storagePath: string;
  private encryptionKey: string;
  private performanceInterval: NodeJS.Timeout | null = null;
  private performanceMetrics: PerformanceMetrics[] = [];

  constructor() {
    this.storagePath = path.join(app.getPath('userData'), 'storage.json');
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.initializeCrashReporter();
    this.initializeAutoUpdater();
  }

  /**
   * Platform Detection Utilities
   */

  /**
   * Get comprehensive platform information
   */
  getPlatformInfo(): PlatformInfo {
    return {
      platform: process.platform,
      arch: process.arch,
      version: os.version(),
      release: os.release(),
      hostname: os.hostname(),
      username: os.userInfo().username,
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
    };
  }

  /**
   * Check if running on Windows
   */
  isWindows(): boolean {
    return process.platform === 'win32';
  }

  /**
   * Check if running on macOS
   */
  isMacOS(): boolean {
    return process.platform === 'darwin';
  }

  /**
   * Check if running on Linux
   */
  isLinux(): boolean {
    return process.platform === 'linux';
  }

  /**
   * Get system theme preference
   */
  getSystemTheme(): 'light' | 'dark' {
    // This would typically use nativeTheme, but we'll implement a basic version
    if (this.isMacOS()) {
      // On macOS, check system preference
      try {
        const { execSync } = require('child_process');
        const result = execSync('defaults read -g AppleInterfaceStyle', { encoding: 'utf8' });
        return result.trim().toLowerCase() === 'dark' ? 'dark' : 'light';
      } catch {
        return 'light'; // Default to light if can't determine
      }
    } else if (this.isWindows()) {
      // On Windows, check registry for theme preference
      try {
        const { execSync } = require('child_process');
        const result = execSync('reg query "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme', { encoding: 'utf8' });
        return result.includes('0x0') ? 'dark' : 'light';
      } catch {
        return 'light';
      }
    } else {
      // On Linux, try to detect theme from environment
      const theme = process.env.GTK_THEME || process.env.QT_STYLE_OVERRIDE || '';
      return theme.toLowerCase().includes('dark') ? 'dark' : 'light';
    }
  }

  /**
   * File System Operations
   */

  /**
   * Read file with proper error handling
   */
  async readFile(filePath: string): Promise<string> {
    try {
      // Security check: ensure file is within allowed directories
      if (!this.isPathSafe(filePath)) {
        throw new Error('Access denied: path is outside allowed directories');
      }

      const data = await fs.promises.readFile(filePath, 'utf8');
      return data;
    } catch (error) {
      console.error('Failed to read file:', error);
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Write file with proper error handling
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // Security check: ensure file is within allowed directories
      if (!this.isPathSafe(filePath)) {
        throw new Error('Access denied: path is outside allowed directories');
      }

      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.promises.mkdir(dir, { recursive: true });

      await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
      console.error('Failed to write file:', error);
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file stats
   */
  async getFileStats(filePath: string): Promise<fs.Stats> {
    try {
      if (!this.isPathSafe(filePath)) {
        throw new Error('Access denied: path is outside allowed directories');
      }

      return await fs.promises.stat(filePath);
    } catch (error) {
      console.error('Failed to get file stats:', error);
      throw new Error(`Failed to get file stats: ${error}`);
    }
  }

  /**
   * Security check for file paths
   */
  private isPathSafe(filePath: string): boolean {
    const resolvedPath = path.resolve(filePath);
    const allowedDirs = [
      app.getPath('userData'),
      app.getPath('documents'),
      app.getPath('downloads'),
      app.getPath('desktop'),
    ];

    return allowedDirs.some(dir => resolvedPath.startsWith(path.resolve(dir)));
  }

  /**
   * Secure Storage Operations
   */

  /**
   * Get storage item
   */
  async getStorageItem(key: string): Promise<any> {
    try {
      const storage = await this.loadStorage();
      const item = storage[key] as StorageItem;

      if (!item) return null;

      // Verify checksum if available
      if (item.checksum) {
        const currentChecksum = this.calculateChecksum(JSON.stringify(item.value));
        if (currentChecksum !== item.checksum) {
          console.warn(`Checksum mismatch for storage item: ${key}`);
          return null;
        }
      }

      // Decrypt if encrypted
      if (item.encrypted) {
        return this.decrypt(item.value);
      }

      return item.value;
    } catch (error) {
      console.error('Failed to get storage item:', error);
      return null;
    }
  }

  /**
   * Set storage item
   */
  async setStorageItem(key: string, value: any, encrypt = false): Promise<void> {
    try {
      const storage = await this.loadStorage();
      
      let processedValue = value;
      
      // Encrypt if requested
      if (encrypt) {
        processedValue = this.encrypt(value);
      }

      // Create storage item
      const item: StorageItem = {
        value: processedValue,
        encrypted: encrypt,
        timestamp: Date.now(),
        checksum: this.calculateChecksum(JSON.stringify(processedValue)),
      };

      storage[key] = item;
      await this.saveStorage(storage);
    } catch (error) {
      console.error('Failed to set storage item:', error);
      throw new Error(`Failed to set storage item: ${error}`);
    }
  }

  /**
   * Remove storage item
   */
  async removeStorageItem(key: string): Promise<void> {
    try {
      const storage = await this.loadStorage();
      delete storage[key];
      await this.saveStorage(storage);
    } catch (error) {
      console.error('Failed to remove storage item:', error);
      throw new Error(`Failed to remove storage item: ${error}`);
    }
  }

  /**
   * Clear all storage
   */
  async clearStorage(): Promise<void> {
    try {
      await this.saveStorage({});
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }

  /**
   * Load storage from disk
   */
  private async loadStorage(): Promise<Record<string, StorageItem>> {
    try {
      if (await this.fileExists(this.storagePath)) {
        const data = await fs.promises.readFile(this.storagePath, 'utf8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      console.error('Failed to load storage:', error);
      return {};
    }
  }

  /**
   * Save storage to disk
   */
  private async saveStorage(storage: Record<string, StorageItem>): Promise<void> {
    try {
      const data = JSON.stringify(storage, null, 2);
      await fs.promises.writeFile(this.storagePath, data, 'utf8');
    } catch (error) {
      console.error('Failed to save storage:', error);
      throw error;
    }
  }

  /**
   * Encryption/Decryption utilities
   */

  /**
   * Get or create encryption key
   */
  private getOrCreateEncryptionKey(): string {
    const keyPath = path.join(app.getPath('userData'), '.encryption-key');
    
    try {
      if (fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, 'utf8');
      } else {
        const key = crypto.randomBytes(32).toString('hex');
        fs.writeFileSync(keyPath, key, 'utf8');
        return key;
      }
    } catch (error) {
      console.error('Failed to handle encryption key:', error);
      // Fallback to a default key (not secure, but allows operation)
      return crypto.createHash('sha256').update(app.getName()).digest('hex');
    }
  }

  /**
   * Encrypt data
   */
  private encrypt(data: any): string {
    try {
      const text = JSON.stringify(data);
      const algorithm = 'aes-256-cbc';
      const key = Buffer.from(this.encryptionKey, 'hex');
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipher(algorithm, key);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data
   */
  private decrypt(encryptedData: string): any {
    try {
      const algorithm = 'aes-256-cbc';
      const key = Buffer.from(this.encryptionKey, 'hex');
      
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, key);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Calculate checksum for data integrity
   */
  private calculateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Clipboard Operations
   */

  /**
   * Read text from clipboard
   */
  readClipboardText(): string {
    try {
      return clipboard.readText();
    } catch (error) {
      console.error('Failed to read clipboard text:', error);
      return '';
    }
  }

  /**
   * Write text to clipboard
   */
  writeClipboardText(text: string): void {
    try {
      clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to write clipboard text:', error);
      throw new Error('Failed to write to clipboard');
    }
  }

  /**
   * Read image from clipboard
   */
  readClipboardImage(): Electron.NativeImage | null {
    try {
      return clipboard.readImage();
    } catch (error) {
      console.error('Failed to read clipboard image:', error);
      return null;
    }
  }

  /**
   * Write image to clipboard
   */
  writeClipboardImage(image: Electron.NativeImage): void {
    try {
      clipboard.writeImage(image);
    } catch (error) {
      console.error('Failed to write clipboard image:', error);
      throw new Error('Failed to write image to clipboard');
    }
  }

  /**
   * Notification System
   */

  /**
   * Show system notification
   */
  async showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    silent?: boolean;
    tag?: string;
  }): Promise<void> {
    try {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon,
        silent: options.silent || false,
      });

      notification.show();
    } catch (error) {
      console.error('Failed to show notification:', error);
      throw new Error('Failed to show notification');
    }
  }

  /**
   * Performance Monitoring
   */

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring(interval = 5000): void {
    if (this.performanceInterval) {
      this.stopPerformanceMonitoring();
    }

    this.performanceInterval = setInterval(() => {
      const metrics = this.collectPerformanceMetrics();
      this.performanceMetrics.push(metrics);

      // Keep only last 100 entries
      if (this.performanceMetrics.length > 100) {
        this.performanceMetrics = this.performanceMetrics.slice(-100);
      }
    }, interval);

    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring(): void {
    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
      this.performanceInterval = null;
      console.log('Performance monitoring stopped');
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * Collect current performance metrics
   */
  private collectPerformanceMetrics(): PerformanceMetrics {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  }

  /**
   * Auto-Updater Integration
   */

  /**
   * Initialize auto-updater
   */
  private initializeAutoUpdater(): void {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Setup event listeners
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info);
    });

    autoUpdater.on('update-not-available', () => {
      console.log('Update not available');
    });

    autoUpdater.on('error', (err) => {
      console.error('Auto-updater error:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      console.log(`Download progress: ${progressObj.percent}%`);
    });

    autoUpdater.on('update-downloaded', () => {
      console.log('Update downloaded');
    });
  }

  /**
   * Check for application updates
   */
  async checkForUpdates(): Promise<void> {
    try {
      await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  /**
   * Crash Reporter
   */

  /**
   * Initialize crash reporter
   */
  private initializeCrashReporter(): void {
    try {
      crashReporter.start({
        productName: 'Lucaverse Hub',
        companyName: 'Lucaverse',
        submitURL: 'https://api.lucaverse.com/crashes', // Replace with actual URL
        uploadToServer: false, // Set to true when you have a crash server
        extra: {
          version: app.getVersion(),
          platform: process.platform,
          arch: process.arch,
        },
      });

      console.log('Crash reporter initialized');
    } catch (error) {
      console.error('Failed to initialize crash reporter:', error);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopPerformanceMonitoring();
    this.performanceMetrics = [];
    console.log('Electron utilities cleaned up');
  }

  /**
   * Get application paths
   */
  getAppPaths() {
    return {
      userData: app.getPath('userData'),
      documents: app.getPath('documents'),
      downloads: app.getPath('downloads'),
      desktop: app.getPath('desktop'),
      temp: app.getPath('temp'),
      appData: app.getPath('appData'),
      exe: app.getPath('exe'),
      logs: app.getPath('logs'),
    };
  }

  /**
   * Memory usage information
   */
  getMemoryUsage() {
    return {
      system: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
      },
      process: process.memoryUsage(),
    };
  }
}