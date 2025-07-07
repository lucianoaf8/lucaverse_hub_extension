import { Component, ErrorInfo, ReactNode } from 'react';

/**
 * ErrorBoundary component
 * Wraps children and catches render/runtime errors, displaying a fallback UI instead of crashing the whole app.
 * Inspired by the React docs example. https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback React element to render when error happens. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, info);
  }

  override render(): React.ReactNode {
    const { hasError } = this.state;
    if (hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center text-red-400">
            <h2 className="text-lg font-semibold mb-2">Something went wrong.</h2>
            <p className="text-sm opacity-80">
              The panel crashed unexpectedly. Please refresh the panel or check the console for
              details.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
