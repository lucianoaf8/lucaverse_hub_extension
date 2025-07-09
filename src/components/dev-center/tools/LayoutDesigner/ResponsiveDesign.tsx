import React, { useState } from 'react';

export default function ResponsiveDesign() {
  const [activeBreakpoint, setActiveBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  const breakpoints = [
    { id: 'mobile', name: 'Mobile', width: '375px', icon: '📱' },
    { id: 'tablet', name: 'Tablet', width: '768px', icon: '📱' },
    { id: 'desktop', name: 'Desktop', width: '1200px', icon: '💻' }
  ];
  
  return (
    <div className="space-y-6">
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Responsive Breakpoints</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {breakpoints.map((breakpoint) => (
            <button
              key={breakpoint.id}
              onClick={() => setActiveBreakpoint(breakpoint.id as any)}
              className={`p-4 rounded-lg border transition-all ${
                activeBreakpoint === breakpoint.id
                  ? 'border-primary bg-primary/10'
                  : 'border-neutral-600 hover:border-neutral-500'
              }`}
            >
              <div className="text-2xl mb-2">{breakpoint.icon}</div>
              <div className="font-medium text-neutral-200">{breakpoint.name}</div>
              <div className="text-sm text-neutral-500">{breakpoint.width}</div>
            </button>
          ))}
        </div>
        
        <div className="bg-background rounded-lg p-6 border border-neutral-600">
          <div className="text-center text-neutral-500 py-12">
            <div className="text-4xl mb-2">📐</div>
            <p>Responsive layout preview for {activeBreakpoint}</p>
            <p className="text-sm mt-2">Configure how panels adapt to different screen sizes</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors">
          Reset Breakpoints
        </button>
        <button className="px-4 py-2 bg-success hover:bg-success-600 text-white rounded-lg transition-colors font-medium">
          Apply Responsive Rules
        </button>
      </div>
    </div>
  );
}