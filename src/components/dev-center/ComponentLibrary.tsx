import React, { useState } from 'react';

export default function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const components = [
    {
      id: 'button',
      name: 'Button',
      category: 'Form',
      description: 'Primary action button with theme variants',
      code: `<button className="btn btn-primary">Primary Button</button>`,
      examples: [
        { name: 'Primary', code: '<button className="btn btn-primary">Primary</button>' },
        { name: 'Secondary', code: '<button className="btn btn-secondary">Secondary</button>' },
        { name: 'Success', code: '<button className="btn btn-success">Success</button>' },
      ]
    },
    {
      id: 'input',
      name: 'Input',
      category: 'Form',
      description: 'Text input with validation states',
      code: `<input type="text" className="input" placeholder="Enter text..." aria-label="Example text input" />`,
      examples: [
        { name: 'Default', code: '<input type="text" className="input" placeholder="Default" aria-label="Example text input" />' },
        { name: 'Email', code: '<input type="email" className="input" placeholder="Email" aria-label="Example email input" />' },
        { name: 'Password', code: '<input type="password" className="input" placeholder="Password" aria-label="Example password input" />' },
      ]
    },
    {
      id: 'panel',
      name: 'Panel',
      category: 'Layout',
      description: 'Content panel with theme-aware styling',
      code: `<div className="panel">Panel content</div>`,
      examples: [
        { name: 'Basic', code: '<div className="panel">Basic panel</div>' },
        { name: 'With Animation', code: '<div className="panel animate-fade-in">Animated panel</div>' },
      ]
    },
    {
      id: 'theme-switcher',
      name: 'Theme Switcher',
      category: 'Control',
      description: 'Theme switching component',
      code: `<ThemeSwitcher />`,
      examples: [
        { name: 'Full Switcher', code: '<ThemeSwitcher />' },
        { name: 'Toggle Button', code: '<ThemeToggleButton />' },
      ]
    }
  ];

  const filteredComponents = components.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="bg-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-primary">Component Library</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-64"
          />
          <span className="text-sm text-neutral-400">
            {filteredComponents.length} components
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-secondary">Available Components</h3>
          <div className="space-y-2">
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-base ${
                  selectedComponent === component.id
                    ? 'border-primary bg-primary/10'
                    : 'border-neutral-700 hover:border-neutral-600 bg-surface'
                }`}
                onClick={() => setSelectedComponent(component.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-primary">{component.name}</h4>
                    <p className="text-sm text-neutral-400">{component.category}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(component.code);
                    }}
                    className="p-2 hover:bg-neutral-700 rounded transition-colors"
                    title="Copy code"
                  >
                    📋
                  </button>
                </div>
                <p className="text-sm text-neutral-300 mt-2">{component.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-secondary">Component Details</h3>
          {selectedComponent ? (
            <div className="space-y-4">
              {(() => {
                const component = components.find(c => c.id === selectedComponent);
                if (!component) return null;

                return (
                  <>
                    <div className="p-4 bg-surface rounded-lg border border-neutral-700">
                      <h4 className="font-medium text-primary mb-2">{component.name}</h4>
                      <p className="text-sm text-neutral-300 mb-4">{component.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-secondary mb-2">Basic Usage</h5>
                          <div className="bg-neutral-800 rounded p-3 relative">
                            <pre className="text-sm text-neutral-300 overflow-x-auto">
                              <code>{component.code}</code>
                            </pre>
                            <button
                              onClick={() => copyToClipboard(component.code)}
                              className="absolute top-2 right-2 p-1 hover:bg-neutral-700 rounded text-sm"
                              title="Copy code"
                            >
                              📋
                            </button>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-secondary mb-2">Examples</h5>
                          <div className="space-y-2">
                            {component.examples.map((example, index) => (
                              <div key={index} className="bg-neutral-800 rounded p-3 relative">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-neutral-400">{example.name}</span>
                                  <button
                                    onClick={() => copyToClipboard(example.code)}
                                    className="p-1 hover:bg-neutral-700 rounded text-xs"
                                    title="Copy code"
                                  >
                                    📋
                                  </button>
                                </div>
                                <pre className="text-xs text-neutral-300 overflow-x-auto">
                                  <code>{example.code}</code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-surface rounded-lg border border-neutral-700">
                      <h5 className="text-sm font-medium text-secondary mb-2">Live Preview</h5>
                      <div className="p-4 bg-background rounded border border-neutral-700">
                        <div className="text-center text-neutral-400 py-8">
                          <span className="text-4xl mb-2 block">🚧</span>
                          <p className="text-sm">Live preview coming soon</p>
                          <p className="text-xs text-neutral-500 mt-1">Interactive component testing interface</p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="p-8 bg-surface rounded-lg border border-neutral-700 text-center">
              <span className="text-4xl mb-4 block">📚</span>
              <p className="text-neutral-400">Select a component to view details</p>
              <p className="text-sm text-neutral-500 mt-2">
                Click on any component from the list to see usage examples and documentation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}