import { Component, ErrorInfo, ReactNode } from 'react';
import shi4gudLogo from '/assets/logos/shi4gud-light.svg';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="m-2 text-center bg-zinc-800/60 rounded-xl border border-zinc-700 p-8 max-w-md w-full">
            <div className="mb-6">
              <img 
                src={shi4gudLogo} 
                alt="SHI4GUD Logo" 
                width="200" 
                height="auto"
                className="mx-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-pink-500 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              An unexpected error has occurred. Please try again or refresh the page.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors font-semibold"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 