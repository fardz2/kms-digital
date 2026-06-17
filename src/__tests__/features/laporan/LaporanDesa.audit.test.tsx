import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import LaporanDesa from '../../../features/laporan/LaporanDesa';

const useSessionMock = vi.fn();
const useStatistikGiziDesaMock = vi.fn();
const usePengukuranBulananDesaMock = vi.fn();

vi.mock('../../../features/auth/useSession', () => ({
  useSession: () => useSessionMock(),
}));

vi.mock('../../../queries/useLaporanQueries', () => ({
  useStatistikGiziDesa: (...args: unknown[]) => useStatistikGiziDesaMock(...args),
}));

vi.mock('../../../queries/usePengukuranBulananDesa', () => ({
  usePengukuranBulananDesa: () => usePengukuranBulananDesaMock(),
}));

describe('LaporanDesa audit warning', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
    useStatistikGiziDesaMock.mockReset();
    usePengukuranBulananDesaMock.mockReset();

    useSessionMock.mockReturnValue({
      user: { id_desa: 1 },
      isAuthenticated: true,
    });

    useStatistikGiziDesaMock.mockReturnValue({
      data: [
        {
          id_posyandu: 10,
          nama_posyandu: 'Posyandu Melati',
          berat_badan: { normal: 1 },
          tinggi_badan: { normal: 1 },
          lingkar_kepala: { normal: 1 },
        },
      ],
      isLoading: false,
      isError: false,
    });

    usePengukuranBulananDesaMock.mockReturnValue({
      anakList: [
        { id: 1, nama: 'Budi', id_posyandu: 10 },
        { id: 2, nama: 'Siti', id_posyandu: null },
      ],
      pengukuranByAnak: { 1: [], 2: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  test('menampilkan peringatan saat ada balita tanpa posyandu', () => {
    render(<LaporanDesa />);

    expect(
      screen.getByText(/Ada 1 balita tanpa posyandu di data desa/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Siti')).toBeInTheDocument();
    expect(
      screen.queryByText('Data rekap desa sudah lengkap.')
    ).not.toBeInTheDocument();
  });

  test('menampilkan peringatan saat posyandu balita tidak dikenal', () => {
    usePengukuranBulananDesaMock.mockReturnValue({
      anakList: [
        { id: 1, nama: 'Budi', id_posyandu: 10 },
        { id: 2, nama: 'Siti', id_posyandu: 99 },
      ],
      pengukuranByAnak: { 1: [], 2: [] },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<LaporanDesa />);

    expect(
      screen.getByText(/Ada 1 balita dengan posyandu yang tidak dikenal/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', {
        name: /Siti.*ID posyandu: 99/i,
      })
    ).toBeInTheDocument();
  });
});
