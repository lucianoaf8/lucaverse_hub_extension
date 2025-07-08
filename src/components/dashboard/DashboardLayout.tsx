import React, { ReactNode } from 'react';
import { Navigation } from '../common';
import useNavigation from '../../hooks/useNavigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isFromDevCenter } = useNavigation();
  const [showDevCenterLink, setShowDevCenterLink] = React.useState(false);

  React.useEffect(() => {
    const checkDevCenterSource = async () => {
      try {
        const fromDevCenter = await isFromDevCenter();
        setShowDevCenterLink(fromDevCenter);
      } catch (error) {
        console.error('Failed to check dev center source:', error);
      }
    };
    
    checkDevCenterSource();
  }, [isFromDevCenter]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-base">
      <header className="border-b border-neutral-700 bg-surface">
        <div className="container mx-auto px-6 py-4">
          <Navigation showDevCenterLink={showDevCenterLink} />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        <aside className="w-64 bg-elevated border-r border-neutral-700 p-4">
          <div className="space-y-4">
            <div className="p-3 bg-surface rounded-lg border border-neutral-700">
              <h3 className="font-medium text-primary mb-2">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-primary hover:bg-primary/10 rounded transition-colors">
                  <span className="mr-2">📝</span>
                  Create Task
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-primary hover:bg-primary/10 rounded transition-colors">
                  <span className="mr-2">💬</span>
                  New Chat
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:text-primary hover:bg-primary/10 rounded transition-colors">
                  <span className="mr-2">📊</span>
                  View Reports
                </button>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-lg border border-neutral-700">
              <h3 className="font-medium text-secondary mb-2">Shortcuts</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <span>New Task</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">Ctrl+N</kbd>
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <span>Search</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">Ctrl+K</kbd>
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <span>Settings</span>
                  <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs">Ctrl+,</kbd>
                </div>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-lg border border-neutral-700">
              <h3 className="font-medium text-success mb-2">System Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Theme System</span>
                  <span className="text-success">✓ Online</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">AI Services</span>
                  <span className="text-success">✓ Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Performance</span>
                  <span className="text-success">✓ Optimal</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <footer className="border-t border-neutral-700 bg-surface">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-neutral-400">
              <span>Lucaverse Hub Dashboard</span>
              <span>•</span>
              <span>Active Session</span>
              <span>•</span>
              <span>Last Updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-neutral-400">
              <span>Memory: 24MB</span>
              <span>•</span>
              <span>Performance: Optimal</span>
              <span>•</span>
              <span className="text-success">All Systems Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}