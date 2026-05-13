import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useQueries } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MonthPicker from '../../components/ui/MonthPicker';
import StatCard from '../../components/ui/StatCard';
import StatusDistribution from '../../components/ui/StatusDistribution';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAnakList } from '../../queries/useAnakQueries';
import { pengukuranApi } from '../../api/pengukuran.api';
import { useSession } from '../auth/useSession';
import { qk } from '../../queries/keys';
import { aggregateKaderLaporan } from './aggregateKader';

export default function LaporanBulananKader() {
  const navigate = useNavigate();
  const [bulan, setBulan] = useState(moment().format('YYYY-MM'));
  const { role } = useSession();
  const { data: anakList, isLoading: anakLoading } = useAnakList();

  const pengukuranQueries = useQueries({
    queries: (anakList ?? []).map((anak) => ({
      queryKey: qk.pengukuran.byAnak(anak.id, role),
      queryFn: async () => {
        const res = await pengukuranApi.list(anak.id, role);
        return res.data ?? [];
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isFetchingPengukuran = pengukuranQueries.some((q) => q.isLoading);

  const pengukuranByAnak = useMemo(() => {
    const map = {};
    (anakList ?? []).forEach((anak, idx) => {
      map[anak.id] = pengukuranQueries[idx]?.data ?? [];
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anakList, pengukuranQueries.map((q) => q.dataUpdatedAt).join(',')]);

  const laporan = useMemo(
    () => aggregateKaderLaporan({ anakList, pengukuranByAnak, bulan }),
    [anakList, pengukuranByAnak, bulan]
  );

  const isLoading = anakLoading || isFetchingPengukuran;

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader title="Laporan Bulanan" subtitle="Rekap posyandu Anda" />

      <div className="px-4 py-6 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Kembali
        </Button>

        <div className="mb-6">
          <div className="text-caption text-neutral-500 mb-1">Bulan:</div>
          <MonthPicker value={bulan} onChange={setBulan} />
        </div>

        {isLoading ? (
          <div className="text-neutral-500">Memuat data laporan...</div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4 mb-6">
              <StatCard label="Total Balita" value={laporan.totalBalita} icon="👶" />
              <StatCard
                label="Sudah Diukur"
                value={laporan.sudahDiukur}
                icon="✅"
                accent="success"
              />
              <StatCard
                label="Belum Diukur"
                value={laporan.belumDiukur}
                icon="⚠️"
                accent="warning"
              />
            </div>

            <Card title="Partisipasi Bulan Ini" className="mb-6">
              <ProgressBar
                value={laporan.sudahDiukur}
                max={laporan.totalBalita || 1}
              />
            </Card>

            <Card title="Sebaran Status Gizi" className="mb-6">
              <StatusDistribution
                distribusi={laporan.distribusi}
                total={Object.values(laporan.distribusi).reduce((a, b) => a + b, 0)}
              />
            </Card>

            <Card
              title={`Belum Diukur Bulan Ini (${laporan.belumDiukurList.length})`}
              className="mb-6"
            >
              {laporan.belumDiukurList.length === 0 ? (
                <div className="text-neutral-500">
                  Semua balita sudah diukur 🎉
                </div>
              ) : (
                <ul className="pl-5 m-0 space-y-1">
                  {laporan.belumDiukurList.map((item) => (
                    <li key={item.id} className="text-base text-neutral-700">
                      {item.nama}
                      {item.umurBulan != null && ` (${item.umurBulan} bulan)`}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title={`Perlu Perhatian (${laporan.perluPerhatian.length})`}>
              {laporan.perluPerhatian.length === 0 ? (
                <div className="text-neutral-500">
                  Tidak ada balita yang perlu perhatian khusus 🎉
                </div>
              ) : (
                <ul className="pl-5 m-0 space-y-1">
                  {laporan.perluPerhatian.map((item) => (
                    <li key={item.id} className="text-base text-neutral-700">
                      ⚠️ {item.nama} — {item.status}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
