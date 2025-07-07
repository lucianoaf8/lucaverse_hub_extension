import React, { ReactNode, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragMoveEvent,
  DragEndEvent,
  CollisionDetection,
  Modifier,
  Active,
  Over,
} from '@dnd-kit/core';
import { restrictToWindowEdges, restrictToParentElement } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// Types for drag and drop operations
export interface DragState {
  activeId: string | null;
  activePanelData: any | null;
  dragOffset: { x: number; y: number } | null;
  isDragging: boolean;
}

export interface DragDropProviderProps {
  children: ReactNode;
  collisionDetection?: CollisionDetection;
  modifiers?: Modifier[];
  onDragStart?: (event: DragStartEvent) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  restrictToContainer?: boolean;
}

// Global drag state context
interface DragDropContextType {
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
}

export const DragDropContext = React.createContext<DragDropContextType | null>(null);

// Custom collision detection with panel-specific logic
const customCollisionDetection: CollisionDetection = args => {
  // First, use closest center for general detection
  const closestCenterCollisions = closestCenter(args);

  // If we have center collisions, return them
  if (closestCenterCollisions.length > 0) {
    return closestCenterCollisions;
  }

  // Fallback to closest corners for edge cases
  return closestCorners(args);
};

// Accessibility announcements for drag operations
const screenReaderAnnouncements = {
  onDragStart(id: string) {
    return `Started dragging panel ${id}`;
  },
  onDragOver(id: string, overId: string) {
    return `Panel ${id} is over ${overId}`;
  },
  onDragEnd(id: string, overId: string | null) {
    if (overId) {
      return `Panel ${id} was dropped on ${overId}`;
    }
    return `Panel ${id} was dropped`;
  },
  onDragCancel(id: string) {
    return `Dragging panel ${id} was cancelled`;
  },
};

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  collisionDetection = customCollisionDetection,
  modifiers = [restrictToWindowEdges],
  onDragStart,
  onDragMove,
  onDragEnd,
  restrictToContainer = true,
}) => {
  // Global drag state management
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    activePanelData: null,
    dragOffset: null,
    isDragging: false,
  });

  // Configure input sensors with proper sensitivity
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Apply container restriction modifier if enabled
  const finalModifiers = restrictToContainer ? [...modifiers, restrictToParentElement] : modifiers;

  // Handle drag start with state updates and announcements
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    setDragState({
      activeId: active.id as string,
      activePanelData: active.data.current,
      dragOffset: null,
      isDragging: true,
    });

    // Call external handler if provided
    onDragStart?.(event);
  };

  // Handle drag move with real-time updates
  const handleDragMove = (event: DragMoveEvent) => {
    const { delta } = event;

    setDragState(prev => ({
      ...prev,
      dragOffset: delta,
    }));

    // Call external handler if provided
    onDragMove?.(event);
  };

  // Handle drag end with cleanup and final positioning
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Reset drag state
    setDragState({
      activeId: null,
      activePanelData: null,
      dragOffset: null,
      isDragging: false,
    });

    // Call external handler if provided
    onDragEnd?.(event);
  };

  return (
    <DragDropContext.Provider value={{ dragState, setDragState }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        modifiers={finalModifiers}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: screenReaderAnnouncements,
        }}
      >
        {children}
        <DragOverlay>
          {dragState.activeId ? (
            <div
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl opacity-60 pointer-events-none"
              style={{
                width: dragState.activePanelData?.size?.width || 300,
                height: dragState.activePanelData?.size?.height || 200,
              }}
            >
              <div className="p-4 text-white/80">Dragging Panel: {dragState.activeId}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  );
};

// Hook to access drag drop context
export const useDragDropContext = () => {
  const context = React.useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDropContext must be used within a DragDropProvider');
  }
  return context;
};
