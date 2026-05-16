import React from 'react';
import moment from 'moment';
import { BarChart3, LogOut, Users } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function PosyanduHeader({
  userName,
  posyanduName,
  sudahCount,
  totalCount,
  pendingCount = 0,
  onAkunOrangTua,
  onLaporan,
  onKeluar,
}) {
  const bulanLabel = moment().format('MMMM YYYY');
  const persen = totalCount ? Math.round((sudahCount / totalCount) * 100) : 0;

  return (
    <header className="bg-white border-b border-light-ash">
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] md:py-[50px]">
        <div className="flex items-start justify-between gap-[17px] flex-wrap mb-[33px]">
          <div className="min-w-0 flex-1">
            <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[13px]">
              Posyandu · {bulanLabel}
            </p>
            <h1 className="text-display font-bold text-deep-slate truncate leading-[1.05] tracking-tight">
              Halo, {userName ?? 'Kader'}
            </h1>
            {posyanduName && (
              <p className="text-body-lg text-graphite mt-[13px]">
                {posyanduName}
              </p>
            )}
          </div>
          <div className="flex gap-[8px] flex-wrap">
            <Button
              variant="default"
              size="md"
              leadingIcon={<Users size={18} strokeWidth={2} />}
              onClick={onAkunOrangTua}
            >
              Akun Orang Tua
              {pendingCount > 0 && (
                <span className="ml-[6px] px-[8px] py-[1px] bg-primary-500 text-white rounded-full text-caption font-bold tabular-nums">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button
              variant="default"
              size="md"
              leadingIcon={<BarChart3 size={18} strokeWidth={2} />}
              onClick={onLaporan}
            >
              Laporan
            </Button>
            <Button
              variant="ghost"
              size="md"
              leadingIcon={<LogOut size={18} strokeWidth={2} />}
              onClick={onKeluar}
            >
              Keluar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[25px] items-end">
          <div className="space-y-[8px]">
            <div className="flex items-baseline gap-[13px]">
              <span className="text-display-lg font-bold text-deep-slate tabular-nums leading-none">
                {sudahCount}
              </span>
              <span className="text-body-lg text-graphite">
                dari <span className="font-bold text-deep-slate">{totalCount}</span> balita sudah diukur
              </span>
            </div>
            <div
              className="h-[8px] bg-polar-mist rounded-full overflow-hidden"
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
          <div className="text-right">
            <div className="text-display font-bold text-primary-600 tabular-nums leading-none">
              {persen}%
            </div>
            <div className="text-caption font-bold uppercase tracking-[0.12em] text-graphite mt-[8px]">
              Cakupan bulan ini
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
