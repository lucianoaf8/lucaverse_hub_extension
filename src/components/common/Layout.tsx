import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  navigation?: ReactNode;
  className?: string;
}

export default function Layout({ children, navigation, className = '' }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-background transition-colors duration-base ${className}`}>
      {navigation && (
        <header className="border-b border-neutral-700 bg-surface">
          <div className="container mx-auto px-6 py-4">
            {navigation}
          </div>
        </header>
      )}
      
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
      
      <footer className="border-t border-neutral-700 bg-surface mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-neutral-400">
            <p>© 2024 Lucaverse Hub. Built with React, TypeScript, and Tailwind CSS.</p>
            <p className="text-sm mt-2">
              Theme System • Internationalization • Modern Design
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}