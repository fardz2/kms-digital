import type { Ref } from 'react';
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
import { aggregateDesa } from './aggregateDesa';

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

const LaporanDesa = function LaporanDesa({ ref }: { ref?: Ref<HTMLDivElement> }) {
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
    <div ref={ref} data-tour-id="desa-laporan" className="flex flex-col gap-[17px] bg-faint-fog">
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
};

export default LaporanDesa;
