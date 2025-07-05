/**
 * Development Debug Panel
 * Comprehensive debugging interface for development mode
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLayoutStore } from '../../stores/layoutStore';
import { useAppStore } from '../../stores/appStore';
import { storePerformanceTracker } from '../../stores/devtools';
import { StateInspector } from '../../utils/stateInspector';
import { PerformanceMonitor } from '../../utils/performanceMonitor';

interface DebugPanelProps {
  visible?: boolean;
  onClose?: () => void;
}

interface DebugTab {
  id: string;
  label: string;
  icon: string;
}

const DEBUG_TABS: DebugTab[] = [
  { id: 'state', label: 'State', icon: '🗂️' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'layout', label: 'Layout', icon: '📐' },
  { id: 'actions', label: 'Actions', icon: '🎬' },
  { id: 'errors', label: 'Errors', icon: '🚨' },
  { id: 'memory', label: 'Memory', icon: '💾' },
];

export const DebugPanel: React.FC<DebugPanelProps> = ({ visible = false, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('state');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Store states
  const layoutStore = useLayoutStore();
  const appStore = useAppStore();

  // Debug utilities
  const [stateInspector] = useState(() => new StateInspector());
  const [performanceMonitor] = useState(() => new PerformanceMonitor());

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && visible) {
      const interval = setInterval(() => {
        // Trigger re-render by updating a timestamp
        setRefreshInterval(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, visible]);

  // Performance metrics
  const performanceMetrics = storePerformanceTracker.getAllMetrics();
  const renderMetrics = performanceMonitor.getMetrics();

  if (!visible) return null;

  const renderStateTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Store States</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          <button
            onClick={() => setRefreshInterval(Date.now())}
            className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Layout Store */}
      <div className="border border-gray-600 rounded">
        <button
          onClick={() => toggleSection('layout-store')}
          className="w-full p-3 text-left bg-gray-700 rounded-t flex items-center justify-between"
        >
          <span className="font-medium">Layout Store ({layoutStore.panels.length} panels)</span>
          <span>{expandedSections.has('layout-store') ? '▼' : '▶'}</span>
        </button>
        {expandedSections.has('layout-store') && (
          <div className="p-3 max-h-64 overflow-auto bg-gray-800">
            <pre className="text-xs text-gray-300">
              {JSON.stringify(
                {
                  panels: layoutStore.panels,
                  selectedPanelIds: layoutStore.selectedPanelIds,
                  gridSettings: layoutStore.gridSettings,
                  dragState: layoutStore.dragState,
                  resizeState: layoutStore.resizeState,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* App Store */}
      <div className="border border-gray-600 rounded">
        <button
          onClick={() => toggleSection('app-store')}
          className="w-full p-3 text-left bg-gray-700 rounded-t flex items-center justify-between"
        >
          <span className="font-medium">App Store</span>
          <span>{expandedSections.has('app-store') ? '▼' : '▶'}</span>
        </button>
        {expandedSections.has('app-store') && (
          <div className="p-3 max-h-64 overflow-auto bg-gray-800">
            <pre className="text-xs text-gray-300">
              {JSON.stringify(
                {
                  theme: appStore.theme,
                  preferences: appStore.preferences,
                  performance: appStore.performance,
                  notifications: appStore.notifications.length,
                  shortcuts: Object.keys(appStore.shortcuts).length,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>

      {/* Store Performance */}
      <div className="border border-gray-600 rounded">
        <div className="p-3 bg-gray-700 rounded-t">
          <span className="font-medium">Store Performance</span>
        </div>
        <div className="p-3 bg-gray-800">
          {Array.from(performanceMetrics.entries()).map(([storeName, metrics]) => (
            <div key={storeName} className="mb-2 p-2 bg-gray-700 rounded">
              <div className="font-medium text-sm">{storeName}</div>
              <div className="text-xs text-gray-300 grid grid-cols-2 gap-2 mt-1">
                <div>Actions: {metrics.actionCount}</div>
                <div>Avg Time: {metrics.averageActionTime.toFixed(2)}ms</div>
                <div>State Size: {(metrics.stateSize / 1024).toFixed(2)}KB</div>
                <div>Last Action: {new Date(metrics.lastActionTime).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          {performanceMetrics.size === 0 && (
            <div className="text-gray-400 text-sm">No store metrics available</div>
          )}
        </div>
      </div>

      {/* Render Performance */}
      <div className="border border-gray-600 rounded">
        <div className="p-3 bg-gray-700 rounded-t">
          <span className="font-medium">Render Performance</span>
        </div>
        <div className="p-3 bg-gray-800">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Memory Usage</div>
              <div>
                {renderMetrics.memoryUsage
                  ? `${(renderMetrics.memoryUsage / 1024 / 1024).toFixed(2)} MB`
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Render Count</div>
              <div>{renderMetrics.renderCount || 0}</div>
            </div>
            <div>
              <div className="text-gray-400">FPS</div>
              <div>{renderMetrics.fps || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-400">Frame Time</div>
              <div>
                {renderMetrics.frameTime ? `${renderMetrics.frameTime.toFixed(2)}ms` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Layout Debug</h3>

      {/* Grid Overlay Toggle */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={layoutStore.gridSettings.visible}
            onChange={e => layoutStore.updateGridSettings({ visible: e.target.checked })}
            className="rounded"
          />
          Show Grid Overlay
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={layoutStore.gridSettings.enabled}
            onChange={e => layoutStore.setGridSnap(e.target.checked)}
            className="rounded"
          />
          Grid Snapping
        </label>
      </div>

      {/* Panel Bounds Visualization */}
      <div className="border border-gray-600 rounded">
        <div className="p-3 bg-gray-700 rounded-t">
          <span className="font-medium">Panel Information</span>
        </div>
        <div className="p-3 bg-gray-800 max-h-48 overflow-auto">
          {layoutStore.panels.map(panel => (
            <div key={panel.id} className="mb-2 p-2 bg-gray-700 rounded text-xs">
              <div className="font-medium">
                {panel.component} - {panel.id.slice(0, 8)}
              </div>
              <div className="text-gray-300">
                Position: ({panel.position.x}, {panel.position.y})<br />
                Size: {panel.size.width} × {panel.size.height}
                <br />
                Z-Index: {panel.zIndex}
              </div>
            </div>
          ))}
          {layoutStore.panels.length === 0 && (
            <div className="text-gray-400">No panels available</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderActionsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => layoutStore.resetLayout()}
          className="p-2 bg-red-600 text-white rounded text-sm"
        >
          Reset Layout
        </button>
        <button
          onClick={() => appStore.clearAllNotifications()}
          className="p-2 bg-orange-600 text-white rounded text-sm"
        >
          Clear Notifications
        </button>
        <button
          onClick={() => performanceMonitor.reset()}
          className="p-2 bg-blue-600 text-white rounded text-sm"
        >
          Reset Performance
        </button>
        <button
          onClick={() => storePerformanceTracker.reset()}
          className="p-2 bg-purple-600 text-white rounded text-sm"
        >
          Reset Store Metrics
        </button>
      </div>

      {/* State Manipulation */}
      <div className="border border-gray-600 rounded">
        <div className="p-3 bg-gray-700 rounded-t">
          <span className="font-medium">State Manipulation</span>
        </div>
        <div className="p-3 bg-gray-800 space-y-2">
          <button
            onClick={() => {
              layoutStore.addPanel({
                component: 'SmartHub' as any,
                position: { x: Math.random() * 400, y: Math.random() * 300 },
                size: { width: 300, height: 200 },
                zIndex: 1,
                visible: true,
                title: 'Debug Panel',
              });
            }}
            className="w-full p-2 bg-green-600 text-white rounded text-sm"
          >
            Add Random Panel
          </button>
          <button
            onClick={() => appStore.toggleTheme()}
            className="w-full p-2 bg-indigo-600 text-white rounded text-sm"
          >
            Toggle Theme
          </button>
        </div>
      </div>
    </div>
  );

  const renderErrorsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error Tracking</h3>
      <div className="text-gray-400 text-sm">
        Error tracking system would display captured errors here. Integration with error boundary
        and console capture.
      </div>
    </div>
  );

  const renderMemoryTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Memory Usage</h3>

      {/* Memory Info */}
      <div className="border border-gray-600 rounded">
        <div className="p-3 bg-gray-700 rounded-t">
          <span className="font-medium">Browser Memory</span>
        </div>
        <div className="p-3 bg-gray-800">
          {(performance as any).memory ? (
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Used JS Heap:</span>
                <span>
                  {((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total JS Heap:</span>
                <span>
                  {((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Heap Limit:</span>
                <span>
                  {((performance as any).memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">Memory API not available</div>
          )}
        </div>
      </div>

      {/* Store Memory Usage */}
      <div className="border border-gray-600 rounded">
        <div className="p-3 bg-gray-700 rounded-t">
          <span className="font-medium">Store Memory</span>
        </div>
        <div className="p-3 bg-gray-800 text-sm">
          <div className="flex justify-between mb-1">
            <span>Layout Store:</span>
            <span>{(JSON.stringify(layoutStore).length / 1024).toFixed(2)} KB</span>
          </div>
          <div className="flex justify-between">
            <span>App Store:</span>
            <span>{(JSON.stringify(appStore).length / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'state':
        return renderStateTab();
      case 'performance':
        return renderPerformanceTab();
      case 'layout':
        return renderLayoutTab();
      case 'actions':
        return renderActionsTab();
      case 'errors':
        return renderErrorsTab();
      case 'memory':
        return renderMemoryTab();
      default:
        return renderStateTab();
    }
  };

  return (
    <div className="fixed top-4 right-4 w-96 max-h-[90vh] bg-gray-900 text-white border border-gray-600 rounded-lg shadow-2xl z-[9999] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛠️</span>
          <span className="font-semibold">Debug Panel</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto bg-gray-800 border-b border-gray-600">
        {DEBUG_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-3 py-2 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">{renderTabContent()}</div>
    </div>
  );
};
