/**
 * Layout System Test Component
 * Comprehensive test suite for the entire layout management system
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DynamicLayout } from '../DynamicLayout';
import { useLayoutStore } from '@/stores/layoutStore';
import { PanelComponent } from '@/types/panel';
import {
  checkCollision,
  findCollisions,
  preventOverlap,
  isValidPosition,
  SpatialIndex,
} from '@/utils/collisionDetection';
import { snapToGrid, magneticSnapToGrid, isOnGrid, alignToGrid } from '@/utils/gridSystem';
import {
  findOptimalPosition,
  constrainPosition,
  calculateAvailableSpace,
} from '@/utils/panelBounds';
import {
  calculateLayoutMetrics,
  optimizeLayout,
  exportLayout,
  importLayout,
  validateLayout,
  performanceMonitor,
} from '@/utils/layoutUtils';
import type { Position, Size } from '@/types/panel';

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
  timestamp: number;
}

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  categories: Record<string, { passed: number; total: number }>;
}

export const LayoutSystemTest: React.FC = () => {
  const {
    panels,
    addPanel,
    removePanel,
    updatePanel,
    resetLayout,
    gridSettings,
    updateGridSettings,
    selectedPanelIds,
  } = useLayoutStore();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [showLayout, setShowLayout] = useState(true);
  const [containerSize] = useState<Size>({ width: 1200, height: 800 });

  // Add test result
  const addTestResult = useCallback(
    (category: string, name: string, passed: boolean, message: string, duration?: number) => {
      setTestResults(prev => [
        ...prev,
        {
          category,
          name,
          passed,
          message,
          duration,
          timestamp: Date.now(),
        },
      ]);
    },
    []
  );

  // Calculate test statistics
  const testStats: TestStats = useMemo(() => {
    const stats: TestStats = {
      total: testResults.length,
      passed: testResults.filter(r => r.passed).length,
      failed: testResults.filter(r => r.passed === false).length,
      categories: {},
    };

    testResults.forEach(result => {
      if (!stats.categories[result.category]) {
        stats.categories[result.category] = { passed: 0, total: 0 };
      }
      stats.categories[result.category].total++;
      if (result.passed) {
        stats.categories[result.category].passed++;
      }
    });

    return stats;
  }, [testResults]);

  // Test collision detection system
  const testCollisionDetection = useCallback(async () => {
    setCurrentTest('Testing collision detection...');

    try {
      // Test basic collision detection
      const panel1 = {
        id: 'test1',
        component: PanelComponent.SmartHub,
        position: { x: 100, y: 100 },
        size: { width: 200, height: 150 },
        zIndex: 100,
        visible: true,
        constraints: { minSize: { width: 100, height: 100 } },
      };

      const panel2 = {
        id: 'test2',
        component: PanelComponent.AIChat,
        position: { x: 150, y: 125 },
        size: { width: 200, height: 150 },
        zIndex: 100,
        visible: true,
        constraints: { minSize: { width: 100, height: 100 } },
      };

      const panel3 = {
        id: 'test3',
        component: PanelComponent.TaskManager,
        position: { x: 400, y: 400 },
        size: { width: 200, height: 150 },
        zIndex: 100,
        visible: true,
        constraints: { minSize: { width: 100, height: 100 } },
      };

      // Test overlapping panels
      const collisionResult = findCollisions([panel1, panel3], panel2);
      addTestResult(
        'Collision Detection',
        'Basic overlap detection',
        collisionResult.colliding && collisionResult.panels.length === 1,
        collisionResult.colliding ? 'Correctly detected collision' : 'Failed to detect collision'
      );

      // Test non-overlapping panels
      const noCollisionResult = findCollisions([panel3], panel1);
      addTestResult(
        'Collision Detection',
        'Non-overlap detection',
        !noCollisionResult.colliding,
        !noCollisionResult.colliding
          ? 'Correctly detected no collision'
          : 'False positive collision'
      );

      // Test position validation
      const validPosition = isValidPosition({ x: 500, y: 500 }, { width: 100, height: 100 }, [
        panel1,
        panel2,
        panel3,
      ]);
      addTestResult(
        'Collision Detection',
        'Valid position check',
        validPosition,
        validPosition ? 'Position validation works' : 'Position validation failed'
      );

      // Test overlap prevention
      const preventedPosition = preventOverlap(
        { x: 150, y: 125 }, // Same as panel2, should be adjusted
        { width: 100, height: 100 },
        [panel1, panel2],
        undefined,
        undefined,
        100
      );

      const stillOverlaps = findCollisions([panel1, panel2], {
        position: preventedPosition,
        size: { width: 100, height: 100 },
      }).colliding;

      addTestResult(
        'Collision Detection',
        'Overlap prevention',
        !stillOverlaps,
        !stillOverlaps ? 'Successfully prevented overlap' : 'Failed to prevent overlap'
      );

      // Test spatial indexing
      const spatialIndex = new SpatialIndex(100);
      spatialIndex.addPanel(panel1);
      spatialIndex.addPanel(panel2);
      spatialIndex.addPanel(panel3);

      const nearbyPanels = spatialIndex.findNearbyPanels(panel1);
      addTestResult(
        'Collision Detection',
        'Spatial indexing',
        nearbyPanels.length >= 1,
        `Found ${nearbyPanels.length} nearby panels`
      );
    } catch (error) {
      addTestResult(
        'Collision Detection',
        'System test',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [addTestResult]);

  // Test grid system
  const testGridSystem = useCallback(async () => {
    setCurrentTest('Testing grid system...');

    try {
      // Test basic snapping
      const position = { x: 127, y: 143 };
      const gridSize = 20;
      const snapped = snapToGrid(position, gridSize);

      addTestResult(
        'Grid System',
        'Basic snap to grid',
        snapped.x === 120 && snapped.y === 140,
        `Snapped (${position.x}, ${position.y}) to (${snapped.x}, ${snapped.y})`
      );

      // Test magnetic snapping
      const magneticResult = magneticSnapToGrid(position, gridSize, 15);
      addTestResult(
        'Grid System',
        'Magnetic snapping',
        magneticResult.snapped,
        magneticResult.snapped ? 'Magnetic snap activated' : 'Magnetic snap not activated'
      );

      // Test grid detection
      const onGrid = isOnGrid({ x: 120, y: 140 }, gridSize);
      addTestResult(
        'Grid System',
        'Grid position detection',
        onGrid,
        onGrid ? 'Correctly identified grid position' : 'Failed to identify grid position'
      );

      // Test batch alignment
      const testPanels = [
        { id: 'p1', position: { x: 127, y: 143 }, size: { width: 100, height: 100 } },
        { id: 'p2', position: { x: 267, y: 283 }, size: { width: 100, height: 100 } },
      ];

      const aligned = alignToGrid(testPanels, gridSize);
      const allAligned = aligned.every(panel => isOnGrid(panel.position, gridSize));

      addTestResult(
        'Grid System',
        'Batch alignment',
        allAligned,
        allAligned ? 'All panels aligned to grid' : 'Some panels not aligned'
      );
    } catch (error) {
      addTestResult(
        'Grid System',
        'System test',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [addTestResult]);

  // Test panel bounds calculation
  const testPanelBounds = useCallback(async () => {
    setCurrentTest('Testing panel bounds...');

    try {
      // Test position constraining
      const bounds = {
        x: 0,
        y: 0,
        width: containerSize.width,
        height: containerSize.height,
      };

      const outOfBounds = { x: -50, y: -30 };
      const size = { width: 200, height: 150 };
      const constrained = constrainPosition(outOfBounds, size, bounds);

      addTestResult(
        'Panel Bounds',
        'Position constraining',
        constrained.x >= 0 && constrained.y >= 0,
        `Constrained (${outOfBounds.x}, ${outOfBounds.y}) to (${constrained.x}, ${constrained.y})`
      );

      // Test optimal position finding
      const existingPanels = [
        {
          id: 'existing1',
          component: PanelComponent.SmartHub,
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
          zIndex: 100,
          visible: true,
          constraints: { minSize: { width: 100, height: 100 } },
        },
      ];

      const optimalPosition = findOptimalPosition(
        { width: 200, height: 150 },
        existingPanels,
        containerSize
      );

      const hasOverlap = findCollisions(existingPanels, {
        position: optimalPosition,
        size: { width: 200, height: 150 },
      }).colliding;

      addTestResult(
        'Panel Bounds',
        'Optimal position finding',
        !hasOverlap,
        !hasOverlap ? 'Found non-overlapping position' : 'Optimal position overlaps'
      );

      // Test available space calculation
      const availableSpace = calculateAvailableSpace(existingPanels, containerSize);
      addTestResult(
        'Panel Bounds',
        'Available space calculation',
        availableSpace.totalArea > 0 && availableSpace.regions.length > 0,
        `Found ${availableSpace.regions.length} available regions`
      );
    } catch (error) {
      addTestResult(
        'Panel Bounds',
        'System test',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [addTestResult, containerSize]);

  // Test layout utilities
  const testLayoutUtils = useCallback(async () => {
    setCurrentTest('Testing layout utilities...');

    try {
      // Create test panels
      const testPanels = [
        {
          id: 'layout1',
          component: PanelComponent.SmartHub,
          position: { x: 50, y: 50 },
          size: { width: 300, height: 200 },
          zIndex: 100,
          visible: true,
          constraints: { minSize: { width: 100, height: 100 } },
        },
        {
          id: 'layout2',
          component: PanelComponent.AIChat,
          position: { x: 400, y: 300 },
          size: { width: 400, height: 350 },
          zIndex: 100,
          visible: true,
          constraints: { minSize: { width: 100, height: 100 } },
        },
      ];

      // Test metrics calculation
      const metrics = calculateLayoutMetrics(testPanels, containerSize);
      addTestResult(
        'Layout Utilities',
        'Metrics calculation',
        metrics.totalPanels === 2 && metrics.usedArea > 0,
        `Calculated metrics for ${metrics.totalPanels} panels`
      );

      // Test layout optimization
      const optimized = optimizeLayout(testPanels, {
        containerSize,
        gridSize: 20,
        minimizeOverlaps: true,
        compactLayout: true,
      });

      addTestResult(
        'Layout Utilities',
        'Layout optimization',
        optimized.length === testPanels.length,
        `Optimized ${optimized.length} panels`
      );

      // Test export/import
      const exported = exportLayout(testPanels, {
        name: 'Test Layout',
        description: 'Test export',
      });

      const imported = importLayout(exported);
      addTestResult(
        'Layout Utilities',
        'Export/Import',
        imported.success && imported.panels?.length === testPanels.length,
        imported.success ? 'Export/Import successful' : `Import failed: ${imported.error}`
      );

      // Test validation
      const validation = validateLayout(testPanels, containerSize);
      addTestResult(
        'Layout Utilities',
        'Layout validation',
        validation.valid,
        validation.valid ? 'Layout is valid' : `${validation.errors.length} errors found`
      );
    } catch (error) {
      addTestResult(
        'Layout Utilities',
        'System test',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [addTestResult, containerSize]);

  // Test performance with many panels
  const testPerformance = useCallback(async () => {
    setCurrentTest('Testing performance...');

    try {
      const monitor = performanceMonitor();
      monitor.start('bulk-operations');

      // Create many panels
      const manyPanels = Array.from({ length: 20 }, (_, i) => ({
        id: `perf_${i}`,
        component: [
          PanelComponent.SmartHub,
          PanelComponent.AIChat,
          PanelComponent.TaskManager,
          PanelComponent.Productivity,
        ][i % 4],
        position: { x: (i % 5) * 150, y: Math.floor(i / 5) * 120 },
        size: { width: 140, height: 100 },
        zIndex: 100,
        visible: true,
        constraints: { minSize: { width: 100, height: 100 } },
      }));

      // Test collision detection performance
      const collisionStart = performance.now();
      manyPanels.forEach(panel => {
        findCollisions(
          manyPanels.filter(p => p.id !== panel.id),
          panel
        );
      });
      const collisionTime = performance.now() - collisionStart;

      addTestResult(
        'Performance',
        'Collision detection (20 panels)',
        collisionTime < 100,
        `${collisionTime.toFixed(2)}ms for collision tests`
      );

      // Test optimization performance
      const optimizeStart = performance.now();
      optimizeLayout(manyPanels, {
        containerSize,
        gridSize: 20,
        minimizeOverlaps: true,
      });
      const optimizeTime = performance.now() - optimizeStart;

      addTestResult(
        'Performance',
        'Layout optimization (20 panels)',
        optimizeTime < 200,
        `${optimizeTime.toFixed(2)}ms for optimization`
      );

      const perfResult = monitor.end(manyPanels.length);
      addTestResult(
        'Performance',
        'Overall performance',
        perfResult.operationTime < 500,
        `Total operation time: ${perfResult.operationTime.toFixed(2)}ms`
      );
    } catch (error) {
      addTestResult(
        'Performance',
        'System test',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [addTestResult, containerSize]);

  // Test layout store integration
  const testStoreIntegration = useCallback(async () => {
    setCurrentTest('Testing store integration...');

    try {
      const initialPanelCount = panels.length;

      // Test adding panels
      addPanel({
        component: PanelComponent.SmartHub,
        position: { x: 100, y: 100 },
        size: { width: 400, height: 300 },
        zIndex: 100,
        visible: true,
        constraints: { minSize: { width: 200, height: 150 } },
      });

      // Wait for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      addTestResult(
        'Store Integration',
        'Add panel',
        panels.length === initialPanelCount + 1,
        `Panel count: ${initialPanelCount} → ${panels.length}`
      );

      // Test grid settings
      const originalGridSize = gridSettings.size;
      updateGridSettings({ size: 25 });

      await new Promise(resolve => setTimeout(resolve, 100));

      addTestResult(
        'Store Integration',
        'Update grid settings',
        useLayoutStore.getState().gridSettings.size === 25,
        `Grid size updated to ${useLayoutStore.getState().gridSettings.size}`
      );

      // Restore original grid size
      updateGridSettings({ size: originalGridSize });
    } catch (error) {
      addTestResult(
        'Store Integration',
        'System test',
        false,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [addTestResult, panels.length, addPanel, gridSettings.size, updateGridSettings]);

  // Add test panels for visual testing
  const addTestPanels = useCallback(() => {
    resetLayout();

    // Add one of each panel type
    const panelConfigs = [
      {
        component: PanelComponent.SmartHub,
        position: { x: 50, y: 50 },
        size: { width: 500, height: 400 },
      },
      {
        component: PanelComponent.AIChat,
        position: { x: 600, y: 50 },
        size: { width: 550, height: 450 },
      },
      {
        component: PanelComponent.TaskManager,
        position: { x: 50, y: 500 },
        size: { width: 500, height: 350 },
      },
      {
        component: PanelComponent.Productivity,
        position: { x: 600, y: 500 },
        size: { width: 450, height: 400 },
      },
    ];

    panelConfigs.forEach(config => {
      addPanel({
        component: config.component,
        position: config.position,
        size: config.size,
        zIndex: 100,
        visible: true,
        constraints: {
          minSize: { width: 300, height: 200 },
          maxSize: { width: 800, height: 600 },
        },
      });
    });
  }, [resetLayout, addPanel]);

  // Run all tests
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      testCollisionDetection,
      testGridSystem,
      testPanelBounds,
      testLayoutUtils,
      testPerformance,
      testStoreIntegration,
    ];

    for (const test of tests) {
      try {
        await test();
        await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
      } catch (error) {
        console.error('Test failed:', error);
      }
    }

    setCurrentTest('All tests completed');
    setIsRunning(false);
  }, [
    testCollisionDetection,
    testGridSystem,
    testPanelBounds,
    testLayoutUtils,
    testPerformance,
    testStoreIntegration,
  ]);

  // Auto-run tests on mount
  useEffect(() => {
    // Run tests after a short delay
    const timer = setTimeout(() => {
      runAllTests();
    }, 1000);

    return () => clearTimeout(timer);
  }, [runAllTests]);

  const successRate = testStats.total > 0 ? (testStats.passed / testStats.total) * 100 : 0;

  return (
    <div className="h-full flex">
      {/* Test Results Panel */}
      <div className="w-1/3 bg-gray-900 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Layout System Tests</h2>

          {/* Test Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-green-500/20 p-2 rounded text-center">
              <div className="text-lg font-bold text-green-400">{testStats.passed}</div>
              <div className="text-xs text-green-300">Passed</div>
            </div>
            <div className="bg-red-500/20 p-2 rounded text-center">
              <div className="text-lg font-bold text-red-400">{testStats.failed}</div>
              <div className="text-xs text-red-300">Failed</div>
            </div>
            <div className="bg-blue-500/20 p-2 rounded text-center">
              <div className="text-lg font-bold text-blue-400">{successRate.toFixed(1)}%</div>
              <div className="text-xs text-blue-300">Success</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              {isRunning ? 'Running...' : 'Run Tests'}
            </button>
            <button
              onClick={addTestPanels}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Add Test Panels
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showLayout}
                onChange={e => setShowLayout(e.target.checked)}
                className="mr-2"
              />
              <span className="text-white text-sm">Show Layout</span>
            </label>
          </div>

          {/* Current Test */}
          {isRunning && (
            <div className="bg-blue-500/20 p-2 rounded text-blue-300 text-sm">{currentTest}</div>
          )}
        </div>

        {/* Test Results */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {Object.entries(testStats.categories).map(([category, stats]) => (
              <div key={category} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-white">{category}</h3>
                  <span className="text-sm text-gray-400">
                    {stats.passed}/{stats.total}
                  </span>
                </div>

                {testResults
                  .filter(result => result.category === category)
                  .map((result, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        result.passed
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{result.passed ? '✅' : '❌'}</span>
                        <span className="font-medium">{result.name}</span>
                        {result.duration && (
                          <span className="text-xs opacity-75">
                            ({result.duration.toFixed(1)}ms)
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-90 mt-1">{result.message}</div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Display */}
      {showLayout && (
        <div className="flex-1 relative">
          <DynamicLayout
            containerSize={containerSize}
            showToolbar={true}
            toolbarPosition="top"
            enableKeyboardShortcuts={true}
            enableCollisionDetection={true}
            enableGridSnapping={true}
            className="h-full"
          />

          {/* Instructions Overlay */}
          <div className="absolute bottom-4 right-4 bg-black/80 p-4 rounded text-white text-sm max-w-md">
            <h4 className="font-bold mb-2">Test Instructions:</h4>
            <ul className="text-xs space-y-1">
              <li>• Click "Add Test Panels" to create test panels</li>
              <li>• Drag panels to test collision detection</li>
              <li>• Resize panels to test bounds constraints</li>
              <li>• Use Ctrl+G to toggle grid snapping</li>
              <li>• Try keyboard shortcuts (see console: Ctrl+Shift+D)</li>
              <li>• Test toolbar functions (optimize, export, etc.)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutSystemTest;
