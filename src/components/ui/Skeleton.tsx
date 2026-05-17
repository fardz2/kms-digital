import React from 'react';

const BASE = 'bg-polar-mist animate-pulse rounded';

interface SkeletonProps {
  className?: string;
  rounded?: 'default' | 'full' | 'pill';
}

/**
 * Skeleton — primitive untuk shape placeholder saat data loading.
 * Pakai animate-pulse + bg-polar-mist untuk konsistensi dengan PageSkeleton.
 */
export function Skeleton({ className = '', rounded = 'default' }: SkeletonProps) {
  const radius =
    rounded === 'full' ? 'rounded-full' : rounded === 'pill' ? 'rounded-pill' : 'rounded';
  return <div className={`${BASE.replace('rounded', radius)} ${className}`} />;
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/**
 * SkeletonText — multi-baris text placeholder.
 * Baris terakhir lebih pendek untuk natural feel.
 */
export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-[8px] ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-[14px] bg-polar-mist animate-pulse rounded ${
            i === lines - 1 ? 'w-3/5' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
  withTitle?: boolean;
  lines?: number;
}

/**
 * SkeletonCard — card placeholder dengan optional title + body lines.
 */
export function SkeletonCard({ className = '', withTitle = true, lines = 2 }: SkeletonCardProps) {
  return (
    <div
      className={`bg-white border border-light-ash rounded-default shadow-card p-[21px] ${className}`}
    >
      {withTitle && (
        <div className="h-[18px] w-1/3 bg-polar-mist animate-pulse rounded mb-[17px]" />
      )}
      <SkeletonText lines={lines} />
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

/**
 * SkeletonList — daftar item placeholder (avatar + 2 baris text).
 */
export function SkeletonList({
  count = 3,
  className = '',
  itemClassName = '',
}: SkeletonListProps) {
  return (
    <div className={`flex flex-col gap-[13px] ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`flex items-center gap-[13px] bg-white border border-light-ash rounded-default p-[17px] ${itemClassName}`}
        >
          <div className="w-[40px] h-[40px] rounded-full bg-polar-mist animate-pulse shrink-0" />
          <div className="flex-1 space-y-[8px]">
            <div className="h-[14px] w-2/3 bg-polar-mist animate-pulse rounded" />
            <div className="h-[12px] w-1/3 bg-polar-mist animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
