# Quick Wins Fondasi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperkuat fondasi: test gerbang peran & mutation pengukuran, fix monthDiff, perketat sanitize, konsolidasi folder kembar.

**Architecture:** Perubahan berisiko rendah dan terisolasi. Konsolidasi folder dilakukan LEBIH DULU agar item lain bekerja di lokasi final, menghindari import putus ganda.

**Tech Stack:** React 19, Vitest, Testing Library, React Query, react-router-dom v6, dayjs, DOMPurify.

---

## File Structure

- Move: `src/hook/useSidebarCollapsed.ts` -> `src/hooks/useSidebarCollapsed.ts`
- Move: `src/utilities/Format.ts` -> `src/utils/Format.ts`
- Move: `src/utilities/isThisMonth.ts` -> `src/utils/isThisMonth.ts`
- Move: `src/utilities/sanitize.ts` -> `src/utils/sanitize.ts`
- Modify: imports in ~9 files + 1 test path
- Modify: `src/routes/RequireRole.tsx` (edge case role kosong)
- Modify: `src/utils/monthDiff.ts` (hapus Math.abs + tipe)
- Modify: `src/utils/sanitize.ts` (hapus 'style')
- Create: `src/__tests__/routes/RequireRole.test.tsx`
- Create: `src/__tests__/queries/usePengukuranQueries.test.tsx`
- Create: `src/__tests__/utils/monthDiff.test.ts`
- Move/Update: `src/__tests__/utilities/sanitize.test.ts` -> `src/__tests__/utils/sanitize.test.ts`

---

## Task 1: Konsolidasi folder kembar

**Files:**
- Move 4 files (hook + 3 utilities) into hooks/utils
- Modify ~9 import sites + 1 test path

Import sites to update (verified via grep):
- `src/components/layout/Dashboard/Sidebar.tsx:11` -> `../../../hooks/useSidebarCollapsed`
- `src/components/layout/Dashboard/DashboardLayout.tsx:4` -> `../../../hooks/useSidebarCollapsed`
- `src/features/artikel/ArtikelDetailPage.tsx:9` -> `../../utils/sanitize`
- `src/pages/AdminDashboard/RegisterTenagaKesehatan.tsx:11` -> `../../utils/isThisMonth`
- `src/pages/AdminDashboard/RegisterKaderPosyandu.tsx:11` -> `../../utils/isThisMonth`
- `src/pages/AdminDashboard/InputPosyandu.tsx:9` -> `../../utils/isThisMonth`
- `src/pages/AdminDashboard/InputDesa.tsx:12` -> `../../utils/isThisMonth`
- `src/pages/AdminDashboard/ArtikelList.tsx:18-19` -> `../../utils/Format` and `../../utils/isThisMonth`

- [ ] **Step 1: Move the 4 source files**

Run (PowerShell):
```
git mv src/hook/useSidebarCollapsed.ts src/hooks/useSidebarCollapsed.ts
git mv src/utilities/Format.ts src/utils/Format.ts
git mv src/utilities/isThisMonth.ts src/utils/isThisMonth.ts
git mv src/utilities/sanitize.ts src/utils/sanitize.ts
```

- [ ] **Step 2: Move the sanitize test**

Run:
```
git mv src/__tests__/utilities/sanitize.test.ts src/__tests__/utils/sanitize.test.ts
```
Then update its import (line 2) from `'../../utilities/sanitize'` to `'../../utils/sanitize'`.

- [ ] **Step 3: Update all import sites**

Edit each file listed above, changing `utilities/` -> `utils/` and `hook/` -> `hooks/` in the import path. Use a project-wide search for `utilities/` and `/hook/` to ensure none are missed (exclude node_modules).

- [ ] **Step 4: Remove now-empty folders**

Run:
```
Remove-Item -Recurse -Force src/hook -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force src/utilities -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force src/__tests__/utilities -ErrorAction SilentlyContinue
```

- [ ] **Step 5: Verify**

Run: `npm run lint` — expect 0 errors.
Run: `npm test` — expect all existing tests pass (sanitize test now runs from new path).
Run: `npm run build` — expect success (no broken imports).

- [ ] **Step 6: Commit**

```
git add -A
git commit -m "refactor: consolidate hook->hooks and utilities->utils"
```

---

## Task 2: Fix monthDiff (hapus Math.abs + tipe)

**Files:**
- Modify: `src/utils/monthDiff.ts`
- Test: `src/__tests__/utils/monthDiff.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/utils/monthDiff.test.ts`:

```ts
import { describe, expect, test } from 'vitest';
import { monthDiff } from '../../utils/monthDiff';

describe('monthDiff', () => {
  test('returns whole months between two dates', () => {
    expect(monthDiff('2024-01-01', '2024-07-01')).toBe(6);
  });

  test('returns 0 within the same month', () => {
    expect(monthDiff('2024-01-01', '2024-01-20')).toBe(0);
  });

  test('returns negative when end is before start (no Math.abs)', () => {
    expect(monthDiff('2024-07-01', '2024-01-01')).toBe(-6);
  });

  test('measurement date before birth date yields negative age', () => {
    const birth = '2024-05-10';
    const measured = '2024-03-10';
    expect(monthDiff(birth, measured)).toBeLessThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/utils/monthDiff.test.ts`
Expected: FAIL on the negative cases (current impl uses Math.abs, returns 6 not -6).

- [ ] **Step 3: Implement fix**

Replace `src/utils/monthDiff.ts` entirely with:

```ts
import dayjs from 'dayjs';

export function monthDiff(
  start: dayjs.ConfigType,
  end: dayjs.ConfigType,
): number {
  return dayjs(end).diff(dayjs(start), 'month');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/utils/monthDiff.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Verify callers unaffected**

Run full suite: `npm test`
Expected: all PASS. Pay attention to `zScore.test.ts`, `statusGizi.test.ts`, `BalitaCard.test.tsx`. If any caller (ChartWHO/zScore) relied on absolute value for a legitimate forward measurement, those tests still pass because real ages are positive. If a test fails because it fed reversed dates expecting positive, that test was asserting the bug — report it and STOP for review rather than silently changing it.

- [ ] **Step 6: Commit**

```
git add src/utils/monthDiff.ts src/__tests__/utils/monthDiff.test.ts
git commit -m "fix(monthDiff): drop Math.abs so invalid ages are detectable; add types"
```

---

## Task 3: Perketat sanitize (hapus 'style')

**Files:**
- Modify: `src/utils/sanitize.ts` (sudah dipindah di Task 1)
- Test: `src/__tests__/utils/sanitize.test.ts` (sudah dipindah di Task 1)

- [ ] **Step 1: Add the failing test**

Append these tests inside the `describe('sanitizeHtml', ...)` block in `src/__tests__/utils/sanitize.test.ts`:

```ts
  test('strips style attribute', () => {
    const dirty = '<p style="position:fixed;top:0">x</p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('style=');
    expect(clean).toContain('<p');
  });

  test('keeps class attribute', () => {
    const dirty = '<p class="intro">x</p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('class="intro"');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/utils/sanitize.test.ts`
Expected: FAIL on "strips style attribute" (style currently allowed).

- [ ] **Step 3: Remove 'style' from ALLOWED_ATTR**

In `src/utils/sanitize.ts`, change:
```ts
const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'src', 'alt', 'title',
  'class', 'style',
];
```
to:
```ts
const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'src', 'alt', 'title',
  'class',
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/utils/sanitize.test.ts`
Expected: PASS (all, including the new two).

- [ ] **Step 5: Commit**

```
git add src/utils/sanitize.ts src/__tests__/utils/sanitize.test.ts
git commit -m "fix(sanitize): drop style attribute to prevent UI redressing"
```

---

## Task 4: Test RequireRole + fix edge-case role kosong

**Files:**
- Modify: `src/routes/RequireRole.tsx`
- Test: `src/__tests__/routes/RequireRole.test.tsx`

Context: `RequireRole` uses `useSession()` (returns `{ isAuthenticated, role }`). On not-authenticated it redirects to `/masuk`. On disallowed role it redirects to `ROLE_HOME[role]`. ROLE_HOME maps each role to its home path (e.g. ORANG_TUA -> /orangtua/balita, ADMIN -> /admin/dashboard). Current bug: authenticated but `role` null falls through to render children.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/routes/RequireRole.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireRole from '../../routes/RequireRole';

const mockSession = vi.fn();
vi.mock('../../features/auth/useSession', () => ({
  useSession: () => mockSession(),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<RequireRole allow={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<div>ADMIN PAGE</div>} />
        </Route>
        <Route path="/masuk" element={<div>LOGIN PAGE</div>} />
        <Route path="/orangtua/balita" element={<div>OT HOME</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  beforeEach(() => mockSession.mockReset());

  test('redirects to /masuk when not authenticated', () => {
    mockSession.mockReturnValue({ isAuthenticated: false, role: null });
    renderAt('/admin/dashboard');
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });

  test('renders content for an allowed role', () => {
    mockSession.mockReturnValue({ isAuthenticated: true, role: 'ADMIN' });
    renderAt('/admin/dashboard');
    expect(screen.getByText('ADMIN PAGE')).toBeInTheDocument();
  });

  test('redirects a disallowed role to its ROLE_HOME', () => {
    mockSession.mockReturnValue({ isAuthenticated: true, role: 'ORANG_TUA' });
    renderAt('/admin/dashboard');
    expect(screen.getByText('OT HOME')).toBeInTheDocument();
  });

  test('redirects to /masuk when authenticated but role is missing', () => {
    mockSession.mockReturnValue({ isAuthenticated: true, role: null });
    renderAt('/admin/dashboard');
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/routes/RequireRole.test.tsx`
Expected: the "role is missing" test FAILS (currently falls through to render the Outlet; there is no ADMIN PAGE match so it renders nothing / not LOGIN PAGE).

- [ ] **Step 3: Fix the edge case in RequireRole.tsx**

In `src/routes/RequireRole.tsx`, after the `!isAuthenticated` guard (line 16-18), add a guard for missing role. Replace:

```tsx
  if (!isAuthenticated) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  if (allow && allow.length > 0 && role && !allow.includes(role)) {
```

with:

```tsx
  if (!isAuthenticated) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  if (!role) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  if (allow && allow.length > 0 && !allow.includes(role)) {
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/routes/RequireRole.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```
git add src/routes/RequireRole.tsx src/__tests__/routes/RequireRole.test.tsx
git commit -m "fix(RequireRole): redirect to login when role missing; add guard tests"
```

---

## Task 5: Test mutation hooks pengukuran

**Files:**
- Test: `src/__tests__/queries/usePengukuranQueries.test.tsx`

Context: `usePengukuranQueries.ts` exports `useCreatePengukuran(anakId)`, `useUpdatePengukuran(anakId)`, `useDeletePengukuran(anakId)`. Each calls `pengukuranApi.create/update/remove` and on success invalidates `qk.pengukuran.byAnak(anakId, role)` and `qk.laporan.all`. They read `role` from `useSession()`. The api module is `../api/pengukuran.api` exporting `pengukuranApi` with `create(payload, role)`, `update(id, payload)`, `remove(id)`. Key factory `qk` is in `../queries/keys`.

- [ ] **Step 1: Write the test**

Create `src/__tests__/queries/usePengukuranQueries.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import {
  useCreatePengukuran,
  useUpdatePengukuran,
  useDeletePengukuran,
} from '../../queries/usePengukuranQueries';
import { qk } from '../../queries/keys';

vi.mock('../../features/auth/useSession', () => ({
  useSession: () => ({ role: 'KADER_POSYANDU', isAuthenticated: true }),
}));

vi.mock('../../api/pengukuran.api', () => ({
  pengukuranApi: {
    create: vi.fn(() => Promise.resolve({ data: { id: 99 } })),
    update: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
    remove: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

import { pengukuranApi } from '../../api/pengukuran.api';

const ANAK_ID = 7;

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const spy = vi.spyOn(qc, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { wrapper, spy };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreatePengukuran', () => {
  test('calls api.create with role and invalidates byAnak + laporan', async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useCreatePengukuran(ANAK_ID), { wrapper });

    const payload = {
      id_anak: ANAK_ID,
      date: '2026-05-01',
      berat: 9,
      tinggi: 75,
      lingkar_kepala: 46,
    };
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pengukuranApi.create).toHaveBeenCalledWith(payload, 'KADER_POSYANDU');
    expect(spy).toHaveBeenCalledWith({
      queryKey: qk.pengukuran.byAnak(ANAK_ID, 'KADER_POSYANDU'),
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.laporan.all });
  });

  test('surfaces error on failure', async () => {
    (pengukuranApi.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCreatePengukuran(ANAK_ID), { wrapper });
    result.current.mutate({
      id_anak: ANAK_ID,
      date: '2026-05-01',
      berat: 9,
      tinggi: 75,
      lingkar_kepala: 46,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useUpdatePengukuran', () => {
  test('calls api.update and invalidates byAnak + laporan', async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useUpdatePengukuran(ANAK_ID), { wrapper });

    result.current.mutate({ id: 1, payload: { berat: 10 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pengukuranApi.update).toHaveBeenCalledWith(1, { berat: 10 });
    expect(spy).toHaveBeenCalledWith({
      queryKey: qk.pengukuran.byAnak(ANAK_ID, 'KADER_POSYANDU'),
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.laporan.all });
  });
});

describe('useDeletePengukuran', () => {
  test('calls api.remove and invalidates byAnak + laporan', async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useDeletePengukuran(ANAK_ID), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pengukuranApi.remove).toHaveBeenCalledWith(1);
    expect(spy).toHaveBeenCalledWith({
      queryKey: qk.pengukuran.byAnak(ANAK_ID, 'KADER_POSYANDU'),
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.laporan.all });
  });
});
```

- [ ] **Step 2: Run the test**

Run: `npx vitest run src/__tests__/queries/usePengukuranQueries.test.tsx`
Expected: PASS (5 tests). If the invalidate assertion shape mismatches (e.g. extra options), adjust the expectation to match the actual call shape — read the hook source to confirm the exact `invalidateQueries` argument object.

- [ ] **Step 3: Commit**

```
git add src/__tests__/queries/usePengukuranQueries.test.tsx
git commit -m "test(pengukuran): cover create/update/delete mutation hooks"
```

---

## Final Verification

- [ ] **Step 1: Full suite**

Run: `npm run lint` — 0 errors.
Run: `npm test` — all pass (added: monthDiff 4, sanitize +2, RequireRole 4, pengukuran 5).
Run: `npm run build` — success.

---

## Catatan
- DRY/YAGNI: hanya menyentuh apa yang diperlukan; typing menyeluruh ditunda.
- Urutan sengaja: Task 1 (pindah folder) dulu agar Task 3 bekerja di lokasi final.
- Jika sebuah test gagal karena meng-assert perilaku lama yang buggy, STOP dan eskalasi, jangan ubah ekspektasi diam-diam.

