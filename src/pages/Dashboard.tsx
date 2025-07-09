import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SmartHub from '../components/dashboard/SmartHub';
import AIChat from '../components/dashboard/AIChat';
import TaskManager from '../components/dashboard/TaskManager';
import Productivity from '../components/dashboard/Productivity';

export default function Dashboard() {
  const { themeConfig } = useTheme();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" 
         style={{ backgroundColor: themeConfig.colors.neutral[950] }}>
      {/* Header - with glassmorphism effect */}
      <header className="h-[60px] flex-shrink-0 px-4 border-b backdrop-blur-sm" 
              style={{ 
                backgroundColor: `${themeConfig.colors.neutral[900]}E6`,
                borderColor: `${themeConfig.colors.primary[500]}40`,
                boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}20, 0 0 20px ${themeConfig.colors.primary[500]}10`
              }}>
        <div className="flex items-center justify-between h-full">
          {/* Left: Logo with glow effect */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl filter drop-shadow-lg">🌐</span>
            <h1 className="text-xl font-bold" style={{ 
              color: themeConfig.colors.neutral[100],
              textShadow: `0 0 10px ${themeConfig.colors.primary[500]}40`
            }}>
              Lucaverse Hub
            </h1>
          </div>
          
          {/* Center: Search bar with glassmorphism */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search everything…"
                className="w-full px-4 py-2 rounded-xl text-white placeholder-gray-400 
                           focus:outline-none focus:ring-2 transition-all backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${themeConfig.colors.neutral[800]}B3`,
                  borderColor: `${themeConfig.colors.primary[500]}60`,
                  borderWidth: '1px',
                  boxShadow: `inset 0 2px 4px 0 ${themeConfig.colors.neutral[950]}40, 0 0 10px ${themeConfig.colors.primary[500]}20`
                }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     style={{ color: themeConfig.colors.primary[400] }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Right: Digital clock with glow */}
          <div className="font-mono text-sm" style={{ 
            color: themeConfig.colors.primary[300],
            textShadow: `0 0 8px ${themeConfig.colors.primary[500]}60`
          }}>
            {formatTime(currentTime)}
          </div>
        </div>
      </header>

      {/* Main content - 2x2 grid with glassmorphism panels */}
      <main className="flex-1 grid grid-cols-2 grid-rows-2 overflow-hidden gap-[1px]" 
            style={{ backgroundColor: themeConfig.colors.neutral[800] }}>
        {/* Top-left: Smart Access Hub */}
        <div className="overflow-hidden backdrop-blur-sm" 
             style={{ 
               backgroundColor: `${themeConfig.colors.neutral[900]}E6`,
               border: `1px solid ${themeConfig.colors.primary[500]}40`,
               boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}20, 0 0 20px ${themeConfig.colors.primary[500]}10`
             }}>
          <div className="h-full p-6 overflow-hidden">
            <SmartHub />
          </div>
        </div>
        
        {/* Top-right: AI Command Center */}
        <div className="overflow-hidden backdrop-blur-sm" 
             style={{ 
               backgroundColor: `${themeConfig.colors.neutral[900]}E6`,
               border: `1px solid ${themeConfig.colors.primary[500]}40`,
               boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}20, 0 0 20px ${themeConfig.colors.primary[500]}10`
             }}>
          <div className="h-full p-6 overflow-hidden">
            <AIChat />
          </div>
        </div>
        
        {/* Bottom-left: Mission Control */}
        <div className="overflow-hidden backdrop-blur-sm" 
             style={{ 
               backgroundColor: `${themeConfig.colors.neutral[900]}E6`,
               border: `1px solid ${themeConfig.colors.primary[500]}40`,
               boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}20, 0 0 20px ${themeConfig.colors.primary[500]}10`
             }}>
          <div className="h-full p-6 overflow-hidden">
            <TaskManager />
          </div>
        </div>
        
        {/* Bottom-right: Productivity Nexus */}
        <div className="overflow-hidden backdrop-blur-sm" 
             style={{ 
               backgroundColor: `${themeConfig.colors.neutral[900]}E6`,
               border: `1px solid ${themeConfig.colors.primary[500]}40`,
               boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}20, 0 0 20px ${themeConfig.colors.primary[500]}10`
             }}>
          <div className="h-full p-6 overflow-hidden">
            <Productivity />
          </div>
        </div>
      </main>

      {/* Footer - increased to 40px height with glassmorphism */}
      <footer className="h-[40px] flex-shrink-0 px-4 border-t flex items-center justify-center backdrop-blur-sm" 
              style={{ 
                backgroundColor: `${themeConfig.colors.neutral[900]}E6`,
                borderColor: `${themeConfig.colors.primary[500]}40`,
                boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}20`
              }}>
        <p className="text-xs" style={{ 
          color: themeConfig.colors.primary[300],
          textShadow: `0 0 8px ${themeConfig.colors.primary[500]}40`
        }}>
          Lucaverse Hub v2.0 • Enhanced Productivity Suite • Modular Architecture
        </p>
      </footer>
    </div>
  );
}