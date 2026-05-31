import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import BalitaCard from '../../../features/kader/BalitaCard';

const anak = { id: 1, nama: 'Budi', gender: 'LAKI_LAKI', tanggal_lahir: '2024-01-01' };

const metaSudah = {
  latest: { id: 2, date: '2026-05-10', berat: 9, tinggi: 75, lingkar_kepala: 46 },
  latestBulanIni: { id: 2, date: '2026-05-10', berat: 9, tinggi: 75, lingkar_kepala: 46 },
  status: 'normal',
  sudahDiukur: true,
  perluPerhatian: false,
};

const metaBelumBulanIni = {
  latest: { id: 1, date: '2024-06-01', berat: 7, tinggi: 65, lingkar_kepala: 42 },
  latestBulanIni: null,
  status: 'normal',
  sudahDiukur: false,
  perluPerhatian: false,
};

const metaBaru = {
  latest: null,
  latestBulanIni: null,
  status: 'unknown',
  sudahDiukur: false,
  perluPerhatian: false,
};

describe('BalitaCard card tap', () => {
  test('tapping the card calls onLihat with anak', () => {
    const onLihat = vi.fn();
    render(<BalitaCard anak={anak} meta={metaSudah} onLihat={onLihat} />);
    fireEvent.click(screen.getByRole('button', { name: /buka detail budi/i }));
    expect(onLihat).toHaveBeenCalledWith(anak);
  });

  test('Enter key on the card calls onLihat', () => {
    const onLihat = vi.fn();
    render(<BalitaCard anak={anak} meta={metaSudah} onLihat={onLihat} />);
    fireEvent.keyDown(screen.getByRole('button', { name: /buka detail budi/i }), {
      key: 'Enter',
    });
    expect(onLihat).toHaveBeenCalledWith(anak);
  });
});

describe('BalitaCard single action button', () => {
  test('shows "Ubah" when measured this month and calls onUlang without opening detail', () => {
    const onUlang = vi.fn();
    const onLihat = vi.fn();
    render(
      <BalitaCard anak={anak} meta={metaSudah} onUlang={onUlang} onLihat={onLihat} />
    );
    const btn = screen.getByRole('button', { name: /ubah/i });
    fireEvent.click(btn);
    expect(onUlang).toHaveBeenCalledWith(anak, metaSudah.latestBulanIni);
    expect(onLihat).not.toHaveBeenCalled();
  });

  test('shows "Ukur" when not measured this month and calls onUkur without opening detail', () => {
    const onUkur = vi.fn();
    const onLihat = vi.fn();
    render(
      <BalitaCard
        anak={anak}
        meta={metaBelumBulanIni}
        onUkur={onUkur}
        onLihat={onLihat}
      />
    );
    const btn = screen.getByRole('button', { name: /ukur/i });
    fireEvent.click(btn);
    expect(onUkur).toHaveBeenCalledWith(anak, metaBelumBulanIni.latest);
    expect(onLihat).not.toHaveBeenCalled();
  });

  test('shows "Ukur" for a brand new balita with no history', () => {
    render(<BalitaCard anak={anak} meta={metaBaru} onUkur={() => {}} />);
    expect(screen.getByRole('button', { name: /ukur/i })).toBeInTheDocument();
  });
});

describe('BalitaCard no separate Grafik button', () => {
  test('does not render a Grafik button', () => {
    render(<BalitaCard anak={anak} meta={metaSudah} onLihat={() => {}} />);
    expect(screen.queryByRole('button', { name: /grafik/i })).not.toBeInTheDocument();
  });
});
