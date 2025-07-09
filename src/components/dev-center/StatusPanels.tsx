// Create 3 status panels for bottom row
// Requirements:
// - 3 equal columns in bottom row
// - Left: System Health, Middle: Recent Activity, Right: Export Tools
// - Each panel compact with dense information
// - No scrolling within panels
// - Maximum 6-8 lines per panel

import React from 'react';

export default function StatusPanels() {
  return (
    <>
      <style jsx>{`
        .status-panel {
          background: var(--color-neutral-900);
          border: 1px solid var(--color-neutral-800);
          border-radius: 8px;
          padding: 16px;
          overflow: hidden;
        }
        .panel-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-neutral-200);
          margin-bottom: 12px;
        }
        .status-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--color-neutral-400);
          margin-bottom: 6px;
        }
        .status-icon {
          margin-right: 6px;
        }
        .status-value {
          color: var(--color-neutral-300);
        }
        .activity-item {
          display: flex;
          align-items: center;
          font-size: 12px;
          color: var(--color-neutral-400);
          margin-bottom: 4px;
        }
        .activity-time {
          color: var(--color-neutral-500);
          margin-left: auto;
          font-size: 10px;
        }
        .export-button {
          width: 100%;
          height: 32px;
          background: var(--color-neutral-800);
          border: 1px solid var(--color-neutral-700);
          border-radius: 4px;
          color: var(--color-neutral-300);
          font-size: 12px;
          cursor: pointer;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .export-button:hover {
          background: var(--color-neutral-700);
          border-color: var(--color-primary-500);
        }
      `}</style>

      {/* System Health Panel */}
      <div className="status-panel" style={{ gridColumn: 1, gridRow: 3 }}>
        <div className="panel-title">System Health</div>
        <div className="status-item">
          <span><span className="status-icon">✅</span>Build Status</span>
          <span className="status-value">Passing</span>
        </div>
        <div className="status-item">
          <span><span className="status-icon">✅</span>Tests</span>
          <span className="status-value">45/45</span>
        </div>
        <div className="status-item">
          <span><span className="status-icon">⚠️</span>Bundle Size</span>
          <span className="status-value">2.1MB</span>
        </div>
        <div className="status-item">
          <span><span className="status-icon">🔄</span>Validation</span>
          <span className="status-value">Running</span>
        </div>
        <div className="status-item">
          <span><span className="status-icon">📊</span>Performance</span>
          <span className="status-value">85/100</span>
        </div>
      </div>

      {/* Recent Activity Panel */}
      <div className="status-panel" style={{ gridColumn: 2, gridRow: 3 }}>
        <div className="panel-title">Recent Activity</div>
        <div className="activity-item">
          <span><span className="status-icon">🎨</span>Theme colors updated</span>
          <span className="activity-time">2m ago</span>
        </div>
        <div className="activity-item">
          <span><span className="status-icon">📦</span>Button component tested</span>
          <span className="activity-time">5m ago</span>
        </div>
        <div className="activity-item">
          <span><span className="status-icon">📐</span>Layout exported</span>
          <span className="activity-time">12m ago</span>
        </div>
        <div className="activity-item">
          <span><span className="status-icon">⚡</span>Validation completed</span>
          <span className="activity-time">15m ago</span>
        </div>
        <div className="activity-item">
          <span><span className="status-icon">💾</span>Theme exported</span>
          <span className="activity-time">1h ago</span>
        </div>
      </div>

      {/* Export Tools Panel */}
      <div className="status-panel" style={{ gridColumn: 3, gridRow: 3 }}>
        <div className="panel-title">Export & Deploy</div>
        <button className="export-button">
          📤 Export Theme
        </button>
        <button className="export-button">
          🚀 Deploy to Production
        </button>
        <button className="export-button">
          📋 Copy CSS Variables
        </button>
        <button className="export-button">
          📄 Generate Documentation
        </button>
        <button className="export-button">
          ⚙️ Settings
        </button>
      </div>
    </>
  );
}