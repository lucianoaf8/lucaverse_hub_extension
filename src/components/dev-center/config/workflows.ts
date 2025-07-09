import { Workflow } from '../types/workflow.types';

export const workflows: Record<string, Workflow> = {
  theme: {
    id: 'theme',
    name: 'Theme Development',
    description: 'Design and test your application theme',
    icon: '🎨',
    color: 'primary',
    steps: [
      {
        id: 'color-harmony',
        title: 'Color Harmony',
        description: 'Define color palette and relationships',
        toolId: 'color-harmony',
        estimatedTime: '5 min'
      },
      {
        id: 'typography',
        title: 'Typography',
        description: 'Set up font families and text styles',
        toolId: 'typography',
        estimatedTime: '5 min'
      },
      {
        id: 'spacing',
        title: 'Spacing & Layout',
        description: 'Configure spacing system and layout tokens',
        toolId: 'spacing-layout',
        estimatedTime: '3 min'
      },
      {
        id: 'effects',
        title: 'Effects & Animation',
        description: 'Fine-tune shadows, blurs, and transitions',
        toolId: 'effects-animation',
        estimatedTime: '3 min'
      }
    ]
  },
  component: {
    id: 'component',
    name: 'Component Testing',
    description: 'Build and test UI components',
    icon: '📦',
    color: 'secondary',
    steps: [
      {
        id: 'build',
        title: 'Build Component',
        description: 'Create or modify component structure',
        toolId: 'component-workshop',
        estimatedTime: '10 min'
      },
      {
        id: 'test-states',
        title: 'Test States',
        description: 'Verify all component states and variants',
        toolId: 'component-workshop',
        estimatedTime: '5 min'
      },
      {
        id: 'validate',
        title: 'Validate',
        description: 'Run accessibility and visual regression tests',
        toolId: 'quality-gate',
        estimatedTime: '2 min'
      },
      {
        id: 'deploy',
        title: 'Deploy',
        description: 'Export component for production use',
        toolId: 'component-workshop',
        estimatedTime: '1 min'
      }
    ]
  },
  layout: {
    id: 'layout',
    name: 'Layout Design',
    description: 'Create responsive dashboard layouts',
    icon: '📐',
    color: 'success',
    steps: [
      {
        id: 'structure',
        title: 'Structure',
        description: 'Define panel arrangement and hierarchy',
        toolId: 'structure',
        estimatedTime: '5 min'
      },
      {
        id: 'responsive',
        title: 'Responsive Design',
        description: 'Configure breakpoints and mobile behavior',
        toolId: 'responsive',
        estimatedTime: '5 min'
      },
      {
        id: 'interactive',
        title: 'Interactive Features',
        description: 'Add drag-drop and resize capabilities',
        toolId: 'interactive',
        estimatedTime: '3 min'
      },
      {
        id: 'optimize',
        title: 'Optimize',
        description: 'Performance tuning and final adjustments',
        toolId: 'optimize',
        estimatedTime: '2 min'
      }
    ]
  },
  performance: {
    id: 'performance',
    name: 'Performance Tuning',
    description: 'Optimize application performance',
    icon: '⚡',
    color: 'warning',
    steps: [
      {
        id: 'measure',
        title: 'Measure',
        description: 'Baseline performance metrics',
        toolId: 'measure',
        estimatedTime: '3 min'
      },
      {
        id: 'analyze',
        title: 'Analyze',
        description: 'Identify bottlenecks and issues',
        toolId: 'analyze',
        estimatedTime: '5 min'
      },
      {
        id: 'fix',
        title: 'Fix',
        description: 'Apply optimizations and improvements',
        toolId: 'fix',
        estimatedTime: '10 min'
      },
      {
        id: 'verify',
        title: 'Verify',
        description: 'Confirm performance improvements',
        toolId: 'verify',
        estimatedTime: '2 min'
      }
    ]
  }
};