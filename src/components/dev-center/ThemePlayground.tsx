import React, { useState } from 'react';

interface ThemeProperty {
  id: string;
  name: string;
  category: 'color' | 'typography' | 'spacing' | 'animation';
  cssVar: string;
  value: string;
  type: 'color' | 'number' | 'string';
  min?: number;
  max?: number;
  unit?: string;
}

export default function ThemePlayground() {
  const [activeCategory, setActiveCategory] = useState<'color' | 'typography' | 'spacing' | 'animation'>('color');
  const [customProperties, setCustomProperties] = useState<ThemeProperty[]>([
    {
      id: 'primary-500',
      name: 'Primary Color',
      category: 'color',
      cssVar: '--color-primary-500',
      value: '#00D4FF',
      type: 'color',
    },
    {
      id: 'secondary-500',
      name: 'Secondary Color',
      category: 'color',
      cssVar: '--color-secondary-500',
      value: '#FF6B6B',
      type: 'color',
    },
    {
      id: 'success-500',
      name: 'Success Color',
      category: 'color',
      cssVar: '--color-success-500',
      value: '#51CF66',
      type: 'color',
    },
    {
      id: 'warning-500',
      name: 'Warning Color',
      category: 'color',
      cssVar: '--color-warning-500',
      value: '#FFD43B',
      type: 'color',
    },
    {
      id: 'danger-500',
      name: 'Danger Color',
      category: 'color',
      cssVar: '--color-danger-500',
      value: '#FF6B6B',
      type: 'color',
    },
    {
      id: 'font-size-base',
      name: 'Base Font Size',
      category: 'typography',
      cssVar: '--font-size-base',
      value: '16',
      type: 'number',
      min: 12,
      max: 24,
      unit: 'px',
    },
    {
      id: 'font-size-lg',
      name: 'Large Font Size',
      category: 'typography',
      cssVar: '--font-size-lg',
      value: '18',
      type: 'number',
      min: 14,
      max: 28,
      unit: 'px',
    },
    {
      id: 'spacing-base',
      name: 'Base Spacing',
      category: 'spacing',
      cssVar: '--spacing-base',
      value: '16',
      type: 'number',
      min: 4,
      max: 32,
      unit: 'px',
    },
    {
      id: 'spacing-lg',
      name: 'Large Spacing',
      category: 'spacing',
      cssVar: '--spacing-lg',
      value: '24',
      type: 'number',
      min: 8,
      max: 48,
      unit: 'px',
    },
    {
      id: 'duration-base',
      name: 'Base Duration',
      category: 'animation',
      cssVar: '--duration-base',
      value: '300',
      type: 'number',
      min: 100,
      max: 1000,
      unit: 'ms',
    },
    {
      id: 'duration-slow',
      name: 'Slow Duration',
      category: 'animation',
      cssVar: '--duration-slow',
      value: '500',
      type: 'number',
      min: 200,
      max: 2000,
      unit: 'ms',
    },
  ]);

  const categories = [
    { id: 'color', name: 'Colors', icon: '🎨' },
    { id: 'typography', name: 'Typography', icon: '📝' },
    { id: 'spacing', name: 'Spacing', icon: '📐' },
    { id: 'animation', name: 'Animation', icon: '⚡' },
  ] as const;

  const filteredProperties = customProperties.filter(prop => prop.category === activeCategory);

  const updateProperty = (id: string, value: string) => {
    setCustomProperties(prev =>
      prev.map(prop =>
        prop.id === id ? { ...prop, value } : prop
      )
    );

    const property = customProperties.find(p => p.id === id);
    if (property) {
      const cssValue = property.type === 'number' ? `${value}${property.unit || ''}` : value;
      document.documentElement.style.setProperty(property.cssVar, cssValue);
    }
  };

  const resetToDefaults = () => {
    const defaultProperties = [
      { id: 'primary-500', value: '#00D4FF' },
      { id: 'secondary-500', value: '#FF6B6B' },
      { id: 'success-500', value: '#51CF66' },
      { id: 'warning-500', value: '#FFD43B' },
      { id: 'danger-500', value: '#FF6B6B' },
      { id: 'font-size-base', value: '16' },
      { id: 'font-size-lg', value: '18' },
      { id: 'spacing-base', value: '16' },
      { id: 'spacing-lg', value: '24' },
      { id: 'duration-base', value: '300' },
      { id: 'duration-slow', value: '500' },
    ];

    setCustomProperties(prev =>
      prev.map(prop => {
        const defaultProp = defaultProperties.find(d => d.id === prop.id);
        if (defaultProp) {
          const cssValue = prop.type === 'number' ? `${defaultProp.value}${prop.unit || ''}` : defaultProp.value;
          document.documentElement.style.setProperty(prop.cssVar, cssValue);
          return { ...prop, value: defaultProp.value };
        }
        return prop;
      })
    );
  };

  const exportTheme = () => {
    const themeConfig = {
      name: 'Custom Theme',
      timestamp: new Date().toISOString(),
      properties: customProperties.reduce((acc, prop) => {
        acc[prop.cssVar] = prop.type === 'number' ? `${prop.value}${prop.unit || ''}` : prop.value;
        return acc;
      }, {} as Record<string, string>),
    };

    const blob = new Blob([JSON.stringify(themeConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
              className="w-10 h-10 rounded border border-neutral-600 cursor-pointer"
            />
            <input
              type="text"
              value={property.value}
              onChange={(e) => updateProperty(property.id, e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm"
              placeholder="#000000"
            />
          </div>
        );
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={property.min}
              max={property.max}
              value={property.value}
              onChange={(e) => updateProperty(property.id, e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={property.min}
                max={property.max}
                value={property.value}
                onChange={(e) => updateProperty(property.id, e.target.value)}
                className="w-16 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-center"
              />
              {property.unit && (
                <span className="text-xs text-neutral-400">{property.unit}</span>
              )}
            </div>
          </div>
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

  return (
    <div className="bg-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Theme Playground</h2>
          <p className="text-neutral-400">Advanced theme testing and manipulation interface</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={exportTheme}
            className="btn btn-secondary text-sm"
          >
            📄 Export Theme
          </button>
          <button
            onClick={resetToDefaults}
            className="btn btn-danger text-sm"
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Selector */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-secondary mb-4">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-base ${
                  activeCategory === category.id
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-neutral-700 hover:border-neutral-600 bg-surface'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Property Controls */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-secondary mb-4">
            {categories.find(c => c.id === activeCategory)?.name} Properties
          </h3>
          <div className="space-y-4">
            {filteredProperties.map((property) => (
              <div key={property.id} className="p-4 bg-surface rounded-lg border border-neutral-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-neutral-300">{property.name}</h4>
                    <p className="text-xs text-neutral-500 font-mono">{property.cssVar}</p>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {property.type === 'color' && (
                      <div
                        className="w-6 h-6 rounded border border-neutral-600"
                        style={{ backgroundColor: property.value }}
                      />
                    )}
                  </div>
                </div>
                {renderPropertyControl(property)}
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-secondary mb-4">Live Preview</h3>
          <div className="space-y-4">
            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <h4 className="font-medium text-primary mb-3">Color Preview</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-primary/20 border border-primary/30 rounded text-center">
                  <div className="text-primary text-sm font-medium">Primary</div>
                </div>
                <div className="p-2 bg-secondary/20 border border-secondary/30 rounded text-center">
                  <div className="text-secondary text-sm font-medium">Secondary</div>
                </div>
                <div className="p-2 bg-success/20 border border-success/30 rounded text-center">
                  <div className="text-success text-sm font-medium">Success</div>
                </div>
                <div className="p-2 bg-warning/20 border border-warning/30 rounded text-center">
                  <div className="text-warning text-sm font-medium">Warning</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <h4 className="font-medium text-primary mb-3">Typography</h4>
              <div className="space-y-2">
                <div className="text-2xl font-bold">Heading Large</div>
                <div className="text-lg font-semibold">Heading Medium</div>
                <div className="text-base">Body text example</div>
                <div className="text-sm text-neutral-400">Small text</div>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <h4 className="font-medium text-primary mb-3">Components</h4>
              <div className="space-y-3">
                <button className="btn btn-primary w-full">Primary Button</button>
                <button className="btn btn-secondary w-full">Secondary Button</button>
                <input
                  type="text"
                  placeholder="Input field"
                  className="input w-full"
                />
                <div className="panel">
                  <div className="text-sm font-medium text-primary mb-1">Panel Example</div>
                  <div className="text-xs text-neutral-400">Panel with current theme</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <h4 className="font-medium text-primary mb-3">Animation Test</h4>
              <div className="space-y-2">
                <div className="w-full h-2 bg-neutral-700 rounded overflow-hidden">
                  <div 
                    className="h-full bg-primary animate-pulse"
                    style={{ width: '60%' }}
                  />
                </div>
                <div className="text-xs text-neutral-400">
                  Animation timing: {customProperties.find(p => p.id === 'duration-base')?.value}ms
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-surface rounded-lg border border-neutral-700">
        <h3 className="text-lg font-medium text-secondary mb-4">CSS Variables Output</h3>
        <div className="bg-neutral-800 rounded p-4 max-h-64 overflow-y-auto">
          <pre className="text-xs text-neutral-300 font-mono">
            {customProperties.map((prop) => {
              const value = prop.type === 'number' ? `${prop.value}${prop.unit || ''}` : prop.value;
              return `${prop.cssVar}: ${value};\n`;
            }).join('')}
          </pre>
        </div>
      </div>
    </div>
  );
}