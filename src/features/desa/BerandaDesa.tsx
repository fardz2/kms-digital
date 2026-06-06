import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import PageHeader from '../../components/ui/PageHeader';
import { useSession } from '../auth/useSession';
import { useStatistikGiziDesa } from '../../queries/useLaporanQueries';
import LaporanDesa from '../laporan/LaporanDesa';
import ExportDesaForm from './ExportDesaForm';
import AcaraSection from './AcaraSection';
import ErrorState from '../../components/ui/ErrorState';

export default function BerandaDesa() {
  const { user } = useSession();
  const printableRef = useRef<HTMLDivElement>(null);
  const { hash } = useLocation();

  const idDesa = user?.id_desa;
  const { data: statistikData, isError, refetch } = useStatistikGiziDesa(idDesa);
  const posyanduList = Array.isArray(statistikData) ? statistikData : [];

  useEffect(() => {
    if (hash === '#acara') {
      const el = document.getElementById('acara');
      if (el) {
        const timer = setTimeout(
          () => el.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          100
        );
        return () => clearTimeout(timer);
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-faint-fog">
      <Navbar isLogin />
      <PageHeader
        title={`Desa ${user?.nama_desa ?? user?.desa_name ?? ''}`}
        eyebrow="Pemerintah Desa"
        subtitle="Rekap gizi balita dan kelola acara posyandu."
        dataTourId="desa-header"
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[33px]">
        {isError && <ErrorState onRetry={() => refetch()} />}
        <ExportDesaForm posyanduList={posyanduList} printableRef={printableRef} />
        <LaporanDesa ref={printableRef} />
        <AcaraSection />
      </div>
    </div>
  );
}
