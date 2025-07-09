// Create horizontal quick actions bar
// Requirements:
// - Single row, exactly 60px height
// - 5 equally spaced action buttons
// - Spans full width across all 3 columns
// - Each button 120px wide with icon + label
// - Buttons: Search, Quick Theme, Copy, Export, Validate

import React from 'react';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  action: () => void;
}

const quickActions: QuickAction[] = [
  { id: 'search', icon: '🔍', label: 'Search', action: () => console.log('search') },
  { id: 'theme', icon: '🎨', label: 'Quick Theme', action: () => console.log('theme') },
  { id: 'copy', icon: '📋', label: 'Copy', action: () => console.log('copy') },
  { id: 'export', icon: '💾', label: 'Export', action: () => console.log('export') },
  { id: 'validate', icon: '⚡', label: 'Validate', action: () => console.log('validate') }
];

export default function QuickActionsBar() {
  return (
    <div className="quick-actions-bar">
      <style jsx>{`
        .quick-actions-bar {
          grid-column: 1 / -1;
          grid-row: 2;
          height: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--color-neutral-900);
          border: 1px solid var(--color-neutral-800);
          border-radius: 8px;
          padding: 0 24px;
        }
        .quick-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 36px;
          background: var(--color-neutral-800);
          border: 1px solid var(--color-neutral-700);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          color: var(--color-neutral-300);
        }
        .quick-action:hover {
          background: var(--color-neutral-700);
          border-color: var(--color-primary-500);
          color: var(--color-neutral-100);
        }
        .quick-action-icon {
          margin-right: 6px;
        }
      `}</style>
      {quickActions.map(action => (
        <button
          key={action.id}
          className="quick-action"
          onClick={action.action}
        >
          <span className="quick-action-icon">{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}