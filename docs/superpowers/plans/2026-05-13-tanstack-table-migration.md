# TanStack Table v8 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace legacy react-table v7 wrapper and antd `Table` usages with a single reusable `DataTable` component powered by TanStack Table v8 (sorting, pagination, global filter, column visibility).

**Architecture:** Create `src/components/ui/DataTable/` as a small composed component (orchestrator + toolbar + pagination + column header). Pages define columns with TanStack `ColumnDef` natively. Migrate 5 admin CMS pages one-by-one, then delete legacy `Table/` + old `DataTable.jsx` and uninstall `react-table`. All tables are client-side; no server-side logic.

**Tech Stack:** React 18, `@tanstack/react-table@^8.20.0`, Tailwind CSS, existing design tokens (`bg-primary-300`, `rounded-card`, `shadow-card`, `text-overline`), `@tanstack/react-query@^5` (already present), antd (retained for Form/Modal/Select only).

**Reference spec:** `docs/superpowers/specs/2026-05-13-tanstack-table-migration-design.md`

---

## File Structure

**New files:**
- `src/components/ui/DataTable/index.jsx` — main orchestrator
- `src/components/ui/DataTable/DataTableToolbar.jsx` — search + column visibility
- `src/components/ui/DataTable/DataTablePagination.jsx` — pagination controls
- `src/components/ui/DataTable/DataTableColumnHeader.jsx` — sortable header cell
- `src/components/ui/DataTable/icons.jsx` — Sort, SortUp, SortDown SVG icons

**Modified files:**
- `src/pages/AdminDashboard/InputDesa.js`
- `src/pages/AdminDashboard/InputPosyandu.js`
- `src/pages/AdminDashboard/RegisterTenagaKesehatan.js`
- `src/pages/AdminDashboard/RegisterKaderPosyandu.js`
- `src/pages/AdminDashboard/ArtikelAdmin.js`
- `package.json` (add `@tanstack/react-table`, remove `react-table`)

**Deleted files:**
- `src/components/layout/Table/index.js`
- `src/components/layout/Table/Button.js`
- `src/components/layout/Table/GlobalFilter.js`
- `src/components/layout/Table/Icons.js`
- `src/components/layout/Table/` (folder)
- `src/components/ui/DataTable.jsx` (old wrapper)

---

## Task 1: Install @tanstack/react-table

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the dependency**

Run:
```powershell
npm install @tanstack/react-table@^8.20.0
```

Expected: `package.json` dependencies gain `"@tanstack/react-table": "^8.20.0"`, `package-lock.json` updates, no errors.

- [ ] **Step 2: Verify installation**

Run:
```powershell
npm ls @tanstack/react-table
```

Expected output includes `@tanstack/react-table@8.x.x`.

- [ ] **Step 3: Commit**

```powershell
rtk git add package.json package-lock.json
rtk git commit -m "chore: add @tanstack/react-table v8 dependency"
```

---

## Task 2: Create icons module

**Files:**
- Create: `src/components/ui/DataTable/icons.jsx`

- [ ] **Step 1: Create the icons file**

Create `src/components/ui/DataTable/icons.jsx`:

```jsx
export function SortIcon({ className }) {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z" />
    </svg>
  );
}

export function SortUpIcon({ className }) {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z" />
    </svg>
  );
}

export function SortDownIcon({ className }) {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z" />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
rtk git add src/components/ui/DataTable/icons.jsx
rtk git commit -m "feat(DataTable): add sort icon components"
```

---

## Task 3: Create DataTableColumnHeader

**Files:**
- Create: `src/components/ui/DataTable/DataTableColumnHeader.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/ui/DataTable/DataTableColumnHeader.jsx`:

```jsx
import { flexRender } from '@tanstack/react-table';
import { SortIcon, SortUpIcon, SortDownIcon } from './icons';

export default function DataTableColumnHeader({ header }) {
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();

  if (header.isPlaceholder) {
    return <th className="px-4 py-3" />;
  }

  const content = flexRender(header.column.columnDef.header, header.getContext());

  if (!canSort) {
    return (
      <th
        scope="col"
        className="px-4 py-3 text-left text-overline text-white"
      >
        {content}
      </th>
    );
  }

  return (
    <th
      scope="col"
      className="group px-4 py-3 text-left text-overline text-white cursor-pointer select-none"
      onClick={header.column.getToggleSortingHandler()}
    >
      <div className="flex items-center justify-between gap-2">
        {content}
        <span>
          {sorted === 'desc' ? (
            <SortDownIcon className="w-4 h-4 text-white/80" />
          ) : sorted === 'asc' ? (
            <SortUpIcon className="w-4 h-4 text-white/80" />
          ) : (
            <SortIcon className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
rtk git add src/components/ui/DataTable/DataTableColumnHeader.jsx
rtk git commit -m "feat(DataTable): add sortable column header"
```

---

## Task 4: Create DataTablePagination

**Files:**
- Create: `src/components/ui/DataTable/DataTablePagination.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/ui/DataTable/DataTablePagination.jsx`:

```jsx
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
```

- [ ] **Step 2: Commit**

```powershell
rtk git add src/components/ui/DataTable/DataTablePagination.jsx
rtk git commit -m "feat(DataTable): add pagination controls"
```

---

## Task 5: Create DataTableToolbar

**Files:**
- Create: `src/components/ui/DataTable/DataTableToolbar.jsx`

- [ ] **Step 1: Create the component**

Create `src/components/ui/DataTable/DataTableToolbar.jsx`:

```jsx
import { useState, useRef, useEffect } from 'react';

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Cari data tabel"
        className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-button text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
      />
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        aria-hidden
      >
        🔍
      </span>
    </div>
  );
}

function ColumnVisibilityMenu({ table }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const hideableColumns = table
    .getAllLeafColumns()
    .filter((col) => col.getCanHide());

  if (hideableColumns.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-white border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        Kolom
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-56 rounded-card border border-neutral-200 bg-white shadow-card z-10">
          <div className="py-2">
            {hideableColumns.map((col) => {
              const header = typeof col.columnDef.header === 'string'
                ? col.columnDef.header
                : col.id;
              return (
                <label
                  key={col.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    className="rounded border-neutral-300 text-primary focus:ring-primary-300"
                  />
                  {header}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DataTableToolbar({
  table,
  title,
  searchPlaceholder = 'Cari data...',
  enableGlobalFilter = true,
  enableColumnVisibility = true,
}) {
  const globalFilter = table.getState().globalFilter ?? '';

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center">{title}</div>
      <div className="flex items-center gap-2 flex-wrap">
        {enableGlobalFilter && (
          <SearchInput
            value={globalFilter}
            onChange={(v) => table.setGlobalFilter(v)}
            placeholder={searchPlaceholder}
          />
        )}
        {enableColumnVisibility && <ColumnVisibilityMenu table={table} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```powershell
rtk git add src/components/ui/DataTable/DataTableToolbar.jsx
rtk git commit -m "feat(DataTable): add toolbar with search and column visibility"
```

---

## Task 6: Create DataTable orchestrator

**Files:**
- Create: `src/components/ui/DataTable/index.jsx`

- [ ] **Step 1: Create the main component**

Create `src/components/ui/DataTable/index.jsx`:

```jsx
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
```

- [ ] **Step 2: Commit**

```powershell
rtk git add src/components/ui/DataTable/index.jsx
rtk git commit -m "feat(DataTable): add main DataTable orchestrator"
```

---

## Task 7: Build verification after DataTable creation

**Files:** none modified.

- [ ] **Step 1: Run the build**

Run:
```powershell
npm run build
```

Expected: Build succeeds. New DataTable is not yet imported so no page breakage. If build fails with ESLint warnings about unused imports, fix them in the source files before proceeding.

- [ ] **Step 2: If build passes, no commit needed. If fixes applied, commit them:**

```powershell
rtk git add src/components/ui/DataTable
rtk git commit -m "fix(DataTable): resolve lint warnings"
```

---

## Task 8: Migrate InputDesa.js

**Files:**
- Modify: `src/pages/AdminDashboard/InputDesa.js`

- [ ] **Step 1: Replace antd Table import and column definition**

Edit `src/pages/AdminDashboard/InputDesa.js`:

Change line 1 from:
```js
import { Button, Form, Input, message, Table, Modal } from "antd";
```

To:
```js
import { Button, Form, Input, message, Modal } from "antd";
import DataTable from "../../components/ui/DataTable";
```

Remove the `searchText` state (line 8): delete `const [searchText, setSearchedText] = useState("");`

Replace `columns` definition (lines 109-134):
```js
const columns = [
  {
    accessorKey: "name",
    header: "Nama Desa",
    enableSorting: true,
  },
  {
    id: "action",
    header: "Aksi",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <Button
        className="button_delete"
        onClick={() => showDeleteConfirm(row.original.id, row.original.name)}
        type="dashed"
        danger
        disabled={deleteDesaMutation.isPending}
      >
        Delete
      </Button>
    ),
  },
];
```

Replace the `<Table ... />` block (lines 235-256) with:
```jsx
<DataTable
  columns={columns}
  data={dataSource || []}
  loading={
    isLoading ||
    createDesaMutation.isPending ||
    deleteDesaMutation.isPending
  }
  rowKey="id"
  title={<h2 className="text-h3 font-display text-neutral-900">Daftar Desa</h2>}
  searchPlaceholder="Cari desa..."
  emptyText="Tidak ada data desa"
/>
```

- [ ] **Step 2: Run the build**

Run:
```powershell
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```powershell
rtk git add src/pages/AdminDashboard/InputDesa.js
rtk git commit -m "feat(admin): migrate InputDesa to TanStack DataTable"
```

---

## Task 9: Migrate InputPosyandu.js

**Files:**
- Modify: `src/pages/AdminDashboard/InputPosyandu.js`

- [ ] **Step 1: Replace antd Table import**

Change line 1-11 from:
```js
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Table,
  Modal,
} from "antd";
```

To:
```js
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Modal,
} from "antd";
import DataTable from "../../components/ui/DataTable";
```

Remove `searchText` state (line 18): delete `const [searchText, setSearchedText] = useState("");`

- [ ] **Step 2: Replace column definition**

Replace `columns` definition (lines 190-239) with:
```js
const columns = [
  {
    accessorKey: "nama",
    header: "Nama Posyandu",
    enableSorting: true,
  },
  {
    accessorKey: "alamat",
    header: "Alamat",
    enableSorting: true,
  },
  {
    id: "action",
    header: "Aksi",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        <Button
          type="default"
          size="small"
          onClick={() => handleEdit(row.original)}
          style={{ marginRight: 8 }}
          disabled={
            createPosyanduMutation.isPending ||
            updatePosyanduMutation.isPending ||
            deletePosyanduMutation.isPending
          }
        >
          Edit
        </Button>
        <Button
          type="dashed"
          danger
          size="small"
          onClick={() => showDeleteConfirm(row.original.id, row.original.nama)}
          disabled={
            createPosyanduMutation.isPending ||
            updatePosyanduMutation.isPending ||
            deletePosyanduMutation.isPending
          }
        >
          Delete
        </Button>
      </div>
    ),
  },
];
```

- [ ] **Step 3: Replace Table render**

Replace the `<Table ... />` block (lines 366-390) with:
```jsx
<DataTable
  columns={columns}
  data={dataSource || []}
  loading={
    posyanduLoading ||
    createPosyanduMutation.isPending ||
    updatePosyanduMutation.isPending ||
    deletePosyanduMutation.isPending
  }
  rowKey="id"
  title={<h2 className="text-h3 font-display text-neutral-900">Daftar Posyandu</h2>}
  searchPlaceholder="Cari posyandu..."
  emptyText="Tidak ada data Posyandu"
/>
```

- [ ] **Step 4: Run the build**

Run:
```powershell
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```powershell
rtk git add src/pages/AdminDashboard/InputPosyandu.js
rtk git commit -m "feat(admin): migrate InputPosyandu to TanStack DataTable"
```

---

## Task 10: Migrate RegisterTenagaKesehatan.js

**Files:**
- Modify: `src/pages/AdminDashboard/RegisterTenagaKesehatan.js`

- [ ] **Step 1: Replace antd Table import**

Change lines 1-12 from:
```js
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Table,
  Modal,
  Spin,
} from "antd";
```

To:
```js
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Modal,
  Spin,
} from "antd";
import DataTable from "../../components/ui/DataTable";
```

Remove `searchText` state (line 21): delete `const [searchText, setSearchedText] = useState("");`

- [ ] **Step 2: Replace column definition**

Replace `columns` definition (lines 186-226) with:
```js
const columns = [
  {
    accessorKey: "nama",
    header: "Nama",
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
  },
  {
    id: "desa",
    header: "Desa",
    accessorFn: (row) => row.desa?.name ?? "N/A",
    enableSorting: true,
  },
  {
    id: "action",
    header: "Aksi",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        <Button
          type="dashed"
          danger
          size="small"
          onClick={() => showDeleteConfirm(row.original.id)}
          disabled={
            createTenagaKesehatanMutation.isPending ||
            deleteTenagaKesehatanMutation.isPending
          }
        >
          Delete
        </Button>
      </div>
    ),
  },
];
```

- [ ] **Step 3: Replace Table render**

Replace the `<Table ... />` block (lines 298-312) with:
```jsx
<DataTable
  columns={columns}
  data={tenagaKesehatanData || []}
  loading={
    tenagaKesehatanLoading ||
    createTenagaKesehatanMutation.isPending ||
    deleteTenagaKesehatanMutation.isPending
  }
  rowKey="id"
  title={<h2 className="text-h3 font-display text-neutral-900">Daftar Tenaga Kesehatan</h2>}
  searchPlaceholder="Cari tenaga kesehatan..."
  emptyText="Tidak ada data Tenaga Kesehatan"
/>
```

- [ ] **Step 4: Run the build**

Run:
```powershell
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```powershell
rtk git add src/pages/AdminDashboard/RegisterTenagaKesehatan.js
rtk git commit -m "feat(admin): migrate RegisterTenagaKesehatan to TanStack DataTable"
```

---

## Task 11: Migrate RegisterKaderPosyandu.js (custom toolbar)

This page has an additional status filter dropdown. We filter data client-side in the page before passing to DataTable, and use the `toolbar` slot for custom toolbar UI.

**Files:**
- Modify: `src/pages/AdminDashboard/RegisterKaderPosyandu.js`

- [ ] **Step 1: Replace antd Table import**

Change lines 1-11 from:
```js
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Table,
  Modal,
} from "antd";
```

To:
```js
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Modal,
} from "antd";
import { useMemo } from "react";
import DataTable from "../../components/ui/DataTable";
```

Note: add `useMemo` to the existing React import instead if React is already imported. If `import { useState } from "react"` exists, change it to `import { useMemo, useState } from "react"` and remove the standalone `useMemo` import above.

- [ ] **Step 2: Replace column definition**

Replace `columns` definition (lines 262-342) with:
```js
const columns = [
  {
    accessorKey: "nama",
    header: "Nama",
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
  },
  {
    id: "desa",
    header: "Desa",
    accessorFn: (row) => row.desa?.name ?? "N/A",
    enableSorting: true,
  },
  {
    id: "posyandu",
    header: "Posyandu",
    accessorFn: (row) => row.posyandu?.nama ?? "N/A",
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    cell: ({ getValue }) =>
      normalizeStatus(getValue()) ? "Approve" : "Belum di Approve",
  },
  {
    id: "action",
    header: "Aksi",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div>
        <Button
          type="default"
          size="small"
          onClick={() => handleEdit(row.original)}
          style={{ marginRight: 8 }}
          disabled={
            createKaderMutation.isPending ||
            updateKaderMutation.isPending ||
            deleteKaderMutation.isPending
          }
        >
          Edit
        </Button>
        <Button
          type="dashed"
          danger
          size="small"
          onClick={() => showDeleteConfirm(row.original.id)}
          disabled={
            createKaderMutation.isPending ||
            updateKaderMutation.isPending ||
            deleteKaderMutation.isPending
          }
        >
          Delete
        </Button>
      </div>
    ),
  },
];
```

- [ ] **Step 3: Compute filtered data and remove handleTableChange**

Delete `handleTableChange` function (lines 383-388).

Add memoized filtered data before the `return` statement:
```js
const filteredKaderData = useMemo(() => {
  let rows = kaderData || [];
  if (statusFilter !== null) {
    rows = rows.filter((r) => normalizeStatus(r.status) === statusFilter);
  }
  return rows;
}, [kaderData, statusFilter]);
```

Note: search text filtering is now handled by DataTable's built-in global filter — remove the `searchText` state and its input. Wire status filter to a native `<select>` inside the custom toolbar.

- [ ] **Step 4: Replace Table render with DataTable + status filter sibling**

Because the page needs a status filter dropdown AND we want to keep DataTable's built-in search + column visibility, render the status filter as a sibling block above `<DataTable>` (do NOT use the `toolbar` prop, which would replace DataTable's default toolbar).

Replace the `<Table ... />` block (lines 571-611) with:
```jsx
<div className="flex items-center justify-between gap-4 flex-wrap">
  <h2 className="text-h3 font-display text-neutral-900">Daftar Kader Posyandu</h2>
  <div className="flex items-center gap-2 flex-wrap">
    <select
      value={statusFilter === null ? "" : String(statusFilter)}
      onChange={(e) => {
        const v = e.target.value;
        setStatusFilter(v === "" ? null : v === "true");
      }}
      className="rounded-button border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
      disabled={
        createKaderMutation.isPending ||
        updateKaderMutation.isPending ||
        deleteKaderMutation.isPending
      }
    >
      <option value="">Semua Status</option>
      <option value="true">Approve</option>
      <option value="false">Belum di Approve</option>
    </select>
    <button
      onClick={resetFilters}
      disabled={
        createKaderMutation.isPending ||
        updateKaderMutation.isPending ||
        deleteKaderMutation.isPending
      }
      className="px-4 py-2 rounded-button bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium disabled:opacity-60 transition-colors"
    >
      Reset
    </button>
  </div>
</div>
<DataTable
  columns={columns}
  data={filteredKaderData}
  loading={
    kaderLoading ||
    createKaderMutation.isPending ||
    updateKaderMutation.isPending ||
    deleteKaderMutation.isPending
  }
  rowKey="id"
  searchPlaceholder="Cari kader..."
  emptyText="Tidak ada data Kader Posyandu"
/>
```

This keeps DataTable's built-in search + column visibility toggle. Status filter lives above as a sibling.

Also update `resetFilters` (lines 246-249 in the original file) to drop `setSearchedText`:
```js
const resetFilters = () => {
  setStatusFilter(null);
};
```

Remove the `searchText` state declaration (line 20): delete `const [searchText, setSearchedText] = useState("");`. Remove any remaining references to `searchText` and `setSearchedText` in the file.

- [ ] **Step 5: Run the build**

Run:
```powershell
npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```powershell
rtk git add src/pages/AdminDashboard/RegisterKaderPosyandu.js
rtk git commit -m "feat(admin): migrate RegisterKaderPosyandu to TanStack DataTable"
```

---

## Task 12: Migrate ArtikelAdmin.js

**Files:**
- Modify: `src/pages/AdminDashboard/ArtikelAdmin.js`

- [ ] **Step 1: Replace antd Table import**

Change lines 1-12 from:
```js
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Table,
  Spin,
} from "antd";
```

To:
```js
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
} from "antd";
import DataTable from "../../components/ui/DataTable";
```

Remove `searchText` state (line 32): delete `const [searchText, setSearchedText] = useState("");`

- [ ] **Step 2: Replace column definition**

Replace `columns` definition (lines 234-296) with:
```js
const columns = [
  {
    accessorKey: "judul",
    header: "Judul Berita",
    enableSorting: true,
  },
  {
    id: "tanggal",
    header: "Tanggal Upload",
    accessorFn: (row) => row.updated_at,
    cell: ({ getValue }) => formatDate2(getValue()),
    enableSorting: true,
  },
  {
    id: "action",
    header: "Aksi",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex">
        <button
          type="button"
          className="buttonUpdateArtikel"
          onClick={() => {
            setDataArtikel(row.original);
            setIsOpenModalUpdateDataArtikel(true);
          }}
          disabled={
            createArtikelMutation.isPending ||
            createKategoriMutation.isPending ||
            deleteArtikelMutation.isPending
          }
        >
          Update
        </button>
        <button
          type="button"
          className="buttonDeleteArtikel"
          onClick={() => {
            Modal.confirm({
              title: "Apakah anda yakin?",
              icon: <ExclamationCircleOutlined />,
              content: "Data yang dihapus tidak dapat dikembalikan",
              okText: "Ya",
              cancelText: "Tidak",
              onOk: () => {
                deleteArtikelMutation.mutate(row.original.id);
              },
            });
          }}
          disabled={
            createArtikelMutation.isPending ||
            createKategoriMutation.isPending ||
            deleteArtikelMutation.isPending
          }
        >
          Delete
        </button>
      </div>
    ),
  },
];
```

- [ ] **Step 3: Replace Table render**

Replace the search bar + `<Table ... />` block (lines 556-608) with:
```jsx
<div className="overflow-x-auto">
  <DataTable
    columns={columns}
    data={dataSource || []}
    loading={
      artikelLoading ||
      createArtikelMutation.isPending ||
      createKategoriMutation.isPending ||
      deleteArtikelMutation.isPending
    }
    title={<h2 className="text-h3 font-display text-neutral-900">Daftar Artikel</h2>}
    searchPlaceholder="Cari artikel..."
    emptyText="Tidak ada data artikel"
  />
  <div className="flex justify-center mt-4">
    <button
      className="button_kirim"
      onClick={() => queryClient.invalidateQueries(["artikel"])}
      disabled={
        createArtikelMutation.isPending ||
        createKategoriMutation.isPending ||
        deleteArtikelMutation.isPending
      }
    >
      <FiRotateCcw />
    </button>
  </div>
</div>
```

- [ ] **Step 4: Run the build**

Run:
```powershell
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```powershell
rtk git add src/pages/AdminDashboard/ArtikelAdmin.js
rtk git commit -m "feat(admin): migrate ArtikelAdmin to TanStack DataTable"
```

---

## Task 13: Delete legacy Table component and old DataTable wrapper

**Files:**
- Delete: `src/components/layout/Table/index.js`
- Delete: `src/components/layout/Table/Button.js`
- Delete: `src/components/layout/Table/GlobalFilter.js`
- Delete: `src/components/layout/Table/Icons.js`
- Delete: `src/components/layout/Table/` (folder)
- Delete: `src/components/ui/DataTable.jsx`

- [ ] **Step 1: Verify no imports remain**

Run:
```powershell
findstr /s /n /c:"layout/Table" D:\kerja\freelance\kms-digital\src
```

Expected: no matches (or only matches inside files scheduled for deletion).

Run:
```powershell
findstr /s /n /c:"ui/DataTable.jsx" D:\kerja\freelance\kms-digital\src
findstr /s /n /c:"from.*../../components/ui/DataTable'" D:\kerja\freelance\kms-digital\src
```

Expected: only imports of `ui/DataTable` (folder, new component) remain, no imports of `ui/DataTable.jsx` (old wrapper).

If imports of the old wrapper still exist, stop and fix them before deleting.

- [ ] **Step 2: Delete the files**

Run:
```powershell
Remove-Item -LiteralPath "D:\kerja\freelance\kms-digital\src\components\layout\Table" -Recurse -Force
Remove-Item -LiteralPath "D:\kerja\freelance\kms-digital\src\components\ui\DataTable.jsx" -Force
```

- [ ] **Step 3: Run the build**

Run:
```powershell
npm run build
```

Expected: Build succeeds. No `react-table` import errors (should come in next task).

- [ ] **Step 4: Commit**

```powershell
rtk git add -A
rtk git commit -m "chore: remove legacy react-table v7 Table component and unused DataTable wrapper"
```

---

## Task 14: Uninstall react-table dependency

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Uninstall react-table**

Run:
```powershell
npm uninstall react-table
```

Expected: `package.json` no longer lists `react-table`, `package-lock.json` updates.

- [ ] **Step 2: Verify**

Run:
```powershell
npm ls react-table
```

Expected: `(empty)` output.

- [ ] **Step 3: Run the build**

Run:
```powershell
npm run build
```

Expected: Build succeeds, no errors.

- [ ] **Step 4: Commit**

```powershell
rtk git add package.json package-lock.json
rtk git commit -m "chore: uninstall react-table after migration"
```

---

## Task 15: Final verification

**Files:** none modified.

- [ ] **Step 1: Full build**

Run:
```powershell
npm run build
```

Expected: Build succeeds with no errors or new warnings.

- [ ] **Step 2: Grep for stragglers**

Run:
```powershell
findstr /s /n /c:"react-table" D:\kerja\freelance\kms-digital\src
findstr /s /n /c:"layout/Table" D:\kerja\freelance\kms-digital\src
findstr /s /n /c:"ButtonCus" D:\kerja\freelance\kms-digital\src
findstr /s /n /c:"SelectColumnFilter" D:\kerja\freelance\kms-digital\src
findstr /s /n /c:"TableHooks" D:\kerja\freelance\kms-digital\src
```

Expected: no matches for any of these patterns.

- [ ] **Step 3: Manual smoke test checklist**

Start dev server:
```powershell
npm start
```

For each migrated page, verify:

**`/admin/desa` (InputDesa):**
- [ ] Table loads data
- [ ] Search "Cari desa..." filters rows by name
- [ ] Click "Nama Desa" header — rows sort asc, click again desc, click again cleared
- [ ] Pagination controls work; change pageSize dropdown
- [ ] "Kolom" dropdown toggles column visibility (Aksi column should not be hideable)
- [ ] Delete row → row disappears after confirmation

**`/admin/posyandu` (InputPosyandu):** same checklist, plus edit action opens modal with correct prefilled data.

**`/admin/tenaga-kesehatan` (RegisterTenagaKesehatan):** same checklist.

**`/admin/kader-posyandu` (RegisterKaderPosyandu):** same checklist, plus status filter dropdown (Semua Status / Approve / Belum di Approve) filters rows.

**`/admin/artikel` (ArtikelAdmin):** switch to "Riwayat" tab, same checklist.

- [ ] **Step 4: Console check**

Open browser DevTools console on each page. Expected: no React errors, no warnings about missing keys, no warnings about unknown DOM props.

- [ ] **Step 5: Final commit (if any docs or small fixes)**

If any fixes needed during smoke testing:
```powershell
rtk git add .
rtk git commit -m "fix(DataTable): resolve issues found during smoke testing"
```

Else, migration complete. Confirm by running:
```powershell
rtk git log --oneline -20
```

Expected: clean commit history of the migration.
