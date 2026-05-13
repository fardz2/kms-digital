import React from 'react';
import moment from 'moment';
import { CheckCheck, BarChart3, LogOut } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function PosyanduHeader({
  userName,
  posyanduName,
  sudahCount,
  totalCount,
  pendingCount = 0,
  onApprove,
  onLaporan,
  onKeluar,
}) {
  const bulanLabel = moment().format('MMMM YYYY');
  const persen = totalCount ? Math.round((sudahCount / totalCount) * 100) : 0;

  return (
    <header className="bg-white border-b border-light-ash">
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[25px] md:py-[33px]">
        <div className="flex items-start justify-between gap-[17px] flex-wrap mb-[25px]">
          <div className="min-w-0 flex-1">
            <p className="text-overline text-graphite uppercase mb-1">
              {bulanLabel}
            </p>
            <h1 className="text-heading-lg font-bold text-deep-slate truncate">
              Halo, {userName ?? 'Kader'}
            </h1>
            {posyanduName && (
              <p className="text-body-sm text-graphite mt-1">
                Posyandu {posyanduName}
              </p>
            )}
          </div>
          <div className="flex gap-[8px] flex-wrap">
            {pendingCount > 0 && (
              <Button
                variant="default"
                size="sm"
                leadingIcon={<CheckCheck size={16} strokeWidth={1.75} />}
                onClick={onApprove}
              >
                Setujui
                <span className="ml-[6px] px-[8px] py-[1px] bg-primary-100 text-primary-700 rounded-full text-caption font-semibold tabular-nums">
                  {pendingCount}
                </span>
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              leadingIcon={<BarChart3 size={16} strokeWidth={1.75} />}
              onClick={onLaporan}
            >
              Laporan
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<LogOut size={16} strokeWidth={1.75} />}
              onClick={onKeluar}
            >
              Keluar
            </Button>
          </div>
        </div>

        <div className="flex items-baseline gap-[17px] flex-wrap mb-[13px]">
          <div className="flex items-baseline gap-[13px]">
            <span className="text-display font-bold text-deep-slate tabular-nums leading-none">
              {sudahCount}
            </span>
            <span className="text-body-sm text-graphite">
              dari <span className="font-semibold text-deep-slate">{totalCount}</span> balita sudah diukur bulan ini
            </span>
          </div>
          <span className="ml-auto text-heading font-bold text-primary-600 tabular-nums">
            {persen}%
          </span>
        </div>

        <div
          className="h-[6px] bg-polar-mist rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={persen}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-primary-500 rounded-full transition-[width] duration-400 ease-out-quart"
            style={{ width: `${persen}%` }}
          />
        </div>
      </div>
    </header>
  );
}
