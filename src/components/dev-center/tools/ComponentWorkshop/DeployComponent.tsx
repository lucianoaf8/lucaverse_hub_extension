import React, { useState } from 'react';

interface DeploymentTarget {
  id: string;
  name: string;
  type: 'storybook' | 'npm' | 'github' | 'production';
  status: 'ready' | 'deploying' | 'deployed' | 'failed';
  url?: string;
}

export default function DeployComponent() {
  const [activeTab, setActiveTab] = useState<'export' | 'deploy' | 'documentation'>('export');
  const [deploymentTargets, setDeploymentTargets] = useState<DeploymentTarget[]>([
    { id: 'storybook', name: 'Storybook', type: 'storybook', status: 'ready' },
    { id: 'npm', name: 'NPM Package', type: 'npm', status: 'ready' },
    { id: 'github', name: 'GitHub Repository', type: 'github', status: 'ready' },
    { id: 'production', name: 'Production App', type: 'production', status: 'ready' }
  ]);
  
  const [exportCode, setExportCode] = useState(`// Button.tsx
import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick,
  children 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-600 text-white focus:ring-primary/50',
    secondary: 'bg-secondary hover:bg-secondary-600 text-white focus:ring-secondary/50',
    danger: 'bg-danger hover:bg-danger-600 text-white focus:ring-danger/50'
  };
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}`);
  
  const deployToTarget = async (targetId: string) => {
    setDeploymentTargets(prev => prev.map(target => 
      target.id === targetId ? { ...target, status: 'deploying' } : target
    ));
    
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setDeploymentTargets(prev => prev.map(target => 
      target.id === targetId ? { 
        ...target, 
        status: 'deployed',
        url: `https://${target.name.toLowerCase().replace(' ', '-')}.example.com/button`
      } : target
    ));
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-neutral-400';
      case 'deploying': return 'text-warning';
      case 'deployed': return 'text-success';
      case 'failed': return 'text-danger';
      default: return 'text-neutral-400';
    }
  };
  
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-neutral-700';
      case 'deploying': return 'bg-warning/20';
      case 'deployed': return 'bg-success/20';
      case 'failed': return 'bg-danger/20';
      default: return 'bg-neutral-700';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Deployment Status */}
      <div className="bg-elevated rounded-xl p-6">
        <h3 className="text-xl font-semibold text-neutral-100 mb-4">Deployment Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deploymentTargets.map((target) => (
            <div key={target.id} className="bg-background rounded-lg p-4 border border-neutral-600">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusBg(target.status)}`}>
                    {target.status === 'deployed' && <div className="w-full h-full bg-success rounded-full" />}
                    {target.status === 'deploying' && <div className="w-full h-full bg-warning rounded-full animate-pulse" />}
                    {target.status === 'failed' && <div className="w-full h-full bg-danger rounded-full" />}
                  </div>
                  <h4 className="font-medium text-neutral-200">{target.name}</h4>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(target.status)}`}>
                  {target.status.toUpperCase()}
                </span>
              </div>
              
              {target.url && (
                <div className="mb-3">
                  <a 
                    href={target.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary-400 transition-colors"
                  >
                    {target.url}
                  </a>
                </div>
              )}
              
              <button
                onClick={() => deployToTarget(target.id)}
                disabled={target.status === 'deploying'}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  target.status === 'deployed' 
                    ? 'bg-success hover:bg-success-600 text-white' 
                    : target.status === 'deploying'
                    ? 'bg-warning/50 text-warning cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-600 text-white'
                }`}
              >
                {target.status === 'deployed' ? 'Redeploy' : 
                 target.status === 'deploying' ? 'Deploying...' : 'Deploy'}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'export' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Export Code
        </button>
        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'deploy' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Deploy Settings
        </button>
        <button
          onClick={() => setActiveTab('documentation')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'documentation' 
              ? 'bg-primary text-white' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Documentation
        </button>
      </div>
      
      {/* Content */}
      <div className="bg-elevated rounded-xl p-6">
        {activeTab === 'export' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Export Component</h3>
            <p className="text-neutral-400">
              Export your component code for use in production applications.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-300">Component Code</label>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                                     rounded text-sm transition-colors">
                    Copy
                  </button>
                  <button className="px-3 py-1 bg-primary hover:bg-primary-600 text-white 
                                     rounded text-sm transition-colors">
                    Download
                  </button>
                </div>
              </div>
              
              <textarea
                value={exportCode}
                onChange={(e) => setExportCode(e.target.value)}
                className="w-full h-96 px-4 py-3 bg-background border border-neutral-600 rounded-lg 
                           text-sm text-neutral-200 font-mono resize-none focus:border-primary focus:outline-none"
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4 border border-neutral-600">
                <h4 className="font-medium text-neutral-200 mb-2">TypeScript</h4>
                <p className="text-sm text-neutral-400 mb-3">Full TypeScript support with proper type definitions</p>
                <button className="w-full px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                                   rounded text-sm transition-colors">
                  Export .tsx
                </button>
              </div>
              
              <div className="bg-background rounded-lg p-4 border border-neutral-600">
                <h4 className="font-medium text-neutral-200 mb-2">JavaScript</h4>
                <p className="text-sm text-neutral-400 mb-3">Plain JavaScript version without types</p>
                <button className="w-full px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                                   rounded text-sm transition-colors">
                  Export .jsx
                </button>
              </div>
              
              <div className="bg-background rounded-lg p-4 border border-neutral-600">
                <h4 className="font-medium text-neutral-200 mb-2">Package</h4>
                <p className="text-sm text-neutral-400 mb-3">Complete package with dependencies</p>
                <button className="w-full px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                                   rounded text-sm transition-colors">
                  Export .zip
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Deployment Settings</h3>
            <p className="text-neutral-400">
              Configure deployment targets and settings for your component.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Build Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Build Tool</label>
                    <select className="w-full px-3 py-2 bg-background border border-neutral-600 rounded 
                                     text-neutral-200 focus:border-primary focus:outline-none">
                      <option value="vite">Vite</option>
                      <option value="webpack">Webpack</option>
                      <option value="rollup">Rollup</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Target Format</label>
                    <select className="w-full px-3 py-2 bg-background border border-neutral-600 rounded 
                                     text-neutral-200 focus:border-primary focus:outline-none">
                      <option value="esm">ES Modules</option>
                      <option value="cjs">CommonJS</option>
                      <option value="umd">UMD</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-200">Deployment Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary rounded" defaultChecked />
                    <span className="text-sm text-neutral-300">Include source maps</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary rounded" defaultChecked />
                    <span className="text-sm text-neutral-300">Minify output</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary rounded" />
                    <span className="text-sm text-neutral-300">Tree shaking</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="w-4 h-4 text-primary rounded" />
                    <span className="text-sm text-neutral-300">Generate .d.ts files</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'documentation' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Component Documentation</h3>
            <p className="text-neutral-400">
              Generate comprehensive documentation for your component.
            </p>
            
            <div className="bg-background rounded-lg p-4 border border-neutral-600">
              <h4 className="font-medium text-neutral-200 mb-4">Generated Documentation</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-medium text-neutral-300">Button Component</h5>
                  <p className="text-neutral-400">A reusable button component with multiple variants and sizes.</p>
                </div>
                
                <div>
                  <h5 className="font-medium text-neutral-300">Props</h5>
                  <div className="bg-neutral-800 rounded p-3 font-mono text-xs">
                    <div className="text-primary">variant?: 'primary' | 'secondary' | 'danger'</div>
                    <div className="text-primary">size?: 'small' | 'medium' | 'large'</div>
                    <div className="text-primary">disabled?: boolean</div>
                    <div className="text-primary">onClick?: () ={">"} void</div>
                    <div className="text-primary">children: React.ReactNode</div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium text-neutral-300">Usage</h5>
                  <div className="bg-neutral-800 rounded p-3 font-mono text-xs">
                    <div className="text-neutral-300">{'<Button variant="primary" size="medium" onClick={handleClick}>'}</div>
                    <div className="text-neutral-300">{'  Click me'}</div>
                    <div className="text-neutral-300">{'</Button>'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Component ready for deployment</span>
        </div>
        
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                             rounded-lg transition-colors">
            Save Draft
          </button>
          <button className="px-4 py-2 bg-success hover:bg-success-600 text-white 
                             rounded-lg transition-colors font-medium">
            Deploy to Production
          </button>
        </div>
      </div>
    </div>
  );
}