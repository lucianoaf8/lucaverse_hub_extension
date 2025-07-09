import React, { useState, useEffect } from 'react';
import { useFeatureFlags, featureFlagManager } from './FeatureFlags';
import { DevCenterMigration } from './MigrationManager';

interface MigrationMetrics {
  userAdoption: number;
  performanceImprovements: {
    loadTime: number;
    bundleSize: number;
    memoryUsage: number;
  };
  errorRate: number;
  featureUsage: Record<string, number>;
  userSatisfaction: number;
}

export const MigrationDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<MigrationMetrics | null>(null);
  const flags = useFeatureFlags();
  
  useEffect(() => {
    // Load migration metrics
    const loadMetrics = () => {
      const usage = JSON.parse(localStorage.getItem('feature-usage') || '{}');
      const performance = JSON.parse(localStorage.getItem('performance-metrics') || '{}');
      
      setMetrics({
        userAdoption: calculateUserAdoption(),
        performanceImprovements: {
          loadTime: performance.loadTime || 0,
          bundleSize: performance.bundleSize || 0,
          memoryUsage: performance.memoryUsage || 0
        },
        errorRate: calculateErrorRate(),
        featureUsage: usage,
        userSatisfaction: calculateUserSatisfaction()
      });
    };
    
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const calculateUserAdoption = (): number => {
    const migrationState = JSON.parse(localStorage.getItem('dev-center-migration') || '{}');
    return migrationState.hasSeenNewExperience ? 100 : 0;
  };
  
  const calculateErrorRate = (): number => {
    const errors = JSON.parse(localStorage.getItem('error-metrics') || '{}');
    return errors.rate || 0;
  };
  
  const calculateUserSatisfaction = (): number => {
    const feedback = JSON.parse(localStorage.getItem('user-feedback') || '{}');
    return feedback.satisfaction || 4.5;
  };
  
  const handleEmergencyRollback = () => {
    if (confirm('Are you sure you want to perform an emergency rollback? This will revert all users to the legacy system.')) {
      featureFlagManager.emergencyRollback();
      alert('Emergency rollback completed. All users reverted to legacy system.');
    }
  };
  
  const handlePhaseRollout = (phase: 1 | 2 | 3 | 4) => {
    featureFlagManager.setMigrationPhase(phase);
    alert(`Migration phase ${phase} activated.`);
  };
  
  const handleGradualRollout = (percentage: number) => {
    featureFlagManager.enableGradualRollout(percentage);
    alert(`Gradual rollout set to ${percentage}% of users.`);
  };
  
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className=\"fixed bottom-4 left-4 z-50 p-3 bg-primary hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors\"
        title=\"Migration Dashboard\"
      >
        <svg className=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
          <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z\" />
        </svg>
      </button>
    );
  }
  
  return (
    <div className=\"fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4\">
      <div className=\"bg-elevated rounded-xl border border-neutral-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto\">
        <div className=\"p-6 border-b border-neutral-700 flex items-center justify-between\">
          <h2 className=\"text-2xl font-bold text-neutral-100\">Migration Dashboard</h2>
          <button
            onClick={() => setIsVisible(false)}
            className=\"text-neutral-400 hover:text-neutral-200\"
          >
            <svg className=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
            </svg>
          </button>
        </div>
        
        <div className=\"p-6 space-y-6\">
          {/* Migration Metrics */}
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
            <div className=\"bg-background rounded-lg p-4 border border-neutral-700\">
              <h3 className=\"font-semibold text-neutral-200 mb-2\">User Adoption</h3>
              <div className=\"text-3xl font-bold text-primary\">{metrics?.userAdoption || 0}%</div>
              <div className=\"text-sm text-neutral-400\">Users using new system</div>
            </div>
            
            <div className=\"bg-background rounded-lg p-4 border border-neutral-700\">
              <h3 className=\"font-semibold text-neutral-200 mb-2\">Error Rate</h3>
              <div className=\"text-3xl font-bold text-error\">{metrics?.errorRate || 0}%</div>
              <div className=\"text-sm text-neutral-400\">System error rate</div>
            </div>
            
            <div className=\"bg-background rounded-lg p-4 border border-neutral-700\">
              <h3 className=\"font-semibold text-neutral-200 mb-2\">User Satisfaction</h3>
              <div className=\"text-3xl font-bold text-success\">{metrics?.userSatisfaction || 0}/5</div>
              <div className=\"text-sm text-neutral-400\">Average rating</div>
            </div>
          </div>
          
          {/* Performance Improvements */}
          <div className=\"bg-background rounded-lg p-4 border border-neutral-700\">
            <h3 className=\"font-semibold text-neutral-200 mb-4\">Performance Improvements</h3>
            <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">
              <div>
                <div className=\"text-sm text-neutral-400\">Load Time</div>
                <div className=\"text-xl font-bold text-success\">
                  {metrics?.performanceImprovements.loadTime || 0}ms
                </div>
              </div>
              <div>
                <div className=\"text-sm text-neutral-400\">Bundle Size</div>
                <div className=\"text-xl font-bold text-primary\">
                  {Math.round((metrics?.performanceImprovements.bundleSize || 0) / 1024)}KB
                </div>
              </div>
              <div>
                <div className=\"text-sm text-neutral-400\">Memory Usage</div>
                <div className=\"text-xl font-bold text-warning\">
                  {Math.round((metrics?.performanceImprovements.memoryUsage || 0) / (1024 * 1024))}MB
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature Flags */}
          <div className=\"bg-background rounded-lg p-4 border border-neutral-700\">
            <h3 className=\"font-semibold text-neutral-200 mb-4\">Feature Flags</h3>
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              {Object.entries(flags).map(([key, value]) => (
                <div key={key} className=\"flex items-center justify-between p-3 bg-elevated rounded-lg border border-neutral-700\">
                  <div>
                    <div className=\"font-medium text-neutral-200\">
                      {key.replace(/_/g, ' ').toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase())}
                    </div>
                    <div className=\"text-xs text-neutral-400\">{key}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${value ? 'bg-success' : 'bg-neutral-600'}`} />
                </div>
              ))}
            </div>
          </div>
          
          {/* Migration Controls */}
          <div className=\"bg-background rounded-lg p-4 border border-neutral-700\">
            <h3 className=\"font-semibold text-neutral-200 mb-4\">Migration Controls</h3>
            <div className=\"space-y-4\">
              <div>
                <h4 className=\"font-medium text-neutral-300 mb-2\">Phase Rollout</h4>
                <div className=\"flex space-x-2\">
                  {[1, 2, 3, 4].map(phase => (
                    <button
                      key={phase}
                      onClick={() => handlePhaseRollout(phase as 1 | 2 | 3 | 4)}
                      className=\"px-3 py-1 bg-primary hover:bg-primary-600 text-white rounded transition-colors\"
                    >
                      Phase {phase}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className=\"font-medium text-neutral-300 mb-2\">Gradual Rollout</h4>
                <div className=\"flex space-x-2\">
                  {[25, 50, 75, 100].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => handleGradualRollout(percentage)}
                      className=\"px-3 py-1 bg-secondary hover:bg-secondary-600 text-white rounded transition-colors\"
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className=\"font-medium text-neutral-300 mb-2\">Emergency Controls</h4>
                <div className=\"flex space-x-2\">
                  <button
                    onClick={handleEmergencyRollback}
                    className=\"px-4 py-2 bg-error hover:bg-error-600 text-white rounded transition-colors\"
                  >
                    Emergency Rollback
                  </button>
                  <button
                    onClick={() => featureFlagManager.resetFlags()}
                    className=\"px-4 py-2 bg-warning hover:bg-warning-600 text-white rounded transition-colors\"
                  >
                    Reset Flags
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Migration Recommendations */}
          <div className=\"bg-background rounded-lg p-4 border border-neutral-700\">
            <h3 className=\"font-semibold text-neutral-200 mb-4\">Migration Recommendations</h3>
            <div className=\"space-y-2\">
              {DevCenterMigration.getMigrationRecommendations().map((recommendation, index) => (
                <div key={index} className=\"flex items-start space-x-2 p-2 bg-elevated rounded border border-neutral-700\">
                  <div className=\"w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0\" />
                  <div className=\"text-sm text-neutral-300\">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Feature Usage */}
          <div className=\"bg-background rounded-lg p-4 border border-neutral-700\">
            <h3 className=\"font-semibold text-neutral-200 mb-4\">Feature Usage</h3>
            <div className=\"space-y-2\">
              {Object.entries(metrics?.featureUsage || {}).map(([feature, usage]) => (
                <div key={feature} className=\"flex items-center justify-between p-2 bg-elevated rounded border border-neutral-700\">
                  <div className=\"font-medium text-neutral-200\">
                    {feature.replace(/_/g, ' ').toLowerCase().replace(/\\b\\w/g, l => l.toUpperCase())}
                  </div>
                  <div className=\"text-primary font-bold\">{usage}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationDashboard;