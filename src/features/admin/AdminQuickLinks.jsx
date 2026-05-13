import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Building2,
  UserCog,
  Stethoscope,
  Newspaper,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

const LINKS = [
  { to: '/admin/dashboard/desa',             label: 'Kelola Desa',              desc: 'Daftar desa terdaftar',     Icon: Home },
  { to: '/admin/dashboard/posyandu',         label: 'Kelola Posyandu',          desc: 'Posyandu di setiap desa',   Icon: Building2 },
  { to: '/admin/dashboard/kader-posyandu',   label: 'Kader Posyandu',           desc: 'Akun kader & persetujuan',  Icon: UserCog },
  { to: '/admin/dashboard/tenaga-kesehatan', label: 'Tenaga Kesehatan',         desc: 'Bidan & tenaga kesehatan',  Icon: Stethoscope },
  { to: '/admin/dashboard/artikel',          label: 'Kelola Artikel',           desc: 'Artikel edukasi gizi',      Icon: Newspaper },
];

function QuickLink({ to, label, desc, Icon }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-[13px] w-full px-[17px] py-[13px] rounded-default border border-light-ash bg-white hover:border-primary-300 hover:shadow-card transition-all duration-150 ease-out-quart"
    >
      <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-primary-50 text-primary-600 shrink-0 transition-colors group-hover:bg-primary-500 group-hover:text-white">
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-body-sm font-semibold text-deep-slate">{label}</span>
        <span className="block text-caption text-graphite mt-[2px]">{desc}</span>
      </span>
      <ChevronRight
        size={16}
        strokeWidth={2}
        className="text-graphite shrink-0 transition-transform group-hover:translate-x-[2px]"
      />
    </Link>
  );
}

export default function AdminQuickLinks() {
  return (
    <section className="bg-white border border-light-ash rounded-default shadow-card p-[25px]">
      <header className="mb-[17px]">
        <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[6px]">
          Shortcut
        </p>
        <h2 className="text-heading font-bold text-deep-slate leading-tight">
          Akses Cepat
        </h2>
      </header>

      <div className="flex flex-col gap-[8px]">
        {LINKS.map((link) => (
          <QuickLink key={link.to} {...link} />
        ))}

        <div className="flex items-center gap-[13px] w-full px-[17px] py-[13px] rounded-default border border-dashed border-light-ash bg-faint-fog/40 opacity-70">
          <span className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-polar-mist text-graphite shrink-0">
            <BarChart3 size={18} strokeWidth={2} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-body-sm font-semibold text-deep-slate">
              Laporan Keseluruhan
            </span>
            <span className="block text-caption text-graphite mt-[2px]">
              Agregasi lintas-desa
            </span>
          </span>
          <span className="text-caption font-bold uppercase tracking-[0.1em] text-graphite px-[8px] py-[2px] rounded-full bg-polar-mist">
            Segera
          </span>
        </div>
      </div>
    </section>
  );
}
