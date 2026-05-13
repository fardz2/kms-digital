function PageButton({ children, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`relative inline-flex items-center px-3 py-2 border border-neutral-200 bg-white text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...rest}
    >
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
    <div className="py-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex gap-x-4 items-baseline">
        <span className="text-sm text-neutral-600">
          Halaman <span className="font-semibold">{pageIndex + 1}</span> dari{' '}
          <span className="font-semibold">{Math.max(pageCount, 1)}</span>
        </span>
        <label>
          <span className="sr-only">Item per halaman</span>
          <select
            className="rounded-button border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400"
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
        className="relative z-0 inline-flex -space-x-px rounded-button overflow-hidden"
        aria-label="Pagination"
      >
        <PageButton
          onClick={() => table.setPageIndex(0)}
          disabled={!canPrev}
        >
          <span className="sr-only">First</span>«
        </PageButton>
        <PageButton
          onClick={() => table.previousPage()}
          disabled={!canPrev}
        >
          <span className="sr-only">Previous</span>‹
        </PageButton>
        {Array.from({ length: pageCount }, (_, index) => (
          <PageButton
            key={index}
            onClick={() => table.setPageIndex(index)}
            className={
              pageIndex === index
                ? 'bg-primary text-white hover:bg-primary-600'
                : ''
            }
          >
            {index + 1}
          </PageButton>
        ))}
        <PageButton onClick={() => table.nextPage()} disabled={!canNext}>
          <span className="sr-only">Next</span>›
        </PageButton>
        <PageButton
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!canNext}
        >
          <span className="sr-only">Last</span>»
        </PageButton>
      </nav>
    </div>
  );
}
