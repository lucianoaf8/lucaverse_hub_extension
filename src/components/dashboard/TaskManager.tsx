import React, { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: Date;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the new feature',
      completed: false,
      priority: 'high',
      category: 'Development',
      dueDate: '2024-12-31',
      createdAt: new Date('2024-12-01'),
    },
    {
      id: '2',
      title: 'Review code changes',
      description: 'Review pull requests from team members',
      completed: true,
      priority: 'medium',
      category: 'Review',
      createdAt: new Date('2024-12-02'),
    },
    {
      id: '3',
      title: 'Plan next sprint',
      description: 'Organize tasks and priorities for the upcoming sprint',
      completed: false,
      priority: 'low',
      category: 'Planning',
      dueDate: '2024-12-15',
      createdAt: new Date('2024-12-03'),
    },
  ]);

  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'Development', 'Review', 'Planning', 'Design', 'Testing'];

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      description: '',
      completed: false,
      priority: 'medium',
      category: 'Development',
      createdAt: new Date(),
    };

    setTasks(prev => [task, ...prev]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-danger';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-neutral-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface rounded-lg border border-neutral-700">
      {/* Header */}
      <div className="p-4 border-b border-neutral-700 bg-elevated rounded-t-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
              <span className="text-warning">📋</span>
            </div>
            <div>
              <h3 className="font-medium text-warning">Task Manager</h3>
              <p className="text-xs text-neutral-400">
                {pendingTasks.length} pending, {completedTasks.length} completed
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-32"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Task */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Add new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-sm
                       focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={addTask}
            className="px-3 py-2 bg-primary hover:bg-primary/80 text-white rounded text-sm transition-colors"
          >
            ➕ Add
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-neutral-700 bg-neutral-800/50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{pendingTasks.length}</div>
            <div className="text-xs text-neutral-400">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-success">{completedTasks.length}</div>
            <div className="text-xs text-neutral-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-danger">{highPriorityTasks.length}</div>
            <div className="text-xs text-neutral-400">High Priority</div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTasks.length > 0 ? (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 bg-elevated rounded-lg border transition-all duration-base ${
                  task.completed
                    ? 'border-success/30 bg-success/5'
                    : 'border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-success border-success text-white'
                        : 'border-neutral-600 hover:border-primary'
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${
                        task.completed ? 'line-through text-neutral-500' : 'text-neutral-300'
                      }`}>
                        {task.title}
                      </h4>
                      <span className={getPriorityColor(task.priority)}>
                        {getPriorityIcon(task.priority)}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className={`text-sm mt-1 ${
                        task.completed ? 'text-neutral-600' : 'text-neutral-400'
                      }`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-2 text-xs text-neutral-500">
                      <span className="px-2 py-1 bg-neutral-700 rounded">
                        {task.category}
                      </span>
                      {task.dueDate && (
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                      <span>Created: {task.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 hover:bg-neutral-700 rounded transition-colors text-neutral-400 hover:text-danger"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-neutral-400">No tasks found</p>
            <p className="text-sm text-neutral-500 mt-1">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Add your first task to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-700 bg-elevated rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div>
            Drag and drop support coming soon
          </div>
          <div className="flex items-center space-x-4">
            <span>Total: {tasks.length}</span>
            <span>•</span>
            <span>Progress: {Math.round((completedTasks.length / tasks.length) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}