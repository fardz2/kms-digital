import React from 'react';
import Button from '../../components/ui/Button';

const OPTIONS = [
  { key: 'semua', label: 'Semua' },
  { key: 'belum', label: 'Belum diukur' },
  { key: 'perhatian', label: '\u26A0\uFE0F Perhatian' },
];

export default function FilterChip({ value = 'semua', onChange, counts = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        flexWrap: 'wrap',
        padding: 'var(--space-sm) 0',
      }}
    >
      {OPTIONS.map((opt) => {
        const count = counts[opt.key];
        const isActive = value === opt.key;
        return (
          <Button
            key={opt.key}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onChange?.(opt.key)}
          >
            {opt.label}
            {count != null && (
              <span
                style={{
                  marginLeft: 'var(--space-xs)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(255,255,255,0.3)' : 'var(--color-surface)',
                  fontSize: 'var(--text-base)',
                }}
              >
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
