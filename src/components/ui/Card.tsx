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
    'bg-white border border-light-ash rounded-default p-[25px] shadow-card transition-all duration-150 ease-out-quart';
  const interactiveClasses = interactive
    ? 'cursor-pointer hover:border-primary-300 hover:shadow-raised hover:-translate-y-[1px] focus-within:ring-1 focus-within:ring-primary-500'
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
        <div className="text-heading font-semibold text-deep-slate mb-[17px]">
          {title}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-[17px]">{footer}</div>}
    </div>
  );
}
