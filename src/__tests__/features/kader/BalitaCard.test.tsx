import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import BalitaCard from '../../../features/kader/BalitaCard';

const anak = { id: 1, nama: 'Budi', gender: 'LAKI_LAKI', tanggal_lahir: '2024-01-01' };

const metaWithData = {
  latest: { id: 1, date: '2024-06-01', berat: 7, tinggi: 65, lingkar_kepala: 42 },
  latestBulanIni: null,
  status: 'NORMAL',
  sudahDiukur: false,
  perluPerhatian: false,
};

const metaNoData = {
  latest: null,
  latestBulanIni: null,
  status: 'UNKNOWN',
  sudahDiukur: false,
  perluPerhatian: false,
};

describe('BalitaCard Grafik button', () => {
  test('shows Grafik button when latest measurement exists', () => {
    render(<BalitaCard anak={anak} meta={metaWithData} onGrafik={() => {}} />);
    expect(screen.getByRole('button', { name: /grafik/i })).toBeInTheDocument();
  });

  test('hides Grafik button when there is no measurement', () => {
    render(<BalitaCard anak={anak} meta={metaNoData} onGrafik={() => {}} />);
    expect(screen.queryByRole('button', { name: /grafik/i })).not.toBeInTheDocument();
  });

  test('calls onGrafik with anak when clicked', () => {
    const onGrafik = vi.fn();
    render(<BalitaCard anak={anak} meta={metaWithData} onGrafik={onGrafik} />);
    fireEvent.click(screen.getByRole('button', { name: /grafik/i }));
    expect(onGrafik).toHaveBeenCalledWith(anak);
  });
});
