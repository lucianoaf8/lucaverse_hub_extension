import React from 'react';
import { Layout } from '../components/common';

export default function DevCenter() {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-4">Dev Center</h1>
          <p className="text-xl text-neutral-300 mb-6">
            Development tools and utilities have been removed for cleaner architecture.
          </p>
          <div className="space-y-4">
            <div className="p-6 bg-surface border border-neutral-700 rounded-lg">
              <h2 className="text-lg font-semibold text-secondary mb-2">Available Tools</h2>
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Theme Demo</span>
                  <a href="/theme-demo" className="text-primary hover:underline">Visit →</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Animation Demo</span>
                  <a href="/animation-demo" className="text-primary hover:underline">Visit →</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Dashboard</span>
                  <a href="/dashboard" className="text-primary hover:underline">Visit →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}