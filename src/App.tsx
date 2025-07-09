import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nProvider } from './contexts/I18nContext';
import { DevCenter, Dashboard, ThemeDemo, AnimationDemo } from './pages';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="max-w-md p-6 bg-surface border border-danger-500 rounded-lg">
            <h1 className="text-xl font-bold text-danger-500 mb-4">Application Error</h1>
            <div className="bg-danger-50 border border-danger-200 rounded p-4 mb-4">
              <h2 className="font-semibold text-danger-800">Error Details:</h2>
              <p className="text-danger-700 mt-2">{this.state.error?.message}</p>
              <details className="mt-4">
                <summary className="cursor-pointer text-danger-600 hover:text-danger-800">
                  Full Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-danger-600 overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dev-center" element={<DevCenter />} />
              <Route path="/theme-demo" element={<ThemeDemo />} />
              <Route path="/animation-demo" element={<AnimationDemo />} />
              <Route path="*" element={
                <div className="min-h-screen bg-background flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary mb-4">404 - Page Not Found</h1>
                    <p className="text-neutral-300 mb-6">The requested route does not exist.</p>
                    <a 
                      href="/dev-center" 
                      className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Go to Dev Center
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;