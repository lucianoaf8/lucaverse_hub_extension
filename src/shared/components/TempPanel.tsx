/**
 * Temporary Panel Component
 * Simple panel wrapper to avoid circular dependencies
 */

import React from 'react';
import type { Position, Size } from '@/types/panel';

interface TempPanelProps {
  id: string;
  title?: string;
  icon?: string;
  position: Position;
  size: Size;
  isSelected?: boolean;
  onMove?: (position: Position) => void;
  onResize?: (size: Size) => void;
  className?: string;
  constraints?: {
    minSize?: Size;
    maxSize?: Size;
  };
  children: React.ReactNode;
}

export const TempPanel: React.FC<TempPanelProps> = ({
  title,
  icon,
  children,
  className = ''
}) => {
  return (
    <div className={`h-full flex flex-col bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-600/30 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 p-3 border-b border-gray-600/30">
          {icon && <span className="text-lg">{icon}</span>}
          {title && <h3 className="text-white font-medium">{title}</h3>}
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default TempPanel;