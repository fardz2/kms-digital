import React from 'react';
import ProgressBar from './ProgressBar';

const CONFIG = [
  { key: 'normal', label: 'Normal', color: 'var(--color-success)' },
  { key: 'kurang', label: 'Kurang', color: 'var(--color-warning)' },
  { key: 'stunting', label: 'Stunting', color: 'var(--color-danger)' },
  { key: 'obesitas', label: 'Obesitas', color: 'var(--color-danger)' },
];

export default function StatusDistribution({ distribusi, total }) {
  const safeTotal = total && total > 0 ? total : 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
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
