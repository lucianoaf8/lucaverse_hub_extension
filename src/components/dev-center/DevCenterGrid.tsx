import React from 'react';

interface DevCenterGridProps {
  children: React.ReactNode;
}

export default function DevCenterGrid({ children }: DevCenterGridProps) {
  return (
    <div className="dev-center-container min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-rows-[auto_1fr] gap-6 h-[calc(100vh-3rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}