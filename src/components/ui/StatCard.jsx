import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

const ACCENT = {
  primary: 'text-primary-600',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  accent:  'text-accent',
  neutral: 'text-deep-slate',
};

const ICON_BG = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-deep-slate',
  danger:  'bg-danger/10 text-danger',
  accent:  'bg-accent-bg text-accent',
  neutral: 'bg-polar-mist text-graphite',
};

function TrendIcon({ type }) {
  if (type === 'up') return <TrendingUp size={14} strokeWidth={2.25} className="text-success" />;
  if (type === 'down') return <TrendingDown size={14} strokeWidth={2.25} className="text-danger" />;
  return <Minus size={14} strokeWidth={2.25} className="text-graphite" />;
}

export default function StatCard({
  label,
  value,
  icon,
  accent = 'primary',
  trend,
  href,
  loading = false,
  children,
}) {
  const color = ACCENT[accent] ?? ACCENT.primary;
  const iconBg = ICON_BG[accent] ?? ICON_BG.primary;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-[13px]">
        {icon && (
          <span className={`flex items-center justify-center w-[44px] h-[44px] rounded-full ${iconBg}`}>
            {icon}
          </span>
        )}
        {href && (
          <ChevronRight
            size={16}
            strokeWidth={2}
            className="text-graphite opacity-0 group-hover:opacity-100 transition-opacity mt-[14px]"
          />
        )}
      </div>
      <div className="mt-[17px]">
        {loading ? (
          <span className="inline-block w-20 h-9 bg-polar-mist animate-pulse rounded-default" />
        ) : (
          <div className={`text-heading-lg font-bold leading-none tabular-nums ${color}`}>
            {value ?? '—'}
          </div>
        )}
        <div className="text-caption font-bold text-graphite uppercase tracking-[0.1em] mt-[8px]">
          {label}
        </div>
        {trend && !loading && (
          <div className="flex items-center gap-[6px] mt-[10px] text-caption text-graphite">
            <TrendIcon type={trend.type} />
            <span className="font-semibold text-deep-slate">{trend.value}</span>
            <span>{trend.label}</span>
          </div>
        )}
        {children && !loading && <div>{children}</div>}
      </div>
    </>
  );

  const classes = `group bg-white border border-light-ash rounded-default p-[21px] shadow-card transition-all duration-150 ease-out-quart `;

  if (href) {
    return (
      <Link
        to={href}
        className={classes + `hover:border-primary-300 hover:shadow-raised hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500`}
      >
        {inner}
      </Link>
    );
  }

  return <div className={classes}>{inner}</div>;
}
