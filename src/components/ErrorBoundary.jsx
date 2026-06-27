import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('CyberNest render error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-warm-app px-4 text-slate-800">
          <div className="max-w-lg rounded-[2rem] border border-rose-200 bg-white/90 p-6 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-wider text-rose-500">CyberNest error</p>
            <h1 className="mt-2 text-3xl">Something failed to render</h1>
            <p className="mt-3 rounded-2xl bg-rose-50 p-4 font-mono text-sm text-rose-600">{this.state.error.message}</p>
            <button onClick={() => window.location.reload()} className="btn-primary mt-5">Reload</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
