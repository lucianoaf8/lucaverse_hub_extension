import React from 'react';

export default function StatusPanels() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-elevated rounded-lg p-4 border border-neutral-700">
        <h3 className="font-semibold text-neutral-200 mb-2">Build Status</h3>
        <div className="text-2xl font-bold text-success">Passing</div>
        <div className="text-sm text-neutral-500">Last build: 2 min ago</div>
      </div>
      
      <div className="bg-elevated rounded-lg p-4 border border-neutral-700">
        <h3 className="font-semibold text-neutral-200 mb-2">Bundle Size</h3>
        <div className="text-2xl font-bold text-warning">2.1MB</div>
        <div className="text-sm text-neutral-500">+5% from last build</div>
      </div>
      
      <div className="bg-elevated rounded-lg p-4 border border-neutral-700">
        <h3 className="font-semibold text-neutral-200 mb-2">Performance</h3>
        <div className="text-2xl font-bold text-success">Excellent</div>
        <div className="text-sm text-neutral-500">95/100 score</div>
      </div>
    </div>
  );
}