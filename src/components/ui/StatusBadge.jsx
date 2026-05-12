import React from 'react';

const STATUS_CONFIG = {
  normal: { label: 'Normal', bg: 'var(--color-success)', icon: '\u2705' },
  kurang: { label: 'Kurang', bg: 'var(--color-warning)', icon: '\u26A0\uFE0F' },
  stunting: { label: 'Stunting', bg: 'var(--color-danger)', icon: '\uD83D\uDD34' },
  obesitas: { label: 'Obesitas', bg: 'var(--color-danger)', icon: '\uD83D\uDD34' },
  unknown: { label: '-', bg: 'var(--color-muted)', icon: '\u2753' },
};

export default function StatusBadge({ status }) {
  const key = String(status || 'unknown').toLowerCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.unknown;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
        background: config.bg,
        color: '#FFFFFF',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-button)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-bold)',
      }}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
