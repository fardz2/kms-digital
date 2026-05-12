import React from 'react';

export default function StatCard({ label, value, icon, color = 'var(--color-primary)' }) {
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-md)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {icon && (
        <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-xs)' }}>
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize: 'var(--text-display)',
          fontWeight: 'var(--font-weight-bold)',
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-muted)',
          marginTop: 'var(--space-xs)',
        }}
      >
        {label}
      </div>
    </div>
  );
}
