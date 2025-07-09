// Create compact workflow cards that replace the current bloated cards
// Requirements:
// - Each card exactly 40px height
// - Horizontal layout with icon, title, progress bar, action button
// - No descriptions or time estimates
// - Progress bar shows completion percentage
// - Single click to start/continue workflow
// - Cards arranged in 3 columns across the top row

import React from 'react';

interface WorkflowCard {
  id: string;
  icon: string;
  title: string;
  progress: number; // 0-100
  status: 'not-started' | 'in-progress' | 'completed';
  action: () => void;
}

const workflows: WorkflowCard[] = [
  {
    id: 'theme',
    icon: '🎨',
    title: 'Theme Studio',
    progress: 80,
    status: 'in-progress',
    action: () => window.location.href = '/dev-center/theme'
  },
  {
    id: 'components',
    icon: '📦',
    title: 'Component Testing',
    progress: 60,
    status: 'in-progress', 
    action: () => window.location.href = '/dev-center/components'
  },
  {
    id: 'layout',
    icon: '📐',
    title: 'Layout Designer',
    progress: 20,
    status: 'not-started',
    action: () => window.location.href = '/dev-center/layout'
  }
];

export default function WorkflowCards() {
  return (
    <div className="workflow-grid">
      <style jsx>{`
        .workflow-grid {
          grid-column: 1 / -1;
          grid-row: 1;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
        }
        .workflow-card {
          height: 40px;
          background: var(--color-neutral-900);
          border: 1px solid var(--color-neutral-800);
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .workflow-card:hover {
          border-color: var(--color-primary-500);
        }
        .workflow-icon {
          font-size: 16px;
          margin-right: 8px;
        }
        .workflow-title {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: var(--color-neutral-200);
        }
        .workflow-progress {
          width: 60px;
          height: 4px;
          background: var(--color-neutral-800);
          border-radius: 2px;
          margin: 0 12px;
          overflow: hidden;
        }
        .workflow-progress-fill {
          height: 100%;
          background: var(--color-primary-500);
          border-radius: 2px;
          transition: width 0.3s;
        }
        .workflow-action {
          font-size: 12px;
          color: var(--color-primary-400);
        }
      `}</style>
      {workflows.map(workflow => (
        <div 
          key={workflow.id}
          className="workflow-card"
          onClick={workflow.action}
        >
          <span className="workflow-icon">{workflow.icon}</span>
          <span className="workflow-title">{workflow.title}</span>
          <div className="workflow-progress">
            <div 
              className="workflow-progress-fill"
              style={{ width: `${workflow.progress}%` }}
            />
          </div>
          <span className="workflow-action">
            {workflow.status === 'not-started' ? 'Start →' : 'Continue →'}
          </span>
        </div>
      ))}
    </div>
  );
}