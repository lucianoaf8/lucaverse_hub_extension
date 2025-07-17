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
  const [clickEffect, setClickEffect] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const { themeConfig } = useTheme();

  // Dynamic time-based gradient animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    setClickEffect(true);
    setTimeout(() => setClickEffect(false), 600);
    
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '4px';
    ripple.style.height = '4px';
    ripple.style.borderRadius = '50%';
    ripple.style.background = `radial-gradient(circle, ${themeConfig.colors.primary[400]}80, transparent)`;
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '30';
    
    e.currentTarget.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const timeOffset = (currentTime * 0.0005) % (Math.PI * 2); // Slower animation
  const primaryGlow = Math.sin(timeOffset) * 0.1 + 0.3; // Much subtler glow
  const secondaryGlow = Math.cos(timeOffset * 1.3) * 0.05 + 0.25;

  return (
    <div
      className={`group relative overflow-hidden backdrop-blur-xl rounded-xl shadow-xl h-full transform transition-all duration-300 hover:scale-[1.01] ${className} ${clickEffect ? 'scale-[0.99]' : ''}`}
      style={{
        backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity.glass.medium}`,
        border: `1px solid ${themeConfig.colors.primary[500]}${Math.floor(primaryGlow * 120).toString(16).padStart(2, '0')}`,
        boxShadow: `
          0 4px 16px rgba(0, 0, 0, 0.2),
          ${isHovered ? `0 0 20px ${themeConfig.colors.primary[500]}${Math.floor(primaryGlow * 25).toString(16).padStart(2, '0')}` : ''}
        `,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Subtle glass effect */}
      <div
        className="absolute inset-0 opacity-20 transition-opacity duration-300"
        style={{
          background: `
            linear-gradient(135deg, 
              ${themeConfig.colors.primary[900]}${Math.floor(primaryGlow * 20).toString(16).padStart(2, '0')} 0%,
              ${themeConfig.colors.secondary[900]}${Math.floor(secondaryGlow * 15).toString(16).padStart(2, '0')} 50%,
              ${themeConfig.colors.neutral[900]}${Math.floor(primaryGlow * 25).toString(16).padStart(2, '0')} 100%
            )
          `,
        }}
      />

      {/* Subtle energy field effect on hover only */}
      {isHovered && (
        <div
          className="absolute inset-0 opacity-10 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, 
              ${themeConfig.colors.primary[400]}20 0%,
              ${themeConfig.colors.secondary[400]}10 40%,
              transparent 70%
            )`,
          }}
        />
      )}

      {/* Subtle top highlight */}
      <div 
        className="absolute top-0 left-0 h-px w-full opacity-50"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%,
            ${themeConfig.colors.primary[400]}${Math.floor(primaryGlow * 60).toString(16).padStart(2, '0')} 20%,
            ${themeConfig.colors.secondary[400]}${Math.floor(secondaryGlow * 80).toString(16).padStart(2, '0')} 50%,
            ${themeConfig.colors.primary[400]}${Math.floor(primaryGlow * 60).toString(16).padStart(2, '0')} 80%,
            transparent 100%
          )`,
        }}
      />

      {/* Reduced floating particles - only on hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full animate-ping"
              style={{
                left: `${30 + i * 20}%`,
                top: `${20 + (i % 2) * 40}%`,
                backgroundColor: themeConfig.colors.primary[400],
                animationDelay: `${i * 1}s`,
                animationDuration: '4s',
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      )}

      {onToggleFocus && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFocus(panelId!);
          }}
          className="absolute top-3 right-3 z-30 p-2 rounded-lg transition-all duration-300 hover:scale-110"
          style={{
            color: themeConfig.colors.neutral[400],
            backgroundColor: `${themeConfig.colors.neutral[800]}80`,
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = themeConfig.colors.neutral[100];
            e.currentTarget.style.backgroundColor = `${themeConfig.colors.primary[600]}60`;
            e.currentTarget.style.boxShadow = `0 0 20px ${themeConfig.colors.primary[500]}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = themeConfig.colors.neutral[400];
            e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}80`;
            e.currentTarget.style.boxShadow = 'none';
          }}
          title={isFocused ? 'Exit focus mode' : 'Enter focus mode'}
        >
          {isFocused ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      )}

      <div className="relative z-20 h-full">{children}</div>
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
        
        /* Enhanced scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(45, 55, 72, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, ${themeConfig.colors.primary[500]}, ${themeConfig.colors.secondary[500]});
          border-radius: 10px;
          box-shadow: 0 0 10px ${themeConfig.colors.primary[500]}40;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, ${themeConfig.colors.primary[400]}, ${themeConfig.colors.secondary[400]});
          box-shadow: 0 0 15px ${themeConfig.colors.primary[400]}60;
        }
        
        /* Ripple animation */
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(40);
            opacity: 0;
          }
        }
        
        /* Floating animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
          75% { transform: translateY(-15px) rotate(0.5deg); }
        }
        
        /* Glow pulse animation */
        @keyframes glowPulse {
          0%, 100% { 
            box-shadow: 0 0 5px ${themeConfig.colors.primary[500]}40,
                        0 0 20px ${themeConfig.colors.primary[500]}20,
                        0 0 35px ${themeConfig.colors.primary[500]}10;
          }
          50% { 
            box-shadow: 0 0 10px ${themeConfig.colors.primary[400]}60,
                        0 0 30px ${themeConfig.colors.primary[400]}40,
                        0 0 50px ${themeConfig.colors.primary[400]}20;
          }
        }
        
        /* Holographic shimmer */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Particle drift */
        @keyframes particleDrift {
          0% { 
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translate(100px, -100px) rotate(180deg);
            opacity: 0;
          }
        }
        
        /* Energy field animation */
        @keyframes energyField {
          0%, 100% { 
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
          50% { 
            background-position: 100% 50%;
            filter: hue-rotate(90deg);
          }
        }
        
        /* Subtle dynamic background */
        .dynamic-bg {
          animation: energyField 20s ease-in-out infinite;
          background-size: 200% 200%;
        }
        
        /* Slow floating particles */
        .floating-particle {
          animation: particleDrift 16s linear infinite;
        }
        
        /* Subtle hover glow effect */
        .hover-glow:hover {
          animation: glowPulse 3s ease-in-out infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Subtle audio visualization bars */
        @keyframes audioBar {
          0%, 100% { height: 1px; }
          50% { height: 6px; }
        }
        
        .audio-bar {
          animation: audioBar 1s ease-in-out infinite;
        }
        
        /* Subtle haptic feedback simulation */
        @keyframes hapticPulse {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.02) rotate(0.2deg); }
          50% { transform: scale(0.99) rotate(-0.2deg); }
          75% { transform: scale(1.01) rotate(0.1deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        .haptic-feedback {
          animation: hapticPulse 0.3s ease-out;
        }
      `}</style>

      {/* Minimal Background with Subtle Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Very subtle background layers */}
        <div 
          className="absolute -top-1/2 -left-1/2 w-full h-full"
          style={{
            background: `
              linear-gradient(135deg, 
                ${themeConfig.colors.primary[900]}05 0%, 
                ${themeConfig.colors.primary[800]}03 30%,
                ${themeConfig.colors.secondary[900]}04 60%,
                ${themeConfig.colors.neutral[900]}02 100%
              )
            `
          }}
        />
        
        <div 
          className="absolute -bottom-1/2 -right-1/2 w-full h-full"
          style={{
            background: `
              linear-gradient(-45deg, 
                ${themeConfig.colors.secondary[900]}04 0%, 
                ${themeConfig.colors.primary[900]}02 40%,
                ${themeConfig.colors.neutral[950]}01 100%
              )
            `
          }}
        />

        {/* Ultra minimal floating shapes */}
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="absolute floating-particle opacity-5"
            style={{
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              background: `linear-gradient(45deg, ${themeConfig.colors.primary[400]}, ${themeConfig.colors.secondary[400]})`,
              borderRadius: '50%',
              animationDelay: `${i * 4000}ms`,
              animationDuration: `${20000 + Math.random() * 10000}ms`,
              filter: 'blur(1px)',
            }}
          />
        ))}

        {/* Nearly invisible grid overlay */}
        <div 
          className="absolute inset-0 opacity-1"
          style={{
            backgroundImage: `
              linear-gradient(${themeConfig.colors.primary[400]}10 1px, transparent 1px),
              linear-gradient(90deg, ${themeConfig.colors.primary[400]}10 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Ultra subtle audio bars */}
        <div className="absolute bottom-4 left-4 flex gap-1 opacity-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="audio-bar w-0.5 bg-gradient-to-t rounded-full"
              style={{
                background: `linear-gradient(to top, ${themeConfig.colors.primary[500]}, ${themeConfig.colors.secondary[400]})`,
                animationDelay: `${i * 400}ms`,
                animationDuration: `${2000 + Math.random() * 1000}ms`
              }}
            />
          ))}
        </div>
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