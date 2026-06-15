import React from 'react';
import dayjs from 'dayjs';
import { AlertTriangle, CheckCircle2, Pencil } from 'lucide-react';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';

export default function BalitaCard({ anak, meta, onUkur, onUlang, onLihat }) {
  const { latest, latestBulanIni, status, sudahDiukur, perluPerhatian } = meta;
  const umurBulan = anak.tanggal_lahir
    ? dayjs().diff(dayjs(anak.tanggal_lahir), 'month')
    : null;
  const genderLabel = anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan';

  const stateClasses = perluPerhatian
    ? 'border-danger/30'
    : 'border-light-ash';

  const openDetail = () => onLihat?.(anak);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetail();
    }
  };

  const handleAction = (e) => {
    e.stopPropagation();
    if (sudahDiukur) {
      onUlang?.(anak, latestBulanIni);
    } else {
      onUkur?.(anak, latest);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Buka detail ${anak.nama}`}
      onClick={openDetail}
      onKeyDown={handleKeyDown}
      className={`group flex flex-col sm:flex-row sm:items-start sm:justify-between gap-[17px] p-[21px] bg-white border ${stateClasses} rounded-default cursor-pointer transition-colors duration-150 ease-out-quart hover:border-graphite/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
    >
      <div className="flex items-start gap-[17px] min-w-0 flex-1">
        <div className="shrink-0 mt-[2px]">
          {perluPerhatian ? (
            <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-danger/10 text-danger">
              <AlertTriangle size={20} strokeWidth={1.75} />
            </span>
          ) : sudahDiukur ? (
            <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-success/10 text-success">
              <CheckCircle2 size={20} strokeWidth={1.75} />
            </span>
          ) : (
            <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-polar-mist text-graphite">
              <span className="w-[8px] h-[8px] rounded-full bg-graphite" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-[8px] flex-wrap">
            <h3 className="text-heading-sm font-semibold text-deep-slate truncate">
              {anak.nama}
            </h3>
            {status && status !== 'unknown' && <StatusBadge status={status} />}
          </div>
          <p className="text-caption text-graphite mt-1">
            {umurBulan != null ? `${umurBulan} bulan · ` : ''}
            {genderLabel}
          </p>
          {latest && (
            <p className="text-body-sm text-deep-slate mt-[8px] tabular-nums">
              {sudahDiukur ? (
                <>
                  <span className="text-success font-semibold">
                    {dayjs(latestBulanIni.date).format('DD MMM')}
                  </span>
                  <span className="text-graphite"> · </span>
                  <span className="font-semibold">{latestBulanIni.berat} kg</span>
                  <span className="text-graphite"> · TB </span>
                  <span className="font-semibold">{latestBulanIni.tinggi} cm</span>
                </>
              ) : (
                <span className="text-graphite">
                  Terakhir: {dayjs(latest.date).format('DD MMM YYYY')} ·{' '}
                  {latest.berat} kg
                </span>
              )}
            </p>
          )}
          <p className="text-caption text-graphite mt-[8px]">
            Ketuk kartu untuk lihat riwayat &amp; grafik
          </p>
        </div>
      </div>

      <div className="shrink-0 flex flex-col justify-center w-full sm:w-auto">
        <Button
          variant={sudahDiukur ? 'default' : 'primary'}
          size="md"
          leadingIcon={<Pencil size={18} strokeWidth={1.75} />}
          onClick={handleAction}
          className="w-full sm:w-auto"
        >
          {sudahDiukur ? 'Ubah' : 'Ukur'}
        </Button>
      </div>
    </article>
  );
}
