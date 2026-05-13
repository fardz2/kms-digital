import React from 'react';
import moment from 'moment';

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
  const bulanLabel = moment().format('MMMM YYYY').toLowerCase();
  const persen = totalCount ? Math.round((sudahCount / totalCount) * 100) : 0;

  return (
    <header className="relative overflow-hidden bg-primary text-white rounded-b-hero shadow-hero">
      <div
        aria-hidden
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-300 opacity-50 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary-500 opacity-30 blur-3xl pointer-events-none"
      />

      <div className="relative px-6 py-8 md:py-10 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="min-w-0 flex-1">
            <p className="text-overline text-primary-100 mb-1">{bulanLabel}</p>
            <h1 className="text-h1 font-display text-white truncate">
              Halo, {userName ?? 'Kader'}
            </h1>
            {posyanduName && (
              <p className="text-body-lg text-primary-100 mt-1">
                Posyandu {posyanduName}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {pendingCount > 0 && (
              <button
                onClick={onApprove}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium text-sm rounded-button backdrop-blur-sm border border-white/20 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <span aria-hidden>✔</span>
                Approve
                <span className="ml-1 px-2 py-0.5 bg-white/25 rounded-full text-xs font-semibold tabular-nums">
                  {pendingCount}
                </span>
              </button>
            )}
            <button
              onClick={onLaporan}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium text-sm rounded-button backdrop-blur-sm border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              📊 Laporan
            </button>
            <button
              onClick={onKeluar}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-button backdrop-blur-sm border border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Keluar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <div className="text-display font-display text-white tabular-nums leading-none">
            {sudahCount}
          </div>
          <div>
            <p className="text-body-lg font-medium text-white">
              dari {totalCount} balita
            </p>
            <p className="text-caption text-primary-100">
              sudah diukur bulan ini
            </p>
          </div>
          <div className="text-right">
            <div className="text-h2 font-display text-white tabular-nums">{persen}%</div>
          </div>
        </div>

        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-[width] duration-400 ease-out-quart"
            style={{ width: `${persen}%` }}
            role="progressbar"
            aria-valuenow={persen}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </header>
  );
}
