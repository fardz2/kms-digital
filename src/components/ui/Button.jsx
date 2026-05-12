import React from 'react';

const VARIANTS = {
  primary: {
    background: 'var(--color-primary)',
    color: '#FFFFFF',
    border: 'none',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    background: 'var(--color-danger)',
    color: '#FFFFFF',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: 'none',
  },
};

const SIZES = {
  sm: { padding: '8px 16px', fontSize: 'var(--text-base)', minHeight: '36px' },
  md: { padding: '12px 24px', fontSize: 'var(--text-base)', minHeight: 'var(--space-tap)' },
  lg: { padding: '16px 32px', fontSize: 'var(--text-lg)', minHeight: '56px' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  type = 'button',
  onClick,
  style: styleProp,
  children,
  ...rest
}) {
  const style = {
    ...VARIANTS[variant],
    ...SIZES[size],
    borderRadius: 'var(--radius-button)',
    fontWeight: 'var(--font-weight-bold)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    transition: 'opacity 0.15s',
    ...styleProp,
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={style} {...rest}>
      {icon && !loading && <span aria-hidden="true">{icon}</span>}
      {loading ? 'Memuat...' : children}
    </button>
  );
}
