import React, { useState } from 'react';
import useValidation from '../../hooks/useValidation';
import { ValidationResult } from '../../scripts/validation/core/reporter';

export default function ValidationRunner() {
  const {
    state,
    runQuickValidation,
    runFullValidation,
    runThemeValidation,
    runPerformanceValidation,
    runAccessibilityValidation,
    runStaticAnalysis,
    clearResults,
    exportResults,
  } = useValidation();

  const [selectedExportFormat, setSelectedExportFormat] = useState<'json' | 'html' | 'csv'>('json');

  const validationTypes = [
    {
      id: 'quick',
      name: 'Quick Validation',
      description: 'Guidelines + Architecture (Fast)',
      icon: '⚡',
      color: 'primary',
      action: runQuickValidation,
    },
    {
      id: 'full',
      name: 'Full Validation',
      description: 'Complete validation suite',
      icon: '🔍',
      color: 'secondary',
      action: runFullValidation,
    },
    {
      id: 'theme',
      name: 'Theme Validation',
      description: 'Theme consistency and structure',
      icon: '🎨',
      color: 'success',
      action: runThemeValidation,
    },
    {
      id: 'performance',
      name: 'Performance Testing',
      description: 'Runtime performance metrics',
      icon: '🚀',
      color: 'warning',
      action: runPerformanceValidation,
    },
    {
      id: 'accessibility',
      name: 'Accessibility Checks',
      description: 'A11y compliance validation',
      icon: '♿',
      color: 'info',
      action: runAccessibilityValidation,
    },
    {
      id: 'static',
      name: 'Static Analysis',
      description: 'Code structure and guidelines',
      icon: '📋',
      color: 'neutral',
      action: runStaticAnalysis,
    },
  ];

  const handleRunValidation = async (validationType: typeof validationTypes[0]) => {
    try {
      await validationType.action();
    } catch (error) {
      console.error(`❌ ${validationType.name} failed:`, error);
    }
  };

  const handleExportResults = async () => {
    try {
      await exportResults(selectedExportFormat);
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-success';
      case 'fail':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-neutral-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-primary';
      default:
        return 'text-neutral-400';
    }
  };

  const resultsByType = state.results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, ValidationResult[]>);

  const summary = {
    total: state.results.length,
    passed: state.results.filter(r => r.status === 'pass').length,
    failed: state.results.filter(r => r.status === 'fail').length,
    warnings: state.results.filter(r => r.status === 'warning').length,
  };

  return (
    <div className="bg-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mr-4">
            <span className="text-2xl">🔍</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-warning">Validation Runner</h2>
            <p className="text-neutral-400">Comprehensive validation system with detailed error reporting</p>
          </div>
        </div>
        
        {state.results.length > 0 && (
          <div className="flex items-center space-x-2">
            <select
              value={selectedExportFormat}
              onChange={(e) => setSelectedExportFormat(e.target.value as 'json' | 'html' | 'csv')}
              className="input text-sm"
            >
              <option value="json">JSON</option>
              <option value="html">HTML</option>
              <option value="csv">CSV</option>
            </select>
            <button
              onClick={handleExportResults}
              className="btn btn-secondary text-sm"
              disabled={state.isRunning}
            >
              📄 Export
            </button>
            <button
              onClick={clearResults}
              className="btn btn-danger text-sm"
              disabled={state.isRunning}
            >
              🗑️ Clear
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {validationTypes.map((validationType) => (
          <button
            key={validationType.id}
            onClick={() => handleRunValidation(validationType)}
            disabled={state.isRunning}
            className={`p-4 bg-surface rounded-lg border border-neutral-700 text-left
                       hover:border-${validationType.color}/50 hover:bg-${validationType.color}/10
                       transition-all duration-base disabled:opacity-50 disabled:cursor-not-allowed
                       ${state.isRunning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{validationType.icon}</span>
              <h3 className={`font-medium text-${validationType.color}`}>
                {validationType.name}
              </h3>
            </div>
            <p className="text-sm text-neutral-400">
              {validationType.description}
            </p>
          </button>
        ))}
      </div>

      {state.isRunning && (
        <div className="mb-6 p-4 bg-surface rounded-lg border border-neutral-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">Running Validation...</span>
            <span className="text-sm text-neutral-400">{state.progress}%</span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2 mb-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          {state.currentValidator && (
            <p className="text-xs text-neutral-400">
              Current: {state.currentValidator}
            </p>
          )}
        </div>
      )}

      {state.error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-danger text-xl mr-2">❌</span>
            <h3 className="font-medium text-danger">Validation Error</h3>
          </div>
          <p className="text-danger text-sm">{state.error}</p>
          <div className="mt-2 text-xs text-danger/80">
            Full error details are logged to console for debugging
          </div>
        </div>
      )}

      {state.results.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-surface rounded-lg border border-neutral-700 text-center">
              <div className="text-2xl font-bold text-neutral-300">{summary.total}</div>
              <div className="text-sm text-neutral-400">Total</div>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-neutral-700 text-center">
              <div className="text-2xl font-bold text-success">{summary.passed}</div>
              <div className="text-sm text-neutral-400">Passed</div>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-neutral-700 text-center">
              <div className="text-2xl font-bold text-danger">{summary.failed}</div>
              <div className="text-sm text-neutral-400">Failed</div>
            </div>
            <div className="p-4 bg-surface rounded-lg border border-neutral-700 text-center">
              <div className="text-2xl font-bold text-warning">{summary.warnings}</div>
              <div className="text-sm text-neutral-400">Warnings</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary">Validation Results</h3>
            
            {Object.entries(resultsByType).map(([type, results]) => (
              <div key={type} className="bg-surface rounded-lg border border-neutral-700">
                <div className="p-4 border-b border-neutral-700">
                  <h4 className="font-medium text-primary capitalize">
                    {type} Validation ({results.length})
                  </h4>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div
                        key={`${result.id}-${index}`}
                        className="flex items-start justify-between p-3 bg-background rounded border border-neutral-700"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-lg">{getStatusIcon(result.status)}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-neutral-300">{result.name}</span>
                              <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(result.severity)} bg-${result.severity === 'error' ? 'danger' : result.severity === 'warning' ? 'warning' : 'primary'}/20`}>
                                {result.severity}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-400 mt-1">{result.message}</p>
                            {result.details && (
                              <details className="mt-2">
                                <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400">
                                  Show Details
                                </summary>
                                <pre className="text-xs text-neutral-600 mt-1 whitespace-pre-wrap">
                                  {result.details}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-neutral-500">
                          <span>{result.duration}ms</span>
                          <span className={getStatusColor(result.status)}>
                            {result.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.results.length === 0 && !state.isRunning && !state.error && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-medium text-neutral-300 mb-2">
            Ready to Validate
          </h3>
          <p className="text-neutral-400 max-w-md mx-auto">
            Choose a validation type above to run comprehensive checks on your codebase. 
            All validation failures will be displayed with full error details and stack traces.
          </p>
        </div>
      )}
    </div>
  );
}