import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDevWorkflow } from '../contexts/DevWorkflowContext';
import { workflows } from '../config/workflows';

export default function DevToolbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWorkflow, getCurrentWorkflow } = useDevWorkflow();
  
  const currentWorkflow = getCurrentWorkflow();
  const isInWorkflow = activeWorkflow && location.pathname.includes(`/dev-center/${activeWorkflow}`);
  
  const toolbarItems = [
    { id: 'back', icon: '←', label: 'Back', action: () => navigate('/dev-center') },
    { id: 'theme', icon: '🎨', label: 'Theme', action: () => navigate('/dev-center/theme/color-harmony') },
    { id: 'components', icon: '📦', label: 'Components', action: () => navigate('/dev-center/component/build') },
    { id: 'layout', icon: '📐', label: 'Layout', action: () => navigate('/dev-center/layout/structure') },
    { id: 'quality', icon: '✅', label: 'Quality', action: () => navigate('/dev-center/performance/measure') },
  ];
  
  // Only show toolbar when in a workflow
  if (!isInWorkflow) {
    return null;
  }
  
  return (
    <div className="bg-elevated border-b border-neutral-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Main Navigation */}
          <div className="flex items-center space-x-1">
            {toolbarItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                  item.id === activeWorkflow || 
                  (item.id === 'back' && location.pathname === '/dev-center') ||
                  (item.id === 'theme' && activeWorkflow === 'theme') ||
                  (item.id === 'components' && activeWorkflow === 'component') ||
                  (item.id === 'layout' && activeWorkflow === 'layout') ||
                  (item.id === 'quality' && activeWorkflow === 'performance')
                    ? 'bg-primary text-white' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* Workflow Info */}
          {currentWorkflow && (
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-neutral-200">
                  {currentWorkflow.name}
                </div>
                <div className="text-xs text-neutral-500">
                  {currentWorkflow.steps.length} steps • Est. {
                    currentWorkflow.steps.reduce((acc, step) => 
                      acc + parseInt(step.estimatedTime || '0'), 0
                    )
                  } min
                </div>
              </div>
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-lg">{currentWorkflow.icon}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}