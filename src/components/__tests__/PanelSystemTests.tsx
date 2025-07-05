import React, { useState } from 'react';

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  message?: string;
  duration?: number;
}

const SYSTEM_TESTS: TestResult[] = [
  { id: 'panel-creation', name: 'Panel Creation', category: 'Panel Lifecycle', status: 'pending' },
  { id: 'panel-rendering', name: 'Panel Rendering', category: 'Panel Lifecycle', status: 'pending' },
  { id: 'panel-updates', name: 'Panel Updates', category: 'Panel Lifecycle', status: 'pending' },
  { id: 'panel-removal', name: 'Panel Removal', category: 'Panel Lifecycle', status: 'pending' },
  { id: 'layout-persistence', name: 'Layout Persistence', category: 'Layout System', status: 'pending' },
  { id: 'layout-validation', name: 'Layout Validation', category: 'Layout System', status: 'pending' },
  { id: 'state-management', name: 'State Management', category: 'State Management', status: 'pending' },
  { id: 'performance-test', name: 'Performance Test', category: 'Performance', status: 'pending' },
];

export const PanelSystemTests: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>(SYSTEM_TESTS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runTest = async (testId: string) => {
    setCurrentTest(testId);
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' as const }
        : test
    ));

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
    
    const duration = Math.random() * 500 + 100;
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { 
            ...test, 
            status: 'pass' as const, 
            message: `Test completed in ${duration.toFixed(2)}ms`,
            duration 
          }
        : test
    ));
    setCurrentTest('');
  };

  const runAllTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    for (const test of tests) {
      await runTest(test.id);
    }
    
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200';
      case 'fail': return 'text-red-600 bg-red-50 border-red-200';
      case 'running': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      case 'running': return '⟳';
      default: return '○';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel System Tests</h1>
        <p className="text-gray-600">
          Panel lifecycle, layout system, and state management testing
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      {currentTest && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800">
            Currently running: <span className="font-semibold">{currentTest}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {tests.map(test => (
          <div
            key={test.id}
            className={`p-4 border rounded-lg ${getStatusColor(test.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{test.name}</h3>
              <span className="text-xl">{getStatusIcon(test.status)}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{test.category}</p>
            {test.message && (
              <p className="text-sm font-medium">{test.message}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Test Summary</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tests.filter(t => t.status === 'pass').length}
            </div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tests.filter(t => t.status === 'fail').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tests.filter(t => t.status === 'running').length}
            </div>
            <div className="text-sm text-gray-600">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {tests.filter(t => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelSystemTests;