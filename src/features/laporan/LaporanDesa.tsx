import type { Ref } from 'react';
import {
  Baby,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { useStatistikGiziDesa } from '../../queries/useLaporanQueries';
import { useSession } from '../auth/useSession';
import { aggregateDesa, type PerPosyanduSummary } from './aggregateDesa';

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

function pct(value: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function RekapTabel({
  perPosyandu,
  distribusi,
  field,
}: {
  perPosyandu: PerPosyanduSummary[];
  distribusi: Record<string, number>;
  field: 'beratBadan' | 'tinggiBadan' | 'lingkarKepala';
}) {
  const statuses = Object.keys(distribusi);
  if (perPosyandu.length === 0 || statuses.length === 0) {
    return <div className="text-body-sm text-graphite">Belum ada data</div>;
  }
  const cellCls = 'px-[13px] py-[10px] text-body-sm text-right tabular-nums whitespace-nowrap';
  const headCls = 'px-[13px] py-[10px] text-caption font-semibold text-graphite text-right whitespace-nowrap';
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-charcoal">
        <thead>
          <tr className="border-b border-polar-mist">
            <th className={`${headCls} text-left`}>Posyandu</th>
            <th className={headCls}>Jumlah Balita</th>
            {statuses.map((s) => (
              <th key={s} className={headCls}>
                {LABEL_MAP[s] ?? s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {perPosyandu.map((p) => {
            const cat = p[field] ?? {};
            const rowTotal = Object.values(cat).reduce(
              (acc, v) => acc + Number(v || 0),
              0
            );
            return (
              <tr key={p.id} className="border-b border-polar-mist last:border-0">
                <td className="px-[13px] py-[10px] text-body-sm text-left font-medium">
                  {p.nama}
                </td>
                <td className={cellCls}>{rowTotal}</td>
                {statuses.map((s) => {
                  const v = Number(cat[s] || 0);
                  return (
                    <td key={s} className={cellCls}>
                      {v} ({pct(v, rowTotal)})
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr className="border-t-2 border-polar-mist font-semibold">
            <td className="px-[13px] py-[10px] text-body-sm text-left">Total Desa</td>
            <td className={cellCls}>
              {statuses.reduce((acc, s) => acc + Number(distribusi[s] || 0), 0)}
            </td>
            {statuses.map((s) => {
              const v = Number(distribusi[s] || 0);
              const grand = statuses.reduce(
                (acc, k) => acc + Number(distribusi[k] || 0),
                0
              );
              return (
                <td key={s} className={cellCls}>
                  {v} ({pct(v, grand)})
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
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

      <Card title="Sebaran Berat Badan per Posyandu">
        <RekapTabel
          perPosyandu={agg.perPosyandu}
          distribusi={agg.distribusiBB}
          field="beratBadan"
        />
      </Card>

      <Card title="Sebaran Tinggi Badan per Posyandu">
        <RekapTabel
          perPosyandu={agg.perPosyandu}
          distribusi={agg.distribusiTB}
          field="tinggiBadan"
        />
      </Card>

      <Card title="Sebaran Lingkar Kepala per Posyandu">
        <RekapTabel
          perPosyandu={agg.perPosyandu}
          distribusi={agg.distribusiLK}
          field="lingkarKepala"
        />
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
