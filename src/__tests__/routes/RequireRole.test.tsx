import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireRole from '../../routes/RequireRole';

const mockSession = vi.fn();
vi.mock('../../features/auth/useSession', () => ({
  useSession: () => mockSession(),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<RequireRole allow={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<div>ADMIN PAGE</div>} />
        </Route>
        <Route path="/masuk" element={<div>LOGIN PAGE</div>} />
        <Route path="/orangtua/balita" element={<div>OT HOME</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  beforeEach(() => mockSession.mockReset());

  test('redirects to /masuk when not authenticated', () => {
    mockSession.mockReturnValue({ isAuthenticated: false, role: null });
    renderAt('/admin/dashboard');
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });

  test('renders content for an allowed role', () => {
    mockSession.mockReturnValue({ isAuthenticated: true, role: 'ADMIN' });
    renderAt('/admin/dashboard');
    expect(screen.getByText('ADMIN PAGE')).toBeInTheDocument();
  });

  test('redirects a disallowed role to its ROLE_HOME', () => {
    mockSession.mockReturnValue({ isAuthenticated: true, role: 'ORANG_TUA' });
    renderAt('/admin/dashboard');
    expect(screen.getByText('OT HOME')).toBeInTheDocument();
  });

  test('redirects to /masuk when authenticated but role is missing', () => {
    mockSession.mockReturnValue({ isAuthenticated: true, role: null });
    renderAt('/admin/dashboard');
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });
});
