import React from 'react';

/**
 * PageSkeleton — fallback shape-aware untuk lazy page.
 * Menampilkan struktur navbar + page header + content placeholder
 * supaya tidak terasa blank saat code splitting load.
 */
export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-faint-fog animate-pulse">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-40 bg-white border-b border-light-ash">
        <div className="max-w-page mx-auto px-[17px] md:px-[25px]">
          <div className="flex items-center justify-between gap-[17px] h-[72px]">
            <div className="flex items-center gap-[10px]">
              <div className="w-[40px] h-[40px] rounded-full bg-polar-mist" />
              <div className="hidden sm:block">
                <div className="h-[14px] w-[100px] bg-polar-mist rounded mb-[4px]" />
                <div className="h-[10px] w-[140px] bg-polar-mist rounded" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-[8px]">
              <div className="h-[28px] w-[80px] bg-polar-mist rounded" />
              <div className="h-[28px] w-[80px] bg-polar-mist rounded" />
              <div className="h-[28px] w-[80px] bg-polar-mist rounded" />
            </div>
            <div className="flex items-center gap-[10px]">
              <div className="w-[36px] h-[36px] rounded-full bg-polar-mist" />
              <div className="h-[28px] w-[80px] bg-polar-mist rounded hidden md:block" />
            </div>
          </div>
        </div>
      </div>

      {/* PageHeader placeholder */}
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] pt-[33px] md:pt-[50px] pb-[25px]">
        <div className="h-[14px] w-[120px] bg-polar-mist rounded mb-[13px]" />
        <div className="h-[40px] md:h-[50px] w-2/3 max-w-[420px] bg-polar-mist rounded mb-[13px]" />
        <div className="h-[16px] w-1/2 max-w-[320px] bg-polar-mist rounded" />
      </div>

      {/* Content placeholder cards */}
      <div className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[17px]">
        <div className="bg-white border border-light-ash rounded-default p-[25px]">
          <div className="h-[18px] w-1/3 bg-polar-mist rounded mb-[17px]" />
          <div className="space-y-[13px]">
            <div className="h-[14px] w-full bg-polar-mist rounded" />
            <div className="h-[14px] w-5/6 bg-polar-mist rounded" />
            <div className="h-[14px] w-4/6 bg-polar-mist rounded" />
          </div>
        </div>
        <div className="bg-white border border-light-ash rounded-default p-[25px]">
          <div className="h-[18px] w-1/4 bg-polar-mist rounded mb-[17px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[13px]">
            <div className="h-[80px] bg-polar-mist rounded-default" />
            <div className="h-[80px] bg-polar-mist rounded-default" />
            <div className="h-[80px] bg-polar-mist rounded-default" />
          </div>
        </div>
      </div>
    </div>
  );
}
