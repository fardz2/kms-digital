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
    kurang: 0,
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
    expect(screen.getByRole('columnheader', { name: 'Berat Badan' })).toHaveClass('top-0');
    expect(screen.getAllByRole('columnheader', { name: 'Normal' })[0]).toHaveClass('sticky');
    expect(screen.getAllByRole('columnheader', { name: 'Normal' })[0]).toHaveClass('top-[44px]');
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
    expect(screen.getByRole('columnheader', { name: 'Posyandu' })).toHaveClass('top-0');
    expect(screen.getByRole('columnheader', { name: 'Status Gizi' })).toHaveClass('sticky');
    expect(screen.getByRole('columnheader', { name: 'Status Gizi' })).toHaveClass('top-0');
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
    expect(screen.getByRole('columnheader', { name: 'Kurus' })).toHaveClass('bg-primary-600');
    expect(screen.getByRole('columnheader', { name: 'Pendek' })).toHaveClass('bg-primary-600');
  });

  test('status warning di body tabel desa dipoles kuning lewat kolomnya', () => {
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
    const row = screen.getByText('Posyandu 1').closest('tr');
    expect(row).not.toBeNull();
    const cells = row?.querySelectorAll('td');
    expect(cells?.[3]).toHaveClass('text-amber-700', 'font-bold'); // kurus = warning
    expect(cells?.[16]).toHaveClass('text-danger', 'font-bold'); // stunting/obesitas = danger
    expect(cells?.[14]).not.toHaveClass('text-amber-700', 'font-bold'); // normal
  });
});
