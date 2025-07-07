import { Modifier } from '@dnd-kit/core';
import { Transform } from '@dnd-kit/utilities';
import { Position, Size, PanelLayout } from '../types/panel';

// Drag constraint configuration interface
export interface DragConstraints {
  boundaries: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  collisionRules: {
    preventOverlap: boolean;
    snapDistance: number;
    minimumGap: number;
  };
  snapPoints: {
    enabled: boolean;
    gridSize: number;
    magneticDistance: number;
    corners: boolean;
    centers: boolean;
  };
  groupConstraints?: {
    maintainRelativePositions: boolean;
    maxGroupSize: number;
  };
}

// Default constraint configuration
export const DEFAULT_CONSTRAINTS: DragConstraints = {
  boundaries: {
    minX: 0,
    minY: 0,
    maxX: window.innerWidth,
    maxY: window.innerHeight,
  },
  collisionRules: {
    preventOverlap: true,
    snapDistance: 20,
    minimumGap: 8,
  },
  snapPoints: {
    enabled: true,
    gridSize: 10,
    magneticDistance: 15,
    corners: true,
    centers: true,
  },
};

// Calculate effective drag boundaries for a panel
export const calculateDragBounds = (
  panel: { position: Position; size: Size },
  viewport: { width: number; height: number },
  otherPanels: PanelLayout[] = []
): DragConstraints['boundaries'] => {
  const { size } = panel;

  // Basic viewport boundaries
  const boundaries = {
    minX: 0,
    minY: 0,
    maxX: viewport.width - size.width,
    maxY: viewport.height - size.height,
  };

  // Adjust for collision prevention if needed
  // This could be enhanced to create exclusion zones around other panels

  return boundaries;
};

// Real-time collision detection during drag operations
export const detectCollisions = (
  draggedPanel: { position: Position; size: Size },
  otherPanels: PanelLayout[],
  minimumGap: number = 8
): boolean => {
  const { position: dragPos, size: dragSize } = draggedPanel;

  for (const panel of otherPanels) {
    const { position: panelPos, size: panelSize } = panel;

    // Calculate panel boundaries with gap
    const dragLeft = dragPos.x;
    const dragRight = dragPos.x + dragSize.width;
    const dragTop = dragPos.y;
    const dragBottom = dragPos.y + dragSize.height;

    const panelLeft = panelPos.x - minimumGap;
    const panelRight = panelPos.x + panelSize.width + minimumGap;
    const panelTop = panelPos.y - minimumGap;
    const panelBottom = panelPos.y + panelSize.height + minimumGap;

    // Check for overlap
    const overlapping = !(
      dragRight <= panelLeft ||
      dragLeft >= panelRight ||
      dragBottom <= panelTop ||
      dragTop >= panelBottom
    );

    if (overlapping) {
      return true; // Collision detected
    }
  }

  return false; // No collisions
};

// Custom modifier to prevent panel overlap
export const preventOverlapConstraint = (
  otherPanels: PanelLayout[],
  minimumGap: number = 8
): Modifier => {
  return ({ transform, active }) => {
    if (!active?.data.current) return transform;

    const activeData = active.data.current;
    const newPosition = {
      x: activeData.position.x + transform.x,
      y: activeData.position.y + transform.y,
    };

    const draggedPanel = {
      position: newPosition,
      size: activeData.size,
    };

    // Check for collisions
    const hasCollision = detectCollisions(draggedPanel, otherPanels, minimumGap);

    if (hasCollision) {
      // Return original transform to prevent movement into collision
      return { x: 0, y: 0, scaleX: 1, scaleY: 1 };
    }

    return transform;
  };
};

// Boundary enforcement with bounce-back effects
export const boundaryConstraintWithBounce = (
  boundaries: DragConstraints['boundaries']
): Modifier => {
  return ({ transform, active }) => {
    if (!active?.data.current) return transform;

    const activeData = active.data.current;
    const newPosition = {
      x: activeData.position.x + transform.x,
      y: activeData.position.y + transform.y,
    };

    // Enforce boundaries
    const constrainedX = Math.max(boundaries.minX, Math.min(boundaries.maxX, newPosition.x));
    const constrainedY = Math.max(boundaries.minY, Math.min(boundaries.maxY, newPosition.y));

    return {
      ...transform,
      x: constrainedX - activeData.position.x,
      y: constrainedY - activeData.position.y,
    };
  };
};

// Magnetic snap constraints for grid alignment
export const magneticSnapConstraint = (
  gridSize: number = 10,
  magneticDistance: number = 15
): Modifier => {
  return ({ transform, active }) => {
    if (!active?.data.current) return transform;

    const activeData = active.data.current;
    const newPosition = {
      x: activeData.position.x + transform.x,
      y: activeData.position.y + transform.y,
    };

    // Calculate nearest grid points
    const nearestGridX = Math.round(newPosition.x / gridSize) * gridSize;
    const nearestGridY = Math.round(newPosition.y / gridSize) * gridSize;

    // Check if within magnetic distance
    const distanceX = Math.abs(newPosition.x - nearestGridX);
    const distanceY = Math.abs(newPosition.y - nearestGridY);

    const snapX = distanceX <= magneticDistance ? nearestGridX : newPosition.x;
    const snapY = distanceY <= magneticDistance ? nearestGridY : newPosition.y;

    return {
      ...transform,
      x: snapX - activeData.position.x,
      y: snapY - activeData.position.y,
    };
  };
};

// Multi-panel group dragging constraints
export const groupDragConstraint = (
  selectedPanels: string[],
  allPanels: PanelLayout[]
): Modifier => {
  return ({ transform, active }) => {
    if (!active?.data.current || selectedPanels.length <= 1) return transform;

    // For group dragging, we need to ensure all panels in the group
    // can move together without violating constraints

    // Find the most restrictive constraint for the group
    let maxAllowedX = transform.x;
    let maxAllowedY = transform.y;

    for (const panelId of selectedPanels) {
      const panel = allPanels.find(p => p.id === panelId);
      if (!panel) continue;

      const newPosition = {
        x: panel.position.x + transform.x,
        y: panel.position.y + transform.y,
      };

      // Check boundaries for this panel
      const boundaries = calculateDragBounds(panel, {
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Adjust transform if this panel would violate boundaries
      if (newPosition.x < boundaries.minX) {
        maxAllowedX = Math.min(maxAllowedX, boundaries.minX - panel.position.x);
      }
      if (newPosition.x > boundaries.maxX) {
        maxAllowedX = Math.min(maxAllowedX, boundaries.maxX - panel.position.x);
      }
      if (newPosition.y < boundaries.minY) {
        maxAllowedY = Math.min(maxAllowedY, boundaries.minY - panel.position.y);
      }
      if (newPosition.y > boundaries.maxY) {
        maxAllowedY = Math.min(maxAllowedY, boundaries.maxY - panel.position.y);
      }
    }

    return {
      ...transform,
      x: maxAllowedX,
      y: maxAllowedY,
    };
  };
};

// Utility function to combine multiple constraint modifiers
export const combineConstraints = (...modifiers: Modifier[]): Modifier => {
  return ({ transform, active, over }) => {
    return modifiers.reduce(
      (currentTransform, modifier) => modifier({ transform: currentTransform, active, over }),
      transform
    );
  };
};
