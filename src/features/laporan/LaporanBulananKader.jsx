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
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader title="Laporan Bulanan" subtitle="Rekap posyandu Anda" />
      <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          ← Kembali
        </Button>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div
            style={{
              fontSize: 'var(--text-base)',
              marginBottom: 'var(--space-xs)',
              color: 'var(--color-muted)',
            }}
          >
            Bulan:
          </div>
          <MonthPicker value={bulan} onChange={setBulan} />
        </div>

        {isLoading ? (
          <div>Memuat data laporan...</div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              <StatCard label="Total Balita" value={laporan.totalBalita} icon="👶" />
              <StatCard
                label="Sudah Diukur"
                value={laporan.sudahDiukur}
                icon="✅"
                color="var(--color-success)"
              />
              <StatCard
                label="Belum Diukur"
                value={laporan.belumDiukur}
                icon="⚠️"
                color="var(--color-warning)"
              />
            </div>

            <Card title="Partisipasi Bulan Ini" style={{ marginBottom: 'var(--space-lg)' }}>
              <ProgressBar
                value={laporan.sudahDiukur}
                max={laporan.totalBalita || 1}
              />
            </Card>

            <Card title="Sebaran Status Gizi" style={{ marginBottom: 'var(--space-lg)' }}>
              <StatusDistribution
                distribusi={laporan.distribusi}
                total={laporan.sudahDiukur}
              />
            </Card>

            <Card
              title={`Belum Diukur Bulan Ini (${laporan.belumDiukurList.length})`}
              style={{ marginBottom: 'var(--space-lg)' }}
            >
              {laporan.belumDiukurList.length === 0 ? (
                <div style={{ color: 'var(--color-muted)' }}>
                  Semua balita sudah diukur 🎉
                </div>
              ) : (
                <ul style={{ paddingLeft: 'var(--space-lg)', margin: 0 }}>
                  {laporan.belumDiukurList.map((item) => (
                    <li key={item.id} style={{ padding: 'var(--space-xs) 0' }}>
                      {item.nama}
                      {item.umurBulan != null && ` (${item.umurBulan} bulan)`}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title={`Perlu Perhatian (${laporan.perluPerhatian.length})`}>
              {laporan.perluPerhatian.length === 0 ? (
                <div style={{ color: 'var(--color-muted)' }}>
                  Tidak ada balita yang perlu perhatian khusus 🎉
                </div>
              ) : (
                <ul style={{ paddingLeft: 'var(--space-lg)', margin: 0 }}>
                  {laporan.perluPerhatian.map((item) => (
                    <li key={item.id} style={{ padding: 'var(--space-xs) 0' }}>
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
