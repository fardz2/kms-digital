# Onboarding Tour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah quick onboarding tour per role (Kader, Orang Tua, Tenkes, Desa, Admin) yang auto-show saat user pertama kali login dan bisa di-replay via tombol "Bantuan" di Navbar.

**Architecture:** Pakai antd v6 `<Tour>` component (built-in, no extra dep). Step config per role di `tourSteps.ts`. State management lewat localStorage flag `kms_tour_completed_<role>`. `TourProvider` wrap aplikasi di App.tsx — Tour render once di root, step build dari role aktif. Element target identified via `data-tour-id` attribute (no ref lifting).

**Tech Stack:** antd v6 `<Tour>`, localStorage, React Context.

**Spec:** Inline. Trigger: auto first-login + manual replay. Skip-able. Per-role steps 3-5 element kunci.

---

## File Scope

### Create
- `src/features/tour/tourSteps.ts` — config step per role (Kader/OT/Tenkes/Desa/Admin)
- `src/features/tour/useTour.ts` — hook manage open/close + localStorage flag
- `src/features/tour/TourProvider.tsx` — context wrapper + render `<Tour>` antd

### Modify
- `src/App.tsx` — wrap `<AppRoutes>` dengan `<TourProvider>`
- `src/features/kader/ModePosyandu.tsx` — tambah `data-tour-id` di search, filter, tambah balita
- `src/features/kader/PosyanduHeader.tsx` — tambah `data-tour-id` di Akun Orang Tua button
- `src/features/orangtua/BerandaOT.tsx` — tambah `data-tour-id` di Tambah Anak, Forum, Artikel
- `src/features/desa/AcaraSection.tsx` — tambah `data-tour-id` di section acara
- `src/features/admin/AdminDashboard.tsx` — tambah `data-tour-id` di stats grid
- `src/components/layout/Dashboard/Sidebar.tsx` — tambah `data-tour-id` di sidebar
- `src/components/layout/Navbar/index.tsx` — tambah tombol "Bantuan" yang panggil `replay()` dari context

### Test
- Build pass setiap task
- Manual visual: login per role → tour muncul, klik next/skip, completed flag tersimpan

---

## Testing Strategy

- Tidak ada unit test baru (Tour antd punya built-in test).
- Build (`npx vite build`) wajib pass per task.
- Type check (`npx tsc --noEmit`) wajib zero error per task.
- Manual QA: login 5 role di browser, verify tour show + skip + replay.

---

## Task 1: Create tourSteps config

**Files:** `src/features/tour/tourSteps.ts` (NEW)

- [ ] **Step 1: Create directory + tourSteps.ts**

```bash
New-Item -ItemType Directory -Path "src/features/tour" -Force
```

Buat `src/features/tour/tourSteps.ts`:

```ts
import type { TourStepProps } from 'antd';
import type { Role } from '../../types';

const stepWithSelector = (
  targetSelector: string | null,
  step: Omit<TourStepProps, 'target'>
): TourStepProps => ({
  ...step,
  target: targetSelector
    ? () => document.querySelector(targetSelector) as HTMLElement | null
    : null,
});

export function buildSteps(role: Role | null): TourStepProps[] {
  if (!role) return [];

  switch (role) {
    case 'KADER_POSYANDU':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang di Mode Posyandu',
          description:
            'Halaman ini membantu Anda mencatat pengukuran balita dengan cepat saat hari posyandu. Mari kita lihat fitur utamanya.',
        }),
        stepWithSelector('[data-tour-id="kader-search"]', {
          title: 'Cari Balita',
          description: 'Ketik nama balita untuk filter daftar dengan cepat.',
        }),
        stepWithSelector('[data-tour-id="kader-filter"]', {
          title: 'Filter Status',
          description:
            'Pilih "Belum" untuk lihat balita yang belum diukur, atau "Perhatian" untuk yang butuh tindakan.',
        }),
        stepWithSelector('[data-tour-id="kader-akun-ortu"]', {
          title: 'Akun Orang Tua',
          description:
            'Setujui pendaftaran orang tua dan kelola data akun di sini. Badge angka menunjukkan jumlah yang menunggu persetujuan.',
        }),
        stepWithSelector('[data-tour-id="kader-tambah"]', {
          title: 'Tambah Balita Baru',
          description: 'Klik untuk daftarkan balita baru yang belum ada di sistem.',
        }),
      ];

    case 'ORANG_TUA':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Orang Tua',
          description:
            'Pantau pertumbuhan anak Anda dan ajukan pertanyaan ke tenaga kesehatan dari aplikasi ini.',
        }),
        stepWithSelector('[data-tour-id="ot-tambah-anak"]', {
          title: 'Tambah Anak',
          description: 'Daftarkan anak Anda di sini agar bisa dipantau pertumbuhannya.',
        }),
        stepWithSelector('[data-tour-id="ot-forum"]', {
          title: 'Forum Tanya Jawab',
          description:
            'Tanyakan apa pun tentang gizi atau tumbuh kembang anak ke tenaga kesehatan.',
        }),
        stepWithSelector('[data-tour-id="ot-artikel"]', {
          title: 'Artikel Edukasi',
          description: 'Baca artikel pilihan tentang gizi dan pengasuhan balita.',
        }),
      ];

    case 'TENAGA_KESEHATAN':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Tenaga Kesehatan',
          description:
            'Halaman forum berisi pertanyaan dari orang tua. Anda bisa menjawab dan memberi saran kesehatan.',
        }),
      ];

    case 'DESA':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Pemerintah Desa',
          description:
            'Pantau rekap gizi balita se-desa, ekspor laporan, dan kelola acara posyandu.',
        }),
        stepWithSelector('[data-tour-id="desa-acara"]', {
          title: 'Kelola Acara',
          description:
            'Buat pengingat acara posyandu yang akan disebar ke kader dan orang tua.',
        }),
      ];

    case 'ADMIN':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Admin',
          description:
            'Dashboard admin untuk kelola data master desa, posyandu, kader, tenaga kesehatan, dan artikel.',
        }),
        stepWithSelector('[data-tour-id="admin-stats"]', {
          title: 'Statistik Ringkas',
          description:
            'Pantau total desa, posyandu, dan pengguna terdaftar. Klik card untuk masuk ke daftarnya.',
        }),
        stepWithSelector('[data-tour-id="admin-sidebar"]', {
          title: 'Menu Navigasi',
          description:
            'Sidebar berisi shortcut ke semua data master.',
        }),
      ];

    default:
      return [];
  }
}
```

- [ ] **Step 2: Verify TS**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tour/tourSteps.ts
git commit -m "feat(tour): add per-role tour step configs"
```

---

## Task 2: Create useTour hook

**Files:** `src/features/tour/useTour.ts` (NEW)

- [ ] **Step 1: Implement hook**

```ts
import { useCallback, useEffect, useState } from 'react';
import type { Role } from '../../types';

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

  useEffect(() => {
    if (!autoStart || !role) return;
    if (isCompleted(role)) return;
    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, [role, autoStart]);

  const close = useCallback(() => {
    setOpen(false);
    markCompleted(role);
  }, [role]);

  const replay = useCallback(() => {
    clearFlag(role);
    setOpen(true);
  }, [role]);

  return { open, close, replay };
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tour/useTour.ts
git commit -m "feat(tour): add useTour hook with localStorage flag per role"
```

---

## Task 3: Create TourProvider

**Files:** `src/features/tour/TourProvider.tsx` (NEW)

- [ ] **Step 1: Implement provider + context**

```tsx
import React, { createContext, useContext, useMemo } from 'react';
import { Tour } from 'antd';
import { useSession } from '../auth/useSession';
import { buildSteps } from './tourSteps';
import { useTour } from './useTour';

interface TourContextValue {
  replay: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTourContext(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return ctx;
}

export default function TourProvider({ children }: { children: React.ReactNode }) {
  const { role } = useSession();
  const { open, close, replay } = useTour(role, true);

  const steps = useMemo(() => buildSteps(role), [role]);

  const value = useMemo<TourContextValue>(() => ({ replay }), [replay]);

  return (
    <TourContext.Provider value={value}>
      {children}
      {steps.length > 0 && (
        <Tour
          open={open}
          onClose={close}
          onFinish={close}
          steps={steps}
          mask
          type="primary"
        />
      )}
    </TourContext.Provider>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tour/TourProvider.tsx
git commit -m "feat(tour): add TourProvider with antd Tour + context for replay"
```

---

## Task 4: Wrap App with TourProvider

**Files:** `src/App.tsx`

- [ ] **Step 1: Modify App.tsx**

Tambah import `TourProvider` dan wrap `<AppRoutes>`:

```tsx
import TourProvider from './features/tour/TourProvider';

// Inside App() return:
<BrowserRouter>
  <TourProvider>
    <AppRoutes />
  </TourProvider>
</BrowserRouter>
```

- [ ] **Step 2: Verify build**

```bash
npx vite build
```

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(tour): wrap AppRoutes with TourProvider"
```

---

## Task 5: Add data-tour-id markers di Kader pages

**Files:** `src/features/kader/ModePosyandu.tsx`, `src/features/kader/PosyanduHeader.tsx`

- [ ] **Step 1: ModePosyandu.tsx — search + filter + tambah**

Tambah `data-tour-id="kader-search"` di div pembungkus search input.

Tambah `data-tour-id="kader-filter"` di wrapper FilterChip.

Tambah `data-tour-id="kader-tambah"` di Button "Tambah Balita Baru".

- [ ] **Step 2: PosyanduHeader.tsx — Akun Orang Tua**

Tambah `data-tour-id="kader-akun-ortu"` di Button "Akun Orang Tua".

- [ ] **Step 3: Verify**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/features/kader/ModePosyandu.tsx src/features/kader/PosyanduHeader.tsx
git commit -m "feat(tour): add data-tour-id markers in Kader pages"
```

---

## Task 6: Add data-tour-id markers di Orang Tua + Desa + Admin

**Files:** `src/features/orangtua/BerandaOT.tsx`, `src/features/desa/AcaraSection.tsx`, `src/features/admin/AdminDashboard.tsx`, `src/components/layout/Dashboard/Sidebar.tsx`

- [ ] **Step 1: BerandaOT.tsx**

Tambah `data-tour-id="ot-tambah-anak"` di Button "Tambah Anak".
Wrap QuickLink Forum dengan `<div data-tour-id="ot-forum">`.
Wrap QuickLink Artikel dengan `<div data-tour-id="ot-artikel">`.

- [ ] **Step 2: AcaraSection.tsx**

Tambah `data-tour-id="desa-acara"` di `<section>` element pembungkus.

- [ ] **Step 3: AdminDashboard.tsx**

Wrap `<AdminStatsGrid>` dengan `<div data-tour-id="admin-stats">`.

- [ ] **Step 4: Sidebar.tsx**

Tambah `data-tour-id="admin-sidebar"` di `<aside>` element.

- [ ] **Step 5: Verify**

```bash
npx vite build
```

- [ ] **Step 6: Commit**

```bash
git add src/features/orangtua/BerandaOT.tsx src/features/desa/AcaraSection.tsx src/features/admin/AdminDashboard.tsx src/components/layout/Dashboard/Sidebar.tsx
git commit -m "feat(tour): add data-tour-id markers in OT, Desa, Admin pages"
```

---

## Task 7: Add Bantuan replay button di Navbar

**Files:** `src/components/layout/Navbar/index.tsx`

- [ ] **Step 1: Import + button**

Buka Navbar. Tambah import:

```tsx
import { HelpCircle } from 'lucide-react';
import { useTourContext } from '../../../features/tour/TourProvider';
```

Di dalam `NavbarComp` (setelah `const user = useAuth();` atau equivalent), panggil:

```tsx
const { replay } = useTourContext();
```

Kemudian, di area profile dropdown desktop (atau dekat tombol Keluar), tambah icon button:

```tsx
<button
  type="button"
  onClick={replay}
  aria-label="Bantuan"
  title="Lihat tutorial lagi"
  className="hidden md:flex items-center justify-center w-[36px] h-[36px] rounded-full text-graphite hover:text-deep-slate hover:bg-faint-fog transition-colors"
>
  <HelpCircle size={18} strokeWidth={1.75} />
</button>
```

- [ ] **Step 2: Sidebar admin replay (optional)**

Untuk role admin yang pakai Sidebar (bukan Navbar), tambah replay button di Sidebar bottom area juga. Pattern sama.

- [ ] **Step 3: Verify**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar/index.tsx
git commit -m "feat(tour): add Bantuan replay button in Navbar"
```

---

## Task 8: Verification sweep

- [ ] **Step 1: Build + test + type check**

```bash
npx vite build
npx vitest run
npx tsc --noEmit
```

Expected: build success, 81 test pass, zero TS error.

- [ ] **Step 2: Verify no orphan imports**

```bash
findstr /S /N /C:"useTourContext" src
```

Expected: minimal 1 di TourProvider, 1 di Navbar.

- [ ] **Step 3: Manual QA**

Login per role:
- Kader: tour 5 step muncul. Klik next sampai habis, atau Skip. Refresh — tour tidak muncul lagi.
- Klik tombol "Bantuan" di Navbar → tour muncul lagi.
- Test 5 role.

- [ ] **Step 4: Push branch**

```bash
git push
```

- [ ] **Step 5: Tidak commit apa pun di Task 8**

Sweep saja.

---

## Plan Acceptance

- ✅ `src/features/tour/` directory dengan tourSteps, useTour, TourProvider
- ✅ App.tsx wrap dengan TourProvider
- ✅ 5 role punya tour step config
- ✅ data-tour-id marker di 4 page utama (Kader, OT, Desa, Admin)
- ✅ Tombol "Bantuan" di Navbar untuk replay
- ✅ localStorage flag `kms_tour_completed_<role>` per role
- ✅ Auto-show first login, mark completed setelah skip/finish
- ✅ Build pass, 81 test pass, zero TS error

---

## Risk

- **Tour target null** kalau user navigasi ke page non-target sebelum tour selesai. antd Tour handle ini gracefully (skip step), tidak crash.
- **localStorage cleared** akan trigger auto-show lagi. Acceptable (cookie consent / private browsing context).
- **Tooltip overflow** kalau target near edge viewport. antd Tour auto-flip placement.

---

## Next

Setelah merged:
- Manual QA per role
- Optional: tour panjang untuk page dalam (DetailAnak, PengukuranForm) di Phase 7
- Tracking analytics: berapa user skip vs complete (butuh backend endpoint)
