import React from 'react';

const VARIANTS = {
  primary:
    'bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-display font-semibold shadow-sm hover:shadow-raised',
  secondary:
    'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold',
  ghost:
    'bg-transparent hover:bg-neutral-100 text-neutral-700 font-medium',
  danger:
    'bg-danger hover:bg-red-600 active:bg-red-700 text-white font-display font-semibold shadow-sm',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm min-h-[2.25rem]',
  md: 'px-5 py-3 text-base min-h-tap',
  lg: 'px-6 py-4 text-body-lg min-h-[3.5rem]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  type = 'button',
  className = '',
  onClick,
  children,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-button transition-all duration-150 ease-out-quart active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {icon && !loading && <span aria-hidden="true">{icon}</span>}
      {loading ? 'Memuat...' : children}
    </button>
  );
}
