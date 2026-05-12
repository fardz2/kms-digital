import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  color = 'var(--color-primary)',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-xs)',
            fontSize: 'var(--text-base)',
          }}
        >
          <span>{label}</span>
          <span>
            {value}/{max} ({pct.toFixed(0)}%)
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: 12,
          background: 'var(--color-border)',
          borderRadius: 'var(--radius-button)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
}
