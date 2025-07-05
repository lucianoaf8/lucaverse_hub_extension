import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PanelLayout, PanelComponent, Position } from '../../types/panel';
import { PanelToolbar } from '../ui/PanelToolbar';
import { PanelGroup, GroupManager } from '../ui/PanelGroup';
import { PanelContextMenu, useContextMenu } from '../ui/PanelContextMenu';
import { useTemplateStore, TemplateCategory } from '../../stores/templateStore';
import { workspaceManager } from '../../utils/workspaceManager';
import { zIndexManager } from '../../utils/zIndexManager';
import { panelManager } from '../../utils/panelManager';
import clsx from 'clsx';

/**
 * Comprehensive Panel Management Test Component
 * Tests all panel management features in an integrated environment
 */
export const PanelManagementTest: React.FC = () => {
  // State management
  const [panels, setPanels] = useState<PanelLayout[]>([]);
  const [selectedPanels, setSelectedPanels] = useState<string[]>([]);
  const [panelGroups, setPanelGroups] = useState<any[]>([]);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('Test Workspace');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    [key: string]: { passed: boolean; message: string; timestamp: number };
  }>({});

  // Template store
  const { templates, createTemplate, applyTemplate, getFilteredTemplates } = useTemplateStore();

  // Context menu
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const testLogRef = useRef<HTMLDivElement>(null);

  // Initialize with some test panels
  useEffect(() => {
    initializeTestPanels();
  }, []);

  // Auto-scroll test log
  useEffect(() => {
    if (testLogRef.current) {
      testLogRef.current.scrollTop = testLogRef.current.scrollHeight;
    }
  }, [testResults]);

  /**
   * Initialize test panels for demonstration
   */
  const initializeTestPanels = useCallback(() => {
    const testPanels: PanelLayout[] = [
      {
        id: 'test-smart-hub',
        component: PanelComponent.SmartHub,
        position: { x: 50, y: 50 },
        size: { width: 350, height: 250 },
        zIndex: 2000,
        visible: true,
        constraints: { minSize: { width: 300, height: 200 } },
        metadata: { title: 'Smart Hub Test', icon: '🔗', color: '#3B82F6' },
      },
      {
        id: 'test-ai-chat',
        component: PanelComponent.AIChat,
        position: { x: 450, y: 50 },
        size: { width: 400, height: 350 },
        zIndex: 2001,
        visible: true,
        constraints: { minSize: { width: 350, height: 300 } },
        metadata: { title: 'AI Chat Test', icon: '🤖', color: '#10B981' },
      },
      {
        id: 'test-task-manager',
        component: PanelComponent.TaskManager,
        position: { x: 50, y: 350 },
        size: { width: 300, height: 300 },
        zIndex: 2002,
        visible: true,
        constraints: { minSize: { width: 250, height: 200 } },
        metadata: { title: 'Task Manager Test', icon: '📋', color: '#F59E0B' },
      },
    ];

    setPanels(testPanels);
    logTestResult('initialization', true, 'Test panels initialized successfully');
  }, []);

  /**
   * Log test results
   */
  const logTestResult = useCallback((testName: string, passed: boolean, message: string) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: {
        passed,
        message,
        timestamp: Date.now(),
      },
    }));
  }, []);

  /**
   * Panel creation handler
   */
  const handleCreatePanel = useCallback(
    (type: PanelComponent, position?: Position) => {
      try {
        const newPanel: PanelLayout = {
          id: `panel-${type}-${Date.now()}`,
          component: type,
          position: position || { x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 },
          size: getDefaultPanelSize(type),
          zIndex: Math.max(...panels.map(p => p.zIndex), 2000) + 1,
          visible: true,
          constraints: { minSize: getMinPanelSize(type) },
          metadata: {
            title: `${type} Panel`,
            icon: getPanelIcon(type),
            color: getPanelColor(type),
          },
        };

        setPanels(prev => [...prev, newPanel]);
        setHasUnsavedChanges(true);
        logTestResult('panel-creation', true, `Created ${type} panel successfully`);
      } catch (error) {
        logTestResult('panel-creation', false, `Failed to create panel: ${error}`);
      }
    },
    [panels]
  );

  /**
   * Workspace save handler
   */
  const handleSaveWorkspace = useCallback(
    async (name?: string) => {
      setIsLoading(true);
      try {
        const workspaceConfig = {
          name: name || workspaceName,
          panels,
          selectedPanelIds: selectedPanels,
          gridSettings: {
            enabled: gridEnabled,
            size: 50,
            visible: gridEnabled,
            color: '#ffffff',
            opacity: 0.1,
            snapThreshold: 10,
          },
          settings: {
            theme: 'dark',
            autoSave: true,
            autoSaveInterval: 30000,
            snapToGrid: snapEnabled,
            showGrid: gridEnabled,
            debugMode: true,
          },
        };

        const workspaceId = await workspaceManager.saveWorkspace(
          workspaceConfig.name,
          workspaceConfig,
          {
            description: 'Test workspace for panel management validation',
            tags: ['test', 'validation'],
            createBackup: true,
          }
        );

        setHasUnsavedChanges(false);
        logTestResult('workspace-save', true, `Workspace saved with ID: ${workspaceId}`);
      } catch (error) {
        logTestResult('workspace-save', false, `Failed to save workspace: ${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [workspaceName, panels, selectedPanels, gridEnabled, snapEnabled]
  );

  /**
   * Workspace load handler
   */
  const handleLoadWorkspace = useCallback(async (workspaceId?: string) => {
    setIsLoading(true);
    try {
      // For demo, load the first available workspace
      const workspaces = workspaceManager.getWorkspaces();
      const targetWorkspace = workspaceId
        ? await workspaceManager.loadWorkspace(workspaceId)
        : workspaces[0]
          ? await workspaceManager.loadWorkspace(workspaces[0].id)
          : null;

      if (targetWorkspace) {
        setPanels(targetWorkspace.panels || []);
        setSelectedPanels(targetWorkspace.selectedPanelIds || []);
        setGridEnabled(targetWorkspace.settings?.showGrid || false);
        setSnapEnabled(targetWorkspace.settings?.snapToGrid || false);
        setWorkspaceName(targetWorkspace.name);
        setHasUnsavedChanges(false);
        logTestResult('workspace-load', true, `Loaded workspace: ${targetWorkspace.name}`);
      } else {
        logTestResult('workspace-load', false, 'No workspaces available to load');
      }
    } catch (error) {
      logTestResult('workspace-load', false, `Failed to load workspace: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Template operations
   */
  const handleSaveTemplate = useCallback(() => {
    try {
      if (panels.length === 0) {
        logTestResult('template-save', false, 'No panels to save as template');
        return;
      }

      const templateId = createTemplate(
        `Test Template ${Date.now()}`,
        'Template created from panel management test',
        panels,
        TemplateCategory.Dashboard
      );

      logTestResult('template-save', true, `Template saved with ID: ${templateId}`);
    } catch (error) {
      logTestResult('template-save', false, `Failed to save template: ${error}`);
    }
  }, [panels, createTemplate]);

  const handleLoadTemplate = useCallback(() => {
    try {
      const availableTemplates = getFilteredTemplates();
      if (availableTemplates.length === 0) {
        logTestResult('template-load', false, 'No templates available to load');
        return;
      }

      const templatePanels = applyTemplate(availableTemplates[0].id);
      setPanels(templatePanels);
      setHasUnsavedChanges(true);
      logTestResult('template-load', true, `Loaded template: ${availableTemplates[0].name}`);
    } catch (error) {
      logTestResult('template-load', false, `Failed to load template: ${error}`);
    }
  }, [getFilteredTemplates, applyTemplate]);

  /**
   * Panel grouping operations
   */
  const handleCreateGroup = useCallback(() => {
    try {
      if (selectedPanels.length < 2) {
        logTestResult('group-create', false, 'Need at least 2 panels selected to create group');
        return;
      }

      const selectedPanelObjects = panels.filter(p => selectedPanels.includes(p.id));
      const group = GroupManager.createGroup(
        `Group ${Date.now()}`,
        selectedPanels,
        selectedPanelObjects
      );

      setPanelGroups(prev => [...prev, group]);
      logTestResult('group-create', true, `Created group with ${selectedPanels.length} panels`);
    } catch (error) {
      logTestResult('group-create', false, `Failed to create group: ${error}`);
    }
  }, [selectedPanels, panels]);

  /**
   * Z-index operations
   */
  const handleBringToFront = useCallback(() => {
    try {
      if (selectedPanels.length === 0) {
        logTestResult('z-index-front', false, 'No panels selected');
        return;
      }

      let updatedPanels = panels;
      selectedPanels.forEach(panelId => {
        updatedPanels = zIndexManager.bringToFront(panelId, updatedPanels);
      });

      setPanels(updatedPanels);
      setHasUnsavedChanges(true);
      logTestResult('z-index-front', true, `Brought ${selectedPanels.length} panels to front`);
    } catch (error) {
      logTestResult('z-index-front', false, `Failed to bring to front: ${error}`);
    }
  }, [selectedPanels, panels]);

  const handleSendToBack = useCallback(() => {
    try {
      if (selectedPanels.length === 0) {
        logTestResult('z-index-back', false, 'No panels selected');
        return;
      }

      let updatedPanels = panels;
      selectedPanels.forEach(panelId => {
        updatedPanels = zIndexManager.sendToBack(panelId, updatedPanels);
      });

      setPanels(updatedPanels);
      setHasUnsavedChanges(true);
      logTestResult('z-index-back', true, `Sent ${selectedPanels.length} panels to back`);
    } catch (error) {
      logTestResult('z-index-back', false, `Failed to send to back: ${error}`);
    }
  }, [selectedPanels, panels]);

  /**
   * Panel selection handlers
   */
  const handlePanelSelect = useCallback((panelId: string, addToSelection: boolean = false) => {
    setSelectedPanels(prev => {
      if (addToSelection) {
        return prev.includes(panelId) ? prev.filter(id => id !== panelId) : [...prev, panelId];
      } else {
        return [panelId];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedPanels(panels.map(p => p.id));
    logTestResult('select-all', true, `Selected all ${panels.length} panels`);
  }, [panels]);

  const handleInvertSelection = useCallback(() => {
    const currentSelected = new Set(selectedPanels);
    const newSelection = panels.filter(p => !currentSelected.has(p.id)).map(p => p.id);
    setSelectedPanels(newSelection);
    logTestResult(
      'select-invert',
      true,
      `Inverted selection: ${newSelection.length} panels selected`
    );
  }, [panels, selectedPanels]);

  const handleClearSelection = useCallback(() => {
    setSelectedPanels([]);
    logTestResult('select-clear', true, 'Cleared panel selection');
  }, []);

  /**
   * Context menu actions
   */
  const handleContextMenuAction = useCallback(
    (action: string, panelIds: string[]) => {
      try {
        switch (action) {
          case 'duplicate':
            panelIds.forEach(panelId => {
              const originalPanel = panels.find(p => p.id === panelId);
              if (originalPanel) {
                handleCreatePanel(originalPanel.component, {
                  x: originalPanel.position.x + 20,
                  y: originalPanel.position.y + 20,
                });
              }
            });
            logTestResult('context-duplicate', true, `Duplicated ${panelIds.length} panels`);
            break;

          case 'delete':
            setPanels(prev => prev.filter(p => !panelIds.includes(p.id)));
            setSelectedPanels(prev => prev.filter(id => !panelIds.includes(id)));
            setHasUnsavedChanges(true);
            logTestResult('context-delete', true, `Deleted ${panelIds.length} panels`);
            break;

          case 'bring-to-front':
            handleBringToFront();
            break;

          case 'send-to-back':
            handleSendToBack();
            break;

          case 'group':
            handleCreateGroup();
            break;

          default:
            logTestResult(`context-${action}`, true, `Executed context action: ${action}`);
        }
      } catch (error) {
        logTestResult(`context-${action}`, false, `Failed to execute ${action}: ${error}`);
      }
    },
    [panels, handleCreatePanel, handleBringToFront, handleSendToBack, handleCreateGroup]
  );

  /**
   * Right-click handler for context menu
   */
  const handlePanelRightClick = useCallback(
    (event: React.MouseEvent, panelId: string) => {
      event.preventDefault();
      const panel = panels.find(p => p.id === panelId);
      if (panel) {
        if (!selectedPanels.includes(panelId)) {
          setSelectedPanels([panelId]);
        }
        showContextMenu(
          event,
          panels.filter(p => selectedPanels.includes(p.id) || p.id === panelId)
        );
      }
    },
    [panels, selectedPanels, showContextMenu]
  );

  /**
   * Run all automated tests
   */
  const runAutomatedTests = useCallback(async () => {
    setTestResults({});

    // Test 1: Panel Creation
    setTimeout(() => {
      handleCreatePanel(PanelComponent.SmartHub);
    }, 100);

    // Test 2: Template System
    setTimeout(() => {
      handleSaveTemplate();
    }, 200);

    // Test 3: Workspace Management
    setTimeout(() => {
      handleSaveWorkspace('Automated Test Workspace');
    }, 300);

    // Test 4: Selection Operations
    setTimeout(() => {
      handleSelectAll();
    }, 400);

    setTimeout(() => {
      handleInvertSelection();
    }, 500);

    // Test 5: Panel Grouping
    setTimeout(() => {
      if (panels.length >= 2) {
        setSelectedPanels([panels[0].id, panels[1].id]);
        setTimeout(handleCreateGroup, 100);
      }
    }, 600);

    // Test 6: Z-Index Management
    setTimeout(() => {
      if (panels.length > 0) {
        setSelectedPanels([panels[0].id]);
        setTimeout(handleBringToFront, 100);
      }
    }, 700);

    logTestResult('automated-tests', true, 'Started automated test sequence');
  }, [
    panels,
    handleCreatePanel,
    handleSaveTemplate,
    handleSaveWorkspace,
    handleSelectAll,
    handleInvertSelection,
    handleCreateGroup,
    handleBringToFront,
  ]);

  // Helper functions for panel defaults
  const getDefaultPanelSize = (type: PanelComponent) => {
    const sizes = {
      [PanelComponent.SmartHub]: { width: 350, height: 250 },
      [PanelComponent.AIChat]: { width: 400, height: 350 },
      [PanelComponent.TaskManager]: { width: 300, height: 300 },
      [PanelComponent.Productivity]: { width: 250, height: 400 },
    };
    return sizes[type] || { width: 300, height: 250 };
  };

  const getMinPanelSize = (type: PanelComponent) => {
    const sizes = {
      [PanelComponent.SmartHub]: { width: 300, height: 200 },
      [PanelComponent.AIChat]: { width: 350, height: 300 },
      [PanelComponent.TaskManager]: { width: 250, height: 200 },
      [PanelComponent.Productivity]: { width: 200, height: 300 },
    };
    return sizes[type] || { width: 200, height: 150 };
  };

  const getPanelIcon = (type: PanelComponent) => {
    const icons = {
      [PanelComponent.SmartHub]: '🔗',
      [PanelComponent.AIChat]: '🤖',
      [PanelComponent.TaskManager]: '📋',
      [PanelComponent.Productivity]: '⚡',
    };
    return icons[type] || '📄';
  };

  const getPanelColor = (type: PanelComponent) => {
    const colors = {
      [PanelComponent.SmartHub]: '#3B82F6',
      [PanelComponent.AIChat]: '#10B981',
      [PanelComponent.TaskManager]: '#F59E0B',
      [PanelComponent.Productivity]: '#8B5CF6',
    };
    return colors[type] || '#6B7280';
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Panel Toolbar */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <PanelToolbar
          onCreatePanel={handleCreatePanel}
          onSaveWorkspace={handleSaveWorkspace}
          onLoadWorkspace={handleLoadWorkspace}
          onNewWorkspace={() => {
            setPanels([]);
            setSelectedPanels([]);
            setPanelGroups([]);
            setHasUnsavedChanges(false);
            logTestResult('workspace-new', true, 'Created new workspace');
          }}
          onResetWorkspace={() => {
            initializeTestPanels();
            setSelectedPanels([]);
            setPanelGroups([]);
            setHasUnsavedChanges(false);
            logTestResult('workspace-reset', true, 'Reset workspace to default');
          }}
          onSelectAll={handleSelectAll}
          onInvertSelection={handleInvertSelection}
          onClearSelection={handleClearSelection}
          onToggleGrid={enabled => {
            setGridEnabled(enabled);
            logTestResult('grid-toggle', true, `Grid ${enabled ? 'enabled' : 'disabled'}`);
          }}
          onToggleSnap={enabled => {
            setSnapEnabled(enabled);
            logTestResult('snap-toggle', true, `Snap ${enabled ? 'enabled' : 'disabled'}`);
          }}
          selectedCount={selectedPanels.length}
          gridEnabled={gridEnabled}
          snapEnabled={snapEnabled}
          workspaceName={workspaceName}
          hasUnsavedChanges={hasUnsavedChanges}
          isLoading={isLoading}
          className="bg-black/80 backdrop-blur-md border border-white/20"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative bg-gradient-to-br from-gray-800 to-gray-900"
            style={{
              backgroundImage: gridEnabled
                ? 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)'
                : undefined,
              backgroundSize: gridEnabled ? '50px 50px' : undefined,
            }}
          >
            {/* Panel Groups */}
            {panelGroups.map(group => (
              <PanelGroup
                key={group.id}
                group={group}
                panels={panels}
                selectedPanelIds={selectedPanels}
                onGroupAction={(groupId, action) => {
                  logTestResult(
                    `group-${action}`,
                    true,
                    `Executed group action: ${action} on group ${groupId}`
                  );
                }}
                onPanelSelect={(panelIds, addToSelection) => {
                  setSelectedPanels(addToSelection ? [...selectedPanels, ...panelIds] : panelIds);
                }}
                onGroupUpdate={(groupId, updates) => {
                  setPanelGroups(prev =>
                    prev.map(g => (g.id === groupId ? { ...g, ...updates } : g))
                  );
                }}
                onGroupDelete={groupId => {
                  setPanelGroups(prev => prev.filter(g => g.id !== groupId));
                  logTestResult('group-delete', true, `Deleted group: ${groupId}`);
                }}
              />
            ))}

            {/* Panels */}
            {panels.map(panel => (
              <div
                key={panel.id}
                className={clsx(
                  'absolute border-2 rounded-lg transition-all duration-200 cursor-pointer',
                  'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm',
                  {
                    'border-blue-400 ring-2 ring-blue-400/50': selectedPanels.includes(panel.id),
                    'border-white/20 hover:border-white/40': !selectedPanels.includes(panel.id),
                    'opacity-50': !panel.visible,
                  }
                )}
                style={{
                  left: panel.position.x,
                  top: panel.position.y,
                  width: panel.size.width,
                  height: panel.size.height,
                  zIndex: panel.zIndex,
                }}
                onClick={e => handlePanelSelect(panel.id, e.ctrlKey || e.metaKey)}
                onContextMenu={e => handlePanelRightClick(e, panel.id)}
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between p-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{panel.metadata?.icon}</span>
                    <span className="text-white text-sm font-medium">{panel.metadata?.title}</span>
                  </div>
                  <div className="text-xs text-white/50">z:{panel.zIndex}</div>
                </div>

                {/* Panel Content */}
                <div className="p-4 h-full">
                  <div className="text-white/70 text-sm">{panel.component} Panel</div>
                  <div className="text-white/50 text-xs mt-2">ID: {panel.id}</div>
                  <div className="text-white/50 text-xs">
                    Size: {panel.size.width}x{panel.size.height}
                  </div>
                  <div className="text-white/50 text-xs">
                    Position: ({panel.position.x}, {panel.position.y})
                  </div>
                </div>
              </div>
            ))}

            {/* No Panels Message */}
            {panels.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/50">
                  <div className="text-6xl mb-4">📋</div>
                  <div className="text-xl mb-2">No Panels</div>
                  <div className="text-sm">
                    Use the toolbar to create panels or load a workspace
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Test Controls */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold mb-4">Test Controls</h3>

            <div className="space-y-2">
              <button
                onClick={runAutomatedTests}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
              >
                Run All Tests
              </button>

              <button
                onClick={handleSaveTemplate}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                Save as Template
              </button>

              <button
                onClick={handleLoadTemplate}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
              >
                Load Template
              </button>

              <button
                onClick={() => {
                  const stats = panelManager.getStatistics();
                  logTestResult(
                    'panel-stats',
                    true,
                    `Stats: ${stats.totalPanels} panels, ${stats.overlappingPanels} overlapping`
                  );
                }}
                className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
              >
                Get Statistics
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 text-sm text-white/70">
              <div>Panels: {panels.length}</div>
              <div>Selected: {selectedPanels.length}</div>
              <div>Groups: {panelGroups.length}</div>
              <div>Templates: {templates.length}</div>
            </div>
          </div>

          {/* Test Results Log */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-700">
              <h4 className="text-white font-medium text-sm">Test Results</h4>
            </div>

            <div ref={testLogRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {Object.entries(testResults).map(([testName, result]) => (
                <div
                  key={`${testName}-${result.timestamp}`}
                  className={clsx(
                    'p-2 rounded border-l-4',
                    result.passed
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-red-900/30 border-red-500'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={clsx(
                        'font-medium',
                        result.passed ? 'text-green-400' : 'text-red-400'
                      )}
                    >
                      {result.passed ? '✅' : '❌'} {testName}
                    </span>
                    <span className="text-white/50 text-xs">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-white/70 mt-1">{result.message}</div>
                </div>
              ))}

              {Object.keys(testResults).length === 0 && (
                <div className="text-white/50 text-center py-8">
                  No test results yet. Click "Run All Tests" to start.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <PanelContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        visible={contextMenu.visible}
        selectedPanels={contextMenu.selectedPanels}
        allPanels={panels}
        onAction={handleContextMenuAction}
        onClose={hideContextMenu}
        canGroup={selectedPanels.length >= 2}
        canUngroup={false} // Would need to check if selected panels are in groups
        hasClipboard={panelManager.hasClipboardContent()}
      />
    </div>
  );
};

export default PanelManagementTest;
