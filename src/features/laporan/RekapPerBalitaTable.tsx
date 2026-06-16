import { useMemo, useState } from 'react';
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
import TablePagination from './TablePagination';

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
  { label: 'Berat Badan', field: 'bbu', statuses: BBU_ORDER },
  { label: 'Tinggi Badan', field: 'tbu', statuses: TBU_ORDER },
  { label: 'Lingkar Kepala', field: 'lku', statuses: LKU_ORDER },
  { label: 'Status Gizi', field: 'gizi', statuses: STATUS_ORDER },
];

const DEFAULT_PAGE_SIZE = 5;
const PAGE_SIZE_OPTIONS = [5, 10, 20];
const HEADER_ROW_CLASS = 'sticky top-0 z-30';
const SUBHEADER_ROW_CLASS = 'sticky top-[44px] z-20';

export default function RekapPerBalitaTable({ data }: { data: BalitaRow[] }) {
  const rows = useMemo(
    () => (data ?? []).filter((r) => r.tanggalUkur != null),
    [data]
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = rows.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize);

  const cellCls =
    'px-[10px] py-[10px] text-center whitespace-nowrap align-middle';
  const headCls =
    'px-[10px] py-[10px] text-caption font-semibold text-white text-center align-middle whitespace-nowrap';
  const totalByGroup = useMemo(() => {
    return GROUPS.reduce((acc, group) => {
      acc[group.field] = group.statuses.reduce((statusAcc, status) => {
        statusAcc[status] = rows.filter((row) => row[group.field] === status).length;
        return statusAcc;
      }, {} as Record<string, number>);
      return acc;
    }, {} as Record<string, Record<string, number>>);
  }, [rows]);
  const getStatusLabel = (field: 'bbu' | 'tbu' | 'lku' | 'gizi', status: string) =>
    field === 'gizi' ? STATUS_LABEL[status] ?? status : INDICATOR_LABEL[status] ?? status;

  if (rows.length === 0) {
    return (
      <div className="text-body-sm text-graphite">
        Belum ada pengukuran untuk direkap.
      </div>
    );
  }

  return (
    <div className="space-y-[17px]">
      <div className="overflow-x-auto rounded-default border-2 border-light-ash">
      <table className="w-full border-collapse text-charcoal">
        <thead>
          <tr>
            <th
              rowSpan={2}
              className={`${headCls} ${HEADER_ROW_CLASS} bg-primary-600 border-l-0 text-left`}
            >
              Nama
            </th>
            <th
              rowSpan={2}
              className={`${headCls} ${HEADER_ROW_CLASS} bg-primary-600 ${indicatorGroupBorderClass('header', false)}`}
            >
              Tgl Ukur
            </th>
            {GROUPS.map((g, gIdx) => (
              <th
                key={g.field}
                colSpan={g.statuses.length}
                className={`${headCls} ${HEADER_ROW_CLASS} bg-primary-600 ${indicatorGroupBorderClass('header', gIdx > 0)}`}
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
                return (
                  <th
                    key={`${g.field}-${s}`}
                    className={`${headCls} ${SUBHEADER_ROW_CLASS} ${bgClass} ${borderClass}`}
                  >
                    {getStatusLabel(g.field, s)}
                  </th>
                );
              })
            )}
          </tr>
        </thead>
        <tbody>
          {pageRows.map((r, idx) => (
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
                  const tone =
                    g.field === 'gizi'
                      ? s === STATUS.NORMAL
                        ? 'normal'
                        : 'danger'
                      : INDICATOR_TONE[s] || 'unknown';
                  const textClass = indicatorCellToneClass(tone);
                  const borderClass = indicatorGroupBorderClass('cell', gIdx > 0 && sIdx === 0);
                  return (
                    <td key={`${g.field}-${s}`} className={`${cellCls} ${borderClass} ${checked ? textClass : ''}`}>
                      {checked ? (
                        <Check
                          size={18}
                          strokeWidth={2.5}
                          className="inline"
                          aria-label={getStatusLabel(g.field, s)}
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
          <tr className="border-t-2 border-primary-600/40 font-semibold bg-primary-50">
            <td className="px-[13px] py-[10px] text-body-sm text-left align-middle">
              Total
            </td>
            <td className="px-[13px] py-[10px] text-body-sm text-center align-middle tabular-nums border-l-2 border-light-ash">
              {rows.length}
            </td>
            {GROUPS.flatMap((g, gIdx) =>
              g.statuses.map((s, sIdx) => {
                const v = Number(totalByGroup[g.field]?.[s] || 0);
                const borderClass = indicatorGroupBorderClass('cell', gIdx > 0 && sIdx === 0);
                return (
                  <td
                    key={`total-${g.field}-${s}`}
                    className={`px-[10px] py-[10px] text-center whitespace-nowrap align-middle tabular-nums ${borderClass}`}
                  >
                    {v}
                  </td>
                );
              })
            )}
          </tr>
        </tbody>
      </table>
      </div>
      <TablePagination
        pageIndex={safePageIndex}
        pageCount={pageCount}
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageIndexChange={setPageIndex}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          setPageIndex(0);
        }}
      />
    </div>
  );
}
