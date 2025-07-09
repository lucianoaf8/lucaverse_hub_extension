import React, { useState, useEffect } from 'react';
import { useThemeStudioState, useComponentWorkshopState, useLayoutDesignerState, useQualityGateState, useSharedUtilities } from '../state/selectors';
import { devCenterSync } from '../state/synchronizer';

export default function StateDemo() {
  const [activeTab, setActiveTab] = useState<'theme' | 'component' | 'layout' | 'performance' | 'shared'>('theme');
  const [syncEvents, setSyncEvents] = useState<Array<{ event: string; data: any; timestamp: Date }>>([]);
  
  // Get state from all tools
  const themeState = useThemeStudioState();
  const componentState = useComponentWorkshopState();
  const layoutState = useLayoutDesignerState();
  const performanceState = useQualityGateState();
  const sharedState = useSharedUtilities();
  
  // Subscribe to sync events
  useEffect(() => {
    const unsubscribers = [
      devCenterSync.subscribe('theme:updated', (data) => {
        setSyncEvents(prev => [...prev, { event: 'theme:updated', data, timestamp: new Date() }].slice(-10));
      }),
      devCenterSync.subscribe('component:theme-changed', (data) => {
        setSyncEvents(prev => [...prev, { event: 'component:theme-changed', data, timestamp: new Date() }].slice(-10));
      }),
      devCenterSync.subscribe('layout:theme-changed', (data) => {
        setSyncEvents(prev => [...prev, { event: 'layout:theme-changed', data, timestamp: new Date() }].slice(-10));
      }),
      devCenterSync.subscribe('performance:theme-impact', (data) => {
        setSyncEvents(prev => [...prev, { event: 'performance:theme-impact', data, timestamp: new Date() }].slice(-10));
      }),
      devCenterSync.subscribe('validation:completed', (data) => {
        setSyncEvents(prev => [...prev, { event: 'validation:completed', data, timestamp: new Date() }].slice(-10));
      })
    ];
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);
  
  const handleTestThemeChange = () => {
    themeState.updateThemeColors({
      primary: '#' + Math.floor(Math.random()*16777215).toString(16),
      secondary: '#' + Math.floor(Math.random()*16777215).toString(16)
    });
  };
  
  const handleTestComponentSelection = () => {
    componentState.selectComponent(`component-${Math.random().toString(36).substr(2, 9)}`);
  };
  
  const handleTestLayoutUpdate = () => {
    const newPanels = [
      {
        id: `panel-${Date.now()}`,
        type: 'widget',
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 10),
        width: Math.floor(Math.random() * 4) + 2,
        height: Math.floor(Math.random() * 4) + 2,
        content: { title: 'Test Panel' }
      }
    ];
    layoutState.updatePanels([...layoutState.layout.panels, ...newPanels]);
  };
  
  const handleTestValidation = () => {
    performanceState.addValidationResult({
      id: `test-${Date.now()}`,
      type: 'test',
      severity: Math.random() > 0.5 ? 'warning' : 'error',
      message: `Test validation issue #${Math.floor(Math.random() * 100)}`,
      timestamp: new Date()
    });
  };
  
  const handleExportState = () => {
    const state = sharedState.exportCurrentState();
    console.log('Exported state:', state);
    
    // Add to export history
    sharedState.addToExportHistory({
      id: `export-${Date.now()}`,
      type: 'theme',
      timestamp: new Date(),
      data: state
    });
  };
  
  const tabs = [
    { id: 'theme', label: 'Theme Studio', icon: '🎨' },
    { id: 'component', label: 'Component Workshop', icon: '🧩' },
    { id: 'layout', label: 'Layout Designer', icon: '📐' },
    { id: 'performance', label: 'Quality Gate', icon: '⚡' },
    { id: 'shared', label: 'Shared State', icon: '🔄' }
  ];
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-elevated rounded-xl border border-neutral-700 overflow-hidden">
        <div className="bg-neutral-800 px-6 py-4 border-b border-neutral-700">
          <h1 className="text-2xl font-bold text-primary">Dev Center State Demo</h1>
          <p className="text-neutral-400 mt-1">Testing centralized state management and synchronization</p>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-neutral-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-primary text-white border-b-2 border-primary'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {/* Theme Studio State */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-neutral-100">Theme Studio State</h3>
                <button
                  onClick={handleTestThemeChange}
                  className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Test Theme Change
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Colors</h4>
                  <div className="space-y-2">
                    {Object.entries(themeState.theme.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: value }}></div>
                        <span className="text-sm text-neutral-400">{key}: {value}</span>
                      </div>
                    ))}
                    {Object.keys(themeState.theme.colors).length === 0 && (
                      <p className="text-sm text-neutral-500">No colors defined</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Typography</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-400">Font Family: {themeState.theme.typography.fontFamily}</p>
                    <p className="text-sm text-neutral-400">
                      Font Sizes: {Object.keys(themeState.theme.typography.fontSize).length}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Font Weights: {Object.keys(themeState.theme.typography.fontWeight).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-background rounded-lg p-4 border border-neutral-700">
                <h4 className="font-medium text-neutral-200 mb-2">State Info</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Is Dirty</p>
                    <p className="text-sm text-neutral-200">{themeState.theme.isDirty ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Last Modified</p>
                    <p className="text-sm text-neutral-200">
                      {themeState.theme.lastModified?.toLocaleTimeString() || 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Clipboard Data</p>
                    <p className="text-sm text-neutral-200">
                      {themeState.clipboardData ? 'Has Data' : 'Empty'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Component Workshop State */}
          {activeTab === 'component' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-neutral-100">Component Workshop State</h3>
                <button
                  onClick={handleTestComponentSelection}
                  className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Test Component Selection
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Current State</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-400">
                      Selected Component: {componentState.component.selectedComponent || 'None'}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Component States: {Object.keys(componentState.component.componentStates).length}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Build Queue: {componentState.component.buildQueue.length}
                    </p>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Test Results</h4>
                  <div className="space-y-2">
                    {Object.entries(componentState.component.testResults).map(([componentId, result]) => (
                      <div key={componentId} className="text-sm">
                        <p className="text-neutral-200">{componentId}</p>
                        <p className="text-neutral-400">
                          ✅ {result.passed} ❌ {result.failed} ⏭️ {result.skipped}
                        </p>
                      </div>
                    ))}
                    {Object.keys(componentState.component.testResults).length === 0 && (
                      <p className="text-sm text-neutral-500">No test results</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Layout Designer State */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-neutral-100">Layout Designer State</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleTestLayoutUpdate}
                    className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    Add Test Panel
                  </button>
                  <button
                    onClick={layoutState.undo}
                    disabled={!layoutState.canUndo}
                    className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Undo
                  </button>
                  <button
                    onClick={layoutState.redo}
                    disabled={!layoutState.canRedo}
                    className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    Redo
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Layout Info</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-400">
                      Active Layout: {layoutState.layout.activeLayout}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Panels: {layoutState.layout.panels.length}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Saved Layouts: {Object.keys(layoutState.layout.savedLayouts).length}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Grid: {layoutState.layout.gridSettings.rows}x{layoutState.layout.gridSettings.columns}
                    </p>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Panels</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {layoutState.layout.panels.map(panel => (
                      <div key={panel.id} className="text-sm">
                        <p className="text-neutral-200">{panel.id}</p>
                        <p className="text-neutral-400">
                          {panel.x},{panel.y} - {panel.width}x{panel.height}
                        </p>
                      </div>
                    ))}
                    {layoutState.layout.panels.length === 0 && (
                      <p className="text-sm text-neutral-500">No panels</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Quality Gate State */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-neutral-100">Quality Gate State</h3>
                <button
                  onClick={handleTestValidation}
                  className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Add Test Validation
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Performance Metrics</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-400">
                      Load Time: {performanceState.performance.metrics.loadTime}ms
                    </p>
                    <p className="text-sm text-neutral-400">
                      Render Time: {performanceState.performance.metrics.renderTime}ms
                    </p>
                    <p className="text-sm text-neutral-400">
                      Bundle Size: {performanceState.performance.metrics.bundleSize} bytes
                    </p>
                    <p className="text-sm text-neutral-400">
                      Memory Usage: {performanceState.performance.metrics.memoryUsage} bytes
                    </p>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Validation Results</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {performanceState.performance.validationResults.map(result => (
                      <div key={result.id} className="text-sm">
                        <p className="text-neutral-200 flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            result.severity === 'error' ? 'bg-red-500' : 
                            result.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></span>
                          <span>{result.message}</span>
                        </p>
                      </div>
                    ))}
                    {performanceState.performance.validationResults.length === 0 && (
                      <p className="text-sm text-neutral-500">No validation results</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Shared State */}
          {activeTab === 'shared' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-neutral-100">Shared State</h3>
                <button
                  onClick={handleExportState}
                  className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Export State
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">Export History</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {sharedState.shared.exportHistory.map(item => (
                      <div key={item.id} className="text-sm">
                        <p className="text-neutral-200">{item.type} export</p>
                        <p className="text-neutral-400">{item.timestamp.toLocaleTimeString()}</p>
                      </div>
                    ))}
                    {sharedState.shared.exportHistory.length === 0 && (
                      <p className="text-sm text-neutral-500">No exports</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-neutral-700">
                  <h4 className="font-medium text-neutral-200 mb-2">History</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-400">
                      Undo Stack: {sharedState.shared.undoStack.length}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Redo Stack: {sharedState.shared.redoStack.length}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Can Undo: {sharedState.canUndo ? 'Yes' : 'No'}
                    </p>
                    <p className="text-sm text-neutral-400">
                      Can Redo: {sharedState.canRedo ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Synchronization Events */}
        <div className="border-t border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-100 mb-4">Recent Synchronization Events</h3>
          <div className="bg-background rounded-lg p-4 border border-neutral-700 max-h-40 overflow-y-auto">
            {syncEvents.map((event, index) => (
              <div key={index} className="text-sm mb-2">
                <span className="text-primary font-medium">{event.event}</span>
                <span className="text-neutral-400 ml-2">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                <pre className="text-xs text-neutral-500 mt-1 ml-4">
                  {JSON.stringify(event.data, null, 2).substring(0, 100)}...
                </pre>
              </div>
            ))}
            {syncEvents.length === 0 && (
              <p className="text-sm text-neutral-500">No sync events yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}