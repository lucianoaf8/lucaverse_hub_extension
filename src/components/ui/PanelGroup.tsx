import React, { useState, useCallback, useRef } from 'react';
import { PanelLayout, Position, Size } from '../../types/panel';
import { nanoid } from 'nanoid';
import clsx from 'clsx';

// Panel group interface
export interface PanelGroup {
  id: string;
  name: string;
  description?: string;
  panelIds: string[];

  // Group properties
  bounds: {
    position: Position;
    size: Size;
  };

  // Group state
  isLocked: boolean;
  isMinimized: boolean;
  isCollapsed: boolean;
  zIndex: number;

  // Visual properties
  color: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  backgroundColor?: string;
  opacity: number;

  // Group behavior
  behavior: {
    maintainRelativePositions: boolean;
    synchronizeResize: boolean;
    cascadeActions: boolean;
    allowNestedGroups: boolean;
  };

  // Metadata
  metadata: {
    createdAt: number;
    updatedAt: number;
    parentGroupId?: string;
    childGroupIds: string[];
    templateId?: string;
  };
}

// Group action types
export type GroupAction =
  | 'move'
  | 'resize'
  | 'minimize'
  | 'maximize'
  | 'lock'
  | 'unlock'
  | 'delete'
  | 'duplicate'
  | 'bring-to-front'
  | 'send-to-back';

// Group template for saved configurations
export interface GroupTemplate {
  id: string;
  name: string;
  description: string;
  relativePositions: Array<{
    panelId: string;
    relativePosition: Position;
    relativeSize: Size;
  }>;
  groupSettings: Omit<PanelGroup, 'id' | 'panelIds' | 'bounds' | 'metadata'>;
}

// Props for PanelGroup component
export interface PanelGroupProps {
  group: PanelGroup;
  panels: PanelLayout[];
  selectedPanelIds: string[];

  // Event handlers
  onGroupAction: (groupId: string, action: GroupAction) => void;
  onPanelSelect: (panelIds: string[], addToSelection: boolean) => void;
  onGroupUpdate: (groupId: string, updates: Partial<PanelGroup>) => void;
  onGroupDelete: (groupId: string) => void;

  // Interaction settings
  showGroupBounds?: boolean;
  allowResize?: boolean;
  allowMove?: boolean;
  showControls?: boolean;

  // Visual settings
  className?: string;
  style?: React.CSSProperties;
}

// Group control buttons component
const GroupControls: React.FC<{
  group: PanelGroup;
  onAction: (action: GroupAction) => void;
  position: Position;
}> = ({ group, onAction, position }) => {
  return (
    <div
      className="absolute flex space-x-1 bg-black/80 backdrop-blur-sm rounded p-1 z-50"
      style={{
        left: position.x + 5,
        top: position.y - 35,
      }}
    >
      <button
        className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded text-xs"
        onClick={() => onAction('minimize')}
        title={group.isMinimized ? 'Maximize group' : 'Minimize group'}
      >
        {group.isMinimized ? '📋' : '➖'}
      </button>

      <button
        className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded text-xs"
        onClick={() => onAction(group.isLocked ? 'unlock' : 'lock')}
        title={group.isLocked ? 'Unlock group' : 'Lock group'}
      >
        {group.isLocked ? '🔒' : '🔓'}
      </button>

      <button
        className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded text-xs"
        onClick={() => onAction('bring-to-front')}
        title="Bring to front"
      >
        ⬆️
      </button>

      <button
        className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded text-xs"
        onClick={() => onAction('duplicate')}
        title="Duplicate group"
      >
        📋
      </button>

      <button
        className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded text-xs"
        onClick={() => onAction('delete')}
        title="Delete group"
      >
        🗑️
      </button>
    </div>
  );
};

// Group label component
const GroupLabel: React.FC<{
  group: PanelGroup;
  position: Position;
  onNameChange: (newName: string) => void;
}> = ({ group, position, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNameSubmit = useCallback(() => {
    if (editName.trim() && editName !== group.name) {
      onNameChange(editName.trim());
    }
    setIsEditing(false);
  }, [editName, group.name, onNameChange]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleNameSubmit();
      } else if (event.key === 'Escape') {
        setEditName(group.name);
        setIsEditing(false);
      }
    },
    [handleNameSubmit, group.name]
  );

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div
      className="absolute bg-black/80 backdrop-blur-sm text-white text-sm px-2 py-1 rounded z-40"
      style={{
        left: position.x + 5,
        top: position.y + 5,
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={handleKeyPress}
          className="bg-transparent border-none outline-none text-white placeholder-white/50 w-32"
          placeholder="Group name"
        />
      ) : (
        <span
          className="cursor-pointer hover:text-white/80"
          onClick={() => setIsEditing(true)}
          title="Click to edit group name"
        >
          {group.name}
        </span>
      )}
    </div>
  );
};

// Main PanelGroup component
export const PanelGroup: React.FC<PanelGroupProps> = ({
  group,
  panels,
  selectedPanelIds,
  onGroupAction,
  onPanelSelect,
  onGroupUpdate,
  onGroupDelete,
  showGroupBounds = true,
  allowResize = true,
  allowMove = true,
  showControls = true,
  className = '',
  style = {},
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const groupRef = useRef<HTMLDivElement>(null);

  // Get panels that belong to this group
  const groupPanels = panels.filter(panel => group.panelIds.includes(panel.id));

  // Calculate group bounds from panel positions
  const calculateBounds = useCallback((): { position: Position; size: Size } => {
    if (groupPanels.length === 0) {
      return { position: { x: 0, y: 0 }, size: { width: 100, height: 100 } };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    groupPanels.forEach(panel => {
      minX = Math.min(minX, panel.position.x);
      minY = Math.min(minY, panel.position.y);
      maxX = Math.max(maxX, panel.position.x + panel.size.width);
      maxY = Math.max(maxY, panel.position.y + panel.size.height);
    });

    return {
      position: { x: minX - 10, y: minY - 10 },
      size: { width: maxX - minX + 20, height: maxY - minY + 20 },
    };
  }, [groupPanels]);

  // Update bounds when panels change
  React.useEffect(() => {
    const newBounds = calculateBounds();
    if (
      newBounds.position.x !== group.bounds.position.x ||
      newBounds.position.y !== group.bounds.position.y ||
      newBounds.size.width !== group.bounds.size.width ||
      newBounds.size.height !== group.bounds.size.height
    ) {
      onGroupUpdate(group.id, { bounds: newBounds });
    }
  }, [groupPanels, calculateBounds, group.bounds, group.id, onGroupUpdate]);

  // Handle group actions
  const handleGroupAction = useCallback(
    (action: GroupAction) => {
      switch (action) {
        case 'minimize':
          onGroupUpdate(group.id, { isMinimized: !group.isMinimized });
          break;
        case 'lock':
          onGroupUpdate(group.id, { isLocked: true });
          break;
        case 'unlock':
          onGroupUpdate(group.id, { isLocked: false });
          break;
        case 'delete':
          onGroupDelete(group.id);
          break;
        default:
          onGroupAction(group.id, action);
      }
    },
    [group.id, group.isMinimized, group.isLocked, onGroupAction, onGroupUpdate, onGroupDelete]
  );

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!allowMove || group.isLocked || event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();

      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Move group bounds
        const newBounds = {
          position: {
            x: group.bounds.position.x + deltaX,
            y: group.bounds.position.y + deltaY,
          },
          size: group.bounds.size,
        };

        onGroupUpdate(group.id, { bounds: newBounds });
        setDragStart({ x: e.clientX, y: e.clientY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [allowMove, group.isLocked, group.bounds, group.id, onGroupUpdate, isDragging, dragStart]
  );

  // Handle group name change
  const handleNameChange = useCallback(
    (newName: string) => {
      onGroupUpdate(group.id, {
        name: newName,
        metadata: {
          ...group.metadata,
          updatedAt: Date.now(),
        },
      });
    },
    [group.id, group.metadata, onGroupUpdate]
  );

  // Handle group selection
  const handleGroupSelect = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      const isMultiSelect = event.ctrlKey || event.metaKey;
      onPanelSelect(group.panelIds, isMultiSelect);
    },
    [group.panelIds, onPanelSelect]
  );

  // Check if group is selected (all panels selected)
  const isGroupSelected = group.panelIds.every(id => selectedPanelIds.includes(id));

  if (!showGroupBounds && !group.isMinimized) {
    return null;
  }

  const groupStyle: React.CSSProperties = {
    position: 'absolute',
    left: group.bounds.position.x,
    top: group.bounds.position.y,
    width: group.bounds.size.width,
    height: group.bounds.size.height,
    border: `${group.borderWidth}px ${group.borderStyle} ${group.color}`,
    backgroundColor: group.backgroundColor,
    opacity: group.opacity,
    zIndex: group.zIndex,
    cursor: allowMove && !group.isLocked ? 'move' : 'default',
    pointerEvents: group.isMinimized ? 'auto' : 'none',
    ...style,
  };

  return (
    <div
      ref={groupRef}
      className={clsx(
        'group-bounds transition-all duration-200',
        {
          'ring-2 ring-blue-400 ring-opacity-50': isGroupSelected,
          'opacity-50': group.isMinimized,
          'cursor-move': isDragging,
        },
        className
      )}
      style={groupStyle}
      onMouseDown={handleMouseDown}
      onClick={handleGroupSelect}
      data-group-id={group.id}
      data-group-locked={group.isLocked}
      data-group-minimized={group.isMinimized}
    >
      {/* Group label */}
      <GroupLabel group={group} position={{ x: 0, y: 0 }} onNameChange={handleNameChange} />

      {/* Group controls */}
      {showControls && (
        <GroupControls group={group} onAction={handleGroupAction} position={{ x: 0, y: 0 }} />
      )}

      {/* Minimized state indicator */}
      {group.isMinimized && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded">
          <div className="text-white text-center">
            <div className="text-lg mb-1">📦</div>
            <div className="text-sm">{group.panelIds.length} panels</div>
          </div>
        </div>
      )}

      {/* Resize handles */}
      {allowResize && !group.isLocked && !group.isMinimized && (
        <>
          {/* Corner resize handles */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white/50 hover:bg-white/80 cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/50 hover:bg-white/80 cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white/50 hover:bg-white/80 cursor-sw-resize" />
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-white/50 hover:bg-white/80 cursor-se-resize" />
        </>
      )}

      {/* Group info overlay (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 right-2 text-xs text-white/60 bg-black/40 px-1 rounded pointer-events-none">
          ID: {group.id.slice(-6)}
        </div>
      )}
    </div>
  );
};

// Group manager utility functions
export class GroupManager {
  static createGroup(
    name: string,
    panelIds: string[],
    panels: PanelLayout[],
    options: Partial<PanelGroup> = {}
  ): PanelGroup {
    const groupPanels = panels.filter(panel => panelIds.includes(panel.id));

    if (groupPanels.length === 0) {
      throw new Error('Cannot create group without panels');
    }

    // Calculate initial bounds
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    groupPanels.forEach(panel => {
      minX = Math.min(minX, panel.position.x);
      minY = Math.min(minY, panel.position.y);
      maxX = Math.max(maxX, panel.position.x + panel.size.width);
      maxY = Math.max(maxY, panel.position.y + panel.size.height);
    });

    const bounds = {
      position: { x: minX - 10, y: minY - 10 },
      size: { width: maxX - minX + 20, height: maxY - minY + 20 },
    };

    return {
      id: `group-${nanoid()}`,
      name,
      panelIds,
      bounds,
      isLocked: false,
      isMinimized: false,
      isCollapsed: false,
      zIndex: 0,
      color: '#3B82F6',
      borderStyle: 'solid',
      borderWidth: 2,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      opacity: 1,
      behavior: {
        maintainRelativePositions: true,
        synchronizeResize: false,
        cascadeActions: true,
        allowNestedGroups: true,
      },
      metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        childGroupIds: [],
      },
      ...options,
    };
  }

  static moveGroup(
    group: PanelGroup,
    panels: PanelLayout[],
    deltaX: number,
    deltaY: number
  ): PanelLayout[] {
    if (group.isLocked) return panels;

    return panels.map(panel => {
      if (group.panelIds.includes(panel.id)) {
        return {
          ...panel,
          position: {
            x: panel.position.x + deltaX,
            y: panel.position.y + deltaY,
          },
        };
      }
      return panel;
    });
  }

  static resizeGroup(
    group: PanelGroup,
    panels: PanelLayout[],
    newBounds: { position: Position; size: Size }
  ): PanelLayout[] {
    if (group.isLocked || !group.behavior.synchronizeResize) return panels;

    const scaleX = newBounds.size.width / group.bounds.size.width;
    const scaleY = newBounds.size.height / group.bounds.size.height;

    return panels.map(panel => {
      if (group.panelIds.includes(panel.id)) {
        const relativeX = panel.position.x - group.bounds.position.x;
        const relativeY = panel.position.y - group.bounds.position.y;

        return {
          ...panel,
          position: {
            x: newBounds.position.x + relativeX * scaleX,
            y: newBounds.position.y + relativeY * scaleY,
          },
          size: {
            width: panel.size.width * scaleX,
            height: panel.size.height * scaleY,
          },
        };
      }
      return panel;
    });
  }

  static saveGroupTemplate(group: PanelGroup, panels: PanelLayout[]): GroupTemplate {
    const groupPanels = panels.filter(panel => group.panelIds.includes(panel.id));

    const relativePositions = groupPanels.map(panel => ({
      panelId: panel.id,
      relativePosition: {
        x: (panel.position.x - group.bounds.position.x) / group.bounds.size.width,
        y: (panel.position.y - group.bounds.position.y) / group.bounds.size.height,
      },
      relativeSize: {
        width: panel.size.width / group.bounds.size.width,
        height: panel.size.height / group.bounds.size.height,
      },
    }));

    return {
      id: `group-template-${nanoid()}`,
      name: `${group.name} Template`,
      description: `Template created from group "${group.name}"`,
      relativePositions,
      groupSettings: {
        name: group.name,
        description: group.description,
        isLocked: group.isLocked,
        isMinimized: group.isMinimized,
        isCollapsed: group.isCollapsed,
        zIndex: group.zIndex,
        color: group.color,
        borderStyle: group.borderStyle,
        borderWidth: group.borderWidth,
        backgroundColor: group.backgroundColor,
        opacity: group.opacity,
        behavior: group.behavior,
      },
    };
  }
}
