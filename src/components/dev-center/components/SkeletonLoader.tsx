import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'tool' | 'card' | 'text' | 'button';
  className?: string;
}

export default function SkeletonLoader({ variant = 'tool', className = '' }: SkeletonLoaderProps) {
  if (variant === 'tool') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-elevated rounded-xl p-8 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neutral-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-neutral-700 rounded w-1/4"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-neutral-700 rounded w-full"></div>
            <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
            <div className="h-4 bg-neutral-700 rounded w-4/6"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-neutral-700 rounded-lg"></div>
            <div className="h-32 bg-neutral-700 rounded-lg"></div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <div className="h-10 w-24 bg-neutral-700 rounded-lg"></div>
            <div className="h-10 w-32 bg-neutral-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (variant === 'card') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-elevated rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-neutral-700 rounded"></div>
            <div className="flex-1">
              <div className="h-5 bg-neutral-700 rounded w-3/4"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-neutral-700 rounded w-full"></div>
            <div className="h-3 bg-neutral-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (variant === 'text') {
    return (
      <div className={`animate-pulse space-y-2 ${className}`}>
        <div className="h-4 bg-neutral-700 rounded w-full"></div>
        <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
        <div className="h-4 bg-neutral-700 rounded w-4/6"></div>
      </div>
    );
  }
  
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-10 bg-neutral-700 rounded w-32"></div>
    </div>
  );
}