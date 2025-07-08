import { useState, useCallback } from 'react';
import { ValidationOptions, ValidatorModule } from '../../scripts/validation/core/runner';
import { ValidationResult } from '../../scripts/validation/core/reporter';

export interface ValidationState {
  isRunning: boolean;
  results: ValidationResult[];
  error: string | null;
  progress: number;
  currentValidator: string | null;
}

export interface ValidationHookReturn {
  state: ValidationState;
  runQuickValidation: () => Promise<void>;
  runFullValidation: () => Promise<void>;
  runThemeValidation: () => Promise<void>;
  runPerformanceValidation: () => Promise<void>;
  runAccessibilityValidation: () => Promise<void>;
  runStaticAnalysis: () => Promise<void>;
  runRuntimeChecks: () => Promise<void>;
  clearResults: () => void;
  exportResults: (format: 'json' | 'html' | 'csv') => Promise<void>;
}

export default function useValidation(): ValidationHookReturn {
  const [state, setState] = useState<ValidationState>({
    isRunning: false,
    results: [],
    error: null,
    progress: 0,
    currentValidator: null,
  });

  const updateState = useCallback((updates: Partial<ValidationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const runValidation = useCallback(async (
    options: ValidationOptions,
    description: string
  ): Promise<void> => {
    if (state.isRunning) {
      throw new Error('Validation is already running');
    }

    updateState({
      isRunning: true,
      results: [],
      error: null,
      progress: 0,
      currentValidator: null,
    });

    try {
      console.log(`🚀 Starting ${description}...`);
      
      // Create a simplified validation runner for the UI
      const results: ValidationResult[] = [];
      const validators = await getValidators(options);
      
      for (let i = 0; i < validators.length; i++) {
        const validator = validators[i];
        updateState({
          progress: Math.round((i / validators.length) * 100),
          currentValidator: validator.name,
        });

        try {
          const validatorResults = await validator.validate({} as unknown, options);
          results.push(...validatorResults);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          const errorResult: ValidationResult = {
            id: `${validator.name}-error`,
            name: validator.name,
            type: validator.type,
            status: 'fail',
            message: `Validator failed: ${error instanceof Error ? error.message : String(error)}`,
            duration: 0,
            severity: 'error',
          };
          results.push(errorResult);
        }
      }

      // Check for critical failures
      const criticalFailures = results.filter(r => r.status === 'fail' && r.severity === 'error');
      if (criticalFailures.length > 0) {
        throw new Error(`Validation failed with ${criticalFailures.length} critical errors`);
      }

      updateState({
        isRunning: false,
        results: results,
        progress: 100,
        currentValidator: null,
      });

      console.log(`✅ ${description} completed successfully`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${description} failed:`, errorMessage);
      
      updateState({
        isRunning: false,
        error: errorMessage,
        progress: 0,
        currentValidator: null,
      });
      
      throw error;
    }
  }, [state.isRunning, updateState]);

  const runQuickValidation = useCallback(async () => {
    await runValidation({
      mode: 'development',
      scope: 'quick',
      fix: false,
      watch: false,
      parallel: true,
      exclude: [],
      include: ['guideline', 'architecture'],
    }, 'Quick Validation');
  }, [runValidation]);

  const runFullValidation = useCallback(async () => {
    await runValidation({
      mode: 'development',
      scope: 'full',
      fix: false,
      watch: false,
      parallel: true,
      exclude: [],
      include: [],
    }, 'Full Validation Suite');
  }, [runValidation]);

  const runThemeValidation = useCallback(async () => {
    await runValidation({
      mode: 'development',
      scope: 'custom',
      fix: false,
      watch: false,
      parallel: false,
      exclude: [],
      include: ['theme'],
    }, 'Theme Validation');
  }, [runValidation]);

  const runPerformanceValidation = useCallback(async () => {
    await runValidation({
      mode: 'development',
      scope: 'custom',
      fix: false,
      watch: false,
      parallel: false,
      exclude: [],
      include: ['performance'],
    }, 'Performance Testing');
  }, [runValidation]);

  const runAccessibilityValidation = useCallback(async () => {
    await runValidation({
      mode: 'development',
      scope: 'custom',
      fix: false,
      watch: false,
      parallel: false,
      exclude: [],
      include: ['accessibility'],
    }, 'Accessibility Checks');
  }, [runValidation]);

  const runStaticAnalysis = useCallback(async () => {
    await runValidation({
      mode: 'development',
      scope: 'custom',
      fix: false,
      watch: false,
      parallel: true,
      exclude: [],
      include: ['guideline', 'architecture', 'theme'],
    }, 'Static Analysis');
  }, [runValidation]);

  const runRuntimeChecks = useCallback(async () => {
    await runValidation({
      mode: 'development',
      scope: 'custom',
      fix: false,
      watch: false,
      parallel: false,
      exclude: [],
      include: ['health', 'performance'],
    }, 'Runtime Checks');
  }, [runValidation]);

  const clearResults = useCallback(() => {
    updateState({
      results: [],
      error: null,
      progress: 0,
      currentValidator: null,
    });
  }, [updateState]);

  const exportResults = useCallback(async (format: 'json' | 'html' | 'csv') => {
    if (state.results.length === 0) {
      throw new Error('No results to export');
    }

    try {
      const filename = `validation-results-${Date.now()}.${format}`;
      let content: string;

      switch (format) {
        case 'json':
          content = JSON.stringify({
            timestamp: new Date().toISOString(),
            results: state.results,
            summary: {
              total: state.results.length,
              passed: state.results.filter(r => r.status === 'pass').length,
              failed: state.results.filter(r => r.status === 'fail').length,
              warnings: state.results.filter(r => r.status === 'warning').length,
            }
          }, null, 2);
          break;
        
        case 'html':
          content = generateHtmlReport(state.results);
          break;
        
        case 'csv':
          content = generateCsvReport(state.results);
          break;
        
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      const blob = new Blob([content], { type: getMimeType(format) });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      console.log(`📄 Exported results to ${filename}`);
    } catch (error) {
      console.error('❌ Export failed:', error);
      throw error;
    }
  }, [state.results]);

  return {
    state,
    runQuickValidation,
    runFullValidation,
    runThemeValidation,
    runPerformanceValidation,
    runAccessibilityValidation,
    runStaticAnalysis,
    runRuntimeChecks,
    clearResults,
    exportResults,
  };
}

// Helper functions
async function getValidators(options: ValidationOptions): Promise<ValidatorModule[]> {
  try {
    // Import and register validators dynamically
    // Note: In a real implementation, you'd import the actual validator functions
    // For now, we'll create mock validators to demonstrate the interface
    
    const validators: ValidatorModule[] = [
      {
        name: 'guideline-checker',
        type: 'static',
        validate: async () => [
          {
            id: 'guideline-1',
            name: 'Guideline Checker',
            type: 'static',
            status: 'pass',
            message: 'All guidelines followed',
            duration: 150,
            severity: 'info',
          }
        ]
      },
      {
        name: 'architecture-validator',
        type: 'static',
        validate: async () => [
          {
            id: 'architecture-1',
            name: 'Architecture Validator',
            type: 'static',
            status: 'pass',
            message: 'Architecture is valid',
            duration: 300,
            severity: 'info',
          }
        ]
      },
      {
        name: 'theme-validator',
        type: 'static',
        validate: async () => [
          {
            id: 'theme-1',
            name: 'Theme Validator',
            type: 'static',
            status: 'pass',
            message: 'Theme configuration is valid',
            duration: 200,
            severity: 'info',
          }
        ]
      },
      {
        name: 'accessibility-checker',
        type: 'static',
        validate: async () => [
          {
            id: 'accessibility-1',
            name: 'Accessibility Checker',
            type: 'static',
            status: 'warning',
            message: 'Some accessibility improvements recommended',
            duration: 400,
            severity: 'warning',
          }
        ]
      },
      {
        name: 'performance-tracker',
        type: 'runtime',
        validate: async () => [
          {
            id: 'performance-1',
            name: 'Performance Tracker',
            type: 'runtime',
            status: 'pass',
            message: 'Performance metrics within acceptable range',
            duration: 500,
            severity: 'info',
          }
        ]
      },
      {
        name: 'health-monitor',
        type: 'runtime',
        validate: async () => [
          {
            id: 'health-1',
            name: 'Health Monitor',
            type: 'runtime',
            status: 'pass',
            message: 'Application health is good',
            duration: 100,
            severity: 'info',
          }
        ]
      }
    ];

    // Filter validators based on include/exclude patterns
    const filteredValidators = validators.filter(validator => {
      if (options.include.length > 0) {
        return options.include.some(pattern => validator.name.includes(pattern));
      }
      if (options.exclude.length > 0) {
        return !options.exclude.some(pattern => validator.name.includes(pattern));
      }
      return true;
    });

    return filteredValidators;
    
  } catch (error) {
    console.error('❌ Failed to get validators:', error);
    throw error;
  }
}

function getMimeType(format: string): string {
  switch (format) {
    case 'json':
      return 'application/json';
    case 'html':
      return 'text/html';
    case 'csv':
      return 'text/csv';
    default:
      return 'text/plain';
  }
}

function generateHtmlReport(results: ValidationResult[]): string {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .warning { color: #ffc107; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Validation Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total: ${results.length}</p>
        <p class="pass">Passed: ${passed}</p>
        <p class="fail">Failed: ${failed}</p>
        <p class="warning">Warnings: ${warnings}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <h2>Results</h2>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Message</th>
                <th>Duration</th>
                <th>Severity</th>
            </tr>
        </thead>
        <tbody>
            ${results.map(result => `
                <tr>
                    <td>${result.name}</td>
                    <td class="${result.status}">${result.status.toUpperCase()}</td>
                    <td>${result.message}</td>
                    <td>${result.duration}ms</td>
                    <td>${result.severity}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>
  `;
}

function generateCsvReport(results: ValidationResult[]): string {
  const headers = ['Name', 'Status', 'Message', 'Duration', 'Severity', 'Type'];
  const rows = results.map(result => [
    result.name,
    result.status,
    result.message,
    result.duration.toString(),
    result.severity,
    result.type
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}