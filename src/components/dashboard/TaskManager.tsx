import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function TaskManager() {
  const { themeConfig } = useTheme();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const mainTasks = [
    { id: 1, title: 'Design system architecture', progress: 80, priority: 'high', statusColor: themeConfig.colors.danger[500] },
    { id: 2, title: 'Implement authentication flow', progress: 60, priority: 'medium', statusColor: themeConfig.colors.warning[500] },
    { id: 3, title: 'Build dashboard components', progress: 40, priority: 'normal', statusColor: themeConfig.colors.success[500] },
  ];

  const subtasks = [
    { id: 1, title: 'Design glassmorphism components', completed: 0, total: 0 },
  ];

  const filters = ['Daily', 'Meeting', 'Research', 'Code'];
  const actions = ['Export', 'Clear Done'];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const completedCount = 1;
  const totalCount = 3;
  const progressPercentage = 33;
  const highPriorityCount = 1;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Title bar with target icon + title + expand + subtitle */}
      <div className="mb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <span className="text-lg filter drop-shadow-lg">🎯</span>
            <h2 className="text-lg font-bold" style={{ 
              color: themeConfig.colors.primary[200],
              textShadow: `0 0 10px ${themeConfig.colors.primary[500]}60`
            }}>Mission Control</h2>
          </div>
          <button className="transition-colors hover:opacity-75" style={{ color: themeConfig.colors.neutral[400] }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
        <p className="text-xs" style={{ color: themeConfig.colors.neutral[400] }}>
          {completedCount}/{totalCount} Completed · {progressPercentage}% Progress · {highPriorityCount} High Priority
        </p>
      </div>

      {/* Content split: Left and Right */}
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
        {/* Left side */}
        <div className="flex flex-col space-y-2 overflow-hidden">
          {/* Main Tasks section */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-xs font-bold flex items-center" style={{ color: themeConfig.colors.neutral[300] }}>
                <span className="mr-1">📋</span>
                Main Tasks
              </h3>
              <button className="px-2 py-1 rounded text-xs transition-all"
                      style={{ 
                        backgroundColor: themeConfig.colors.primary[700],
                        color: themeConfig.colors.neutral[100]
                      }}>
                + Add
              </button>
            </div>

            <div className="space-y-1 mb-2 flex-1 overflow-y-auto">
              {mainTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-2 rounded border transition-all"
                  style={{ backgroundColor: themeConfig.colors.neutral[800], borderColor: themeConfig.colors.neutral[700] }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.statusColor }}></div>
                      <span className="text-xs truncate" style={{ color: themeConfig.colors.neutral[100] }}>{task.title}</span>
                    </div>
                  </div>
                  <div className="w-full rounded-full h-1 mb-1" style={{ backgroundColor: themeConfig.colors.neutral[700] }}>
                    <div 
                      className="h-1 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%`, backgroundColor: themeConfig.colors.primary[500] }}
                    ></div>
                  </div>
                  <div className="text-xs" style={{ color: themeConfig.colors.neutral[400] }}>{task.progress}% complete</div>
                </div>
              ))}
            </div>

            {/* Tag buttons */}
            <div className="mb-2 flex-shrink-0">
              <div className="flex flex-wrap gap-1">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className="px-2 py-1 rounded text-xs transition-all"
                    style={{
                      backgroundColor: selectedFilters.includes(filter) ? themeConfig.colors.primary[700] : themeConfig.colors.neutral[800],
                      color: selectedFilters.includes(filter) ? themeConfig.colors.neutral[100] : themeConfig.colors.neutral[300]
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-1 flex-shrink-0">
              {actions.map((action) => (
                <button
                  key={action}
                  className="px-2 py-1 rounded text-xs transition-all"
                  style={{ backgroundColor: themeConfig.colors.neutral[800], color: themeConfig.colors.neutral[300] }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col overflow-hidden">
          {/* Subtasks section */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-xs font-bold flex items-center" style={{ color: themeConfig.colors.neutral[300] }}>
                <span className="mr-1">➤</span>
                Subtasks
              </h3>
              <button className="px-2 py-1 rounded text-xs transition-all"
                      style={{ 
                        backgroundColor: themeConfig.colors.primary[700],
                        color: themeConfig.colors.neutral[100]
                      }}>
                + Add
              </button>
            </div>

            <div className="space-y-1 overflow-y-auto">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="p-2 rounded border transition-all"
                  style={{ backgroundColor: themeConfig.colors.neutral[800], borderColor: themeConfig.colors.neutral[700] }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate" style={{ color: themeConfig.colors.neutral[100] }}>{subtask.title}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: themeConfig.colors.neutral[400] }}>
                      {subtask.completed}/{subtask.total} completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}