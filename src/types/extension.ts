/**
 * Chrome Extension Types and Interfaces
 * Defines types for extension-specific functionality and messaging
 */

import { PanelLayout, WorkspaceConfig } from './panel';

// Extension message types
export interface ExtensionMessage {
  action: string;
  data?: any;
  timestamp?: number;
  source?: 'popup' | 'options' | 'content' | 'background' | 'newtab';
}

// Extension message responses
export interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: number;
}

// Storage data types
export interface StorageData {
  [key: string]: any;
}

// Extension state
export interface ExtensionState {
  isInitialized: boolean;
  activeWorkspace: WorkspaceConfig | null;
  lastSyncTime: number;
  pendingOperations: Map<string, any>;
  version: string;
}

// Extension settings
export interface ExtensionSettings {
  autoSyncEnabled: boolean;
  notificationsEnabled: boolean;
  newTabOverride: boolean;
  syncInterval: number;
  theme: 'dark' | 'light' | 'auto';
  debugMode: boolean;
  version: string;
}

// Storage quota information
export interface StorageQuota {
  bytesInUse: number;
  quotaBytes: number;
  itemCount: number;
  percentageUsed: number;
}

// Extension permissions
export interface ExtensionPermissions {
  storage: boolean;
  tabs: boolean;
  activeTab: boolean;
  notifications: boolean;
  alarms: boolean;
  contextMenus: boolean;
  bookmarks: boolean;
  history: boolean;
  scripting: boolean;
  unlimitedStorage: boolean;
}

// Context menu data
export interface ContextMenuData {
  menuItemId: string;
  selectedText?: string;
  linkUrl?: string;
  pageUrl?: string;
  frameUrl?: string;
  mediaType?: string;
}

// Page context information
export interface PageContext {
  url: string;
  title: string;
  domain: string;
  timestamp: number;
  selectedText?: string;
  visibleLinks?: Array<{
    url: string;
    text: string;
    title: string;
  }>;
  metadata?: PageMetadata;
  classification?: PageClassification;
  suggestedCategory?: string;
}

// Page metadata
export interface PageMetadata {
  description: string;
  keywords: string;
  author: string;
  ogTitle: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  canonical: string;
  language: string;
}

// Page classification
export interface PageClassification {
  hasArticle: boolean;
  hasVideo: boolean;
  hasCode: boolean;
  hasForm: boolean;
  isDocumentation: boolean;
  isGitHub: boolean;
  isStackOverflow: boolean;
}

// Bookmark data
export interface SmartBookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  source: 'manual' | 'context-menu' | 'popup' | 'auto';
  metadata?: PageMetadata;
  thumbnail?: string;
  favicon?: string;
}

// Task data
export interface ExtensionTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 1 | 2 | 3 | 4 | 5;
  parentId?: string;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  source: 'manual' | 'context-menu' | 'popup' | 'auto';
  url?: string;
  category?: string;
  tags?: string[];
}

// Analytics data
export interface ExtensionAnalytics {
  id: string;
  event: string;
  data: any;
  timestamp: number;
  source: 'popup' | 'options' | 'content' | 'background' | 'newtab';
  userId?: string;
  sessionId?: string;
}

// Sync data structure
export interface SyncData {
  lastSyncTime: number;
  activeWorkspaceId: string;
  workspaceMetadata: {
    id: string;
    name: string;
    description?: string;
    lastAccessed: number;
    panelCount: number;
  };
  settings: ExtensionSettings;
  version: string;
}

// Import/Export data structure
export interface ExportData {
  localData: StorageData;
  syncData: StorageData;
  exportedAt: string;
  version: string;
  checksum?: string;
}

// Extension error types
export interface ExtensionError {
  code: string;
  message: string;
  source: 'popup' | 'options' | 'content' | 'background' | 'newtab';
  timestamp: number;
  stack?: string;
  data?: any;
}

// Chrome runtime types
export interface ChromeRuntime {
  sendMessage: (message: ExtensionMessage) => Promise<ExtensionResponse>;
  onMessage: {
    addListener: (
      callback: (message: ExtensionMessage, sender: any, sendResponse: Function) => void
    ) => void;
  };
  openOptionsPage: () => void;
  getManifest: () => chrome.runtime.Manifest;
}

// Chrome storage types
export interface ChromeStorage {
  local: {
    get: (keys?: string[] | string) => Promise<StorageData>;
    set: (data: StorageData) => Promise<void>;
    remove: (keys: string[] | string) => Promise<void>;
    clear: () => Promise<void>;
    getBytesInUse: (keys?: string[] | string) => Promise<number>;
    QUOTA_BYTES: number;
  };
  sync: {
    get: (keys?: string[] | string) => Promise<StorageData>;
    set: (data: StorageData) => Promise<void>;
    remove: (keys: string[] | string) => Promise<void>;
    clear: () => Promise<void>;
    getBytesInUse: (keys?: string[] | string) => Promise<number>;
    QUOTA_BYTES: number;
  };
  onChanged: {
    addListener: (
      callback: (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => void
    ) => void;
  };
}

// Chrome tabs types
export interface ChromeTabs {
  query: (queryInfo: chrome.tabs.QueryInfo) => Promise<chrome.tabs.Tab[]>;
  create: (createProperties: chrome.tabs.CreateProperties) => Promise<chrome.tabs.Tab>;
  update: (
    tabId?: number,
    updateProperties?: chrome.tabs.UpdateProperties
  ) => Promise<chrome.tabs.Tab>;
  remove: (tabIds: number | number[]) => Promise<void>;
  onUpdated: {
    addListener: (
      callback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void
    ) => void;
  };
}

// Chrome notifications types
export interface ChromeNotifications {
  create: (
    notificationId?: string,
    options?: chrome.notifications.NotificationOptions
  ) => Promise<string>;
  clear: (notificationId: string) => Promise<boolean>;
  getAll: () => Promise<Record<string, chrome.notifications.NotificationOptions>>;
  onClicked: {
    addListener: (callback: (notificationId: string) => void) => void;
  };
  onClosed: {
    addListener: (callback: (notificationId: string, byUser: boolean) => void) => void;
  };
}

// Chrome alarms types
export interface ChromeAlarms {
  create: (name?: string, alarmInfo?: chrome.alarms.AlarmCreateInfo) => void;
  clear: (name?: string) => Promise<boolean>;
  clearAll: () => Promise<boolean>;
  get: (name?: string) => Promise<chrome.alarms.Alarm | undefined>;
  getAll: () => Promise<chrome.alarms.Alarm[]>;
  onAlarm: {
    addListener: (callback: (alarm: chrome.alarms.Alarm) => void) => void;
  };
}

// Chrome context menus types
export interface ChromeContextMenus {
  create: (createProperties: chrome.contextMenus.CreateProperties) => void;
  update: (
    id: string | number,
    updateProperties: chrome.contextMenus.UpdateProperties
  ) => Promise<void>;
  remove: (menuItemId: string | number) => Promise<void>;
  removeAll: () => Promise<void>;
  onClicked: {
    addListener: (
      callback: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void
    ) => void;
  };
}

// Extension utility types
export type ExtensionContext = 'popup' | 'options' | 'content' | 'background' | 'newtab';

export interface ExtensionAPI {
  runtime: ChromeRuntime;
  storage: ChromeStorage;
  tabs: ChromeTabs;
  notifications: ChromeNotifications;
  alarms: ChromeAlarms;
  contextMenus: ChromeContextMenus;
}

// Message action types
export type MessageAction =
  | 'ping'
  | 'getStorageData'
  | 'setStorageData'
  | 'syncWorkspace'
  | 'getExtensionState'
  | 'loadTemplate'
  | 'saveBookmark'
  | 'addTask'
  | 'optimizeStorage'
  | 'pageChanged'
  | 'newTabOpened'
  | 'quickBookmark'
  | 'getPageContext'
  | 'extractContent'
  | 'highlightElement'
  | 'injectBookmarkButton'
  | 'storageChanged';

// Storage change event
export interface StorageChangeEvent {
  key: string;
  change: chrome.storage.StorageChange;
  areaName: 'local' | 'sync';
}

// Extension lifecycle events
export interface ExtensionLifecycleEvent {
  type: 'install' | 'update' | 'startup' | 'suspend';
  timestamp: number;
  data?: any;
}

// Performance metrics
export interface ExtensionPerformanceMetrics {
  memoryUsage: number;
  storageUsage: number;
  backgroundCPU: number;
  popupLoadTime: number;
  contentScriptCount: number;
  messageCount: number;
  errorCount: number;
  lastUpdated: number;
}

// Extension capabilities
export interface ExtensionCapabilities {
  hasStorage: boolean;
  hasNotifications: boolean;
  hasContextMenus: boolean;
  hasBookmarks: boolean;
  hasHistory: boolean;
  hasActiveTab: boolean;
  hasTabs: boolean;
  hasScripting: boolean;
  hasAlarms: boolean;
  hasUnlimitedStorage: boolean;
}

// Development and debugging types
export interface ExtensionDebugInfo {
  manifest: chrome.runtime.Manifest;
  permissions: ExtensionPermissions;
  capabilities: ExtensionCapabilities;
  performance: ExtensionPerformanceMetrics;
  errors: ExtensionError[];
  state: ExtensionState;
  storage: StorageQuota;
}

// Type guards and utility functions
export const isExtensionMessage = (obj: any): obj is ExtensionMessage => {
  return obj && typeof obj.action === 'string';
};

export const isExtensionResponse = (obj: any): obj is ExtensionResponse => {
  return obj && typeof obj.success === 'boolean';
};

export const createExtensionMessage = (action: MessageAction, data?: any): ExtensionMessage => {
  return {
    action,
    data,
    timestamp: Date.now(),
  };
};

export const createExtensionResponse = (
  success: boolean,
  data?: any,
  error?: string
): ExtensionResponse => {
  return {
    success,
    data,
    error,
    timestamp: Date.now(),
  };
};
