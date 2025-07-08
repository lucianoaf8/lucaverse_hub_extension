import React, { useState, ReactNode } from 'react';

export interface PanelProps {
  id: string;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onSettings?: () => void;
  isMinimized?: boolean;
  isResizable?: boolean;
  className?: string;
}

export function Panel({ 
  id, 
  title, 
  children, 
  onClose, 
  onMinimize, 
  onSettings, 
  isMinimized = false, 
  isResizable = false,
  className = ''
}: PanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div 
      className={`
        bg-surface border border-neutral-700 rounded-lg shadow-lg 
        ${isDragging ? 'opacity-80' : ''}
        ${className}
      `}
      data-panel-id={id}
    >
      <div 
        className="flex items-center justify-between p-4 border-b border-neutral-700 bg-elevated rounded-t-lg cursor-move"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <h3 className="font-medium text-primary">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-1 hover:bg-neutral-700 rounded transition-colors"
              title="Panel Settings"
            >
              ⚙️
            </button>
          )}
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 hover:bg-neutral-700 rounded transition-colors"
              title={isMinimized ? "Restore" : "Minimize"}
            >
              {isMinimized ? '🔼' : '🔽'}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-700 rounded transition-colors"
              title="Close Panel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {children}
        </div>
      )}

      {isResizable && !isMinimized && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-neutral-600 rounded-full"></div>
        </div>
      )}
    </div>
  );
}

export interface PanelSystemProps {
  panels: PanelProps[];
  onPanelClose?: (panelId: string) => void;
  onPanelMinimize?: (panelId: string) => void;
  onPanelSettings?: (panelId: string) => void;
  className?: string;
}

export default function PanelSystem({ 
  panels, 
  onPanelClose, 
  onPanelMinimize, 
  onPanelSettings,
  className = ''
}: PanelSystemProps) {
  const handlePanelAction = (panelId: string, action: 'close' | 'minimize' | 'settings') => {
    switch (action) {
      case 'close':
        onPanelClose?.(panelId);
        break;
      case 'minimize':
        onPanelMinimize?.(panelId);
        break;
      case 'settings':
        onPanelSettings?.(panelId);
        break;
    }
  };

  const activePanels = panels.filter(panel => !panel.isMinimized);
  const minimizedPanels = panels.filter(panel => panel.isMinimized);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {activePanels.map((panel) => (
          <Panel
            key={panel.id}
            {...panel}
            onClose={() => handlePanelAction(panel.id, 'close')}
            onMinimize={() => handlePanelAction(panel.id, 'minimize')}
            onSettings={() => handlePanelAction(panel.id, 'settings')}
            isResizable={true}
          />
        ))}
      </div>

      {/* Minimized Panels Bar */}
      {minimizedPanels.length > 0 && (
        <div className="border-t border-neutral-700 pt-4">
          <h3 className="text-sm font-medium text-neutral-400 mb-3">Minimized Panels</h3>
          <div className="flex flex-wrap gap-2">
            {minimizedPanels.map((panel) => (
              <button
                key={panel.id}
                onClick={() => handlePanelAction(panel.id, 'minimize')}
                className="px-3 py-2 bg-surface border border-neutral-700 rounded-lg 
                           hover:border-primary/50 transition-colors text-sm"
              >
                <span className="mr-2">📄</span>
                {panel.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Panel Drop Zone */}
      <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center">
        <div className="text-4xl mb-2">📱</div>
        <p className="text-neutral-400">
          Drag panels here to organize your workspace
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          Panel management and drag-and-drop functionality coming soon
        </p>
      </div>

      {/* Panel Type Legend */}
      <div className="bg-surface rounded-lg p-4 border border-neutral-700">
        <h3 className="font-medium text-secondary mb-3">Panel Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm text-neutral-300">Smart Hub</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span className="text-sm text-neutral-300">AI Chat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-sm text-neutral-300">Task Manager</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-sm text-neutral-300">Productivity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-danger rounded-full"></div>
            <span className="text-sm text-neutral-300">System Monitor</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-info rounded-full"></div>
            <span className="text-sm text-neutral-300">Custom Panel</span>
          </div>
        </div>
      </div>
    </div>
  );
}