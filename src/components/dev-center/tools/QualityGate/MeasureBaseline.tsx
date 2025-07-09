import React, { useState, useEffect } from 'react';

interface BaselineMetric {
  id: string;
  name: string;
  category: 'performance' | 'accessibility' | 'quality' | 'security';
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

export default function MeasureBaseline() {
  const [metrics, setMetrics] = useState<BaselineMetric[]>([]);
  const [measuring, setMeasuring] = useState(false);
  const [lastMeasured, setLastMeasured] = useState<Date | null>(null);
  
  const baselineMetrics: BaselineMetric[] = [
    { id: 'fcp', name: 'First Contentful Paint', category: 'performance', value: 0, unit: 'ms', threshold: 1800, status: 'good' },
    { id: 'lcp', name: 'Largest Contentful Paint', category: 'performance', value: 0, unit: 'ms', threshold: 2500, status: 'good' },
    { id: 'cls', name: 'Cumulative Layout Shift', category: 'performance', value: 0, unit: '', threshold: 0.1, status: 'good' },
    { id: 'fid', name: 'First Input Delay', category: 'performance', value: 0, unit: 'ms', threshold: 100, status: 'good' },
    { id: 'bundle-size', name: 'Bundle Size', category: 'performance', value: 0, unit: 'KB', threshold: 250, status: 'good' },
    { id: 'accessibility', name: 'Accessibility Score', category: 'accessibility', value: 0, unit: '%', threshold: 90, status: 'good' },
    { id: 'lighthouse', name: 'Lighthouse Score', category: 'quality', value: 0, unit: '%', threshold: 90, status: 'good' },
    { id: 'security', name: 'Security Score', category: 'security', value: 0, unit: '%', threshold: 95, status: 'good' },
  ];
  
  useEffect(() => {
    setMetrics(baselineMetrics);
  }, []);
  
  const runMeasurement = async () => {
    setMeasuring(true);
    
    // Simulate measurement process
    const steps = [
      'Analyzing bundle size...',
      'Running Lighthouse audit...',
      'Checking accessibility...',
      'Measuring performance...',
      'Evaluating security...'
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(step);
    }
    
    // Simulate realistic measurements
    const updatedMetrics = baselineMetrics.map(metric => {
      let value: number;
      let status: 'good' | 'warning' | 'critical';
      
      switch (metric.id) {
        case 'fcp':
          value = Math.random() * 2000 + 800;
          status = value < 1800 ? 'good' : value < 3000 ? 'warning' : 'critical';
          break;
        case 'lcp':
          value = Math.random() * 3000 + 1500;
          status = value < 2500 ? 'good' : value < 4000 ? 'warning' : 'critical';
          break;
        case 'cls':
          value = Math.random() * 0.25;
          status = value < 0.1 ? 'good' : value < 0.25 ? 'warning' : 'critical';
          break;
        case 'fid':
          value = Math.random() * 150 + 50;
          status = value < 100 ? 'good' : value < 300 ? 'warning' : 'critical';
          break;
        case 'bundle-size':
          value = Math.random() * 200 + 150;
          status = value < 250 ? 'good' : value < 500 ? 'warning' : 'critical';
          break;
        case 'accessibility':
          value = Math.random() * 20 + 75;
          status = value >= 90 ? 'good' : value >= 70 ? 'warning' : 'critical';
          break;
        case 'lighthouse':
          value = Math.random() * 25 + 70;
          status = value >= 90 ? 'good' : value >= 70 ? 'warning' : 'critical';
          break;
        case 'security':
          value = Math.random() * 15 + 80;
          status = value >= 95 ? 'good' : value >= 80 ? 'warning' : 'critical';
          break;
        default:
          value = Math.random() * 100;
          status = 'good';
      }
      
      return { ...metric, value: Math.round(value * 100) / 100, status };
    });
    
    setMetrics(updatedMetrics);
    setLastMeasured(new Date());
    setMeasuring(false);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-danger';
      default: return 'text-neutral-400';
    }
  };
  
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-success/20';
      case 'warning': return 'bg-warning/20';
      case 'critical': return 'bg-danger/20';
      default: return 'bg-neutral-700';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '⚡';
      case 'accessibility': return '♿';
      case 'quality': return '🏆';
      case 'security': return '🔒';
      default: return '📊';
    }
  };
  
  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) acc[metric.category] = [];
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, BaselineMetric[]>);
  
  return (
    <div className="space-y-6">
      {/* Measurement Controls */}
      <div className="bg-elevated rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-neutral-100">Baseline Measurement</h3>
          <button
            onClick={runMeasurement}
            disabled={measuring}
            className="px-4 py-2 bg-primary hover:bg-primary-600 disabled:opacity-50 
                       disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {measuring ? 'Measuring...' : 'Run Measurement'}
          </button>
        </div>
        
        {lastMeasured && (
          <p className="text-sm text-neutral-400">
            Last measured: {lastMeasured.toLocaleString()}
          </p>
        )}
        
        {measuring && (
          <div className="mt-4 p-4 bg-background rounded-lg border border-neutral-600">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-neutral-300">Running comprehensive baseline measurement...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Metrics by Category */}
      <div className="space-y-6">
        {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
          <div key={category} className="bg-elevated rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{getCategoryIcon(category)}</span>
              <h3 className="text-xl font-semibold text-neutral-100 capitalize">{category}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryMetrics.map((metric) => (
                <div key={metric.id} className="bg-background rounded-lg p-4 border border-neutral-600">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-neutral-200">{metric.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBg(metric.status)} ${getStatusColor(metric.status)}`}>
                      {metric.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-neutral-100">
                      {metric.value}{metric.unit}
                    </span>
                    <span className="text-sm text-neutral-500">
                      Target: {metric.threshold}{metric.unit}
                    </span>
                  </div>
                  
                  <div className="mt-2 w-full bg-neutral-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metric.status === 'good' ? 'bg-success' : 
                        metric.status === 'warning' ? 'bg-warning' : 'bg-danger'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (metric.value / metric.threshold) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Baseline Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {metrics.filter(m => m.status === 'good').length}
            </div>
            <div className="text-sm text-neutral-400">Good</div>
          </div>
          
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {metrics.filter(m => m.status === 'warning').length}
            </div>
            <div className="text-sm text-neutral-400">Warning</div>
          </div>
          
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-danger">
              {metrics.filter(m => m.status === 'critical').length}
            </div>
            <div className="text-sm text-neutral-400">Critical</div>
          </div>
          
          <div className="bg-background rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round((metrics.filter(m => m.status === 'good').length / metrics.length) * 100)}%
            </div>
            <div className="text-sm text-neutral-400">Overall Score</div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Baseline measurement {lastMeasured ? 'complete' : 'ready'}</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                             rounded-lg transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-success hover:bg-success-600 text-white 
                             rounded-lg transition-colors font-medium">
            Save Baseline
          </button>
        </div>
      </div>
    </div>
  );
}