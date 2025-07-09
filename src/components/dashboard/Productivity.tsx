import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Productivity() {
  const { themeConfig } = useTheme();
  const [selectedMode, setSelectedMode] = useState('Focus');
  const [notes, setNotes] = useState('');

  const modes = ['Focus', 'Break', 'Long'];
  const controls = ['Start', 'Reset'];

  const focusTime = 25;
  const breakTime = 5;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title bar with lightning icon + title + expand */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg filter drop-shadow-lg">⚡</span>
          <h2 className="text-lg font-bold" style={{ 
            color: themeConfig.colors.primary[200],
            textShadow: `0 0 10px ${themeConfig.colors.primary[500]}60`
          }}>Productivity Nexus</h2>
        </div>
        <button className="transition-colors hover:opacity-75" style={{ color: themeConfig.colors.neutral[400] }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
        {/* Left column: Timer */}
        <div className="flex flex-col items-center justify-center space-y-3 overflow-hidden">
          {/* Circular timer graphic */}
          <div className="relative w-32 h-32 flex-shrink-0">
            {/* Circular progress background */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={themeConfig.colors.neutral[700]}
                strokeWidth="6"
                fill="none"
              />
              {/* Progress circle (currently empty/reset state) */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke={themeConfig.colors.primary[500]}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`0 ${2 * Math.PI * 45}`}
              />
            </svg>
            
            {/* Timer Text in Center - Large "NaN : NaN" */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-mono font-bold" style={{ 
                color: themeConfig.colors.primary[300],
                textShadow: `0 0 15px ${themeConfig.colors.primary[500]}80`
              }}>
                25 : 00
              </div>
            </div>
          </div>

          {/* Three mode buttons below timer */}
          <div className="flex gap-1 flex-shrink-0">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className="px-2 py-1 rounded text-xs transition-all"
                style={{
                  backgroundColor: selectedMode === mode ? themeConfig.colors.primary[700] : themeConfig.colors.neutral[800],
                  color: selectedMode === mode ? themeConfig.colors.neutral[100] : themeConfig.colors.neutral[300]
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Start/Reset controls */}
          <div className="flex gap-2 flex-shrink-0">
            {controls.map((control) => (
              <button
                key={control}
                className="px-3 py-1 rounded text-xs transition-all"
                style={{ 
                  backgroundColor: themeConfig.colors.neutral[800],
                  color: themeConfig.colors.neutral[100]
                }}
              >
                {control}
              </button>
            ))}
          </div>

          {/* Numeric inputs beneath controls */}
          <div className="text-xs space-y-1 text-center flex-shrink-0" style={{ color: themeConfig.colors.neutral[400] }}>
            <div>Focus: {focusTime} min</div>
            <div>Break: {breakTime} min</div>
          </div>
        </div>

        {/* Right column: Smart Notes */}
        <div className="flex flex-col overflow-hidden">
          {/* Smart Notes header with toolbar icons */}
          <div className="mb-2 flex-shrink-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xs font-bold flex items-center" style={{ color: themeConfig.colors.neutral[300] }}>
                <span className="mr-1">📝</span>
                Smart Notes
              </h3>
              <div className="flex items-center space-x-1">
                <button className="transition-colors hover:opacity-75" style={{ color: themeConfig.colors.neutral[400] }} title="Grid view">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button className="transition-colors hover:opacity-75" style={{ color: themeConfig.colors.neutral[400] }} title="List view">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button className="transition-colors hover:opacity-75" style={{ color: themeConfig.colors.neutral[400] }} title="Checklist">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button className="transition-colors hover:opacity-75" style={{ color: themeConfig.colors.neutral[400] }} title="Delete">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Large text area */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Capture thoughts, insights, and breakthroughs…"
            className="flex-1 w-full px-3 py-2 rounded focus:outline-none resize-none text-xs"
            style={{ 
              backgroundColor: themeConfig.colors.neutral[800], 
              borderColor: themeConfig.colors.neutral[700],
              color: themeConfig.colors.neutral[100]
            }}
          />
        </div>
      </div>
    </div>
  );
}