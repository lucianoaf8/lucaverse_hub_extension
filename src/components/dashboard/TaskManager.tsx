import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Target, Plus, ListTodo, CheckCircle, Circle } from 'lucide-react';

export default function TaskManager() {
  const { themeConfig } = useTheme();
  
  const initialTasks = [
    {
      id: 1,
      text: 'Complete dashboard UI redesign',
      completed: false,
      priority: 'High',
      dueDate: '2024-01-15',
      subtasks: [
        { id: 1, text: 'Design new header component', completed: true },
        { id: 2, text: 'Update footer with features', completed: false }
      ]
    },
    {
      id: 2,
      text: 'Implement task management system',
      completed: false,
      priority: 'Medium',
      dueDate: '2024-01-20',
      subtasks: []
    },
    {
      id: 3,
      text: 'Setup authentication flow',
      completed: true,
      priority: 'High',
      dueDate: '2024-01-10',
      subtasks: [
        { id: 3, text: 'Create login component', completed: true },
        { id: 4, text: 'Add JWT token handling', completed: true }
      ]
    },
    {
      id: 4,
      text: 'Write documentation',
      completed: false,
      priority: 'Low',
      dueDate: '2024-01-25',
      subtasks: []
    },
    {
      id: 5,
      text: 'Performance optimization',
      completed: false,
      priority: 'Medium',
      dueDate: '2024-01-18',
      subtasks: [
        { id: 5, text: 'Bundle size analysis', completed: false },
        { id: 6, text: 'Code splitting implementation', completed: false }
      ]
    }
  ];

  const [taskList, setTaskList] = useState(initialTasks);
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const toggleTask = (id: number) => {
    setTaskList(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleSubtask = (taskId: number, subtaskId: number) => {
    setTaskList(prev => prev.map(task => 
      task.id === taskId ? {
        ...task,
        subtasks: task.subtasks.map(subtask =>
          subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        )
      } : task
    ));
  };

  const addTask = () => {
    if (newTaskText.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtasks: []
    };
    
    setTaskList(prev => [...prev, newTask]);
    setNewTaskText('');
    setShowAddTask(false);
  };

  const completedTasks = taskList.filter(t => t.completed).length;
  const totalTasks = taskList.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return {
          bg: `${themeConfig.colors.danger[500]}20`,
          text: themeConfig.colors.danger[400],
          border: `${themeConfig.colors.danger[500]}30`
        };
      case 'Medium':
        return {
          bg: `${themeConfig.colors.warning[500]}20`,
          text: themeConfig.colors.warning[400],
          border: `${themeConfig.colors.warning[500]}30`
        };
      case 'Low':
        return {
          bg: `${themeConfig.colors.success[500]}20`,
          text: themeConfig.colors.success[400],
          border: `${themeConfig.colors.success[500]}30`
        };
      default:
        return {
          bg: `${themeConfig.colors.neutral[500]}20`,
          text: themeConfig.colors.neutral[400],
          border: `${themeConfig.colors.neutral[500]}30`
        };
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: themeConfig.colors.neutral[200] }}>
          <Target size={16} style={{ color: themeConfig.colors.secondary[400] }} /> 
          Mission Control
          <span className="text-xs px-2 py-0.5 rounded"
                style={{ 
                  color: themeConfig.colors.neutral[300],
                  backgroundColor: `${themeConfig.colors.neutral[700]}50` 
                }}>
            {taskList.filter(t => !t.completed).length}
          </span>
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-all border"
            style={{
              backgroundColor: `${themeConfig.colors.secondary[600]}30`,
              color: themeConfig.colors.secondary[200],
              borderColor: `${themeConfig.colors.secondary[500]}50`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${themeConfig.colors.secondary[600]}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${themeConfig.colors.secondary[600]}30`;
            }}
          >
            <Plus size={12} /> Add Task
          </button>
          
          <button className="flex items-center gap-1 text-xs font-semibold py-1.5 px-3 rounded-md transition-all border"
                  style={{
                    backgroundColor: `${themeConfig.colors.neutral[700]}50`,
                    color: themeConfig.colors.neutral[300],
                    borderColor: `${themeConfig.colors.neutral[600]}50`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeConfig.colors.neutral[700];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[700]}50`;
                  }}>
            <ListTodo size={12} /> Reminders
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: themeConfig.colors.neutral[400] }}>
          <span>Progress</span>
          <span>{completedTasks}/{totalTasks} ({progress.toFixed(0)}%)</span>
        </div>
        <div className="w-full rounded-full h-2" style={{ backgroundColor: `${themeConfig.colors.neutral[700]}50` }}>
          <div 
            className="h-2 rounded-full transition-all duration-700"
            style={{ 
              width: `${progress}%`,
              backgroundImage: `linear-gradient(to right, ${themeConfig.colors.secondary[500]}, ${themeConfig.colors.primary[500]})`
            }}
          ></div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: `${themeConfig.colors.neutral[900]}50` }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="New task..."
              className="flex-grow rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 transition-all"
              style={{
                backgroundColor: `${themeConfig.colors.neutral[800]}50`,
                border: `1px solid ${themeConfig.colors.neutral[600]}`,
                color: themeConfig.colors.neutral[200],
                focusRingColor: themeConfig.colors.secondary[500]
              }}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <button
              onClick={addTask}
              className="px-2 py-1 rounded text-xs transition-colors"
              style={{
                backgroundColor: themeConfig.colors.secondary[600],
                color: themeConfig.colors.neutral[100]
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeConfig.colors.secondary[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = themeConfig.colors.secondary[600];
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2 overflow-y-auto flex-grow custom-scrollbar">
        {taskList.slice(0, 10).map(task => (
          <div 
            key={task.id} 
            className="group p-2 rounded-lg transition-all duration-300 border"
            style={{
              backgroundColor: task.completed 
                ? `${themeConfig.colors.neutral[800]}30` 
                : `${themeConfig.colors.neutral[900]}50`,
              borderColor: task.completed 
                ? `${themeConfig.colors.neutral[700]}30` 
                : `${themeConfig.colors.neutral[700]}50`,
              color: task.completed ? themeConfig.colors.neutral[500] : themeConfig.colors.neutral[200]
            }}
            onMouseEnter={(e) => {
              if (!task.completed) {
                e.currentTarget.style.backgroundColor = `${themeConfig.colors.neutral[800]}70`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = task.completed 
                ? `${themeConfig.colors.neutral[800]}30` 
                : `${themeConfig.colors.neutral[900]}50`;
            }}
          >
            <div className="flex items-center gap-2">
              <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                {task.completed ? 
                  <CheckCircle size={16} style={{ color: themeConfig.colors.success[500] }} /> : 
                  <Circle size={16} style={{ color: themeConfig.colors.neutral[600] }} />
                }
              </button>
              
              <div className="flex-grow min-w-0">
                <span className={`block text-sm truncate ${task.completed ? 'line-through' : ''}`}>
                  {task.text}
                </span>
                <div className="flex items-center gap-2 text-xs" style={{ color: themeConfig.colors.neutral[500] }}>
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                    style={{
                      backgroundColor: getPriorityColor(task.priority).bg,
                      color: getPriorityColor(task.priority).text,
                      borderColor: getPriorityColor(task.priority).border
                    }}>
                {task.priority}
              </span>
            </div>

            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="ml-6 mt-2 space-y-1">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 text-xs">
                    <button onClick={() => toggleSubtask(task.id, subtask.id)}>
                      {subtask.completed ? 
                        <CheckCircle size={12} style={{ color: themeConfig.colors.success[600] }} /> : 
                        <Circle size={12} style={{ color: themeConfig.colors.neutral[700] }} />
                      }
                    </button>
                    <span className={`${subtask.completed ? 'line-through' : ''}`}
                          style={{ 
                            color: subtask.completed ? themeConfig.colors.neutral[600] : themeConfig.colors.neutral[400] 
                          }}>
                      {subtask.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {taskList.length === 0 && (
          <div className="text-center py-8" style={{ color: themeConfig.colors.neutral[500] }}>
            <Target size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}