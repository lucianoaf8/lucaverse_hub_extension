import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';

export default function QuickActions() {
  const navigate = useNavigate();
  const { themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const quickActions = [
    {
      id: 'search',
      icon: '🔍',
      label: 'Search',
      shortcut: 'Ctrl+K',
      action: () => setIsOpen(true)
    },
    {
      id: 'copy-theme',
      icon: '📋',
      label: 'Copy Theme',
      shortcut: 'Ctrl+C',
      action: () => {
        navigator.clipboard.writeText(JSON.stringify(themeConfig, null, 2));
        // Show toast notification
        console.log('Theme copied to clipboard');
      }
    },
    {
      id: 'export',
      icon: '💾',
      label: 'Export',
      shortcut: 'Ctrl+E',
      action: () => {
        const dataStr = JSON.stringify(themeConfig, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'theme-config.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    },
    {
      id: 'settings',
      icon: '⚙️',
      label: 'Settings',
      shortcut: 'Ctrl+,',
      action: () => navigate('/dev-center/settings')
    },
    {
      id: 'help',
      icon: '❓',
      label: 'Help',
      shortcut: 'F1',
      action: () => navigate('/dev-center/help')
    },
    {
      id: 'state-demo',
      icon: '🔄',
      label: 'State Demo',
      shortcut: 'Ctrl+D',
      action: () => navigate('/dev-center/state-demo')
    }
  ];
  
  const searchableItems = [
    { title: 'Theme Studio', description: 'Design and test your application theme', path: '/dev-center/theme/color-harmony' },
    { title: 'Component Workshop', description: 'Build and test UI components', path: '/dev-center/component/build' },
    { title: 'Layout Designer', description: 'Create responsive dashboard layouts', path: '/dev-center/layout/structure' },
    { title: 'Quality Gate', description: 'Optimize application performance', path: '/dev-center/performance/measure' },
    { title: 'Color Harmony', description: 'Define color palette and relationships', path: '/dev-center/theme/color-harmony' },
    { title: 'Typography', description: 'Configure font families and text styles', path: '/dev-center/theme/typography' },
    { title: 'Component Testing', description: 'Test all component states and variants', path: '/dev-center/component/test-states' },
    { title: 'Layout Structure', description: 'Define panel arrangement and hierarchy', path: '/dev-center/layout/structure' },
    { title: 'Performance Baseline', description: 'Measure baseline performance metrics', path: '/dev-center/performance/measure' },
  ];
  
  const filteredItems = searchableItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      {/* Quick Actions Bar */}
      <div className="bg-elevated border-b border-neutral-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 
                             transition-colors group relative"
                  title={`${action.label} (${action.shortcut})`}
                >
                  <span className="text-lg">{action.icon}</span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-neutral-900 text-neutral-200 text-xs rounded py-1 px-2 whitespace-nowrap">
                      {action.label}
                      <div className="text-xs text-neutral-500">{action.shortcut}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Dev Center Ready</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50">
          <div className="bg-elevated rounded-xl border border-neutral-700 w-full max-w-2xl mx-4 shadow-2xl">
            <div className="p-4 border-b border-neutral-700">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Search dev center..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-neutral-200 placeholder-neutral-500 
                             focus:outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredItems.length > 0 ? (
                <div className="p-2">
                  {filteredItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(item.path);
                        setIsOpen(false);
                      }}
                      className="w-full p-3 rounded-lg hover:bg-neutral-800 transition-colors text-left"
                    >
                      <div className="font-medium text-neutral-200 mb-1">{item.title}</div>
                      <div className="text-sm text-neutral-500">{item.description}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-neutral-700 text-xs text-neutral-500 flex justify-between">
              <span>Use ↑↓ to navigate</span>
              <span>Enter to select • Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}