import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { useSession } from '../../features/auth/useSession';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

export default function AppShell({ children, menu = [], activeKey }) {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const confirm = useConfirmDialog();

  const handleLogout = () => {
    confirm({
      title: 'Keluar dari akun?',
      icon: <AlertTriangle size={20} className="text-danger" />,
      content: 'Anda perlu masuk kembali untuk menggunakan aplikasi.',
      okText: 'Ya, Keluar',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        logout();
        navigate('/masuk', { replace: true });
      },
    });
  };

  return (
    <div className="min-h-screen bg-canvas-warm relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-primary-100/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-40 left-1/4 w-[420px] h-[420px] rounded-full bg-primary-50/60 blur-3xl"
      />

      <nav className="relative z-10 bg-white/80 backdrop-blur-md shadow-panel px-[17px] md:px-[25px] py-[13px] flex items-center gap-[17px] flex-wrap">
        <div className="flex items-center gap-[10px] min-w-0">
          <span
            aria-hidden
            className="inline-block w-[8px] h-[8px] rounded-pill bg-primary-500 shadow-[0_0_0_4px_rgba(255,112,112,0.18)]"
          />
          <span className="font-bold text-heading text-deep-slate tracking-tight">
            KMS Digital
          </span>
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
      <main className="relative z-10">{children}</main>
    </div>
  );
}
