// Create compact header for dev center
// Requirements:
// - Exactly 60px height
// - Logo on left, navigation in center, status indicators on right
// - No padding waste, efficient use of space
// - Dark theme consistent with rest of design

import React from 'react';

export default function DevCenterHeader() {
  return (
    <div className="dev-center-header">
      <style jsx>{`
        .dev-center-header {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          background: var(--color-neutral-900);
          border-bottom: 1px solid var(--color-neutral-800);
        }
        .header-left {
          display: flex;
          align-items: center;
        }
        .logo {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-primary-400);
          margin-right: 24px;
        }
        .nav-tabs {
          display: flex;
          gap: 16px;
        }
        .nav-tab {
          padding: 8px 12px;
          font-size: 14px;
          color: var(--color-neutral-400);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nav-tab.active {
          background: var(--color-neutral-800);
          color: var(--color-neutral-200);
        }
        .nav-tab:hover {
          color: var(--color-neutral-200);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: var(--color-neutral-400);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 6px;
        }
        .status-ready { background: var(--color-success-500); }
        .status-building { background: var(--color-warning-500); }
        .action-button {
          padding: 6px 12px;
          background: var(--color-primary-600);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
      `}</style>
    
      <div className="header-left">
        <div className="logo">🌐 Lucaverse Hub</div>
        <nav className="nav-tabs">
          <div className="nav-tab active">Dev Center</div>
          <div className="nav-tab">Theme Demo</div>
          <div className="nav-tab">Animations</div>
        </nav>
      </div>

      <div className="header-right">
        <div className="status-indicator">
          <div className="status-dot status-ready"></div>
          Dev Center Ready
        </div>
        <div className="status-indicator">
          Tests: 70 passed
        </div>
        <button className="action-button">Launch Dashboard</button>
        <button className="action-button">Launch Production</button>
      </div>
    </div>
  );
}