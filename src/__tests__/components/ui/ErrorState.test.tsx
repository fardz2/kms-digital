import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ErrorState from '../../../components/ui/ErrorState';

describe('ErrorState', () => {
  test('renders default title', () => {
    render(<ErrorState />);
    expect(screen.getByText('Gagal memuat data')).toBeInTheDocument();
  });

  test('shows error message in description when provided', () => {
    render(<ErrorState error={new Error('Koneksi terputus')} />);
    expect(screen.getByText('Koneksi terputus')).toBeInTheDocument();
  });

  test('calls onRetry when the retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('does not render a retry button when onRetry is absent', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button', { name: /coba lagi/i })).toBeNull();
  });
});
