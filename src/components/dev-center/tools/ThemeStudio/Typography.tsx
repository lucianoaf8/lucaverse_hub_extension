import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface TypographyProperty {
  id: string;
  name: string;
  category: 'font' | 'size' | 'weight' | 'spacing';
  value: string;
  cssVar: string;
  unit?: string;
}

export default function Typography() {
  const { themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'fonts' | 'sizes' | 'weights' | 'spacing'>('fonts');
  const [typography, setTypography] = useState<TypographyProperty[]>([]);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  
  useEffect(() => {
    const typographyProperties: TypographyProperty[] = [];
    
    // Font families
    if (themeConfig.typography?.fontFamily) {
      Object.entries(themeConfig.typography.fontFamily).forEach(([name, value]) => {
        typographyProperties.push({
          id: `font-${name}`,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          category: 'font',
          value: value as string,
          cssVar: `--font-${name}`
        });
      });
    }
    
    // Font sizes
    if (themeConfig.typography?.fontSize) {
      Object.entries(themeConfig.typography.fontSize).forEach(([size, value]) => {
        typographyProperties.push({
          id: `size-${size}`,
          name: `${size.charAt(0).toUpperCase() + size.slice(1)} Size`,
          category: 'size',
          value: Array.isArray(value) ? value[0] : value as string,
          cssVar: `--text-${size}`,
          unit: 'rem'
        });
      });
    }
    
    setTypography(typographyProperties);
  }, [themeConfig]);
  
  const applyTypographyChange = useCallback((propertyId: string, newValue: string) => {
    const property = typography.find(p => p.id === propertyId);
    if (property) {
      document.documentElement.style.setProperty(property.cssVar, newValue);
      
      setTypography(prev => prev.map(p => 
        p.id === propertyId ? { ...p, value: newValue } : p
      ));
    }
  }, [typography]);
  
  const resetToDefaults = () => {
    typography.forEach(property => {
      document.documentElement.style.removeProperty(property.cssVar);
    });
    window.location.reload();
  };
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        {[
          { id: 'fonts', label: 'Font Families' },
          { id: 'sizes', label: 'Font Sizes' },
          { id: 'weights', label: 'Font Weights' },
          { id: 'spacing', label: 'Letter Spacing' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Preview Text */}
      <div className="bg-elevated rounded-xl p-6">
        <h4 className="text-sm font-medium text-neutral-200 mb-3">Preview</h4>
        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="w-full h-20 px-3 py-2 bg-background border border-neutral-600 rounded 
                     text-neutral-200 resize-none focus:border-primary focus:outline-none"
          placeholder="Enter text to preview typography changes..."
        />
      </div>
      
      {/* Typography Controls */}
      <div className="bg-elevated rounded-xl p-6">
        {activeTab === 'fonts' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Font Families</h3>
            
            {typography.filter(t => t.category === 'font').map(font => (
              <div key={font.id} className="space-y-3">
                <label className="text-sm font-medium text-neutral-300">{font.name}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={font.value}
                    onChange={(e) => applyTypographyChange(font.id, e.target.value)}
                    className="px-3 py-2 bg-background border border-neutral-600 rounded 
                               text-neutral-200 focus:border-primary focus:outline-none"
                  >
                    <option value="Inter, sans-serif">Inter (Default)</option>
                    <option value="system-ui, sans-serif">System UI</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="'Helvetica Neue', sans-serif">Helvetica Neue</option>
                  </select>
                  
                  <div 
                    className="px-4 py-2 bg-background border border-neutral-600 rounded"
                    style={{ fontFamily: font.value }}
                  >
                    {previewText.substring(0, 30)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'sizes' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Font Sizes</h3>
            
            {typography.filter(t => t.category === 'size').map(size => (
              <div key={size.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-neutral-300">{size.name}</label>
                  <span className="text-xs text-neutral-500">{size.value}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.125"
                    value={parseFloat(size.value)}
                    onChange={(e) => applyTypographyChange(size.id, e.target.value + 'rem')}
                    className="w-full"
                  />
                  
                  <div 
                    className="px-4 py-2 bg-background border border-neutral-600 rounded"
                    style={{ fontSize: size.value }}
                  >
                    {previewText.substring(0, 20)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'weights' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Font Weights</h3>
            
            {['Light', 'Regular', 'Medium', 'Semibold', 'Bold'].map(weight => (
              <div key={weight} className="space-y-3">
                <label className="text-sm font-medium text-neutral-300">{weight}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    defaultValue={weight === 'Regular' ? '400' : 
                                  weight === 'Light' ? '300' :
                                  weight === 'Medium' ? '500' :
                                  weight === 'Semibold' ? '600' : '700'}
                    className="px-3 py-2 bg-background border border-neutral-600 rounded 
                               text-neutral-200 focus:border-primary focus:outline-none"
                  >
                    <option value="300">300 (Light)</option>
                    <option value="400">400 (Regular)</option>
                    <option value="500">500 (Medium)</option>
                    <option value="600">600 (Semibold)</option>
                    <option value="700">700 (Bold)</option>
                  </select>
                  
                  <div 
                    className="px-4 py-2 bg-background border border-neutral-600 rounded"
                    style={{ fontWeight: weight === 'Regular' ? 400 : 
                                         weight === 'Light' ? 300 :
                                         weight === 'Medium' ? 500 :
                                         weight === 'Semibold' ? 600 : 700 }}
                  >
                    {previewText.substring(0, 20)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Letter Spacing</h3>
            
            {['Tight', 'Normal', 'Wide', 'Wider'].map(spacing => (
              <div key={spacing} className="space-y-3">
                <label className="text-sm font-medium text-neutral-300">{spacing}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="range"
                    min="-0.1"
                    max="0.3"
                    step="0.01"
                    defaultValue={spacing === 'Tight' ? '-0.025' : 
                                  spacing === 'Normal' ? '0' :
                                  spacing === 'Wide' ? '0.025' : '0.1'}
                    className="w-full"
                  />
                  
                  <div 
                    className="px-4 py-2 bg-background border border-neutral-600 rounded"
                    style={{ letterSpacing: spacing === 'Tight' ? '-0.025em' : 
                                           spacing === 'Normal' ? '0' :
                                           spacing === 'Wide' ? '0.025em' : '0.1em' }}
                  >
                    {previewText.substring(0, 20)}...
                  </div>
                </div>
              </div>
            ))}
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
            Export Typography
          </button>
        </div>
      </div>
    </div>
  );
}