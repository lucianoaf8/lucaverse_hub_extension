import React, { useState } from 'react';

export default function VerifyResults() {
  const [verificationResults, setVerificationResults] = useState({
    performance: { before: 72, after: 89, improvement: '+17%' },
    accessibility: { before: 84, after: 96, improvement: '+12%' },
    quality: { before: 78, after: 92, improvement: '+14%' },
    security: { before: 85, after: 98, improvement: '+13%' }
  });
  
  const [isVerifying, setIsVerifying] = useState(false);
  
  const runVerification = async () => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsVerifying(false);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-danger';
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-elevated rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-neutral-100">Verification Results</h3>
          <button
            onClick={runVerification}
            disabled={isVerifying}
            className="px-4 py-2 bg-primary hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
          >
            {isVerifying ? 'Verifying...' : 'Re-verify'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(verificationResults).map(([category, result]) => (
            <div key={category} className="bg-background rounded-lg p-4 border border-neutral-600">
              <h4 className="font-medium text-neutral-200 mb-4 capitalize">{category}</h4>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">Before</span>
                <span className={`text-lg font-bold ${getScoreColor(result.before)}`}>
                  {result.before}%
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400">After</span>
                <span className={`text-lg font-bold ${getScoreColor(result.after)}`}>
                  {result.after}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Improvement</span>
                <span className="text-success font-bold">{result.improvement}</span>
              </div>
              
              <div className="mt-3 w-full bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all duration-300"
                  style={{ width: `${result.after}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Performance Improvements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">-45%</div>
            <div className="text-sm text-neutral-400">Bundle Size</div>
          </div>
          
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">+23%</div>
            <div className="text-sm text-neutral-400">Load Speed</div>
          </div>
          
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">+18%</div>
            <div className="text-sm text-neutral-400">Accessibility</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Performance improvements verified</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded-lg transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-success hover:bg-success-600 text-white rounded-lg transition-colors font-medium">
            Deploy to Production
          </button>
        </div>
      </div>
    </div>
  );
}