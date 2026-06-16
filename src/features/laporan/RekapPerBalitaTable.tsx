import dayjs from 'dayjs';
import { Check } from 'lucide-react';
import {
  INDICATOR_LABEL,
  INDICATOR_TONE,
  BBU,
  TBU,
  LKU,
  STATUS,
  STATUS_LABEL,
} from '../pengukuran/statusGizi';
import {
  indicatorCellToneClass,
  indicatorGroupBorderClass,
  indicatorHeaderToneClass,
} from './indicatorTableStyles';

interface BalitaRow {
  id: number | string;
  nama: string;
  tanggalUkur: string | null;
  bbu: string;
  tbu: string;
  lku: string;
  gizi: string;
}

const BBU_ORDER = [BBU.SANGAT_KURANG, BBU.KURANG, BBU.NORMAL, BBU.LEBIH];
const TBU_ORDER = [TBU.SANGAT_PENDEK, TBU.PENDEK, TBU.NORMAL, TBU.TINGGI];
const LKU_ORDER = [LKU.MIKROSEFALI, LKU.NORMAL, LKU.MAKROSEFALI];
const STATUS_ORDER = [STATUS.NORMAL, STATUS.KURANG, STATUS.STUNTING, STATUS.OBESITAS];

const GROUPS: {
  label: string;
  field: 'bbu' | 'tbu' | 'lku' | 'gizi';
  statuses: string[];
}[] = [
  { label: 'Berat Badan (BB/U)', field: 'bbu', statuses: BBU_ORDER },
  { label: 'Tinggi Badan (TB/U)', field: 'tbu', statuses: TBU_ORDER },
  { label: 'Lingkar Kepala (LK/U)', field: 'lku', statuses: LKU_ORDER },
  { label: 'Status Gizi', field: 'gizi', statuses: STATUS_ORDER },
];

export default function RekapPerBalitaTable({ data }: { data: BalitaRow[] }) {
  const rows = (data ?? []).filter((r) => r.tanggalUkur != null);

  if (rows.length === 0) {
    return (
      <div className="text-body-sm text-graphite">
        Belum ada pengukuran untuk direkap.
      </div>
    );
  }

  const cellCls =
    'px-[10px] py-[10px] text-center whitespace-nowrap align-middle';
  const headCls =
    'px-[10px] py-[10px] text-caption font-semibold text-white text-center align-middle whitespace-nowrap';

  return (
    <div className="overflow-x-auto rounded-default border-2 border-light-ash">
      <table className="w-full border-collapse text-charcoal">
        <thead>
          <tr>
            <th rowSpan={2} className={`${headCls} bg-primary-600 border-l-0 text-left`}>
              Nama
            </th>
            <th
              rowSpan={2}
              className={`${headCls} bg-primary-600 ${indicatorGroupBorderClass('header', false)}`}
            >
              Tgl Ukur
            </th>
            {GROUPS.map((g, gIdx) => (
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
            {GROUPS.flatMap((g, gIdx) =>
              g.statuses.map((s, sIdx) => {
                const tone = INDICATOR_TONE[s] || 'unknown';
                const bgClass = indicatorHeaderToneClass(tone);
                const borderClass = indicatorGroupBorderClass('header', gIdx > 0 && sIdx === 0);
                const label = g.field === 'gizi' ? STATUS_LABEL[s] ?? s : INDICATOR_LABEL[s] ?? s;
                return (
                  <th key={`${g.field}-${s}`} className={`${headCls} ${bgClass} ${borderClass}`}>
                    {label}
                  </th>
                );
              })
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={r.id}
              className={`border-b-2 border-light-ash ${idx % 2 === 1 ? 'bg-faint-fog' : 'bg-white'}`}
            >
              <td className="px-[13px] py-[10px] text-body-sm text-left font-medium align-middle">
                {r.nama}
              </td>
              <td className={`${cellCls} text-body-sm tabular-nums border-l-2 border-light-ash`}>
                {r.tanggalUkur ? dayjs(r.tanggalUkur).format('DD MMM YYYY') : '-'}
              </td>
              {GROUPS.flatMap((g, gIdx) =>
                g.statuses.map((s, sIdx) => {
                  const checked = r[g.field] === s;
                  const tone = INDICATOR_TONE[s] || 'unknown';
                  const textClass = indicatorCellToneClass(tone);
                  const borderClass = indicatorGroupBorderClass('cell', gIdx > 0 && sIdx === 0);
                  return (
                    <td key={`${g.field}-${s}`} className={`${cellCls} ${borderClass} ${checked ? textClass : ''}`}>
                      {checked ? (
                        <Check
                          size={18}
                          strokeWidth={2.5}
                          className="inline text-success"
                          aria-label={INDICATOR_LABEL[s] ?? s}
                        />
                      ) : (
                        <span className="text-light-ash" aria-hidden>
                          ·
                        </span>
                      )}
                    </td>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
