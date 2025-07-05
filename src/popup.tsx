import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { useTemplateStore } from './stores/templateStore';
import { workspaceManager } from './utils/workspaceManager';
import './styles/globals.css';

/**
 * Chrome Extension Popup Interface
 * Provides quick access to core Lucaverse Hub functionality
 */
const ExtensionPopup: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'quick-actions' | 'settings'>(
    'dashboard'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [extensionData, setExtensionData] = useState<any>(null);
  const { templates, getFilteredTemplates } = useTemplateStore();

  useEffect(() => {
    initializePopup();
  }, []);

  const initializePopup = async () => {
    try {
      // Get extension state from background
      const response = await chrome.runtime.sendMessage({ action: 'getExtensionState' });
      if (response.success) {
        setExtensionData(response.data);
      }

      // Initialize stores
      const workspaces = workspaceManager.getWorkspaces();
      console.log('Available workspaces:', workspaces.length);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      setIsLoading(false);
    }
  };

  const openDashboard = () => {
    chrome.tabs.create({ url: 'newtab.html' });
    window.close();
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
    window.close();
  };

  const quickSaveCurrentTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url && tab.title) {
        await chrome.runtime.sendMessage({
          action: 'setStorageData',
          data: {
            [`bookmark-${Date.now()}`]: {
              url: tab.url,
              title: tab.title,
              createdAt: Date.now(),
              source: 'popup-quick-save',
            },
          },
        });

        // Show success feedback
        const button = document.getElementById('quick-save-btn');
        if (button) {
          button.textContent = '✅ Saved!';
          setTimeout(() => {
            button.textContent = '🔖 Save Page';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to save bookmark:', error);
    }
  };

  const loadTemplate = async (templateId: string) => {
    try {
      setIsLoading(true);
      // Send message to background to load template
      await chrome.runtime.sendMessage({
        action: 'loadTemplate',
        data: { templateId },
      });

      // Open dashboard to show the loaded template
      openDashboard();
    } catch (error) {
      console.error('Failed to load template:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 h-96 bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-96 bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-center">
        <h1 className="text-lg font-bold">Lucaverse Hub</h1>
        <p className="text-xs opacity-80">Productivity Dashboard</p>
      </div>

      {/* Navigation */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'dashboard', label: '🏠 Dashboard', view: 'dashboard' },
          { id: 'actions', label: '⚡ Actions', view: 'quick-actions' },
          { id: 'settings', label: '⚙️ Settings', view: 'settings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.view as any)}
            className={`flex-1 py-2 px-2 text-xs transition-colors ${
              currentView === tab.view
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentView === 'dashboard' && (
          <div className="space-y-4">
            <button
              onClick={openDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              🚀 Open Full Dashboard
            </button>

            {extensionData && (
              <div className="bg-gray-800 rounded-lg p-3 text-xs">
                <div className="font-medium mb-2">Extension Status</div>
                <div className="space-y-1 text-gray-400">
                  <div>Status: {extensionData.isInitialized ? '✅ Ready' : '⏳ Loading'}</div>
                  <div>Active Workspace: {extensionData.activeWorkspace || 'None'}</div>
                  <div>
                    Last Sync:{' '}
                    {extensionData.lastSyncTime
                      ? new Date(extensionData.lastSyncTime).toLocaleTimeString()
                      : 'Never'}
                  </div>
                </div>
              </div>
            )}

            {templates.length > 0 && (
              <div>
                <div className="font-medium mb-2 text-sm">Quick Templates</div>
                <div className="space-y-2">
                  {getFilteredTemplates()
                    .slice(0, 3)
                    .map(template => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplate(template.id)}
                        className="w-full text-left bg-gray-800 hover:bg-gray-700 p-2 rounded text-xs transition-colors"
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-gray-400">{template.panels.length} panels</div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'quick-actions' && (
          <div className="space-y-3">
            <button
              id="quick-save-btn"
              onClick={quickSaveCurrentTab}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              🔖 Save Current Page
            </button>

            <button
              onClick={() => {
                chrome.tabs.create({ url: 'options.html' });
                window.close();
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              📝 Add Quick Task
            </button>

            <button
              onClick={() => {
                chrome.tabs.create({ url: 'chrome://bookmarks/' });
                window.close();
              }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              📚 View All Bookmarks
            </button>

            <button
              onClick={() => {
                chrome.tabs.create({ url: 'newtab.html?panel=ai-chat' });
                window.close();
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              🤖 Quick AI Chat
            </button>

            <div className="border-t border-gray-700 pt-3">
              <div className="text-xs text-gray-400 mb-2">Keyboard Shortcuts</div>
              <div className="space-y-1 text-xs text-gray-500">
                <div>Ctrl+Shift+L - Toggle Popup</div>
                <div>Ctrl+Shift+D - Open Dashboard</div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="space-y-4">
            <button
              onClick={openOptions}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors"
            >
              🔧 Open Full Settings
            </button>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Tab Override</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Sync</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3">
              <div className="text-xs text-gray-400 mb-2">Storage Usage</div>
              <div className="bg-gray-800 rounded p-2">
                <div className="text-xs text-gray-300">Local: ~2.3MB / 5MB</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                  <div className="bg-blue-600 h-1 rounded-full" style={{ width: '46%' }}></div>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500">Lucaverse Hub v2.0.0</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Render the popup
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<ExtensionPopup />);
