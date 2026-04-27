import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-950/20 text-red-500 font-mono">
          <div className="max-w-3xl border border-red-500/50 bg-black/80 p-8 rounded-lg shadow-2xl overflow-auto">
            <h1 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
              ⚠️ Application Crashed
            </h1>
            <p className="mb-4 text-red-300">
              A critical error occurred while rendering the React tree. Please check the console for more details.
            </p>
            
            <div className="bg-red-950/50 p-4 rounded mb-4 text-sm whitespace-pre-wrap border border-red-900/50">
              <span className="font-bold text-red-200">Message: </span>
              {this.state.error?.message}
            </div>

            <details className="cursor-pointer text-sm">
              <summary className="font-bold text-red-400 mb-2 hover:text-red-300">View Stack Trace</summary>
              <pre className="mt-2 text-xs text-red-300/80 overflow-x-auto p-4 bg-red-950/30 rounded border border-red-900/30">
                {this.state.error?.stack}
                {"\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>

            <button 
              className="mt-6 px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-100 rounded border border-red-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
