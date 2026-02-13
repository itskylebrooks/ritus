import { type ErrorInfo, type ReactNode } from 'react';
import React from 'react';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export default class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-strong">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted">
            Ritus hit an unexpected error. Reload the app to continue.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-inverse hover-accent-fade"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
