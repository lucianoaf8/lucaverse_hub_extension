import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  User,
  Plus,
  CheckCircle,
  Circle,
  Rss,
  Github,
  Twitter,
  Dribbble,
  BrainCircuit,
  Timer,
  Zap,
  Target,
  Maximize,
  Minimize,
  Book,
  History,
  Edit,
  CloudSun,
  Volume2,
  VolumeX,
  ListTodo,
  Save,
  Moon,
  Sun,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Clock,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/* ---------------------------------- Mock Data --------------------------------- */

const quickTags = [
  { icon: <Github size={16} />, name: 'GitHub', url: 'https://github.com' },
  { icon: <Twitter size={16} />, name: 'Twitter', url: 'https://twitter.com' },
  { icon: <Dribbble size={16} />, name: 'Dribbble', url: 'https://dribbble.com' },
  { icon: <Rss size={16} />, name: 'Blog', url: '#' },
];

const initialTasks = [
  {
    id: 1,
    text: 'Finalize Q3 marketing strategy',
    completed: false,
    priority: 'High',
    dueDate: '2025-07-20',
    subtasks: [
      { id: '1a', text: 'Gather market research data', completed: true },
      { id: '1b', text: 'Draft presentation slides', completed: false },
      { id: '1c', text: 'Review with team lead', completed: false },
    ],
  },
  { id: 2, text: 'Develop AR prototype', completed: false, priority: 'High', dueDate: '2025-07-25', subtasks: [] },
  { id: 3, text: 'Onboard design team', completed: true, priority: 'Medium', dueDate: '2025-07-15', subtasks: [] },
  { id: 4, text: 'Review budget submissions', completed: false, priority: 'Low', dueDate: '2025-07-30', subtasks: [] },
  { id: 5, text: 'Plan September offsite', completed: true, priority: 'Medium', dueDate: '2025-08-01', subtasks: [] },
];

const recentBookmarks = [
  { id: 1, text: 'React Performance Guide', url: '#' },
  { id: 2, text: 'Figma Prototyping', url: '#' },
  { id: 3, text: 'TypeScript Guide', url: '#' },
  { id: 4, text: 'Next.js Documentation', url: '#' },
  { id: 5, text: 'Tailwind CSS Docs', url: '#' },
];

const recentlyClosed = [
  { id: 1, text: 'Linear - Project Planning', url: '#' },
  { id: 2, text: 'Slack Team Chat', url: '#' },
  { id: 3, text: 'Notion Meeting Notes', url: '#' },
  { id: 4, text: 'Gmail Dashboard', url: '#' },
  { id: 5, text: 'Figma Design File', url: '#' },
];

const motivationalQuotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  { text: 'Life is 10% what happens to you and 90% how you react to it.', author: 'Charles R. Swindoll' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
];

const noteTemplates = [
  {
    name: 'Standup',
    icon: '🎯',
    content: `## Daily Standup - ${new Date().toLocaleDateString()}\n\n**Yesterday:**\n- \n\n**Today:**\n- \n\n**Blockers:**\n- `,
  },
  {
    name: 'Meeting',
    icon: '📝',
    content: `## Meeting Notes\n\n**Attendees:**\n- \n\n**Topics:**\n- \n\n**Actions:**\n- [ ] `,
  },
  {
    name: 'Ideas',
    icon: '💡',
    content: `## Brainstorm\n\n**Problem:**\n- \n\n**Ideas:**\n- \n\n**Next Steps:**\n- `,
  },
];

/* ------------------------------- Timer Configs ------------------------------- */

const TIMER_CONFIGS: Record<string, { duration: number; label: string }> = {
  pomodoro: { duration: 25 * 60, label: 'Pomodoro' },
  shortBreak: { duration: 5 * 60, label: 'Break' },
  deepWork: { duration: 90 * 60, label: 'Deep Work' },
  custom: { duration: 30 * 60, label: 'Custom' },
};

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

/* ---------------------------------- Header ---------------------------------- */

interface HeaderProps {
  time: Date;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ time, isDarkMode, toggleDarkMode }) => {
  const { themeConfig } = useTheme();
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  const mockWeather = {
    temperature: 22,
    condition: 'Partly Cloudy',
    location: 'San Francisco',
    icon: <CloudSun size={18} className="text-yellow-400" />,
  };

  return (
    <header className="flex items-center justify-between p-4 text-white h-24 flex-shrink-0 space-x-6">
      {/* Left section: logo + name + search */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BrainCircuit className="text-indigo-400" size={32} />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Lucaverse Hub
            </h1>
            <div
              className={`relative transition-all duration-300 ${searchFocused ? 'w-96' : 'w-80'} flex-shrink-0`}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search everything... (Ctrl+K)"
                className="w-full rounded-full py-1.5 pl-12 pr-4 text-white placeholder-slate-400 focus:outline-none transition-all"
                style={{
                  backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity.glass.medium}`,
                  border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity.border.medium}`,
                  boxShadow: `inset 0 1px 2px 0 ${themeConfig.colors.neutral[950]}${themeConfig.opacity.border.light}`,
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>
        </div>
        <div className="text-center">
          {quote.text && (
            <p className="text-sm text-slate-400 italic max-w-lg ml-20">
              "{quote.text}" <span className="text-slate-500">— {quote.author}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-5">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity.glass.low}` }}
          >
            {mockWeather.icon}
            <div className="text-sm">
              <div className="font-semibold">{mockWeather.temperature}°C</div>
              <div className="text-slate-400 text-xs">{mockWeather.condition}</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors relative">
            <Bell size={18} />
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
          </button>
          <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};


/* ------------------------------- Panel Components (stubs) ------------------------------- */

const QuickAccessCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => (
  <GlowCard className={`p-4 ${className}`} {...props}>
    <h2 className="text-lg font-bold text-slate-200 mb-2">Quick Access</h2>
    <p className="text-slate-400 text-sm">Panel content coming soon...</p>
  </GlowCard>
);

const MissionControlCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => (
  <GlowCard className={`p-4 ${className}`} {...props}>
    <h2 className="text-lg font-bold text-slate-200 mb-2">Mission Control</h2>
    <p className="text-slate-400 text-sm">Panel content coming soon...</p>
  </GlowCard>
);

const FocusHubCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => (
  <GlowCard className={`p-4 ${className}`} {...props}>
    <h2 className="text-lg font-bold text-slate-200 mb-2">Focus Hub</h2>
    <p className="text-slate-400 text-sm">Panel content coming soon...</p>
  </GlowCard>
);

const NotesCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => (
  <GlowCard className={`p-4 ${className}`} {...props}>
    <h2 className="text-lg font-bold text-slate-200 mb-2">Smart Notes</h2>
    <p className="text-slate-400 text-sm">Panel content coming soon...</p>
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

  const [time, setTime] = useState(new Date());
  const [focusedPanel, setFocusedPanel] = useState<string | null>(null);

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

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
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-slate-700/10 via-slate-800/5 to-slate-900/10" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-slate-800/10 via-slate-900/5 to-slate-700/10" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <Header time={time} isDarkMode={isDarkMode} toggleDarkMode={toggleTheme} />

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
