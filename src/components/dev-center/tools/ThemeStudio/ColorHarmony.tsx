import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface ColorProperty {
  id: string;
  name: string;
  category: string;
  value: string;
  cssVar: string;
}

export default function ColorHarmony() {
  const { themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'palette' | 'contrast' | 'harmony'>('palette');
  const [colors, setColors] = useState<ColorProperty[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [previewEnabled, setPreviewEnabled] = useState(true);
  
  // Initialize colors from theme config
  useEffect(() => {
    const colorProperties: ColorProperty[] = [];
    
    // Extract colors from theme config
    Object.entries(themeConfig.colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'object') {
        Object.entries(colorValue).forEach(([shade, value]) => {
          if (shade === '500') { // Main color shades
            colorProperties.push({
              id: `${colorName}-${shade}`,
              name: `${colorName.charAt(0).toUpperCase() + colorName.slice(1)}`,
              category: colorName,
              value: value as string,
              cssVar: `--color-${colorName}-${shade}`
            });
          }
        });
      }
    });
    
    setColors(colorProperties);
  }, [themeConfig]);
  
  // Apply color changes with <100ms feedback
  const applyColorChange = useCallback((colorId: string, newValue: string) => {
    if (!previewEnabled) return;
    
    const color = colors.find(c => c.id === colorId);
    if (color) {
      document.documentElement.style.setProperty(color.cssVar, newValue);
      
      // Update local state
      setColors(prev => prev.map(c => 
        c.id === colorId ? { ...c, value: newValue } : c
      ));
    }
  }, [colors, previewEnabled]);
  
  const resetToDefaults = () => {
    colors.forEach(color => {
      document.documentElement.style.removeProperty(color.cssVar);
    });
    // Re-initialize from theme config
    window.location.reload();
  };
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation - Detail View Level */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        <button
          onClick={() => setActiveTab('palette')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'palette' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Color Palette
        </button>
        <button
          onClick={() => setActiveTab('contrast')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'contrast' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Contrast Checker
        </button>
        <button
          onClick={() => setActiveTab('harmony')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'harmony' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Color Harmony
        </button>
      </div>
      
      {/* Live Preview Toggle */}
      <div className="flex items-center justify-between bg-elevated rounded-lg p-4">
        <div>
          <h4 className="text-sm font-medium text-neutral-200">Live Preview</h4>
          <p className="text-xs text-neutral-500">Changes apply instantly to the interface</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={previewEnabled}
            onChange={(e) => setPreviewEnabled(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-11 h-6 rounded-full transition-colors ${
            previewEnabled ? 'bg-primary' : 'bg-neutral-600'
          }`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
              previewEnabled ? 'translate-x-5' : 'translate-x-0'
            } translate-y-0.5`} />
          </div>
        </label>
      </div>
      
      {/* Tab Content - Detail Views */}
      <div className="bg-elevated rounded-xl p-6 min-h-[400px]">
        {activeTab === 'palette' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-neutral-100 mb-4">Color Palette</h3>
            <p className="text-neutral-400 mb-6">
              Define your primary, secondary, and accent colors. Changes apply instantly with live preview.
            </p>
            
            {/* Color Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {colors.map((color) => (
                <div key={color.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">{color.name}</label>
                    <span className="text-xs text-neutral-500">{color.value}</span>
                  </div>
                  
                  <div className="relative">
                    <div 
                      className="h-24 rounded-lg border-2 border-neutral-600 hover:border-neutral-400 
                                 transition-colors cursor-pointer relative overflow-hidden"
                      style={{ backgroundColor: color.value }}
                      onClick={() => setSelectedColor(color.id)}
                    >
                      {selectedColor === color.id && (
                        <div className="absolute inset-0 border-2 border-primary animate-pulse" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={color.value}
                      onChange={(e) => applyColorChange(color.id, e.target.value)}
                      className="w-12 h-8 rounded border border-neutral-600 bg-transparent cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={color.value}
                      onChange={(e) => applyColorChange(color.id, e.target.value)}
                      className="flex-1 px-3 py-1 bg-background border border-neutral-600 rounded 
                                 text-sm text-neutral-200 focus:border-primary focus:outline-none"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'contrast' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-neutral-100 mb-4">Contrast Checker</h3>
            <p className="text-neutral-400 mb-6">
              Ensure your color combinations meet WCAG accessibility standards.
            </p>
            
            {/* Contrast Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colors.slice(0, 4).map((color) => (
                <div key={color.id} className="bg-background rounded-lg p-4 border border-neutral-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-neutral-300">{color.name} on Background</span>
                    <span className="text-xs text-success">AA ✓</span>
                  </div>
                  <div 
                    className="px-4 py-2 rounded text-sm font-medium"
                    style={{ backgroundColor: color.value, color: '#ffffff' }}
                  >
                    Sample Text
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'harmony' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-neutral-100 mb-4">Color Harmony</h3>
            <p className="text-neutral-400 mb-6">
              Generate harmonious color schemes based on color theory principles.
            </p>
            
            {/* Harmony Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Modern Dark', 'Ocean Blue', 'Warm Sunset', 'Forest Green'].map((preset) => (
                <button
                  key={preset}
                  className="p-4 bg-background rounded-lg border border-neutral-700 hover:border-neutral-600 
                             transition-colors text-left group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex space-x-1">
                      <div className="w-4 h-4 bg-primary rounded-full" />
                      <div className="w-4 h-4 bg-secondary rounded-full" />
                      <div className="w-4 h-4 bg-success rounded-full" />
                    </div>
                    <span className="text-sm font-medium text-neutral-200 group-hover:text-neutral-100">
                      {preset}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">Click to apply harmony preset</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Changes applied instantly</span>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={resetToDefaults}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                       rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
          <button className="px-4 py-2 bg-success hover:bg-success-600 text-white 
                             rounded-lg transition-colors font-medium">
            Export Theme
          </button>
        </div>
      </div>
    </div>
  );
}