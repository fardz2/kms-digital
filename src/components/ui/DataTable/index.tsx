import React, { useState } from 'react';
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

interface DataTableProps {
  columns: any[];
  data: any[];
  loading?: boolean;
  emptyText?: string;
  enableSorting?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  enableColumnVisibility?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  rowKey?: string;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  title?: React.ReactNode;
}

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
}: DataTableProps) {
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
    <div className="space-y-[17px]">
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
        <div className="rounded-default border border-light-ash bg-white shadow-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-b from-polar-mist to-polar-mist/60 border-b-2 border-primary-500">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <DataTableColumnHeader key={header.id} header={header} />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-light-ash animate-pulse">
                    {visibleColumns.map((col) => (
                      <td key={col.id} className="px-[17px] py-[17px]">
                        <div className="h-4 bg-polar-mist rounded-default w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    className="text-center py-[67px] text-body-sm text-graphite"
                    colSpan={visibleColumns.length}
                  >
                    {emptyText}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-light-ash last:border-b-0 hover:bg-primary-50/40 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-[17px] py-[17px] whitespace-nowrap text-body-sm text-deep-slate"
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
