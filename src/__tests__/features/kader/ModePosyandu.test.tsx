import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ModePosyandu from '../../../features/kader/ModePosyandu';

const useSessionMock = vi.fn();
const usePengukuranBulananKaderMock = vi.fn();
const usePendingOrangTuaMock = vi.fn();
const usePendingAnakMock = vi.fn();
const useReminderListMock = vi.fn();
const useConfirmDialogMock = vi.fn();

vi.mock('../../../features/auth/useSession', () => ({
  useSession: () => useSessionMock(),
}));

vi.mock('../../../queries/usePengukuranBulananKader', () => ({
  usePengukuranBulananKader: () => usePengukuranBulananKaderMock(),
}));

vi.mock('../../../queries/useApproveQueries', () => ({
  usePendingOrangTua: () => usePendingOrangTuaMock(),
  usePendingAnak: () => usePendingAnakMock(),
}));

vi.mock('../../../queries/useReminderQueries', () => ({
  useReminderList: () => useReminderListMock(),
}));

vi.mock('../../../hooks/useConfirmDialog', () => ({
  useConfirmDialog: () => useConfirmDialogMock(),
}));

vi.mock('../../../features/kader/PosyanduHeader', () => ({
  default: () => <div data-testid="posyandu-header" />,
}));

vi.mock('../../../features/kader/FilterChip', () => ({
  default: () => <div data-testid="filter-chip" />,
}));

vi.mock('../../../features/kader/BalitaCard', () => ({
  default: ({ anak }) => <div data-testid="balita-card">{anak.nama}</div>,
}));

vi.mock('../../../components/ui/Button', () => ({
  default: ({ children, leadingIcon, loading, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('../../../features/pengukuran/PengukuranForm', () => ({
  default: () => null,
}));

vi.mock('../../../components/form/FormInputDataAnak', () => ({
  default: () => null,
}));

vi.mock('../../../components/ui/Skeleton', () => ({
  SkeletonList: () => <div data-testid="skeleton-list" />,
}));

vi.mock('../../../components/ui/ErrorState', () => ({
  default: () => null,
}));

vi.mock('../../../components/ui/ProfileModal', () => ({
  default: () => null,
}));

describe('ModePosyandu', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
    usePengukuranBulananKaderMock.mockReset();
    usePendingOrangTuaMock.mockReset();
    usePendingAnakMock.mockReset();
    useReminderListMock.mockReset();
    useConfirmDialogMock.mockReset();

    useSessionMock.mockReturnValue({
      user: { name: 'Kader', posyandu_name: 'Melati' },
      role: 'KADER_POSYANDU',
      isAuthenticated: true,
      logout: vi.fn(),
    });
    usePengukuranBulananKaderMock.mockReturnValue({
      anakList: [],
      pengukuranByAnak: {},
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    usePendingOrangTuaMock.mockReturnValue({ data: [] });
    usePendingAnakMock.mockReturnValue({ data: [] });
    useReminderListMock.mockReturnValue({
      data: [
        {
          id: 1,
          judul: 'Posyandu Melati',
          deskripsi: 'Hari timbang balita',
          tanggal_reminder: '2026-06-20',
        },
      ],
      isLoading: false,
    });
    useConfirmDialogMock.mockReturnValue(vi.fn());
  });

  test('menampilkan section acara posyandu di kader', () => {
    render(
      <MemoryRouter>
        <ModePosyandu />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Acara Posyandu' })).toBeInTheDocument();
    expect(screen.getByText('Posyandu Melati')).toBeInTheDocument();
    expect(screen.getByText('Hari timbang balita')).toBeInTheDocument();
  });
});
