import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { RekapTabel } from '../../../features/laporan/LaporanDesa';

const perPosyandu = Array.from({ length: 6 }, (_, idx) => ({
  id: idx + 1,
  nama: `Posyandu ${idx + 1}`,
  total: 10,
  beratBadan: { sangat_kurus: 1, kurus: 2, normal: 5, gemuk: 2 },
  tinggiBadan: { sangat_pendek: 1, pendek: 2, normal: 5, tinggi: 2 },
  lingkarKepala: { mikrosefali: 1, normal: 8, makrosefali: 1 },
  gizi: {
    normal: 5,
    kurang: 2,
    stunting: 1,
    obesitas: 2,
  },
}));

describe('RekapTabel', () => {
  test('menempatkan status gizi sebagai grup paling kanan dengan header polos', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu.slice(0, 1)}
        distribusiBB={perPosyandu[0].beratBadan}
        distribusiTB={perPosyandu[0].tinggiBadan}
        distribusiLK={perPosyandu[0].lingkarKepala}
        distribusiGizi={perPosyandu[0].gizi}
      />
    );

    const headers = screen.getAllByRole('columnheader').map((el) => el.textContent);
    expect(headers.slice(2, 6)).toEqual([
      'Berat Badan',
      'Tinggi Badan',
      'Lingkar Kepala',
      'Status Gizi',
    ]);
    expect(screen.getAllByRole('columnheader', { name: 'Normal' })[0]).toHaveClass('sticky');
    expect(screen.queryByRole('columnheader', { name: 'Gizi Buruk' })).not.toBeInTheDocument();
  });

  test('header tetap sticky saat tabel panjang dan pagination berpindah halaman', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu}
        distribusiBB={perPosyandu[0].beratBadan}
        distribusiTB={perPosyandu[0].tinggiBadan}
        distribusiLK={perPosyandu[0].lingkarKepala}
        distribusiGizi={perPosyandu[0].gizi}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Posyandu' })).toHaveClass('sticky');
    expect(screen.getByRole('columnheader', { name: 'Status Gizi' })).toHaveClass('sticky');
    expect(screen.queryByText('Posyandu 6')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /halaman 2/i }));

    expect(screen.getByText('Posyandu 6')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  test('status ringkas di header desa tetap punya pemisah grup', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu.slice(0, 1)}
        distribusiBB={perPosyandu[0].beratBadan}
        distribusiTB={perPosyandu[0].tinggiBadan}
        distribusiLK={perPosyandu[0].lingkarKepala}
        distribusiGizi={perPosyandu[0].gizi}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Tinggi Badan' })).toHaveClass('border-l-4');
    expect(screen.getByRole('columnheader', { name: 'Status Gizi' })).toHaveClass('border-l-4');
  });

  test('status bahaya di body tabel desa dipoles kuning lewat status badge cells', () => {
    render(
      <RekapTabel
        perPosyandu={perPosyandu.slice(0, 1)}
        distribusiBB={perPosyandu[0].beratBadan}
        distribusiTB={perPosyandu[0].tinggiBadan}
        distribusiLK={perPosyandu[0].lingkarKepala}
        distribusiGizi={perPosyandu[0].gizi}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Status Gizi' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Stunting' })).toHaveClass('bg-primary-600');
  });
});
