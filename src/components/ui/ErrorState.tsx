import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import EmptyState from './EmptyState';
import Button from './Button';

interface ErrorStateProps {
  onRetry?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  error?: unknown;
  className?: string;
}

function messageFromError(error: unknown): string | undefined {
  if (!error) return undefined;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  if (typeof error === 'string') return error;
  return undefined;
}

export default function ErrorState({
  onRetry,
  title = 'Gagal memuat data',
  description,
  error,
  className,
}: ErrorStateProps) {
  const desc =
    description ??
    messageFromError(error) ??
    'Periksa koneksi Anda lalu coba lagi.';

  return (
    <EmptyState
      className={className}
      icon={<AlertTriangle size={28} strokeWidth={1.75} />}
      title={title}
      description={desc}
      action={
        onRetry ? (
          <Button
            variant="primary"
            size="md"
            leadingIcon={<RefreshCw size={18} strokeWidth={2} />}
            onClick={onRetry}
          >
            Coba Lagi
          </Button>
        ) : undefined
      }
    />
  );
}
