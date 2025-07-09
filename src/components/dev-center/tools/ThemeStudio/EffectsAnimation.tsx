import React, { useState, useCallback } from 'react';

interface EffectProperty {
  id: string;
  name: string;
  value: string;
  cssVar: string;
  category: 'shadow' | 'blur' | 'transition' | 'animation';
}

export default function EffectsAnimation() {
  const [activeTab, setActiveTab] = useState<'shadows' | 'blurs' | 'transitions' | 'animations'>('shadows');
  const [effects, setEffects] = useState<EffectProperty[]>([
    // Shadow effects
    { id: 'shadow-sm', name: 'Small Shadow', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', cssVar: '--shadow-sm', category: 'shadow' },
    { id: 'shadow-md', name: 'Medium Shadow', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', cssVar: '--shadow-md', category: 'shadow' },
    { id: 'shadow-lg', name: 'Large Shadow', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', cssVar: '--shadow-lg', category: 'shadow' },
    { id: 'shadow-xl', name: 'Extra Large Shadow', value: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', cssVar: '--shadow-xl', category: 'shadow' },
    
    // Blur effects
    { id: 'blur-sm', name: 'Small Blur', value: '4px', cssVar: '--blur-sm', category: 'blur' },
    { id: 'blur-md', name: 'Medium Blur', value: '12px', cssVar: '--blur-md', category: 'blur' },
    { id: 'blur-lg', name: 'Large Blur', value: '16px', cssVar: '--blur-lg', category: 'blur' },
    
    // Transition effects
    { id: 'transition-fast', name: 'Fast Transition', value: '150ms', cssVar: '--transition-fast', category: 'transition' },
    { id: 'transition-base', name: 'Base Transition', value: '250ms', cssVar: '--transition-base', category: 'transition' },
    { id: 'transition-slow', name: 'Slow Transition', value: '500ms', cssVar: '--transition-slow', category: 'transition' },
  ]);
  
  const applyEffectChange = useCallback((effectId: string, newValue: string) => {
    const effect = effects.find(e => e.id === effectId);
    if (effect) {
      document.documentElement.style.setProperty(effect.cssVar, newValue);
      
      setEffects(prev => prev.map(e => 
        e.id === effectId ? { ...e, value: newValue } : e
      ));
    }
  }, [effects]);
  
  const resetToDefaults = () => {
    effects.forEach(effect => {
      document.documentElement.style.removeProperty(effect.cssVar);
    });
    window.location.reload();
  };
  
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-elevated rounded-lg p-1">
        {[
          { id: 'shadows', label: 'Box Shadows' },
          { id: 'blurs', label: 'Backdrop Blur' },
          { id: 'transitions', label: 'Transitions' },
          { id: 'animations', label: 'Animations' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="bg-elevated rounded-xl p-6">
        {activeTab === 'shadows' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Box Shadows</h3>
            <p className="text-neutral-400 mb-6">
              Configure shadow effects for depth and elevation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {effects.filter(e => e.category === 'shadow').map(shadow => (
                <div key={shadow.id} className="space-y-3">
                  <label className="text-sm font-medium text-neutral-300">{shadow.name}</label>
                  
                  <textarea
                    value={shadow.value}
                    onChange={(e) => applyEffectChange(shadow.id, e.target.value)}
                    className="w-full h-20 px-3 py-2 bg-background border border-neutral-600 rounded 
                               text-sm text-neutral-200 resize-none focus:border-primary focus:outline-none"
                    placeholder="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  />
                  
                  {/* Visual Preview */}
                  <div className="bg-background rounded border border-neutral-600 p-6">
                    <div 
                      className="bg-primary w-full h-16 rounded"
                      style={{ boxShadow: shadow.value }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'blurs' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Backdrop Blur</h3>
            <p className="text-neutral-400 mb-6">
              Configure blur effects for glassmorphism and overlays.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {effects.filter(e => e.category === 'blur').map(blur => (
                <div key={blur.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">{blur.name}</label>
                    <span className="text-xs text-neutral-500">{blur.value}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={parseInt(blur.value)}
                      onChange={(e) => applyEffectChange(blur.id, e.target.value + 'px')}
                      className="flex-1"
                    />
                    <input
                      type="text"
                      value={blur.value}
                      onChange={(e) => applyEffectChange(blur.id, e.target.value)}
                      className="w-20 px-2 py-1 bg-background border border-neutral-600 rounded 
                                 text-sm text-neutral-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                  
                  {/* Visual Preview */}
                  <div className="bg-background rounded border border-neutral-600 p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-50" />
                    <div 
                      className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded"
                      style={{ backdropFilter: `blur(${blur.value})` }}
                    />
                    <div className="relative z-10 p-4 text-center">
                      <span className="text-neutral-200 font-medium">Blur Effect</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'transitions' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Transitions</h3>
            <p className="text-neutral-400 mb-6">
              Configure transition durations and easing functions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {effects.filter(e => e.category === 'transition').map(transition => (
                <div key={transition.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">{transition.name}</label>
                    <span className="text-xs text-neutral-500">{transition.value}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={parseInt(transition.value)}
                      onChange={(e) => applyEffectChange(transition.id, e.target.value + 'ms')}
                      className="flex-1"
                    />
                    <input
                      type="text"
                      value={transition.value}
                      onChange={(e) => applyEffectChange(transition.id, e.target.value)}
                      className="w-20 px-2 py-1 bg-background border border-neutral-600 rounded 
                                 text-sm text-neutral-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                  
                  {/* Interactive Preview */}
                  <div className="bg-background rounded border border-neutral-600 p-4">
                    <div 
                      className="bg-primary w-16 h-16 rounded hover:scale-110 cursor-pointer"
                      style={{ transition: `transform ${transition.value} ease-in-out` }}
                    />
                    <p className="text-xs text-neutral-500 mt-2">Hover to test transition</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'animations' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-neutral-100">Animations</h3>
            <p className="text-neutral-400 mb-6">
              Configure keyframe animations and motion effects.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Fade In', 'Slide Up', 'Scale In', 'Bounce', 'Pulse', 'Spin'].map(animation => (
                <div key={animation} className="space-y-3">
                  <label className="text-sm font-medium text-neutral-300">{animation}</label>
                  
                  <div className="flex items-center space-x-3">
                    <select className="flex-1 px-3 py-2 bg-background border border-neutral-600 rounded 
                                     text-sm text-neutral-200 focus:border-primary focus:outline-none">
                      <option value="ease-in-out">Ease In Out</option>
                      <option value="ease-in">Ease In</option>
                      <option value="ease-out">Ease Out</option>
                      <option value="linear">Linear</option>
                    </select>
                    <input
                      type="text"
                      defaultValue="1s"
                      className="w-20 px-2 py-1 bg-background border border-neutral-600 rounded 
                                 text-sm text-neutral-200 focus:border-primary focus:outline-none"
                    />
                  </div>
                  
                  {/* Animation Preview */}
                  <div className="bg-background rounded border border-neutral-600 p-4">
                    <div 
                      className={`bg-primary w-16 h-16 rounded animate-${animation.toLowerCase().replace(' ', '-')}`}
                    />
                    <p className="text-xs text-neutral-500 mt-2">{animation} animation</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 text-sm text-neutral-500">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Changes applied instantly</span>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={resetToDefaults}
            className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 
                       rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
          <button className="px-4 py-2 bg-success hover:bg-success-600 text-white 
                             rounded-lg transition-colors font-medium">
            Export Effects
          </button>
        </div>
      </div>
    </div>
  );
}