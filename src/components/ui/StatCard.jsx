import React from 'react';

const ACCENT = {
  primary: 'text-primary-600',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  accent:  'text-accent',
  neutral: 'text-deep-slate',
};

export default function StatCard({ label, value, icon, accent = 'primary' }) {
  const color = ACCENT[accent] ?? ACCENT.primary;
  return (
    <div className="bg-white border border-light-ash rounded-default p-[21px]">
      {icon && (
        <div className="text-graphite mb-[8px]" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className={`text-heading-lg font-bold leading-none tabular-nums ${color}`}>
        {value}
      </div>
      <div className="text-caption text-graphite uppercase tracking-wider mt-[8px]">
        {label}
      </div>
    </div>
  );
}
