/**
 * Collision Detection System
 * Provides efficient collision detection and resolution for panel positioning
 */

import type { Position, Size, PanelLayout } from '@/types/panel';

// Rectangle interface for panel bounds calculation
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Collision detection result
export interface CollisionResult {
  colliding: boolean;
  panels: PanelLayout[];
  overlaps: Rectangle[];
}

// Collision resolution strategies
export enum CollisionResolution {
  PREVENT = 'prevent', // Don't allow the move
  PUSH_AWAY = 'push_away', // Push other panels away
  SNAP_BACK = 'snap_back', // Snap to previous position
  ALLOW = 'allow', // Allow overlap
}

/**
 * Convert panel to rectangle bounds
 */
export const panelToRectangle = (panel: PanelLayout): Rectangle => ({
  x: panel.position.x,
  y: panel.position.y,
  width: panel.size.width,
  height: panel.size.height,
});

/**
 * Convert position and size to rectangle
 */
export const createRectangle = (position: Position, size: Size): Rectangle => ({
  x: position.x,
  y: position.y,
  width: size.width,
  height: size.height,
});

/**
 * Check if two rectangles overlap using bounding box collision detection
 */
export const checkCollision = (rect1: Rectangle, rect2: Rectangle): boolean => {
  return !(
    rect1.x + rect1.width <= rect2.x || // rect1 is to the left of rect2
    rect1.x >= rect2.x + rect2.width || // rect1 is to the right of rect2
    rect1.y + rect1.height <= rect2.y || // rect1 is above rect2
    rect1.y >= rect2.y + rect2.height // rect1 is below rect2
  );
};

/**
 * Calculate overlap area between two rectangles
 */
export const calculateOverlap = (rect1: Rectangle, rect2: Rectangle): Rectangle | null => {
  if (!checkCollision(rect1, rect2)) {
    return null;
  }

  const left = Math.max(rect1.x, rect2.x);
  const top = Math.max(rect1.y, rect2.y);
  const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
  const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

/**
 * Find all panels that collide with a given panel
 */
export const findCollisions = (
  panels: PanelLayout[],
  targetPanel: PanelLayout | { position: Position; size: Size },
  excludeId?: string
): CollisionResult => {
  const targetRect =
    'id' in targetPanel
      ? panelToRectangle(targetPanel)
      : createRectangle(targetPanel.position, targetPanel.size);

  const collidingPanels: PanelLayout[] = [];
  const overlaps: Rectangle[] = [];

  for (const panel of panels) {
    // Skip the panel being checked or excluded panel
    if (excludeId && panel.id === excludeId) continue;
    if ('id' in targetPanel && panel.id === targetPanel.id) continue;

    const panelRect = panelToRectangle(panel);

    if (checkCollision(targetRect, panelRect)) {
      collidingPanels.push(panel);

      const overlap = calculateOverlap(targetRect, panelRect);
      if (overlap) {
        overlaps.push(overlap);
      }
    }
  }

  return {
    colliding: collidingPanels.length > 0,
    panels: collidingPanels,
    overlaps,
  };
};

/**
 * Check if a position is valid (no collisions)
 */
export const isValidPosition = (
  position: Position,
  size: Size,
  panels: PanelLayout[],
  excludeId?: string,
  bounds?: Rectangle
): boolean => {
  // Check viewport bounds if provided
  if (bounds) {
    if (
      position.x < bounds.x ||
      position.y < bounds.y ||
      position.x + size.width > bounds.x + bounds.width ||
      position.y + size.height > bounds.y + bounds.height
    ) {
      return false;
    }
  }

  // Check panel collisions
  const collisionResult = findCollisions(panels, { position, size }, excludeId);
  return !collisionResult.colliding;
};

/**
 * Prevent overlap by finding nearest valid position
 */
export const preventOverlap = (
  position: Position,
  size: Size,
  existingPanels: PanelLayout[],
  bounds?: Rectangle,
  excludeId?: string,
  searchRadius = 50,
  step = 10
): Position => {
  // If current position is valid, return it
  if (isValidPosition(position, size, existingPanels, excludeId, bounds)) {
    return position;
  }

  // Search in expanding spiral pattern for valid position
  for (let radius = step; radius <= searchRadius; radius += step) {
    // Try positions in a spiral pattern around the original position
    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180;
      const testPosition: Position = {
        x: position.x + Math.cos(rad) * radius,
        y: position.y + Math.sin(rad) * radius,
      };

      if (isValidPosition(testPosition, size, existingPanels, excludeId, bounds)) {
        return testPosition;
      }
    }
  }

  // If no valid position found in search radius, try cardinal directions with larger steps
  const directions = [
    { x: 0, y: -1 }, // Up
    { x: 1, y: 0 }, // Right
    { x: 0, y: 1 }, // Down
    { x: -1, y: 0 }, // Left
  ];

  for (const direction of directions) {
    for (let distance = searchRadius; distance <= searchRadius * 3; distance += step * 2) {
      const testPosition: Position = {
        x: position.x + direction.x * distance,
        y: position.y + direction.y * distance,
      };

      if (isValidPosition(testPosition, size, existingPanels, excludeId, bounds)) {
        return testPosition;
      }
    }
  }

  // If still no valid position, return original position (will show collision warning)
  return position;
};

/**
 * Push away overlapping panels to resolve collision
 */
export const pushAwayOverlapping = (
  movedPanel: PanelLayout,
  allPanels: PanelLayout[],
  bounds?: Rectangle
): PanelLayout[] => {
  const updatedPanels = [...allPanels];
  const collisionResult = findCollisions(updatedPanels, movedPanel, movedPanel.id);

  for (const collidingPanel of collisionResult.panels) {
    const movedRect = panelToRectangle(movedPanel);
    const collidingRect = panelToRectangle(collidingPanel);

    // Calculate push direction based on overlap
    const overlap = calculateOverlap(movedRect, collidingRect);
    if (!overlap) continue;

    // Determine smallest push direction
    const pushDistances = {
      right: movedRect.x + movedRect.width - collidingRect.x,
      left: collidingRect.x + collidingRect.width - movedRect.x,
      down: movedRect.y + movedRect.height - collidingRect.y,
      up: collidingRect.y + collidingRect.height - movedRect.y,
    };

    // Find direction with minimum push distance
    const minPush = Math.min(...Object.values(pushDistances));
    let newPosition = { ...collidingPanel.position };

    if (pushDistances.right === minPush) {
      newPosition.x = movedRect.x + movedRect.width + 1;
    } else if (pushDistances.left === minPush) {
      newPosition.x = movedRect.x - collidingRect.width - 1;
    } else if (pushDistances.down === minPush) {
      newPosition.y = movedRect.y + movedRect.height + 1;
    } else if (pushDistances.up === minPush) {
      newPosition.y = movedRect.y - collidingRect.height - 1;
    }

    // Validate new position is within bounds
    if (bounds) {
      newPosition.x = Math.max(
        bounds.x,
        Math.min(newPosition.x, bounds.x + bounds.width - collidingPanel.size.width)
      );
      newPosition.y = Math.max(
        bounds.y,
        Math.min(newPosition.y, bounds.y + bounds.height - collidingPanel.size.height)
      );
    }

    // Update panel position
    const panelIndex = updatedPanels.findIndex(p => p.id === collidingPanel.id);
    if (panelIndex !== -1) {
      updatedPanels[panelIndex] = {
        ...updatedPanels[panelIndex],
        position: newPosition,
      };
    }
  }

  return updatedPanels;
};

/**
 * Efficient spatial indexing for large numbers of panels
 */
export class SpatialIndex {
  private cells: Map<string, PanelLayout[]>;
  private cellSize: number;

  constructor(cellSize = 200) {
    this.cells = new Map();
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  private getPanelCells(panel: PanelLayout): string[] {
    const cells: string[] = [];
    const startX = Math.floor(panel.position.x / this.cellSize);
    const startY = Math.floor(panel.position.y / this.cellSize);
    const endX = Math.floor((panel.position.x + panel.size.width) / this.cellSize);
    const endY = Math.floor((panel.position.y + panel.size.height) / this.cellSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        cells.push(`${x},${y}`);
      }
    }

    return cells;
  }

  addPanel(panel: PanelLayout): void {
    const cells = this.getPanelCells(panel);

    for (const cellKey of cells) {
      if (!this.cells.has(cellKey)) {
        this.cells.set(cellKey, []);
      }
      this.cells.get(cellKey)!.push(panel);
    }
  }

  removePanel(panel: PanelLayout): void {
    const cells = this.getPanelCells(panel);

    for (const cellKey of cells) {
      const cellPanels = this.cells.get(cellKey);
      if (cellPanels) {
        const index = cellPanels.findIndex(p => p.id === panel.id);
        if (index !== -1) {
          cellPanels.splice(index, 1);
          if (cellPanels.length === 0) {
            this.cells.delete(cellKey);
          }
        }
      }
    }
  }

  findNearbyPanels(panel: PanelLayout | { position: Position; size: Size }): PanelLayout[] {
    const cells = this.getPanelCells(panel as PanelLayout);
    const nearbyPanels = new Set<PanelLayout>();

    for (const cellKey of cells) {
      const cellPanels = this.cells.get(cellKey) || [];
      for (const nearbyPanel of cellPanels) {
        if ('id' in panel && nearbyPanel.id !== panel.id) {
          nearbyPanels.add(nearbyPanel);
        } else if (!('id' in panel)) {
          nearbyPanels.add(nearbyPanel);
        }
      }
    }

    return Array.from(nearbyPanels);
  }

  clear(): void {
    this.cells.clear();
  }

  rebuild(panels: PanelLayout[]): void {
    this.clear();
    for (const panel of panels) {
      this.addPanel(panel);
    }
  }
}

/**
 * Get collision preview showing invalid positions
 */
export const getCollisionPreview = (
  position: Position,
  size: Size,
  panels: PanelLayout[],
  excludeId?: string
): {
  isValid: boolean;
  collisions: PanelLayout[];
  suggestedPosition?: Position;
} => {
  const collisionResult = findCollisions(panels, { position, size }, excludeId);

  let suggestedPosition: Position | undefined;
  if (collisionResult.colliding) {
    suggestedPosition = preventOverlap(position, size, panels, undefined, excludeId);
  }

  return {
    isValid: !collisionResult.colliding,
    collisions: collisionResult.panels,
    suggestedPosition,
  };
};
