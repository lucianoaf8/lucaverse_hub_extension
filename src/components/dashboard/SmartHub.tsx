import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function SmartHub() {
  const { themeConfig } = useTheme();
  const quickTags = [
    { name: 'Work', color: themeConfig.colors.primary[600] },
    { name: 'Dev', color: themeConfig.colors.success[600] },
    { name: 'Social', color: themeConfig.colors.secondary[600] },
    { name: 'Docs', color: themeConfig.colors.warning[600] },
    { name: 'Tools', color: themeConfig.colors.danger[600] },
    { name: 'Research', color: themeConfig.colors.neutral[600] }
  ];

  const mostVisited = [
    { name: 'GitHub Dashboard', domain: 'github.com', visits: '23×', icon: '🐙' },
    { name: 'Claude AI', domain: 'claude.ai', visits: '18×', icon: '🤖' }
  ];

  const pinnedItems = [
    { name: 'GitHub Dashboard', domain: 'github.com', icon: '🐙' },
    { name: 'Gmail', domain: 'gmail.com', icon: '📧' }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title bar with link icon + title + expand button */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg filter drop-shadow-lg">🔗</span>
          <h2 className="text-lg font-bold" style={{ 
            color: themeConfig.colors.primary[200],
            textShadow: `0 0 10px ${themeConfig.colors.primary[500]}60`
          }}>
            Smart Access Hub
          </h2>
        </div>
        <button className="transition-colors hover:opacity-75" 
                style={{ color: themeConfig.colors.neutral[400] }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>

      {/* Full-width search input */}
      <div className="relative mb-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search bookmarks & history…"
          className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all backdrop-blur-sm"
          style={{ 
            backgroundColor: `${themeConfig.colors.neutral[800]}B3`,
            borderColor: `${themeConfig.colors.primary[500]}60`,
            borderWidth: '1px',
            boxShadow: `inset 0 2px 4px 0 ${themeConfig.colors.neutral[950]}40, 0 0 8px ${themeConfig.colors.primary[500]}20`,
            color: themeConfig.colors.neutral[100]
          }}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
               style={{ color: themeConfig.colors.neutral[400] }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* Left column */}
        <div className="space-y-3 overflow-hidden">
          {/* Quick Tags section */}
          <div className="flex-shrink-0">
            <h3 className="text-xs font-bold mb-2 flex items-center" 
                style={{ color: themeConfig.colors.neutral[300] }}>
              <span className="mr-2">✏️</span>
              QUICK TAGS
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {quickTags.map((tag) => (
                <button
                  key={tag.name}
                  className="h-[32px] px-2 py-1 rounded-full text-xs hover:opacity-75 transition-all flex items-center justify-center backdrop-blur-sm"
                  style={{ 
                    backgroundColor: `${tag.color}CC`,
                    borderColor: `${themeConfig.colors.primary[500]}40`,
                    borderWidth: '1px',
                    boxShadow: `0 0 8px ${tag.color}40`,
                    color: themeConfig.colors.neutral[100]
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Most Visited section */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-xs font-bold mb-2 flex items-center" 
                style={{ color: themeConfig.colors.neutral[300] }}>
              <span className="mr-2">⚡</span>
              MOST VISITED
            </h3>
            <div className="space-y-1 overflow-y-auto">
              {mostVisited.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded border transition-all group"
                  style={{ 
                    backgroundColor: themeConfig.colors.neutral[800],
                    borderColor: themeConfig.colors.neutral[700]
                  }}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-sm">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: themeConfig.colors.neutral[100] }}>
                        {item.name}
                      </div>
                      <div className="text-xs truncate" style={{ color: themeConfig.colors.neutral[400] }}>
                        {item.domain}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className="text-xs px-1 py-0.5 rounded-full font-medium"
                          style={{ 
                            backgroundColor: themeConfig.colors.primary[800],
                            color: themeConfig.colors.primary[300]
                          }}>
                      {item.visits}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-3 overflow-hidden">
          {/* Recent Bookmarks section */}
          <div className="flex-shrink-0">
            <h3 className="text-xs font-bold mb-2 flex items-center" 
                style={{ color: themeConfig.colors.neutral[300] }}>
              <span className="mr-2">🔴</span>
              RECENT BOOKMARKS
            </h3>
            <div className="p-4 rounded border text-center"
                 style={{ 
                   backgroundColor: themeConfig.colors.neutral[800],
                   borderColor: themeConfig.colors.neutral[700]
                 }}>
              <div className="text-2xl mb-1" style={{ color: themeConfig.colors.neutral[500] }}>📝</div>
              <div className="text-xs" style={{ color: themeConfig.colors.neutral[400] }}>No items yet</div>
            </div>
          </div>

          {/* Pinned Items section */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-xs font-bold mb-2 flex items-center" 
                style={{ color: themeConfig.colors.neutral[300] }}>
              <span className="mr-2">📌</span>
              PINNED ITEMS
            </h3>
            <div className="space-y-1 overflow-y-auto">
              {pinnedItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded border transition-all group"
                  style={{ 
                    backgroundColor: themeConfig.colors.neutral[800],
                    borderColor: themeConfig.colors.neutral[700]
                  }}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-sm">{item.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate" style={{ color: themeConfig.colors.neutral[100] }}>
                        {item.name}
                      </div>
                      <div className="text-xs truncate" style={{ color: themeConfig.colors.neutral[400] }}>
                        {item.domain}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}