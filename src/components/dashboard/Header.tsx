import React, { useState, useEffect } from 'react';
import { Search, Bell, User, CloudSun, Sun, Moon, BrainCircuit, Settings, X  } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const motivationalQuotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
  { text: 'Life is 10% what happens to you and 90% how you react to it.', author: 'Charles R. Swindoll' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
];

interface HeaderProps {
  onSearch?: (query: string) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export default function Header({ onSearch, isDarkMode, toggleDarkMode }: HeaderProps) {
  const { themeConfig } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState('🤔');
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isClockHovered, setIsClockHovered] = useState(false);

  const moodEmojis = ['🤔', '😐', '😊', '😎', '🥱', '😴', '😤', '🙄', '😌', '🤗', '😑', '🔥', '💀', '👻', '🤖', '⚡', '🌟', '💎', '🎯', '🚀', '⭐', '✨'];

  const mockNotifications = [
    { id: 1, title: 'New task assigned', message: 'John assigned you a new task: Update dashboard UI', time: '5 min ago', read: false },
    { id: 2, title: 'Meeting reminder', message: 'Team standup in 30 minutes', time: '25 min ago', read: false },
    { id: 3, title: 'Task completed', message: 'Sarah completed the design review', time: '1 hour ago', read: true },
    { id: 4, title: 'New comment', message: 'Alex commented on your pull request', time: '2 hours ago', read: true },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Set quote only once on mount
  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  // Handle click outside for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showEmojiSelector && !target.closest('.emoji-selector')) {
        setShowEmojiSelector(false);
      }
      if (showNotifications && !target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
      if (showAccountMenu && !target.closest('.account-dropdown')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showEmojiSelector, showNotifications, showAccountMenu]);

  const formatDateTime = (date: Date) => ({
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: isClockHovered ? '2-digit' : undefined,
      hour12: true 
    }),
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  });

  const { time, date } = formatDateTime(currentDateTime);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="flex items-center justify-between p-4 text-white h-24 flex-shrink-0 space-x-6">
      {/* Left section: logo + name + search */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BrainCircuit style={{ color: themeConfig.colors.primary[400] }} size={32} />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse" 
                 style={{ backgroundColor: themeConfig.colors.success[400] }} />
          </div>
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${themeConfig.colors.primary[400]}, ${themeConfig.colors.secondary[400]})` 
                }}>
              Lucaverse Hub
            </h1>
            <div className="relative transition-all duration-300 w-80 flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" 
                      style={{ color: themeConfig.colors.neutral[400] }} size={18} />
              <input
                type="text"
                placeholder="Search everything... (Ctrl+K)"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full rounded-full py-1.5 pl-12 pr-4 focus:outline-none transition-all"
                style={{
                  backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity?.glass?.medium || '80'}`,
                  border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity?.border?.medium || '80'}`,
                  boxShadow: `inset 0 1px 2px 0 ${themeConfig.colors.neutral[950]}${themeConfig.opacity?.border?.light || '40'}`,
                  color: themeConfig.colors.neutral[100],
                }}
              />
            </div>
          </div>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center max-w-2xl">
          {quote.text && (
            <div>
              <p className="text-sm italic mt-2"
                 style={{ color: themeConfig.colors.neutral[400] }}>
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-xs -mt-3"
                 style={{ color: themeConfig.colors.neutral[500] }}>
                — {quote.author}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="relative emoji-selector">
            <button
              onClick={() => setShowEmojiSelector(!showEmojiSelector)}
              className="hover:scale-110 transition-transform cursor-pointer"
              style={{ fontSize: '2rem', margin: '0 3rem' }}
              title="Change mood"
            >
              {selectedMoodEmoji}
            </button>
            {showEmojiSelector && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 p-4 rounded-xl shadow-2xl z-50 grid grid-cols-6 gap-3 min-w-max backdrop-blur-xl border"
                   style={{
                     backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity?.glass?.high || 'CC'}`,
                     border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity?.border?.medium || '80'}`,
                     backdropFilter: 'blur(16px)',
                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                   }}>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 border-l border-t"
                     style={{
                       backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity?.glass?.high || 'CC'}`,
                       borderColor: `${themeConfig.colors.primary[500]}${themeConfig.opacity?.border?.medium || '80'}`
                     }}
                />
                {moodEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setSelectedMoodEmoji(emoji);
                      setShowEmojiSelector(false);
                    }}
                    className="text-2xl hover:scale-125 transition-all duration-200 p-2 rounded-lg hover:shadow-lg"
                    style={{
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}80`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title={`Select ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div 
            className="text-center cursor-pointer"
            onMouseEnter={() => setIsClockHovered(true)}
            onMouseLeave={() => setIsClockHovered(false)}
          >
            <div className="tracking-tighter bg-clip-text text-transparent"
                 style={{ 
                   fontSize: '1.2rem',
                   backgroundImage: `linear-gradient(to right, ${themeConfig.colors.primary[500]}, ${themeConfig.colors.secondary[500]})` 
                 }}>
              {time}
            </div>
            <div className="text-xs font-medium"
                 style={{ color: themeConfig.colors.neutral[400] }}>
              {date}
            </div>
          </div>

          <div className="flex flex-col items-center rounded-lg px-4 py-1.5">
            <div className="flex items-center gap-2">
              <CloudSun size={24} style={{ color: themeConfig.colors.warning[400] }} />
              <span className="font-semibold text-lg" style={{ color: themeConfig.colors.neutral[100] }}>22°C</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: themeConfig.colors.neutral[400] }}>Partly Cloudy</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {toggleDarkMode && (
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: themeConfig.colors.neutral[400],
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeConfig.colors.neutral[100];
                e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = themeConfig.colors.neutral[400];
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          <div className="relative notifications-dropdown">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg transition-colors relative"
              style={{
                color: themeConfig.colors.neutral[400],
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeConfig.colors.neutral[100];
                e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = themeConfig.colors.neutral[400];
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Bell size={18} />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full" 
                   style={{ backgroundColor: themeConfig.colors.danger[400] }} />
            </button>
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-xl shadow-2xl z-50 backdrop-blur-xl border max-h-96 overflow-y-auto"
                   style={{
                     backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity?.glass?.high || 'CC'}`,
                     border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity?.border?.medium || '80'}`,
                     backdropFilter: 'blur(16px)',
                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                   }}>
                <div className="p-4 border-b" style={{ borderColor: themeConfig.colors.neutral[700] }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold" style={{ color: themeConfig.colors.neutral[200] }}>Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{ color: themeConfig.colors.neutral[400] }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = themeConfig.colors.neutral[100];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = themeConfig.colors.neutral[400];
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b transition-colors"
                      style={{
                        borderColor: `${themeConfig.colors.neutral[700]}80`,
                        backgroundColor: !notification.read ? `${themeConfig.colors.neutral[800]}80` : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = !notification.read ? `${themeConfig.colors.neutral[800]}80` : 'transparent';
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2"
                             style={{
                               backgroundColor: notification.read ? themeConfig.colors.neutral[600] : themeConfig.colors.primary[400]
                             }} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm" style={{ color: themeConfig.colors.neutral[200] }}>{notification.title}</h4>
                          <p className="text-xs mt-1" style={{ color: themeConfig.colors.neutral[400] }}>{notification.message}</p>
                          <span className="text-xs mt-2 block" style={{ color: themeConfig.colors.neutral[500] }}>{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t" style={{ borderColor: themeConfig.colors.neutral[700] }}>
                  <button className="w-full text-center text-sm transition-colors"
                          style={{ color: themeConfig.colors.neutral[400] }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = themeConfig.colors.neutral[100];
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = themeConfig.colors.neutral[400];
                          }}>
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative account-dropdown">
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: themeConfig.colors.neutral[400],
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = themeConfig.colors.neutral[100];
                e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = themeConfig.colors.neutral[400];
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <User size={18} />
            </button>
            {showAccountMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl z-50 backdrop-blur-xl border"
                   style={{
                     backgroundColor: `${themeConfig.colors.neutral[800]}${themeConfig.opacity?.glass?.high || 'CC'}`,
                     border: `1px solid ${themeConfig.colors.primary[500]}${themeConfig.opacity?.border?.medium || '80'}`,
                     backdropFilter: 'blur(16px)',
                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                   }}>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                          style={{ color: themeConfig.colors.neutral[200], backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}80`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center"
                         style={{
                           backgroundImage: `linear-gradient(to right, ${themeConfig.colors.primary[400]}, ${themeConfig.colors.secondary[400]})`
                         }}>
                      <span className="text-xs font-bold" style={{ color: themeConfig.colors.neutral[100] }}>U</span>
                    </div>
                    <span className="text-sm">Account</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                          style={{ color: themeConfig.colors.neutral[200], backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}80`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}>
                    <Settings size={16} style={{ color: themeConfig.colors.neutral[400] }} />
                    <span className="text-sm">Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}