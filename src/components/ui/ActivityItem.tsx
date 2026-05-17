import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import moment from 'moment';

const ACCENT_BG: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-deep-slate',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-polar-mist text-graphite',
};

interface ActivityItemProps {
  icon?: React.ReactNode;
  iconAccent?: keyof typeof ACCENT_BG;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  timestamp?: string;
  href?: string;
}

function formatRelative(timestamp?: string): string {
  if (!timestamp) return '';
  const m = moment(timestamp);
  if (!m.isValid()) return '';
  return m.fromNow();
}

export default function ActivityItem({
  icon,
  iconAccent = 'primary',
  title,
  subtitle,
  timestamp,
  href,
}: ActivityItemProps) {
  const bg = ACCENT_BG[iconAccent] ?? ACCENT_BG.primary;
  const className = `flex items-center gap-[17px] px-[17px] py-[13px] rounded-default transition-colors duration-150 ${href ? 'hover:bg-primary-50/40 cursor-pointer' : ''}`;

  const inner = (
    <>
      {icon && (
        <span className={`flex items-center justify-center w-[40px] h-[40px] rounded-full shrink-0 ${bg}`}>
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-semibold text-deep-slate truncate">{title}</p>
        {subtitle && (
          <p className="text-caption text-graphite truncate mt-[2px]">{subtitle}</p>
        )}
      </div>
      {timestamp && (
        <span className="text-caption text-graphite tabular-nums shrink-0 hidden sm:inline">
          {formatRelative(timestamp)}
        </span>
      )}
      {href && (
        <ChevronRight
          size={16}
          strokeWidth={1.75}
          className="text-graphite shrink-0 hidden sm:inline"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
