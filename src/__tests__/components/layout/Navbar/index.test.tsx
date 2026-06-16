import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import Navbar from '../../../../components/layout/Navbar';

const useSessionMock = vi.fn();
const useToastMock = vi.fn();
const replayMock = vi.fn();

vi.mock('../../../../features/auth/useSession', () => ({
  useSession: () => useSessionMock(),
}));

vi.mock('../../../../components/ui/Toast', () => ({
  useToast: () => useToastMock(),
}));

vi.mock('../../../../features/tour/TourProvider', () => ({
  useTourContext: () => ({
    replay: replayMock,
  }),
}));

vi.mock('../../../../components/ui/ProfileModal', () => ({
  default: () => null,
}));

describe('Navbar', () => {
  beforeEach(() => {
    useSessionMock.mockReset();
    useToastMock.mockReset();
    replayMock.mockReset();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      value: class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    });
  });

  test('menampilkan label ajukan pertanyaan untuk orang tua', () => {
    useSessionMock.mockReturnValue({
      user: { name: 'Budi', desa_name: 'Lebakwangi' },
      role: 'ORANG_TUA',
      logout: vi.fn(),
    });
    useToastMock.mockReturnValue({
      contextHolder: null,
      success: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/orangtua/balita']}>
        <Navbar isLogin />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Ajukan Pertanyaan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Beranda' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Artikel' })).toBeInTheDocument();
  });
});
