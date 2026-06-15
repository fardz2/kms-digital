import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { RekapTabel } from '../../../features/laporan/LaporanDesa';

const perPosyandu = [
  {
    id: 1,
    nama: 'Posyandu Melati',
    total: 10,
    beratBadan: { sangat_kurus: 1, kurus: 2, normal: 5, gemuk: 2 },
    tinggiBadan: { sangat_pendek: 1, pendek: 2, normal: 5, tinggi: 2 },
    lingkarKepala: { mikrosefali: 1, normal: 8, makrosefali: 1 },
    gizi: {
      gizi_buruk: 1,
      gizi_kurang: 2,
      gizi_baik: 5,
      berisiko_gizi_lebih: 0,
      gizi_lebih: 1,
      obesitas: 1,
    },
  },
];

describe('RekapTabel', () => {
  test('menempatkan gizi sebagai grup paling kanan', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu}
        distribusiBB={perPosyandu[0].beratBadan}
        distribusiTB={perPosyandu[0].tinggiBadan}
        distribusiLK={perPosyandu[0].lingkarKepala}
        distribusiGizi={perPosyandu[0].gizi}
      />
    );

    const headers = screen.getAllByRole('columnheader').map((el) => el.textContent);
    expect(headers.slice(2, 6)).toEqual([
      'Berat Badan (BB/U)',
      'Tinggi Badan (TB/U)',
      'Lingkar Kepala (LK/U)',
      'Gizi (BB/TB)',
    ]);
    expect(screen.getByRole('columnheader', { name: 'Gizi Buruk' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Berisiko Gizi Lebih' })).toBeInTheDocument();
  });

  test('menampilkan nilai berat badan dari data desa', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu}
        distribusiBB={perPosyandu[0].beratBadan}
        distribusiTB={perPosyandu[0].tinggiBadan}
        distribusiLK={perPosyandu[0].lingkarKepala}
        distribusiGizi={perPosyandu[0].gizi}
      />
    );

    const row = screen.getByText('Posyandu Melati').closest('tr');
    expect(row).not.toBeNull();
    const cells = row?.querySelectorAll('td');
    expect(cells?.[2]?.textContent).toBe('1');
    expect(cells?.[3]?.textContent).toBe('2');
    expect(cells?.[4]?.textContent).toBe('5');
    expect(cells?.[5]?.textContent).toBe('2');
  });

  test('ada garis pemisah antar grup indikator', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu}
        distribusiBB={perPosyandu[0].beratBadan}
        distribusiTB={perPosyandu[0].tinggiBadan}
        distribusiLK={perPosyandu[0].lingkarKepala}
        distribusiGizi={perPosyandu[0].gizi}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Tinggi Badan (TB/U)' })).toHaveClass('border-l-4');
    expect(screen.getByRole('columnheader', { name: 'Gizi (BB/TB)' })).toHaveClass('border-l-4');
  });

  test('status raw desa memakai warna indikator yang benar', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu}
        distribusiBB={perPosyandu[0].beratBadan}
        distribusiTB={perPosyandu[0].tinggiBadan}
        distribusiLK={perPosyandu[0].lingkarKepala}
        distribusiGizi={perPosyandu[0].gizi}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Sangat Kurus' })).toHaveClass('bg-danger');
    expect(screen.getByRole('columnheader', { name: 'Kurus' })).toHaveClass('bg-warning');
    expect(screen.getByRole('columnheader', { name: 'Gemuk' })).toHaveClass('bg-warning');
  });

  test('gizi tetap tampil walau distribusi kosong', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu}
        distribusiBB={{}}
        distribusiTB={{}}
        distribusiLK={{}}
        distribusiGizi={{}}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Gizi (BB/TB)' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Gizi Buruk' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Obesitas' })).toBeInTheDocument();
  });
});
