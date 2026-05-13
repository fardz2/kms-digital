import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import { useStatistikGiziDesa } from '../../queries/useLaporanQueries';
import LaporanDesa from '../laporan/LaporanDesa';
import ExportDesaForm from './ExportDesaForm';

const MENU = [
  { key: 'beranda', label: 'Laporan', path: '/desa/beranda' },
  { key: 'acara', label: 'Kelola Acara', path: '/desa/acara' },
];

export default function BerandaDesa() {
  const navigate = useNavigate();
  const { user } = useSession();
  const printableRef = useRef(null);

  const idDesa = user?.id_desa ?? user?.desa_id;
  const { data: statistikData } = useStatistikGiziDesa(idDesa);
  const posyanduList = Array.isArray(statistikData) ? statistikData : [];

  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        title={`Desa ${user?.nama_desa ?? user?.desa_name ?? ''}`}
        eyebrow="Pemerintah Desa"
        subtitle="Rekap gizi balita se-desa."
        action={
          <Button
            variant="primary"
            size="lg"
            leadingIcon={<Calendar size={20} strokeWidth={2} />}
            onClick={() => navigate('/desa/acara')}
          >
            Kelola Acara Posyandu
          </Button>
        }
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[25px]">
        <ExportDesaForm
          posyanduList={posyanduList}
          printableRef={printableRef}
        />
        <LaporanDesa ref={printableRef} />
      </div>
    </AppShell>
  );
}
