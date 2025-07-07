/**
 * Productivity feature module
 * Main entry point for productivity tools functionality
 */

// Components (to be moved here)
export * from '@/components/panels/PomodoroTimer/PomodoroTimer';
export * from '@/components/panels/Bookmarks/Bookmarks';

// Types
export interface PomodoroSession {
  id: string;
  type: 'work' | 'short-break' | 'long-break';
  duration: number; // in minutes
  startTime: number;
  endTime?: number;
  completed: boolean;
}

export interface PomodoroConfig {
  workDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // after how many work sessions
  enableNotifications: boolean;
  enableSounds: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  favicon?: string;
  createdAt: number;
  updatedAt: number;
  category: string;
  pinned: boolean;
}

export interface BookmarkCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface ProductivityConfig {
  pomodoro: PomodoroConfig;
  bookmarks: {
    enableCategories: boolean;
    enableTags: boolean;
    enableSync: boolean;
    maxBookmarks: number;
  };
}

// Constants
export const PRODUCTIVITY_CONSTANTS = {
  DEFAULT_WORK_DURATION: 25,
  DEFAULT_SHORT_BREAK: 5,
  DEFAULT_LONG_BREAK: 15,
  DEFAULT_LONG_BREAK_INTERVAL: 4,
  MAX_BOOKMARKS: 1000,
  MAX_CATEGORIES: 50,
} as const;
