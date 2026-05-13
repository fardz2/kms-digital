function PageButton({ children, className = '', active = false, ...rest }) {
  const base = 'relative inline-flex items-center justify-center min-w-[40px] h-[40px] px-[13px] text-body-sm font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = active
    ? `${base} bg-deep-slate text-white`
    : `${base} bg-white text-deep-slate hover:bg-faint-fog`;
  return (
    <button type="button" className={`${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export default function DataTablePagination({
  table,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();
  const canPrev = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  return (
    <div className="pt-[17px] flex items-center justify-between gap-4 flex-wrap">
      <div className="flex gap-[17px] items-center">
        <span className="text-body-sm text-graphite">
          Halaman <span className="font-semibold text-deep-slate">{pageIndex + 1}</span> dari{' '}
          <span className="font-semibold text-deep-slate">{Math.max(pageCount, 1)}</span>
        </span>
        <label>
          <span className="sr-only">Item per halaman</span>
          <select
            className="h-[40px] rounded-default border border-light-ash bg-white px-[13px] text-body-sm text-deep-slate focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
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
        className="inline-flex items-center gap-1 rounded-default border border-light-ash overflow-hidden bg-white"
        aria-label="Pagination"
      >
        <PageButton
          onClick={() => table.setPageIndex(0)}
          disabled={!canPrev}
          className="border-r border-light-ash rounded-none"
        >
          <span className="sr-only">First</span>«
        </PageButton>
        <PageButton
          onClick={() => table.previousPage()}
          disabled={!canPrev}
          className="border-r border-light-ash rounded-none"
        >
          <span className="sr-only">Previous</span>‹
        </PageButton>
        {Array.from({ length: pageCount }, (_, index) => (
          <PageButton
            key={index}
            onClick={() => table.setPageIndex(index)}
            active={pageIndex === index}
            className="border-r border-light-ash rounded-none last-of-type:border-r-0"
          >
            {index + 1}
          </PageButton>
        ))}
        <PageButton
          onClick={() => table.nextPage()}
          disabled={!canNext}
          className="border-r border-light-ash rounded-none"
        >
          <span className="sr-only">Next</span>›
        </PageButton>
        <PageButton
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNext}
          className="rounded-none"
        >
          <span className="sr-only">Last</span>»
        </PageButton>
      </nav>
    </div>
  );
}
