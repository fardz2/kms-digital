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

const GROUPS: {
  label: string;
  field: 'beratBadan' | 'tinggiBadan' | 'lingkarKepala';
  distribusi: 'distribusiBB' | 'distribusiTB' | 'distribusiLK';
}[] = [
  { label: 'Berat Badan', field: 'beratBadan', distribusi: 'distribusiBB' },
  { label: 'Tinggi Badan', field: 'tinggiBadan', distribusi: 'distribusiTB' },
  { label: 'Lingkar Kepala', field: 'lingkarKepala', distribusi: 'distribusiLK' },
];

function RekapTabel({
  perPosyandu,
  distribusiBB,
  distribusiTB,
  distribusiLK,
}: {
  perPosyandu: PerPosyanduSummary[];
  distribusiBB: Record<string, number>;
  distribusiTB: Record<string, number>;
  distribusiLK: Record<string, number>;
}) {
  const distribusiMap = {
    distribusiBB,
    distribusiTB,
    distribusiLK,
  };
  const groups = GROUPS.map((g) => ({
    ...g,
    statuses: Object.keys(distribusiMap[g.distribusi]),
  }));
  const hasData = groups.some((g) => g.statuses.length > 0);
  if (perPosyandu.length === 0 || !hasData) {
    return <div className="text-body-sm text-graphite">Belum ada data</div>;
  }

  const cellCls =
    'px-[13px] py-[10px] text-body-sm text-right tabular-nums whitespace-nowrap border-l border-polar-mist';
  const headCls =
    'px-[13px] py-[10px] text-caption font-semibold text-graphite text-right whitespace-nowrap border-l border-polar-mist';

  const sumCat = (cat: Record<string, number>) =>
    Object.values(cat).reduce((acc, v) => acc + Number(v || 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-charcoal">
        <thead>
          <tr className="border-b border-polar-mist bg-faint-fog">
            <th rowSpan={2} className={`${headCls} text-left border-l-0 align-bottom`}>
              Posyandu
            </th>
            <th rowSpan={2} className={`${headCls} align-bottom`}>
              Jumlah Balita
            </th>
            {groups.map((g) => (
              <th
                key={g.field}
                colSpan={g.statuses.length}
                className={`${headCls} text-center`}
              >
                {g.label}
              </th>
            ))}
          </tr>
          <tr className="border-b border-polar-mist bg-faint-fog">
            {groups.flatMap((g) =>
              g.statuses.map((s) => (
                <th key={`${g.field}-${s}`} className={headCls}>
                  {LABEL_MAP[s] ?? s}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {perPosyandu.map((p) => (
            <tr key={p.id} className="border-b border-polar-mist last:border-0">
              <td className="px-[13px] py-[10px] text-body-sm text-left font-medium">
                {p.nama}
              </td>
              <td className={cellCls}>{sumCat(p.beratBadan)}</td>
              {groups.flatMap((g) => {
                const cat = p[g.field] ?? {};
                const rowTotal = sumCat(cat);
                return g.statuses.map((s) => {
                  const v = Number(cat[s] || 0);
                  return (
                    <td key={`${g.field}-${s}`} className={cellCls}>
                      {v} ({pct(v, rowTotal)})
                    </td>
                  );
                });
              })}
            </tr>
          ))}
          <tr className="border-t-2 border-polar-mist font-semibold bg-faint-fog">
            <td className="px-[13px] py-[10px] text-body-sm text-left">Total Desa</td>
            <td className={cellCls}>{sumCat(distribusiBB)}</td>
            {groups.flatMap((g) => {
              const dist = distribusiMap[g.distribusi];
              const grand = sumCat(dist);
              return g.statuses.map((s) => {
                const v = Number(dist[s] || 0);
                return (
                  <td key={`${g.field}-${s}`} className={cellCls}>
                    {v} ({pct(v, grand)})
                  </td>
                );
              });
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

      <Card title="Rekap Gizi per Posyandu">
        <RekapTabel
          perPosyandu={agg.perPosyandu}
          distribusiBB={agg.distribusiBB}
          distribusiTB={agg.distribusiTB}
          distribusiLK={agg.distribusiLK}
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
