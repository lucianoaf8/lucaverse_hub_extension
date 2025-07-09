import React, { useState } from 'react';

interface ComponentSpec {
  name: string;
  type: 'button' | 'card' | 'input' | 'modal' | 'custom';
  props: Record<string, any>;
  variants: string[];
}

export default function BuildComponent() {
  const [activeTab, setActiveTab] = useState<'library' | 'builder' | 'code'>('library');
  const [selectedComponent, setSelectedComponent] = useState<ComponentSpec | null>(null);
  const [componentCode, setComponentCode] = useState('');
  
  const componentLibrary = [
    {
      name: 'Button',
      type: 'button' as const,
      props: { variant: 'primary', size: 'medium', disabled: false },
      variants: ['primary', 'secondary', 'danger', 'ghost']
    },
    {
      name: 'Card',
      type: 'card' as const,
      props: { elevated: true, bordered: false },
      variants: ['default', 'elevated', 'bordered', 'flat']
    },
    {
      name: 'Input',
      type: 'input' as const,
      props: { type: 'text', placeholder: 'Enter text...', error: false },
      variants: ['text', 'email', 'password', 'search']
    },
    {
      name: 'Modal',
      type: 'modal' as const,
      props: { open: false, title: 'Modal Title', size: 'medium' },
      variants: ['small', 'medium', 'large', 'fullscreen']
    }
  ];
  
  const generateComponentCode = (component: ComponentSpec) => {
    const propsString = Object.entries(component.props)
      .map(([key, value]) => `${key}=${typeof value === 'string' ? `"${value}"` : `{${value}}`}`)
      .join(' ');
    
    return `import React from 'react';

interface ${component.name}Props {
  ${Object.entries(component.props).map(([key, value]) => 
    `${key}: ${typeof value};`
  ).join('\n  ')}
}

export default function ${component.name}({ ${Object.keys(component.props).join(', ')} }: ${component.name}Props) {
  return (
    <div className="component-${component.name.toLowerCase()}">
      {/* Component implementation */}
    </div>
  );
}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'library' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Component Library
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'builder' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Visual Builder
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'code' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Code Editor
        </button>
      </div>
      
      {/* Content */}
      <div className="bg-elevated rounded-xl p-6">
        {activeTab === 'library' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Component Library</h3>
            <p className="text-neutral-400">
              Browse and select components to build or modify.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {componentLibrary.map((component) => (
                <button
                  key={component.name}
                  onClick={() => setSelectedComponent(component)}
                  className={`p-4 rounded-lg border transition-all text-left ${
                    selectedComponent?.name === component.name
                      ? 'border-primary bg-primary/10'
                      : 'border-neutral-600 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-200">{component.name}</h4>
                    <span className="text-xs text-neutral-500">{component.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {component.variants.map((variant) => (
                      <span
                        key={variant}
                        className="px-2 py-1 bg-neutral-700 text-xs rounded text-neutral-300"
                      >
                        {variant}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            
            {selectedComponent && (
              <div className="mt-6 p-4 bg-background rounded-lg border border-neutral-600">
                <h4 className="font-medium text-neutral-200 mb-3">Component Props</h4>
                <div className="space-y-2">
                  {Object.entries(selectedComponent.props).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-300">{key}</span>
                      <span className="text-sm text-neutral-500">{typeof value}: {String(value)}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setComponentCode(generateComponentCode(selectedComponent))}
                  className="mt-4 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Generate Code
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Visual Builder</h3>
            <p className="text-neutral-400">
              Build components visually with drag-and-drop interface.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Component Palette</h4>
                <div className="grid grid-cols-2 gap-3">
                  {['Button', 'Input', 'Card', 'Text', 'Image', 'Icon'].map((element) => (
                    <button
                      key={element}
                      className="p-3 bg-background border border-neutral-600 rounded-lg hover:border-neutral-500 transition-colors"
                    >
                      <div className="text-sm font-medium text-neutral-200">{element}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Canvas</h4>
                <div className="min-h-64 bg-background border border-neutral-600 rounded-lg p-4">
                  <div className="text-center text-neutral-500 py-12">
                    Drag components here to build your interface
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'code' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Code Editor</h3>
            <p className="text-neutral-400">
              Write or edit component code directly.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-300">Component Code</label>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded text-sm transition-colors">
                    Format
                  </button>
                  <button className="px-3 py-1 bg-success hover:bg-success-600 text-white rounded text-sm transition-colors">
                    Save
                  </button>
                </div>
              </div>
              
              <textarea
                value={componentCode}
                onChange={(e) => setComponentCode(e.target.value)}
                className="w-full h-96 px-4 py-3 bg-background border border-neutral-600 rounded-lg 
                           text-sm text-neutral-200 font-mono resize-none focus:border-primary focus:outline-none"
                placeholder="Enter component code here..."
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Building component</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                             rounded-lg transition-colors">
            Reset
          </button>
          <button className="px-4 py-2 bg-success hover:bg-success-600 text-white 
                             rounded-lg transition-colors font-medium">
            Preview Component
          </button>
        </div>
      </div>
    </div>
  );
}