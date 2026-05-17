# Phase 5 Final Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bersihkan technical debt sisa: replace `: any` di mutationFn dengan typed interface, migrate semua moment → dayjs (hapus dari deps), migrate `messageApi` ke `useToast()` di 3 file, optional bundle splitting antd.

**Architecture:** Pure refactor. Tidak ada perubahan UI atau API endpoint. Foundation: pakai dayjs (yang sudah dipakai DatePicker antd v6) sebagai single date library. Hilangkan `moment` dari `package.json` sehingga bundle turun ~70 KB.

**Tech Stack:** dayjs, TypeScript 5, antd v6, React 19.

**Audit reference:** Last audit comment in conversation, 4 issue tersisa.

---

## File Scope

### Modify (data layer + utilities)
- `src/utils/monthDiff.ts` — moment → dayjs
- `src/utilities/isThisMonth.ts` — moment → dayjs
- `src/features/pengukuran/zScore.ts` — moment → dayjs
- `src/features/laporan/aggregateKader.ts` — moment → dayjs
- `src/features/kader/classifyBalita.ts` — moment → dayjs
- `src/features/admin/useAdminDashboardData.ts` — moment → dayjs

### Modify (page/component, format only)
- `src/main.tsx` — hapus `import moment` + `moment.locale('id')`
- `src/components/ui/ActivityItem.tsx` — moment → dayjs
- `src/features/anak/RiwayatCard.tsx` — moment → dayjs
- `src/features/anak/DetailAnak.tsx` — moment → dayjs
- `src/features/anak/ChartWHO.tsx` — moment → dayjs
- `src/features/desa/ExportDesaForm.tsx` — moment → dayjs (hilangkan messageApi)
- `src/features/desa/AcaraSection.tsx` — moment → dayjs
- `src/features/orangtua/BerandaOT.tsx` — moment → dayjs
- `src/features/artikel/ArtikelList.tsx` — moment → dayjs
- `src/features/artikel/ArtikelDetailPage.tsx` — moment → dayjs
- `src/features/kader/ModePosyandu.tsx` — moment → dayjs
- `src/features/kader/PendingApprovalSection.tsx` — moment → dayjs
- `src/features/kader/PosyanduHeader.tsx` — moment → dayjs
- `src/features/kader/BalitaCard.tsx` — moment → dayjs
- `src/features/laporan/LaporanBulananKader.tsx` — moment → dayjs
- `src/features/pengukuran/PengukuranForm.tsx` — hilangkan import moment (sudah pakai dayjs)
- `src/components/form/FormInputDataAnak/index.tsx` — hapus moment
- `src/pages/Post/index.tsx` — moment → dayjs
- `src/pages/DetailForum/index.tsx` — moment → dayjs

### Modify (typed mutationFn)
- `src/pages/SignUp/index.tsx` — define `RegisterPayload` type
- `src/pages/AdminDashboard/RegisterKaderPosyandu.tsx` — define `KaderPayload`
- `src/pages/AdminDashboard/RegisterTenagaKesehatan.tsx` — define `TenkesPayload`
- `src/pages/AdminDashboard/InputPosyandu.tsx` — define `PosyanduFormPayload`

### Modify (messageApi → useToast)
- `src/features/desa/ExportDesaForm.tsx` (sudah dicover di moment migration)
- `src/features/kader/FormOrangTua.tsx`
- `src/features/kader/AkunOrangTuaPage.tsx`

### Remove
- `moment` dari `package.json` dependencies

---

## Testing Strategy

- 81 unit test existing harus tetap pass setiap task
- Build (`npx vite build`) wajib pass per task
- Type check (`npx tsc --noEmit`) wajib zero error per task
- Bundle size target: turun ~70 KB pre-gzip setelah hapus moment
- Test khusus: `zScore`, `aggregateKader` (3 test) tetap pass karena logic numerik

---

## Migration Pattern Reference

### moment → dayjs cheatsheet

| moment | dayjs |
|---|---|
| `moment()` | `dayjs()` |
| `moment(date)` | `dayjs(date)` |
| `moment(date).format('YYYY-MM-DD')` | `dayjs(date).format('YYYY-MM-DD')` |
| `moment(date).isValid()` | `dayjs(date).isValid()` |
| `moment().diff(moment(date), 'month')` | `dayjs().diff(dayjs(date), 'month')` |
| `moment(date).fromNow()` | `dayjs(date).fromNow()` (need plugin) |
| `moment(date, 'YYYY-MM')` | `dayjs(date, 'YYYY-MM')` (need customParseFormat) |

Plugin sudah di-load di `main.tsx`:
- `localizedFormat`
- `customParseFormat`
- locale `id`

Untuk `fromNow()` (di ActivityItem), tambah plugin `relativeTime`.

---

## Task 1: Tambah relativeTime plugin di main.tsx

**Files:** `src/main.tsx`

- [ ] **Step 1: Tambah relativeTime plugin**

Buka `src/main.tsx`. Replace import section:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import App from './App';

import '@fontsource/sen/400.css';
import '@fontsource/sen/500.css';
import '@fontsource/sen/600.css';
import '@fontsource/sen/700.css';

import './global.css';

dayjs.locale('id');
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Hapus juga `import moment from 'moment'` dan `moment.locale('id')`.

- [ ] **Step 2: Verify build + test**

```bash
npx vite build
npx vitest run
```

Expected: build pass, 81 test pass.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat(date): add dayjs relativeTime plugin, remove moment from main.tsx"
```

---

## Task 2: Migrate utilities (foundation logic)

**Files:** `src/utils/monthDiff.ts`, `src/utilities/isThisMonth.ts`

- [ ] **Step 1: monthDiff.ts**

Replace seluruh file:

```ts
import dayjs from 'dayjs';

export function monthDiff(start: any, end: any): number {
  return Math.abs(dayjs(end).diff(dayjs(start), 'month'));
}
```

- [ ] **Step 2: isThisMonth.ts**

Buka `src/utilities/isThisMonth.ts`. Replace:

```ts
import dayjs from 'dayjs';

export function isThisMonth(dateStr?: string | null): boolean {
  if (!dateStr) return false;
  const d = dayjs(dateStr);
  if (!d.isValid()) return false;
  const now = dayjs();
  return d.month() === now.month() && d.year() === now.year();
}

export function isWithinDays(dateStr?: string | null, days = 7): boolean {
  if (!dateStr) return false;
  const d = dayjs(dateStr);
  if (!d.isValid()) return false;
  return dayjs().diff(d, 'days') <= days;
}
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/monthDiff.ts src/utilities/isThisMonth.ts
git commit -m "refactor(date): migrate monthDiff + isThisMonth utilities to dayjs"
```

---

## Task 3: Migrate zScore + aggregateKader (covered by tests)

**Files:** `src/features/pengukuran/zScore.ts`, `src/features/laporan/aggregateKader.ts`

- [ ] **Step 1: zScore.ts**

Replace `import moment from 'moment';` dengan `import dayjs from 'dayjs';`. Replace semua `moment(` dengan `dayjs(` di file ini (4 lokasi: line 59, 66, 78, 93 berdasarkan audit).

- [ ] **Step 2: aggregateKader.ts**

Buka file. Replace `moment` import + 2 lokasi pemakaian (line 6, 39):
- `moment(date).format('YYYY-MM')` → `dayjs(date).format('YYYY-MM')`
- `moment().diff(moment(anak.tanggal_lahir), 'month')` → `dayjs().diff(dayjs(anak.tanggal_lahir), 'month')`

- [ ] **Step 3: Verify (test critical)**

```bash
npx vitest run src/__tests__/features/pengukuran
npx vitest run src/__tests__/features/laporan
```

Expected: zScore tests + aggregateKader tests semua pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/pengukuran/zScore.ts src/features/laporan/aggregateKader.ts
git commit -m "refactor(date): migrate zScore + aggregateKader to dayjs"
```

---

## Task 4: Migrate classifyBalita + admin dashboard data

**Files:** `src/features/kader/classifyBalita.ts`, `src/features/admin/useAdminDashboardData.ts`

- [ ] **Step 1: classifyBalita.ts**

Replace import + 1 lokasi (line 18): `moment(p.date).format('YYYY-MM')` → `dayjs(p.date).format('YYYY-MM')`.

- [ ] **Step 2: useAdminDashboardData.ts**

Replace import + 3 lokasi (line 87-90):
- `moment(x.timestamp)` → `dayjs(x.timestamp)`
- `moment().diff(m, 'days')` → `dayjs().diff(m, 'days')`
- `moment(b.timestamp).valueOf()` → `dayjs(b.timestamp).valueOf()`

- [ ] **Step 3: Verify build**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/features/kader/classifyBalita.ts src/features/admin/useAdminDashboardData.ts
git commit -m "refactor(date): migrate classifyBalita + admin dashboard to dayjs"
```

---

## Task 5: Migrate page-level moment usage (16 files)

**Files:** Lihat list di File Scope. Pattern sama untuk semua: replace import + ganti `moment(` → `dayjs(`.

- [ ] **Step 1: Replace di 16 file dengan script**

```bash
$files = @(
  "src/components/ui/ActivityItem.tsx",
  "src/features/anak/RiwayatCard.tsx",
  "src/features/anak/DetailAnak.tsx",
  "src/features/anak/ChartWHO.tsx",
  "src/features/desa/ExportDesaForm.tsx",
  "src/features/desa/AcaraSection.tsx",
  "src/features/orangtua/BerandaOT.tsx",
  "src/features/artikel/ArtikelList.tsx",
  "src/features/artikel/ArtikelDetailPage.tsx",
  "src/features/kader/ModePosyandu.tsx",
  "src/features/kader/PendingApprovalSection.tsx",
  "src/features/kader/PosyanduHeader.tsx",
  "src/features/kader/BalitaCard.tsx",
  "src/features/laporan/LaporanBulananKader.tsx",
  "src/pages/Post/index.tsx",
  "src/pages/DetailForum/index.tsx"
)
foreach ($f in $files) {
  $content = Get-Content $f -Raw
  $content = $content -replace "import moment from 'moment';", "import dayjs from 'dayjs';"
  $content = $content -replace 'import moment from "moment";', 'import dayjs from "dayjs";'
  $content = $content -replace '\bmoment\(', 'dayjs('
  $content = $content -replace '\bmoment\(\)', 'dayjs()'
  Set-Content $f $content -NoNewline -Encoding utf8
}
Write-Output "Replaced moment with dayjs in $($files.Count) files"
```

- [ ] **Step 2: Hapus moment dari PengukuranForm.tsx + FormInputDataAnak/index.tsx**

PengukuranForm sudah pakai dayjs, masih ada `import moment` + 1 lokasi `monthDiff(moment(anak.tanggal_lahir), moment(tanggal.toDate()))`. Replace:
- Hapus `import moment from 'moment';`
- Replace `monthDiff(moment(anak.tanggal_lahir), moment(tanggal.toDate()))` jadi `monthDiff(anak.tanggal_lahir, tanggal)` — `monthDiff` sudah accept `any`.

FormInputDataAnak hanya import moment, tidak dipakai. Hapus baris import.

- [ ] **Step 3: Verify TS + build**

```bash
npx tsc --noEmit
npx vite build
```

Expected: zero TS error, build pass. Kalau ada error mismatch tipe (mis. dayjs object vs moment object di prop), fix per file.

- [ ] **Step 4: Verify test**

```bash
npx vitest run
```

Expected: 81 test pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(date): migrate 18 component files from moment to dayjs"
```

---

## Task 6: Hapus moment dari package.json

**Files:** `package.json`

- [ ] **Step 1: Verify no moment usage**

```bash
findstr /S /N /C:"import moment" src
findstr /S /N /C:"from 'moment'" src
findstr /S /N /C:'from "moment"' src
```

Expected: zero matches kalau semua sudah migrated.

- [ ] **Step 2: Uninstall moment**

```bash
npm uninstall moment
```

- [ ] **Step 3: Verify build**

```bash
npx vite build
npx vitest run
```

Expected: build pass, 81 test pass, bundle main turun ~30 KB gzip.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): remove moment, use dayjs as single date library (~-70KB pre-gzip)"
```

---

## Task 7: Type SignUp mutationFn

**Files:** `src/pages/SignUp/index.tsx`

- [ ] **Step 1: Define payload types**

Tambah di top file (setelah imports):

```ts
interface PosyanduRegisterPayload {
  nama: string;
  email: string;
  password: string;
  desa: number;
  posyandu: number;
}

interface OrangTuaRegisterPayload extends PosyanduRegisterPayload {
  alamat: string;
}
```

- [ ] **Step 2: Replace `: any` dengan type**

Cari 2 baris dengan `mutationFn: (values: any) =>`:
- Line 88 (posyanduRegisterMutation): `(values: PosyanduRegisterPayload)`
- Line 104 (orangTuaRegisterMutation): `(values: OrangTuaRegisterPayload)`

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/SignUp/index.tsx
git commit -m "feat(types): type SignUp mutationFn with explicit payload interfaces"
```

---

## Task 8: Type RegisterKaderPosyandu mutationFn

**Files:** `src/pages/AdminDashboard/RegisterKaderPosyandu.tsx`

- [ ] **Step 1: Define payload type**

Tambah setelah imports:

```ts
interface KaderFormValues {
  nama: string;
  email: string;
  password?: string;
  desa: number;
  posyandu: number;
  status?: boolean;
}
```

- [ ] **Step 2: Replace 2 `: any`**

Line 63: `mutationFn: (values: KaderFormValues) =>`
Line 83: `mutationFn: ({ id, values }: { id: number; values: KaderFormValues }) =>`

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Kalau error karena form `values.status` bisa undefined, biarkan optional di interface.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminDashboard/RegisterKaderPosyandu.tsx
git commit -m "feat(types): type RegisterKaderPosyandu mutationFn"
```

---

## Task 9: Type RegisterTenagaKesehatan + InputPosyandu

**Files:** `src/pages/AdminDashboard/RegisterTenagaKesehatan.tsx`, `src/pages/AdminDashboard/InputPosyandu.tsx`

- [ ] **Step 1: RegisterTenagaKesehatan.tsx**

Tambah type:

```ts
interface TenkesFormValues {
  nama: string;
  email: string;
  password: string;
  desa: number;
}
```

Replace line 45: `mutationFn: (values: TenkesFormValues) =>`

- [ ] **Step 2: InputPosyandu.tsx**

Tambah type:

```ts
interface PosyanduFormValues {
  desa: number;
  posyandu: string;
  alamat: string;
}
```

Replace line 41: `mutationFn: (values: PosyanduFormValues) =>`
Replace line 59: `mutationFn: ({ id, values }: { id: number; values: PosyanduFormValues }) =>`

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
git add -A
git commit -m "feat(types): type RegisterTenkes + InputPosyandu mutationFn"
```

---

## Task 10: Migrate FormOrangTua messageApi → useToast

**Files:** `src/features/kader/FormOrangTua.tsx`

- [ ] **Step 1: Replace messageApi dengan useToast**

Cari baris dengan `import { ... } from 'antd';` — hilangkan `message` dari import jika ada.

Replace `const [messageApi, contextHolder] = message.useMessage();` dengan:

```tsx
const toast = useToast();
```

Tambah import:
```tsx
import { useToast } from '../../components/ui/Toast';
```

Replace `messageApi.success(...)` → `toast.success(...)`.
Replace `messageApi.error(...)` → `toast.error(...)`.
Replace `{contextHolder}` di JSX → `{toast.contextHolder}`.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx vite build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kader/FormOrangTua.tsx
git commit -m "refactor(toast): migrate FormOrangTua from messageApi to useToast"
```

---

## Task 11: Migrate AkunOrangTuaPage messageApi → useToast

**Files:** `src/features/kader/AkunOrangTuaPage.tsx`

- [ ] **Step 1: Apply pattern sama dengan Task 10**

Replace `messageApi.success/error` (line 68, 70) dengan `toast.success/error`. Replace `[messageApi, contextHolder] = message.useMessage()` dengan `useToast()`.

Hilangkan `message` dari `import { ... } from 'antd';` jika hanya itu yang dipakai.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx vite build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kader/AkunOrangTuaPage.tsx
git commit -m "refactor(toast): migrate AkunOrangTuaPage from messageApi to useToast"
```

---

## Task 12: Migrate ExportDesaForm messageApi → useToast

**Files:** `src/features/desa/ExportDesaForm.tsx`

- [ ] **Step 1: Apply pattern**

7 occurrence `messageApi` di file ini (line 12, 24, 36, 39, 49, 67, 70). Replace semua dengan `toast.success/error/contextHolder`.

Hilangkan `message` dari import antd kalau tidak dipakai lain.

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx vite build
npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/features/desa/ExportDesaForm.tsx
git commit -m "refactor(toast): migrate ExportDesaForm from messageApi to useToast"
```

---

## Task 13: Verification sweep

- [ ] **Step 1: Final build + test + type check**

```bash
npx vite build
npx vitest run
npx tsc --noEmit
```

Expected: build success, 81 test pass, zero TS error.

- [ ] **Step 2: Verify zero moment imports**

```bash
findstr /S /N /C:"import moment" src
findstr /S /N /C:"moment" package.json
```

Expected: zero matches di src, tidak ada di package.json deps.

- [ ] **Step 3: Verify zero `: any` di mutationFn**

```bash
findstr /S /N /R "mutationFn:.*: any" src
```

Expected: zero matches (atau hanya legitimate any di shared types).

- [ ] **Step 4: Verify zero messageApi.useMessage**

```bash
findstr /S /N /C:"message.useMessage" src
```

Expected: hanya 1 match di `src/components/ui/Toast.tsx` (legitimate, sumber `useToast`).

- [ ] **Step 5: Bundle size check**

```bash
npx vite build
```

Expected: main bundle gzip <= 365 KB (was 391 KB), saving ~25 KB dari moment removal.

- [ ] **Step 6: Push branch**

```bash
git push
```

- [ ] **Step 7: Tidak commit apa pun di Task 13**

Sweep saja.

---

## Plan Acceptance

- ✅ `moment` dihapus dari deps + zero import di src/
- ✅ Bundle main turun ~25 KB gzip
- ✅ 4 file admin pages: mutationFn typed dengan interface explicit
- ✅ 3 file (FormOrangTua, AkunOrangTuaPage, ExportDesaForm) pakai `useToast()` bukan `messageApi`
- ✅ 81 test pass, zero TS error, build pass
- ✅ Git commits clean per task

---

## Risk

- **Task 5** (mass migrate 16 file via script): kalau ada edge case `moment().fromNow()` atau format khusus, bisa runtime error. Mitigasi: test setelah replace, fix manual kalau ada.
- **Task 6** (uninstall moment): pastikan zero import dulu. Kalau ada module lain depend moment (mis. antd v6 internal), npm akan keep dedupe—itu OK.
- Beberapa moment-specific API (`isMoment`, `min`, `max`, `duration`) tidak ada langsung di dayjs. Audit ulang per file kalau ada.

---

## Next

Setelah Phase 5 merged:
- Branch `migrate-vite-react19-ts` siap merge ke `staging` atau `main`
- Optional Phase 6: Sentry integration, optimistic updates, accessibility refinement
- Manual visual QA per role di production-like environment
