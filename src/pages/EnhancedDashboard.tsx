import React, { useState, useEffect } from 'react';
import {
  Maximize,
  Minimize,
  Edit,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/dashboard/Header';
import { SmartHub, TaskManager, Productivity } from '../components/dashboard';


/* ----------------------------- Shared UI Pieces ----------------------------- */

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  panelId?: string;
  onToggleFocus?: (id: string) => void;
  isFocused?: boolean;
}

const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', panelId, onToggleFocus, isFocused = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { themeConfig } = useTheme();

  return (
    <div
      className={`relative overflow-hidden backdrop-blur-xl rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl h-full ${className}`}
      style={{
        backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity.glass.medium}`,
        border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity.border.medium}`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-700/20 to-slate-800/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'}`}
      />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {onToggleFocus && (
        <button
          onClick={() => onToggleFocus(panelId!)}
          className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors z-20 p-1 rounded-lg hover:bg-slate-700/50"
          title={isFocused ? 'Exit focus mode' : 'Enter focus mode'}
        >
          {isFocused ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      )}

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

/* ------------------------------- Panel Components (stubs) ------------------------------- */

const QuickAccessCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => (
  <GlowCard className={`p-4 ${className}`} {...props}>
    <SmartHub />
  </GlowCard>
);

const MissionControlCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => (
  <GlowCard className={`p-4 ${className}`} {...props}>
    <TaskManager />
  </GlowCard>
);

const FocusHubCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => (
  <GlowCard className={`p-4 ${className}`} {...props}>
    <Productivity />
  </GlowCard>
);

const NotesCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => (
  <GlowCard className={`p-4 ${className}`} {...props}>
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
        <Edit size={16} className="text-indigo-400" />
        Smart Notes
      </h2>
      <div className="flex-1 space-y-4">
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-slate-300 mb-2">Quick Note</h3>
          <textarea 
            className="w-full h-24 bg-slate-900/50 border border-slate-600 rounded p-3 text-slate-200 resize-none focus:outline-none focus:border-indigo-500"
            placeholder="Jot down your thoughts..."
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-300 text-sm">Recent Notes</h3>
          {['Meeting notes from today', 'Project ideas', 'Research findings'].map((note, i) => (
            <div key={i} className="p-2 bg-slate-800/30 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
              <span className="text-slate-400 text-sm">{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </GlowCard>
);

const Footer = () => (
  <footer className="flex items-center justify-between p-2 text-slate-400 h-12 flex-shrink-0 border-t border-slate-700/50">
    <span className="text-xs">Lucaverse Hub © {new Date().getFullYear()}</span>
  </footer>
);

/* ----------------------------- Dashboard Page -------------------------------- */

export default function Dashboard() {
  const { theme, toggleTheme, themeConfig } = useTheme();
  const isDarkMode = theme === 'dark';

  const [focusedPanel, setFocusedPanel] = useState<string | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            break;
          case 'q':
            e.preventDefault();
            setFocusedPanel((prev) => (prev === 'quickAccess' ? null : 'quickAccess'));
            break;
          case 'm':
            e.preventDefault();
            setFocusedPanel((prev) => (prev === 'missionControl' ? null : 'missionControl'));
            break;
          case 'f':
            e.preventDefault();
            setFocusedPanel((prev) => (prev === 'focusHub' ? null : 'focusHub'));
            break;
          case 'n':
            e.preventDefault();
            setFocusedPanel((prev) => (prev === 'notes' ? null : 'notes'));
            break;
        }
      }

      if (e.key === 'Escape' && focusedPanel) {
        setFocusedPanel(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusedPanel]);

  const handleToggleFocus = (panelId: string) => {
    setFocusedPanel((prev) => (prev === panelId ? null : panelId));
  };

  const panels: Record<string, React.ReactNode> = {
    quickAccess: <QuickAccessCard onToggleFocus={handleToggleFocus} panelId="quickAccess" isFocused={focusedPanel === 'quickAccess'} />,
    missionControl: <MissionControlCard onToggleFocus={handleToggleFocus} panelId="missionControl" isFocused={focusedPanel === 'missionControl'} />,
    focusHub: <FocusHubCard onToggleFocus={handleToggleFocus} panelId="focusHub" isFocused={focusedPanel === 'focusHub'} />,
    notes: <NotesCard onToggleFocus={handleToggleFocus} panelId="notes" isFocused={focusedPanel === 'notes'} />,
  };

  return (
    <div
      className="min-h-screen text-white font-sans flex flex-col overflow-hidden"
      style={{ backgroundColor: themeConfig.colors.neutral[950] }}
    >
      {/* Custom global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(45, 55, 72, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.8);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-1/2 -left-1/2 w-full h-full"
          style={{
            background: `linear-gradient(135deg, ${themeConfig.colors.primary[900]}20 0%, ${themeConfig.colors.primary[800]}10 50%, ${themeConfig.colors.neutral[900]}10 100%)`
          }}
        />
        <div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full"
          style={{
            background: `linear-gradient(-45deg, ${themeConfig.colors.secondary[900]}15 0%, ${themeConfig.colors.primary[900]}08 50%, ${themeConfig.colors.neutral[950]}05 100%)`
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleTheme} />

        {/* Main Grid */}
        <main
          className={`flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 pt-0 transition-all duration-500 min-h-0 ${
            focusedPanel ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="col-span-1 row-span-1">
            <QuickAccessCard onToggleFocus={handleToggleFocus} panelId="quickAccess" />
          </div>
          <div className="col-span-1 row-span-1">
            <MissionControlCard onToggleFocus={handleToggleFocus} panelId="missionControl" />
          </div>
          <div className="col-span-1 row-span-1">
            <FocusHubCard onToggleFocus={handleToggleFocus} panelId="focusHub" />
          </div>
          <div className="col-span-1 row-span-1">
            <NotesCard onToggleFocus={handleToggleFocus} panelId="notes" />
          </div>
        </main>

        <Footer />
      </div>

      {/* Focus Overlay */}
      {focusedPanel && (
        <div
            className="fixed inset-0 z-40 p-6 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: `${themeConfig.colors.neutral[950]}CC` }}
          >
          <div className="w-full h-full max-w-4xl max-h-4xl">{panels[focusedPanel]}</div>
        </div>
      )}
    </div>
  );
}