import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActionsBar() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: '🔍',
      label: 'Run Validation',
      action: () => navigate('/dev-center/validation')
    },
    {
      icon: '📊',
      label: 'Performance',
      action: () => navigate('/dev-center/performance')
    },
    {
      icon: '⚙️',
      label: 'Settings',
      action: () => navigate('/dev-center/settings')
    }
  ];

  return (
    <div className="flex space-x-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className="flex-1 h-12 bg-elevated border border-neutral-700 rounded-lg hover:border-primary-500 transition-colors flex items-center justify-center space-x-2"
        >
          <span className="text-lg">{action.icon}</span>
          <span className="font-medium text-neutral-200">{action.label}</span>
        </button>
      ))}
    </div>
  );
}