import React, { useState } from 'react';

interface ComponentState {
  id: string;
  name: string;
  props: Record<string, any>;
  description: string;
  tested: boolean;
}

export default function TestStates() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'visual' | 'interactive'>('matrix');
  const [selectedComponent, setSelectedComponent] = useState('Button');
  const [componentStates, setComponentStates] = useState<ComponentState[]>([
    { id: 'default', name: 'Default', props: { variant: 'primary', disabled: false }, description: 'Normal state', tested: false },
    { id: 'hover', name: 'Hover', props: { variant: 'primary', disabled: false }, description: 'Mouse hover state', tested: false },
    { id: 'disabled', name: 'Disabled', props: { variant: 'primary', disabled: true }, description: 'Disabled state', tested: false },
    { id: 'loading', name: 'Loading', props: { variant: 'primary', loading: true }, description: 'Loading state', tested: false },
    { id: 'error', name: 'Error', props: { variant: 'danger', error: true }, description: 'Error state', tested: false },
  ]);
  
  const toggleStateTested = (stateId: string) => {
    setComponentStates(prev => prev.map(state => 
      state.id === stateId ? { ...state, tested: !state.tested } : state
    ));
  };
  
  const testAllStates = () => {
    setComponentStates(prev => prev.map(state => ({ ...state, tested: true })));
  };
  
  const resetAllTests = () => {
    setComponentStates(prev => prev.map(state => ({ ...state, tested: false })));
  };
  
  const completedTests = componentStates.filter(state => state.tested).length;
  const totalTests = componentStates.length;
  
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-elevated rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-200">Test Progress</span>
          <span className="text-sm text-neutral-400">{completedTests}/{totalTests} states tested</span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-2">
          <div 
            className="bg-success h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedTests / totalTests) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-neutral-500">Target: All states tested &lt; 30 seconds</span>
          <span className="text-xs text-neutral-500">{Math.round((completedTests / totalTests) * 100)}% complete</span>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'matrix' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          State Matrix
        </button>
        <button
          onClick={() => setActiveTab('visual')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'visual' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Visual Testing
        </button>
        <button
          onClick={() => setActiveTab('interactive')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'interactive' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Interactive Testing
        </button>
      </div>
      
      {/* Content */}
      <div className="bg-elevated rounded-xl p-6">
        {activeTab === 'matrix' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-neutral-100">State Matrix Testing</h3>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="px-3 py-2 bg-background border border-neutral-600 rounded 
                           text-neutral-200 focus:border-primary focus:outline-none"
              >
                <option value="Button">Button</option>
                <option value="Input">Input</option>
                <option value="Card">Card</option>
                <option value="Modal">Modal</option>
              </select>
            </div>
            
            <p className="text-neutral-400">
              Test all possible states and variants of your component systematically.
            </p>
            
            <div className="space-y-4">
              {componentStates.map((state) => (
                <div key={state.id} className="bg-background rounded-lg p-4 border border-neutral-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleStateTested(state.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          state.tested 
                            ? 'bg-success border-success text-white' 
                            : 'border-neutral-600 hover:border-neutral-500'
                        }`}
                      >
                        {state.tested && <span className="text-xs">✓</span>}
                      </button>
                      <div>
                        <h4 className="font-medium text-neutral-200">{state.name}</h4>
                        <p className="text-sm text-neutral-500">{state.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                                         rounded text-sm transition-colors">
                        Preview
                      </button>
                      <button className="px-3 py-1 bg-primary hover:bg-primary-600 text-white 
                                         rounded text-sm transition-colors">
                        Test
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-neutral-300 mb-2">Props</h5>
                      <div className="space-y-1">
                        {Object.entries(state.props).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-neutral-400">{key}</span>
                            <span className="text-neutral-500">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-neutral-300 mb-2">Visual Preview</h5>
                      <div className="bg-neutral-700 rounded p-3 min-h-12 flex items-center justify-center">
                        <div className={`px-4 py-2 rounded text-sm font-medium ${
                          state.props.variant === 'primary' ? 'bg-primary text-white' :
                          state.props.variant === 'danger' ? 'bg-danger text-white' :
                          'bg-neutral-600 text-neutral-200'
                        } ${state.props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {selectedComponent} {state.props.loading ? '...' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'visual' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Visual Regression Testing</h3>
            <p className="text-neutral-400">
              Compare component renders across different states and catch visual regressions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Baseline Screenshots</h4>
                <div className="space-y-3">
                  {componentStates.slice(0, 3).map((state) => (
                    <div key={state.id} className="bg-background rounded-lg p-4 border border-neutral-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-200">{state.name}</span>
                        <span className="text-xs text-success">✓ Captured</span>
                      </div>
                      <div className="bg-neutral-700 rounded h-20 flex items-center justify-center">
                        <span className="text-xs text-neutral-500">Screenshot placeholder</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Current Screenshots</h4>
                <div className="space-y-3">
                  {componentStates.slice(0, 3).map((state) => (
                    <div key={state.id} className="bg-background rounded-lg p-4 border border-neutral-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-200">{state.name}</span>
                        <span className="text-xs text-warning">△ Changed</span>
                      </div>
                      <div className="bg-neutral-700 rounded h-20 flex items-center justify-center">
                        <span className="text-xs text-neutral-500">Screenshot placeholder</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'interactive' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Interactive Testing</h3>
            <p className="text-neutral-400">
              Test component interactions, events, and behavior manually.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Component Preview</h4>
                <div className="bg-background rounded-lg p-6 border border-neutral-600 min-h-48">
                  <div className="flex items-center justify-center h-full">
                    <button className="px-6 py-3 bg-primary hover:bg-primary-600 text-white 
                                       rounded-lg font-medium transition-colors">
                      Interactive {selectedComponent}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Interaction Tests</h4>
                <div className="space-y-3">
                  {[
                    'Click interaction',
                    'Hover effects',
                    'Focus states',
                    'Keyboard navigation',
                    'Touch interactions'
                  ].map((test) => (
                    <div key={test} className="bg-background rounded-lg p-3 border border-neutral-600">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-neutral-200">{test}</span>
                        <button className="px-3 py-1 bg-primary hover:bg-primary-600 text-white 
                                           rounded text-sm transition-colors">
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Testing component states</span>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={resetAllTests}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                       rounded-lg transition-colors"
          >
            Reset Tests
          </button>
          <button 
            onClick={testAllStates}
            className="px-4 py-2 bg-success hover:bg-success-600 text-white 
                       rounded-lg transition-colors font-medium"
          >
            Test All States
          </button>
        </div>
      </div>
    </div>
  );
}