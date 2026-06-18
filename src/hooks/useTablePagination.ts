import { useState, useMemo } from 'react';

export const DEFAULT_PAGE_SIZE = 5;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export function useTablePagination<T>(rows: T[], initialPageSize = DEFAULT_PAGE_SIZE) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = useMemo(
    () => rows.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize),
    [rows, safePageIndex, pageSize]
  );

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setPageIndex(0);
  };

  return {
    pageIndex: safePageIndex,
    pageSize,
    pageCount,
    pageRows,
    setPageIndex,
    handlePageSizeChange,
    paginationProps: {
      pageIndex: safePageIndex,
      pageCount,
      pageSize,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      onPageIndexChange: setPageIndex,
      onPageSizeChange: handlePageSizeChange,
    },
  };
}
