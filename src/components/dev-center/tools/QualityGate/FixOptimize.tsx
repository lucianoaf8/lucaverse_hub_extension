import React, { useState } from 'react';

export default function FixOptimize() {
  const [fixes, setFixes] = useState([
    { id: 1, name: 'Bundle Size Optimization', status: 'ready', progress: 0, estimated: '2 min' },
    { id: 2, name: 'Code Splitting', status: 'ready', progress: 0, estimated: '1 min' },
    { id: 3, name: 'Image Optimization', status: 'ready', progress: 0, estimated: '30 sec' },
    { id: 4, name: 'Accessibility Fixes', status: 'ready', progress: 0, estimated: '1 min' },
    { id: 5, name: 'Security Updates', status: 'ready', progress: 0, estimated: '3 min' },
  ]);
  
  const applyFix = async (fixId: number) => {
    setFixes(prev => prev.map(fix => 
      fix.id === fixId ? { ...fix, status: 'applying', progress: 0 } : fix
    ));
    
    // Simulate fix progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setFixes(prev => prev.map(fix => 
        fix.id === fixId ? { ...fix, progress: i } : fix
      ));
    }
    
    setFixes(prev => prev.map(fix => 
      fix.id === fixId ? { ...fix, status: 'completed', progress: 100 } : fix
    ));
  };
  
  const applyAllFixes = async () => {
    for (const fix of fixes) {
      if (fix.status === 'ready') {
        await applyFix(fix.id);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Apply Optimizations</h3>
        
        <div className="space-y-4">
          {fixes.map((fix) => (
            <div key={fix.id} className="bg-background rounded-lg p-4 border border-neutral-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-neutral-200">{fix.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-500">{fix.estimated}</span>
                  <button
                    onClick={() => applyFix(fix.id)}
                    disabled={fix.status === 'applying' || fix.status === 'completed'}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      fix.status === 'completed' 
                        ? 'bg-success text-white' 
                        : fix.status === 'applying'
                        ? 'bg-warning text-white cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-600 text-white'
                    }`}
                  >
                    {fix.status === 'completed' ? 'Applied' : 
                     fix.status === 'applying' ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
              
              {fix.status === 'applying' && (
                <div className="mt-2">
                  <div className="w-full bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-warning h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fix.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{fix.progress}% complete</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Ready to optimize</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors">
            Preview Changes
          </button>
          <button 
            onClick={applyAllFixes}
            className="px-4 py-2 bg-success hover:bg-success-600 text-white rounded-lg transition-colors font-medium"
          >
            Apply All Fixes
          </button>
        </div>
      </div>
    </div>
  );
}