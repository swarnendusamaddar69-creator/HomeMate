import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      // Clear current view cache and reload cleanly
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 text-slate-900"
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-200 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-600 font-medium">
                HomeMate encountered an unexpected error while rendering this view. Your saved household data in storage remains safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-xl text-left overflow-x-auto text-xs font-mono text-slate-700 max-h-32 border border-slate-200">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 min-h-[48px] px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                aria-label="Reload HomeMate application"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetState}
                className="w-full sm:flex-1 min-h-[48px] px-5 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm shadow-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                aria-label="Go to HomeMate dashboard"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
