import React, { useState } from 'react';
import { Layout } from '../components/common';
import AnimationExamples from '../components/AnimationExamples';

export default function ThemeDemo() {
  const [showAnimations, setShowAnimations] = useState(false);

  const colorVariants = [
    { name: 'Primary', class: 'text-primary', bg: 'bg-primary-500' },
    { name: 'Secondary', class: 'text-secondary', bg: 'bg-secondary-500' },
    { name: 'Success', class: 'text-success', bg: 'bg-success-500' },
    { name: 'Warning', class: 'text-warning', bg: 'bg-warning-500' },
    { name: 'Danger', class: 'text-danger', bg: 'bg-danger-500' },
  ];

  const spacingExamples = [
    { name: 'XS', class: 'p-1', label: 'p-1' },
    { name: 'SM', class: 'p-2', label: 'p-2' },
    { name: 'MD', class: 'p-4', label: 'p-4' },
    { name: 'LG', class: 'p-6', label: 'p-6' },
    { name: 'XL', class: 'p-8', label: 'p-8' },
  ];

  const typographyExamples = [
    { name: 'Heading 1', class: 'text-4xl font-bold', element: 'h1' },
    { name: 'Heading 2', class: 'text-3xl font-semibold', element: 'h2' },
    { name: 'Heading 3', class: 'text-2xl font-medium', element: 'h3' },
    { name: 'Body Large', class: 'text-lg', element: 'p' },
    { name: 'Body Regular', class: 'text-base', element: 'p' },
    { name: 'Body Small', class: 'text-sm', element: 'p' },
    { name: 'Caption', class: 'text-xs', element: 'p' },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4 animate-fade-in">
            Theme System Demo
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto animate-slide-up">
            Comprehensive theme testing and manipulation interface with real-time preview
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setShowAnimations(!showAnimations)}
            className="px-6 py-3 bg-primary/20 hover:bg-primary/30 border border-primary/40
                       rounded-lg transition-all duration-base focus:ring-2 focus:ring-primary/50"
            aria-label={showAnimations ? 'Hide animations' : 'Show animations'}
          >
            <span className="mr-2">✨</span>
            {showAnimations ? 'Hide' : 'Show'} Animation Examples
          </button>
        </div>

        {showAnimations ? (
          <AnimationExamples />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <section className="bg-elevated rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-primary mb-6">Color Variants</h2>
                <div className="grid grid-cols-1 gap-4">
                  {colorVariants.map((variant) => (
                    <div
                      key={variant.name}
                      className="flex items-center justify-between p-4 bg-surface rounded-lg border border-neutral-700"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full ${variant.bg}`} />
                        <div>
                          <h3 className={`font-medium ${variant.class}`}>{variant.name}</h3>
                          <p className="text-sm text-neutral-400">{variant.class}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className={`btn btn-${variant.name.toLowerCase()}`} aria-label={`${variant.name} button example`}>
                          Button
                        </button>
                        <span className={`px-2 py-1 text-xs rounded ${variant.class} bg-${variant.name.toLowerCase()}/20`}>
                          Badge
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-elevated rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-primary mb-6">Typography Scale</h2>
                <div className="space-y-4">
                  {typographyExamples.map((example) => (
                    <div key={example.name} className="p-4 bg-surface rounded-lg border border-neutral-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-400">{example.name}</span>
                        <code className="text-xs text-secondary bg-secondary/20 px-2 py-1 rounded">
                          {example.class}
                        </code>
                      </div>
                      <div className={example.class}>
                        The quick brown fox jumps over the lazy dog
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-elevated rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-primary mb-6">Spacing Examples</h2>
                <div className="grid grid-cols-1 gap-4">
                  {spacingExamples.map((example) => (
                    <div key={example.name} className="bg-surface rounded-lg border border-neutral-700">
                      <div className="p-4 border-b border-neutral-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-400">{example.name} Spacing</span>
                          <code className="text-xs text-secondary bg-secondary/20 px-2 py-1 rounded">
                            {example.label}
                          </code>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="bg-neutral-800 rounded">
                          <div className={`${example.class} bg-primary/20 border border-primary/30 rounded`}>
                            <div className="bg-primary/40 rounded">
                              Content with {example.name} spacing
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-elevated rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-primary mb-6">Component Examples</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-surface rounded-lg border border-neutral-700">
                    <h3 className="font-medium text-secondary mb-3">Buttons</h3>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-primary" aria-label="Primary button example">Primary</button>
                      <button className="btn btn-secondary" aria-label="Secondary button example">Secondary</button>
                      <button className="btn btn-success" aria-label="Success button example">Success</button>
                      <button className="btn btn-warning" aria-label="Warning button example">Warning</button>
                      <button className="btn btn-danger" aria-label="Danger button example">Danger</button>
                    </div>
                  </div>

                  <div className="p-4 bg-surface rounded-lg border border-neutral-700">
                    <h3 className="font-medium text-secondary mb-3">Form Elements</h3>
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Text input" 
                        className="input w-full"
                      />
                      <select className="input w-full">
                        <option>Select option</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                      </select>
                      <textarea 
                        placeholder="Textarea" 
                        className="input w-full h-24 resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-surface rounded-lg border border-neutral-700">
                    <h3 className="font-medium text-secondary mb-3">Panels</h3>
                    <div className="panel animate-fade-in">
                      <h4 className="text-lg font-medium text-primary mb-2">Sample Panel</h4>
                      <p className="text-neutral-300 mb-4">
                        This is a sample panel with theme-aware styling and animations.
                      </p>
                      <div className="flex gap-2">
                        <button className="btn btn-primary" aria-label="Action button example">Action</button>
                        <button className="btn btn-secondary" aria-label="Cancel button example">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}