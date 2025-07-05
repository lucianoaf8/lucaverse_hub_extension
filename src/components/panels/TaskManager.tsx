/**
 * TaskManager Panel Component
 * Priority-based task management with categories and progress tracking
 * Migrated from vanilla JavaScript while preserving all functionality
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Panel } from '@/components/ui';
import { usePanelSelection } from '@/hooks/usePanelInteractions';
import type { Position, Size } from '@/types/panel';

// Types for Task Manager data structures
interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: 1 | 2 | 3 | 4 | 5; // 1 = Critical, 5 = Optional
  parentId?: number;
  progress: number;
  category?: string;
  tags?: string[];
  dueDate?: number;
  createdAt: number;
  updatedAt: number;
}

type TaskTemplate = 'daily' | 'meeting' | 'research' | 'code';

export interface TaskManagerProps {
  id: string;
  position: Position;
  size: Size;
  onMove?: (position: Position) => void;
  onResize?: (size: Size) => void;
  className?: string;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  id,
  position,
  size,
  onMove,
  onResize,
  className = ''
}) => {
  // State management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState(true);

  // Panel selection state
  const { isSelected } = usePanelSelection(id);

  // Task templates
  const taskTemplates = {
    daily: [
      'Check emails and messages',
      'Review daily priorities',
      'Team standup meeting',
      'Plan tomorrow\'s tasks'
    ],
    meeting: [
      'Prepare meeting agenda',
      'Schedule follow-up',
      'Share meeting notes',
      'Send action items'
    ],
    research: [
      'Literature review',
      'Competitive analysis',
      'Document findings',
      'Present results'
    ],
    code: [
      'Code review',
      'Write unit tests',
      'Update documentation',
      'Deploy to staging'
    ]
  };

  // Load tasks on mount
  useEffect(() => {
    loadTasksFromStorage();
  }, []);

  // Save tasks when they change
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Load tasks from localStorage
  const loadTasksFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('lucaverse_tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        // Initialize with sample tasks
        const sampleTasks: Task[] = [
          {
            id: 1,
            text: 'Complete project proposal',
            completed: false,
            priority: 2,
            progress: 75,
            category: 'Work',
            tags: ['important', 'deadline'],
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now()
          },
          {
            id: 2,
            text: 'Review code changes',
            completed: false,
            priority: 1,
            progress: 30,
            category: 'Development',
            tags: ['code', 'review'],
            createdAt: Date.now() - 172800000,
            updatedAt: Date.now()
          },
          {
            id: 3,
            text: 'Update documentation',
            completed: true,
            priority: 3,
            progress: 100,
            category: 'Development',
            tags: ['docs'],
            createdAt: Date.now() - 259200000,
            updatedAt: Date.now()
          }
        ];
        setTasks(sampleTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []);

  // Save tasks to localStorage
  const saveTasksToStorage = useCallback((tasksToSave: Task[]) => {
    try {
      localStorage.setItem('lucaverse_tasks', JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }, []);

  // -------------------------
  // Drag & Drop utilities
  // -------------------------
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  
  const handleDragEnd = useCallback(({ active, over }: any) => {
    if (!over || active.id === over.id) return;

    setTasks(prev => {
      // Get main tasks (root-level tasks) from current state
      const currentMainTasks = prev.filter(t => !t.parentId);
      const oldIndex = currentMainTasks.findIndex(t => t.id === active.id);
      const newIndex = currentMainTasks.findIndex(t => t.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return prev;

      const newOrder = arrayMove(currentMainTasks, oldIndex, newIndex);
      const otherTasks = prev.filter(t => t.parentId); // keep subtasks order unchanged
      return [...newOrder, ...otherTasks];
    });
  }, [setTasks]);

  // Add new task
  const addTask = useCallback((text: string, priority: 1 | 2 | 3 | 4 | 5 = 3, parentId?: number, category?: string) => {
    const newTask: Task = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      completed: false,
      priority,
      parentId: parentId || undefined,
      progress: 0,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  }, []);

  // Toggle task completion
  const toggleTask = useCallback((taskId: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const completed = !task.completed;
        return {
          ...task,
          completed,
          progress: completed ? 100 : task.progress,
          updatedAt: Date.now()
        };
      }
      return task;
    }));
  }, []);

  // Delete task
  const deleteTask = useCallback((taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId && task.parentId !== taskId));
  }, []);

  // Update task progress
  const updateTaskProgress = useCallback((taskId: number, progress: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, progress, completed: progress === 100, updatedAt: Date.now() }
        : task
    ));
  }, []);

  // Add task template
  const addTaskTemplate = useCallback((template: TaskTemplate) => {
    const templateTasks = taskTemplates[template];
    templateTasks.forEach((taskText, index) => {
      setTimeout(() => {
        addTask(taskText, 3, undefined, template);
      }, index * 100); // Stagger creation for visual effect
    });
  }, [addTask, taskTemplates]);

  // -------------------------
  // SortableTaskItem component
  // -------------------------
  interface SortableTaskProps {
    id: number;
    children: React.ReactNode;
  }

  const SortableTaskItem: React.FC<SortableTaskProps> = ({ id: sortableId, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: isDragging ? 'grabbing' : 'grab',
    };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    );
  };

  // -------------------------
  // Get filtered and sorted tasksxt
  const editTask = useCallback((taskId: number, newText: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, text: newText.trim(), updatedAt: Date.now() }
        : task
    ));
  }, []);

  // Get filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Filter by search query
      if (searchQuery && !task.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (filterCategory && task.category !== filterCategory) {
        return false;
      }
      
      // Filter by completion status
      if (!showCompleted && task.completed) {
        return false;
      }
      
      return true;
    });

    // Sort by completion status, then priority, then creation date
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.createdAt - a.createdAt;
    });
  }, [tasks, searchQuery, filterCategory, showCompleted]);

  // Get main tasks and subtasks
  const mainTasks = filteredTasks.filter(task => !task.parentId);
  const getSubTasks = useCallback((parentId: number) => {
    return filteredTasks.filter(task => task.parentId === parentId);
  }, [filteredTasks]);

  // Function to get tasks by parent ID, handles null for main tasks
  const getTasksByParent = useCallback((parentId: number | null) => {
    if (parentId === null) {
      return filteredTasks.filter(task => !task.parentId);
    }
    return filteredTasks.filter(task => task.parentId === parentId);
  }, [filteredTasks]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const categories = new Set(tasks.map(task => task.category).filter(Boolean));
    return Array.from(categories);
  }, [tasks]);

  // Get priority info
  const getPriorityInfo = useCallback((priority: number) => {
    const priorityMap = {
      1: { text: '🔴 Critical', class: 'text-red-400 bg-red-500 bg-opacity-20' },
      2: { text: '🟠 High', class: 'text-orange-400 bg-orange-500 bg-opacity-20' },
      3: { text: '🟡 Medium', class: 'text-yellow-400 bg-yellow-500 bg-opacity-20' },
      4: { text: '🟢 Low', class: 'text-green-400 bg-green-500 bg-opacity-20' },
      5: { text: '🔵 Optional', class: 'text-blue-400 bg-blue-500 bg-opacity-20' }
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap[3];
  }, []);

  // Calculate task statistics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const critical = tasks.filter(task => task.priority === 1 && !task.completed).length;
    const high = tasks.filter(task => task.priority === 2 && !task.completed).length;
    
    return { total, completed, critical, high, completionRate: total > 0 ? (completed / total) * 100 : 0 };
  }, [tasks]);

  // Handle add task form submit
  const handleAddTask = useCallback(() => {
    if (!newTaskText.trim()) return;
    
    addTask(newTaskText, newTaskPriority, selectedTaskId || undefined, newTaskCategory || undefined);
    setNewTaskText('');
    setNewTaskPriority(3);
    setNewTaskCategory('');
    setShowAddTaskDialog(false);
  }, [newTaskText, newTaskPriority, selectedTaskId, newTaskCategory, addTask]);

  // Handle task double-click for editing
  const handleTaskDoubleClick = useCallback((task: Task) => {
    const newText = prompt('Edit task:', task.text);
    if (newText && newText.trim() !== task.text) {
      editTask(task.id, newText);
    }
  }, [editTask]);

  return (
    <Panel
      id={id}
      title="Mission Control Tasks"
      icon="📋"
      position={position}
      size={size}
      isSelected={isSelected}
      onMove={onMove || (() => {})}
      onResize={onResize || (() => {})}
      className={className}
      constraints={{
        minSize: { width: 400, height: 400 },
        maxSize: { width: 800, height: 800 }
      }}
    >
      <div className="h-full flex flex-col">
        {/* Header Controls */}
        <div className="p-4 border-b border-white border-opacity-10">
          {/* Task Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{taskStats.total}</div>
              <div className="text-xs text-white text-opacity-60">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{taskStats.completed}</div>
              <div className="text-xs text-white text-opacity-60">Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">{taskStats.critical}</div>
              <div className="text-xs text-white text-opacity-60">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{Math.round(taskStats.completionRate)}%</div>
              <div className="text-xs text-white text-opacity-60">Complete</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white placeholder-white placeholder-opacity-60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            
            <div className="flex space-x-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 px-2 py-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  showCompleted 
                    ? 'bg-green-500 bg-opacity-20 text-green-300' 
                    : 'bg-white bg-opacity-10 text-white text-opacity-60'
                }`}
              >
                {showCompleted ? '✓ Show Done' : '○ Hide Done'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => setShowAddTaskDialog(true)}
              className="flex-1 px-3 py-2 bg-blue-500 bg-opacity-20 text-blue-300 rounded text-sm hover:bg-opacity-30 transition-colors"
            >
              + Add Task
            </button>
            
            <div className="relative group">
              <button className="px-3 py-2 bg-green-500 bg-opacity-20 text-green-300 rounded text-sm hover:bg-opacity-30 transition-colors">
                Templates ⋯
              </button>
              <div className="absolute top-full left-0 mt-1 bg-black bg-opacity-90 rounded shadow-lg p-2 space-y-1 min-w-32 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {Object.keys(taskTemplates).map(template => (
                  <button
                    key={template}
                    onClick={() => addTaskTemplate(template as TaskTemplate)}
                    className="block w-full text-left px-2 py-1 text-white text-xs hover:bg-white hover:bg-opacity-10 rounded"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {getTasksByParent(null).map(task => {
              const isSelected = selectedTaskId === task.id;
              const subtasks = getTasksByParent(task.id);
              const completedSubtasks = subtasks.filter(st => st.completed).length;
              const priorityInfo = getPriorityInfo(task.priority);
              
              return (
                <div
                  key={task.id}
                  className={`glass-panel p-4 rounded-lg cursor-pointer hover:bg-white hover:bg-opacity-5 transition-all ${
                    isSelected ? 'ring-2 ring-blue-400' : ''
                  } ${task.completed ? 'opacity-50' : ''}`}
                  onClick={() => setSelectedTaskId(isSelected ? null : task.id)}
                  onDoubleClick={() => handleTaskDoubleClick(task)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        task.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-white border-opacity-40 hover:border-opacity-60'
                      }`}
                    >
                      {task.completed && '✓'}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-white font-medium ${task.completed ? 'line-through opacity-60' : ''}`}>
                        {task.text}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${priorityInfo.class}`}>
                          {priorityInfo.text}
                        </span>
                        
                        {task.category && (
                          <span className="px-2 py-1 bg-white bg-opacity-10 text-white text-opacity-80 rounded text-xs">
                            {task.category}
                          </span>
                        )}
                        
                        {subtasks.length > 0 && (
                          <span className="text-white text-opacity-60 text-xs">
                            {completedSubtasks}/{subtasks.length} subtasks
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-white bg-opacity-10 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress}
                        onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                        className="w-16 h-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="w-6 h-6 flex items-center justify-center text-white text-opacity-40 hover:text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Subtasks */}
                  {isSelected && subtasks.length > 0 && (
                    <div className="ml-8 space-y-2">
                      {subtasks.map(subtask => {
                        return (
                          <div
                            key={subtask.id}
                            className={`glass-panel p-2 rounded cursor-pointer hover:bg-white hover:bg-opacity-5 transition-all ${
                              subtask.completed ? 'opacity-50' : ''
                            }`}
                            onDoubleClick={() => handleTaskDoubleClick(subtask)}
                          >
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleTask(subtask.id)}
                                className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                                  subtask.completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-white border-opacity-40 hover:border-opacity-60'
                                }`}
                              >
                                {subtask.completed && '✓'}
                              </button>
                              
                              <div className="flex-1">
                                <span className={`text-white text-sm ${subtask.completed ? 'line-through opacity-60' : ''}`}>
                                  {subtask.text}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => deleteTask(subtask.id)}
                                className="w-5 h-5 flex items-center justify-center text-white text-opacity-40 hover:text-red-400 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Task Dialog */}
        {showAddTaskDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-white mb-4">
                {selectedTaskId ? 'Add Subtask' : 'Add New Task'}
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Task description..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTask();
                    if (e.key === 'Escape') setShowAddTaskDialog(false);
                  }}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white text-opacity-80 text-sm mb-1">Priority</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                      className="w-full px-2 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value={1}>🔴 Critical</option>
                      <option value={2}>🟠 High</option>
                      <option value={3}>🟡 Medium</option>
                      <option value={4}>🟢 Low</option>
                      <option value={5}>🔵 Optional</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white text-opacity-80 text-sm mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="Optional..."
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full px-2 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white placeholder-white placeholder-opacity-60 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskText.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddTaskDialog(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

TaskManager.displayName = 'TaskManager';

export default TaskManager;