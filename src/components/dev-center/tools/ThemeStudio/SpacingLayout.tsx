import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';

interface SpacingProperty {
  id: string;
  name: string;
  value: string;
  cssVar: string;
  category: 'spacing' | 'radius' | 'layout';
}

export default function SpacingLayout() {
  const { themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState<'spacing' | 'radius' | 'layout'>('spacing');
  const [spacingProperties, setSpacingProperties] = useState<SpacingProperty[]>([]);
  
  useEffect(() => {
    const properties: SpacingProperty[] = [];
    
    // Spacing values
    if (themeConfig.spacing) {
      Object.entries(themeConfig.spacing).forEach(([key, value]) => {
        properties.push({
          id: `spacing-${key}`,
          name: `Space ${key}`,
          value: value as string,
          cssVar: `--space-${key}`,
          category: 'spacing'
        });
      });
    }
    
    // Border radius values
    if (themeConfig.borderRadius) {
      Object.entries(themeConfig.borderRadius).forEach(([key, value]) => {
        properties.push({
          id: `radius-${key}`,
          name: `Radius ${key}`,
          value: value as string,
          cssVar: `--radius-${key}`,
          category: 'radius'
        });
      });
    }
    
    setSpacingProperties(properties);
  }, [themeConfig]);
  
  const applySpacingChange = useCallback((propertyId: string, newValue: string) => {
    const property = spacingProperties.find(p => p.id === propertyId);
    if (property) {
      document.documentElement.style.setProperty(property.cssVar, newValue);
      
      setSpacingProperties(prev => prev.map(p => 
        p.id === propertyId ? { ...p, value: newValue } : p
      ));
    }
  }, [spacingProperties]);
  
  const resetToDefaults = () => {
    spacingProperties.forEach(property => {
      document.documentElement.style.removeProperty(property.cssVar);
    });
    window.location.reload();
  };
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        {[
          { id: 'spacing', label: 'Spacing Scale' },
          { id: 'radius', label: 'Border Radius' },
          { id: 'layout', label: 'Layout Tokens' }
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
      
      {/* Content */}
      <div className="bg-elevated rounded-xl p-6">
        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Spacing Scale</h3>
            <p className="text-neutral-400 mb-6">
              Define consistent spacing values for margins, padding, and gaps.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spacingProperties.filter(p => p.category === 'spacing').map(spacing => (
                <div key={spacing.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">{spacing.name}</label>
                    <span className="text-xs text-neutral-500">{spacing.value}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="128"
                      step="4"
                      value={parseInt(spacing.value)}
                      onChange={(e) => applySpacingChange(spacing.id, e.target.value + 'px')}
                      className="flex-1"
                    />
                    <input
                      type="text"
                      value={spacing.value}
                      onChange={(e) => applySpacingChange(spacing.id, e.target.value)}
                      className="w-20 px-2 py-1 bg-background border border-neutral-600 rounded 
                                 text-sm text-neutral-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                  
                  {/* Visual Preview */}
                  <div className="bg-background rounded border border-neutral-600 p-4">
                    <div 
                      className="bg-primary rounded"
                      style={{ 
                        width: '100%', 
                        height: '24px',
                        margin: `${spacing.value} 0`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'radius' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Border Radius</h3>
            <p className="text-neutral-400 mb-6">
              Configure border radius values for consistent rounded corners.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spacingProperties.filter(p => p.category === 'radius').map(radius => (
                <div key={radius.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">{radius.name}</label>
                    <span className="text-xs text-neutral-500">{radius.value}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={parseInt(radius.value)}
                      onChange={(e) => applySpacingChange(radius.id, e.target.value + 'px')}
                      className="flex-1"
                    />
                    <input
                      type="text"
                      value={radius.value}
                      onChange={(e) => applySpacingChange(radius.id, e.target.value)}
                      className="w-20 px-2 py-1 bg-background border border-neutral-600 rounded 
                                 text-sm text-neutral-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                  
                  {/* Visual Preview */}
                  <div className="bg-background rounded border border-neutral-600 p-4">
                    <div 
                      className="bg-primary w-full h-16"
                      style={{ borderRadius: radius.value }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'layout' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Layout Tokens</h3>
            <p className="text-neutral-400 mb-6">
              Define layout-specific tokens for containers, grids, and breakpoints.
            </p>
            
            <div className="space-y-4">
              {[
                { name: 'Container Max Width', value: '1200px', var: '--container-max-width' },
                { name: 'Grid Gap', value: '24px', var: '--grid-gap' },
                { name: 'Section Padding', value: '80px', var: '--section-padding' },
                { name: 'Card Padding', value: '24px', var: '--card-padding' }
              ].map(token => (
                <div key={token.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">{token.name}</label>
                    <span className="text-xs text-neutral-500">{token.value}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="4"
                      value={parseInt(token.value)}
                      className="flex-1"
                    />
                    <input
                      type="text"
                      defaultValue={token.value}
                      className="w-24 px-2 py-1 bg-background border border-neutral-600 rounded 
                                 text-sm text-neutral-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
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
            Export Spacing
          </button>
        </div>
      </div>
    </div>
  );
}