import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PanelLayout, PanelComponent } from '../../types/panel';
import { ZIndexLayer } from '../../utils/zIndexManager';
import clsx from 'clsx';

// Context menu action types
export type ContextMenuAction =
  | 'duplicate'
  | 'delete'
  | 'group'
  | 'ungroup'
  | 'bring-to-front'
  | 'send-to-back'
  | 'bring-forward'
  | 'send-backward'
  | 'settings'
  | 'export'
  | 'fullscreen'
  | 'minimize'
  | 'maximize'
  | 'lock'
  | 'unlock'
  | 'copy'
  | 'paste'
  | 'save-as-template';

// Context menu item interface
interface ContextMenuItem {
  id: string;
  label: string;
  icon: string;
  action: ContextMenuAction;
  shortcut?: string;
  disabled?: boolean;
  dangerous?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

// Context menu props
export interface PanelContextMenuProps {
  // Position and visibility
  x: number;
  y: number;
  visible: boolean;

  // Panel context
  selectedPanels: PanelLayout[];
  allPanels: PanelLayout[];

  // Event handlers
  onAction: (action: ContextMenuAction, panelIds: string[]) => void;
  onClose: () => void;

  // Configuration
  customItems?: ContextMenuItem[];
  disabledActions?: ContextMenuAction[];
  showIcons?: boolean;
  showShortcuts?: boolean;

  // Panel-specific context
  canGroup?: boolean;
  canUngroup?: boolean;
  hasClipboard?: boolean;

  className?: string;
}

// Keyboard shortcut handler
const SHORTCUTS: Record<string, ContextMenuAction> = {
  Delete: 'delete',
  'Ctrl+D': 'duplicate',
  'Ctrl+G': 'group',
  'Ctrl+Shift+G': 'ungroup',
  'Ctrl+]': 'bring-to-front',
  'Ctrl+[': 'send-to-back',
  'Ctrl+Shift+]': 'bring-forward',
  'Ctrl+Shift+[': 'send-backward',
  F11: 'fullscreen',
  'Ctrl+L': 'lock',
  'Ctrl+C': 'copy',
  'Ctrl+V': 'paste',
  'Ctrl+,': 'settings',
};

// Context menu item component
const MenuItem: React.FC<{
  item: ContextMenuItem;
  onAction: (action: ContextMenuAction) => void;
  showIcons?: boolean;
  showShortcuts?: boolean;
}> = ({ item, onAction, showIcons = true, showShortcuts = true }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const submenuTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    if (item.submenu) {
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
      submenuTimeoutRef.current = setTimeout(() => {
        setShowSubmenu(true);
      }, 300);
    }
  }, [item.submenu]);

  const handleMouseLeave = useCallback(() => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    setShowSubmenu(false);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!item.disabled && !item.submenu) {
        onAction(item.action);
      }
    },
    [item.disabled, item.submenu, item.action, onAction]
  );

  useEffect(() => {
    return () => {
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  if (item.separator) {
    return <div className="h-px bg-white/10 my-1" />;
  }

  return (
    <div className="relative">
      <div
        className={clsx(
          'flex items-center px-3 py-2 text-sm cursor-pointer transition-colors',
          'hover:bg-white/10 active:bg-white/20',
          {
            'text-white/80': !item.disabled && !item.dangerous,
            'text-red-400': item.dangerous && !item.disabled,
            'text-white/40 cursor-not-allowed': item.disabled,
            'justify-between': item.submenu,
          }
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="menuitem"
        aria-disabled={item.disabled}
      >
        <div className="flex items-center space-x-3">
          {showIcons && (
            <span className="w-4 h-4 flex items-center justify-center text-xs">{item.icon}</span>
          )}
          <span>{item.label}</span>
        </div>

        {item.submenu && <span className="text-white/60">▶</span>}

        {showShortcuts && item.shortcut && !item.submenu && (
          <kbd className="text-xs text-white/50 bg-white/10 px-1 rounded ml-auto">
            {item.shortcut}
          </kbd>
        )}
      </div>

      {/* Submenu */}
      {item.submenu && showSubmenu && (
        <div className="absolute left-full top-0 ml-1 min-w-48 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50">
          {item.submenu.map((subItem, index) => (
            <MenuItem
              key={subItem.id || index}
              item={subItem}
              onAction={onAction}
              showIcons={showIcons}
              showShortcuts={showShortcuts}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main context menu component
export const PanelContextMenu: React.FC<PanelContextMenuProps> = ({
  x,
  y,
  visible,
  selectedPanels,
  allPanels,
  onAction,
  onClose,
  customItems = [],
  disabledActions = [],
  showIcons = true,
  showShortcuts = true,
  canGroup = false,
  canUngroup = false,
  hasClipboard = false,
  className = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });

  // Handle action execution
  const handleAction = useCallback(
    (action: ContextMenuAction) => {
      const panelIds = selectedPanels.map(p => p.id);
      onAction(action, panelIds);
      onClose();
    },
    [selectedPanels, onAction, onClose]
  );

  // Generate menu items based on context
  const generateMenuItems = useCallback((): ContextMenuItem[] => {
    const isMultiSelect = selectedPanels.length > 1;
    const isSingleSelect = selectedPanels.length === 1;
    const selectedPanel = isSingleSelect ? selectedPanels[0] : null;

    const baseItems: ContextMenuItem[] = [
      // Basic operations
      {
        id: 'duplicate',
        label: isMultiSelect ? 'Duplicate Panels' : 'Duplicate Panel',
        icon: '📋',
        action: 'duplicate',
        shortcut: 'Ctrl+D',
        disabled: disabledActions.includes('duplicate'),
      },
      {
        id: 'delete',
        label: isMultiSelect ? 'Delete Panels' : 'Delete Panel',
        icon: '🗑️',
        action: 'delete',
        shortcut: 'Delete',
        dangerous: true,
        disabled: disabledActions.includes('delete'),
      },
      { id: 'sep1', label: '', icon: '', action: 'delete', separator: true },

      // Grouping operations
      {
        id: 'group',
        label: 'Group Panels',
        icon: '📦',
        action: 'group',
        shortcut: 'Ctrl+G',
        disabled: !canGroup || isMultiSelect === false || disabledActions.includes('group'),
      },
      {
        id: 'ungroup',
        label: 'Ungroup',
        icon: '📤',
        action: 'ungroup',
        shortcut: 'Ctrl+Shift+G',
        disabled: !canUngroup || disabledActions.includes('ungroup'),
      },
      { id: 'sep2', label: '', icon: '', action: 'delete', separator: true },

      // Layer operations
      {
        id: 'bring-to-front',
        label: 'Bring to Front',
        icon: '⬆️',
        action: 'bring-to-front',
        shortcut: 'Ctrl+]',
        disabled: disabledActions.includes('bring-to-front'),
      },
      {
        id: 'bring-forward',
        label: 'Bring Forward',
        icon: '🔼',
        action: 'bring-forward',
        shortcut: 'Ctrl+Shift+]',
        disabled: disabledActions.includes('bring-forward'),
      },
      {
        id: 'send-backward',
        label: 'Send Backward',
        icon: '🔽',
        action: 'send-backward',
        shortcut: 'Ctrl+Shift+[',
        disabled: disabledActions.includes('send-backward'),
      },
      {
        id: 'send-to-back',
        label: 'Send to Back',
        icon: '⬇️',
        action: 'send-to-back',
        shortcut: 'Ctrl+[',
        disabled: disabledActions.includes('send-to-back'),
      },
      { id: 'sep3', label: '', icon: '', action: 'delete', separator: true },

      // Panel state operations
      {
        id: 'panel-state',
        label: 'Panel State',
        icon: '⚙️',
        action: 'settings',
        submenu: [
          {
            id: 'fullscreen',
            label: 'Fullscreen',
            icon: '🔲',
            action: 'fullscreen',
            shortcut: 'F11',
            disabled: !isSingleSelect || disabledActions.includes('fullscreen'),
          },
          {
            id: 'minimize',
            label: 'Minimize',
            icon: '➖',
            action: 'minimize',
            disabled: disabledActions.includes('minimize'),
          },
          {
            id: 'maximize',
            label: 'Maximize',
            icon: '⬜',
            action: 'maximize',
            disabled: disabledActions.includes('maximize'),
          },
          {
            id: 'lock',
            label: selectedPanel?.metadata?.locked ? 'Unlock' : 'Lock',
            icon: selectedPanel?.metadata?.locked ? '🔓' : '🔒',
            action: selectedPanel?.metadata?.locked ? 'unlock' : 'lock',
            shortcut: 'Ctrl+L',
            disabled: disabledActions.includes('lock') && disabledActions.includes('unlock'),
          },
        ],
      },

      // Copy/Paste operations
      {
        id: 'copy',
        label: 'Copy',
        icon: '📄',
        action: 'copy',
        shortcut: 'Ctrl+C',
        disabled: disabledActions.includes('copy'),
      },
      {
        id: 'paste',
        label: 'Paste',
        icon: '📋',
        action: 'paste',
        shortcut: 'Ctrl+V',
        disabled: !hasClipboard || disabledActions.includes('paste'),
      },
      { id: 'sep4', label: '', icon: '', action: 'delete', separator: true },

      // Advanced operations
      {
        id: 'advanced',
        label: 'Advanced',
        icon: '🔧',
        action: 'settings',
        submenu: [
          {
            id: 'save-template',
            label: 'Save as Template',
            icon: '💾',
            action: 'save-as-template',
            disabled: disabledActions.includes('save-as-template'),
          },
          {
            id: 'export',
            label: 'Export Panel',
            icon: '📤',
            action: 'export',
            disabled: !isSingleSelect || disabledActions.includes('export'),
          },
          {
            id: 'settings',
            label: 'Panel Settings',
            icon: '⚙️',
            action: 'settings',
            shortcut: 'Ctrl+,',
            disabled: !isSingleSelect || disabledActions.includes('settings'),
          },
        ],
      },
    ];

    // Filter out separator-only items at start/end
    const filteredItems = baseItems.filter((item, index, array) => {
      if (!item.separator) return true;

      // Remove separators at start
      if (index === 0) return false;

      // Remove separators at end
      if (index === array.length - 1) return false;

      // Remove consecutive separators
      if (array[index - 1]?.separator) return false;

      return true;
    });

    // Add custom items
    if (customItems.length > 0) {
      filteredItems.push(
        { id: 'custom-sep', label: '', icon: '', action: 'delete', separator: true },
        ...customItems
      );
    }

    return filteredItems;
  }, [selectedPanels, disabledActions, canGroup, canUngroup, hasClipboard, customItems]);

  // Position adjustment to keep menu in viewport
  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position
    if (x + rect.width > viewport.width) {
      adjustedX = viewport.width - rect.width - 10;
    }
    if (adjustedX < 10) {
      adjustedX = 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewport.height) {
      adjustedY = viewport.height - rect.height - 10;
    }
    if (adjustedY < 10) {
      adjustedY = 10;
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [visible, x, y]);

  // Handle click outside to close
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!visible) return;

    const handleKeydown = (event: KeyboardEvent) => {
      const shortcutKey =
        event.ctrlKey || event.metaKey
          ? `Ctrl+${event.shiftKey ? 'Shift+' : ''}${event.key.toUpperCase()}`
          : event.key;

      const action = SHORTCUTS[shortcutKey];
      if (action && !disabledActions.includes(action)) {
        event.preventDefault();
        handleAction(action);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [visible, disabledActions, handleAction]);

  if (!visible) {
    return null;
  }

  const menuItems = generateMenuItems();

  return (
    <div
      ref={menuRef}
      className={clsx(
        'fixed min-w-48 bg-black/90 backdrop-blur-md border border-white/20',
        'rounded-lg shadow-xl z-50 py-1',
        'animate-in fade-in duration-150',
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      role="menu"
      aria-label="Panel context menu"
    >
      {/* Menu header */}
      {selectedPanels.length > 0 && (
        <div className="px-3 py-2 border-b border-white/10">
          <div className="text-xs text-white/60 uppercase tracking-wide">
            {selectedPanels.length === 1
              ? selectedPanels[0].metadata?.title || selectedPanels[0].id
              : `${selectedPanels.length} panels selected`}
          </div>
        </div>
      )}

      {/* Menu items */}
      {menuItems.map((item, index) => (
        <MenuItem
          key={item.id || index}
          item={item}
          onAction={handleAction}
          showIcons={showIcons}
          showShortcuts={showShortcuts}
        />
      ))}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t border-white/10 mt-1 pt-1 px-3 py-1">
          <div className="text-xs text-white/40">
            Position: ({adjustedPosition.x}, {adjustedPosition.y})
          </div>
          <div className="text-xs text-white/40">
            Panels: {selectedPanels.map(p => p.id.slice(-4)).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for managing context menu state
export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    visible: boolean;
    selectedPanels: PanelLayout[];
  }>({
    x: 0,
    y: 0,
    visible: false,
    selectedPanels: [],
  });

  const showContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent, selectedPanels: PanelLayout[]) => {
      event.preventDefault();
      event.stopPropagation();

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        visible: true,
        selectedPanels,
      });
    },
    []
  );

  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };
};

// Utility function to get default context menu items
export const getDefaultContextMenuItems = (
  selectedPanels: PanelLayout[],
  allPanels: PanelLayout[]
): ContextMenuItem[] => {
  const isMultiSelect = selectedPanels.length > 1;

  return [
    {
      id: 'duplicate',
      label: isMultiSelect ? 'Duplicate Panels' : 'Duplicate Panel',
      icon: '📋',
      action: 'duplicate',
      shortcut: 'Ctrl+D',
    },
    {
      id: 'delete',
      label: isMultiSelect ? 'Delete Panels' : 'Delete Panel',
      icon: '🗑️',
      action: 'delete',
      shortcut: 'Delete',
      dangerous: true,
    },
  ];
};
