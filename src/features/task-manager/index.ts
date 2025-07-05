/**
 * Task Manager feature module
 * Main entry point for task management functionality
 */

// Components (to be moved here)
export * from '@/components/panels/TaskManager/TaskManager';

// Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  subtasks: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
  color: string;
  archived: boolean;
  createdAt: number;
}

export interface TaskManagerConfig {
  enableSubtasks: boolean;
  enableTags: boolean;
  enableDueDates: boolean;
  enablePriorities: boolean;
  defaultSortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  defaultSortOrder: 'asc' | 'desc';
}

// Constants
export const TASK_MANAGER_CONSTANTS = {
  MAX_TASKS_PER_LIST: 1000,
  MAX_LISTS: 50,
  MAX_SUBTASKS_PER_TASK: 20,
  MAX_TAGS_PER_TASK: 10,
  PRIORITY_LEVELS: ['low', 'medium', 'high'] as const,
} as const;
