import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import AcaraPosyanduPage from '../../../features/kader/AcaraPosyanduPage';

const useReminderListMock = vi.fn();

vi.mock('../../../queries/useReminderQueries', () => ({
  useReminderList: () => useReminderListMock(),
}));

describe('AcaraPosyanduPage', () => {
  beforeEach(() => {
    useReminderListMock.mockReset();
    useReminderListMock.mockReturnValue({
      data: [
        {
          id: 1,
          judul: 'Posyandu A',
          deskripsi: 'Agenda pertama',
          tanggal_reminder: '2099-01-01',
        },
        {
          id: 2,
          judul: 'Posyandu B',
          deskripsi: 'Agenda kedua',
          tanggal_reminder: '2099-01-02',
        },
        {
          id: 3,
          judul: 'Posyandu C',
          deskripsi: 'Agenda ketiga',
          tanggal_reminder: '2099-01-03',
        },
        {
          id: 4,
          judul: 'Posyandu D',
          deskripsi: 'Agenda keempat',
          tanggal_reminder: '2099-01-04',
        },
        {
          id: 5,
          judul: 'Posyandu E',
          deskripsi: 'Agenda kelima',
          tanggal_reminder: '2099-01-05',
        },
        {
          id: 6,
          judul: 'Posyandu F',
          deskripsi: 'Agenda keenam',
          tanggal_reminder: '2099-01-06',
        },
        {
          id: 7,
          judul: 'Posyandu G',
          deskripsi: 'Agenda ketujuh',
          tanggal_reminder: '2099-01-07',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  test('menampilkan daftar acara yang dipaginasi', () => {
    render(
      <MemoryRouter>
        <AcaraPosyanduPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: 'Acara Posyandu' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Halaman 1' })).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('dari 2 halaman'))).toBeInTheDocument();
    expect(screen.getByText('Posyandu A')).toBeInTheDocument();
    expect(screen.getByText('Posyandu F')).toBeInTheDocument();
    expect(screen.queryByText('Posyandu G')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next/ }));

    expect(screen.getByRole('button', { name: 'Halaman 2' })).toBeInTheDocument();
    expect(screen.getByText('Posyandu G')).toBeInTheDocument();
    expect(screen.queryByText('Posyandu A')).not.toBeInTheDocument();
  });
});
