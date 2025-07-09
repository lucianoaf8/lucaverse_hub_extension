import React, { useState } from 'react';

export default function OptimizeLayout() {
  const [optimizationResults, setOptimizationResults] = useState({
    performance: { score: 85, issues: ['Large chart data load', 'Multiple API calls'] },
    accessibility: { score: 92, issues: ['Missing alt text on 1 chart'] },
    usability: { score: 78, issues: ['Panel overlap on mobile', 'Small touch targets'] },
    efficiency: { score: 88, issues: ['Unused panels loaded', 'Redundant data queries'] }
  });
  
  const runOptimization = () => {
    // Simulate optimization process
    setOptimizationResults(prev => ({
      ...prev,
      performance: { score: 92, issues: ['Minor optimization opportunities'] },
      accessibility: { score: 98, issues: [] },
      usability: { score: 94, issues: [] },
      efficiency: { score: 96, issues: [] }
    }));
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Layout Optimization</h3>
        <p className="text-neutral-400 mb-6">
          Analyze and optimize your dashboard layout for performance and usability.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(optimizationResults).map(([category, data]) => (
            <div key={category} className="bg-background rounded-lg p-4 border border-neutral-600">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-neutral-200 capitalize">{category}</h4>
                <div className={`text-2xl font-bold ${getScoreColor(data.score)}`}>
                  {data.score}%
                </div>
              </div>
              
              <div className="w-full bg-neutral-700 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    data.score >= 90 ? 'bg-success' : data.score >= 70 ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${data.score}%` }}
                />
              </div>
              
              {data.issues.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-neutral-300">Issues:</p>
                  {data.issues.map((issue, index) => (
                    <p key={index} className="text-xs text-neutral-500">• {issue}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Optimization Recommendations</h3>
        
        <div className="space-y-4">
          <div className="bg-background rounded-lg p-4 border border-neutral-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-success text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200">Enable Lazy Loading</h4>
                <p className="text-sm text-neutral-400">Load panel data only when panels are visible</p>
              </div>
            </div>
          </div>
          
          <div className="bg-background rounded-lg p-4 border border-neutral-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-warning text-sm">!</span>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200">Optimize Panel Sizes</h4>
                <p className="text-sm text-neutral-400">Reduce panel sizes on mobile to improve touch interaction</p>
              </div>
            </div>
          </div>
          
          <div className="bg-background rounded-lg p-4 border border-neutral-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-sm">i</span>
              </div>
              <div>
                <h4 className="font-medium text-neutral-200">Cache Data Queries</h4>
                <p className="text-sm text-neutral-400">Implement caching to reduce API calls and improve performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">2.3s</div>
            <div className="text-sm text-neutral-400">Initial Load Time</div>
          </div>
          
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">5.2MB</div>
            <div className="text-sm text-neutral-400">Bundle Size</div>
          </div>
          
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning">12</div>
            <div className="text-sm text-neutral-400">API Requests</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Layout optimization ready</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors">
            Export Report
          </button>
          <button 
            onClick={runOptimization}
            className="px-4 py-2 bg-success hover:bg-success-600 text-white rounded-lg transition-colors font-medium"
          >
            Run Optimization
          </button>
        </div>
      </div>
    </div>
  );
}