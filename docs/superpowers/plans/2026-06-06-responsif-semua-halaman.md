# Responsif Semua Halaman Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperbaiki tampilan rusak di HP pada komponen bersama (pagination, chart, tabel, modal, header) lalu audit manual semua halaman.

**Architecture:** Perbaikan terpusat di komponen bersama agar satu perubahan menutup banyak halaman. Semua via Tailwind breakpoint dan opsi Chart.js. Tanpa dependensi baru.

**Tech Stack:** React 19, Vite, Ant Design v6, Tailwind CSS v3, Chart.js, Vitest + Testing Library.

---

## File Structure

- Modify: `src/components/ui/DataTable/DataTablePagination.tsx` (jendela halaman)
- Modify: `src/components/ui/DataTable/index.tsx` (indikator scroll)
- Modify: `src/features/anak/ChartWHO.tsx` (tinggi + tick adaptif)
- Modify: `src/components/ui/PageHeader.tsx` (aksi turun di HP)
- Modify: `src/features/kader/PosyanduHeader.tsx` (aksi turun di HP)
- Modify: Modal AntD di 9 file (lebar responsif)
- Create: `src/utils/paginationRange.ts` (helper jendela halaman, pure, mudah ditest)
- Create: `src/__tests__/utils/paginationRange.test.ts`

---

## Task 1: Helper jendela halaman (paginationRange)

**Files:**
- Create: `src/utils/paginationRange.ts`
- Test: `src/__tests__/utils/paginationRange.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, test } from 'vitest';
import { paginationRange } from '../../utils/paginationRange';

describe('paginationRange', () => {
  test('returns all pages when total is small', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('shows ellipsis on the right near the start', () => {
    expect(paginationRange(1, 10)).toEqual([1, 2, 3, '...', 10]);
  });

  test('shows ellipsis on the left near the end', () => {
    expect(paginationRange(10, 10)).toEqual([1, '...', 8, 9, 10]);
  });

  test('shows ellipsis on both sides in the middle', () => {
    expect(paginationRange(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
  });

  test('clamps current page within bounds', () => {
    expect(paginationRange(99, 3)).toEqual([1, 2, 3]);
    expect(paginationRange(0, 3)).toEqual([1, 2, 3]);
  });

  test('handles single page', () => {
    expect(paginationRange(1, 1)).toEqual([1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/utils/paginationRange.test.ts`
Expected: FAIL with "Failed to resolve import" / paginationRange not defined.

- [ ] **Step 3: Write minimal implementation**

```ts
export type PageItem = number | '...';

export function paginationRange(
  current: number,
  totalPages: number,
  siblingCount = 1,
): PageItem[] {
  const total = Math.max(totalPages, 1);
  const page = Math.min(Math.max(current, 1), total);

  // first + last + current + 2 siblings + 2 ellipsis slots
  const totalSlots = siblingCount * 2 + 5;
  if (total <= totalSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  const result: PageItem[] = [1];

  if (showLeftDots) {
    result.push('...');
  } else {
    for (let i = 2; i < leftSibling; i++) result.push(i);
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== total) result.push(i);
  }

  if (showRightDots) {
    result.push('...');
  } else {
    for (let i = rightSibling + 1; i < total; i++) result.push(i);
  }

  result.push(total);
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/utils/paginationRange.test.ts`
Expected: PASS (6 tests). If a case mismatches, adjust the dots boundary logic, not the test expectations.

- [ ] **Step 5: Commit**

```bash
git add src/utils/paginationRange.ts src/__tests__/utils/paginationRange.test.ts
git commit -m "feat: add paginationRange helper for windowed pagination"
```

---

## Task 2: DataTablePagination pakai jendela halaman + rapi di HP

**Files:**
- Modify: `src/components/ui/DataTable/DataTablePagination.tsx`

Masalah saat ini: baris 63 merender SEMUA tombol (`Array.from({ length: pageCount })`), meluber di HP. Kita ganti dengan `paginationRange`, dan susun toolbar agar tidak meluber di layar kecil.

- [ ] **Step 1: Import helper**

Tambahkan import di paling atas file (sebelum definisi `PageButton`):

```tsx
import { paginationRange } from '../../../utils/paginationRange';
```

- [ ] **Step 2: Ganti blok render tombol angka**

Ganti blok lama (baris ~63-72, perulangan `Array.from({ length: pageCount }, ...)` yang membuat satu PageButton per halaman) dengan:

```tsx
{paginationRange(pageIndex + 1, Math.max(pageCount, 1)).map((item, idx) =>
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
      onClick={() => table.setPageIndex(item - 1)}
      active={pageIndex === item - 1}
      aria-current={pageIndex === item - 1 ? 'page' : undefined}
      aria-label={`Halaman ${item}`}
      className="border-r border-light-ash rounded-none last-of-type:border-r-0"
    >
      {item}
    </PageButton>
  )
)}
```

- [ ] **Step 3: Buat baris toolbar tidak meluber di HP**

Ganti container terluar (baris 24, `<div className="pt-[17px] flex items-center justify-between gap-4 flex-wrap">`) menjadi:

```tsx
<div className="pt-[17px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[13px]">
```

Dan pada elemen `<nav>` (baris 45-48), tambahkan agar bisa scroll bila masih sempit:

```tsx
<nav
  className="inline-flex items-center gap-1 rounded-default border border-light-ash overflow-x-auto bg-white max-w-full"
  aria-label="Pagination"
>
```

- [ ] **Step 4: Verifikasi build & test**

Run: `npm run lint`
Expected: tidak ada error baru di file ini.

Run: `npx vitest run`
Expected: semua test lama tetap PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DataTable/DataTablePagination.tsx
git commit -m "fix(table): windowed pagination + no overflow on mobile"
```

---

## Task 3: Indikator scroll horizontal pada DataTable

**Files:**
- Modify: `src/components/ui/DataTable/index.tsx`

Tujuan: beri petunjuk visual (bayangan gradien di tepi kanan) saat tabel bisa di-scroll horizontal, agar user tahu ada kolom tersembunyi. Pendekatan CSS murni dengan `background-attachment: local` shadow trick — tanpa JS/state tambahan.

- [ ] **Step 1: Bungkus wrapper scroll dengan kelas indikator**

Ganti blok (baris 94-96):

```tsx
<div className="overflow-x-auto">
  <div className="rounded-default border border-light-ash bg-white shadow-card overflow-hidden">
    <table className="w-full">
```

menjadi:

```tsx
<div className="rounded-default border border-light-ash bg-white shadow-card overflow-hidden">
  <div className="overflow-x-auto table-scroll-shadow">
    <table className="w-full">
```

Catatan: penutup `</div>` tetap dua buah seperti semula (urutan tidak berubah, hanya kelas dipindah).

- [ ] **Step 2: Tambahkan utility CSS bayangan scroll**

Di `src/global.css`, tambahkan di bagian akhir file:

```css
.table-scroll-shadow {
  background:
    linear-gradient(to right, #ffffff 30%, rgba(255, 255, 255, 0)) left center,
    linear-gradient(to left, #ffffff 30%, rgba(255, 255, 255, 0)) right center,
    radial-gradient(farthest-side at 0 50%, rgba(15, 23, 42, 0.12), rgba(0, 0, 0, 0)) left center,
    radial-gradient(farthest-side at 100% 50%, rgba(15, 23, 42, 0.12), rgba(0, 0, 0, 0)) right center;
  background-repeat: no-repeat;
  background-size: 40px 100%, 40px 100%, 14px 100%, 14px 100%;
  background-attachment: local, local, scroll, scroll;
}
```

- [ ] **Step 3: Verifikasi**

Run: `npm run lint`
Expected: tidak ada error.

Run: `npm run build`
Expected: build sukses (memastikan CSS valid dan tidak memecah bundling).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/DataTable/index.tsx src/global.css
git commit -m "feat(table): horizontal scroll shadow hint"
```

---

## Task 4: ChartWHO adaptif HP (tinggi + kepadatan tick)

**Files:**
- Modify: `src/features/anak/ChartWHO.tsx`

Masalah: container `min-h-[500px]` (baris 279) terlalu tinggi/gepeng di HP; sumbu-X `maxTicksLimit: 61` (baris 150 & 231) membuat label numpuk. Chart.js `maintainAspectRatio: false` sudah aktif, jadi tinggi mengikuti container.

- [ ] **Step 1: Tambahkan deteksi viewport kecil**

Di dalam komponen `ChartWHO`, tepat setelah `const [tab, setTab] = useState('BB');` (baris 177), tambahkan:

```tsx
const isMobile =
  typeof window !== 'undefined' && window.innerWidth < 640;
const xTickLimit = isMobile ? 12 : 61;
```

- [ ] **Step 2: Pakai xTickLimit di opsi sumbu-X**

Di fungsi `ageChartOptions` (baris 139), ubah signature dan tick limit. Ganti baris 139:

```tsx
function ageChartOptions(yLabel, unit, shortLabel, xTickLimit) {
```

Dan di dalamnya, baris 150 ubah:

```tsx
ticks: { maxTicksLimit: xTickLimit, autoSkip: true, font: { size: 12 } },
```

- [ ] **Step 3: Teruskan xTickLimit ke pemanggilan ageChartOptions**

Di objek `charts` (baris 206-218), tambahkan argumen keempat:

```tsx
    BB: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refBB, dataBB) },
      options: ageChartOptions('Berat Badan', 'kg', 'Berat', xTickLimit),
    },
    TB: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refTB, dataTB) },
      options: ageChartOptions('Tinggi Badan', 'cm', 'Tinggi', xTickLimit),
    },
    LK: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refLK, dataLK) },
      options: ageChartOptions('Lingkar Kepala', 'cm', 'Lingkar Kepala', xTickLimit),
    },
```

- [ ] **Step 4: Update tick limit pada chart Gizi**

Di opsi chart Gizi (baris 231), ubah:

```tsx
ticks: { maxTicksLimit: xTickLimit, autoSkip: true, font: { size: 12 } },
```

- [ ] **Step 5: Container tinggi adaptif**

Ganti div container chart (baris 279):

```tsx
<div className="w-full h-[62vw] min-h-[320px] max-h-[500px] p-[13px] sm:p-[17px] bg-white border border-light-ash rounded-default">
```

- [ ] **Step 6: Verifikasi**

Run: `npm run lint`
Expected: tidak ada error.

Run: `npm run build`
Expected: build sukses.

- [ ] **Step 7: Commit**

```bash
git add src/features/anak/ChartWHO.tsx
git commit -m "fix(chart): adaptive height and tick density on mobile"
```

---

## Task 5: Header — tombol aksi turun ke bawah judul di HP

**Files:**
- Modify: `src/components/ui/PageHeader.tsx`
- Modify: `src/features/kader/PosyanduHeader.tsx`

Tujuan: di HP tombol aksi turun penuh ke bawah judul; di desktop tetap sejajar kanan.

- [ ] **Step 1: PageHeader — ubah baris flex jadi kolom di HP**

Di `src/components/ui/PageHeader.tsx`, ganti baris 30:

```tsx
<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-[17px]">
```

Lalu ganti container aksi (baris 52-57). Ganti pembuka `<div className="flex items-center gap-[13px] shrink-0 flex-wrap">` menjadi:

```tsx
<div className="flex flex-col sm:flex-row sm:items-center gap-[13px] w-full md:w-auto md:shrink-0">
```

- [ ] **Step 2: PosyanduHeader — ubah baris flex jadi kolom di HP**

Di `src/features/kader/PosyanduHeader.tsx`, ganti baris 22:

```tsx
<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-[17px] mb-[33px]">
```

Lalu ganti container tombol (baris 36) `<div className="flex gap-[8px] flex-wrap">` menjadi:

```tsx
<div className="flex flex-wrap gap-[8px] w-full md:w-auto">
```

- [ ] **Step 3: Verifikasi**

Run: `npm run lint`
Expected: tidak ada error.

Run: `npx vitest run`
Expected: semua test tetap PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/PageHeader.tsx src/features/kader/PosyanduHeader.tsx
git commit -m "fix(header): stack actions below title on mobile"
```

---

## Task 6: Modal AntD responsif (perbaikan terpusat via CSS)

**Files:**
- Modify: `src/global.css`

Ada 9 Modal di seluruh aplikasi. Daripada mengedit `width` satu per satu (tidak DRY), kita cap lebar Modal secara global lewat CSS sehingga tidak pernah meluber di HP, dengan margin aman. AntD `.ant-modal` default 520px; di layar < ~560px bisa mepet. Aturan ini membuat semua Modal lebar maksimal mengikuti viewport dengan margin.

- [ ] **Step 1: Tambahkan aturan CSS responsif Modal**

Di `src/global.css`, tambahkan di akhir file:

```css
@media (max-width: 575px) {
  .ant-modal {
    max-width: calc(100vw - 24px);
    margin: 12px auto;
  }
  .ant-modal-content {
    padding: 18px;
  }
}
```

- [ ] **Step 2: Verifikasi build**

Run: `npm run build`
Expected: build sukses, CSS valid.

Run: `npm run lint`
Expected: tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add src/global.css
git commit -m "fix(modal): cap modal width on small screens"
```

---

## Task 7: Audit manual semua halaman

**Files:** bervariasi (hanya perbaiki bila ada temuan)

Jalankan dev server dan periksa setiap halaman pada lebar 320px, 375px, 768px memakai DevTools device toolbar.

- [ ] **Step 1: Jalankan dev server**

Run: `npm run dev`
Buka URL yang tertera (default `http://localhost:5173`).

- [ ] **Step 2: Periksa daftar halaman**

Untuk tiap halaman, cek: tidak ada overflow horizontal, teks tidak terpotong, tombol tidak tumpang tindih, target sentuh >= 44px, tabel bisa di-scroll dan pagination rapi.

- Public: `/`, `/masuk`, `/sign-up`, `/user-guide`, rute acak untuk NotFound
- Kader: `/kader/balita`, `/kader/balita/:id`, `/kader/orangtua`, `/kader/laporan`
- Orang Tua: `/orangtua/balita`, `/orangtua/forum`, `/orangtua/forum/:id`
- Desa: `/desa/beranda` (termasuk ExportDesaForm)
- Admin: `/admin/dashboard` dan submenu (desa, posyandu, kader-posyandu, tenaga-kesehatan, artikel, artikel/baru)
- Tenkes: `/tenkes/forum`
- Artikel: `/artikel`, `/artikel/:id`

- [ ] **Step 3: Catat & perbaiki temuan**

Untuk tiap temuan, terapkan perbaikan Tailwind minimal (mis. `flex-wrap`, `w-full md:w-auto`, `overflow-x-auto`, kurangi padding di HP). Commit per halaman/temuan:

```bash
git add <file-yang-diubah>
git commit -m "fix(responsive): <halaman> di layar kecil"
```

- [ ] **Step 4: Verifikasi akhir**

Run: `npm run lint`
Expected: bersih.

Run: `npx vitest run`
Expected: semua PASS.

Run: `npm run build`
Expected: sukses.

---

## Catatan
- DRY: pagination & modal diperbaiki terpusat, bukan per halaman.
- YAGNI: tidak menambah library; tidak mengubah daftar balita (sudah kartu).
- Commit sering, satu perubahan logis per commit.

