import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { WorkflowType, DevWorkflowState, Workflow, WorkflowStep } from '../types/workflow.types';
import { workflows } from '../config/workflows';
import { useDevCenterStore } from '../state/DevCenterState';
import { devCenterSync } from '../state/synchronizer';

interface DevWorkflowContextValue extends DevWorkflowState {
  startWorkflow: (workflowId: WorkflowType) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeCurrentStep: () => void;
  setWorkflowData: (key: string, value: any) => void;
  getCurrentWorkflow: () => Workflow | null;
  getCurrentStep: () => WorkflowStep | null;
  resetWorkflow: () => void;
}

const DevWorkflowContext = createContext<DevWorkflowContextValue | undefined>(undefined);

export function DevWorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DevWorkflowState>({
    activeWorkflow: null,
    currentStepIndex: 0,
    completedSteps: [],
    workflowData: {}
  });

  // Initialize synchronization on mount
  useEffect(() => {
    devCenterSync.initialize();
  }, []);

  const startWorkflow = useCallback((workflowId: WorkflowType) => {
    setState({
      activeWorkflow: workflowId,
      currentStepIndex: 0,
      completedSteps: [],
      workflowData: {}
    });
    
    // Sync workflow start across tools
    devCenterSync.emit('workflow:started', { workflowId });
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.activeWorkflow) return prev;
      const workflow = workflows[prev.activeWorkflow];
      if (prev.currentStepIndex >= workflow.steps.length - 1) return prev;
      
      return {
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => {
      if (prev.currentStepIndex <= 0) return prev;
      return {
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1
      };
    });
  }, []);

  const completeCurrentStep = useCallback(() => {
    setState(prev => {
      if (!prev.activeWorkflow) return prev;
      const workflow = workflows[prev.activeWorkflow];
      const currentStep = workflow.steps[prev.currentStepIndex];
      
      if (prev.completedSteps.includes(currentStep.id)) return prev;
      
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, currentStep.id]
      };
    });
  }, []);

  const setWorkflowData = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      workflowData: {
        ...prev.workflowData,
        [key]: value
      }
    }));
  }, []);

  const getCurrentWorkflow = useCallback((): Workflow | null => {
    if (!state.activeWorkflow) return null;
    return workflows[state.activeWorkflow];
  }, [state.activeWorkflow]);

  const getCurrentStep = useCallback((): WorkflowStep | null => {
    if (!state.activeWorkflow) return null;
    const workflow = workflows[state.activeWorkflow];
    return workflow.steps[state.currentStepIndex] || null;
  }, [state.activeWorkflow, state.currentStepIndex]);

  const resetWorkflow = useCallback(() => {
    setState({
      activeWorkflow: null,
      currentStepIndex: 0,
      completedSteps: [],
      workflowData: {}
    });
  }, []);

  const value: DevWorkflowContextValue = {
    ...state,
    startWorkflow,
    nextStep,
    previousStep,
    completeCurrentStep,
    setWorkflowData,
    getCurrentWorkflow,
    getCurrentStep,
    resetWorkflow
  };

  return (
    <DevWorkflowContext.Provider value={value}>
      {children}
    </DevWorkflowContext.Provider>
  );
}

export function useDevWorkflow() {
  const context = useContext(DevWorkflowContext);
  if (!context) {
    throw new Error('useDevWorkflow must be used within DevWorkflowProvider');
  }
  return context;
}