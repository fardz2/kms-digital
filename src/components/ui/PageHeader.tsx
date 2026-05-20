import React from 'react';

interface PageHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  action?: React.ReactNode;
  search?: React.ReactNode;
  stats?: React.ReactNode;
  children?: React.ReactNode;
  dataTourId?: string;
}

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  search,
  stats,
  children,
  dataTourId,
}: PageHeaderProps) {
  const topLine = eyebrow ?? subtitle;
  const showSubtitleBelow = Boolean(eyebrow && subtitle);

  return (
    <header className="relative" data-tour-id={dataTourId}>
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] pt-[33px] md:pt-[50px] pb-[25px]">
        <div className="flex items-start justify-between gap-[17px] flex-wrap">
          <div className="min-w-0 flex-1">
            {topLine && (
              <p className="inline-flex items-center gap-[10px] text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[13px]">
                <span
                  aria-hidden
                  className="inline-block w-[6px] h-[6px] rounded-pill bg-primary-500 shadow-[0_0_0_4px_rgba(255,112,112,0.15)]"
                />
                {topLine}
              </p>
            )}
            {title && (
              <h1 className="text-display font-bold text-deep-slate leading-[1.05] tracking-tight">
                {title}
              </h1>
            )}
            {showSubtitleBelow && (
              <p className="text-body-lg text-graphite mt-[13px] max-w-[640px]">
                {subtitle}
              </p>
            )}
          </div>
          {(search || action) && (
            <div className="flex items-center gap-[13px] shrink-0 flex-wrap">
              {search && <div className="w-full md:w-auto">{search}</div>}
              {action}
            </div>
          )}
        </div>
        {stats && (
          <div className="mt-[25px] pt-[21px] border-t border-light-ash/60">
            {stats}
          </div>
        )}
        {children && <div className="mt-[17px]">{children}</div>}
      </div>
    </header>
  );
}
