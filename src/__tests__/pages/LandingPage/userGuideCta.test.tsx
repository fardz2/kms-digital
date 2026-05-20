import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import LandingPage from '../../../pages/LandingPage';

vi.mock('../../../components/layout/Navbar', () => ({
  default: () => <div data-testid="navbar-stub" />,
}));

vi.mock('../../../features/auth/useSession', () => ({
  useSession: () => ({
    isAuthenticated: false,
    role: null,
  }),
}));

describe('LandingPage user guide CTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('links to the user guide route', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navbar-stub')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /user guide/i })).toHaveAttribute(
      'href',
      '/user-guide'
    );
  });
});
