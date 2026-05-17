import React from 'react';

const STYLES = {
  normal:   'bg-success-bg text-success',
  kurang:   'bg-warning-bg text-amber-800',
  stunting: 'bg-danger-bg text-danger',
  obesitas: 'bg-danger-bg text-danger',
  unknown:  'bg-neutral-100 text-neutral-500',
};

const LABELS = {
  normal: 'Normal',
  kurang: 'Kurang',
  stunting: 'Stunting',
  obesitas: 'Obesitas',
  unknown: '-',
};

export default function StatusBadge({ status }) {
  const key = String(status || 'unknown').toLowerCase();
  const style = STYLES[key] || STYLES.unknown;
  const label = LABELS[key] || LABELS.unknown;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${style}`}
    >
      {label}
    </span>
  );
}
