import React, { useState, useCallback } from 'react';

interface PanelLayout {
  id: string;
  name: string;
  type: 'chart' | 'table' | 'metric' | 'text' | 'custom';
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
}

interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  panels: PanelLayout[];
}

export default function StructureDesign() {
  const [activeTab, setActiveTab] = useState<'templates' | 'builder' | 'preview'>('templates');
  const [currentLayout, setCurrentLayout] = useState<PanelLayout[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  
  const layoutTemplates: LayoutTemplate[] = [
    {
      id: 'executive',
      name: 'Executive Dashboard',
      description: 'High-level metrics and KPIs for executives',
      panels: [
        { id: 'kpi1', name: 'Revenue', type: 'metric', position: { x: 0, y: 0 }, size: { width: 300, height: 150 }, visible: true },
        { id: 'kpi2', name: 'Growth', type: 'metric', position: { x: 320, y: 0 }, size: { width: 300, height: 150 }, visible: true },
        { id: 'chart1', name: 'Trend Chart', type: 'chart', position: { x: 0, y: 170 }, size: { width: 620, height: 300 }, visible: true },
        { id: 'table1', name: 'Top Performers', type: 'table', position: { x: 640, y: 0 }, size: { width: 360, height: 470 }, visible: true },
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Detailed analytics and data visualization',
      panels: [
        { id: 'chart1', name: 'Main Chart', type: 'chart', position: { x: 0, y: 0 }, size: { width: 600, height: 400 }, visible: true },
        { id: 'chart2', name: 'Secondary Chart', type: 'chart', position: { x: 620, y: 0 }, size: { width: 380, height: 200 }, visible: true },
        { id: 'table1', name: 'Data Table', type: 'table', position: { x: 620, y: 220 }, size: { width: 380, height: 180 }, visible: true },
        { id: 'text1', name: 'Insights', type: 'text', position: { x: 0, y: 420 }, size: { width: 600, height: 150 }, visible: true },
      ]
    },
    {
      id: 'operations',
      name: 'Operations Dashboard',
      description: 'Real-time operational metrics and monitoring',
      panels: [
        { id: 'metric1', name: 'System Status', type: 'metric', position: { x: 0, y: 0 }, size: { width: 250, height: 120 }, visible: true },
        { id: 'metric2', name: 'Response Time', type: 'metric', position: { x: 270, y: 0 }, size: { width: 250, height: 120 }, visible: true },
        { id: 'metric3', name: 'Throughput', type: 'metric', position: { x: 540, y: 0 }, size: { width: 250, height: 120 }, visible: true },
        { id: 'chart1', name: 'Performance Chart', type: 'chart', position: { x: 0, y: 140 }, size: { width: 790, height: 250 }, visible: true },
        { id: 'table1', name: 'Alert Log', type: 'table', position: { x: 0, y: 410 }, size: { width: 790, height: 180 }, visible: true },
      ]
    }
  ];
  
  const availablePanels = [
    { type: 'metric', name: 'Metric Card', icon: '📊' },
    { type: 'chart', name: 'Chart', icon: '📈' },
    { type: 'table', name: 'Data Table', icon: '📋' },
    { type: 'text', name: 'Text Block', icon: '📝' },
    { type: 'custom', name: 'Custom Widget', icon: '🧩' }
  ];
  
  const loadTemplate = (template: LayoutTemplate) => {
    setCurrentLayout(template.panels);
    setActiveTab('builder');
  };
  
  const addPanel = (type: string) => {
    const newPanel: PanelLayout = {
      id: `panel-${Date.now()}`,
      name: `New ${type}`,
      type: type as any,
      position: { x: 20, y: 20 },
      size: { width: 300, height: 200 },
      visible: true
    };
    setCurrentLayout(prev => [...prev, newPanel]);
  };
  
  const updatePanel = (id: string, updates: Partial<PanelLayout>) => {
    setCurrentLayout(prev => prev.map(panel => 
      panel.id === id ? { ...panel, ...updates } : panel
    ));
  };
  
  const deletePanel = (id: string) => {
    setCurrentLayout(prev => prev.filter(panel => panel.id !== id));
    setSelectedPanel(null);
  };
  
  const handleDragStart = (e: React.DragEvent, panelId: string) => {
    setDraggedPanel(panelId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedPanel) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      updatePanel(draggedPanel, { position: { x, y } });
      setDraggedPanel(null);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'templates' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'builder' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Layout Builder
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'preview' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Live Preview
        </button>
      </div>
      
      {/* Content */}
      <div className="bg-elevated rounded-xl p-6">
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Dashboard Templates</h3>
            <p className="text-neutral-400">
              Choose from pre-built dashboard layouts or start from scratch.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {layoutTemplates.map((template) => (
                <div key={template.id} className="bg-background rounded-lg p-4 border border-neutral-600">
                  <div className="mb-4">
                    <h4 className="font-medium text-neutral-200 mb-2">{template.name}</h4>
                    <p className="text-sm text-neutral-400">{template.description}</p>
                  </div>
                  
                  {/* Template Preview */}
                  <div className="bg-neutral-800 rounded mb-4 p-3 h-32 relative overflow-hidden">
                    {template.panels.map((panel, index) => (
                      <div
                        key={panel.id}
                        className="absolute bg-primary/20 border border-primary/40 rounded text-xs"
                        style={{
                          left: `${(panel.position.x / 1000) * 100}%`,
                          top: `${(panel.position.y / 600) * 100}%`,
                          width: `${(panel.size.width / 1000) * 100}%`,
                          height: `${(panel.size.height / 600) * 100}%`,
                        }}
                      >
                        <div className="p-1 truncate text-primary">{panel.name}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500">{template.panels.length} panels</span>
                    <button
                      onClick={() => loadTemplate(template)}
                      className="px-3 py-1 bg-primary hover:bg-primary-600 text-white rounded text-sm transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="bg-background rounded-lg p-4 border border-dashed border-neutral-600">
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">+</div>
                  <h4 className="font-medium text-neutral-200 mb-2">Start from Scratch</h4>
                  <p className="text-sm text-neutral-400 mb-4">Create a custom layout</p>
                  <button
                    onClick={() => {
                      setCurrentLayout([]);
                      setActiveTab('builder');
                    }}
                    className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors"
                  >
                    Create Layout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-100">Layout Builder</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded text-sm transition-colors">
                  Grid
                </button>
                <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded text-sm transition-colors">
                  Snap
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Panel Library */}
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Panel Library</h4>
                <div className="space-y-2">
                  {availablePanels.map((panel) => (
                    <button
                      key={panel.type}
                      onClick={() => addPanel(panel.type)}
                      className="w-full p-3 bg-background border border-neutral-600 rounded-lg hover:border-neutral-500 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{panel.icon}</span>
                        <span className="text-sm font-medium text-neutral-200">{panel.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Canvas */}
              <div className="lg:col-span-2">
                <h4 className="font-medium text-neutral-200 mb-4">Canvas</h4>
                <div 
                  className="bg-background border border-neutral-600 rounded-lg relative overflow-hidden"
                  style={{ width: '100%', height: '600px' }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {currentLayout.map((panel) => (
                    <div
                      key={panel.id}
                      className={`absolute bg-elevated border rounded cursor-move ${
                        selectedPanel === panel.id ? 'border-primary' : 'border-neutral-600'
                      }`}
                      style={{
                        left: panel.position.x,
                        top: panel.position.y,
                        width: panel.size.width,
                        height: panel.size.height,
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, panel.id)}
                      onClick={() => setSelectedPanel(panel.id)}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-neutral-200">{panel.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePanel(panel.id);
                            }}
                            className="text-danger hover:text-danger-400 text-xs"
                          >
                            ×
                          </button>
                        </div>
                        <div className="text-xs text-neutral-500">{panel.type}</div>
                      </div>
                    </div>
                  ))}
                  
                  {currentLayout.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p>Drag panels from the library to start building</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Properties Panel */}
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Properties</h4>
                {selectedPanel ? (
                  <div className="space-y-3">
                    {(() => {
                      const panel = currentLayout.find(p => p.id === selectedPanel);
                      if (!panel) return null;
                      
                      return (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Name</label>
                            <input
                              type="text"
                              value={panel.name}
                              onChange={(e) => updatePanel(panel.id, { name: e.target.value })}
                              className="w-full px-3 py-2 bg-background border border-neutral-600 rounded text-sm text-neutral-200 focus:border-primary focus:outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-1">Type</label>
                            <select
                              value={panel.type}
                              onChange={(e) => updatePanel(panel.id, { type: e.target.value as any })}
                              className="w-full px-3 py-2 bg-background border border-neutral-600 rounded text-sm text-neutral-200 focus:border-primary focus:outline-none"
                            >
                              <option value="metric">Metric</option>
                              <option value="chart">Chart</option>
                              <option value="table">Table</option>
                              <option value="text">Text</option>
                              <option value="custom">Custom</option>
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-1">Width</label>
                              <input
                                type="number"
                                value={panel.size.width}
                                onChange={(e) => updatePanel(panel.id, { 
                                  size: { ...panel.size, width: parseInt(e.target.value) }
                                })}
                                className="w-full px-3 py-2 bg-background border border-neutral-600 rounded text-sm text-neutral-200 focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-1">Height</label>
                              <input
                                type="number"
                                value={panel.size.height}
                                onChange={(e) => updatePanel(panel.id, { 
                                  size: { ...panel.size, height: parseInt(e.target.value) }
                                })}
                                className="w-full px-3 py-2 bg-background border border-neutral-600 rounded text-sm text-neutral-200 focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-1">X Position</label>
                              <input
                                type="number"
                                value={panel.position.x}
                                onChange={(e) => updatePanel(panel.id, { 
                                  position: { ...panel.position, x: parseInt(e.target.value) }
                                })}
                                className="w-full px-3 py-2 bg-background border border-neutral-600 rounded text-sm text-neutral-200 focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-1">Y Position</label>
                              <input
                                type="number"
                                value={panel.position.y}
                                onChange={(e) => updatePanel(panel.id, { 
                                  position: { ...panel.position, y: parseInt(e.target.value) }
                                })}
                                className="w-full px-3 py-2 bg-background border border-neutral-600 rounded text-sm text-neutral-200 focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={panel.visible}
                                onChange={(e) => updatePanel(panel.id, { visible: e.target.checked })}
                                className="w-4 h-4 text-primary rounded"
                              />
                              <span className="text-sm text-neutral-300">Visible</span>
                            </label>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-neutral-500 py-8">
                    <div className="text-2xl mb-2">⚙️</div>
                    <p>Select a panel to edit properties</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-100">Live Preview</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded text-sm transition-colors">
                  Desktop
                </button>
                <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded text-sm transition-colors">
                  Tablet
                </button>
                <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded text-sm transition-colors">
                  Mobile
                </button>
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-4 border border-neutral-600">
              <div className="text-center text-neutral-500 py-12">
                <div className="text-4xl mb-2">📱</div>
                <p>Live dashboard preview will appear here</p>
                <p className="text-sm mt-2">Switch between device sizes to test responsiveness</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Designing dashboard structure</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                             rounded-lg transition-colors">
            Save Layout
          </button>
          <button className="px-4 py-2 bg-success hover:bg-success-600 text-white 
                             rounded-lg transition-colors font-medium">
            Export Layout
          </button>
        </div>
      </div>
    </div>
  );
}