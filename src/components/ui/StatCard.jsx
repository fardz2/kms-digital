import React from 'react';

const ACCENT = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  accent:  'text-accent',
  neutral: 'text-neutral-900',
};

export default function StatCard({ label, value, icon, accent = 'primary' }) {
  const color = ACCENT[accent] ?? ACCENT.primary;
  return (
    <div className="bg-white border border-neutral-200 rounded-card shadow-card p-5 text-center">
      {icon && (
        <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>
      )}
      <div className={`text-display font-display leading-none tabular-nums ${color}`}>
        {value}
      </div>
      <div className="text-caption text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
