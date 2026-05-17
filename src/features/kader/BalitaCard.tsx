import React from 'react';
import dayjs from 'dayjs';
import { AlertTriangle, CheckCircle2, Pencil, Eye } from 'lucide-react';
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

  return (
    <article
      className={`group flex items-start justify-between gap-[17px] p-[21px] bg-white border ${stateClasses} rounded-default transition-colors duration-150 ease-out-quart hover:border-graphite/30 focus-within:ring-1 focus-within:ring-primary-500`}
    >
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
          {perluPerhatian && <StatusBadge status={status} />}
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
      </div>

      <div className="shrink-0 flex flex-col gap-[6px]">
        {sudahDiukur ? (
          <>
            <Button
              variant="default"
              size="sm"
              leadingIcon={<Eye size={16} strokeWidth={1.75} />}
              onClick={() => onLihat?.(anak)}
            >
              Riwayat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
              onClick={() => onUlang?.(anak, latestBulanIni)}
            >
              Ubah
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="md"
            leadingIcon={<Pencil size={18} strokeWidth={1.75} />}
            onClick={() => onUkur?.(anak, latest)}
          >
            Ukur
          </Button>
        )}
      </div>
    </article>
  );
}
