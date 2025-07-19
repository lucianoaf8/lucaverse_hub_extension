import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Header, Footer } from '../components/dashboard';
import SmartHub from '../components/dashboard/SmartHub';
import AIChat from '../components/dashboard/AIChat';
import TaskManager from '../components/dashboard/TaskManager';
import Productivity from '../components/dashboard/Productivity';

export default function Dashboard() {
  const { themeConfig } = useTheme();

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // TODO: Implement search functionality
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden" 
         style={{ backgroundColor: themeConfig.colors.neutral[950] }}>
      
      {/* Header Component */}
      <Header onSearch={handleSearch} />

      {/* Main content - 2x2 grid with glassmorphism panels */}
      <main className="flex-1 grid grid-cols-2 grid-rows-2 overflow-hidden gap-[1px]" 
            style={{ backgroundColor: themeConfig.colors.neutral[800] }}>
        
        {/* Top-left: Smart Access Hub */}
        <div className="overflow-hidden backdrop-blur-sm" 
             style={{ 
               backgroundColor: `${themeConfig.colors.neutral[900]}${themeConfig.opacity.glass.high}`,
               border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity.border.medium}`,
               boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}${themeConfig.opacity.glow.subtle}, 0 0 20px ${themeConfig.colors.primary[500]}10`
             }}>
          <div className="h-full p-6 overflow-hidden">
            <SmartHub />
          </div>
        </div>
        
        {/* Top-right: AI Command Center */}
        <div className="overflow-hidden backdrop-blur-sm" 
             style={{ 
               backgroundColor: `${themeConfig.colors.neutral[900]}${themeConfig.opacity.glass.high}`,
               border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity.border.medium}`,
               boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}${themeConfig.opacity.glow.subtle}, 0 0 20px ${themeConfig.colors.primary[500]}10`
             }}>
          <div className="h-full p-6 overflow-hidden">
            <AIChat />
          </div>
        </div>
        
        {/* Bottom-left: Mission Control */}
        <div className="overflow-hidden backdrop-blur-sm" 
             style={{ 
               backgroundColor: `${themeConfig.colors.neutral[900]}${themeConfig.opacity.glass.high}`,
               border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity.border.medium}`,
               boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}${themeConfig.opacity.glow.subtle}, 0 0 20px ${themeConfig.colors.primary[500]}10`
             }}>
          <div className="h-full p-6 overflow-hidden">
            <TaskManager />
          </div>
        </div>
        
        {/* Bottom-right: Productivity Nexus */}
        <div className="overflow-hidden backdrop-blur-sm" 
             style={{ 
               backgroundColor: `${themeConfig.colors.neutral[900]}${themeConfig.opacity.glass.high}`,
               border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity.border.medium}`,
               boxShadow: `inset 0 1px 0 ${themeConfig.colors.primary[500]}${themeConfig.opacity.glow.subtle}, 0 0 20px ${themeConfig.colors.primary[500]}10`
             }}>
          <div className="h-full p-6 overflow-hidden">
            <Productivity />
          </div>
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}