import React from 'react';

export default function CatatanField({ value = '', onChange, placeholder }) {
  return (
    <div style={{ padding: 'var(--space-md) 0' }}>
      <div
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: 'var(--space-sm)',
        }}
      >
        📝 Catatan <span style={{ fontWeight: 'normal', color: 'var(--color-muted)' }}>(opsional)</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder ?? 'Contoh: anak sedang sakit, baru sembuh demam...'}
        rows={3}
        maxLength={500}
        style={{
          width: '100%',
          padding: 'var(--space-md)',
          fontSize: 'var(--text-base)',
          borderRadius: 'var(--radius-button)',
          border: '1px solid var(--color-border)',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
      <div
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-muted)',
          textAlign: 'right',
          marginTop: 'var(--space-xs)',
        }}
      >
        {value.length}/500
      </div>
    </div>
  );
}
