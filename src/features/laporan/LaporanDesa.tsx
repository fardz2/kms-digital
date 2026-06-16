import { useMemo, type Ref } from 'react';
import {
  Baby,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { useStatistikGiziDesa } from '../../queries/useLaporanQueries';
import { usePengukuranBulananDesa } from '../../queries/usePengukuranBulananDesa';
import { useSession } from '../auth/useSession';
import {
  aggregateDesa,
  aggregateDesaDariAnak,
  type PerPosyanduSummary,
} from './aggregateDesa';
import {
  INDICATOR_TONE,
  BBU,
  LKU,
  STATUS,
  STATUS_LABEL,
  TBU,
} from '../pengukuran/statusGizi';
import {
  indicatorGroupBorderClass,
  indicatorHeaderToneClass,
} from './indicatorTableStyles';

const LABEL_MAP: Record<string, string> = {
  normal: 'Normal',
  [BBU.SANGAT_KURANG]: 'BB Sangat Kurang',
  [BBU.KURANG]: 'BB Kurang',
  [BBU.NORMAL]: 'BB Normal',
  [BBU.LEBIH]: 'BB Lebih',
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

const GIZI_ORDER = [STATUS.NORMAL, STATUS.KURANG, STATUS.STUNTING, STATUS.OBESITAS];
const BB_ORDER = ['sangat_kurus', 'kurus', 'normal', 'gemuk'];
const TBU_ORDER = ['sangat_pendek', 'pendek', 'normal', 'tinggi'];
const LKU_ORDER = ['mikrosefali', 'normal', 'makrosefali'];

const BB_TONE_MAP: Record<string, string> = {
  sangat_kurus: BBU.SANGAT_KURANG,
  kurus: BBU.KURANG,
  normal: BBU.NORMAL,
  gemuk: BBU.LEBIH,
};

const TBU_TONE_MAP: Record<string, string> = {
  sangat_pendek: TBU.SANGAT_PENDEK,
  pendek: TBU.PENDEK,
  normal: TBU.NORMAL,
  tinggi: TBU.TINGGI,
};

const LKU_TONE_MAP: Record<string, string> = {
  mikrosefali: LKU.MIKROSEFALI,
  normal: LKU.NORMAL,
  makrosefali: LKU.MAKROSEFALI,
};

const GIZI_TONE_MAP: Record<string, string> = {
  normal: STATUS.NORMAL,
  kurang: STATUS.KURANG,
  stunting: STATUS.STUNTING,
  obesitas: STATUS.OBESITAS,
};

function sumCat(cat: Record<string, number>): number {
  return Object.values(cat ?? {}).reduce((acc, v) => acc + Number(v || 0), 0);
}

const GROUPS: {
  label: string;
  field: 'beratBadan' | 'tinggiBadan' | 'lingkarKepala' | 'gizi';
  distribusi: 'distribusiBB' | 'distribusiTB' | 'distribusiLK' | 'distribusiGizi';
  order: string[];
  toneMap: Record<string, string>;
}[] = [
  { label: 'Berat Badan (BB/U)', field: 'beratBadan', distribusi: 'distribusiBB', order: BB_ORDER, toneMap: BB_TONE_MAP },
  { label: 'Tinggi Badan (TB/U)', field: 'tinggiBadan', distribusi: 'distribusiTB', order: TBU_ORDER, toneMap: TBU_TONE_MAP },
  { label: 'Lingkar Kepala (LK/U)', field: 'lingkarKepala', distribusi: 'distribusiLK', order: LKU_ORDER, toneMap: LKU_TONE_MAP },
  { label: 'Status Gizi', field: 'gizi', distribusi: 'distribusiGizi', order: GIZI_ORDER, toneMap: GIZI_TONE_MAP },
];

export function RekapTabel({
  perPosyandu,
  distribusiBB,
  distribusiTB,
  distribusiLK,
  distribusiGizi,
}: {
  perPosyandu: PerPosyanduSummary[];
  distribusiBB: Record<string, number>;
  distribusiTB: Record<string, number>;
  distribusiLK: Record<string, number>;
  distribusiGizi: Record<string, number>;
}) {
  const distribusiMap = {
    distribusiBB: distribusiBB ?? {},
    distribusiTB: distribusiTB ?? {},
    distribusiLK: distribusiLK ?? {},
    distribusiGizi: distribusiGizi ?? {},
  };
  const groups = GROUPS.map((g) => {
    const dist = distribusiMap[g.distribusi];
    const present =
      g.field === 'beratBadan' || g.field === 'gizi'
        ? g.order
        : g.order.filter((s) => (dist[s] ?? 0) > 0 || s in dist);
    return { ...g, statuses: present };
  });
  const hasData = groups.some((g) => g.statuses.length > 0);
  if (perPosyandu.length === 0 || !hasData) {
    return <div className="text-body-sm text-graphite">Belum ada data</div>;
  }

  const cellCls =
    'px-[13px] py-[10px] text-body-sm text-center tabular-nums whitespace-nowrap align-middle';
  const headCls =
    'px-[13px] py-[10px] text-caption font-semibold text-white text-center align-middle whitespace-nowrap';

  return (
      <div className="overflow-x-auto rounded-default border-2 border-light-ash">
      <table className="w-full border-collapse text-charcoal">
        <thead>
          <tr>
            <th rowSpan={2} className={`${headCls} bg-primary-600 border-l-0`}>
              Posyandu
            </th>
            <th
              rowSpan={2}
              className={`${headCls} bg-primary-600 ${indicatorGroupBorderClass('header', false)}`}
            >
              Jumlah Balita
            </th>
            {groups.map((g, gIdx) => (
              <th
                key={g.field}
                colSpan={g.statuses.length}
                className={`${headCls} bg-primary-600 ${indicatorGroupBorderClass('header', gIdx > 0)}`}
              >
                {g.label}
              </th>
            ))}
          </tr>
          <tr>
            {groups.flatMap((g, gIdx) =>
              g.statuses.map((s, sIdx) => {
                const toneKey = g.toneMap[s] ?? s;
                const tone = INDICATOR_TONE[toneKey] || 'unknown';
                const label = g.field === 'gizi' ? STATUS_LABEL[s] ?? s : LABEL_MAP[s] ?? s;
                return (
                  <th
                    key={`${g.field}-${s}`}
                    className={`${headCls} ${indicatorHeaderToneClass(tone)} ${indicatorGroupBorderClass('header', gIdx > 0 && sIdx === 0)}`}
                  >
                    {label}
                  </th>
                );
              })
            )}
          </tr>
        </thead>
        <tbody>
          {perPosyandu.map((p, idx) => (
            <tr
              key={p.id}
              className={`border-b-2 border-light-ash ${idx % 2 === 1 ? 'bg-faint-fog' : 'bg-white'}`}
            >
            <td className="px-[13px] py-[10px] text-body-sm text-center font-medium align-middle">
              {p.nama}
            </td>
              <td className={`${cellCls} ${indicatorGroupBorderClass('cell', false)}`}>
                {p.total}
              </td>
              {groups.flatMap((g, gIdx) => {
                const cat = p[g.field] ?? {};
                return g.statuses.map((s, sIdx) => {
                  const v = Number(cat[s] || 0);
                  return (
                    <td
                      key={`${g.field}-${s}`}
                      className={`${cellCls} ${indicatorGroupBorderClass('cell', gIdx > 0 && sIdx === 0)}`}
                    >
                      {v}
                    </td>
                  );
                });
              })}
            </tr>
          ))}
          <tr className="border-t-2 border-primary-600/40 font-semibold bg-primary-50">
            <td className="px-[13px] py-[10px] text-body-sm text-center align-middle">
              Total
            </td>
            <td className={`${cellCls} ${indicatorGroupBorderClass('cell', false)}`}>
              {sumCat(distribusiBB)}
            </td>
            {groups.flatMap((g, gIdx) => {
              const dist = distribusiMap[g.distribusi];
              const grand = sumCat(dist);
              return g.statuses.map((s, sIdx) => {
                const v = Number(dist[s] || 0);
                return (
                  <td
                    key={`${g.field}-${s}`}
                    className={`${cellCls} ${indicatorGroupBorderClass('cell', gIdx > 0 && sIdx === 0)}`}
                  >
                    <div className="leading-tight">{v}</div>
                    <div className="text-caption font-normal text-graphite">
                      {pct(v, grand)}
                    </div>
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
  const {
    data: statistikData,
    isLoading: statistikLoading,
    isError: statistikError,
  } = useStatistikGiziDesa(idDesa);
  const {
    anakList,
    pengukuranByAnak,
    isLoading: anakLoading,
  } = usePengukuranBulananDesa();

  const agg = useMemo(
    () => {
      const fallback = aggregateDesa(statistikData);
      const calculated = aggregateDesaDariAnak({
        posyanduStats: statistikData,
        anakList,
        pengukuranByAnak,
      });
      const hasCalculatedData =
        anakList.length > 0 &&
        Object.values(pengukuranByAnak).some((items) => (items ?? []).length > 0);
      return hasCalculatedData ? calculated : fallback;
    },
    [statistikData, anakList, pengukuranByAnak]
  );
  const isLoading = statistikLoading || anakLoading;
  const isError = statistikError;

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

      {isError && (
        <Card>
          <div className="flex items-center gap-[13px] text-body-sm text-warning">
            <AlertTriangle size={18} strokeWidth={2} />
            Sebagian data desa gagal dimuat, jadi rekap memakai ringkasan yang tersedia.
          </div>
        </Card>
      )}

      <Card title="Rekap Gizi per Posyandu">
        <RekapTabel
          perPosyandu={agg.perPosyandu}
          distribusiBB={agg.distribusiBB}
          distribusiTB={agg.distribusiTB}
          distribusiLK={agg.distribusiLK}
          distribusiGizi={agg.distribusiGizi}
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
