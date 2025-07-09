import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevWorkflow } from '../contexts/DevWorkflowContext';
import SkeletonLoader from './SkeletonLoader';

interface WorkflowToolPageProps {
  children: React.ReactNode;
  toolId: string;
  loading?: boolean;
}

export default function WorkflowToolPage({ children, toolId, loading = false }: WorkflowToolPageProps) {
  const navigate = useNavigate();
  const { 
    getCurrentWorkflow, 
    getCurrentStep, 
    nextStep, 
    previousStep, 
    completeCurrentStep,
    currentStepIndex,
    completedSteps
  } = useDevWorkflow();
  
  const workflow = getCurrentWorkflow();
  const currentStep = getCurrentStep();
  
  useEffect(() => {
    if (!workflow) {
      navigate('/dev-center');
    }
  }, [workflow, navigate]);
  
  if (!workflow || !currentStep) {
    return null;
  }
  
  const isCurrentStepCompleted = completedSteps.includes(currentStep.id);
  const isLastStep = currentStepIndex === workflow.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  
  const handleNext = () => {
    if (!isCurrentStepCompleted) {
      completeCurrentStep();
    }
    if (!isLastStep) {
      nextStep();
      const nextStepData = workflow.steps[currentStepIndex + 1];
      navigate(`/dev-center/${workflow.id}/${nextStepData.toolId}`);
    } else {
      // Return to landing page when workflow is complete
      navigate('/dev-center');
    }
  };
  
  const handlePrevious = () => {
    if (!isFirstStep) {
      previousStep();
      const prevStepData = workflow.steps[currentStepIndex - 1];
      navigate(`/dev-center/${workflow.id}/${prevStepData.toolId}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="bg-elevated border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{workflow.icon}</span>
              <h2 className="text-xl font-semibold text-neutral-200">{workflow.name}</h2>
            </div>
            <button
              onClick={() => navigate('/dev-center')}
              className="text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Step Progress */}
          <div className="flex items-center space-x-2">
            {workflow.steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = completedSteps.includes(step.id);
              const isPast = index < currentStepIndex;
              
              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center space-x-2 ${isActive ? 'text-primary' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isActive ? 'bg-primary text-white' : 
                        isCompleted || isPast ? 'bg-success text-white' : 
                        'bg-neutral-700 text-neutral-400'}`}>
                      {isCompleted || isPast ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-primary font-medium' : 'text-neutral-400'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${isPast ? 'bg-success' : 'bg-neutral-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Current Step Info */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-100 mb-2">{currentStep.title}</h1>
          <p className="text-lg text-neutral-400">{currentStep.description}</p>
          {currentStep.estimatedTime && (
            <p className="text-sm text-neutral-500 mt-2">
              Estimated time: {currentStep.estimatedTime}
            </p>
          )}
        </div>
        
        {/* Tool Content */}
        <div className="mb-8">
          {loading ? (
            <SkeletonLoader variant="tool" />
          ) : (
            children
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-neutral-700 pt-6">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all
              ${isFirstStep 
                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' 
                : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-4">
            {!isCurrentStepCompleted && (
              <button
                onClick={completeCurrentStep}
                className="px-6 py-3 bg-success hover:bg-success-600 text-white rounded-lg 
                           transition-all font-medium"
              >
                Mark as Complete
              </button>
            )}
            
            <button
              onClick={handleNext}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-medium
                ${isLastStep 
                  ? 'bg-primary hover:bg-primary-600 text-white' 
                  : 'bg-primary hover:bg-primary-600 text-white'}`}
            >
              <span>{isLastStep ? 'Finish Workflow' : 'Next'}</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isLastStep ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}