import React from 'react';

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center text-center py-[50px] px-[25px] ${className}`}>
      {icon && (
        <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-primary-50 text-primary-200 mb-[17px]">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-heading-sm font-bold text-deep-slate mb-[8px]">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-body-sm text-graphite max-w-[400px] leading-relaxed mb-[21px]">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
