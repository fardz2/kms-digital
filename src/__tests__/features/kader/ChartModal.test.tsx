import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ChartModal from '../../../features/kader/ChartModal';

vi.mock('../../../features/anak/ChartWHO', () => ({
  default: ({ anak }: { anak: { nama: string } }) => (
    <div data-testid="chart-who-stub">{anak?.nama}</div>
  ),
}));

const anak = { id: 1, nama: 'Budi', gender: 'LAKI_LAKI', tanggal_lahir: '2024-01-01' };
const pengukuran = [{ id: 1, date: '2024-06-01', berat: 7, tinggi: 65, lingkar_kepala: 42 }];

describe('ChartModal', () => {
  test('renders chart and title when anak is provided', () => {
    render(<ChartModal anak={anak} pengukuran={pengukuran} onClose={() => {}} />);
    expect(screen.getByTestId('chart-who-stub')).toHaveTextContent('Budi');
    expect(screen.getAllByText('Budi')).toHaveLength(2);
  });

  test('does not render chart content when anak is null', () => {
    render(<ChartModal anak={null} pengukuran={[]} onClose={() => {}} />);
    expect(screen.queryByTestId('chart-who-stub')).not.toBeInTheDocument();
  });
});
