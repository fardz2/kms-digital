import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import DataTableColumnHeader from './DataTableColumnHeader';
import DataTablePagination from './DataTablePagination';
import DataTableToolbar from './DataTableToolbar';

export default function DataTable({
  columns,
  data,
  loading = false,
  emptyText = 'Tidak ada data',
  enableSorting = true,
  enableGlobalFilter = true,
  enablePagination = true,
  enableColumnVisibility = true,
  pageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
  rowKey,
  searchPlaceholder = 'Cari data...',
  toolbar = null,
  title = null,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting: enableSorting ? sorting : [],
      globalFilter: enableGlobalFilter ? globalFilter : '',
      columnVisibility,
      pagination: enablePagination ? pagination : { pageIndex: 0, pageSize: data?.length || 0 },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableGlobalFilter ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getRowId: rowKey ? (row, index) => String(row[rowKey] ?? index) : undefined,
    globalFilterFn: 'includesString',
  });

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();

  return (
    <div className="space-y-2">
      {toolbar !== null ? (
        toolbar
      ) : (
        <DataTableToolbar
          table={table}
          title={title}
          searchPlaceholder={searchPlaceholder}
          enableGlobalFilter={enableGlobalFilter}
          enableColumnVisibility={enableColumnVisibility}
        />
      )}

      <div className="overflow-x-auto">
        <div className="rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
          <table className="w-full divide-y divide-neutral-200">
            <thead className="bg-primary-300 text-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <DataTableColumnHeader key={header.id} header={header} />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-neutral-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    {visibleColumns.map((col) => (
                      <td key={col.id} className="px-4 py-3">
                        <div className="h-4 bg-neutral-200 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    className="text-center py-8 text-neutral-500"
                    colSpan={visibleColumns.length}
                  >
                    {emptyText}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-primary-50/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {enablePagination && rows.length > 0 && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}
