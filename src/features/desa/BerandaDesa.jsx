import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import LaporanDesa from '../laporan/LaporanDesa';

const MENU = [
  { key: 'beranda', label: 'Laporan', path: '/desa/beranda' },
  { key: 'acara', label: 'Kelola Acara', path: '/desa/acara' },
];

export default function BerandaDesa() {
  const navigate = useNavigate();
  const { user } = useSession();

  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        title={`Desa ${user?.nama_desa ?? user?.desa_name ?? ''}`}
        subtitle="Rekap gizi balita se-desa"
      />
      <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Button variant="primary" size="md" onClick={() => navigate('/desa/acara')}>
            📅 Kelola Acara Posyandu
          </Button>
        </div>

        <LaporanDesa />
      </div>
    </AppShell>
  );
}
