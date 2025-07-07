/**
 * Theme Switcher Component
 * Provides UI controls for theme switching and demonstrates theme integration
 */

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ThemeVariant } from '@/types/components';

interface ThemeSwitcherProps {
  className?: string;
  showDetails?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
  showDetails = false,
}) => {
  const {
    currentTheme,
    setTheme,
    themeConfig,
    isDarkMode,
    isLightMode,
    isAutoMode,
    toggleTheme,
    cycleTheme,
    resetToSystemTheme,
    isSystemDark,
  } = useTheme();

  return (
    <div className={`theme-switcher ${className}`}>
      {/* Theme Toggle Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTheme(ThemeVariant.Dark)}
          className={`px-3 py-2 rounded text-sm transition-all ${
            currentTheme === ThemeVariant.Dark
              ? 'bg-cyan-500 text-black font-medium'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🌙 Dark
        </button>
        <button
          onClick={() => setTheme(ThemeVariant.Light)}
          className={`px-3 py-2 rounded text-sm transition-all ${
            currentTheme === ThemeVariant.Light
              ? 'bg-blue-500 text-white font-medium'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => setTheme(ThemeVariant.Auto)}
          className={`px-3 py-2 rounded text-sm transition-all ${
            currentTheme === ThemeVariant.Auto
              ? 'bg-purple-500 text-white font-medium'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🔄 Auto
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={toggleTheme}
          className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-xs hover:bg-gray-500 transition-colors"
        >
          Toggle
        </button>
        <button
          onClick={cycleTheme}
          className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-xs hover:bg-gray-500 transition-colors"
        >
          Cycle
        </button>
        <button
          onClick={resetToSystemTheme}
          className="px-3 py-1 bg-gray-600 text-gray-200 rounded text-xs hover:bg-gray-500 transition-colors"
        >
          System
        </button>
      </div>

      {/* Theme Details */}
      {showDetails && (
        <div className="space-y-3">
          {/* Current Theme Info */}
          <div className="glass-panel p-3 rounded">
            <div className="text-sm font-medium text-white mb-2">Current Theme</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="text-white ml-2">{themeConfig.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Variant:</span>
                <span className="text-white ml-2">{currentTheme}</span>
              </div>
              <div>
                <span className="text-gray-400">Mode:</span>
                <span className="text-white ml-2">
                  {isDarkMode ? 'Dark' : isLightMode ? 'Light' : 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">System:</span>
                <span className="text-white ml-2">{isSystemDark ? 'Dark' : 'Light'}</span>
              </div>
            </div>
          </div>

          {/* Color Palette Preview */}
          <div className="glass-panel p-3 rounded">
            <div className="text-sm font-medium text-white mb-2">Color Palette</div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(themeConfig.colors).map(([key, value]) => (
                <div key={key} className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded border border-gray-600 mb-1"
                    style={{ backgroundColor: value }}
                    title={`${key}: ${value}`}
                  />
                  <div className="text-xs text-gray-400 text-center">{key}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CSS Custom Properties */}
          <div className="glass-panel p-3 rounded">
            <div className="text-sm font-medium text-white mb-2">CSS Variables</div>
            <div className="space-y-1 text-xs font-mono">
              <div className="text-gray-400">
                --color-primary: <span style={{ color: themeConfig.colors.primary }}>
                  {themeConfig.colors.primary}
                </span>
              </div>
              <div className="text-gray-400">
                --color-background: <span style={{ color: themeConfig.colors.background }}>
                  {themeConfig.colors.background}
                </span>
              </div>
              <div className="text-gray-400">
                --glass-blur: <span className="text-white">{themeConfig.glass.blur}</span>
              </div>
              <div className="text-gray-400">
                --animation-normal: <span className="text-white">{themeConfig.animations.duration.normal}ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;