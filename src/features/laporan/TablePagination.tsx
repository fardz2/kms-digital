import type { ButtonHTMLAttributes } from 'react';
import { paginationRange } from '../../utils/paginationRange';

function PageButton({
  children,
  className = '',
  active = false,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const base =
    'relative inline-flex items-center justify-center min-w-[40px] h-[40px] px-[13px] text-body-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = active
    ? `${base} bg-deep-slate text-white`
    : `${base} bg-white text-deep-slate hover:bg-faint-fog`;

  return (
    <button type="button" className={`${styles} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

interface TablePaginationProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function TablePagination({
  pageIndex,
  pageCount,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageIndexChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const safePageCount = Math.max(pageCount, 1);
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < safePageCount - 1;

  if (safePageCount <= 1) return null;

  return (
    <div className="pt-[17px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[13px]">
      <div className="flex gap-[17px] items-center">
        <span className="text-body-sm text-graphite">
          Halaman <span className="font-semibold text-deep-slate">{pageIndex + 1}</span> dari{' '}
          <span className="font-semibold text-deep-slate">{safePageCount}</span>
        </span>
        <label>
          <span className="sr-only">Item per halaman</span>
          <select
            className="h-[40px] rounded-default border border-light-ash bg-white px-[13px] text-body-sm text-deep-slate focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                Tampilkan {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav
        className="inline-flex items-center gap-1 rounded-default border border-light-ash overflow-x-auto bg-white max-w-full"
        aria-label="Pagination"
      >
        <PageButton
          onClick={() => onPageIndexChange(0)}
          disabled={!canPrev}
          className="border-r border-light-ash rounded-none"
        >
          <span className="sr-only">First</span>«
        </PageButton>
        <PageButton
          onClick={() => onPageIndexChange(pageIndex - 1)}
          disabled={!canPrev}
          className="border-r border-light-ash rounded-none"
        >
          <span className="sr-only">Previous</span>‹
        </PageButton>
        {paginationRange(pageIndex + 1, safePageCount).map((item, idx) =>
          item === '...' ? (
            <span
              key={`dots-${idx}`}
              className="inline-flex items-center justify-center min-w-[40px] h-[40px] text-body-sm text-graphite select-none"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              onClick={() => onPageIndexChange(item - 1)}
              active={pageIndex === item - 1}
              aria-current={pageIndex === item - 1 ? 'page' : undefined}
              aria-label={`Halaman ${item}`}
              className="border-r border-light-ash rounded-none last-of-type:border-r-0"
            >
              {item}
            </PageButton>
          )
        )}
        <PageButton
          onClick={() => onPageIndexChange(pageIndex + 1)}
          disabled={!canNext}
          className="border-r border-light-ash rounded-none"
        >
          <span className="sr-only">Next</span>›
        </PageButton>
        <PageButton
          onClick={() => onPageIndexChange(safePageCount - 1)}
          disabled={!canNext}
          className="rounded-none"
        >
          <span className="sr-only">Last</span>»
        </PageButton>
      </nav>
    </div>
  );
}
