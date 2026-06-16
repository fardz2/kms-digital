import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import DetailForum from '../../../pages/DetailForum';

const useSessionMock = vi.fn();
const usePostDetailMock = vi.fn();
const useCommentListMock = vi.fn();
const useCreateCommentMock = vi.fn();

vi.mock('../../../features/auth/useSession', () => ({
  useSession: () => useSessionMock(),
}));

vi.mock('../../../queries/usePostQueries', () => ({
  usePostDetail: () => usePostDetailMock(),
}));

vi.mock('../../../queries/useCommentQueries', () => ({
  useCommentList: () => useCommentListMock(),
  useCreateComment: () => useCreateCommentMock(),
}));

vi.mock('../../../components/layout/Navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock('../../../components/ui/Skeleton', () => ({
  SkeletonCard: () => <div data-testid="skeleton-card" />,
}));

vi.mock('../../../components/ui/Toast', () => ({
  useToast: () => ({
    contextHolder: null,
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('DetailForum', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
    usePostDetailMock.mockReset();
    useCommentListMock.mockReset();
    useCreateCommentMock.mockReset();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      value: ResizeObserverMock,
    });
  });

  test('orang tua kembali ke daftar forum yang tepat', () => {
    useSessionMock.mockReturnValue({
      user: { id: 1, role: 'ORANG_TUA' },
      role: 'ORANG_TUA',
    });
    usePostDetailMock.mockReturnValue({
      data: {
        title: 'Pertanyaan',
        nama: 'Budi',
        role: 'ORANG_TUA',
        time: '2026-06-16T00:00:00.000Z',
        content: 'Isi pertanyaan',
      },
      isLoading: false,
    });
    useCommentListMock.mockReturnValue({ data: [], isLoading: false });
    useCreateCommentMock.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(
      <MemoryRouter initialEntries={['/orangtua/forum/1']}>
        <Routes>
          <Route path="/orangtua/forum/:id" element={<DetailForum />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /kembali ke daftar pertanyaan/i })).toHaveAttribute(
      'href',
      '/orangtua/forum'
    );
  });

  test('tenaga kesehatan kembali ke daftar forum tenaga kesehatan', () => {
    useSessionMock.mockReturnValue({
      user: { id: 2, role: 'TENAGA_KESEHATAN' },
      role: 'TENAGA_KESEHATAN',
    });
    usePostDetailMock.mockReturnValue({
      data: {
        title: 'Pertanyaan',
        nama: 'Budi',
        role: 'ORANG_TUA',
        time: '2026-06-16T00:00:00.000Z',
        content: 'Isi pertanyaan',
      },
      isLoading: false,
    });
    useCommentListMock.mockReturnValue({ data: [], isLoading: false });
    useCreateCommentMock.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(
      <MemoryRouter initialEntries={['/tenkes/balita/1']}>
        <Routes>
          <Route path="/tenkes/balita/:id" element={<DetailForum />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /kembali ke daftar pertanyaan/i })).toHaveAttribute(
      'href',
      '/tenkes/forum'
    );
  });
});
