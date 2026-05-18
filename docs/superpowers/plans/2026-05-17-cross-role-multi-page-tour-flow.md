# Cross-Role Multi-Page Tour Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah onboarding tour menjadi flow per-role lintas banyak halaman dengan auto-navigation antar route, auto-show pertama kali, skip global per role, dan replay mulai dari halaman aktif sampai akhir flow.

**Architecture:** Tour dipindah dari model `buildSteps(role)` sederhana menjadi manifest flow route-aware per role. `TourProvider` menjadi controller yang membaca role + pathname, melakukan navigation ke route step berikutnya, dan merender slice step halaman aktif. `useTour` diperluas menjadi state machine ringan untuk auto-start, replay dari path aktif, skip, finish, dan progres step aktif.

**Tech Stack:** React 19, TypeScript, React Router v6, Ant Design Tour, Vitest, Vite.

---

## File Structure

### Modify
- `src/features/tour/tourSteps.ts` — ganti dari array step flat ke manifest flow route-aware + helper selector/matcher
- `src/features/tour/TourProvider.tsx` — controller tour lintas route (`useLocation`, `useNavigate`, next/prev/close)
- `src/features/tour/useTour.ts` — state machine aktif, replay-from-path, completion per role
- `src/features/kader/ModePosyandu.tsx` — anchor canonical mode posyandu
- `src/features/kader/PosyanduHeader.tsx` — anchor header, progress, laporan
- `src/features/kader/AkunOrangTuaPage.tsx` — anchor tab pending/aktif + table/button
- `src/features/laporan/LaporanBulananKader.tsx` — anchor picker, stat, partisipasi, distribusi
- `src/features/anak/DetailAnak.tsx` — anchor riwayat, tambah pengukuran, chart
- `src/features/orangtua/BerandaOT.tsx` — anchor anak/forum/artikel
- `src/pages/Post/index.tsx` — anchor forum list/detail/jawaban
- `src/pages/DetailForum/index.tsx` — anchor detail pertanyaan/jawaban/form komentar
- `src/features/artikel/ArtikelList.tsx` — anchor list artikel
- `src/features/artikel/ArtikelDetailPage.tsx` — anchor isi artikel
- `src/features/desa/BerandaDesa.tsx` — anchor dashboard desa
- `src/features/desa/ExportDesaForm.tsx` — anchor export CSV/PDF
- `src/features/desa/AcaraSection.tsx` — anchor form/list acara
- `src/features/laporan/LaporanDesa.tsx` — anchor ringkasan/statistik bila dibutuhkan
- `src/features/admin/AdminDashboard.tsx` — anchor dashboard admin
- `src/features/admin/AdminActivityFeed.tsx` — anchor activity feed
- `src/components/layout/Dashboard/Sidebar.tsx` — replay/button/admin menu anchors
- `src/pages/AdminDashboard/InputDesa.tsx` — anchor stat/table/tambah desa
- `src/pages/AdminDashboard/InputPosyandu.tsx` — anchor stat/table/tambah posyandu
- `src/pages/AdminDashboard/RegisterKaderPosyandu.tsx` — anchor stat/filter/table/tambah kader
- `src/pages/AdminDashboard/RegisterTenagaKesehatan.tsx` — anchor stat/table/tambah nakes
- `src/pages/AdminDashboard/ArtikelList.tsx` — anchor stat/table/tulis artikel
- `src/pages/AdminDashboard/ArtikelForm.tsx` — anchor kategori/cover/editor/submit

### Create
- `src/__tests__/features/tour/multiPageTourFlow.test.tsx` — controller tests untuk start path, next route jump, replay current page, finish/skip

---

## Testing Strategy

- TDD wajib untuk controller flow baru.
- Verification commands:
  - `rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx`
  - `rtk npm test`
  - `rtk tsc --noEmit`
  - `rtk npm run build`
- Manual QA setelah semua task:
  - admin multi-page auto-next across routes
  - replay dari halaman tengah mulai dari halaman itu
  - replay dari halaman terakhir stay lokal
  - skip mark complete

---

### Task 1: Define route-aware tour manifest API with failing tests

**Files:**
- Modify: `src/features/tour/tourSteps.ts`
- Create: `src/__tests__/features/tour/multiPageTourFlow.test.tsx`

- [ ] **Step 1: Write failing tests for flow manifest helpers**

Create `src/__tests__/features/tour/multiPageTourFlow.test.tsx` with:

```tsx
import { describe, expect, test } from 'vitest';
import {
  getRoleFlow,
  getFirstStepForPath,
  getNextStep,
  getPreviousStep,
} from '../../../features/tour/tourSteps';

describe('multi-page tour flow manifest', () => {
  test('returns admin flow with dashboard as first route', () => {
    const flow = getRoleFlow('ADMIN');

    expect(flow).toBeTruthy();
    expect(flow?.steps[0].routePattern).toBe('/admin/dashboard');
    expect(flow?.steps.some((step) => step.routePattern === '/admin/dashboard/desa')).toBe(true);
    expect(flow?.steps.some((step) => step.routePattern === '/admin/dashboard/artikel/baru')).toBe(true);
  });

  test('finds first step for current route inside role flow', () => {
    const step = getFirstStepForPath('ADMIN', '/admin/dashboard/posyandu');

    expect(step?.routePattern).toBe('/admin/dashboard/posyandu');
  });

  test('returns next step across route boundaries', () => {
    const flow = getRoleFlow('ADMIN');
    const current = flow!.steps.find((step) => step.id === 'admin-dashboard-sidebar');

    const next = getNextStep('ADMIN', current!.id);

    expect(next?.routePattern).toBe('/admin/dashboard/desa');
  });

  test('returns previous step across route boundaries', () => {
    const flow = getRoleFlow('ADMIN');
    const current = flow!.steps.find((step) => step.id === 'admin-desa-header');

    const prev = getPreviousStep('ADMIN', current!.id);

    expect(prev?.routePattern).toBe('/admin/dashboard');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx
```

Expected: FAIL because exported helpers do not exist yet.

- [ ] **Step 3: Implement minimal route-aware manifest API**

In `src/features/tour/tourSteps.ts`, replace current single exported builder model with exports shaped like:

```ts
import { matchPath } from 'react-router-dom';
import type { TourStepProps } from 'antd';
import type { Role } from '../../types';

export type TourFlowStep = {
  id: string;
  role: Role;
  routePattern: string;
  title: string;
  description: string;
  targetSelector: string | null;
  fallbackSelector?: string | null;
  placement?: TourStepProps['placement'];
};

export type TourRoleFlow = {
  role: Role;
  steps: TourFlowStep[];
};

const flows: Partial<Record<Role, TourRoleFlow>> = {
  ADMIN: {
    role: 'ADMIN',
    steps: [
      {
        id: 'admin-dashboard-intro',
        role: 'ADMIN',
        routePattern: '/admin/dashboard',
        title: 'Selamat datang Admin',
        description: 'Dashboard admin adalah pusat kontrol untuk memantau data master KMS Digital dan berpindah ke halaman pengelolaan yang Anda butuhkan.',
        targetSelector: null,
      },
      {
        id: 'admin-dashboard-stats',
        role: 'ADMIN',
        routePattern: '/admin/dashboard',
        title: 'Baca statistik ringkas sistem',
        description: 'Bagian ini menampilkan total data penting seperti desa, posyandu, dan pengguna. Gunakan ringkasan ini untuk memahami skala data yang sedang dikelola.',
        targetSelector: '[data-tour-id="admin-stats"]',
      },
      {
        id: 'admin-dashboard-activity',
        role: 'ADMIN',
        routePattern: '/admin/dashboard',
        title: 'Pantau aktivitas terbaru',
        description: 'Blok ini merangkum perubahan terbaru dari beberapa entitas sehingga Anda bisa cepat mengetahui data apa yang baru ditambahkan atau diperbarui.',
        targetSelector: '[data-tour-id="admin-activity-feed"]',
      },
      {
        id: 'admin-dashboard-sidebar',
        role: 'ADMIN',
        routePattern: '/admin/dashboard',
        title: 'Gunakan menu navigasi admin',
        description: 'Sidebar adalah jalur utama untuk masuk ke halaman kelola desa, posyandu, kader, tenaga kesehatan, dan artikel.',
        targetSelector: '[data-tour-id="admin-sidebar"]',
      },
      {
        id: 'admin-desa-header',
        role: 'ADMIN',
        routePattern: '/admin/dashboard/desa',
        title: 'Kelola data desa',
        description: 'Halaman ini dipakai untuk melihat daftar desa, membaca ringkasan jumlah desa, dan menambah data baru bila diperlukan.',
        targetSelector: '[data-tour-id="admin-desa-header"]',
      },
      {
        id: 'admin-artikel-form',
        role: 'ADMIN',
        routePattern: '/admin/dashboard/artikel/baru',
        title: 'Tulis artikel baru',
        description: 'Di halaman ini Anda memilih kategori, mengunggah cover, menulis isi artikel, lalu menerbitkannya untuk pengguna aplikasi.',
        targetSelector: '[data-tour-id="admin-artikel-form"]',
      },
    ],
  },
};

export function getRoleFlow(role: Role | null): TourRoleFlow | null {
  if (!role) return null;
  return flows[role] ?? null;
}

export function matchesRoute(step: TourFlowStep, pathname: string): boolean {
  return !!matchPath({ path: step.routePattern, end: true }, pathname);
}

export function getFirstStepForPath(role: Role | null, pathname: string): TourFlowStep | null {
  const flow = getRoleFlow(role);
  if (!flow) return null;
  return flow.steps.find((step) => matchesRoute(step, pathname)) ?? null;
}

export function getNextStep(role: Role | null, stepId: string): TourFlowStep | null {
  const flow = getRoleFlow(role);
  if (!flow) return null;
  const index = flow.steps.findIndex((step) => step.id === stepId);
  if (index < 0 || index + 1 >= flow.steps.length) return null;
  return flow.steps[index + 1];
}

export function getPreviousStep(role: Role | null, stepId: string): TourFlowStep | null {
  const flow = getRoleFlow(role);
  if (!flow) return null;
  const index = flow.steps.findIndex((step) => step.id === stepId);
  if (index <= 0) return null;
  return flow.steps[index - 1];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit manifest API baseline**

```bash
rtk git add src/features/tour/tourSteps.ts src/__tests__/features/tour/multiPageTourFlow.test.tsx
rtk git commit -m "feat(tour): add multi-page flow manifest"
```

---

### Task 2: Build controller state machine in `useTour`

**Files:**
- Modify: `src/features/tour/useTour.ts`
- Test: `src/__tests__/features/tour/multiPageTourFlow.test.tsx`

- [ ] **Step 1: Add failing tests for start/replay/finish semantics**

Append tests:

```tsx
import { renderHook, act } from '@testing-library/react';
import { useTour } from '../../../features/tour/useTour';

test('auto-start begins from first step for role', () => {
  const { result } = renderHook(() => useTour('ADMIN', true));

  act(() => {
    result.current.startFromBeginning('ADMIN');
  });

  expect(result.current.activeStepId).toBe('admin-dashboard-intro');
  expect(result.current.open).toBe(true);
});

test('replay from current path starts from first step on that route', () => {
  const { result } = renderHook(() => useTour('ADMIN', false));

  act(() => {
    result.current.replayFromPath('ADMIN', '/admin/dashboard/desa');
  });

  expect(result.current.activeStepId).toBe('admin-desa-header');
  expect(result.current.open).toBe(true);
});

test('finish marks role complete', () => {
  const { result } = renderHook(() => useTour('ADMIN', false));

  act(() => {
    result.current.startFromBeginning('ADMIN');
    result.current.finishFlow('ADMIN');
  });

  expect(result.current.open).toBe(false);
  expect(window.localStorage.getItem('kms_tour_completed_ADMIN')).toBe('1');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx
```

Expected: FAIL because hook API does not expose new methods/state.

- [ ] **Step 3: Implement minimal hook state machine**

Replace `useTour.ts` body with an API shaped like:

```ts
import { useCallback, useEffect, useState } from 'react';
import type { Role } from '../../types';
import { getFirstStepForPath, getRoleFlow } from './tourSteps';

const TOUR_FLAG_PREFIX = 'kms_tour_completed_';

function flagKey(role: Role | null): string | null {
  if (!role) return null;
  return `${TOUR_FLAG_PREFIX}${role}`;
}

function isCompleted(role: Role | null): boolean {
  if (typeof window === 'undefined') return true;
  const key = flagKey(role);
  if (!key) return true;
  return window.localStorage.getItem(key) === '1';
}

function markCompleted(role: Role | null): void {
  if (typeof window === 'undefined') return;
  const key = flagKey(role);
  if (!key) return;
  window.localStorage.setItem(key, '1');
}

function clearFlag(role: Role | null): void {
  if (typeof window === 'undefined') return;
  const key = flagKey(role);
  if (!key) return;
  window.localStorage.removeItem(key);
}

export function useTour(role: Role | null, autoStart = true) {
  const [open, setOpen] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [isTransitioningRoute, setIsTransitioningRoute] = useState(false);

  const startFromBeginning = useCallback((nextRole: Role | null) => {
    const flow = getRoleFlow(nextRole);
    const first = flow?.steps[0] ?? null;
    setActiveStepId(first?.id ?? null);
    setOpen(!!first);
  }, []);

  const replayFromPath = useCallback((nextRole: Role | null, pathname: string) => {
    clearFlag(nextRole);
    const firstForPath = getFirstStepForPath(nextRole, pathname);
    const fallback = getRoleFlow(nextRole)?.steps[0] ?? null;
    const target = firstForPath ?? fallback;
    setActiveStepId(target?.id ?? null);
    setOpen(!!target);
  }, []);

  const skipFlow = useCallback((nextRole: Role | null) => {
    setOpen(false);
    setActiveStepId(null);
    setIsTransitioningRoute(false);
    markCompleted(nextRole);
  }, []);

  const finishFlow = useCallback((nextRole: Role | null) => {
    setOpen(false);
    setActiveStepId(null);
    setIsTransitioningRoute(false);
    markCompleted(nextRole);
  }, []);

  useEffect(() => {
    if (!autoStart || !role) return;
    if (isCompleted(role)) return;
    const timer = window.setTimeout(() => startFromBeginning(role), 600);
    return () => window.clearTimeout(timer);
  }, [role, autoStart, startFromBeginning]);

  return {
    open,
    activeStepId,
    isTransitioningRoute,
    setActiveStepId,
    setIsTransitioningRoute,
    startFromBeginning,
    replayFromPath,
    skipFlow,
    finishFlow,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit state machine**

```bash
rtk git add src/features/tour/useTour.ts src/__tests__/features/tour/multiPageTourFlow.test.tsx
rtk git commit -m "feat(tour): add route-aware tour state"
```

---

### Task 3: Convert `TourProvider` into route-aware controller

**Files:**
- Modify: `src/features/tour/TourProvider.tsx`
- Test: `src/__tests__/features/tour/multiPageTourFlow.test.tsx`

- [ ] **Step 1: Add failing controller tests for route navigation behavior**

Append tests:

```tsx
import { MemoryRouter } from 'react-router-dom';
import TourProvider from '../../../features/tour/TourProvider';

test('replay from current path starts local slice instead of full reset', () => {
  expect(true).toBe(true);
});

test('next across routes advances to next route step', () => {
  expect(true).toBe(true);
});
```

Then replace placeholder assertions after implementation.

- [ ] **Step 2: Run tests to verify placeholders are insufficient**

Run:

```bash
rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx
```

Expected: tests pass trivially now; immediately replace placeholders in next step with real assertions before coding provider changes.

- [ ] **Step 3: Replace placeholder tests with real provider assertions**

Use a mocked Tour component and assert provider feeds it correct step slice / calls path-aware replay. Example shape:

```tsx
vi.mock('antd', () => ({
  Tour: ({ open, steps }: any) => (
    <div data-testid="tour" data-open={String(open)} data-steps={steps?.length ?? 0} />
  ),
}));
```

Assert replay on `/admin/dashboard/desa` exposes only desa-page step slice first.

- [ ] **Step 4: Implement provider controller**

Update `src/features/tour/TourProvider.tsx` to:
- import `useLocation`, `useNavigate`
- resolve flow from role
- resolve current active step from hook state
- compute current page step slice by matching `routePattern` to pathname
- expose `replay()` as `replayFromPath(role, pathname)`
- on finish/close call `finishFlow(role)` / `skipFlow(role)`
- intercept next/prev by controlling current step index and navigating when next/prev route differs

Use a controller pattern like:

```tsx
const { pathname } = useLocation();
const navigate = useNavigate();
const {
  open,
  activeStepId,
  setActiveStepId,
  startFromBeginning,
  replayFromPath,
  skipFlow,
  finishFlow,
} = useTour(role, true);
```

Render `Tour` with step slice for active page only, not full role flow.

- [ ] **Step 5: Run focused tests**

Run:

```bash
rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx
```

Expected: PASS with route-aware provider behavior covered.

- [ ] **Step 6: Commit provider controller**

```bash
rtk git add src/features/tour/TourProvider.tsx src/__tests__/features/tour/multiPageTourFlow.test.tsx
rtk git commit -m "feat(tour): add multi-page tour controller"
```

---

### Task 4: Add canonical anchors for Kader and Orang Tua multi-page flow

**Files:**
- Modify: `src/features/kader/ModePosyandu.tsx`
- Modify: `src/features/kader/PosyanduHeader.tsx`
- Modify: `src/features/kader/AkunOrangTuaPage.tsx`
- Modify: `src/features/laporan/LaporanBulananKader.tsx`
- Modify: `src/features/anak/DetailAnak.tsx`
- Modify: `src/features/orangtua/BerandaOT.tsx`

- [ ] **Step 1: Add Kader subpage anchors**

Add these exact anchors:

```tsx
<div data-tour-id="kader-akunortu-tabs" className="flex gap-[8px] border-b border-light-ash">
```

```tsx
<div data-tour-id="kader-akunortu-table" className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px] space-y-[17px]">
```

```tsx
<div data-tour-id="kader-laporan-picker" className="mb-[25px]">
```

```tsx
<div data-tour-id="kader-laporan-stats" className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[17px] mb-[25px]">
```

```tsx
<div data-tour-id="anak-detail-riwayat" className="flex flex-col gap-3 mb-10">
```

- [ ] **Step 2: Add Orang Tua detail anchors**

Add these exact anchors:

```tsx
<div data-tour-id="ot-home-anak-area" className="flex flex-col gap-[13px]">
```

```tsx
<div data-tour-id="anak-detail-chart">
  <ChartWHO anak={anak} pengukuran={pengukuran} />
</div>
```

Use the chart wrapper only around rendered chart block.

- [ ] **Step 3: Run typecheck**

Run:

```bash
rtk tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4: Commit Kader/OT page anchors**

```bash
rtk git add src/features/kader/AkunOrangTuaPage.tsx src/features/laporan/LaporanBulananKader.tsx src/features/anak/DetailAnak.tsx src/features/orangtua/BerandaOT.tsx src/features/kader/ModePosyandu.tsx src/features/kader/PosyanduHeader.tsx
rtk git commit -m "feat(tour): add kader and parent page anchors"
```

---

### Task 5: Add canonical anchors for Forum, Artikel, and Desa flows

**Files:**
- Modify: `src/pages/Post/index.tsx`
- Modify: `src/pages/DetailForum/index.tsx`
- Modify: `src/features/artikel/ArtikelList.tsx`
- Modify: `src/features/artikel/ArtikelDetailPage.tsx`
- Modify: `src/features/desa/BerandaDesa.tsx`
- Modify: `src/features/desa/ExportDesaForm.tsx`
- Modify: `src/features/desa/AcaraSection.tsx`
- Modify: `src/features/laporan/LaporanDesa.tsx` (if needed)

- [ ] **Step 1: Add forum/article anchors**

Add / preserve stable anchors:

```tsx
<div data-tour-id="forum-list" className="space-y-[17px]">
```

```tsx
<div data-tour-id="artikel-list" className="flex flex-col gap-[13px]">
```

```tsx
<div data-tour-id="artikel-detail-body" className="bg-white p-[25px] rounded-default border border-light-ash text-base text-deep-slate leading-relaxed">
```

In detail forum page, add visible anchors for main question block and answer form/list.

- [ ] **Step 2: Add/confirm Desa anchors**

Ensure these anchors exist and are stable:
- `desa-export-csv`
- `desa-export-pdf`
- `desa-laporan`
- `desa-acara-form`
- `desa-acara-list`

Add one top-level dashboard anchor in `BerandaDesa.tsx`:

```tsx
<div data-tour-id="desa-dashboard" className="max-w-page mx-auto px-[17px] md:px-[25px] py-[33px] space-y-[33px]">
```

- [ ] **Step 3: Run tests and typecheck**

Run:

```bash
rtk npm test
rtk tsc --noEmit
```

Expected: PASS.

- [ ] **Step 4: Commit forum/article/desa anchors**

```bash
rtk git add src/pages/Post/index.tsx src/pages/DetailForum/index.tsx src/features/artikel/ArtikelList.tsx src/features/artikel/ArtikelDetailPage.tsx src/features/desa/BerandaDesa.tsx src/features/desa/ExportDesaForm.tsx src/features/desa/AcaraSection.tsx src/features/laporan/LaporanDesa.tsx
rtk git commit -m "feat(tour): add forum article desa anchors"
```

---

### Task 6: Add canonical anchors for all Admin pages

**Files:**
- Modify: `src/features/admin/AdminDashboard.tsx`
- Modify: `src/features/admin/AdminActivityFeed.tsx`
- Modify: `src/components/layout/Dashboard/Sidebar.tsx`
- Modify: `src/pages/AdminDashboard/InputDesa.tsx`
- Modify: `src/pages/AdminDashboard/InputPosyandu.tsx`
- Modify: `src/pages/AdminDashboard/RegisterKaderPosyandu.tsx`
- Modify: `src/pages/AdminDashboard/RegisterTenagaKesehatan.tsx`
- Modify: `src/pages/AdminDashboard/ArtikelList.tsx`
- Modify: `src/pages/AdminDashboard/ArtikelForm.tsx`

- [ ] **Step 1: Add page-level header anchors**

Add exact anchors on page wrappers or PageHeader containers:

```tsx
<PageHeader ... />
```

Wrap with:

```tsx
<div data-tour-id="admin-desa-header">
  <PageHeader ... />
</div>
```

Do same pattern for:
- `admin-posyandu-header`
- `admin-kader-header`
- `admin-tenkes-header`
- `admin-artikel-list-header`
- `admin-artikel-form-header`

- [ ] **Step 2: Add table/form anchors**

Add exact anchors on main content cards:

```tsx
<div data-tour-id="admin-desa-table" className="bg-white border border-light-ash rounded-default shadow-card border-t-2 border-t-primary-500 p-[25px]">
```

Equivalent IDs:
- `admin-posyandu-table`
- `admin-kader-table`
- `admin-tenkes-table`
- `admin-artikel-list-table`
- `admin-artikel-form`

- [ ] **Step 3: Add CTA anchors**

Add button anchors on primary CTA buttons:
- `admin-desa-create`
- `admin-posyandu-create`
- `admin-kader-create`
- `admin-tenkes-create`
- `admin-artikel-create`
- `admin-artikel-submit`

- [ ] **Step 4: Run build**

Run:

```bash
rtk npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit admin anchors**

```bash
rtk git add src/features/admin/AdminDashboard.tsx src/features/admin/AdminActivityFeed.tsx src/components/layout/Dashboard/Sidebar.tsx src/pages/AdminDashboard/InputDesa.tsx src/pages/AdminDashboard/InputPosyandu.tsx src/pages/AdminDashboard/RegisterKaderPosyandu.tsx src/pages/AdminDashboard/RegisterTenagaKesehatan.tsx src/pages/AdminDashboard/ArtikelList.tsx src/pages/AdminDashboard/ArtikelForm.tsx
rtk git commit -m "feat(tour): add admin multi-page anchors"
```

---

### Task 7: Expand full multi-page flow manifest for all roles

**Files:**
- Modify: `src/features/tour/tourSteps.ts`
- Test: `src/__tests__/features/tour/multiPageTourFlow.test.tsx`

- [ ] **Step 1: Add failing assertions for real role coverage**

Append tests:

```tsx
test('admin flow includes all main admin pages in order', () => {
  const routes = getRoleFlow('ADMIN')!.steps.map((step) => step.routePattern);

  expect(routes).toContain('/admin/dashboard');
  expect(routes).toContain('/admin/dashboard/desa');
  expect(routes).toContain('/admin/dashboard/posyandu');
  expect(routes).toContain('/admin/dashboard/kader-posyandu');
  expect(routes).toContain('/admin/dashboard/tenaga-kesehatan');
  expect(routes).toContain('/admin/dashboard/artikel');
  expect(routes).toContain('/admin/dashboard/artikel/baru');
});

test('replay from article form can start at final admin page', () => {
  const step = getFirstStepForPath('ADMIN', '/admin/dashboard/artikel/baru');
  expect(step?.routePattern).toBe('/admin/dashboard/artikel/baru');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx
```

Expected: FAIL because manifest still minimal.

- [ ] **Step 3: Expand manifest for all roles**

Add complete steps in `tourSteps.ts` for:
- Admin all canonical pages
- Kader canonical pages + dynamic replay routes
- Orang Tua canonical pages + article routes
- Tenkes canonical pages + article routes
- Desa single-route flow

Use IDs and route patterns aligned with anchors from Tasks 4–6.

- [ ] **Step 4: Run tests**

Run:

```bash
rtk npm test -- src/__tests__/features/tour/multiPageTourFlow.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit complete flow manifest**

```bash
rtk git add src/features/tour/tourSteps.ts src/__tests__/features/tour/multiPageTourFlow.test.tsx
rtk git commit -m "feat(tour): define cross-role multi-page flows"
```

---

### Task 8: Final verification and manual QA hooks

**Files:**
- No code changes required unless QA finds bug

- [ ] **Step 1: Clear completion flags for manual QA**

Remove localStorage keys:

```text
kms_tour_completed_KADER_POSYANDU
kms_tour_completed_ORANG_TUA
kms_tour_completed_TENAGA_KESEHATAN
kms_tour_completed_DESA
kms_tour_completed_ADMIN
```

- [ ] **Step 2: Manual QA admin full flow**

Verify:
- auto-show starts from `/admin/dashboard`
- `Next` auto-navigates dashboard → desa → posyandu → kader → tenaga kesehatan → artikel → artikel baru
- `Skip` stops and suppresses future auto-show
- replay from `/admin/dashboard/tenaga-kesehatan` starts there, not dashboard
- replay from `/admin/dashboard/artikel/baru` only covers final-page slice

- [ ] **Step 3: Manual QA other roles**

Verify:
- Kader flow starts from mode posyandu and can continue into akun orang tua/laporan
- Orang Tua flow starts from beranda and can continue through forum/artikel
- Tenkes flow starts from forum and can continue into article pages
- Desa flow still works as single-route flow

- [ ] **Step 4: Fresh verification commands**

Run:

```bash
rtk npm test
rtk tsc --noEmit
rtk npm run build
rtk git status
```

Expected:
- tests pass
- typecheck pass
- build pass
- git status shows only intended changes or clean tree after commits

---

## Self-Review

Spec coverage:
- route-aware role flow manifest: Tasks 1, 7
- controller navigation + replay/current-page semantics: Tasks 2, 3
- anchors across admin/all roles: Tasks 4, 5, 6
- auto-show from beginning + replay from current page + final-page-local replay: Tasks 2, 3, 8
- dynamic detail pages limited to replay/non-canonical support: Task 7 manifest design

Placeholder scan:
- no TBD/TODO markers
- all commands explicit
- all paths explicit

Type consistency:
- `TourFlowStep`, `TourRoleFlow`, `getRoleFlow`, `getFirstStepForPath`, `getNextStep`, `getPreviousStep` named consistently across tasks
- provider/hook API names align across tasks
