import React from 'react';
import { useDragDropContext } from '../providers/DragDropProvider';
import { Position, Size } from '../../types/panel';
import clsx from 'clsx';

// Visual feedback component props
export interface DragFeedbackProps {
  showGhost?: boolean;
  showSnapLines?: boolean;
  showCollisionWarnings?: boolean;
  showDistanceTooltips?: boolean;
  className?: string;
}

// Drag ghost/preview component with panel content
export const DragGhost: React.FC<{
  panelData: any;
  position: Position;
  size: Size;
  opacity?: number;
}> = ({ panelData, position, size, opacity = 0.6 }) => {
  return (
    <div
      className="fixed pointer-events-none z-50 transition-opacity duration-150"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        opacity,
        transform: 'rotate(3deg) scale(1.05)',
      }}
    >
      <div className="w-full h-full bg-white/20 backdrop-blur-md border-2 border-blue-400/60 rounded-lg shadow-2xl">
        <div className="p-4 text-white/90">
          <div className="text-sm font-medium">
            {panelData?.metadata?.title || `Panel ${panelData?.id}`}
          </div>
          <div className="text-xs text-white/70 mt-1">Dragging...</div>
        </div>
      </div>
    </div>
  );
};

// Drop zone highlighting component
export const DropZoneHighlight: React.FC<{
  zones: Array<{
    id: string;
    rect: DOMRect;
    isValid: boolean;
    isActive: boolean;
  }>;
}> = ({ zones }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {zones.map(zone => (
        <div
          key={zone.id}
          className={clsx(
            'absolute border-2 rounded-lg transition-all duration-200',
            zone.isActive && zone.isValid && 'border-emerald-400 bg-emerald-400/20 shadow-lg',
            zone.isActive && !zone.isValid && 'border-red-400 bg-red-400/20 shadow-lg',
            !zone.isActive && 'border-transparent'
          )}
          style={{
            left: zone.rect.left,
            top: zone.rect.top,
            width: zone.rect.width,
            height: zone.rect.height,
          }}
        />
      ))}
    </div>
  );
};

// Magnetic snap line visualization
export const SnapLines: React.FC<{
  activePosition: Position;
  snapTargets: Array<{
    x?: number;
    y?: number;
    type: 'grid' | 'panel' | 'edge';
  }>;
}> = ({ activePosition, snapTargets }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <svg className="w-full h-full">
        {snapTargets.map((target, index) => (
          <g key={index}>
            {/* Vertical snap line */}
            {target.x && (
              <line
                x1={target.x}
                y1={0}
                x2={target.x}
                y2="100%"
                stroke="#3B82F6"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
            )}
            {/* Horizontal snap line */}
            {target.y && (
              <line
                x1={0}
                y1={target.y}
                x2="100%"
                y2={target.y}
                stroke="#3B82F6"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
            )}
          </g>
        ))}

        {/* Active position indicator */}
        <circle cx={activePosition.x} cy={activePosition.y} r="4" fill="#3B82F6" opacity="0.8" />
      </svg>
    </div>
  );
};

// Collision warning indicators
export const CollisionWarning: React.FC<{
  collisions: Array<{
    panelId: string;
    position: Position;
    size: Size;
  }>;
}> = ({ collisions }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-35">
      {collisions.map(collision => (
        <div
          key={collision.panelId}
          className="absolute border-2 border-red-500 bg-red-500/10 rounded-lg animate-pulse"
          style={{
            left: collision.position.x,
            top: collision.position.y,
            width: collision.size.width,
            height: collision.size.height,
          }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="px-2 py-1 bg-red-500 text-white text-xs rounded whitespace-nowrap">
              Collision Warning
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Distance and position tooltips during drag
export const DragTooltip: React.FC<{
  position: Position;
  startPosition: Position;
  mousePosition: Position;
  showDistance?: boolean;
  showCoordinates?: boolean;
}> = ({ position, startPosition, mousePosition, showDistance = true, showCoordinates = true }) => {
  const distance = Math.sqrt(
    Math.pow(position.x - startPosition.x, 2) + Math.pow(position.y - startPosition.y, 2)
  );

  return (
    <div
      className="fixed pointer-events-none z-50 transform translate-x-2 translate-y-2"
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
      }}
    >
      <div className="px-3 py-2 bg-black/80 text-white text-sm rounded-lg backdrop-blur-sm shadow-lg">
        {showCoordinates && (
          <div className="flex space-x-4">
            <span>X: {Math.round(position.x)}</span>
            <span>Y: {Math.round(position.y)}</span>
          </div>
        )}
        {showDistance && (
          <div className="text-xs text-white/70 mt-1">Distance: {Math.round(distance)}px</div>
        )}
      </div>
    </div>
  );
};

// Panel outline/shadow effects for depth perception
export const DragShadow: React.FC<{
  position: Position;
  size: Size;
  elevation?: number;
}> = ({ position, size, elevation = 3 }) => {
  const shadowOffset = elevation * 2;
  const shadowBlur = elevation * 4;

  return (
    <div
      className="fixed pointer-events-none z-20 rounded-lg"
      style={{
        left: position.x + shadowOffset,
        top: position.y + shadowOffset,
        width: size.width,
        height: size.height,
        background: 'rgba(0, 0, 0, 0.3)',
        filter: `blur(${shadowBlur}px)`,
        opacity: 0.5,
      }}
    />
  );
};

// Main drag feedback component that orchestrates all visual elements
export const DragFeedback: React.FC<DragFeedbackProps> = ({
  showGhost = true,
  showSnapLines = true,
  showCollisionWarnings = true,
  showDistanceTooltips = true,
  className = '',
}) => {
  const { dragState } = useDragDropContext();
  const [mousePosition, setMousePosition] = React.useState<Position>({ x: 0, y: 0 });
  const [snapTargets, setSnapTargets] = React.useState<any[]>([]);
  const [collisions, setCollisions] = React.useState<any[]>([]);
  const [dropZones, setDropZones] = React.useState<any[]>([]);

  // Track mouse position during drag
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [dragState.isDragging]);

  // Calculate snap targets based on current drag state
  React.useEffect(() => {
    if (!dragState.isDragging || !dragState.activePanelData) return;

    // This would be populated with actual snap calculation logic
    // For now, we'll use mock data
    const mockSnapTargets = [
      { x: 100, type: 'grid' as const },
      { y: 150, type: 'grid' as const },
    ];

    setSnapTargets(mockSnapTargets);
  }, [dragState]);

  // Don't render anything if not dragging
  if (!dragState.isDragging || !dragState.activePanelData) {
    return null;
  }

  const currentPosition = {
    x: dragState.activePanelData.position.x + (dragState.dragOffset?.x || 0),
    y: dragState.activePanelData.position.y + (dragState.dragOffset?.y || 0),
  };

  return (
    <div className={clsx('drag-feedback-container', className)}>
      {/* Drag Shadow for depth */}
      <DragShadow position={currentPosition} size={dragState.activePanelData.size} elevation={3} />

      {/* Drag Ghost */}
      {showGhost && (
        <DragGhost
          panelData={dragState.activePanelData}
          position={currentPosition}
          size={dragState.activePanelData.size}
        />
      )}

      {/* Snap Lines */}
      {showSnapLines && <SnapLines activePosition={currentPosition} snapTargets={snapTargets} />}

      {/* Collision Warnings */}
      {showCollisionWarnings && collisions.length > 0 && (
        <CollisionWarning collisions={collisions} />
      )}

      {/* Drop Zone Highlights */}
      {dropZones.length > 0 && <DropZoneHighlight zones={dropZones} />}

      {/* Distance and Position Tooltip */}
      {showDistanceTooltips && (
        <DragTooltip
          position={currentPosition}
          startPosition={dragState.activePanelData.position}
          mousePosition={mousePosition}
        />
      )}
    </div>
  );
};
