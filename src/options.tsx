import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { workspaceManager } from './utils/workspaceManager';
import { useTemplateStore } from './stores/templateStore';
import './styles/globals.css';

/**
 * Chrome Extension Options Page
 * Comprehensive settings and configuration interface
 */
const ExtensionOptions: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    autoSyncEnabled: true,
    notificationsEnabled: true,
    newTabOverride: true,
    syncInterval: 300000,
    theme: 'dark',
    debugMode: false,
  });

  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'sync' | 'storage' | 'advanced'>(
    'general'
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const { templates, resetTemplates } = useTemplateStore();

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get('extensionSettings');
      if (result.extensionSettings) {
        setSettings(result.extensionSettings);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setIsLoading(false);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      const allData = await chrome.storage.local.get();

      setStorageInfo({
        localBytesInUse: bytesInUse,
        localItemCount: Object.keys(allData).length,
        quotaBytes: chrome.storage.local.QUOTA_BYTES,
      });
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaveStatus('saving');
      await chrome.storage.sync.set({ extensionSettings: settings });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const clearAllData = async () => {
    if (
      confirm('Are you sure you want to clear all extension data? This action cannot be undone.')
    ) {
      try {
        await chrome.storage.local.clear();
        await chrome.storage.sync.clear();
        await loadStorageInfo();
        alert('All data cleared successfully. Please reload the extension.');
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Failed to clear data. Please try again.');
      }
    }
  };

  const exportData = async () => {
    try {
      const allData = await chrome.storage.local.get();
      const syncData = await chrome.storage.sync.get();

      const exportObject = {
        localData: allData,
        syncData: syncData,
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
      };

      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `lucaverse-hub-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (importData.localData && importData.syncData) {
        if (confirm('This will replace all current data. Are you sure?')) {
          await chrome.storage.local.clear();
          await chrome.storage.sync.clear();

          await chrome.storage.local.set(importData.localData);
          await chrome.storage.sync.set(importData.syncData);

          await loadSettings();
          await loadStorageInfo();

          alert('Data imported successfully. Please reload the extension.');
        }
      } else {
        alert('Invalid data format. Please select a valid export file.');
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div>Loading Settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h1 className="text-2xl font-bold">Lucaverse Hub Settings</h1>
        <p className="text-blue-100 mt-1">Configure your productivity dashboard</p>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-4">
          <nav className="space-y-2">
            {[
              { id: 'general', label: '🔧 General', tab: 'general' },
              { id: 'sync', label: '🔄 Sync & Backup', tab: 'sync' },
              { id: 'storage', label: '💾 Storage', tab: 'storage' },
              { id: 'advanced', label: '⚙️ Advanced', tab: 'advanced' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.tab as any)}
                className={`w-full text-left px-4 py-2 rounded transition-colors ${
                  activeTab === item.tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">General Settings</h2>

              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Override New Tab Page</div>
                    <div className="text-sm text-gray-400">
                      Replace Chrome's new tab with Lucaverse Hub dashboard
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.newTabOverride}
                    onChange={e => updateSetting('newTabOverride', e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Enable Notifications</div>
                    <div className="text-sm text-gray-400">
                      Show desktop notifications for tasks and updates
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={e => updateSetting('notificationsEnabled', e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={e => updateSetting('theme', e.target.value)}
                    className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-48"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Sync & Backup</h2>

              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto Sync</div>
                    <div className="text-sm text-gray-400">
                      Automatically sync data across devices
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSyncEnabled}
                    onChange={e => updateSetting('autoSyncEnabled', e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Sync Interval</label>
                  <select
                    value={settings.syncInterval}
                    onChange={e => updateSetting('syncInterval', parseInt(e.target.value))}
                    className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-48"
                  >
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                    <option value={900000}>15 minutes</option>
                    <option value={1800000}>30 minutes</option>
                    <option value={3600000}>1 hour</option>
                  </select>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="font-medium mb-3">Data Management</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={exportData}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                    >
                      📤 Export Data
                    </button>

                    <label className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors cursor-pointer">
                      📥 Import Data
                      <input type="file" accept=".json" onChange={importData} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Storage Management</h2>

              {storageInfo && (
                <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                  <div>
                    <div className="font-medium mb-2">Local Storage Usage</div>
                    <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{
                          width: `${(storageInfo.localBytesInUse / storageInfo.quotaBytes) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {(storageInfo.localBytesInUse / 1024 / 1024).toFixed(2)} MB /
                      {(storageInfo.quotaBytes / 1024 / 1024).toFixed(0)} MB
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-sm text-gray-400">Items Stored</div>
                      <div className="text-lg font-medium">{storageInfo.localItemCount}</div>
                    </div>
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-sm text-gray-400">Templates</div>
                      <div className="text-lg font-medium">{templates.length}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-medium mb-3">Storage Actions</h3>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => chrome.runtime.sendMessage({ action: 'optimizeStorage' })}
                        className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded transition-colors"
                      >
                        🗜️ Optimize Storage
                      </button>

                      <button
                        onClick={clearAllData}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
                      >
                        🗑️ Clear All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Advanced Settings</h2>

              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Debug Mode</div>
                    <div className="text-sm text-gray-400">
                      Enable detailed logging for troubleshooting
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.debugMode}
                    onChange={e => updateSetting('debugMode', e.target.checked)}
                    className="rounded"
                  />
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="font-medium mb-3">Extension Info</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div>Version: 2.0.0</div>
                    <div>Manifest: V3</div>
                    <div>Platform: Chrome Extension</div>
                    <div>Architecture: React + TypeScript</div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <h3 className="font-medium mb-3">Developer Tools</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => chrome.tabs.create({ url: 'chrome://extensions/' })}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                    >
                      🔧 Extension Management
                    </button>

                    <button
                      onClick={() => {
                        chrome.runtime.sendMessage({ action: 'ping' }, response => {
                          alert(`Background script response: ${JSON.stringify(response)}`);
                        });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors"
                    >
                      📡 Test Background
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="fixed bottom-6 right-6">
            <button
              onClick={saveSettings}
              disabled={saveStatus === 'saving'}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                saveStatus === 'saved'
                  ? 'bg-green-600 text-white'
                  : saveStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : saveStatus === 'saving'
                      ? 'bg-gray-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saveStatus === 'saving' && '⏳ Saving...'}
              {saveStatus === 'saved' && '✅ Saved!'}
              {saveStatus === 'error' && '❌ Error'}
              {saveStatus === 'idle' && '💾 Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the options page
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<ExtensionOptions />);
