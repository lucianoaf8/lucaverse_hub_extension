/**
 * Feature Parity Validation Component
 * Interactive component for manual testing and validation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { SmartHub, AIChat, TaskManager, Productivity } from '../components/panels';
import { DynamicLayout } from '../components/DynamicLayout';
import { DragDropProvider } from '../components/providers/DragDropProvider';
import { useLayoutStore } from '../stores/layoutStore';
import { useAppStore } from '../stores/appStore';

interface TestResult {
  category: string;
  feature: string;
  status: 'pending' | 'pass' | 'fail';
  notes?: string;
  timestamp?: number;
}

interface FeatureTest {
  id: string;
  category: string;
  feature: string;
  description: string;
  instructions: string[];
  expectedBehavior: string;
  critical: boolean;
}

const FEATURE_TESTS: FeatureTest[] = [
  // SmartHub Tests
  {
    id: 'sh-bookmark-add',
    category: 'SmartHub',
    feature: 'Bookmark Addition',
    description: 'Add new bookmarks with URL, title, and category',
    instructions: [
      'Look for bookmark search input field',
      'Check for category filters (development, code, documentation, web, help)',
      'Verify "Most Visited" and "Recent Bookmarks" sections exist',
      'Test adding a new bookmark (if functionality is implemented)'
    ],
    expectedBehavior: 'Should display bookmark interface with search and categorization',
    critical: true
  },
  {
    id: 'sh-search',
    category: 'SmartHub',
    feature: 'Bookmark Search',
    description: 'Search through bookmarks by title or URL',
    instructions: [
      'Type in the search input field',
      'Verify search placeholder text appears',
      'Check if search functionality filters results'
    ],
    expectedBehavior: 'Search should filter bookmarks in real-time',
    critical: true
  },
  {
    id: 'sh-categories',
    category: 'SmartHub',
    feature: 'Category Filtering',
    description: 'Filter bookmarks by predefined categories',
    instructions: [
      'Click on category buttons (development, code, documentation, web, help)',
      'Verify categories are visually distinct',
      'Check if category selection filters bookmarks'
    ],
    expectedBehavior: 'Categories should filter bookmark display',
    critical: false
  },

  // AIChat Tests
  {
    id: 'ai-input',
    category: 'AIChat',
    feature: 'Chat Input',
    description: 'Text input for sending messages to AI',
    instructions: [
      'Find the chat input field with placeholder "Ask me anything..."',
      'Type a test message',
      'Press Ctrl+Enter or click Send button',
      'Verify message appears in chat history'
    ],
    expectedBehavior: 'Should accept text input and send messages',
    critical: true
  },
  {
    id: 'ai-providers',
    category: 'AIChat',
    feature: 'Provider Selection',
    description: 'Switch between AI providers (OpenAI, Anthropic, Google)',
    instructions: [
      'Look for provider selection buttons/icons',
      'Check for provider status indicators',
      'Verify "Clear All" and other control buttons exist'
    ],
    expectedBehavior: 'Should show multiple AI provider options',
    critical: true
  },
  {
    id: 'ai-history',
    category: 'AIChat',
    feature: 'Chat History',
    description: 'Display conversation history with proper formatting',
    instructions: [
      'Send a test message',
      'Verify message appears in chat area',
      'Check message formatting and timestamps',
      'Test chat history persistence'
    ],
    expectedBehavior: 'Messages should appear with proper user/assistant distinction',
    critical: true
  },

  // TaskManager Tests
  {
    id: 'tm-creation',
    category: 'TaskManager',
    feature: 'Task Creation',
    description: 'Create new tasks with priority and categorization',
    instructions: [
      'Look for "Add Task" button',
      'Check task statistics display (Total, Done, Critical, Complete %)',
      'Verify search functionality exists',
      'Test "Templates" button if available'
    ],
    expectedBehavior: 'Should display task statistics and creation interface',
    critical: true
  },
  {
    id: 'tm-statistics',
    category: 'TaskManager',
    feature: 'Task Statistics',
    description: 'Display task counts and completion percentage',
    instructions: [
      'Verify statistics show: Total (0), Done (0), Critical (0), Complete (0%)',
      'Check if statistics update when tasks change',
      'Verify visual styling matches design'
    ],
    expectedBehavior: 'Statistics should accurately reflect task state',
    critical: false
  },
  {
    id: 'tm-search',
    category: 'TaskManager',
    feature: 'Task Search',
    description: 'Search and filter tasks by text and category',
    instructions: [
      'Use search input to filter tasks',
      'Test category filtering dropdown',
      'Verify "Show Done" toggle functionality',
      'Check if filters work correctly'
    ],
    expectedBehavior: 'Search should filter tasks based on criteria',
    critical: false
  },

  // Productivity Tests
  {
    id: 'prod-timer',
    category: 'Productivity',
    feature: 'Pomodoro Timer',
    description: 'Timer functionality with different modes',
    instructions: [
      'Find timer display showing "25:00"',
      'Look for "Focus Time" section',
      'Check for session tracking display',
      'Verify timer technique description exists'
    ],
    expectedBehavior: 'Should display functional Pomodoro timer interface',
    critical: true
  },
  {
    id: 'prod-sessions',
    category: 'Productivity',
    feature: 'Session Tracking',
    description: 'Track and display productivity sessions',
    instructions: [
      'Verify session counter displays (Session 1)',
      'Check focus time tracking',
      'Look for session type indicators',
      'Test session statistics if available'
    ],
    expectedBehavior: 'Should track and display session information',
    critical: false
  },

  // Layout Tests
  {
    id: 'layout-panels',
    category: 'Layout',
    feature: 'Panel Management',
    description: 'Dynamic panel creation, resizing, and positioning',
    instructions: [
      'Verify all 4 panels are visible and properly positioned',
      'Check panel titles and content',
      'Test panel resizing handles if visible',
      'Verify panels maintain their content'
    ],
    expectedBehavior: 'All panels should render with correct content and layout',
    critical: true
  },
  {
    id: 'layout-toolbar',
    category: 'Layout',
    feature: 'Panel Toolbar',
    description: 'Toolbar for creating and managing panels',
    instructions: [
      'Look for toolbar with panel creation buttons',
      'Check for workspace management controls',
      'Verify layout and selection tools',
      'Test grid and snap controls if visible'
    ],
    expectedBehavior: 'Toolbar should provide panel management capabilities',
    critical: false
  },

  // Global Tests
  {
    id: 'global-responsive',
    category: 'Global',
    feature: 'Responsive Design',
    description: 'Layout adapts to different screen sizes',
    instructions: [
      'Resize browser window',
      'Check if panels adjust appropriately',
      'Verify UI remains usable at different sizes',
      'Test mobile-like dimensions'
    ],
    expectedBehavior: 'Interface should adapt to screen size changes',
    critical: false
  },
  {
    id: 'global-persistence',
    category: 'Global',
    feature: 'State Persistence',
    description: 'Application state persists across browser sessions',
    instructions: [
      'Make changes to any component (add bookmark, task, etc.)',
      'Refresh the page',
      'Verify changes are preserved',
      'Check localStorage for data'
    ],
    expectedBehavior: 'State should persist across page reloads',
    critical: true
  }
];

export const FeatureParityValidation: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showOnlyFailed, setShowOnlyFailed] = useState(false);

  // Initialize test results
  useEffect(() => {
    const initialResults = FEATURE_TESTS.map(test => ({
      category: test.category,
      feature: test.feature,
      status: 'pending' as const
    }));
    setTestResults(initialResults);
  }, []);

  const handleTestResult = useCallback((testId: string, status: 'pass' | 'fail', notes?: string) => {
    const test = FEATURE_TESTS.find(t => t.id === testId);
    if (!test) return;

    setTestResults(prev => {
      const updated = [...prev];
      const index = updated.findIndex(r => r.category === test.category && r.feature === test.feature);
      if (index >= 0) {
        updated[index] = {
          ...updated[index],
          status,
          notes,
          timestamp: Date.now()
        };
      }
      return updated;
    });

    setCurrentTest(null);
    setNotes('');
  }, []);

  const categories = Array.from(new Set(FEATURE_TESTS.map(t => t.category)));
  const filteredTests = FEATURE_TESTS.filter(test => {
    if (filterCategory !== 'all' && test.category !== filterCategory) return false;
    if (showOnlyFailed) {
      const result = testResults.find(r => r.category === test.category && r.feature === test.feature);
      return result?.status === 'fail';
    }
    return true;
  });

  const getTestResult = (test: FeatureTest) => {
    return testResults.find(r => r.category === test.category && r.feature === test.feature);
  };

  const getStatusColor = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass': return 'text-green-400 bg-green-500/20';
      case 'fail': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getStatusIcon = (status: 'pending' | 'pass' | 'fail') => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      default: return '⏳';
    }
  };

  const getTotalResults = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'pass').length;
    const failed = testResults.filter(r => r.status === 'fail').length;
    const pending = testResults.filter(r => r.status === 'pending').length;
    return { total, passed, failed, pending };
  };

  const exportResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      summary: getTotalResults(),
      details: testResults.map(result => {
        const test = FEATURE_TESTS.find(t => t.category === result.category && t.feature === result.feature);
        return {
          ...result,
          critical: test?.critical || false,
          description: test?.description || ''
        };
      })
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-parity-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { total, passed, failed, pending } = getTotalResults();
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Feature Parity Validation</h1>
          <p className="text-gray-300 mb-6">
            Test each feature to ensure React implementation matches vanilla JS functionality
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-sm text-gray-300">Total Tests</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{passed}</div>
              <div className="text-sm text-gray-300">Passed</div>
            </div>
            <div className="bg-red-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{failed}</div>
              <div className="text-sm text-gray-300">Failed</div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{pending}</div>
              <div className="text-sm text-gray-300">Pending</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-lg">
              Pass Rate: <span className="font-bold text-green-400">{passRate}%</span>
            </div>
            <button
              onClick={exportResults}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
            >
              Export Results
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-2"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyFailed}
                onChange={(e) => setShowOnlyFailed(e.target.checked)}
                className="rounded"
              />
              Show Only Failed
            </label>
          </div>
        </div>

        {/* Test List */}
        <div className="grid gap-4">
          {filteredTests.map(test => {
            const result = getTestResult(test);
            const isActive = currentTest === test.id;

            return (
              <div
                key={test.id}
                className={`bg-white/10 rounded-lg p-6 transition-all ${
                  isActive ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(result?.status || 'pending')}`}>
                        {getStatusIcon(result?.status || 'pending')} {result?.status || 'pending'}
                      </span>
                      <h3 className="text-xl font-semibold">{test.category} - {test.feature}</h3>
                      {test.critical && (
                        <span className="bg-red-500/30 text-red-300 px-2 py-1 rounded text-xs">
                          CRITICAL
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-3">{test.description}</p>
                    <div className="text-sm text-gray-400">
                      Expected: {test.expectedBehavior}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentTest(isActive ? null : test.id)}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      {isActive ? 'Cancel' : 'Test'}
                    </button>
                  </div>
                </div>

                {isActive && (
                  <div className="border-t border-white/20 pt-4">
                    <h4 className="font-semibold mb-2">Test Instructions:</h4>
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      {test.instructions.map((instruction, index) => (
                        <li key={index} className="text-gray-300">{instruction}</li>
                      ))}
                    </ul>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Notes (optional):</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
                        rows={3}
                        placeholder="Add any observations or issues found..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleTestResult(test.id, 'pass', notes)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
                      >
                        ✅ Pass
                      </button>
                      <button
                        onClick={() => handleTestResult(test.id, 'fail', notes)}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
                      >
                        ❌ Fail
                      </button>
                    </div>
                  </div>
                )}

                {result?.notes && !isActive && (
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <div className="text-sm text-gray-400">Notes:</div>
                    <div className="text-gray-300">{result.notes}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Component Display Area */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Live Component Testing</h2>
          <div className="bg-black/20 rounded-lg p-6">
            <DragDropProvider>
              <DynamicLayout />
            </DragDropProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureParityValidation;