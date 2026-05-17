import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  interactive?: boolean;
}

export default function Card({
  title,
  footer,
  onClick,
  className = '',
  children,
  interactive,
}: CardProps) {
  const isInteractive = interactive ?? !!onClick;
  const base =
    'bg-white border border-light-ash rounded-default p-[25px] shadow-card transition-all duration-150 ease-out-quart';
  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:border-primary-300 hover:shadow-raised hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 text-left w-full'
    : '';

  const content = (
    <>
      {title && (
        <div className="text-heading font-semibold text-deep-slate mb-[17px]">
          {title}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-[17px]">{footer}</div>}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} ${interactiveClasses} ${className}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`${base} ${className}`}>{content}</div>;
}
