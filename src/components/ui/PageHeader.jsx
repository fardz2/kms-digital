import React from 'react';

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  search,
  stats,
  children,
}) {
  const topLine = eyebrow ?? subtitle;
  const showSubtitleBelow = Boolean(eyebrow && subtitle);

  return (
    <header className="bg-white border-b border-light-ash">
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] md:py-[50px]">
        <div className="flex items-start justify-between gap-[17px] flex-wrap">
          <div className="min-w-0 flex-1">
            {topLine && (
              <p className="text-caption font-bold uppercase tracking-[0.14em] text-primary-600 mb-[13px]">
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
          <div className="mt-[25px] pt-[21px] border-t border-light-ash">
            {stats}
          </div>
        )}
        {children && <div className="mt-[17px]">{children}</div>}
      </div>
    </header>
  );
}
