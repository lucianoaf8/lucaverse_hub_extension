import React, { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import PanelSystem, { PanelProps } from '../components/dashboard/PanelSystem';
import SmartHub from '../components/dashboard/SmartHub';
import AIChat from '../components/dashboard/AIChat';
import TaskManager from '../components/dashboard/TaskManager';
import Productivity from '../components/dashboard/Productivity';
import useNavigation from '../hooks/useNavigation';

export default function Dashboard() {
  const { validateNavigationState } = useNavigation();
  
  // Validate navigation state on component mount
  React.useEffect(() => {
    const validateState = async () => {
      try {
        await validateNavigationState();
      } catch (error) {
        console.error('Navigation validation failed:', error);
      }
    };
    
    validateState();
  }, [validateNavigationState]);

  const [panels, setPanels] = useState<PanelProps[]>([
    {
      id: 'smart-hub',
      title: 'Smart Hub',
      children: <SmartHub />,
      isMinimized: false,
    },
    {
      id: 'ai-chat',
      title: 'AI Chat',
      children: <AIChat />,
      isMinimized: false,
    },
    {
      id: 'task-manager',
      title: 'Task Manager',
      children: <TaskManager />,
      isMinimized: false,
    },
    {
      id: 'productivity',
      title: 'Productivity',
      children: <Productivity />,
      isMinimized: true,
    },
  ]);

  const handlePanelClose = (panelId: string) => {
    setPanels(prev => prev.filter(panel => panel.id !== panelId));
  };

  const handlePanelMinimize = (panelId: string) => {
    setPanels(prev =>
      prev.map(panel =>
        panel.id === panelId
          ? { ...panel, isMinimized: !panel.isMinimized }
          : panel
      )
    );
  };

  const handlePanelSettings = (panelId: string) => {
    console.log(`Settings for panel: ${panelId}`);
    // In a real implementation, this would open a settings modal
  };

  const addPanel = (type: string) => {
    const newPanel: PanelProps = {
      id: `${type}-${Date.now()}`,
      title: `New ${type}`,
      children: <div className="p-4 text-center text-neutral-400">New {type} panel</div>,
      isMinimized: false,
    };
    setPanels(prev => [...prev, newPanel]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-neutral-400 mt-1">
              Welcome to your productivity command center
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-400">Add Panel:</span>
              <button
                onClick={() => addPanel('widget')}
                className="px-3 py-1 bg-primary/20 hover:bg-primary/30 border border-primary/40 
                           rounded text-sm transition-colors"
              >
                + Widget
              </button>
              <button
                onClick={() => addPanel('tool')}
                className="px-3 py-1 bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 
                           rounded text-sm transition-colors"
              >
                + Tool
              </button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-neutral-400">
              <span>Panels: {panels.length}</span>
              <span>•</span>
              <span>Active: {panels.filter(p => !p.isMinimized).length}</span>
            </div>
          </div>
        </div>

        {/* Panel System */}
        <PanelSystem
          panels={panels}
          onPanelClose={handlePanelClose}
          onPanelMinimize={handlePanelMinimize}
          onPanelSettings={handlePanelSettings}
        />

        {/* Dashboard Features Info */}
        <div className="bg-elevated rounded-xl p-6 border border-neutral-700">
          <h2 className="text-xl font-semibold text-secondary mb-4">Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🎯</span>
                <h3 className="font-medium text-primary">Smart Hub</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Central command center with quick actions, recent items, and system status monitoring.
              </p>
            </div>
            
            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🤖</span>
                <h3 className="font-medium text-secondary">AI Chat</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Interactive AI assistant with model selection, chat history, and export capabilities.
              </p>
            </div>
            
            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📋</span>
                <h3 className="font-medium text-warning">Task Manager</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Comprehensive task management with priorities, categories, and progress tracking.
              </p>
            </div>
            
            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">⚡</span>
                <h3 className="font-medium text-success">Productivity</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Pomodoro timer, focus sessions, and productivity metrics tracking.
              </p>
            </div>
            
            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">📱</span>
                <h3 className="font-medium text-info">Panel System</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Flexible panel management with drag-and-drop, minimize/maximize, and custom layouts.
              </p>
            </div>
            
            <div className="p-4 bg-surface rounded-lg border border-neutral-700">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">🔄</span>
                <h3 className="font-medium text-neutral-300">Extensible</h3>
              </div>
              <p className="text-sm text-neutral-400">
                Foundation ready for adding new panels, widgets, and custom functionality.
              </p>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-surface rounded-xl p-6 border border-neutral-700">
          <h2 className="text-xl font-semibold text-primary mb-4">Getting Started</h2>
          <div className="space-y-3 text-sm text-neutral-300">
            <div className="flex items-start space-x-3">
              <span className="text-primary">1.</span>
              <p>Use the <strong>Smart Hub</strong> for quick actions and system overview</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-primary">2.</span>
              <p>Chat with the <strong>AI Assistant</strong> for help and information</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-primary">3.</span>
              <p>Manage your tasks with the <strong>Task Manager</strong></p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-primary">4.</span>
              <p>Use <strong>Productivity Tools</strong> for focused work sessions</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-primary">5.</span>
              <p>Customize your workspace by adding, removing, or rearranging panels</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}