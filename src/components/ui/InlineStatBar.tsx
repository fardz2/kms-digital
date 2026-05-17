import React from 'react';

const ACCENT = {
  primary: 'text-primary-600',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  neutral: 'text-deep-slate',
};

function StatItem({ label, value, accent = 'neutral', loading }) {
  const colorClass = ACCENT[accent] ?? ACCENT.neutral;
  return (
    <div className="flex flex-col">
      <span className="text-caption font-bold uppercase tracking-[0.12em] text-graphite mb-[6px]">
        {label}
      </span>
      {loading ? (
        <span className="inline-block w-16 h-8 bg-polar-mist animate-pulse rounded-default" />
      ) : (
        <span className={`text-heading-lg font-bold tabular-nums leading-none ${colorClass}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export default function InlineStatBar({ items = [], loading = false, className = '' }) {
  if (!items.length) return null;
  return (
    <div className={`flex flex-wrap items-start gap-x-[33px] gap-y-[17px] ${className}`}>
      {items.map((item, idx) => (
        <React.Fragment key={item.label}>
          {idx > 0 && (
            <div aria-hidden className="hidden md:block w-[1px] h-[40px] bg-light-ash self-center" />
          )}
          <StatItem
            label={item.label}
            value={item.value}
            accent={item.accent}
            loading={loading}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
