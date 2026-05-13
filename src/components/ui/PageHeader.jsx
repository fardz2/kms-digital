import React from 'react';

export default function PageHeader({ title, subtitle, action, children }) {
  return (
    <header className="bg-white border-b border-light-ash">
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[25px] md:py-[33px]">
        <div className="flex items-start justify-between gap-[17px] flex-wrap">
          <div className="min-w-0 flex-1">
            {subtitle && (
              <p className="text-overline text-graphite uppercase mb-1">
                {subtitle}
              </p>
            )}
            {title && (
              <h1 className="text-heading-lg font-bold text-deep-slate leading-tight">
                {title}
              </h1>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children && <div className="mt-[17px]">{children}</div>}
      </div>
    </header>
  );
}
