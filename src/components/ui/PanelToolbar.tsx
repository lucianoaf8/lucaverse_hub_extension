import React, { useState, useCallback } from 'react';
import { PanelComponent } from '../../types/panel';
import clsx from 'clsx';

// Panel toolbar configuration
export interface PanelToolbarProps {
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
  customizable?: boolean;

  // Panel creation
  onCreatePanel?: (type: PanelComponent, position?: { x: number; y: number }) => void;
  availablePanelTypes?: PanelComponent[];

  // Workspace management
  onSaveWorkspace?: (name?: string) => void;
  onLoadWorkspace?: (workspaceId?: string) => void;
  onNewWorkspace?: () => void;
  onResetWorkspace?: () => void;

  // Layout tools
  onAlignPanels?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistributePanels?: (distribution: 'horizontal' | 'vertical') => void;
  onOrganizePanels?: (organization: 'grid' | 'cascade' | 'stack') => void;

  // Selection tools
  onSelectAll?: () => void;
  onInvertSelection?: () => void;
  onClearSelection?: () => void;
  selectedCount?: number;

  // Grid and snap controls
  gridEnabled?: boolean;
  snapEnabled?: boolean;
  onToggleGrid?: (enabled: boolean) => void;
  onToggleSnap?: (enabled: boolean) => void;

  // State
  workspaceName?: string;
  hasUnsavedChanges?: boolean;
  isLoading?: boolean;
}

// Panel type configurations
const PANEL_TYPE_CONFIG = {
  [PanelComponent.SmartHub]: {
    label: 'Smart Hub',
    icon: '🔗',
    description: 'Smart bookmarks and navigation',
    color: 'blue',
    shortcut: '1',
  },
  [PanelComponent.AIChat]: {
    label: 'AI Chat',
    icon: '🤖',
    description: 'Intelligent conversation assistant',
    color: 'green',
    shortcut: '2',
  },
  [PanelComponent.TaskManager]: {
    label: 'Task Manager',
    icon: '📋',
    description: 'Project and task organization',
    color: 'yellow',
    shortcut: '3',
  },
  [PanelComponent.Productivity]: {
    label: 'Productivity',
    icon: '⚡',
    description: 'Productivity tools and utilities',
    color: 'purple',
    shortcut: '4',
  },
};

// Toolbar button component
const ToolbarButton: React.FC<{
  icon: string;
  label: string;
  description?: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}> = ({
  icon,
  label,
  description,
  shortcut,
  active = false,
  disabled = false,
  variant = 'ghost',
  size = 'md',
  onClick,
  className = '',
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center transition-all duration-150 rounded-lg';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    ghost: 'hover:bg-white/10 text-white/80 hover:text-white',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        {
          'bg-blue-600 text-white': active,
          'opacity-50 cursor-not-allowed': disabled,
          'cursor-pointer': !disabled,
        },
        className
      )}
      onClick={onClick}
      disabled={disabled}
      title={description ? `${label}${shortcut ? ` (${shortcut})` : ''}\n${description}` : label}
      aria-label={label}
    >
      <span className="text-lg">{icon}</span>
      {shortcut && size !== 'sm' && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-black/60 text-white text-xs rounded-full flex items-center justify-center">
          {shortcut}
        </span>
      )}
    </button>
  );
};

// Button group component
const ButtonGroup: React.FC<{
  children: React.ReactNode;
  label?: string;
  className?: string;
}> = ({ children, label, className = '' }) => {
  return (
    <div className={clsx('flex flex-col space-y-1', className)}>
      {label && <span className="text-xs text-white/60 uppercase tracking-wide px-1">{label}</span>}
      <div className="flex space-x-1">{children}</div>
    </div>
  );
};

// Help tooltip component
const HelpTooltip: React.FC<{
  shortcuts: Array<{ key: string; action: string }>;
}> = ({ shortcuts }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <ToolbarButton
        icon="❓"
        label="Help"
        description="Show keyboard shortcuts"
        onClick={() => setIsVisible(!isVisible)}
        active={isVisible}
      />

      {isVisible && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 text-white text-sm rounded-lg p-4 backdrop-blur-sm border border-white/20 z-50">
          <div className="font-semibold mb-2">Keyboard Shortcuts</div>
          <div className="space-y-1">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-white/70">{shortcut.action}</span>
                <kbd className="bg-white/20 px-1 rounded text-xs">{shortcut.key}</kbd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main panel toolbar component
export const PanelToolbar: React.FC<PanelToolbarProps> = ({
  className = '',
  position = 'top',
  orientation = 'horizontal',
  customizable = false,

  onCreatePanel,
  availablePanelTypes = Object.values(PanelComponent),

  onSaveWorkspace,
  onLoadWorkspace,
  onNewWorkspace,
  onResetWorkspace,

  onAlignPanels,
  onDistributePanels,
  onOrganizePanels,

  onSelectAll,
  onInvertSelection,
  onClearSelection,
  selectedCount = 0,

  gridEnabled = false,
  snapEnabled = false,
  onToggleGrid,
  onToggleSnap,

  workspaceName,
  hasUnsavedChanges = false,
  isLoading = false,
}) => {
  // Handle panel creation with default positioning
  const handleCreatePanel = useCallback(
    (type: PanelComponent) => {
      const defaultPosition = {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      };
      onCreatePanel?.(type, defaultPosition);
    },
    [onCreatePanel]
  );

  // Keyboard shortcuts
  const shortcuts = [
    { key: 'Ctrl+N', action: 'New workspace' },
    { key: 'Ctrl+S', action: 'Save workspace' },
    { key: 'Ctrl+O', action: 'Load workspace' },
    { key: 'Ctrl+A', action: 'Select all panels' },
    { key: 'Ctrl+I', action: 'Invert selection' },
    { key: 'Ctrl+G', action: 'Toggle grid' },
    { key: '1-4', action: 'Create panel types' },
  ];

  // Setup keyboard event handlers
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            onNewWorkspace?.();
            break;
          case 's':
            event.preventDefault();
            onSaveWorkspace?.();
            break;
          case 'o':
            event.preventDefault();
            onLoadWorkspace?.();
            break;
          case 'a':
            event.preventDefault();
            onSelectAll?.();
            break;
          case 'i':
            event.preventDefault();
            onInvertSelection?.();
            break;
          case 'g':
            event.preventDefault();
            onToggleGrid?.(!gridEnabled);
            break;
        }
      } else {
        // Number keys for panel creation
        const panelTypes = Object.values(PanelComponent);
        const index = parseInt(event.key) - 1;
        if (index >= 0 && index < panelTypes.length) {
          event.preventDefault();
          handleCreatePanel(panelTypes[index]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    onNewWorkspace,
    onSaveWorkspace,
    onLoadWorkspace,
    onSelectAll,
    onInvertSelection,
    onToggleGrid,
    gridEnabled,
    handleCreatePanel,
  ]);

  const toolbarClasses = clsx(
    'panel-toolbar bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3',
    'flex items-center gap-4',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
    },
    className
  );

  return (
    <div className={toolbarClasses}>
      {/* Panel Creation */}
      <ButtonGroup label="Create">
        {availablePanelTypes.map(type => {
          const config = PANEL_TYPE_CONFIG[type];
          return (
            <ToolbarButton
              key={type}
              icon={config.icon}
              label={config.label}
              description={config.description}
              shortcut={config.shortcut}
              onClick={() => handleCreatePanel(type)}
              disabled={isLoading}
            />
          );
        })}
      </ButtonGroup>

      {/* Workspace Management */}
      <ButtonGroup label="Workspace">
        <ToolbarButton
          icon="📁"
          label="New"
          description="Create new workspace"
          onClick={onNewWorkspace}
          disabled={isLoading}
        />
        <ToolbarButton
          icon="💾"
          label="Save"
          description="Save current workspace"
          onClick={() => onSaveWorkspace?.()}
          disabled={isLoading}
          variant={hasUnsavedChanges ? 'primary' : 'ghost'}
        />
        <ToolbarButton
          icon="📂"
          label="Load"
          description="Load saved workspace"
          onClick={() => onLoadWorkspace?.()}
          disabled={isLoading}
        />
        <ToolbarButton
          icon="🔄"
          label="Reset"
          description="Reset workspace to default"
          onClick={onResetWorkspace}
          disabled={isLoading}
        />
      </ButtonGroup>

      {/* Layout Tools */}
      <ButtonGroup label="Layout">
        <ToolbarButton
          icon="↔️"
          label="Align"
          description="Align selected panels"
          onClick={() => onAlignPanels?.('center')}
          disabled={selectedCount < 2}
        />
        <ToolbarButton
          icon="📏"
          label="Distribute"
          description="Distribute panels evenly"
          onClick={() => onDistributePanels?.('horizontal')}
          disabled={selectedCount < 3}
        />
        <ToolbarButton
          icon="🗂️"
          label="Organize"
          description="Auto-organize layout"
          onClick={() => onOrganizePanels?.('grid')}
        />
      </ButtonGroup>

      {/* Selection Tools */}
      <ButtonGroup label="Select">
        <ToolbarButton
          icon="☑️"
          label="All"
          description="Select all panels"
          onClick={onSelectAll}
        />
        <ToolbarButton
          icon="🔄"
          label="Invert"
          description="Invert selection"
          onClick={onInvertSelection}
          disabled={selectedCount === 0}
        />
        <ToolbarButton
          icon="❌"
          label="Clear"
          description="Clear selection"
          onClick={onClearSelection}
          disabled={selectedCount === 0}
        />
      </ButtonGroup>

      {/* Grid and Snap Controls */}
      <ButtonGroup label="Grid">
        <ToolbarButton
          icon="⚏"
          label="Grid"
          description="Toggle grid overlay"
          onClick={() => onToggleGrid?.(!gridEnabled)}
          active={gridEnabled}
        />
        <ToolbarButton
          icon="🧲"
          label="Snap"
          description="Toggle snap to grid"
          onClick={() => onToggleSnap?.(!snapEnabled)}
          active={snapEnabled}
        />
      </ButtonGroup>

      {/* Status Display */}
      {(selectedCount > 0 || workspaceName || hasUnsavedChanges) && (
        <div className="flex items-center space-x-2 text-sm text-white/70 bg-white/5 rounded px-3 py-1">
          {workspaceName && (
            <span className="font-medium">
              {workspaceName}
              {hasUnsavedChanges && ' *'}
            </span>
          )}
          {selectedCount > 0 && (
            <span className="bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded text-xs">
              {selectedCount} selected
            </span>
          )}
          {isLoading && <span className="animate-pulse">Loading...</span>}
        </div>
      )}

      {/* Help */}
      <HelpTooltip shortcuts={shortcuts} />
    </div>
  );
};
