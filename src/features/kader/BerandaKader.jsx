import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import { useAnakList } from '../../queries/useAnakQueries';

export default function BerandaKader() {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const { data: anakList, isLoading } = useAnakList();

  const total = anakList?.length ?? 0;

  const handleLogout = () => {
    if (window.confirm('Keluar dari akun?')) {
      logout();
      navigate('/masuk', { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader
        title={`Halo, ${user?.name ?? 'Kader'}`}
        subtitle={user?.posyandu_name ? `Posyandu ${user.posyandu_name}` : undefined}
        action={
          <Button variant="ghost" size="sm" onClick={handleLogout} style={{ color: '#FFFFFF' }}>
            Keluar
          </Button>
        }
      />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <Card onClick={() => navigate('/kader/balita')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>📋</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>Daftar Balita</div>
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
              {isLoading ? 'Memuat...' : `${total} balita`}
            </div>
          </Card>

          <Card onClick={() => navigate('/kader/laporan')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>📊</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>Laporan Bulan Ini</div>
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>Lihat rekap</div>
          </Card>
        </div>

        <Button variant="primary" size="lg" onClick={() => navigate('/kader/balita')} style={{ width: '100%' }}>
          + Lihat Semua Balita
        </Button>
      </div>
    </div>
  );
}
