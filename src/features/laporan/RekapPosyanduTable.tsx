import { INDICATOR_LABEL } from '../pengukuran/statusGizi';

interface RekapData {
  totalDiukur: number;
  totalBalita: number;
  beratBadan: Record<string, number>;
  tinggiBadan: Record<string, number>;
  lingkarKepala: Record<string, number>;
}

const GROUPS: {
  label: string;
  field: 'beratBadan' | 'tinggiBadan' | 'lingkarKepala';
}[] = [
  { label: 'Berat Badan (BB/U)', field: 'beratBadan' },
  { label: 'Tinggi Badan (TB/U)', field: 'tinggiBadan' },
  { label: 'Lingkar Kepala (LK/U)', field: 'lingkarKepala' },
];

function pct(value: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

const sumCat = (cat: Record<string, number>) =>
  Object.values(cat).reduce((acc, v) => acc + Number(v || 0), 0);

export default function RekapPosyanduTable({ data }: { data: RekapData }) {
  const groups = GROUPS.map((g) => ({
    ...g,
    statuses: Object.keys(data[g.field] ?? {}),
  }));
  const hasData = data.totalDiukur > 0 && groups.some((g) => g.statuses.length > 0);

  if (!hasData) {
    return (
      <div className="text-body-sm text-graphite">
        Belum ada pengukuran untuk direkap.
      </div>
    );
  }

  const cellCls =
    'px-[13px] py-[10px] text-body-sm text-center tabular-nums whitespace-nowrap border-l border-polar-mist align-middle';
  const headCls =
    'px-[13px] py-[10px] text-caption font-semibold text-white text-center align-middle whitespace-nowrap border-l border-deep-slate/30 bg-deep-slate';

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-charcoal">
        <thead>
          <tr>
            <th rowSpan={2} className={`${headCls} border-l-0`}>
              Indikator
            </th>
            {groups.map((g) => (
              <th key={g.field} colSpan={g.statuses.length} className={headCls}>
                {g.label}
              </th>
            ))}
          </tr>
          <tr>
            {groups.flatMap((g) =>
              g.statuses.map((s) => (
                <th key={`${g.field}-${s}`} className={headCls}>
                  {INDICATOR_LABEL[s] ?? s}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-polar-mist bg-white">
            <td className="px-[13px] py-[10px] text-body-sm text-center font-medium align-middle">
              Jumlah Balita
            </td>
            {groups.flatMap((g) => {
              const cat = data[g.field] ?? {};
              return g.statuses.map((s) => (
                <td key={`${g.field}-${s}`} className={cellCls}>
                  {Number(cat[s] || 0)}
                </td>
              ));
            })}
          </tr>
          <tr className="border-t-2 border-deep-slate/40 font-semibold bg-polar-mist">
            <td className="px-[13px] py-[10px] text-body-sm text-center align-middle">
              Total
            </td>
            {groups.flatMap((g) => {
              const cat = data[g.field] ?? {};
              const grand = sumCat(cat);
              return g.statuses.map((s) => {
                const v = Number(cat[s] || 0);
                return (
                  <td key={`${g.field}-${s}`} className={cellCls}>
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
