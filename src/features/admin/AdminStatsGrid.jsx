import React from 'react';
import { Home, Building2, UserCog, Stethoscope, Heart, Newspaper } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';

const CARDS = [
  { key: 'desa',     label: 'Total Desa',             href: '/admin/dashboard/desa',             Icon: Home,        accent: 'primary' },
  { key: 'posyandu', label: 'Total Posyandu',         href: '/admin/dashboard/posyandu',         Icon: Building2,   accent: 'primary' },
  { key: 'kader',    label: 'Kader Posyandu',         href: '/admin/dashboard/kader-posyandu',   Icon: UserCog,     accent: 'primary' },
  { key: 'nakes',    label: 'Tenaga Kesehatan',       href: '/admin/dashboard/tenaga-kesehatan', Icon: Stethoscope, accent: 'primary' },
  { key: 'ortu',     label: 'Orang Tua Terdaftar',    href: null,                                 Icon: Heart,       accent: 'primary' },
  { key: 'artikel',  label: 'Artikel Terbit',         href: '/admin/dashboard/artikel',           Icon: Newspaper,   accent: 'primary' },
];

export default function AdminStatsGrid({ stats, loading }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[17px]">
      {CARDS.map(({ key, label, href, Icon, accent }) => (
        <StatCard
          key={key}
          label={label}
          value={stats?.[key] ?? null}
          icon={<Icon size={22} strokeWidth={1.75} />}
          accent={accent}
          href={href}
          loading={loading}
        />
      ))}
    </div>
  );
}
