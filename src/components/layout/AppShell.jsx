import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
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
    <div className="min-h-screen bg-faint-fog">
      <nav className="bg-white border-b border-light-ash px-[17px] md:px-[25px] py-[13px] flex items-center gap-[17px] flex-wrap">
        <div className="font-bold text-heading text-deep-slate">
          KMS Digital
        </div>
        <div className="flex gap-[8px] flex-1 flex-wrap">
          {menu.map((item) => (
            <Button
              key={item.key}
              variant={activeKey === item.key ? 'dark' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-[13px]">
          {user?.name && (
            <span className="text-caption text-graphite hidden md:inline">
              {user.name}
            </span>
          )}
          <Button
            variant="default"
            size="sm"
            leadingIcon={<LogOut size={16} strokeWidth={1.75} />}
            onClick={handleLogout}
          >
            Keluar
          </Button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
