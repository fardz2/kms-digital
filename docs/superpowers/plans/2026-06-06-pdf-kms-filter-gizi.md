# PDF Kartu KMS + Filter Status Gizi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah unduh PDF kartu KMS per anak (DetailAnak) dan filter status gizi spesifik di daftar balita (ModePosyandu).

**Architecture:** Ekstrak util `printElementToPdf` (DRY, pakai js-html2pdf dynamic import). DetailAnak: ref pembungkus + tombol unduh. ModePosyandu + FilterChip: tambah chip status, filter meta.status, counts per status.

**Tech Stack:** React 19, js-html2pdf (dynamic import), Vitest, lucide-react, dayjs.

---

## File Structure

- Create: `src/utils/printElementToPdf.ts` + test
- Modify: `src/features/anak/DetailAnak.tsx` (ref + tombol unduh PDF)
- Modify: `src/features/kader/FilterChip.tsx` (opsi status gizi)
- Modify: `src/features/kader/ModePosyandu.tsx` (filter status + counts)
- Test: `src/__tests__/utils/printElementToPdf.test.ts`

---

## Task 1: Util printElementToPdf

**Files:**
- Create: `src/utils/printElementToPdf.ts`
- Test: `src/__tests__/utils/printElementToPdf.test.ts`

Context: pola dari ExportDesaForm: `await import('js-html2pdf')` lalu `html2pdf(element, opt).save()`. Util ini membungkus itu agar reusable & testable (mock module).

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/utils/printElementToPdf.test.ts`:

```ts
import { describe, expect, test, vi, beforeEach } from 'vitest';

const saveMock = vi.fn(() => Promise.resolve());
const html2pdfMock = vi.fn(() => ({ save: saveMock }));

vi.mock('js-html2pdf', () => ({ default: html2pdfMock }));

import { printElementToPdf } from '../../utils/printElementToPdf';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('printElementToPdf', () => {
  test('throws when element is null', async () => {
    await expect(printElementToPdf(null, 'x.pdf')).rejects.toThrow();
  });

  test('calls html2pdf with element and filename then saves', async () => {
    const el = document.createElement('div');
    await printElementToPdf(el, 'Kartu.pdf');
    expect(html2pdfMock).toHaveBeenCalledTimes(1);
    const [passedEl, opt] = html2pdfMock.mock.calls[0];
    expect(passedEl).toBe(el);
    expect(opt.filename).toBe('Kartu.pdf');
    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/utils/printElementToPdf.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the util**

Create `src/utils/printElementToPdf.ts`:

```ts
export interface PrintPdfOptions {
  margin?: number[];
  image?: { type: string; quality: number };
  html2canvas?: Record<string, unknown>;
  jsPDF?: Record<string, unknown>;
}

const DEFAULT_OPT = {
  margin: [12, 12, 12, 12],
  image: { type: 'jpeg', quality: 0.95 },
  html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
};

export async function printElementToPdf(
  element: HTMLElement | null,
  filename: string,
): Promise<void> {
  if (!element) {
    throw new Error('Elemen untuk dicetak tidak tersedia');
  }
  // react-doctor-disable-next-line -- dynamic import() intentionally code-splits the heavy js-html2pdf lib.
  const mod = await import('js-html2pdf');
  const html2pdf = (mod as any).default ?? mod;
  const opt = { ...DEFAULT_OPT, filename };
  await html2pdf(element, opt).save();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/utils/printElementToPdf.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```
git add src/utils/printElementToPdf.ts src/__tests__/utils/printElementToPdf.test.ts
git commit -m "feat(util): add printElementToPdf for reusable PDF export"
```

---

## Task 2: Tombol unduh PDF Kartu KMS di DetailAnak

**Files:**
- Modify: `src/features/anak/DetailAnak.tsx`

Context: DetailAnak (React) renders identitas (via PageHeader title/subtitle), a "Riwayat Pengukuran" section with RiwayatCard list, and a lazy ChartWHO. We wrap the printable content with a ref and add a download button. `useState`/`useRef` already imported from React (verify; add useRef if missing). `dayjs` already imported. `useToast` already used. Button component already imported. Add `Printer` icon from lucide-react (ArrowLeft already imported from lucide-react).

- [ ] **Step 1: Add imports and state**

In `src/features/anak/DetailAnak.tsx`:
- Ensure React import includes `useRef`: change `import React, { lazy, Suspense, useState } from 'react';` to `import React, { lazy, Suspense, useState, useRef } from 'react';`
- Add `Printer` to the lucide import: change `import { ArrowLeft } from 'lucide-react';` to `import { ArrowLeft, Printer } from 'lucide-react';`
- Add the util import after the RiwayatCard/ErrorState imports:
```tsx
import { printElementToPdf } from '../../utils/printElementToPdf';
```

- [ ] **Step 2: Add ref + printing state + handler**

Inside the component, after `const [editing, setEditing] = useState(null);`, add:
```tsx
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const hasPengukuran = !!pengukuran && pengukuran.length > 0;

  const handleDownloadPdf = async () => {
    try {
      setIsPrinting(true);
      const filename = `Kartu-KMS-${(anak?.nama ?? 'anak').replace(/\s+/g, '-')}-${dayjs().format('YYYY-MM-DD')}.pdf`;
      await printElementToPdf(printRef.current, filename);
      toast.success('Kartu KMS PDF berhasil dibuat');
    } catch {
      toast.error('Gagal membuat PDF');
    } finally {
      setIsPrinting(false);
    }
  };
```

- [ ] **Step 3: Add the download button near the "Kembali" button**

In the content container, right after the `Kembali` Button closing tag (and after the existing ErrorState block), add a download button. Place it so it is hidden when there is no data:
```tsx
          {hasPengukuran && (
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Printer size={16} strokeWidth={1.75} />}
              onClick={handleDownloadPdf}
              loading={isPrinting}
              disabled={isPrinting || anakLoading}
              className="mb-4 ml-2"
            >
              Unduh Kartu KMS (PDF)
            </Button>
          )}
```
Note: if `Button` has no `loading` prop, use `disabled={isPrinting || anakLoading}` only and change label to show progress. VERIFY Button's props by reading src/components/ui/Button.tsx; ExportDesaForm uses a print button so check how it shows progress and mirror it.

- [ ] **Step 4: Wrap printable content with the ref**

Wrap the identitas + riwayat + grafik area in a `<div ref={printRef}>`. The simplest non-breaking approach: wrap the existing block that contains the "Riwayat Pengukuran" heading through the ChartWHO Suspense block. Read lines ~104-160 and add an opening `<div ref={printRef} className="bg-white">` before the "Riwayat Pengukuran" `<h2>` and a matching `</div>` after the ChartWHO closing block, ensuring JSX remains balanced. Include a small identitas header inside the printable div so the PDF has the child's name/umur/gender:
```tsx
          <div ref={printRef} className="bg-white p-[17px]">
            <div className="mb-[17px]">
              <h1 className="text-heading font-bold text-deep-slate">{anak?.nama ?? '-'}</h1>
              <p className="text-body-sm text-graphite">
                {umur != null ? `${umur} bulan · ` : ''}
                {anak?.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>
            {/* existing Riwayat Pengukuran heading, list, and ChartWHO go here */}
          </div>
```
`umur` is already computed in the component. Keep the existing PengukuranForm modal OUTSIDE the printRef div.

- [ ] **Step 5: Verify**

Run: `npm run lint` — 0 errors.
Run: `npm test` — all green.
Run: `npm run build` — success.

- [ ] **Step 6: Commit**

```
git add src/features/anak/DetailAnak.tsx
git commit -m "feat(anak): download KMS card as PDF from detail page"
```

---

## Task 3: Filter status gizi di FilterChip + ModePosyandu

**Files:**
- Modify: `src/features/kader/FilterChip.tsx`
- Modify: `src/features/kader/ModePosyandu.tsx`

Context: FilterChip has internal OPTIONS = [semua, belum, perhatian]. ModePosyandu builds `counts = { semua, belum, perhatian }` and filters by key. `classifyBalita` returns `meta.status` which is one of statusGizi STATUS values: 'normal' | 'kurang' | 'stunting' | 'obesitas' | 'unknown'. STATUS_LABEL maps them to display text.

- [ ] **Step 1: Extend FilterChip OPTIONS with status chips**

In `src/features/kader/FilterChip.tsx`, change the OPTIONS array to include the three status filters after the existing ones:
```tsx
const OPTIONS = [
  { key: 'semua', label: 'Semua' },
  { key: 'belum', label: 'Belum diukur' },
  { key: 'perhatian', label: '\u26A0 Perhatian' },
  { key: 'stunting', label: 'Stunting' },
  { key: 'kurang', label: 'Kurang' },
  { key: 'obesitas', label: 'Obesitas' },
];
```
No other change needed — FilterChip already renders count badges from `counts[opt.key]` and calls `onChange(opt.key)`.

- [ ] **Step 2: Add status counts in ModePosyandu**

In `src/features/kader/ModePosyandu.tsx`, find the `counts` object (currently `{ semua, belum, perhatian }`, around lines 45-49) and extend it:
```tsx
  const counts = {
    semua: balitaWithMeta.length,
    belum: balitaWithMeta.filter((x) => !x.meta.sudahDiukur).length,
    perhatian: balitaWithMeta.filter((x) => x.meta.perluPerhatian).length,
    stunting: balitaWithMeta.filter((x) => x.meta.status === 'stunting').length,
    kurang: balitaWithMeta.filter((x) => x.meta.status === 'kurang').length,
    obesitas: balitaWithMeta.filter((x) => x.meta.status === 'obesitas').length,
  };
```

- [ ] **Step 3: Add status filtering logic**

In the `filtered` computation (the `.filter(({ anak, meta }) => {...})` block, around lines 51-66), add handling for the status keys. Replace the existing filter predicate body:
```tsx
      .filter(({ anak, meta }) => {
        if (q && !(anak.nama ?? '').toLowerCase().includes(q)) return false;
        if (filter === 'belum') return !meta.sudahDiukur;
        if (filter === 'perhatian') return meta.perluPerhatian;
        return true;
      })
```
with:
```tsx
      .filter(({ anak, meta }) => {
        if (q && !(anak.nama ?? '').toLowerCase().includes(q)) return false;
        if (filter === 'belum') return !meta.sudahDiukur;
        if (filter === 'perhatian') return meta.perluPerhatian;
        if (filter === 'stunting' || filter === 'kurang' || filter === 'obesitas') {
          return meta.status === filter;
        }
        return true;
      })
```

- [ ] **Step 4: Verify**

Run: `npm run lint` — 0 errors.
Run: `npm test` — all green.
Run: `npm run build` — success.

Manual sanity (optional, dev server): a kader with stunting/kurang/obesitas balita can click the new chips and see only matching children; badge counts match.

- [ ] **Step 5: Commit**

```
git add src/features/kader/FilterChip.tsx src/features/kader/ModePosyandu.tsx
git commit -m "feat(kader): filter balita list by gizi status"
```

---

## Final Verification

- [ ] `npm run lint` — 0 errors (1 pre-existing warning OK)
- [ ] `npm test` — all green (added: printElementToPdf 2)
- [ ] `npm run build` — success

## Catatan
- DRY: printElementToPdf reusable (DetailAnak sekarang; ExportDesaForm bisa migrasi nanti, di luar scope).
- YAGNI: tanpa filter umur, tanpa upload PDF ke server.
- Jika struktur JSX DetailAnak berbeda dari asumsi, baca file dan jaga keseimbangan tag saat membungkus printRef.


