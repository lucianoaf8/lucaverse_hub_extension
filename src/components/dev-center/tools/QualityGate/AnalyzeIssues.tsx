import React, { useState } from 'react';

export default function AnalyzeIssues() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  
  const issues = [
    { id: 1, type: 'critical', category: 'Performance', title: 'Large Bundle Size', description: 'Bundle exceeds 250KB threshold', impact: 'High' },
    { id: 2, type: 'warning', category: 'Accessibility', title: 'Color Contrast', description: 'Some text may not meet WCAG AA standards', impact: 'Medium' },
    { id: 3, type: 'warning', category: 'Performance', title: 'Unused Code', description: 'Potential for tree-shaking optimization', impact: 'Low' },
    { id: 4, type: 'info', category: 'Quality', title: 'Code Coverage', description: 'Test coverage could be improved', impact: 'Low' },
    { id: 5, type: 'critical', category: 'Security', title: 'Dependencies', description: 'Outdated packages with security vulnerabilities', impact: 'High' },
  ];
  
  const filteredIssues = activeFilter === 'all' ? issues : issues.filter(issue => issue.type === activeFilter);
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-danger';
      case 'warning': return 'text-warning';
      case 'info': return 'text-info';
      default: return 'text-neutral-400';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Issue Filters */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        {['all', 'critical', 'warning', 'info'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter as any)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all capitalize ${
              activeFilter === filter 
                ? 'bg-primary text-white' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      
      {/* Issues List */}
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Issues Analysis</h3>
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="bg-background rounded-lg p-4 border border-neutral-600">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(issue.type)}`}>
                      {issue.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-neutral-500">{issue.category}</span>
                  </div>
                  <h4 className="font-medium text-neutral-200 mb-1">{issue.title}</h4>
                  <p className="text-sm text-neutral-400">{issue.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-neutral-300">Impact: {issue.impact}</div>
                  <button className="mt-2 px-3 py-1 bg-primary hover:bg-primary-600 text-white rounded text-sm transition-colors">
                    Fix
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors">
          Generate Report
        </button>
        <button className="px-4 py-2 bg-success hover:bg-success-600 text-white rounded-lg transition-colors font-medium">
          Auto-Fix Issues
        </button>
      </div>
    </div>
  );
}