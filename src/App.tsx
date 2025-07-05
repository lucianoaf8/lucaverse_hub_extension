import './styles/globals.css';
import React, { useEffect, useState } from 'react';
import { initializeStores } from './stores';
import './stores/simpleTest'; // Load store test functions

// Import platform abstraction
import {
  getPlatformAPI,
  detectPlatform,
  onPlatformError,
  type PlatformAPI,
  type PlatformDetectionResult,
} from './platform';

// Import component test
import ComponentTest from './components/__tests__/ComponentTest';
import PanelMigrationTest from './components/__tests__/PanelMigrationTest';
import LayoutSystemTest from './components/__tests__/LayoutSystemTest';
import { DragDropTest } from './components/__tests__/DragDropTest';
import { ResizeTest } from './components/__tests__/ResizeTest';
import { PanelManagementTest } from './components/__tests__/PanelManagementTest';

// Import main layout component
import DynamicLayout from './components/DynamicLayout';

// Import stores
import { useLayoutStore } from './stores/layoutStore';
import { PanelComponent } from './types/panel';

interface PlatformInfo {
  detection: PlatformDetectionResult;
  api: PlatformAPI | null;
  capabilities: any;
  systemInfo: any;
  error: string | null;
}

type AppView =
  | 'home'
  | 'component-test'
  | 'panel-test'
  | 'layout-test'
  | 'drag-drop-test'
  | 'resize-test'
  | 'panel-management-test'
  | 'dashboard';

// Initialize default panels for the dashboard
const initializeDefaultPanels = () => {
  const { panels, addPanel } = useLayoutStore.getState();

  // Only add default panels if none exist
  if (panels.length === 0) {
    console.log('Initializing default dashboard panels...');

    // Add SmartHub in top-left
    addPanel({
      component: PanelComponent.SmartHub,
      position: { x: 50, y: 50 },
      size: { width: 400, height: 300 },
      zIndex: 1,
      visible: true,
      constraints: {
        minSize: { width: 300, height: 200 },
        maxSize: { width: 800, height: 600 },
      },
    });

    // Add AI Chat in top-right
    addPanel({
      component: PanelComponent.AIChat,
      position: { x: 500, y: 50 },
      size: { width: 400, height: 300 },
      zIndex: 2,
      visible: true,
      constraints: {
        minSize: { width: 300, height: 200 },
        maxSize: { width: 800, height: 600 },
      },
    });

    // Add Task Manager in bottom-left
    addPanel({
      component: PanelComponent.TaskManager,
      position: { x: 50, y: 400 },
      size: { width: 400, height: 300 },
      zIndex: 3,
      visible: true,
      constraints: {
        minSize: { width: 300, height: 200 },
        maxSize: { width: 800, height: 600 },
      },
    });

    // Add Productivity in bottom-right
    addPanel({
      component: PanelComponent.Productivity,
      position: { x: 500, y: 400 },
      size: { width: 400, height: 300 },
      zIndex: 4,
      visible: true,
      constraints: {
        minSize: { width: 300, height: 200 },
        maxSize: { width: 800, height: 600 },
      },
    });

    console.log('Default dashboard panels initialized');
  }
};

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [platformInfo, setPlatformInfo] = useState<PlatformInfo>({
    detection: detectPlatform(),
    api: null,
    capabilities: null,
    systemInfo: null,
    error: null,
  });

  useEffect(() => {
    // Initialize stores on app startup
    initializeStores().then(result => {
      console.log('Stores initialized:', result);
    });

    // Initialize platform abstraction
    initializePlatform();

    // Setup platform error handling
    const removeErrorHandler = onPlatformError(error => {
      console.error('Platform error:', error);
      setPlatformInfo(prev => ({ ...prev, error: error.message }));
    });

    return removeErrorHandler;
  }, []);

  const initializePlatform = async () => {
    try {
      const detection = detectPlatform();
      const api = await getPlatformAPI();
      const capabilities = api.getCapabilities();
      const systemInfo = await api.system.getInfo();

      setPlatformInfo({
        detection,
        api,
        capabilities,
        systemInfo,
        error: null,
      });

      console.log('Platform initialized:', { detection, capabilities, systemInfo });
    } catch (error) {
      console.error('Failed to initialize platform:', error);
      setPlatformInfo(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Platform initialization failed',
      }));
    }
  };

  const testPlatformFeatures = async () => {
    if (!platformInfo.api) {
      console.error('Platform API not available');
      return;
    }

    try {
      // Test storage
      const testKey = 'platform-test-' + Date.now();
      const testData = { message: 'Platform integration test', timestamp: Date.now() };

      await platformInfo.api.storage.set(testKey, testData);
      const retrieved = await platformInfo.api.storage.get(testKey);
      console.log('Storage test:', { stored: testData, retrieved });

      // Test notification (if supported)
      if (platformInfo.capabilities?.notifications?.basic) {
        const notificationId = await platformInfo.api.notifications.create({
          title: 'Lucaverse Hub',
          message: 'Platform integration successful!',
          iconUrl: '/assets/icon-48.png',
        });
        console.log('Notification test:', notificationId);

        // Clear notification after 3 seconds
        if (notificationId) {
          setTimeout(() => {
            platformInfo.api!.notifications.clear(notificationId);
          }, 3000);
        }
      }

      // Cleanup test data
      await platformInfo.api.storage.remove(testKey);

      alert('Platform test completed! Check console for details.');
    } catch (error) {
      console.error('Platform test failed:', error);
      alert('Platform test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Render different views based on current view
  if (currentView === 'component-test') {
    return (
      <div className="h-full relative">
        <button
          className="absolute top-4 left-4 z-50 glass-button px-4 py-2 glow-hover text-sm"
          onClick={() => setCurrentView('home')}
        >
          ← Back to Home
        </button>
        <ComponentTest />
      </div>
    );
  }

  if (currentView === 'panel-test') {
    return (
      <div className="h-full relative">
        <button
          className="absolute top-4 left-4 z-50 glass-button px-4 py-2 glow-hover text-sm"
          onClick={() => setCurrentView('home')}
        >
          ← Back to Home
        </button>
        <PanelMigrationTest />
      </div>
    );
  }

  if (currentView === 'layout-test') {
    return (
      <div className="h-full relative">
        <button
          className="absolute top-4 left-4 z-50 glass-button px-4 py-2 glow-hover text-sm"
          onClick={() => setCurrentView('home')}
        >
          ← Back to Home
        </button>
        <LayoutSystemTest />
      </div>
    );
  }

  if (currentView === 'drag-drop-test') {
    return (
      <div className="h-full relative">
        <button
          className="absolute top-4 left-4 z-50 glass-button px-4 py-2 glow-hover text-sm"
          onClick={() => setCurrentView('home')}
        >
          ← Back to Home
        </button>
        <DragDropTest />
      </div>
    );
  }

  if (currentView === 'resize-test') {
    return (
      <div className="h-full relative">
        <button
          className="absolute top-4 left-4 z-50 glass-button px-4 py-2 glow-hover text-sm"
          onClick={() => setCurrentView('home')}
        >
          ← Back to Home
        </button>
        <ResizeTest />
      </div>
    );
  }

  if (currentView === 'panel-management-test') {
    return (
      <div className="h-full relative">
        <button
          className="absolute top-4 left-4 z-50 glass-button px-4 py-2 glow-hover text-sm"
          onClick={() => setCurrentView('home')}
        >
          ← Back to Home
        </button>
        <PanelManagementTest />
      </div>
    );
  }

  // Initialize default panels when dashboard is selected
  useEffect(() => {
    if (currentView === 'dashboard') {
      initializeDefaultPanels();
    }
  }, [currentView]);

  if (currentView === 'dashboard') {
    return (
      <div className="h-full relative">
        <button
          className="absolute top-4 left-4 z-50 glass-button px-4 py-2 glow-hover text-sm"
          onClick={() => setCurrentView('home')}
        >
          ← Back to Home
        </button>
        <DynamicLayout />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="glass-card p-8 max-w-2xl w-full mx-4">
        <h1 className="text-3xl font-display font-bold text-white text-center mb-4 text-shadow">
          Lucaverse Hub
        </h1>
        <p className="text-white/80 text-center mb-6">
          Cross-platform productivity dashboard with React TypeScript + Platform Abstraction
        </p>

        {platformInfo.error && (
          <div className="glass-panel p-4 mb-4 border border-red-500/30 bg-red-500/10">
            <div className="text-sm text-red-300 mb-1">Platform Error</div>
            <div className="text-red-200 font-medium">{platformInfo.error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="glass-panel p-4">
            <div className="text-sm text-white/70 mb-1">Platform Type</div>
            <div className="text-white font-medium capitalize">
              {platformInfo.detection.type}
              <span className="text-xs text-white/60 ml-2">
                ({(platformInfo.detection.confidence * 100).toFixed(0)}% confidence)
              </span>
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="text-sm text-white/70 mb-1">Build Mode</div>
            <div className="text-white font-medium">{import.meta.env.MODE}</div>
          </div>

          <div className="glass-panel p-4">
            <div className="text-sm text-white/70 mb-1">Environment</div>
            <div className="text-white font-medium">
              {import.meta.env.DEV ? 'Development' : 'Production'}
            </div>
          </div>

          <div className="glass-panel p-4">
            <div className="text-sm text-white/70 mb-1">API Status</div>
            <div className="text-white font-medium">
              {platformInfo.api ? '✅ Initialized' : '⏳ Loading...'}
            </div>
          </div>
        </div>

        {platformInfo.systemInfo && (
          <div className="glass-panel p-4 mb-4">
            <div className="text-sm text-white/70 mb-2">System Information</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-white/60">Platform:</span>
                <span className="text-white ml-2">{platformInfo.systemInfo.platform}</span>
              </div>
              <div>
                <span className="text-white/60">Language:</span>
                <span className="text-white ml-2">{platformInfo.systemInfo.language}</span>
              </div>
              <div>
                <span className="text-white/60">Version:</span>
                <span className="text-white ml-2">{platformInfo.systemInfo.version}</span>
              </div>
              <div>
                <span className="text-white/60">Timezone:</span>
                <span className="text-white ml-2">{platformInfo.systemInfo.timezone}</span>
              </div>
            </div>
          </div>
        )}

        {platformInfo.capabilities && (
          <div className="glass-panel p-4 mb-4">
            <div className="text-sm text-white/70 mb-2">Platform Capabilities</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <span
                  className={
                    platformInfo.capabilities.storage?.local ? 'text-green-400' : 'text-red-400'
                  }
                >
                  {platformInfo.capabilities.storage?.local ? '✅' : '❌'}
                </span>
                <span className="text-white/80 ml-2">Local Storage</span>
              </div>
              <div className="flex items-center">
                <span
                  className={
                    platformInfo.capabilities.notifications?.basic
                      ? 'text-green-400'
                      : 'text-red-400'
                  }
                >
                  {platformInfo.capabilities.notifications?.basic ? '✅' : '❌'}
                </span>
                <span className="text-white/80 ml-2">Notifications</span>
              </div>
              <div className="flex items-center">
                <span
                  className={
                    platformInfo.capabilities.system?.clipboard ? 'text-green-400' : 'text-red-400'
                  }
                >
                  {platformInfo.capabilities.system?.clipboard ? '✅' : '❌'}
                </span>
                <span className="text-white/80 ml-2">Clipboard</span>
              </div>
              <div className="flex items-center">
                <span
                  className={
                    platformInfo.capabilities.windows?.create ? 'text-green-400' : 'text-red-400'
                  }
                >
                  {platformInfo.capabilities.windows?.create ? '✅' : '❌'}
                </span>
                <span className="text-white/80 ml-2">Window Management</span>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel p-4 mb-6">
          <div className="text-sm text-white/70 mb-1">Development Tools</div>
          <div className="text-white/80 text-sm space-y-1">
            <div>
              • Console: <code className="bg-black/20 px-1 rounded">window.__testStores__()</code> -
              Test Zustand stores
            </div>
            <div>
              • Console: <code className="bg-black/20 px-1 rounded">testPlatformAPIs()</code> - Test
              platform APIs
            </div>
            <div>
              • Console:{' '}
              <code className="bg-black/20 px-1 rounded">window.platformDev.logInfo()</code> -
              Platform info
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            className="glass-button px-6 py-2 glow-hover"
            onClick={testPlatformFeatures}
            disabled={!platformInfo.api}
          >
            Test Platform Features
          </button>
          <button
            className="glass-button px-6 py-2 glow-hover"
            onClick={() => setCurrentView('component-test')}
          >
            Component Test Suite
          </button>
          <button
            className="glass-button px-6 py-2 glow-hover"
            onClick={() => setCurrentView('panel-test')}
          >
            Panel Migration Test
          </button>
          <button
            className="glass-button px-6 py-2 glow-hover"
            onClick={() => setCurrentView('layout-test')}
          >
            Layout System Test
          </button>
          <button
            className="glass-button px-6 py-2 glow-hover"
            onClick={() => setCurrentView('drag-drop-test')}
          >
            Drag & Drop Test
          </button>
          <button
            className="glass-button px-6 py-2 glow-hover"
            onClick={() => setCurrentView('resize-test')}
          >
            Panel Resize Test
          </button>
          <button
            className="glass-button px-6 py-2 glow-hover"
            onClick={() => setCurrentView('panel-management-test')}
          >
            Panel Management Test
          </button>
          <button
            className="glass-button px-6 py-2 glow-hover"
            onClick={() => setCurrentView('dashboard')}
          >
            Open Dashboard
          </button>
        </div>

        {platformInfo.detection.warnings.length > 0 && (
          <div className="mt-4 glass-panel p-3 border border-yellow-500/30 bg-yellow-500/10">
            <div className="text-xs text-yellow-300 mb-1">Platform Warnings</div>
            <ul className="text-yellow-200 text-xs space-y-1">
              {platformInfo.detection.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
