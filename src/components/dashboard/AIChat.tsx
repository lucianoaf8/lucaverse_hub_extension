import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AIChat() {
  const { themeConfig } = useTheme();
  const [selectedModel, setSelectedModel] = useState('Claude (Sonnet)');
  const [selectedVersion, setSelectedVersion] = useState('Claude 3.5 Sonnet');
  const [selectedMode, setSelectedMode] = useState('Explain');

  const models = ['Claude (Sonnet)', 'GPT-4', 'GPT-3.5'];
  const versions = ['Claude 3.5 Sonnet', 'Claude 3 Opus', 'Claude 3 Haiku'];
  const modes = [
    { name: 'Explain', icon: '💡' },
    { name: 'Code Review', icon: '🔍' },
    { name: 'Debug', icon: '🐛' },
    { name: 'Optimize', icon: '⚡' },
    { name: 'Translate', icon: '🌐' }
  ];

  const chats = [
    { id: 1, title: 'New Chat – now', active: true },
    { id: 2, title: 'Previous conversation', active: false }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title bar with robot icon + title + expand control */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg filter drop-shadow-lg">🤖</span>
          <h2 className="text-lg font-bold" style={{ 
            color: themeConfig.colors.primary[200],
            textShadow: `0 0 10px ${themeConfig.colors.primary[500]}60`
          }}>AI Command Center</h2>
        </div>
        <button className="transition-colors hover:opacity-75" style={{ color: themeConfig.colors.neutral[400] }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-32 flex flex-col space-y-2 flex-shrink-0 overflow-hidden">
          {/* New Chat button */}
          <button className="flex items-center justify-center space-x-1 px-2 py-2 rounded text-xs transition-all"
                  style={{ 
                    backgroundColor: themeConfig.colors.primary[700],
                    color: themeConfig.colors.neutral[100]
                  }}>
            <span className="text-sm">🌟</span>
            <span className="font-medium">New Chat</span>
          </button>

          {/* Chat list */}
          <div className="flex-1 space-y-1 overflow-y-auto">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className="w-full p-2 text-left rounded text-xs transition-all"
                style={{
                  backgroundColor: chat.active ? themeConfig.colors.primary[800] : themeConfig.colors.neutral[800],
                  color: chat.active ? themeConfig.colors.neutral[100] : themeConfig.colors.neutral[300]
                }}
              >
                <div className="truncate">{chat.title}</div>
              </button>
            ))}
          </div>

          {/* Clear All button at bottom */}
          <button className="w-full px-2 py-1 rounded text-xs transition-all"
                  style={{ backgroundColor: themeConfig.colors.neutral[800], color: themeConfig.colors.neutral[300] }}>
            Clear All
          </button>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
          {/* Header with two dropdowns */}
          <div className="grid grid-cols-2 gap-2 flex-shrink-0">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-2 py-1 rounded text-xs focus:outline-none"
              style={{ 
                backgroundColor: themeConfig.colors.neutral[800], 
                borderColor: themeConfig.colors.neutral[700],
                color: themeConfig.colors.neutral[100]
              }}
            >
              {models.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="px-2 py-1 rounded text-xs focus:outline-none"
              style={{ 
                backgroundColor: themeConfig.colors.neutral[800], 
                borderColor: themeConfig.colors.neutral[700],
                color: themeConfig.colors.neutral[100]
              }}
            >
              {versions.map((version) => (
                <option key={version} value={version}>{version}</option>
              ))}
            </select>
          </div>

          {/* Five action buttons */}
          <div className="flex flex-wrap gap-1 flex-shrink-0">
            {modes.map((mode) => (
              <button
                key={mode.name}
                onClick={() => setSelectedMode(mode.name)}
                className="flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all"
                style={{
                  backgroundColor: selectedMode === mode.name ? themeConfig.colors.primary[700] : themeConfig.colors.neutral[800],
                  color: selectedMode === mode.name ? themeConfig.colors.neutral[100] : themeConfig.colors.neutral[300]
                }}
              >
                <span>{mode.icon}</span>
                <span>{mode.name}</span>
              </button>
            ))}
          </div>

          {/* Wide input text area at bottom */}
          <div className="flex-1 overflow-hidden">
            <textarea
              placeholder="Please explain this concept in simple terms:"
              className="w-full h-full px-3 py-2 focus:outline-none resize-none text-xs"
              style={{ 
                backgroundColor: themeConfig.colors.neutral[800], 
                borderColor: themeConfig.colors.neutral[700],
                color: themeConfig.colors.neutral[100]
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}