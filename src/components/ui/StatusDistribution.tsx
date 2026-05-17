import React from 'react';
import ProgressBar from './ProgressBar';

const CONFIG = [
  { key: 'normal',   label: 'Normal',   color: 'bg-success' },
  { key: 'kurang',   label: 'Kurang',   color: 'bg-warning' },
  { key: 'stunting', label: 'Stunting', color: 'bg-danger' },
  { key: 'obesitas', label: 'Obesitas', color: 'bg-danger' },
];

export default function StatusDistribution({ distribusi, total }) {
  const safeTotal = total && total > 0 ? total : 1;
  return (
    <div className="flex flex-col gap-3">
      {CONFIG.map((c) => (
        <ProgressBar
          key={c.key}
          value={distribusi?.[c.key] ?? 0}
          max={safeTotal}
          label={c.label}
          color={c.color}
        />
      ))}
    </div>
  );
}
