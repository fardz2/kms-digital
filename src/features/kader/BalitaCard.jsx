import React from 'react';
import moment from 'moment';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

export default function BalitaCard({ anak, meta, onUkur, onUlang, onLihat }) {
  const { latest, latestBulanIni, status, sudahDiukur, perluPerhatian } = meta;
  const umurBulan = anak.tanggal_lahir
    ? moment().diff(moment(anak.tanggal_lahir), 'month')
    : null;
  const genderLabel = anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan';

  const stateClasses = perluPerhatian
    ? 'border-danger/30 bg-danger-bg/40'
    : sudahDiukur
    ? 'border-success/20 bg-white'
    : 'border-neutral-200 bg-white';

  const icon = perluPerhatian ? '\u26A0\uFE0F' : sudahDiukur ? '\u2705' : null;

  return (
    <article
      className={`group relative flex items-start justify-between gap-4 p-5 border rounded-card transition-all duration-200 ease-out-quart hover:shadow-card hover:border-primary-200 focus-within:ring-2 focus-within:ring-primary-300 ${stateClasses}`}
    >
      <div className="flex-shrink-0 mt-1">
        {icon ? (
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
        ) : (
          <span
            className="inline-block w-3 h-3 rounded-full bg-neutral-300"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-h3 font-display text-neutral-900 truncate">
            {anak.nama}
          </h3>
          {perluPerhatian && <StatusBadge status={status} />}
        </div>
        <p className="text-caption text-neutral-500 mt-0.5">
          {umurBulan != null ? `${umurBulan} bulan · ` : ''}
          {genderLabel}
        </p>
        {latest && (
          <p className="text-base text-neutral-700 mt-2 tabular-nums">
            {sudahDiukur ? (
              <>
                <span className="text-success font-medium">
                  ✓ {moment(latestBulanIni.date).format('DD MMM')}
                </span>
                <span className="text-neutral-500"> · </span>
                <span className="font-medium">{latestBulanIni.berat} kg</span>
                <span className="text-neutral-500"> · TB </span>
                <span className="font-medium">{latestBulanIni.tinggi} cm</span>
              </>
            ) : (
              <span className="text-neutral-600">
                Terakhir: {moment(latest.date).format('DD MMM YYYY')} ·{' '}
                {latest.berat} kg
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 flex flex-col gap-1.5">
        {sudahDiukur ? (
          <>
            <Button variant="secondary" size="sm" onClick={() => onLihat?.(anak)}>
              Lihat riwayat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUlang?.(anak, latestBulanIni)}
            >
              Ubah
            </Button>
          </>
        ) : (
          <Button variant="primary" size="md" onClick={() => onUkur?.(anak, latest)}>
            ✏️ Ukur
          </Button>
        )}
      </div>
    </article>
  );
}
