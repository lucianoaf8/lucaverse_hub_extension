export type WorkflowType = 'theme' | 'component' | 'layout' | 'performance';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  toolId: string;
  estimatedTime?: string;
}

export interface Workflow {
  id: WorkflowType;
  name: string;
  description: string;
  icon: string;
  color: string;
  steps: WorkflowStep[];
}

export interface DevWorkflowState {
  activeWorkflow: WorkflowType | null;
  currentStepIndex: number;
  completedSteps: string[];
  workflowData: Record<string, any>;
}