import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WorkflowCards() {
  const navigate = useNavigate();

  const workflows = [
    {
      id: 'theme',
      icon: '🎨',
      title: 'Theme Studio',
      progress: 80,
      action: () => navigate('/dev-center/theme')
    },
    {
      id: 'components',
      icon: '📦',
      title: 'Component Testing',
      progress: 60,
      action: () => navigate('/dev-center/components')
    },
    {
      id: 'layout',
      icon: '📐',
      title: 'Layout Designer',
      progress: 20,
      action: () => navigate('/dev-center/layout')
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {workflows.map((workflow) => (
        <button
          key={workflow.id}
          onClick={workflow.action}
          className="h-16 bg-elevated border border-neutral-700 rounded-lg p-4 hover:border-primary-500 transition-colors flex items-center space-x-3"
        >
          <span className="text-2xl">{workflow.icon}</span>
          <div className="flex-1 text-left">
            <div className="font-medium text-neutral-200">{workflow.title}</div>
            <div className="text-sm text-neutral-500">{workflow.progress}% complete</div>
          </div>
        </button>
      ))}
    </div>
  );
}