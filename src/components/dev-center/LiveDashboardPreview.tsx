// src/components/dev-center/LiveDashboardPreview.tsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SmartHub, AIChat, TaskManager, Productivity } from '../dashboard';

interface PreviewControls {
  theme: any;
  layout: 'grid-2x2' | 'grid-1x4' | 'grid-3x1' | 'custom';
  panels: Array<{
    id: string;
    component: string;
    position: { x: number; y: number; width: number; height: number };
    visible: boolean;
  }>;
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

export default function LiveDashboardPreview() {
  const { themeConfig } = useTheme();
  const [previewControls, setPreviewControls] = useState<PreviewControls>({
    theme: themeConfig,
    layout: 'grid-2x2',
    panels: [
      { id: 'smart-hub', component: 'SmartHub', position: { x: 0, y: 0, width: 1, height: 1 }, visible: true },
      { id: 'ai-chat', component: 'AIChat', position: { x: 1, y: 0, width: 1, height: 1 }, visible: true },
      { id: 'task-manager', component: 'TaskManager', position: { x: 0, y: 1, width: 1, height: 1 }, visible: true },
      { id: 'productivity', component: 'Productivity', position: { x: 1, y: 1, width: 1, height: 1 }, visible: true }
    ],
    animations: { enabled: true, duration: 300, easing: 'ease-in-out' }
  });

  const componentMap = {
    SmartHub: SmartHub,
    AIChat: AIChat,
    TaskManager: TaskManager,
    Productivity: Productivity
  };

  const applyThemeChange = (changes: Partial<any>) => {
    const newTheme = { ...previewControls.theme, ...changes };
    setPreviewControls(prev => ({ ...prev, theme: newTheme }));
    // Apply to live preview without affecting main app
  };

  const renderPreviewDashboard = () => {
    const gridClass = {
      'grid-2x2': 'grid-cols-2 grid-rows-2',
      'grid-1x4': 'grid-cols-1 grid-rows-4',
      'grid-3x1': 'grid-cols-3 grid-rows-1',
      'custom': 'relative'
    }[previewControls.layout];

    return (
      <div 
        className={`h-full grid gap-1 ${gridClass}`}
        style={{ 
          backgroundColor: previewControls.theme.colors.neutral[950],
          transition: previewControls.animations.enabled ? 
            `all ${previewControls.animations.duration}ms ${previewControls.animations.easing}` : 'none'
        }}
      >
        {previewControls.panels
          .filter(panel => panel.visible)
          .map(panel => {
            const Component = componentMap[panel.component as keyof typeof componentMap];
            return (
              <div
                key={panel.id}
                className="backdrop-blur-sm overflow-hidden"
                style={{
                  backgroundColor: `${previewControls.theme.colors.neutral[900]}E6`,
                  border: `1px solid ${previewControls.theme.colors.primary[500]}40`,
                  boxShadow: `inset 0 1px 0 ${previewControls.theme.colors.primary[500]}20`,
                  gridColumn: previewControls.layout === 'custom' ? 'auto' : undefined,
                  gridRow: previewControls.layout === 'custom' ? 'auto' : undefined,
                  position: previewControls.layout === 'custom' ? 'absolute' : 'relative',
                  left: previewControls.layout === 'custom' ? `${panel.position.x * 25}%` : undefined,
                  top: previewControls.layout === 'custom' ? `${panel.position.y * 25}%` : undefined,
                  width: previewControls.layout === 'custom' ? `${panel.position.width * 25}%` : undefined,
                  height: previewControls.layout === 'custom' ? `${panel.position.height * 25}%` : undefined,
                }}
              >
                <div className="h-full p-4 overflow-hidden">
                  <Component />
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Controls Panel */}
      <div className="w-80 bg-elevated border-r border-neutral-700 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Live Preview Controls</h3>
        
        {/* Layout Controls */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-secondary mb-2">Layout</h4>
          <select
            value={previewControls.layout}
            onChange={(e) => setPreviewControls(prev => ({ 
              ...prev, 
              layout: e.target.value as any 
            }))}
            className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded"
            style={{ color: themeConfig.colors.neutral[100] }}
          >
            <option value="grid-2x2">2x2 Grid</option>
            <option value="grid-1x4">1x4 Vertical</option>
            <option value="grid-3x1">3x1 Horizontal</option>
            <option value="custom">Custom Layout</option>
          </select>
        </div>

        {/* Panel Visibility */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-secondary mb-2">Panel Visibility</h4>
          {previewControls.panels.map(panel => (
            <label key={panel.id} className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={panel.visible}
                onChange={(e) => setPreviewControls(prev => ({
                  ...prev,
                  panels: prev.panels.map(p => 
                    p.id === panel.id ? { ...p, visible: e.target.checked } : p
                  )
                }))}
              />
              <span className="text-sm">{panel.component}</span>
            </label>
          ))}
        </div>

        {/* Animation Controls */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-secondary mb-2">Animations</h4>
          <label className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={previewControls.animations.enabled}
              onChange={(e) => setPreviewControls(prev => ({
                ...prev,
                animations: { ...prev.animations, enabled: e.target.checked }
              }))}
            />
            <span className="text-sm">Enable Animations</span>
          </label>
          <div className="space-y-2">
            <label className="block text-xs text-neutral-400">Duration (ms)</label>
            <input
              type="range"
              min="100"
              max="1000"
              value={previewControls.animations.duration}
              onChange={(e) => setPreviewControls(prev => ({
                ...prev,
                animations: { ...prev.animations, duration: Number(e.target.value) }
              }))}
              className="w-full"
            />
            <span className="text-xs text-neutral-500">{previewControls.animations.duration}ms</span>
          </div>
        </div>

        {/* Quick Theme Actions */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-secondary mb-2">Quick Actions</h4>
          <div className="space-y-2">
            <button 
              className="w-full btn btn-secondary text-sm"
              onClick={() => {/* Export current layout */}}
            >
              📐 Export Layout
            </button>
            <button 
              className="w-full btn btn-secondary text-sm"
              onClick={() => {/* Apply to main dashboard */}}
            >
              ✅ Apply to Dashboard
            </button>
            <button 
              className="w-full btn btn-danger text-sm"
              onClick={() => {/* Reset to defaults */}}
            >
              🔄 Reset Preview
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex-1 bg-neutral-950 p-4">
        <div className="h-full border border-neutral-700 rounded-lg overflow-hidden">
          {renderPreviewDashboard()}
        </div>
      </div>
    </div>
  );
}