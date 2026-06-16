import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import Post from '../../../pages/Post';

const useSessionMock = vi.fn();
const usePostListMock = vi.fn();

vi.mock('../../../features/auth/useSession', () => ({
  useSession: () => useSessionMock(),
}));

vi.mock('../../../queries/usePostQueries', () => ({
  usePostList: () => usePostListMock(),
}));

vi.mock('../../../components/layout/Navbar', () => ({
  default: () => <div data-testid="navbar" />,
}));

vi.mock('../../../components/ui/Skeleton', () => ({
  SkeletonCard: () => <div data-testid="skeleton-card" />,
}));

vi.mock('../../../components/form/FormInputPost', () => ({
  default: () => <div data-testid="form-input-post" />,
}));

describe('Post', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
    usePostListMock.mockReset();
  });

  test('orang tua melihat tombol kembali ke beranda dan ajakan mengajukan pertanyaan', () => {
    useSessionMock.mockReturnValue({
      user: { id: 1, role: 'ORANG_TUA' },
      role: 'ORANG_TUA',
    });
    usePostListMock.mockReturnValue({ data: [], isLoading: false });

    render(
      <MemoryRouter initialEntries={['/orangtua/forum']}>
        <Routes>
          <Route path="/orangtua/forum" element={<Post />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Ajukan Pertanyaan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /kembali ke beranda/i })).toHaveAttribute(
      'href',
      '/orangtua/balita'
    );
  });

  test('tenaga kesehatan melihat header jawaban pertanyaan', () => {
    useSessionMock.mockReturnValue({
      user: { id: 2, role: 'TENAGA_KESEHATAN' },
      role: 'TENAGA_KESEHATAN',
    });
    usePostListMock.mockReturnValue({ data: [], isLoading: false });

    render(
      <MemoryRouter initialEntries={['/tenkes/forum']}>
        <Routes>
          <Route path="/tenkes/forum" element={<Post />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Jawab Pertanyaan' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /kembali ke beranda/i })).not.toBeInTheDocument();
  });
});
