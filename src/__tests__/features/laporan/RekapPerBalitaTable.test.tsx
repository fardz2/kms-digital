import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import RekapPerBalitaTable from '../../../features/laporan/RekapPerBalitaTable';

const rows = Array.from({ length: 6 }, (_, idx) => {
  const statuses = ['normal', 'kurang', 'stunting', 'obesitas'] as const;
  const gizi = statuses[idx % statuses.length];

  return {
    id: idx + 1,
    nama: `Balita ${idx + 1}`,
    tanggalUkur: `2026-06-${String(idx + 1).padStart(2, '0')}`,
    bbu: 'bb_normal',
    tbu: 'tb_normal',
    lku: 'lk_normal',
    gizi,
  };
});

describe('RekapPerBalitaTable', () => {
  test('header sticky dan pagination bekerja', () => {
    render(<RekapPerBalitaTable data={rows} />);

    expect(screen.getByRole('columnheader', { name: 'Status Gizi' })).toHaveClass('sticky');
    expect(screen.queryByText('Balita 6')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /halaman 2/i }));

    expect(screen.getByText('Balita 6')).toBeInTheDocument();
  });

  test('menampilkan total di baris paling bawah', () => {
    render(<RekapPerBalitaTable data={rows} />);

    const totalRow = screen.getByText('Total').closest('tr');
    expect(totalRow).not.toBeNull();
    const cells = totalRow?.querySelectorAll('td');
    expect(cells?.[1]?.textContent).toBe('6');
  });

  test('status bahaya di body tabel diberi warna kuning', () => {
    render(<RekapPerBalitaTable data={rows} />);

    const stuntingIcon = screen.getByLabelText('Stunting');
    expect(stuntingIcon.closest('td')).toHaveClass('text-warning');
  });
});
