import React from 'react';

export default function PageHeader({ title, subtitle, action, eyebrow, children }) {
  return (
    <header className="bg-white border-b border-light-ash">
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] md:py-[50px]">
        <div className="flex items-start justify-between gap-[17px] flex-wrap">
          <div className="min-w-0 flex-1">
            {(eyebrow || subtitle) && (
              <p className="text-caption font-bold uppercase tracking-[0.12em] text-primary-600 mb-[13px]">
                {eyebrow ?? subtitle}
              </p>
            )}
            {title && (
              <h1 className="text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
                {title}
              </h1>
            )}
            {eyebrow && subtitle && (
              <p className="text-body-lg text-graphite mt-[13px] max-w-[640px]">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children && <div className="mt-[25px]">{children}</div>}
      </div>
    </header>
  );
}
