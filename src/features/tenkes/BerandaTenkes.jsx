import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import { useSession } from '../auth/useSession';

const MENU = [
  { key: 'beranda', label: 'Beranda', path: '/tenkes/beranda' },
  { key: 'forum', label: 'Forum', path: '/tenkes/forum' },
  { key: 'artikel', label: 'Artikel', path: '/artikel' },
];

export default function BerandaTenkes() {
  const navigate = useNavigate();
  const { user } = useSession();

  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        title={`Halo, ${user?.name ?? 'Tenaga Kesehatan'}`}
        subtitle="Dashboard tenaga kesehatan"
      />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-md)',
          }}
        >
          <Card onClick={() => navigate('/tenkes/forum')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>
              💬
            </div>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Forum Tanya Jawab
            </div>
            <div
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-muted)',
              }}
            >
              Jawab pertanyaan orang tua
            </div>
          </Card>

          <Card onClick={() => navigate('/artikel')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>
              📰
            </div>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              Artikel Kesehatan
            </div>
            <div
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-muted)',
              }}
            >
              Baca artikel edukasi gizi
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
