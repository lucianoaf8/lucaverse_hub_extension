// src/components/dev-center/ComponentTestingLab.tsx
import React, { useState, useEffect } from 'react';
import { SmartHub, AIChat, TaskManager, Productivity } from '../dashboard';
import { useTheme } from '../../contexts/ThemeContext';

interface ComponentConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  states: Record<string, any>;
  variants: string[];
  category: 'dashboard' | 'ui' | 'layout' | 'form';
  description: string;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  components: Array<{
    componentId: string;
    props: Record<string, any>;
    state: string;
  }>;
}

export default function ComponentTestingLab() {
  const { themeConfig } = useTheme();
  const [selectedComponent, setSelectedComponent] = useState<string>('smart-hub');
  const [activeState, setActiveState] = useState<string>('default');
  const [customProps, setCustomProps] = useState<Record<string, any>>({});
  const [testScenarios, setTestScenarios] = useState<TestScenario[]>([]);
  const [recording, setRecording] = useState(false);
  const [automatedTest, setAutomatedTest] = useState(false);

  // Component configurations
  const componentConfigs: ComponentConfig[] = [
    {
      id: 'smart-hub',
      name: 'Smart Hub',
      component: SmartHub,
      props: {},
      states: {
        default: {},
        loading: { loading: true },
        error: { error: 'Connection failed' },
        empty: { data: [] },
        populated: { data: Array(10).fill(null).map((_, i) => ({ id: i, title: `Item ${i}` })) }
      },
      variants: ['default', 'compact', 'expanded'],
      category: 'dashboard',
      description: 'Central hub for quick actions and shortcuts'
    },
    {
      id: 'ai-chat',
      name: 'AI Chat',
      component: AIChat,
      props: {},
      states: {
        default: {},
        thinking: { thinking: true },
        'with-history': { 
          messages: [
            { id: 1, role: 'user', content: 'Hello!' },
            { id: 2, role: 'assistant', content: 'Hi there! How can I help you?' }
          ]
        },
        'long-conversation': {
          messages: Array(20).fill(null).map((_, i) => ({
            id: i,
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: `Message ${i + 1}: This is a test message to see how the chat handles longer conversations.`
          }))
        }
      },
      variants: ['default', 'minimal', 'expanded'],
      category: 'dashboard',
      description: 'AI-powered chat interface'
    },
    {
      id: 'task-manager',
      name: 'Task Manager',
      component: TaskManager,
      props: {},
      states: {
        default: {},
        'with-tasks': {
          tasks: [
            { id: 1, title: 'Complete project', completed: false, priority: 'high' },
            { id: 2, title: 'Review code', completed: true, priority: 'medium' },
            { id: 3, title: 'Update documentation', completed: false, priority: 'low' }
          ]
        },
        'empty-state': { tasks: [] },
        'many-tasks': {
          tasks: Array(50).fill(null).map((_, i) => ({
            id: i,
            title: `Task ${i + 1}`,
            completed: Math.random() > 0.7,
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
          }))
        }
      },
      variants: ['list', 'grid', 'kanban'],
      category: 'dashboard',
      description: 'Task and project management interface'
    },
    {
      id: 'productivity',
      name: 'Productivity',
      component: Productivity,
      props: {},
      states: {
        default: {},
        'session-active': { activeSession: true, timeRemaining: 1500 },
        'break-time': { onBreak: true, timeRemaining: 300 },
        'daily-complete': { dailyGoalComplete: true, sessionsToday: 8 },
        'stats-view': { showStats: true, weeklyData: [5, 7, 3, 8, 6, 4, 9] }
      },
      variants: ['timer', 'stats', 'goals'],
      category: 'dashboard',
      description: 'Productivity tracking and focus sessions'
    }
  ];

  const selectedConfig = componentConfigs.find(c => c.id === selectedComponent);
  const currentState = selectedConfig?.states[activeState] || {};
  const finalProps = { ...selectedConfig?.props, ...currentState, ...customProps };

  // Automated testing functionality
  const runAutomatedTests = async () => {
    setAutomatedTest(true);
    
    for (const config of componentConfigs) {
      for (const [stateName, stateProps] of Object.entries(config.states)) {
        console.log(`Testing ${config.name} in ${stateName} state...`);
        
        // Simulate state changes and capture renders
        setSelectedComponent(config.id);
        setActiveState(stateName);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Capture screenshot (would integrate with visual testing)
        // await captureComponentScreenshot(config.id, stateName);
        
        // Test interactions
        // await testComponentInteractions(config.id, stateName);
      }
    }
    
    setAutomatedTest(false);
    console.log('Automated testing complete!');
  };

  // Record interaction sequences
  const startRecording = () => {
    setRecording(true);
    console.log('Started recording interactions...');
  };

  const stopRecording = () => {
    setRecording(false);
    console.log('Stopped recording interactions.');
  };

  // Generate test scenarios
  const generateTestScenario = () => {
    const scenario: TestScenario = {
      id: `scenario-${Date.now()}`,
      name: `Test Scenario ${testScenarios.length + 1}`,
      description: `Generated test for ${selectedConfig?.name} component`,
      components: [
        {
          componentId: selectedComponent,
          props: finalProps,
          state: activeState
        }
      ]
    };
    
    setTestScenarios(prev => [...prev, scenario]);
  };

  const renderComponent = () => {
    if (!selectedConfig) return null;

    const Component = selectedConfig.component;
    
    return (
      <div className="relative">
        {recording && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Recording</span>
          </div>
        )}
        
        <div className="border border-neutral-700 rounded-lg overflow-hidden">
          <div className="bg-neutral-800 px-4 py-2 border-b border-neutral-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium" style={{ color: themeConfig.colors.neutral[100] }}>{selectedConfig.name}</span>
              <span className="text-xs text-neutral-400">State: {activeState}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify(finalProps, null, 2))}
                className="text-xs text-neutral-400 hover:text-white"
                title="Copy props"
              >
                📋
              </button>
              <button 
                onClick={generateTestScenario}
                className="text-xs text-neutral-400 hover:text-white"
                title="Save as test scenario"
              >
                💾
              </button>
            </div>
          </div>
          
          <div className="p-6 bg-neutral-950">
            <Component {...finalProps} />
          </div>
        </div>
      </div>
    );
  };

  const renderPropEditor = () => {
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-secondary">Custom Props</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">JSON Props</label>
            <textarea
              value={JSON.stringify(customProps, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setCustomProps(parsed);
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              className="w-full h-32 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm font-mono"
              style={{ color: themeConfig.colors.neutral[100] }}
              placeholder='{"key": "value"}'
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCustomProps({})}
              className="btn btn-secondary text-sm"
            >
              Clear Props
            </button>
            <button
              onClick={() => setCustomProps(selectedConfig?.props || {})}
              className="btn btn-secondary text-sm"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-80 bg-elevated border-r border-neutral-700 p-4 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Component Lab</h3>
          
          {/* Component Selector */}
          <div className="mb-4">
            <h4 className="font-medium text-secondary mb-2">Component</h4>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
              style={{ color: themeConfig.colors.neutral[100] }}
            >
              {componentConfigs.map(config => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </select>
            {selectedConfig && (
              <p className="text-xs text-neutral-400 mt-1">{selectedConfig.description}</p>
            )}
          </div>

          {/* State Selector */}
          <div className="mb-4">
            <h4 className="font-medium text-secondary mb-2">State</h4>
            <div className="space-y-1">
              {selectedConfig && Object.keys(selectedConfig.states).map(stateName => (
                <button
                  key={stateName}
                  onClick={() => setActiveState(stateName)}
                  className={`w-full text-left px-3 py-2 rounded border transition-colors ${
                    activeState === stateName
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <span className="text-sm font-medium">{stateName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Variant Selector */}
          {selectedConfig?.variants.length > 1 && (
            <div className="mb-4">
              <h4 className="font-medium text-secondary mb-2">Variant</h4>
              <select
                className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
                style={{ color: themeConfig.colors.neutral[100] }}
              >
                {selectedConfig.variants.map(variant => (
                  <option key={variant} value={variant}>
                    {variant}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Testing Controls */}
          <div className="mb-6">
            <h4 className="font-medium text-secondary mb-2">Testing</h4>
            <div className="space-y-2">
              <button
                onClick={recording ? stopRecording : startRecording}
                className={`w-full btn text-sm ${recording ? 'btn-danger' : 'btn-secondary'}`}
              >
                {recording ? '⏹️ Stop Recording' : '⏺️ Start Recording'}
              </button>
              
              <button
                onClick={runAutomatedTests}
                disabled={automatedTest}
                className="w-full btn btn-secondary text-sm"
              >
                {automatedTest ? '🔄 Running Tests...' : '🤖 Run Automated Tests'}
              </button>
            </div>
          </div>

          {/* Prop Editor */}
          {renderPropEditor()}
        </div>

        {/* Test Scenarios */}
        {testScenarios.length > 0 && (
          <div>
            <h4 className="font-medium text-secondary mb-2">Saved Scenarios</h4>
            <div className="space-y-2">
              {testScenarios.map(scenario => (
                <div
                  key={scenario.id}
                  className="p-3 bg-neutral-800 border border-neutral-700 rounded"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: themeConfig.colors.neutral[100] }}>{scenario.name}</span>
                    <button
                      onClick={() => setTestScenarios(prev => prev.filter(s => s.id !== scenario.id))}
                      className="text-xs text-neutral-400 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{scenario.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Component Preview</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-400">Live Preview</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {renderComponent()}

        {/* Props Inspector */}
        <div className="mt-6 bg-surface rounded-lg p-4 border border-neutral-700">
          <h4 className="font-medium text-secondary mb-3">Current Props</h4>
          <pre className="text-sm text-neutral-300 bg-neutral-800 p-3 rounded overflow-auto">
            {JSON.stringify(finalProps, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}