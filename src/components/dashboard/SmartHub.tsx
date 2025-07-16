import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Zap, Github, Twitter, Dribbble, Rss, History, Book } from 'lucide-react';

export default function SmartHub() {
  const { themeConfig } = useTheme();
  
  const quickTags = [
    { icon: <Github size={20} />, name: 'GitHub', url: 'https://github.com' },
    { icon: <Twitter size={20} />, name: 'Twitter', url: 'https://twitter.com' },
    { icon: <Dribbble size={20} />, name: 'Dribbble', url: 'https://dribbble.com' },
    { icon: <Rss size={20} />, name: 'Blog', url: '#' },
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

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: themeConfig.colors.neutral[200] }}>
        <Zap size={16} style={{ color: themeConfig.colors.primary[400] }} /> 
        Quick Access
      </h2>
      
      <div className="space-y-6 flex-1">
        {/* Quick Tags */}
        <div>
          <h3 className="font-semibold text-xs mb-4" style={{ color: themeConfig.colors.neutral[400] }}>Quick Links</h3>
          <div className="grid grid-cols-4 gap-4">
            {quickTags.map((link, index) => (
              <a 
                key={index} 
                href={link.url} 
                className="group flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-300 transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: `${themeConfig.colors.neutral[900]}50`,
                  borderColor: `${themeConfig.colors.neutral[700]}50`
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
                <span className="text-xs font-medium transition-colors" style={{ color: themeConfig.colors.neutral[200] }}>
                  {link.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Items */}
        <div className="grid grid-cols-2 gap-6 flex-1">
          {/* Recently Closed */}
          <div>
            <h3 className="font-semibold text-xs mb-3 flex items-center gap-1" style={{ color: themeConfig.colors.neutral[400] }}>
              <History size={10} />
              Recently Closed
            </h3>
            <div className="space-y-2">
              {recentlyClosed.slice(0, 5).map(item => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  className="flex items-center gap-3 p-2 rounded transition-colors text-xs group"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#FF5E5E' }}></div>
                  <span className="transition-colors truncate font-medium" style={{ color: themeConfig.colors.neutral[200] }}>
                    {item.text}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Bookmarks */}
          <div>
            <h3 className="font-semibold text-xs mb-3 flex items-center gap-1" style={{ color: themeConfig.colors.neutral[400] }}>
              <Book size={10} />
              Bookmarks
            </h3>
            <div className="space-y-2">
              {recentBookmarks.slice(0, 5).map(item => (
                <a 
                  key={item.id} 
                  href={item.url} 
                  className="flex items-center gap-3 p-2 rounded transition-colors text-xs group"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#38D9A9' }}></div>
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