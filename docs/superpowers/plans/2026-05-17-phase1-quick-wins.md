# Phase 1 Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address 5 quick wins dari audit comprehensive — fixes yang bisa diselesaikan ~3 jam dengan dampak signifikan ke code quality dan production readiness.

**Architecture:** Pure refactor + config update. Tidak ada API change, tidak ada UI change yang user-facing. Pattern improvements + dead code removal.

**Tech Stack:** Vite 8, React 19, antd v6, TanStack Query, TypeScript 5.

**Audit reference:** `docs/superpowers/audits/2026-05-17-comprehensive.md` (Phase 1 quick wins)

---

## File Scope

### Modify
- `src/queries/keys.ts` — tambah namespace `approve`, `reminder`, `orangTua`
- `src/queries/useApproveQueries.ts` — pakai `qk.approve.*`, hapus `OT_KEY`/`ANAK_KEY`
- `src/queries/useReminderQueries.ts` — pakai `qk.reminder.*`
- `src/queries/useOrangTuaQueries.ts` — pakai `qk.orangTua.*`
- `src/components/layout/Navbar/index.tsx` — replace `useAuth` dengan `useSession`
- `src/hook/useAuth.ts` — DELETE (no consumers left)
- `src/features/admin/AdminDashboard.tsx` — verify already using useSession (sudah)
- `src/components/form/FormUpdateDataArtikel/index.tsx` — lazy load ReactQuill
- `src/pages/AdminDashboard/ArtikelForm.tsx` — lazy load ReactQuill
- `src/features/admin/AdminActivityFeed.tsx` — fix `key={i}` ke stable id
- `src/pages/Post/index.tsx` — fix `key={idx}` di jawaban list
- `src/components/ui/DataTable/DataTablePagination.tsx` — fix `key={index}` (skeleton OK, biarkan)
- `vite.config.js` — set `sourcemap: 'hidden'`
- `src/__tests__/queries/keys.test.ts` — update test untuk namespace baru

### Test files
- `src/__tests__/queries/keys.test.ts` — extend coverage untuk approve/reminder/orangTua keys

---

## Testing Strategy

- 73 unit test existing harus tetap pass setelah setiap task
- Update `keys.test.ts` di Task 1 untuk include namespace baru
- Build (`npx vite build`) wajib pass per task
- Type check (`npx tsc --noEmit`) wajib zero error per task

---

## Task 1: Tambah namespace di qk factory

**Files:** `src/queries/keys.ts`

- [ ] **Step 1: Tambah `approve`, `reminder`, `orangTua` namespace**

Buka `src/queries/keys.ts`, tambah di dalam object `qk`:

```ts
  approve: {
    all: ['approve'] as const,
    orangTua: ['approve', 'orangTua'] as const,
    anak: ['approve', 'anak'] as const,
  },
  reminder: {
    all: ['reminder'] as const,
    list: ['reminder', 'list'] as const,
  },
  orangTua: {
    all: ['orangTua'] as const,
    list: ['orangTua', 'list'] as const,
  },
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

Expected: zero error.

- [ ] **Step 3: Commit**

```bash
git add src/queries/keys.ts
git commit -m "feat(queries): add approve/reminder/orangTua namespaces to qk factory"
```

---

## Task 2: Migrate useApproveQueries ke qk factory

**Files:** `src/queries/useApproveQueries.ts`

- [ ] **Step 1: Replace local consts dengan qk reference**

Edit `src/queries/useApproveQueries.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approveApi } from '../api/approve.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

function normalizeStatus(s) {
  if (s === true || s === 1 || s === '1') return true;
  return false;
}

export function usePendingOrangTua(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.approve.orangTua,
    queryFn: async () => {
      const res = await approveApi.listOrangTua();
      const list = res.data ?? [];
      return list.filter((item) => !normalizeStatus(item.status));
    },
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function usePendingAnak(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.approve.anak,
    queryFn: async () => {
      const res = await approveApi.listAnakBelumApprove();
      const list = res.data ?? [];
      return [...list].sort((a, b) =>
        (b.created_at ?? '').localeCompare(a.created_at ?? '')
      );
    },
    enabled: enabled && isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useApproveOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.approveOrangTua(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}

export function useApproveAnak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.approveAnak(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.approve.anak });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}

export function useRejectOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.rejectOrangTua(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.approve.orangTua }),
  });
}

export function useRejectAnak() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.rejectAnak(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.approve.anak });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}
```

- [ ] **Step 2: Verify build + test**

```bash
npx vite build
npx vitest run
```

Expected: build pass, 73/73 test pass.

- [ ] **Step 3: Commit**

```bash
git add src/queries/useApproveQueries.ts
git commit -m "refactor(queries): use qk factory in useApproveQueries"
```

---

## Task 3: Migrate useReminderQueries ke qk factory

**Files:** `src/queries/useReminderQueries.ts`

- [ ] **Step 1: Replace local const dengan qk reference**

Edit `src/queries/useReminderQueries.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderApi } from '../api/reminder.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useReminderList() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.reminder.list,
    queryFn: async () => {
      const res = await reminderApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => reminderApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reminder.all }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => reminderApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reminder.all }),
  });
}
```

- [ ] **Step 2: Verify build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/queries/useReminderQueries.ts
git commit -m "refactor(queries): use qk factory in useReminderQueries"
```

---

## Task 4: Migrate useOrangTuaQueries ke qk factory

**Files:** `src/queries/useOrangTuaQueries.ts`

- [ ] **Step 1: Baca file dulu**

```bash
type src\queries\useOrangTuaQueries.ts
```

- [ ] **Step 2: Replace `OT_LIST_KEY` dengan `qk.orangTua.list`**

Find `const OT_LIST_KEY = [...]`, hapus baris tersebut. Replace semua reference `OT_LIST_KEY` di file dengan `qk.orangTua.list`. Tambah import `import { qk } from './keys';` di header.

Replace cross-namespace `['approve', 'orangTua']` dengan `qk.approve.orangTua` (import sudah).

- [ ] **Step 3: Verify build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/queries/useOrangTuaQueries.ts
git commit -m "refactor(queries): use qk factory in useOrangTuaQueries"
```

---

## Task 5: Update keys.test.ts

**Files:** `src/__tests__/queries/keys.test.ts`

- [ ] **Step 1: Extend test coverage**

Edit `src/__tests__/queries/keys.test.ts`, tambah test sebelum closing `});` :

```ts
  test('approve namespace keys', () => {
    expect(qk.approve.all).toEqual(['approve']);
    expect(qk.approve.orangTua).toEqual(['approve', 'orangTua']);
    expect(qk.approve.anak).toEqual(['approve', 'anak']);
  });

  test('reminder namespace keys', () => {
    expect(qk.reminder.all).toEqual(['reminder']);
    expect(qk.reminder.list).toEqual(['reminder', 'list']);
  });

  test('orangTua namespace keys', () => {
    expect(qk.orangTua.all).toEqual(['orangTua']);
    expect(qk.orangTua.list).toEqual(['orangTua', 'list']);
  });
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/__tests__/queries
```

Expected: 11+ test pass (3 baru).

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/queries/keys.test.ts
git commit -m "test(queries): add coverage for approve/reminder/orangTua namespaces"
```

---

## Task 6: Replace useAuth dengan useSession di Navbar

**Files:** `src/components/layout/Navbar/index.tsx`

- [ ] **Step 1: Replace import**

Buka `src/components/layout/Navbar/index.tsx`. Replace baris:

```ts
import useAuth from "../../../hook/useAuth";
```

dengan:

```ts
import { useSession } from "../../../features/auth/useSession";
```

- [ ] **Step 2: Replace usage**

Cari `const user = useAuth();` (sekitar line 86). Replace dengan:

```ts
const { user, role } = useSession();
```

Lalu replace semua `user?.user?.role` dengan `role`, dan `user?.user?.name` dengan `user?.name`, dan `user?.user?.desa_name` dengan `user?.desa_name` di file ini.

- [ ] **Step 3: Verify build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar/index.tsx
git commit -m "refactor(navbar): use useSession instead of legacy useAuth"
```

---

## Task 7: Hapus useAuth.ts

**Files:** `src/hook/useAuth.ts`

- [ ] **Step 1: Verify zero consumers**

```bash
findstr /S /N /C:"import useAuth" src
```

Expected: zero output (Task 6 sudah handle Navbar; AdminDashboard sudah pakai useSession).

- [ ] **Step 2: Hapus file**

```bash
Remove-Item -LiteralPath "src/hook/useAuth.ts" -Force
```

- [ ] **Step 3: Verify build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove useAuth legacy hook (replaced by useSession)"
```

---

## Task 8: Lazy load ReactQuill

**Files:** `src/pages/AdminDashboard/ArtikelForm.tsx`, `src/components/form/FormUpdateDataArtikel/index.tsx`

- [ ] **Step 1: Convert ArtikelForm.tsx ke lazy import**

Buka `src/pages/AdminDashboard/ArtikelForm.tsx`. Replace:

```ts
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
```

dengan:

```ts
import { lazy, Suspense } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = lazy(() => import("react-quill-new"));
```

Lalu wrap penggunaan `<ReactQuill ... />` dengan `<Suspense fallback={...}>`:

```tsx
<Suspense fallback={<div className="h-[200px] bg-faint-fog rounded-default animate-pulse" />}>
  <ReactQuill
    theme="snow"
    value={valueContent}
    onChange={setValueContent}
  />
</Suspense>
```

- [ ] **Step 2: Sama untuk FormUpdateDataArtikel**

Buka `src/components/form/FormUpdateDataArtikel/index.tsx`. Apply pattern yang sama: replace `import ReactQuill` dengan `lazy()`, wrap render dengan `<Suspense>`.

- [ ] **Step 3: Verify build + test**

```bash
npx vite build
npx vitest run
```

Verify ada chunk baru `react-quill-new-*.js` yang terpisah dari main bundle.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminDashboard/ArtikelForm.tsx src/components/form/FormUpdateDataArtikel/index.tsx
git commit -m "perf(artikel): lazy load ReactQuill editor (admin-only feature)"
```

---

## Task 9: Fix `key={i}` di AdminActivityFeed

**Files:** `src/features/admin/AdminActivityFeed.tsx`

- [ ] **Step 1: Baca file dulu**

```bash
type src\features\admin\AdminActivityFeed.tsx
```

Cek line 49 — kemungkinan ini skeleton state pakai `key={i}` (OK biarkan kalau begitu) atau real items list.

- [ ] **Step 2: Decide based on context**

Jika `key={i}` di **skeleton/loading state** (rendered fixed Array.from({length:5})), biarkan dengan comment justifikasi. Jika di list dengan data id, replace dengan `key={item.id}`.

Contoh fix kalau items list:
```tsx
{items.map((item) => (
  <div key={item.id} className="...">...</div>
))}
```

- [ ] **Step 3: Verify build**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/AdminActivityFeed.tsx
git commit -m "fix(admin): use stable id as React key in activity feed"
```

---

## Task 10: Fix `key={idx}` di Post forum jawaban

**Files:** `src/pages/Post/index.tsx`

- [ ] **Step 1: Replace key**

Buka `src/pages/Post/index.tsx`, cari sekitar line 174-190 di blok `item.jawaban.map((j, idx) => ...)`. Replace `key={idx}` dengan stable id:

```tsx
{item.jawaban.map((j) => (
  <div
    key={j.comment_id ?? j.id ?? `${item.id}-${j.waktu ?? j.time ?? ''}`}
    className="..."
  >
```

- [ ] **Step 2: Verify build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Post/index.tsx
git commit -m "fix(forum): use stable id as React key for jawaban list"
```

---

## Task 11: Set sourcemap hidden

**Files:** `vite.config.js`

- [ ] **Step 1: Update sourcemap option**

Buka `vite.config.js`. Cari:

```js
build: {
  outDir: 'build',
  sourcemap: false,
},
```

Replace dengan:

```js
build: {
  outDir: 'build',
  sourcemap: 'hidden',
},
```

`hidden` artinya: generate `.map` files (untuk debugging via stack trace), tapi tidak di-link di bundle (tidak expose di prod browser).

- [ ] **Step 2: Verify build**

```bash
npx vite build
```

Expected: build pass, ada file `*.map` di `build/assets/`.

- [ ] **Step 3: Commit**

```bash
git add vite.config.js
git commit -m "chore(build): generate hidden sourcemaps for production debugging"
```

---

## Task 12: Verification sweep

- [ ] **Step 1: Final build**

```bash
npx vite build
```

Expected: Compiled successfully, no warnings except chunk size.

- [ ] **Step 2: Final test**

```bash
npx vitest run
```

Expected: 76/76 pass (73 + 3 new).

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: zero error.

- [ ] **Step 4: Verify zero `useAuth` import**

```bash
findstr /S /N /C:"useAuth" src
```

Expected: zero output (file dihapus, semua consumer migrated).

- [ ] **Step 5: Verify zero local key consts di queries/**

```bash
findstr /S /N /R "const.*_KEY = \[" src\queries
```

Expected: zero output.

- [ ] **Step 6: Tidak commit apa pun di Task 12**

Sweep saja.

---

## Plan Acceptance

- ✅ `qk.approve.*`, `qk.reminder.*`, `qk.orangTua.*` namespaces existed
- ✅ 3 query hooks pakai factory (no local KEY constants)
- ✅ `useAuth.ts` deleted
- ✅ Navbar pakai `useSession()`
- ✅ ReactQuill lazy-loaded (chunk terpisah)
- ✅ `key={i}` / `key={idx}` di list real (bukan skeleton) sudah di-fix
- ✅ `vite.config.js` sourcemap = hidden
- ✅ 76 test pass (73 + 3 baru di keys.test.ts)
- ✅ Zero TS error, zero ESLint warning

---

## Risk

- **Task 6** menyentuh Navbar yang dipakai 5 role. Worth manual verify visual setelah merge.
- **Task 8** lazy load ReactQuill bisa create flicker singkat saat admin open form. Mitigasi: skeleton fallback di Suspense.
- **Task 11** hidden sourcemap menambah size folder `build/` (~1.5x). Tidak masalah untuk deploy karena `.map` tidak di-serve ke client.

---

## Next

Setelah Phase 1 merged:
- Phase 2 (high impact, ~2-3 sesi): code splitting, ErrorBoundary, DOMPurify, Modal.confirm refactor, Card a11y
- Phase 3 (quality refactor, ~4-6 sesi): extract large components, hapus @ts-nocheck bertahap, optimistic updates, Sentry
