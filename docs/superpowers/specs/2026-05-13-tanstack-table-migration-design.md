# TanStack Table v8 Migration — Design

**Status:** Draft
**Date:** 2026-05-13
**Branch:** staging

## Context

Aplikasi KMS Digital saat ini memiliki dua sistem tabel yang berjalan paralel:

1. **`src/components/layout/Table/index.js`** — wrapper react-table v7 (1024 baris). Satu-satunya consumer external adalah `src/components/ui/DataTable.jsx`, yang ternyata **tidak dipakai di halaman manapun**. Prop `ButtonCus={true}` juga tidak pernah dipanggil dari luar file. Artinya seluruh file ini (termasuk embedded modals `FormTambahOrangTua`, `FormEditOrangTua`, `Daftar Orang Tua`, `Daftar Anak Belum Approve`, export CSV, 4 mutations, 2 queries) adalah dead code.

2. **`antd Table`** dipakai langsung di 5 halaman admin CMS:
   - `InputDesa.js`
   - `InputPosyandu.js`
   - `RegisterKaderPosyandu.js`
   - `RegisterTenagaKesehatan.js`
   - `ArtikelAdmin.js`

Semua pakai client-side pagination (pageSize 5), client-side search filtering (via `filteredValue` + `onFilter`). Hanya `RegisterKaderPosyandu` yang punya tambahan status filter.

Tujuan: (a) migrasi tabel ke TanStack Table v8 (engine headless, sorting, pagination, filtering, column visibility), (b) buat satu komponen `DataTable` reusable, (c) hapus dead code legacy.

## Goals

- Satu komponen `DataTable` berbasis TanStack Table v8 untuk seluruh aplikasi
- Fitur lengkap: sorting, pagination, global filter (search), column visibility
- 5 halaman admin migrasi ke `DataTable` baru
- Hapus `src/components/layout/Table/` dan `src/components/ui/DataTable.jsx` lama
- Uninstall `react-table` dari dependencies
- Visual konsisten dengan design tokens existing (`bg-primary-300` header, `rounded-card`, `shadow-card`, `text-overline`)

## Non-Goals

- Server-side pagination/filtering/sorting (semua tabel client-side, <500 rows per endpoint)
- Row selection, expanding rows, column pinning, virtualization
- Menghapus `antd` dari seluruh aplikasi (tetap dipakai untuk Form, Modal, Select, dll)
- Migrasi form/modal di 5 halaman (tetap pakai antd Form + Modal)
- Menambah fitur export CSV generic (dead code, skip)

## Architecture

### File Structure

```
src/components/ui/DataTable/
├── index.jsx                  — <DataTable /> orchestrator
├── DataTableToolbar.jsx       — search input + column visibility dropdown
├── DataTablePagination.jsx    — pagination controls + pageSize selector
├── DataTableColumnHeader.jsx  — sortable header cell with arrow indicators
└── icons.jsx                  — SortIcon, SortUpIcon, SortDownIcon (copied from legacy)
```

Tidak ada file `.test.jsx` untuk komponen ini di iterasi ini (project belum punya test runner yang jalan untuk komponen; tests existing hanya di `__tests__/features/laporan/`).

### Public API

```jsx
<DataTable
  columns={columns}             // TanStack ColumnDef<T>[]
  data={data}                   // T[]
  loading={boolean}             // optional, shows skeleton rows
  emptyText="Tidak ada data"    // optional
  enableSorting={true}          // default true
  enableGlobalFilter={true}     // default true
  enablePagination={true}       // default true
  enableColumnVisibility={true} // default true
  pageSize={5}                  // initial pageSize
  pageSizeOptions={[5,10,20,50]}
  rowKey="id"                   // string key accessor for row id (default: row index)
  searchPlaceholder="Cari data..."
  toolbar={null}                // optional ReactNode, replaces entire default toolbar (including title slot)
  title={null}                  // optional ReactNode rendered left of default toolbar; ignored if `toolbar` is provided
/>
```

### Column Definition Contract (TanStack v8 native)

Pages mendefinisikan columns dengan `ColumnDef` standar TanStack:

```js
const columns = [
  { accessorKey: 'nama', header: 'Nama' },
  {
    accessorFn: (row) => row.desa?.name ?? 'N/A',
    id: 'desa',
    header: 'Desa',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => normalizeStatus(getValue()) ? 'Approve' : 'Belum di Approve',
  },
  {
    id: 'action',
    header: 'Aksi',
    cell: ({ row }) => <ActionButtons record={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
```

### State & Features

- **Sorting:** `useReactTable({ getSortedRowModel: getSortedRowModel() })`, clickable header toggles asc → desc → no sort.
- **Global filter:** controlled by toolbar search input, `globalFilterFn: 'includesString'` default. Case-insensitive across all visible accessor values.
- **Pagination:** `getPaginationRowModel()`, pageIndex + pageSize tracked in table state, controls in `DataTablePagination`.
- **Column visibility:** dropdown menu in toolbar showing toggle per column with `enableHiding !== false`. State held in table via `onColumnVisibilityChange`.

### Styling

Reuse design tokens already present in legacy Table for visual continuity:

- Header `<thead>`: `bg-primary-300 text-white text-overline`
- Container: `rounded-card border border-neutral-200 bg-white shadow-card`
- Row hover: `hover:bg-primary-50/40`
- Pagination buttons: same `PageButton` style (border, hover, disabled states)
- Search input: matches `GlobalFilter` style (rounded-button, focus ring primary-300)

### Dependencies

Tambah:
- `@tanstack/react-table@^8.20.0` — engine headless

Hapus setelah migrasi:
- `react-table@^7.8.0`

Tidak tambah UI lib baru; dropdown column visibility pakai Tailwind + state lokal (disclosure pattern) agar konsisten dengan gaya codebase dan tidak menambah surface area.

## Migration Plan per Page

### Pola umum (apply ke 5 halaman)

Ganti:
```jsx
<Table
  dataSource={data || []}
  columns={antdColumns}
  loading={isLoading}
  pagination={{ pageSize: 5 }}
  rowKey="id"
  title={() => <Toolbar />}
  scroll={{ x: "max-content" }}
/>
```

Menjadi:
```jsx
<DataTable
  data={data || []}
  columns={tanstackColumns}
  loading={isLoading}
  rowKey="id"
  title={<h2>Daftar X</h2>}
  searchPlaceholder="Cari X..."
/>
```

Transform columns: `dataIndex` → `accessorKey` (single) / `accessorFn` (array path), `render` → `cell`.

### Per-halaman catatan

| Halaman | Catatan |
|---------|---------|
| `InputDesa.js` | Search text removed from column-level filter; handled by DataTable's global filter. Hapus `filteredValue` + `onFilter`. |
| `InputPosyandu.js` | Sama seperti InputDesa. |
| `RegisterKaderPosyandu.js` | Butuh **custom toolbar** (punya status filter dropdown tambahan). Pakai prop `toolbar={<CustomToolbar />}`. Status filter tetap lokal state page, filter data sebelum dikirim ke DataTable. |
| `RegisterTenagaKesehatan.js` | Sama seperti InputDesa. |
| `ArtikelAdmin.js` | Hanya render tabel ketika `statePage === "Riwayat"`; logika conditional di page tidak berubah. |

### Cleanup

1. Hapus `src/components/layout/Table/` (folder + index.js + Button.js + GlobalFilter.js + Icons.js)
2. Hapus `src/components/ui/DataTable.jsx` (dead wrapper lama)
3. `npm uninstall react-table`
4. Verify tidak ada import `react-table` atau `layout/Table` tersisa

## Data Flow

Halaman tetap fetch via `useQuery` seperti sekarang (tidak berubah). Data di-pass ke `DataTable` sebagai prop `data`. Sorting/filter/pagination state hidup di dalam `DataTable` (uncontrolled dari perspektif page). Jika suatu halaman butuh kontrol external (mis. RegisterKaderPosyandu status filter), filter dilakukan di page sebelum `data` dipass.

## Error Handling

- `data` undefined/null → render empty state dengan `emptyText`
- `columns` empty → render empty table gracefully
- `loading=true` → render 3 skeleton rows di tbody (gray pulse), keep toolbar aktif
- Tidak ada pagination saat `data.length <= pageSize` → controls tetap render tapi prev/next disabled (konsisten dengan pola lama)

## Testing Strategy

Project tidak punya test framework untuk UI components (hanya `jest` config default dari CRA, dipakai untuk `aggregateKader.test.js`). Iterasi ini skip automated test untuk komponen DataTable; verifikasi via manual smoke test:

1. Load tiap halaman admin, verify: data render, search works, sort ascending/descending, pageSize changes, column visibility toggle.
2. Build lolos (`npm run build`).
3. No console errors.

Menulis test bisa jadi follow-up task terpisah.

## Rollout

Satu PR, urutan commits:
1. Install `@tanstack/react-table`, create `DataTable` component + sub-components.
2. Migrate 5 admin pages satu per satu (5 commits).
3. Remove legacy `Table/` + `DataTable.jsx`, uninstall `react-table`.
4. Build verification commit.

## Risks

- **Visual regression:** design tokens reused, tapi perilaku antd Table (`scroll={{ x: "max-content" }}`, auto column width) sedikit beda dari tabel custom. Mitigasi: tambah `overflow-x-auto` wrapper, test responsif di mobile.
- **Filter behavior:** antd's column-level `filteredValue` diganti global filter. Secara UX seharusnya sama (search bar cari di semua kolom), tapi perlu konfirmasi tidak ada kolom yang sensitif dan butuh dikecualikan.
- **Status filter di RegisterKaderPosyandu:** butuh custom toolbar slot. Sudah di-plan lewat prop `toolbar`.
