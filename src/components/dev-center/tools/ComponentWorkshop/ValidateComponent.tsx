import React, { useState } from 'react';

interface ValidationResult {
  id: string;
  category: 'accessibility' | 'visual' | 'performance' | 'functionality';
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

export default function ValidateComponent() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([
    { id: 'a11y-aria', category: 'accessibility', name: 'ARIA Labels', status: 'passed', message: 'All interactive elements have proper ARIA labels', severity: 'high' },
    { id: 'a11y-contrast', category: 'accessibility', name: 'Color Contrast', status: 'warning', message: 'Some text may not meet WCAG AA contrast requirements', severity: 'medium' },
    { id: 'a11y-keyboard', category: 'accessibility', name: 'Keyboard Navigation', status: 'failed', message: 'Component is not fully keyboard accessible', severity: 'high' },
    { id: 'visual-responsive', category: 'visual', name: 'Responsive Design', status: 'passed', message: 'Component adapts well to different screen sizes', severity: 'medium' },
    { id: 'visual-consistency', category: 'visual', name: 'Design Consistency', status: 'passed', message: 'Component follows design system guidelines', severity: 'low' },
    { id: 'perf-render', category: 'performance', name: 'Render Performance', status: 'passed', message: 'Component renders efficiently without unnecessary re-renders', severity: 'medium' },
    { id: 'perf-bundle', category: 'performance', name: 'Bundle Size', status: 'warning', message: 'Component bundle size is acceptable but could be optimized', severity: 'low' },
    { id: 'func-props', category: 'functionality', name: 'Props Validation', status: 'passed', message: 'All props are properly typed and validated', severity: 'medium' },
    { id: 'func-events', category: 'functionality', name: 'Event Handling', status: 'passed', message: 'All events are properly handled and propagated', severity: 'medium' },
  ]);
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'accessibility' | 'visual' | 'performance' | 'functionality'>('all');
  const [isRunning, setIsRunning] = useState(false);
  
  const runValidation = async () => {
    setIsRunning(true);
    
    // Simulate validation process
    setValidationResults(prev => prev.map(result => ({ ...result, status: 'pending' as const })));
    
    // Simulate async validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Restore results
    setValidationResults(prev => prev.map(result => ({ 
      ...result, 
      status: Math.random() > 0.7 ? 'failed' : Math.random() > 0.5 ? 'warning' : 'passed' 
    })));
    
    setIsRunning(false);
  };
  
  const filteredResults = activeFilter === 'all' 
    ? validationResults 
    : validationResults.filter(result => result.category === activeFilter);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-success';
      case 'failed': return 'text-danger';
      case 'warning': return 'text-warning';
      case 'pending': return 'text-neutral-500';
      default: return 'text-neutral-400';
    }
  };
  
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-success/20';
      case 'failed': return 'bg-danger/20';
      case 'warning': return 'bg-warning/20';
      case 'pending': return 'bg-neutral-700';
      default: return 'bg-neutral-700';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-neutral-400';
    }
  };
  
  const passedCount = validationResults.filter(r => r.status === 'passed').length;
  const failedCount = validationResults.filter(r => r.status === 'failed').length;
  const warningCount = validationResults.filter(r => r.status === 'warning').length;
  
  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Validation Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Total Tests</span>
              <span className="text-2xl font-bold text-neutral-200">{validationResults.length}</span>
            </div>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Passed</span>
              <span className="text-2xl font-bold text-success">{passedCount}</span>
            </div>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Warnings</span>
              <span className="text-2xl font-bold text-warning">{warningCount}</span>
            </div>
          </div>
          <div className="bg-background rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-400">Failed</span>
              <span className="text-2xl font-bold text-danger">{failedCount}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        {[
          { id: 'all', label: 'All Tests' },
          { id: 'accessibility', label: 'Accessibility' },
          { id: 'visual', label: 'Visual' },
          { id: 'performance', label: 'Performance' },
          { id: 'functionality', label: 'Functionality' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id as any)}
            className={`flex-1 px-3 py-2 rounded-md font-medium transition-all text-sm ${
              activeFilter === filter.id 
                ? 'bg-primary text-white' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      
      {/* Validation Results */}
      <div className="bg-elevated rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-neutral-100">Validation Results</h3>
          <button
            onClick={runValidation}
            disabled={isRunning}
            className="px-4 py-2 bg-primary hover:bg-primary-600 disabled:opacity-50 
                       disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {isRunning ? 'Running...' : 'Run Validation'}
          </button>
        </div>
        
        <div className="space-y-3">
          {filteredResults.map((result) => (
            <div key={result.id} className="bg-background rounded-lg p-4 border border-neutral-600">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusBg(result.status)}`}>
                      {result.status === 'passed' && <div className="w-full h-full bg-success rounded-full" />}
                      {result.status === 'failed' && <div className="w-full h-full bg-danger rounded-full" />}
                      {result.status === 'warning' && <div className="w-full h-full bg-warning rounded-full" />}
                      {result.status === 'pending' && <div className="w-full h-full bg-neutral-500 rounded-full animate-pulse" />}
                    </div>
                    <h4 className="font-medium text-neutral-200">{result.name}</h4>
                    <span className="text-xs px-2 py-1 bg-neutral-700 text-neutral-400 rounded uppercase">
                      {result.category}
                    </span>
                    <span className={`text-xs font-medium ${getSeverityColor(result.severity)}`}>
                      {result.severity}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">{result.message}</p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status.toUpperCase()}
                  </span>
                  {result.status === 'failed' && (
                    <button className="px-3 py-1 bg-danger hover:bg-danger-600 text-white 
                                       rounded text-sm transition-colors">
                      Fix
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Validation Score */}
      <div className="bg-elevated rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-neutral-100">Validation Score</h3>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {Math.round((passedCount / validationResults.length) * 100)}%
            </div>
            <div className="text-sm text-neutral-400">Overall Score</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-success text-2xl font-bold">
              {Math.round((validationResults.filter(r => r.category === 'accessibility' && r.status === 'passed').length / validationResults.filter(r => r.category === 'accessibility').length) * 100)}%
            </div>
            <div className="text-sm text-neutral-400">Accessibility</div>
          </div>
          <div className="text-center">
            <div className="text-primary text-2xl font-bold">
              {Math.round((validationResults.filter(r => r.category === 'visual' && r.status === 'passed').length / validationResults.filter(r => r.category === 'visual').length) * 100)}%
            </div>
            <div className="text-sm text-neutral-400">Visual</div>
          </div>
          <div className="text-center">
            <div className="text-warning text-2xl font-bold">
              {Math.round((validationResults.filter(r => r.category === 'performance' && r.status === 'passed').length / validationResults.filter(r => r.category === 'performance').length) * 100)}%
            </div>
            <div className="text-sm text-neutral-400">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-secondary text-2xl font-bold">
              {Math.round((validationResults.filter(r => r.category === 'functionality' && r.status === 'passed').length / validationResults.filter(r => r.category === 'functionality').length) * 100)}%
            </div>
            <div className="text-sm text-neutral-400">Functionality</div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Component validation ready</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                             rounded-lg transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-success hover:bg-success-600 text-white 
                             rounded-lg transition-colors font-medium">
            Fix All Issues
          </button>
        </div>
      </div>
    </div>
  );
}