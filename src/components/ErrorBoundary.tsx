import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Liftoff caught an error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink">Something went wrong</h1>
          <p className="text-sm text-ink-muted mt-2 max-w-sm">
            Your data is safe on this device. Try reloading the page.
          </p>
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-5">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
