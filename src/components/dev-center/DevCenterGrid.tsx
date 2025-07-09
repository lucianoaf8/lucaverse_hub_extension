// Create a new component that replaces the current scrolling layout with a fixed-height CSS Grid
// Requirements:
// - Use 100vh height with no scrolling
// - 3x3 grid layout for main content area
// - Header at top (60px fixed height)
// - Grid areas: workflows (top row), actions (middle row), status (bottom row)
// - Each grid cell should be exactly equal size with 16px gaps
// - Background: theme neutral-950
// - Use CSS Grid with fr units for equal distribution

import React from 'react';

interface DevCenterGridProps {
  children: React.ReactNode;
}

export default function DevCenterGrid({ children }: DevCenterGridProps) {
  return (
    <div className="dev-center-container">
      <style jsx>{`
        .dev-center-container {
          height: 100vh;
          width: 100vw;
          display: grid;
          grid-template-rows: 60px 1fr;
          background-color: var(--color-neutral-950);
          overflow: hidden;
        }
        .dev-center-header {
          grid-row: 1;
          padding: 0 24px;
          border-bottom: 1px solid var(--color-neutral-800);
        }
        .dev-center-main {
          grid-row: 2;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-rows: 1fr 60px 1fr;
          gap: 16px;
          padding: 16px;
        }
      `}</style>
      {children}
    </div>
  );
}