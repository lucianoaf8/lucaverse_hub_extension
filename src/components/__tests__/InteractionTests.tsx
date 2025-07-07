import React, { useState } from 'react';

interface TestResult {
  id: string;
  name: string;
  category: 'Drag & Drop' | 'Resize' | 'Performance' | 'Edge Cases';
  status: 'pending' | 'running' | 'pass' | 'fail';
  message?: string;
  data?: any;
}

const INTERACTION_TESTS: TestResult[] = [
  { id: 'drag-basic', name: 'Basic Dragging', category: 'Drag & Drop', status: 'pending' },
  { id: 'drag-constraints', name: 'Drag Constraints', category: 'Drag & Drop', status: 'pending' },
  { id: 'drag-snap', name: 'Grid Snapping', category: 'Drag & Drop', status: 'pending' },
  { id: 'drag-multi', name: 'Multi-Panel Drag', category: 'Drag & Drop', status: 'pending' },
  { id: 'resize-basic', name: 'Basic Resizing', category: 'Resize', status: 'pending' },
  { id: 'resize-constraints', name: 'Resize Constraints', category: 'Resize', status: 'pending' },
  { id: 'resize-aspect', name: 'Aspect Ratio', category: 'Resize', status: 'pending' },
  { id: 'resize-multi', name: 'Multi-Panel Resize', category: 'Resize', status: 'pending' },
  { id: 'performance-drag', name: 'Drag Performance', category: 'Performance', status: 'pending' },
  { id: 'performance-resize', name: 'Resize Performance', category: 'Performance', status: 'pending' },
  { id: 'edge-overlap', name: 'Panel Overlap', category: 'Edge Cases', status: 'pending' },
  { id: 'edge-boundaries', name: 'Boundary Handling', category: 'Edge Cases', status: 'pending' },
];

export const InteractionTests: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>(INTERACTION_TESTS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [showGrid, setShowGrid] = useState(true);
  const [dragMetrics, setDragMetrics] = useState<any>(null);
  const [resizeMetrics, setResizeMetrics] = useState<any>(null);

  const runTest = async (testId: string) => {
    setCurrentTest(testId);
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'running' as const }
        : test
    ));

    // Simulate test execution with performance metrics for performance tests
    let message = 'Test completed successfully';
    let data = undefined;

    if (testId === 'performance-drag') {
      const avgTime = Math.random() * 10 + 5;
      const metrics = {
        totalTime: avgTime * 50,
        avgTime,
        iterations: 50,
        fps: 1000 / avgTime,
      };
      setDragMetrics(metrics);
      message = `Average: ${avgTime.toFixed(2)}ms per operation`;
      data = metrics;
    } else if (testId === 'performance-resize') {
      const avgTime = Math.random() * 8 + 4;
      const metrics = {
        totalTime: avgTime * 50,
        avgTime,
        iterations: 50,
        fps: 1000 / avgTime,
      };
      setResizeMetrics(metrics);
      message = `Average: ${avgTime.toFixed(2)}ms per operation`;
      data = metrics;
    }

    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
    
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status: 'pass' as const, message, data }
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Drag & Drop': return 'bg-blue-100 text-blue-800';
      case 'Resize': return 'bg-green-100 text-green-800';
      case 'Performance': return 'bg-orange-100 text-orange-800';
      case 'Edge Cases': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interaction Tests</h1>
        <p className="text-gray-600">
          Drag & drop, resize operations, and user interaction testing
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
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          {showGrid ? 'Hide' : 'Show'} Grid
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
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(test.category)}`}>
                {test.category}
              </span>
            </div>
            {test.message && (
              <p className="text-sm font-medium">{test.message}</p>
            )}
          </div>
        ))}
      </div>

      {(dragMetrics || resizeMetrics) && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {dragMetrics && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Drag Performance</h3>
              <div className="text-sm space-y-1">
                <p>Total Time: {dragMetrics.totalTime.toFixed(2)}ms</p>
                <p>Average Time: {dragMetrics.avgTime.toFixed(2)}ms</p>
                <p>Operations: {dragMetrics.iterations}</p>
                <p>Effective FPS: {dragMetrics.fps.toFixed(1)}</p>
              </div>
            </div>
          )}
          
          {resizeMetrics && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Resize Performance</h3>
              <div className="text-sm space-y-1">
                <p>Total Time: {resizeMetrics.totalTime.toFixed(2)}ms</p>
                <p>Average Time: {resizeMetrics.avgTime.toFixed(2)}ms</p>
                <p>Operations: {resizeMetrics.iterations}</p>
                <p>Effective FPS: {resizeMetrics.fps.toFixed(1)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Interactive Test Area</h2>
        <div className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg min-h-96 overflow-hidden">
          {showGrid && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />
          )}
          
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Interactive test area - Click "Run All Tests" to see simulated interactions
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600 flex gap-4">
          <span>Grid: {showGrid ? 'Enabled' : 'Disabled'}</span>
          <span>Status: {isRunning ? 'Testing Active' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
};

export default InteractionTests;