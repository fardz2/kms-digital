import React, { forwardRef } from 'react';
import {
  Baby,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import ProgressBar from '../../components/ui/ProgressBar';
import { useStatistikGiziDesa } from '../../queries/useLaporanQueries';
import { useSession } from '../auth/useSession';

interface PosyanduStat {
  id_posyandu?: number;
  nama_posyandu?: string;
  berat_badan?: Record<string, number>;
  tinggi_badan?: Record<string, number>;
  lingkar_kepala?: Record<string, number>;
}

interface PerPosyanduSummary {
  id?: number;
  nama?: string;
  total: number;
}

interface AggregatedDesa {
  totalBalita: number;
  perPosyandu: PerPosyanduSummary[];
  distribusiBB: Record<string, number>;
  distribusiTB: Record<string, number>;
  distribusiLK: Record<string, number>;
}

function sumCategory(cat: Record<string, number> | undefined): number {
  if (!cat || typeof cat !== 'object') return 0;
  return Object.values(cat).reduce((acc: number, v) => acc + Number(v || 0), 0);
}

export function aggregateDesa(statistik: PosyanduStat[] | unknown): AggregatedDesa {
  if (!Array.isArray(statistik) || statistik.length === 0) {
    return {
      totalBalita: 0,
      perPosyandu: [],
      distribusiBB: {},
      distribusiTB: {},
      distribusiLK: {},
    };
  }

  const perPosyandu: PerPosyanduSummary[] = statistik.map((p: PosyanduStat) => ({
    id: p.id_posyandu,
    nama: p.nama_posyandu,
    total: sumCategory(p.berat_badan),
  }));
  const totalBalita = perPosyandu.reduce((acc, x) => acc + x.total, 0);

  const reduceCategory = (key: 'berat_badan' | 'tinggi_badan' | 'lingkar_kepala') => {
    const acc: Record<string, number> = {};
    statistik.forEach((p: PosyanduStat) => {
      const cat = p[key] ?? {};
      Object.entries(cat).forEach(([k, v]) => {
        acc[k] = (acc[k] ?? 0) + Number(v || 0);
      });
    });
    return acc;
  };

  return {
    totalBalita,
    perPosyandu,
    distribusiBB: reduceCategory('berat_badan'),
    distribusiTB: reduceCategory('tinggi_badan'),
    distribusiLK: reduceCategory('lingkar_kepala'),
  };
}

const LABEL_MAP: Record<string, string> = {
  normal: 'Normal',
  kurus: 'Kurus',
  sangat_kurus: 'Sangat Kurus',
  gemuk: 'Gemuk',
  tinggi: 'Tinggi',
  pendek: 'Pendek',
  sangat_pendek: 'Sangat Pendek',
  makrosefali: 'Makrosefali',
  mikrosefali: 'Mikrosefali',
};

function Distribusi({
  distribusi,
  total,
}: {
  distribusi: Record<string, number>;
  total: number;
}) {
  const entries = Object.entries(distribusi);
  if (entries.length === 0 || total === 0) {
    return <div className="text-body-sm text-graphite">Belum ada data</div>;
  }
  return (
    <div className="flex flex-col gap-[13px]">
      {entries.map(([k, v]) => (
        <ProgressBar
          key={k}
          value={Number(v) || 0}
          max={total || 1}
          label={LABEL_MAP[k] ?? k}
        />
      ))}
    </div>
  );
}

const LaporanDesa = forwardRef<HTMLDivElement>(function LaporanDesa(_props, ref) {
  const { user } = useSession();
  const idDesa = user?.id_desa;
  const { data, isLoading } = useStatistikGiziDesa(idDesa);

  const agg = aggregateDesa(data);

  if (!idDesa) {
    return (
      <Card>
        <div className="flex items-center gap-[13px] text-body-sm text-graphite">
          <AlertTriangle size={20} strokeWidth={2} className="text-warning" />
          Data desa tidak tersedia.
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-[17px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[17px]">
          <div className="h-[100px] bg-polar-mist animate-pulse rounded-default" />
          <div className="h-[100px] bg-polar-mist animate-pulse rounded-default" />
        </div>
        <div className="h-[160px] bg-polar-mist animate-pulse rounded-default" />
      </div>
    );
  }

  return (
    <div ref={ref} className="flex flex-col gap-[17px] bg-faint-fog">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[17px]">
        <StatCard
          label="Total Balita"
          value={agg.totalBalita}
          icon={<Baby size={22} strokeWidth={1.75} />}
          accent="neutral"
        />
        <StatCard
          label="Posyandu Aktif"
          value={agg.perPosyandu.length}
          icon={<Building2 size={22} strokeWidth={1.75} />}
          accent="primary"
        />
      </div>

      <Card title="Rekap per Posyandu">
        {agg.perPosyandu.length === 0 ? (
          <div className="flex items-center gap-[13px] text-body-sm text-graphite">
            <AlertTriangle size={18} strokeWidth={2} />
            Belum ada data
          </div>
        ) : (
          <div className="flex flex-col gap-[17px]">
            {agg.perPosyandu.map((p) => (
              <ProgressBar
                key={p.id}
                value={p.total}
                max={agg.totalBalita || 1}
                label={p.nama}
              />
            ))}
          </div>
        )}
      </Card>

      <Card title="Sebaran Berat Badan (total desa)">
        <Distribusi distribusi={agg.distribusiBB} total={agg.totalBalita} />
      </Card>

      <Card title="Sebaran Tinggi Badan (total desa)">
        <Distribusi distribusi={agg.distribusiTB} total={agg.totalBalita} />
      </Card>

      <Card title="Sebaran Lingkar Kepala (total desa)">
        <Distribusi distribusi={agg.distribusiLK} total={agg.totalBalita} />
      </Card>

      {agg.perPosyandu.length > 0 && agg.totalBalita > 0 && (
        <Card>
          <div className="flex items-center gap-[13px] text-body-sm text-success">
            <CheckCircle2 size={18} strokeWidth={2} />
            Data rekap desa sudah lengkap.
          </div>
        </Card>
      )}
    </div>
  );
});

export default LaporanDesa;
