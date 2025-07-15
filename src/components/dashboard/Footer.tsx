import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Footer() {
  const { themeConfig } = useTheme();

  return (
    <footer className="backdrop-blur-md border-t px-6 py-3" 
            style={{ 
              backgroundColor: `${themeConfig.colors.neutral[900]}99`,
              borderColor: `${themeConfig.colors.neutral[700]}80`
            }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm" style={{ color: themeConfig.colors.neutral[400] }}>
          <span className="font-medium" style={{ color: themeConfig.colors.primary[400] }}>
            Lucaverse Hub v2.0
          </span>
          <span>•</span>
          <span>Enhanced Productivity Suite</span>
          <span>•</span>
          <span>Modular Architecture</span>
        </div>
        <div className="flex items-center space-x-4 text-sm" style={{ color: themeConfig.colors.neutral[400] }}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeConfig.colors.primary[500] }}></div>
            <span>Performance: Optimal</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeConfig.colors.primary[500] }}></div>
            <span>Memory: 24MB</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeConfig.colors.primary[500] }}></div>
            <span>Connection: Stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}