import React from 'react';

export default function Card({
  title,
  footer,
  onClick,
  className = '',
  children,
}) {
  const interactive = !!onClick;
  const base =
    'bg-white border border-neutral-200 rounded-card shadow-card p-6 transition-all duration-200 ease-out-quart';
  const interactiveClasses = interactive
    ? 'cursor-pointer hover:border-primary-200 hover:shadow-raised hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-primary-300'
    : '';

  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={`${base} ${interactiveClasses} ${className}`}
    >
      {title && (
        <div className="text-h3 font-display text-neutral-900 mb-4">{title}</div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
