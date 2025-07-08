import React from 'react';

export default function SmartHub() {

  const quickActions = [
    { id: 'create-task', name: 'Create Task', icon: '📝', color: 'primary' },
    { id: 'new-chat', name: 'New Chat', icon: '💬', color: 'secondary' },
    { id: 'view-reports', name: 'View Reports', icon: '📊', color: 'success' },
    { id: 'settings', name: 'Settings', icon: '⚙️', color: 'warning' },
    { id: 'help', name: 'Help', icon: '❓', color: 'info' },
    { id: 'notifications', name: 'Notifications', icon: '🔔', color: 'danger' },
  ];

  const recentItems = [
    { id: '1', name: 'Project Planning Document', type: 'document', time: '2 hours ago', icon: '📄' },
    { id: '2', name: 'Team Meeting Notes', type: 'note', time: '3 hours ago', icon: '📝' },
    { id: '3', name: 'Code Review: Auth Module', type: 'review', time: '5 hours ago', icon: '👁️' },
    { id: '4', name: 'Performance Metrics', type: 'report', time: '1 day ago', icon: '📈' },
  ];

  const systemStatus = [
    { name: 'Theme System', status: 'operational', icon: '🎨' },
    { name: 'AI Services', status: 'operational', icon: '🤖' },
    { name: 'Task Manager', status: 'operational', icon: '📋' },
    { name: 'Performance Monitor', status: 'operational', icon: '⚡' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-danger';
      default:
        return 'text-neutral-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/20 via-secondary/20 to-success/20 rounded-xl p-6 border border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Welcome to Smart Hub</h1>
            <p className="text-neutral-300 mt-1">
              Your central command center for productivity and collaboration
            </p>
          </div>
          <div className="text-4xl">🚀</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-neutral-400">Current Session:</span>
            <div className="font-medium text-success">Active</div>
          </div>
          <div>
            <span className="text-neutral-400">Tasks Today:</span>
            <div className="font-medium text-warning">5 pending</div>
          </div>
          <div>
            <span className="text-neutral-400">Performance:</span>
            <div className="font-medium text-primary">Optimal</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-surface rounded-xl p-6 border border-neutral-700">
          <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className={`p-4 bg-elevated rounded-lg border border-neutral-700
                           hover:border-${action.color}/50 hover:bg-${action.color}/10 
                           transition-all duration-base group`}
                aria-label={`${action.label} action`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <span className={`font-medium text-${action.color} group-hover:text-${action.color}`}>
                    {action.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Items */}
        <div className="bg-surface rounded-xl p-6 border border-neutral-700">
          <h2 className="text-lg font-semibold text-secondary mb-4">Recent Items</h2>
          {recentItems.length > 0 ? (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-3 bg-elevated rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-neutral-300">{item.name}</div>
                    <div className="text-sm text-neutral-500 capitalize">{item.type} • {item.time}</div>
                  </div>
                  <button className="text-neutral-400 hover:text-primary transition-colors" aria-label={`Navigate to ${item.title}`}>
                    →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-neutral-400">No recent items</p>
              <p className="text-sm text-neutral-500 mt-1">
                Your recent documents and activities will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-surface rounded-xl p-6 border border-neutral-700">
        <h2 className="text-lg font-semibold text-success mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStatus.map((system) => (
            <div
              key={system.name}
              className="p-4 bg-elevated rounded-lg border border-neutral-700"
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">{system.icon}</span>
                <span className="font-medium text-neutral-300">{system.name}</span>
              </div>
              <div className={`text-sm font-medium ${getStatusColor(system.status)}`}>
                ✓ {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="bg-surface rounded-xl p-6 border border-neutral-700">
        <h2 className="text-lg font-semibold text-info mb-4">Navigation Shortcuts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a
            href="#ai-chat"
            className="flex items-center space-x-3 p-3 bg-elevated rounded-lg border border-neutral-700 hover:border-secondary/50 hover:bg-secondary/10 transition-colors"
          >
            <span className="text-lg">💬</span>
            <span className="font-medium text-secondary">AI Chat Assistant</span>
          </a>
          <a
            href="#task-manager"
            className="flex items-center space-x-3 p-3 bg-elevated rounded-lg border border-neutral-700 hover:border-warning/50 hover:bg-warning/10 transition-colors"
          >
            <span className="text-lg">📋</span>
            <span className="font-medium text-warning">Task Manager</span>
          </a>
          <a
            href="#productivity"
            className="flex items-center space-x-3 p-3 bg-elevated rounded-lg border border-neutral-700 hover:border-success/50 hover:bg-success/10 transition-colors"
          >
            <span className="text-lg">⚡</span>
            <span className="font-medium text-success">Productivity Tools</span>
          </a>
        </div>
      </div>
    </div>
  );
}