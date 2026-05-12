import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useSession } from '../../features/auth/useSession';

export default function AppShell({ children, menu = [], activeKey }) {
  const navigate = useNavigate();
  const { user, logout } = useSession();

  const handleLogout = () => {
    if (window.confirm('Keluar dari akun?')) {
      logout();
      navigate('/masuk', { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <nav
        style={{
          background: 'var(--color-bg)',
          padding: 'var(--space-md) var(--space-lg)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--text-lg)',
          }}
        >
          KMS Digital
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', flex: 1, flexWrap: 'wrap' }}>
          {menu.map((item) => (
            <Button
              key={item.key}
              variant={activeKey === item.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {user?.name && (
            <span style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
              {user.name}
            </span>
          )}
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Keluar
          </Button>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
