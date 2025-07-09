import React, { useState } from 'react';

export default function InteractiveFeatures() {
  const [enabledFeatures, setEnabledFeatures] = useState({
    dragDrop: true,
    resize: true,
    minimize: false,
    maximize: false,
    refresh: true,
    settings: true
  });
  
  const toggleFeature = (feature: string) => {
    setEnabledFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature as keyof typeof prev]
    }));
  };
  
  const interactiveFeatures = [
    { id: 'dragDrop', name: 'Drag & Drop', description: 'Allow panels to be dragged and rearranged', icon: '🖱️' },
    { id: 'resize', name: 'Resize Panels', description: 'Enable panel resizing with drag handles', icon: '↔️' },
    { id: 'minimize', name: 'Minimize/Maximize', description: 'Add minimize and maximize buttons', icon: '🗖️' },
    { id: 'maximize', name: 'Full Screen', description: 'Allow panels to expand to full screen', icon: '⛶' },
    { id: 'refresh', name: 'Refresh Data', description: 'Add refresh button to update panel data', icon: '🔄' },
    { id: 'settings', name: 'Panel Settings', description: 'Configure individual panel settings', icon: '⚙️' }
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Interactive Features</h3>
        <p className="text-neutral-400 mb-6">
          Configure interactive capabilities for your dashboard panels.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interactiveFeatures.map((feature) => (
            <div key={feature.id} className="bg-background rounded-lg p-4 border border-neutral-600">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h4 className="font-medium text-neutral-200">{feature.name}</h4>
                    <p className="text-sm text-neutral-500">{feature.description}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabledFeatures[feature.id as keyof typeof enabledFeatures]}
                    onChange={() => toggleFeature(feature.id)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    enabledFeatures[feature.id as keyof typeof enabledFeatures] ? 'bg-primary' : 'bg-neutral-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      enabledFeatures[feature.id as keyof typeof enabledFeatures] ? 'translate-x-5' : 'translate-x-0'
                    } translate-y-0.5`} />
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Animation Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Transition Duration</label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              defaultValue="250"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Fast (100ms)</span>
              <span>Slow (1000ms)</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Easing Function</label>
            <select className="w-full px-3 py-2 bg-background border border-neutral-600 rounded text-neutral-200 focus:border-primary focus:outline-none">
              <option value="ease-in-out">Ease In Out</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="linear">Linear</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors">
          Reset to Defaults
        </button>
        <button className="px-4 py-2 bg-success hover:bg-success-600 text-white rounded-lg transition-colors font-medium">
          Apply Interactive Features
        </button>
      </div>
    </div>
  );
}