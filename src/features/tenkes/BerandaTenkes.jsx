import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Newspaper, ChevronRight } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import { useSession } from '../auth/useSession';

const MENU = [
  { key: 'beranda', label: 'Beranda', path: '/tenkes/beranda' },
  { key: 'forum', label: 'Forum', path: '/tenkes/forum' },
  { key: 'artikel', label: 'Artikel', path: '/artikel' },
];

function QuickLink({ Icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[17px] w-full p-[21px] bg-white border border-light-ash rounded-default text-left hover:border-graphite/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500"
    >
      <span className="flex items-center justify-center w-[48px] h-[48px] rounded-full bg-polar-mist text-primary-600 shrink-0">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-body-sm font-semibold text-deep-slate">{title}</span>
        <span className="block text-caption text-graphite mt-1">{desc}</span>
      </span>
      <ChevronRight size={18} strokeWidth={1.75} className="text-graphite shrink-0" />
    </button>
  );
}

export default function BerandaTenkes() {
  const navigate = useNavigate();
  const { user } = useSession();

  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        title={`Halo, ${user?.name ?? 'Tenaga Kesehatan'}`}
        eyebrow="Tenaga Kesehatan"
        subtitle="Dashboard tenaga kesehatan."
      />

      <div className="max-w-[720px] mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[21px]">
        <p className="text-caption font-bold uppercase tracking-[0.12em] text-graphite">
          Tugas Anda
        </p>
        <div className="flex flex-col gap-[8px]">
          <QuickLink
            Icon={MessageCircle}
            title="Forum Tanya Jawab"
            desc="Jawab pertanyaan orang tua"
            onClick={() => navigate('/tenkes/forum')}
          />
          <QuickLink
            Icon={Newspaper}
            title="Artikel Kesehatan"
            desc="Baca artikel edukasi gizi"
            onClick={() => navigate('/artikel')}
          />
        </div>
      </div>
    </AppShell>
  );
}
