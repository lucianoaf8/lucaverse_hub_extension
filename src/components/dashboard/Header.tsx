import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Settings, CloudSun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { themeConfig } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => ({
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  });

  const { time, date } = formatDateTime(currentDateTime);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="backdrop-blur-md border-b px-6 py-4" 
            style={{ 
              backgroundColor: `${themeConfig.colors.neutral[900]}99`,
              borderColor: `${themeConfig.colors.neutral[700]}80`
            }}>
      <div className="flex items-center justify-between">
        {/* Left: Logo + Search */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500"></div>
            <span className="text-xl font-medium text-white">Lucaverse</span>
          </div>
        
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                   style={{ color: themeConfig.colors.neutral[400] }} />
            <input 
              type="text" 
              placeholder="Search everything..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-80 px-10 py-2 rounded-xl border text-white placeholder-opacity-70 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: `${themeConfig.colors.neutral[800]}80`,
                borderColor: `${themeConfig.colors.neutral[600]}80`,
                color: themeConfig.colors.neutral[100]
              }}
            />
          </div>
        </div>

        {/* Center: Motivational Phrase */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <p className="text-teal-300 font-medium text-sm tracking-wide">
            ✨ Turn Ideas Into Impact
          </p>
        </div>

        {/* Right: Weather + Time + Actions */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2" style={{ color: themeConfig.colors.neutral[300] }}>
            <CloudSun className="w-4 h-4" />
            <span className="text-sm">22°C</span>
          </div>

          <div className="flex flex-col items-end" style={{ color: themeConfig.colors.neutral[300] }}>
            <span className="text-sm font-medium">{time}</span>
            <span className="text-xs" style={{ color: themeConfig.colors.neutral[400] }}>{date}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-opacity-70"
                    style={{ backgroundColor: `${themeConfig.colors.neutral[800]}80` }}>
              <Bell className="w-4 h-4" style={{ color: themeConfig.colors.neutral[300] }} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">2</span>
              </div>
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-opacity-70"
                    style={{ backgroundColor: `${themeConfig.colors.neutral[800]}80` }}>
              <User className="w-4 h-4" style={{ color: themeConfig.colors.neutral[300] }} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-opacity-70"
                    style={{ backgroundColor: `${themeConfig.colors.neutral[800]}80` }}>
              <Settings className="w-4 h-4" style={{ color: themeConfig.colors.neutral[300] }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}