import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    if (error && error.message && error.message.includes('ResizeObserver')) {
       return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error && error.message && error.message.includes('ResizeObserver')) return;
    console.error("Uncaught error:", error, errorInfo);
    fetch('http://localhost:3001/error', { method: 'POST', body: error.stack }).catch(() => {});
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center p-8 bg-[#0a0a0f] text-white">
          <div className="max-w-2xl w-full bg-red-500/10 border border-red-500/20 rounded-3xl p-10 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mb-8 border border-red-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-3xl font-black mb-4 uppercase tracking-widest text-red-100">System Exception Captured</h1>
            <p className="text-red-200/60 mb-8 max-w-sm">
              An integrity fault was detected in the neural tree.
            </p>

            {this.state.error && (
              <div className="w-full bg-black/50 rounded-xl p-4 mb-8 overflow-auto text-left max-h-48 border border-red-500/10">
                <p className="text-red-400 font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button 
              onClick={() => { localStorage.removeItem('quinn_crash'); window.location.reload(); }}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all border border-white/10 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
