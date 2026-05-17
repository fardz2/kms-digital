import React from 'react';
import Button from './ui/Button';

interface State {
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  reload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-faint-fog px-[17px]">
          <div className="max-w-[480px] w-full bg-white border border-light-ash rounded-default shadow-card p-[33px] text-center">
            <p className="text-caption font-bold uppercase tracking-[0.14em] text-danger mb-[13px]">
              Aplikasi Bermasalah
            </p>
            <h1 className="text-display font-bold text-deep-slate leading-tight mb-[17px]">
              Terjadi Kesalahan
            </h1>
            <p className="text-body-sm text-graphite mb-[25px]">
              Sesuatu yang tidak terduga terjadi. Silakan coba muat ulang halaman.
              Jika masalah berlanjut, hubungi admin.
            </p>
            {import.meta.env.DEV && this.state.error?.message && (
              <pre className="text-caption text-danger bg-faint-fog p-[13px] rounded mb-[17px] overflow-auto text-left">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-[13px] justify-center">
              <Button variant="default" size="md" onClick={this.reset}>
                Coba Lagi
              </Button>
              <Button variant="primary" size="md" onClick={this.reload}>
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
