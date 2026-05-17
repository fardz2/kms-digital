import React from 'react';
import {
  Home,
  Building2,
  UserCog,
  Stethoscope,
  Heart,
  Newspaper,
  Inbox,
  AlertTriangle,
} from 'lucide-react';
import ActivityItem from '../../components/ui/ActivityItem';
import EmptyState from '../../components/ui/EmptyState';

const ICON_MAP = {
  desa:     <Home size={18} strokeWidth={1.75} />,
  posyandu: <Building2 size={18} strokeWidth={1.75} />,
  kader:    <UserCog size={18} strokeWidth={1.75} />,
  nakes:    <Stethoscope size={18} strokeWidth={1.75} />,
  ortu:     <Heart size={18} strokeWidth={1.75} />,
  artikel:  <Newspaper size={18} strokeWidth={1.75} />,
};

export default function AdminActivityFeed({ items = [], loading, hasPartialError }) {
  return (
    <section className="bg-white border border-light-ash rounded-default shadow-card p-[25px]">
      <header className="flex items-center justify-between mb-[17px]">
        <div>
          <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
            7 Hari Terakhir
          </p>
          <h2 className="text-heading font-bold text-deep-slate leading-tight">
            Aktivitas Terbaru
          </h2>
        </div>
      </header>

      {hasPartialError && (
        <div className="flex items-center gap-[13px] bg-warning/15 border border-warning/30 text-deep-slate px-[17px] py-[13px] rounded-default mb-[17px] text-caption">
          <AlertTriangle size={16} strokeWidth={2} className="text-warning shrink-0" />
          <span>Sebagian data tidak dapat dimuat. Yang tersedia ditampilkan di bawah.</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-[8px]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-[17px] px-[17px] py-[13px]">
              <div className="w-[40px] h-[40px] rounded-full bg-polar-mist animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-[14px] w-2/3 bg-polar-mist animate-pulse rounded mb-[6px]" />
                <div className="h-[12px] w-1/3 bg-polar-mist animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Inbox size={32} strokeWidth={1.75} />}
          title="Belum ada aktivitas"
          description="Belum ada perubahan dalam 7 hari terakhir."
        />
      ) : (
        <div className="flex flex-col gap-[4px]">
          {items.map((item) => (
            <ActivityItem
              key={item.id}
              icon={ICON_MAP[item.type]}
              iconAccent="primary"
              title={item.title}
              subtitle={item.subtitle}
              timestamp={item.timestamp}
              href={item.href}
            />
          ))}
        </div>
      )}
    </section>
  );
}
