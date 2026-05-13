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

      <div className="px-4 py-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <Card
            onClick={() => navigate('/tenkes/forum')}
            className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
          >
            <div className="text-display mb-2" aria-hidden>💬</div>
            <div className="text-h3 font-display text-neutral-900">
              Forum Tanya Jawab
            </div>
            <div className="text-caption text-neutral-600 mt-1">
              Jawab pertanyaan orang tua
            </div>
          </Card>

          <Card
            onClick={() => navigate('/artikel')}
            className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200"
          >
            <div className="text-display mb-2" aria-hidden>📰</div>
            <div className="text-h3 font-display text-neutral-900">
              Artikel Kesehatan
            </div>
            <div className="text-caption text-neutral-600 mt-1">
              Baca artikel edukasi gizi
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
