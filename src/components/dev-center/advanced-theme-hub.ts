// src/components/dev-center/AdvancedThemeHub.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeProperty {
  id: string;
  category: 'colors' | 'typography' | 'spacing' | 'shadows' | 'animations' | 'effects';
  name: string;
  type: 'color' | 'slider' | 'select' | 'toggle' | 'text';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
  cssProperty?: string;
  description?: string;
}

export default function AdvancedThemeHub() {
  const { themeConfig, updateTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>('colors');
  const [searchTerm, setSearchTerm] = useState('');
  const [customProperties, setCustomProperties] = useState<ThemeProperty[]>([]);
  const [presets, setPresets] = useState<any[]>([]);

  // Generate theme properties from current config
  const generateThemeProperties = (): ThemeProperty[] => {
    const properties: ThemeProperty[] = [];

    // Color properties
    Object.entries(themeConfig.colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'object') {
        Object.entries(colorValue).forEach(([shade, value]) => {
          properties.push({
            id: `color-${colorName}-${shade}`,
            category: 'colors',
            name: `${colorName} ${shade}`,
            type: 'color',
            value: value,
            cssProperty: `--color-${colorName}-${shade}`,
            description: `${colorName} color shade ${shade}`
          });
        });
      }
    });

    // Typography properties
    Object.entries(themeConfig.typography?.fontSizes || {}).forEach(([size, value]) => {
      properties.push({
        id: `font-size-${size}`,
        category: 'typography',
        name: `Font Size ${size}`,
        type: 'slider',
        value: parseFloat(value.replace('rem', '')),
        min: 0.5,
        max: 4,
        step: 0.1,
        unit: 'rem',
        cssProperty: `--font-size-${size}`
      });
    });

    // Spacing properties
    Object.entries(themeConfig.spacing || {}).forEach(([key, value]) => {
      properties.push({
        id: `spacing-${key}`,
        category: 'spacing',
        name: `Spacing ${key}`,
        type: 'slider',
        value: parseFloat(value.replace('rem', '')),
        min: 0,
        max: 8,
        step: 0.25,
        unit: 'rem',
        cssProperty: `--spacing-${key}`
      });
    });

    // Animation properties
    properties.push(
      {
        id: 'animation-duration-base',
        category: 'animations',
        name: 'Base Duration',
        type: 'slider',
        value: 300,
        min: 100,
        max: 1000,
        step: 50,
        unit: 'ms',
        cssProperty: '--animation-duration-base'
      },
      {
        id: 'animation-easing',
        category: 'animations',
        name: 'Easing Function',
        type: 'select',
        value: 'ease-in-out',
        options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(0.4, 0, 0.2, 1)'],
        cssProperty: '--animation-easing'
      }
    );

    // Effect properties
    properties.push(
      {
        id: 'blur-intensity',
        category: 'effects',
        name: 'Backdrop Blur',
        type: 'slider',
        value: 12,
        min: 0,
        max: 50,
        step: 2,
        unit: 'px',
        cssProperty: '--blur-intensity'
      },
      {
        id: 'glow-intensity',
        category: 'effects',
        name: 'Glow Intensity',
        type: 'slider',
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.05,
        cssProperty: '--glow-intensity'
      }
    );

    return properties;
  };

  const [themeProperties, setThemeProperties] = useState<ThemeProperty[]>(generateThemeProperties());

  useEffect(() => {
    setThemeProperties(generateThemeProperties());
  }, [themeConfig]);

  const categories = [
    { id: 'colors', name: 'Colors', icon: '🎨', count: themeProperties.filter(p => p.category === 'colors').length },
    { id: 'typography', name: 'Typography', icon: '📝', count: themeProperties.filter(p => p.category === 'typography').length },
    { id: 'spacing', name: 'Spacing', icon: '📏', count: themeProperties.filter(p => p.category === 'spacing').length },
    { id: 'animations', name: 'Animations', icon: '⚡', count: themeProperties.filter(p => p.category === 'animations').length },
    { id: 'effects', name: 'Effects', icon: '✨', count: themeProperties.filter(p => p.category === 'effects').length }
  ];

  const filteredProperties = themeProperties.filter(property => 
    property.category === activeCategory &&
    property.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateProperty = (propertyId: string, newValue: any) => {
    const property = themeProperties.find(p => p.id === propertyId);
    if (!property) return;

    // Update the property value
    setThemeProperties(prev => 
      prev.map(p => p.id === propertyId ? { ...p, value: newValue } : p)
    );

    // Apply to CSS custom properties for real-time preview
    if (property.cssProperty) {
      const cssValue = property.unit ? `${newValue}${property.unit}` : newValue;
      document.documentElement.style.setProperty(property.cssProperty, cssValue);
    }
  };

  const renderPropertyControl = (property: ThemeProperty) => {
    switch (property.type) {
      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={property.value}
              onChange={(e) => updateProperty(property.id, e.target.value)}
              className="w-12 h-8 rounded border border-neutral-700"
            />
            <input
              type="text"
              value={property.value}
              onChange={(e) => updateProperty(property.id, e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm font-mono"
            />
            <button
              onClick={() => navigator.clipboard.writeText(property.value)}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Copy color value"
            >
              📋
            </button>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min={property.min}
                max={property.max}
                step={property.step}
                value={property.value}
                onChange={(e) => updateProperty(property.id, parseFloat(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center space-x-1 min-w-0">
                <input
                  type="number"
                  min={property.min}
                  max={property.max}
                  step={property.step}
                  value={property.value}
                  onChange={(e) => updateProperty(property.id, parseFloat(e.target.value))}
                  className="w-20 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-center"
                />
                {property.unit && (
                  <span className="text-xs text-neutral-400 flex-shrink-0">{property.unit}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            value={property.value}
            onChange={(e) => updateProperty(property.id, e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm"
          >
            {property.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'toggle':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={property.value}
              onChange={(e) => updateProperty(property.id, e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Enabled</span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={property.value}
            onChange={(e) => updateProperty(property.id, e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm"
          />
        );
    }
  };

  const exportTheme = () => {
    const themeData = {
      name: `Custom Theme ${new Date().toISOString().split('T')[0]}`,
      properties: themeProperties.reduce((acc, prop) => {
        acc[prop.id] = prop.value;
        return acc;
      }, {} as any),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRandomTheme = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const colorProperties = themeProperties.filter(p => p.category === 'colors' && p.name.includes('primary'));
    
    colorProperties.forEach(prop => {
      const saturation = prop.name.includes('50') ? 10 : prop.name.includes('900') ? 95 : 70;
      const lightness = prop.name.includes('50') ? 95 : prop.name.includes('900') ? 15 : 50;
      const hslColor = `hsl(${randomHue}, ${saturation}%, ${lightness}%)`;
      updateProperty(prop.id, hslColor);
    });
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-elevated border-r border-neutral-700 p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Theme Hub</h3>
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm"
          />
        </div>

        {/* Categories */}
        <div className="space-y-1 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                activeCategory === category.id
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <span className="text-xs bg-neutral-700 px-2 py-1 rounded">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button onClick={generateRandomTheme} className="w-full btn btn-secondary text-sm">
            🎲 Random Theme
          </button>
          <button onClick={exportTheme} className="w-full btn btn-secondary text-sm">
            💾 Export Theme
          </button>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              {categories.find(c => c.id === activeCategory)?.icon}{' '}
              {categories.find(c => c.id === activeCategory)?.name}
            </h2>
            <p className="text-neutral-400">
              {filteredProperties.length} properties • Live preview enabled
            </p>
          </div>

          <div className="space-y-6">
            {filteredProperties.map(property => (
              <div key={property.id} className="bg-surface rounded-lg p-4 border border-neutral-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-secondary">{property.name}</h4>
                    {property.description && (
                      <p className="text-sm text-neutral-400 mt-1">{property.description}</p>
                    )}
                  </div>
                  {property.cssProperty && (
                    <code className="text-xs text-neutral-500 bg-neutral-800 px-2 py-1 rounded">
                      {property.cssProperty}
                    </code>
                  )}
                </div>
                {renderPropertyControl(property)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}