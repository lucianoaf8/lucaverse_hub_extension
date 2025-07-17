import React, { useState, useEffect } from 'react';
import {
  Maximize,
  Minimize,
  Edit,
  Save,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/dashboard/Header';
import Footer from '../components/dashboard/Footer';
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

const NotesCard: React.FC<GlowCardProps> = ({ className = '', ...props }) => {
  const { themeConfig } = useTheme();
  const [noteContent, setNoteContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [historicalNotes, setHistoricalNotes] = useState<any[]>([]);

  const noteTemplates = [
    { name: 'Meeting', icon: '📝', content: '# Meeting Notes\n\n## Date: \n## Attendees:\n\n## Agenda:\n\n## Notes:\n\n## Action Items:\n' },
    { name: 'Idea', icon: '💡', content: '# New Idea\n\n## Concept:\n\n## Benefits:\n\n## Next Steps:\n' },
    { name: 'Task', icon: '✅', content: '# Task List\n\n- [ ] \n- [ ] \n- [ ] \n' },
    { name: 'Journal', icon: '📔', content: '# Daily Journal\n\n## Date: \n\n## Thoughts:\n\n## Mood:\n\n## Goals for tomorrow:\n' }
  ];

  const handleTemplateClick = (template: any) => {
    setNoteContent(template.content);
    setSelectedTemplate(template);
  };

  const handleSaveNote = () => {
    if (noteContent.trim() === '') return;

    const newNote = {
      id: Date.now(),
      title: noteContent.split('\n')[0].replace(/^#+\s*/, '') || `Note ${new Date().toLocaleTimeString()}`,
      content: noteContent,
      date: new Date().toISOString(),
    };

    setHistoricalNotes(prev => [newNote, ...prev.slice(0, 4)]);
    setNoteContent('');
    setSelectedTemplate(null);
  };

  return (
    <GlowCard className={`p-4 ${className}`} {...props}>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: themeConfig.colors.neutral[200] }}>
            <Edit size={16} style={{ color: themeConfig.colors.success[400] }} /> 
            Smart Notes
          </h2>
        </div>

        {/* Template Selector and Save Button */}
        <div className="flex justify-between items-center gap-3 mb-3">
          <div className="flex gap-1">
            {noteTemplates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleTemplateClick(template)}
                className="flex items-center gap-1 text-xs rounded px-2 py-1 transition-all"
                style={{
                  backgroundColor: selectedTemplate?.name === template.name
                    ? `${themeConfig.colors.success[600]}20`
                    : `${themeConfig.colors.neutral[700]}50`,
                  color: selectedTemplate?.name === template.name
                    ? themeConfig.colors.success[300]
                    : themeConfig.colors.neutral[300]
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate?.name !== template.name) {
                    e.currentTarget.style.backgroundColor = themeConfig.colors.neutral[700];
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate?.name !== template.name) {
                    e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}50`;
                  }
                }}
              >
                <span className="text-xs">{template.icon}</span>
                {template.name}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleSaveNote}
            disabled={noteContent.trim() === ''}
            className="flex items-center gap-1 text-xs font-semibold py-1 px-3 rounded-lg transition-all border"
            style={{
              backgroundColor: noteContent.trim() === '' 
                ? `${themeConfig.colors.neutral[700]}30` 
                : `${themeConfig.colors.success[600]}20`,
              color: noteContent.trim() === '' 
                ? themeConfig.colors.neutral[500] 
                : themeConfig.colors.success[300],
              borderColor: noteContent.trim() === '' 
                ? `${themeConfig.colors.neutral[600]}30` 
                : `${themeConfig.colors.success[500]}30`,
              cursor: noteContent.trim() === '' ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (noteContent.trim() !== '') {
                e.currentTarget.style.backgroundColor = `${themeConfig.colors.success[600]}30`;
              }
            }}
            onMouseLeave={(e) => {
              if (noteContent.trim() !== '') {
                e.currentTarget.style.backgroundColor = `${themeConfig.colors.success[600]}20`;
              }
            }}
          >
            <Save size={12} /> Save
          </button>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-grow flex gap-4 min-h-0">
          {/* Left Side - Note Editor */}
          <div className="flex-1 flex flex-col">
            <textarea
              placeholder="Start writing your thoughts..."
              className="w-full rounded-lg p-3 transition-all resize-none custom-scrollbar text-sm flex-grow focus:outline-none focus:ring-1"
              style={{
                backgroundColor: `${themeConfig.colors.neutral[900]}70`,
                border: `1px solid ${themeConfig.colors.neutral[700]}50`,
                color: themeConfig.colors.neutral[300],
                focusRingColor: themeConfig.colors.success[500]
              }}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
          </div>

          {/* Right Side - Historical Notes */}
          <div className="w-32 flex flex-col">
            <h3 className="font-semibold text-xs mb-2" style={{ color: themeConfig.colors.neutral[400] }}>Recent</h3>
            {historicalNotes.length === 0 ? (
              <div className="flex-1 flex items-center justify-center" style={{ color: themeConfig.colors.neutral[500] }}>
                <div className="text-center">
                  <Edit size={16} className="mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No notes</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 overflow-y-auto flex-1 custom-scrollbar">
                {historicalNotes.map(note => (
                  <div
                    key={note.id}
                    onClick={() => setNoteContent(note.content)}
                    className="p-2 rounded cursor-pointer group transition-all border"
                    style={{
                      backgroundColor: `${themeConfig.colors.neutral[900]}50`,
                      borderColor: `${themeConfig.colors.neutral[700]}30`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}70`;
                      e.currentTarget.style.borderColor = `${themeConfig.colors.neutral[600]}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[900]}50`;
                      e.currentTarget.style.borderColor = `${themeConfig.colors.neutral[700]}30`;
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: themeConfig.colors.neutral[400] }}>
                      {new Date(note.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs" style={{ color: themeConfig.colors.neutral[500] }}>
                      {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GlowCard>
  );
};


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