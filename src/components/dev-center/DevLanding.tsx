import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflows } from './config/workflows';
import { useDevWorkflow } from './contexts/DevWorkflowContext';
import { WorkflowType } from './types/workflow.types';
import { performanceMonitor } from './utils/PerformanceMonitor';
import { bundleAnalyzer } from './utils/BundleAnalyzer';
import { useDevCenterOverview } from './state/selectors';

interface RecentActivity {
  id: string;
  type: 'workflow' | 'tool' | 'export';
  name: string;
  timestamp: Date;
  workflow?: string;
}

export default function DevLanding() {
  const navigate = useNavigate();
  const { startWorkflow, completedSteps } = useDevWorkflow();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  
  // Use centralized state
  const {
    theme,
    component,
    layout,
    performance,
    isDirty,
    totalValidationIssues,
    recentActivity: stateRecentActivity,
    componentTestsPassed,
    componentTestsFailed
  } = useDevCenterOverview();

  useEffect(() => {
    // Measure dashboard render time
    performanceMonitor.measureRender('dev-landing', () => {
      // Use centralized recent activity or fallback to simulated data
      if (stateRecentActivity.length === 0) {
        setRecentActivity([
          { id: '1', type: 'workflow', name: 'Theme Development', timestamp: new Date(Date.now() - 3600000), workflow: 'theme' },
          { id: '2', type: 'tool', name: 'Component Testing', timestamp: new Date(Date.now() - 7200000), workflow: 'component' },
          { id: '3', type: 'export', name: 'Theme Export', timestamp: new Date(Date.now() - 10800000) },
        ]);
      } else {
        // Convert state recent activity to component format
        const convertedActivity: RecentActivity[] = stateRecentActivity.map(activity => ({
          id: activity.id,
          type: activity.type,
          name: activity.type === 'theme' ? 'Theme Export' : 
                activity.type === 'component' ? 'Component Export' : 'Layout Export',
          timestamp: activity.timestamp,
          workflow: activity.type
        }));
        setRecentActivity(convertedActivity);
      }
    });
    
    // Get performance metrics from centralized state
    const metrics = performanceMonitor.getMetrics();
    const bundleAnalysis = bundleAnalyzer.analyzeBundles();
    
    setPerformanceMetrics({
      loadTime: performance.metrics.loadTime || metrics.pageLoadTime,
      bundleSize: performance.metrics.bundleSize || bundleAnalysis.totalGzipSize,
      memoryUsage: performance.metrics.memoryUsage || metrics.memoryUsage,
      score: performanceMonitor.generateReport().score
    });
  }, [stateRecentActivity, performance]);

  const handleWorkflowSelect = (workflowId: WorkflowType) => {
    // Track workflow selection interaction
    performanceMonitor.measureInteraction('workflow-select', async () => {
      startWorkflow(workflowId);
      const workflow = workflows[workflowId];
      const firstStep = workflow.steps[0];
      navigate(`/dev-center/${workflowId}/${firstStep.toolId}`);
    });
  };

  const workflowCards = Object.values(workflows);

  const getProgressForWorkflow = (workflowId: string) => {
    const workflow = workflows[workflowId];
    const completedCount = workflow.steps.filter(step => completedSteps.includes(step.id)).length;
    return Math.round((completedCount / workflow.steps.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-background min-h-screen">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Development Dashboard</h1>
            <p className="text-neutral-400 mt-1">What would you like to accomplish today?</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-neutral-500">Total Issues</div>
              <div className="text-2xl font-bold text-primary">{totalValidationIssues}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-500">Tests Status</div>
              <div className="text-2xl font-bold text-success">{componentTestsPassed}</div>
              <div className="text-xs text-neutral-500">/{componentTestsPassed + componentTestsFailed} passed</div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg 
                         transition-colors font-medium"
            >
              🚀 Launch Production
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Workflow Cards */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-neutral-100">Development Workflows</h2>
              <div className="text-sm text-neutral-500">
                Choose a workflow to get started
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workflowCards.map((workflow) => {
                const progress = getProgressForWorkflow(workflow.id);
                return (
                  <button
                    key={workflow.id}
                    onClick={() => handleWorkflowSelect(workflow.id)}
                    className="group relative bg-elevated hover:bg-elevated-hover border border-neutral-700 
                               hover:border-neutral-600 rounded-xl p-6 text-left transition-all duration-200
                               hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 
                               focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
                               hover:border-primary/30"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 bg-${workflow.color}/20 rounded-lg flex items-center 
                                      justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <span className="text-2xl">{workflow.icon}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold text-${workflow.color} mb-2`}>
                          {workflow.name}
                        </h3>
                        <p className="text-neutral-400 mb-3 text-sm">
                          {workflow.description}
                        </p>
                        
                        {/* Progress Bar */}
                        {progress > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-neutral-500">Progress</span>
                              <span className="text-xs text-neutral-500">{progress}%</span>
                            </div>
                            <div className="w-full bg-neutral-700 rounded-full h-1">
                              <div 
                                className={`bg-${workflow.color} h-1 rounded-full transition-all duration-300`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-500">
                            {workflow.steps.length} steps • {workflow.steps.reduce((acc, step) => {
                              const time = parseInt(step.estimatedTime || '0');
                              return acc + time;
                            }, 0)} min
                          </span>
                          <span className={`text-${workflow.color} font-medium group-hover:translate-x-1 
                                           transition-transform inline-flex items-center text-sm`}>
                            {progress > 0 ? 'Continue' : 'Start'}
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                    d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-elevated rounded-xl p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-100 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center">
                      <span className="text-sm">
                        {activity.type === 'workflow' ? '🔄' : 
                         activity.type === 'tool' ? '🛠️' : '📤'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-200">{activity.name}</div>
                      <div className="text-xs text-neutral-500">
                        {activity.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-elevated rounded-xl p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-100 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/dev-center/performance/measure')}
                  className="w-full p-3 bg-background hover:bg-neutral-800 rounded-lg 
                             border border-neutral-700 hover:border-neutral-600 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🔍</span>
                    <div>
                      <div className="text-sm font-medium text-neutral-200">Run Validation</div>
                      <div className="text-xs text-neutral-500">Check system health</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full p-3 bg-background hover:bg-neutral-800 rounded-lg 
                             border border-neutral-700 hover:border-neutral-600 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🚀</span>
                    <div>
                      <div className="text-sm font-medium text-neutral-200">Production</div>
                      <div className="text-xs text-neutral-500">Launch live dashboard</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/dev-center/theme/color-harmony')}
                  className="w-full p-3 bg-background hover:bg-neutral-800 rounded-lg 
                             border border-neutral-700 hover:border-neutral-600 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🎨</span>
                    <div>
                      <div className="text-sm font-medium text-neutral-200">Theme Editor</div>
                      <div className="text-xs text-neutral-500">Quick theme changes</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-elevated rounded-xl p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-100 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Build Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sm text-success">Healthy</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Bundle Size</span>
                  <span className="text-sm text-neutral-200">
                    {performanceMetrics ? `${(performanceMetrics.bundleSize / 1024).toFixed(0)}KB` : '187KB'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Performance</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      performanceMetrics?.score >= 80 ? 'bg-success' : 
                      performanceMetrics?.score >= 60 ? 'bg-warning' : 'bg-error'
                    }`}></div>
                    <span className={`text-sm ${
                      performanceMetrics?.score >= 80 ? 'text-success' : 
                      performanceMetrics?.score >= 60 ? 'text-warning' : 'text-error'
                    }`}>
                      {performanceMetrics?.score >= 80 ? 'Excellent' : 
                       performanceMetrics?.score >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}