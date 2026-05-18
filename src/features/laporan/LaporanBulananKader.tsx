import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useQueries } from '@tanstack/react-query';
import {
  ArrowLeft,
  Baby,
  CheckCircle2,
  AlertTriangle,
  Check,
} from 'lucide-react';
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
  const [bulan, setBulan] = useState(dayjs().format('YYYY-MM'));
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
    <div className="min-h-screen bg-faint-fog">
      <PageHeader
        title="Laporan Bulanan"
        eyebrow="Rekap Posyandu"
        subtitle="Rekap pengukuran balita di posyandu Anda."
      />

      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px]">
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<ArrowLeft size={16} strokeWidth={1.75} />}
          onClick={() => navigate(-1)}
          className="mb-[17px]"
        >
          Kembali
        </Button>

        <div data-tour-id="kader-laporan-picker" className="mb-[25px]">
          <div className="text-caption font-bold uppercase tracking-[0.12em] text-graphite mb-[8px]">
            Pilih Bulan
          </div>
          <MonthPicker value={bulan} onChange={setBulan} />
        </div>

        {isLoading ? (
          <div className="space-y-[17px]">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[17px]">
              <div className="h-[100px] bg-polar-mist animate-pulse rounded-default" />
              <div className="h-[100px] bg-polar-mist animate-pulse rounded-default" />
              <div className="h-[100px] bg-polar-mist animate-pulse rounded-default" />
            </div>
            <div className="h-[200px] bg-polar-mist animate-pulse rounded-default" />
          </div>
        ) : (
          <>
            <div data-tour-id="kader-laporan-stats" className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[17px] mb-[25px]">
              <StatCard
                label="Total Balita"
                value={laporan.totalBalita}
                icon={<Baby size={22} strokeWidth={1.75} />}
                accent="neutral"
              />
              <StatCard
                label="Sudah Diukur"
                value={laporan.sudahDiukur}
                icon={<CheckCircle2 size={22} strokeWidth={1.75} />}
                accent="success"
              />
              <StatCard
                label="Belum Diukur"
                value={laporan.belumDiukur}
                icon={<AlertTriangle size={22} strokeWidth={1.75} />}
                accent="warning"
              />
            </div>

            <Card title="Partisipasi Bulan Ini" className="mb-[17px]">
              <ProgressBar
                value={laporan.sudahDiukur}
                max={laporan.totalBalita || 1}
              />
            </Card>

            <Card title="Sebaran Status Gizi" className="mb-[17px]">
              <StatusDistribution
                distribusi={laporan.distribusi}
                total={Object.values(laporan.distribusi).reduce((a, b) => a + b, 0)}
              />
            </Card>

            <Card
              title={`Belum Diukur Bulan Ini (${laporan.belumDiukurList.length})`}
              className="mb-[17px]"
            >
              {laporan.belumDiukurList.length === 0 ? (
                <div className="flex items-center gap-[13px] text-body-sm text-success">
                  <Check size={20} strokeWidth={2} />
                  Semua balita sudah diukur.
                </div>
              ) : (
                <ul className="pl-[21px] m-0 space-y-[6px]">
                  {laporan.belumDiukurList.map((item) => (
                    <li key={item.id} className="text-body-sm text-deep-slate">
                      {item.nama}
                      {item.umurBulan != null && ` (${item.umurBulan} bulan)`}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title={`Perlu Perhatian (${laporan.perluPerhatian.length})`}>
              {laporan.perluPerhatian.length === 0 ? (
                <div className="flex items-center gap-[13px] text-body-sm text-success">
                  <Check size={20} strokeWidth={2} />
                  Tidak ada balita yang perlu perhatian khusus.
                </div>
              ) : (
                <ul className="m-0 space-y-[8px]">
                  {laporan.perluPerhatian.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-[8px] text-body-sm text-deep-slate"
                    >
                      <AlertTriangle
                        size={16}
                        strokeWidth={2}
                        className="text-danger shrink-0 mt-[3px]"
                      />
                      <span>
                        <span className="font-semibold">{item.nama}</span> · {item.status}
                      </span>
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
