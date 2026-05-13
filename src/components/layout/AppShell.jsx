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
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="font-display font-bold text-h3 text-neutral-900">
          KMS Digital
        </div>
        <div className="flex gap-2 flex-1 flex-wrap">
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
        <div className="flex items-center gap-3">
          {user?.name && (
            <span className="text-caption text-neutral-500 hidden md:inline">
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
