import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Zap, Github, Twitter, Dribbble, Rss, History, Book } from 'lucide-react';

export default function SmartHub() {
  const { themeConfig } = useTheme();
  
  const quickTags = [
    { icon: <Github size={16} />, name: 'GitHub', url: 'https://github.com' },
    { icon: <Twitter size={16} />, name: 'Twitter', url: 'https://twitter.com' },
    { icon: <Dribbble size={16} />, name: 'Dribbble', url: 'https://dribbble.com' },
    { icon: <Rss size={16} />, name: 'Blog', url: '#' },
    { icon: <Github size={16} />, name: 'Gmail', url: 'https://gmail.com' },
    { icon: <Twitter size={16} />, name: 'Slack', url: 'https://slack.com' },
    { icon: <Dribbble size={16} />, name: 'Figma', url: 'https://figma.com' },
    { icon: <Rss size={16} />, name: 'Linear', url: 'https://linear.app' },
    { icon: <Github size={16} />, name: 'Notion', url: 'https://notion.so' },
    { icon: <Twitter size={16} />, name: 'Discord', url: 'https://discord.com' }
  ];

  const recentBookmarks = [
    { id: 1, text: 'React Performance Guide', url: '#' },
    { id: 2, text: 'Figma Prototyping', url: '#' },
    { id: 3, text: 'TypeScript Guide', url: '#' },
    { id: 4, text: 'Next.js Documentation', url: '#' },
    { id: 5, text: 'Tailwind CSS Docs', url: '#' },
    { id: 6, text: 'Vue.js Documentation', url: '#' },
  ];

  const recentlyClosed = [
    { id: 1, text: 'Linear - Project Planning', url: '#' },
    { id: 2, text: 'Slack Team Chat', url: '#' },
    { id: 3, text: 'Notion Meeting Notes', url: '#' },
    { id: 4, text: 'Gmail Dashboard', url: '#' },
    { id: 5, text: 'Figma Design File', url: '#' },
    { id: 6, text: 'Discord Community', url: '#' },
  ];

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: themeConfig.colors.neutral[200] }}>
        <Zap size={16} style={{ color: themeConfig.colors.primary[400] }} /> 
        Quick Access
      </h2>
      
      <div className="space-y-6 flex-1">
        {/* Quick Links - Horizontal scrollable */}
        <div>
          <h3 className="font-semibold text-xs mb-3" style={{ color: themeConfig.colors.neutral[400] }}>Quick Links</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {quickTags.map((link, index) => (
              <a 
                key={index} 
                href={link.url} 
                className="group flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all duration-300 transform hover:-translate-y-0.5 flex-shrink-0"
                style={{
                  backgroundColor: `${themeConfig.colors.neutral[900]}50`,
                  borderColor: `${themeConfig.colors.neutral[700]}50`,
                  minWidth: '60px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}70`;
                  e.currentTarget.style.borderColor = themeConfig.colors.neutral[600];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[900]}50`;
                  e.currentTarget.style.borderColor = `${themeConfig.colors.neutral[700]}50`;
                }}
              >
                <div className="group-hover:scale-110 transition-transform duration-200" style={{ color: themeConfig.colors.primary[400] }}>
                  {link.icon}
                </div>
                <span className="text-xs font-medium transition-colors text-center" style={{ color: themeConfig.colors.neutral[200] }}>
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Items - 4 columns layout */}
        <div className="grid grid-cols-4 gap-3 flex-1">
          {/* Recently Closed - First 3 items */}
          <div>
            <h3 className="font-semibold text-xs mb-2 flex items-center gap-1" style={{ color: themeConfig.colors.neutral[400] }}>
              <History size={10} />
              Recently Closed
            </h3>
            <div className="space-y-1">
              {recentlyClosed.slice(0, 3).map(item => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  className="flex items-center gap-2 p-1.5 rounded transition-colors text-xs group"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeConfig.colors.danger[400] }}></div>
                  <span className="transition-colors truncate font-medium" style={{ color: themeConfig.colors.neutral[200] }}>
                    {item.text}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Recently Closed - Last 3 items */}
          <div>
            <h3 className="font-semibold text-xs mb-2 opacity-0">Spacer</h3>
            <div className="space-y-1">
              {recentlyClosed.slice(3, 6).map(item => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  className="flex items-center gap-2 p-1.5 rounded transition-colors text-xs group"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeConfig.colors.danger[400] }}></div>
                  <span className="transition-colors truncate font-medium" style={{ color: themeConfig.colors.neutral[200] }}>
                    {item.text}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Bookmarks - First 3 items */}
          <div>
            <h3 className="font-semibold text-xs mb-2 flex items-center gap-1" style={{ color: themeConfig.colors.neutral[400] }}>
              <Book size={10} />
              Bookmarks
            </h3>
            <div className="space-y-1">
              {recentBookmarks.slice(0, 3).map(item => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  className="flex items-center gap-2 p-1.5 rounded transition-colors text-xs group"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeConfig.colors.success[400] }}></div>
                  <span className="transition-colors truncate font-medium" style={{ color: themeConfig.colors.neutral[200] }}>
                    {item.text}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Bookmarks - Last 3 items */}
          <div>
            <h3 className="font-semibold text-xs mb-2 opacity-0">Spacer</h3>
            <div className="space-y-1">
              {recentBookmarks.slice(3, 6).map(item => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  className="flex items-center gap-2 p-1.5 rounded transition-colors text-xs group"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: themeConfig.colors.success[400] }}></div>
                  <span className="transition-colors truncate font-medium" style={{ color: themeConfig.colors.neutral[200] }}>
                    {item.text}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}