import React, { useState } from 'react';
import { Layout } from '../components/common';
import DevNavigation from '../components/dev-center/DevNavigation';
import AnimationExamples from '../components/AnimationExamples';

export default function AnimationDemo() {
  const [selectedAnimation, setSelectedAnimation] = useState('fade-in');
  const [animationSpeed, setAnimationSpeed] = useState('base');
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  const animations = [
    { id: 'fade-in', name: 'Fade In', class: 'animate-fade-in', description: 'Smooth fade in animation' },
    { id: 'slide-up', name: 'Slide Up', class: 'animate-slide-up', description: 'Upward sliding motion' },
    { id: 'slide-down', name: 'Slide Down', class: 'animate-slide-down', description: 'Downward sliding motion' },
    { id: 'scale-up', name: 'Scale Up', class: 'animate-scale-up', description: 'Scaling up animation' },
    { id: 'bounce', name: 'Bounce', class: 'animate-bounce', description: 'Bouncing effect' },
  ];

  const timingOptions = [
    { id: 'fast', name: 'Fast', duration: '150ms' },
    { id: 'base', name: 'Base', duration: '300ms' },
    { id: 'slow', name: 'Slow', duration: '500ms' },
    { id: 'slower', name: 'Slower', duration: '1000ms' },
  ];

  const easingOptions = [
    { id: 'ease', name: 'Ease', curve: 'ease' },
    { id: 'ease-in', name: 'Ease In', curve: 'ease-in' },
    { id: 'ease-out', name: 'Ease Out', curve: 'ease-out' },
    { id: 'ease-in-out', name: 'Ease In-Out', curve: 'ease-in-out' },
    { id: 'linear', name: 'Linear', curve: 'linear' },
  ];

  const [key, setKey] = useState(0);

  const replayAnimation = () => {
    setKey(prev => prev + 1);
  };

  return (
    <Layout navigation={<DevNavigation />}>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4 animate-fade-in">
            Animation Showcase
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto animate-slide-up">
            Interactive animation controls and performance monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimationExamples />
          </div>

          <div className="space-y-6">
            <section className="bg-elevated rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-primary mb-4">Animation Controls</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Animation Type
                  </label>
                  <select
                    value={selectedAnimation}
                    onChange={(e) => setSelectedAnimation(e.target.value)}
                    className="input w-full"
                  >
                    {animations.map((animation) => (
                      <option key={animation.id} value={animation.id}>
                        {animation.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Speed
                  </label>
                  <select
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(e.target.value)}
                    className="input w-full"
                  >
                    {timingOptions.map((timing) => (
                      <option key={timing.id} value={timing.id}>
                        {timing.name} ({timing.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={replayAnimation}
                  className="w-full btn btn-primary"
                >
                  <span className="mr-2">🔄</span>
                  Replay Animation
                </button>
              </div>
            </section>

            <section className="bg-elevated rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-primary mb-4">Live Preview</h2>
              
              <div className="space-y-4">
                <div className="p-6 bg-surface rounded-lg border border-neutral-700">
                  <div
                    key={key}
                    className={`
                      p-4 bg-primary/20 border border-primary/30 rounded-lg text-center
                      ${animations.find(a => a.id === selectedAnimation)?.class}
                      duration-${animationSpeed}
                    `}
                  >
                    <div className="text-primary font-medium mb-2">
                      {animations.find(a => a.id === selectedAnimation)?.name}
                    </div>
                    <p className="text-sm text-neutral-300">
                      {animations.find(a => a.id === selectedAnimation)?.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Duration:</span>
                    <span className="text-secondary">
                      {timingOptions.find(t => t.id === animationSpeed)?.duration}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Class:</span>
                    <code className="text-secondary bg-secondary/20 px-2 py-1 rounded text-xs">
                      {animations.find(a => a.id === selectedAnimation)?.class}
                    </code>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-elevated rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-primary">Performance Monitor</h2>
                <button
                  onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
                  className="text-sm px-3 py-1 bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 rounded"
                >
                  {showPerformanceMonitor ? 'Hide' : 'Show'}
                </button>
              </div>

              {showPerformanceMonitor ? (
                <div className="space-y-3">
                  <div className="p-3 bg-surface rounded border border-neutral-700">
                    <div className="text-sm text-neutral-400 mb-1">Frame Rate</div>
                    <div className="text-lg font-mono text-success">60 FPS</div>
                  </div>
                  <div className="p-3 bg-surface rounded border border-neutral-700">
                    <div className="text-sm text-neutral-400 mb-1">GPU Usage</div>
                    <div className="text-lg font-mono text-warning">12%</div>
                  </div>
                  <div className="p-3 bg-surface rounded border border-neutral-700">
                    <div className="text-sm text-neutral-400 mb-1">Memory Usage</div>
                    <div className="text-lg font-mono text-primary">24 MB</div>
                  </div>
                  <div className="text-xs text-neutral-500 p-2 bg-neutral-800 rounded">
                    <span className="text-warning">⚠️</span> Performance monitoring is a placeholder
                  </div>
                </div>
              ) : (
                <div className="text-center text-neutral-400 py-4">
                  <span className="text-2xl mb-2 block">📊</span>
                  <p className="text-sm">Performance monitoring disabled</p>
                </div>
              )}
            </section>
          </div>
        </div>

        <section className="bg-elevated rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-primary mb-6">Timing & Easing Reference</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-secondary mb-4">Duration Options</h3>
              <div className="space-y-2">
                {timingOptions.map((timing) => (
                  <div key={timing.id} className="flex items-center justify-between p-3 bg-surface rounded border border-neutral-700">
                    <span className="text-neutral-300">{timing.name}</span>
                    <code className="text-secondary bg-secondary/20 px-2 py-1 rounded text-sm">
                      {timing.duration}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-secondary mb-4">Easing Functions</h3>
              <div className="space-y-2">
                {easingOptions.map((easing) => (
                  <div key={easing.id} className="flex items-center justify-between p-3 bg-surface rounded border border-neutral-700">
                    <span className="text-neutral-300">{easing.name}</span>
                    <code className="text-secondary bg-secondary/20 px-2 py-1 rounded text-sm">
                      {easing.curve}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}