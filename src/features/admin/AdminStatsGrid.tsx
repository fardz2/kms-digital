import React from 'react';
import { Home, Building2, Users, Newspaper } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

export default function AdminStatsGrid({ stats, loading }) {
  const totalPengguna =
    (stats?.kader ?? 0) + (stats?.nakes ?? 0) + (stats?.ortu ?? 0);

  const items = [
    {
      label: 'Total Desa',
      value: stats?.desa ?? null,
      Icon: Home,
      href: '/admin/dashboard/desa',
    },
    {
      label: 'Total Posyandu',
      value: stats?.posyandu ?? null,
      Icon: Building2,
      href: '/admin/dashboard/posyandu',
    },
    {
      label: 'Pengguna Terdaftar',
      value: loading ? null : totalPengguna,
      Icon: Users,
      href: '/admin/dashboard/kader-posyandu',
      breakdown: [
        { label: 'Kader', value: stats?.kader },
        { label: 'Tenkes', value: stats?.nakes },
        { label: 'Ortu', value: stats?.ortu },
      ],
    },
    {
      label: 'Artikel Terbit',
      value: stats?.artikel ?? null,
      Icon: Newspaper,
      href: '/admin/dashboard/artikel',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[17px]">
      {items.map(({ label, value, Icon, href, breakdown }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={<Icon size={22} strokeWidth={1.75} />}
          accent="primary"
          href={href}
          loading={loading}
        >
          {breakdown && (
            <div className="flex gap-[13px] mt-[13px] pt-[13px] border-t border-light-ash/60">
              {breakdown.map((b) => (
                <div key={b.label} className="flex flex-col">
                  <span className="text-caption text-graphite">{b.label}</span>
                  <span className="text-body-sm font-bold text-deep-slate tabular-nums">
                    {b.value ?? '�'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </StatCard>
      ))}
    </div>
  );
}
