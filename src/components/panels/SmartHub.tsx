/**
 * SmartHub Panel Component
 * Manages bookmarks, search, quick links with React TypeScript
 * Migrated from vanilla JavaScript while preserving all functionality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Panel } from '@/components/ui';
import { usePanelSelection } from '@/hooks/usePanelInteractions';
import type { Position, Size } from '@/types/panel';

// Types for SmartHub data structures
interface Bookmark {
  id: number;
  title: string;
  url: string;
  favicon: string;
  visits: number;
  isPinned: boolean;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

interface RecentLink {
  url: string;
  title: string;
  timestamp: number;
}

export interface SmartHubProps {
  id: string;
  position: Position;
  size: Size;
  onMove?: (position: Position) => void;
  onResize?: (size: Size) => void;
  className?: string;
}

export const SmartHub: React.FC<SmartHubProps> = ({
  id,
  position,
  size,
  onMove,
  onResize,
  className = ''
}) => {
  // Local state
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBookmarksData, setFilteredBookmarksData] = useState<{
    mostVisited: Bookmark[];
    pinned: Bookmark[];
    recent: Bookmark[];
  }>({ mostVisited: [], pinned: [], recent: [] });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Panel selection state
  const { isSelected } = usePanelSelection(id);

  // Load initial data
  useEffect(() => {
    loadBookmarksFromStorage();
    loadRecentLinksFromStorage();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, bookmarks]);

  // Load bookmarks from localStorage
  const loadBookmarksFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('lucaverse_bookmarks');
      if (stored) {
        const parsed = JSON.parse(stored);
        setBookmarks(parsed);
      } else {
        // Initialize with sample bookmarks
        const sampleBookmarks: Bookmark[] = [
          {
            id: 1,
            title: 'GitHub',
            url: 'https://github.com',
            favicon: '💻',
            visits: 25,
            isPinned: true,
            tags: ['development', 'code'],
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now()
          },
          {
            id: 2,
            title: 'MDN Web Docs',
            url: 'https://developer.mozilla.org',
            favicon: '📚',
            visits: 18,
            isPinned: false,
            tags: ['documentation', 'web'],
            createdAt: Date.now() - 172800000,
            updatedAt: Date.now()
          },
          {
            id: 3,
            title: 'Stack Overflow',
            url: 'https://stackoverflow.com',
            favicon: '❓',
            visits: 32,
            isPinned: true,
            tags: ['development', 'help'],
            createdAt: Date.now() - 259200000,
            updatedAt: Date.now()
          }
        ];
        setBookmarks(sampleBookmarks);
        saveBookmarksToStorage(sampleBookmarks);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }, []);

  // Load recent links from localStorage
  const loadRecentLinksFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('lucaverse_recent_links');
      if (stored) {
        setRecentLinks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent links:', error);
    }
  }, []);

  // Save bookmarks to localStorage
  const saveBookmarksToStorage = useCallback((bookmarksToSave: Bookmark[]) => {
    try {
      localStorage.setItem('lucaverse_bookmarks', JSON.stringify(bookmarksToSave));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }, []);

  // Save recent links to localStorage
  const saveRecentLinksToStorage = useCallback((linksToSave: RecentLink[]) => {
    try {
      localStorage.setItem('lucaverse_recent_links', JSON.stringify(linksToSave));
    } catch (error) {
      console.error('Failed to save recent links:', error);
    }
  }, []);

  // Process bookmarks into categories
  const processBookmarks = useCallback((bookmarksToProcess: Bookmark[]) => {
    const mostVisited = bookmarksToProcess
      .filter(b => b.visits > 0)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 4);

    const pinned = bookmarksToProcess
      .filter(b => b.isPinned)
      .slice(0, 6);

    const recent = bookmarksToProcess
      .filter(b => !mostVisited.includes(b) && !b.isPinned)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8);

    return { mostVisited, pinned, recent };
  }, []);

  // Perform search with filtering
  const performSearch = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setFilteredBookmarksData(processBookmarks(bookmarks));
      return;
    }

    const filtered = bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(query.toLowerCase()) ||
      (bookmark.tags && bookmark.tags.some(tag =>
        tag.toLowerCase().includes(query.toLowerCase())
      ))
    );

    setFilteredBookmarksData(processBookmarks(filtered));
  }, [bookmarks, processBookmarks]);

  // Update bookmarks data when bookmarks change
  useEffect(() => {
    if (!searchQuery && !activeFilter) {
      setFilteredBookmarksData(processBookmarks(bookmarks));
    }
  }, [bookmarks, searchQuery, activeFilter, processBookmarks]);

  // Handle link click
  const handleLinkClick = useCallback((bookmark: Bookmark) => {
    // Update visit count
    const updatedBookmarks = bookmarks.map(b =>
      b.id === bookmark.id ? { ...b, visits: (b.visits || 0) + 1, updatedAt: Date.now() } : b
    );
    setBookmarks(updatedBookmarks);
    saveBookmarksToStorage(updatedBookmarks);

    // Add to recent links
    const newRecentLink: RecentLink = {
      url: bookmark.url,
      title: bookmark.title,
      timestamp: Date.now()
    };

    const updatedRecentLinks = [
      newRecentLink,
      ...recentLinks.filter(link => link.url !== bookmark.url).slice(0, 9)
    ];

    setRecentLinks(updatedRecentLinks);
    saveRecentLinksToStorage(updatedRecentLinks);

    // Open link
    window.open(bookmark.url, '_blank');
  }, [bookmarks, recentLinks, saveBookmarksToStorage, saveRecentLinksToStorage]);

  // Handle pin toggle
  const handlePinToggle = useCallback((bookmark: Bookmark, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const updatedBookmarks = bookmarks.map(b =>
      b.id === bookmark.id ? { ...b, isPinned: !b.isPinned, updatedAt: Date.now() } : b
    );
    
    setBookmarks(updatedBookmarks);
    saveBookmarksToStorage(updatedBookmarks);
  }, [bookmarks, saveBookmarksToStorage]);

  // Handle QR code request
  const handleQRRequest = useCallback((bookmark: Bookmark, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Create simple QR modal
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookmark.url)}`;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg max-w-sm">
        <h3 class="text-lg font-bold mb-4">${bookmark.title}</h3>
        <img src="${qrUrl}" alt="QR Code" class="mx-auto mb-4" />
        <div class="flex justify-end space-x-2">
          <button class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Close</button>
        </div>
      </div>
    `;
    
    modal.onclick = (e) => {
      if (e.target === modal || (e.target as HTMLElement).textContent === 'Close') {
        document.body.removeChild(modal);
      }
    };
    
    document.body.appendChild(modal);
  }, []);

  // Handle tag filter
  const handleTagFilter = useCallback((tag: string) => {
    if (activeFilter === tag) {
      // Clear filter
      setActiveFilter(null);
      setFilteredBookmarksData(processBookmarks(bookmarks));
    } else {
      // Apply filter
      setActiveFilter(tag);
      const filtered = bookmarks.filter(bookmark =>
        bookmark.tags && bookmark.tags.includes(tag)
      );
      setFilteredBookmarksData(processBookmarks(filtered));
    }
  }, [activeFilter, bookmarks, processBookmarks]);

  // Common tags from bookmarks
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    bookmarks.forEach(bookmark => {
      bookmark.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).slice(0, 6);
  }, [bookmarks]);

  // Render bookmark item
  const renderBookmarkItem = useCallback((bookmark: Bookmark) => (
    <div
      key={bookmark.id}
      className="link-item glass-panel p-3 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-20 transition-all duration-200 group"
      onClick={() => handleLinkClick(bookmark)}
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl flex-shrink-0">{bookmark.favicon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate">{bookmark.title}</div>
          <div className="text-white text-opacity-60 text-xs truncate">
            {new URL(bookmark.url).hostname}
          </div>
        </div>
        {bookmark.visits > 0 && (
          <div className="text-white text-opacity-40 text-xs flex-shrink-0">
            {bookmark.visits}x
          </div>
        )}
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => handleQRRequest(bookmark, e)}
            className="w-6 h-6 flex items-center justify-center text-white text-opacity-60 hover:text-opacity-100 hover:bg-white hover:bg-opacity-20 rounded"
            title="QR Code"
          >
            📱
          </button>
          <button
            onClick={(e) => handlePinToggle(bookmark, e)}
            className={`w-6 h-6 flex items-center justify-center rounded ${
              bookmark.isPinned
                ? 'text-yellow-400 bg-yellow-400 bg-opacity-20'
                : 'text-white text-opacity-60 hover:text-opacity-100 hover:bg-white hover:bg-opacity-20'
            }`}
            title={bookmark.isPinned ? 'Unpin' : 'Pin'}
          >
            📌
          </button>
        </div>
      </div>
    </div>
  ), [handleLinkClick, handlePinToggle, handleQRRequest]);

  // Render bookmark section
  const renderBookmarkSection = useCallback((title: string, bookmarks: Bookmark[], emoji: string) => {
    if (bookmarks.length === 0) {
      return (
        <div className="mb-6">
          <div className="text-white text-opacity-80 font-medium mb-3 flex items-center space-x-2">
            <span>{emoji}</span>
            <span>{title}</span>
          </div>
          <div className="text-white text-opacity-40 text-sm italic">No items yet</div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="text-white text-opacity-80 font-medium mb-3 flex items-center space-x-2">
          <span>{emoji}</span>
          <span>{title}</span>
        </div>
        <div className="space-y-2">
          {bookmarks.map(renderBookmarkItem)}
        </div>
      </div>
    );
  }, [renderBookmarkItem]);

  return (
    <Panel
      id={id}
      title="Smart Access Hub"
      icon="⚡"
      position={position}
      size={size}
      isSelected={isSelected}
      onMove={onMove || (() => {})}
      onResize={onResize || (() => {})}
      className={className}
      constraints={{
        minSize: { width: 400, height: 300 },
        maxSize: { width: 800, height: 700 }
      }}
    >
      <div className="h-full flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-white border-opacity-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-40">
              🔍
            </div>
          </div>
        </div>

        {/* Quick Tags */}
        {availableTags.length > 0 && (
          <div className="p-4 border-b border-white border-opacity-10">
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    activeFilter === tag
                      ? 'bg-blue-500 text-white'
                      : 'bg-white bg-opacity-10 text-white text-opacity-80 hover:bg-opacity-20'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {activeFilter && (
                <button
                  onClick={() => {
                    setActiveFilter(null);
                    setFilteredBookmarksData(processBookmarks(bookmarks));
                  }}
                  className="px-3 py-1 rounded-full text-xs bg-red-500 bg-opacity-20 text-red-300 hover:bg-opacity-30"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              {renderBookmarkSection('Most Visited', filteredBookmarksData.mostVisited, '⚡')}
            </div>

            {/* Right Column */}
            <div>
              {renderBookmarkSection('Recent Bookmarks', filteredBookmarksData.recent, '🔖')}
              {renderBookmarkSection('Pinned Items', filteredBookmarksData.pinned, '📌')}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};

SmartHub.displayName = 'SmartHub';

export default SmartHub;