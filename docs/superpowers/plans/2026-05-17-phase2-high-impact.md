# Phase 2 High-Impact Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 high-impact issues dari audit comprehensive: route code splitting, Error Boundary global, XSS sanitize, Modal.confirm refactor antd v6, Card a11y.

**Architecture:** Setup global error infrastructure (ErrorBoundary), security hardening (DOMPurify), performance via code splitting (lazy routes), antd v6 migration (App.useApp pattern), accessibility (semantic button).

**Tech Stack:** Vite 8, React 19, antd v6, TanStack Query, TypeScript 5, DOMPurify (new dep).

**Audit reference:** `docs/superpowers/audits/2026-05-17-comprehensive.md` Phase 2 high-impact

---

## File Scope

### Create
- `src/components/ErrorBoundary.tsx` — global error boundary class component
- `src/hooks/useConfirmDialog.ts` — wrapper for `App.useApp().modal.confirm()`
- `src/utilities/sanitize.ts` — DOMPurify wrapper

### Modify
- `src/App.tsx` — wrap dengan ErrorBoundary
- `src/routes/AppRoutes.tsx` — convert page imports ke `lazy()`, wrap dengan Suspense
- `src/features/artikel/ArtikelDetailPage.tsx` — pakai `sanitize()` sebelum innerHTML
- `src/features/anak/DetailAnak.tsx` — `Modal.confirm` → `useConfirmDialog`
- `src/features/desa/AcaraSection.tsx` — sda
- `src/features/kader/AkunOrangTuaPage.tsx` — sda
- `src/features/kader/ModePosyandu.tsx` — sda
- `src/features/kader/PendingApprovalSection.tsx` — sda
- `src/components/layout/AppShell.tsx` — sda (deprecated tapi masih dipakai)
- `src/components/layout/Dashboard/Sidebar.tsx` — sda
- `src/pages/AdminDashboard/InputDesa.tsx` — sda
- `src/pages/AdminDashboard/InputPosyandu.tsx` — sda
- `src/pages/AdminDashboard/ArtikelList.tsx` — sda
- `src/components/ui/Card.tsx` — proper button semantic untuk interactive card

### Test
- `src/__tests__/utilities/sanitize.test.ts` — verify DOMPurify strips script

---

## Testing Strategy

- Existing 76 unit test harus tetap pass
- Tambah 3-5 unit test baru untuk `sanitize()` utility
- Build (`npx vite build`) wajib pass per task
- Type check (`npx tsc --noEmit`) wajib zero error per task
- Bundle target: main < 350 KB gzip setelah code splitting

---

## Task 1: Buat sanitize utility

**Files:** `src/utilities/sanitize.ts` (NEW), `src/__tests__/utilities/sanitize.test.ts` (NEW)

- [ ] **Step 1: Install DOMPurify**

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

- [ ] **Step 2: Buat sanitize utility**

```ts
// src/utilities/sanitize.ts
import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'b', 'i',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'span', 'div',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'src', 'alt', 'title',
  'class', 'style',
];

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
```

- [ ] **Step 3: Buat test**

```ts
// src/__tests__/utilities/sanitize.test.ts
import { describe, test, expect } from 'vitest';
import { sanitizeHtml } from '../../utilities/sanitize';

describe('sanitizeHtml', () => {
  test('strips script tag', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('<p>Hello</p>');
  });

  test('strips onerror attribute', () => {
    const dirty = '<img src="x" onerror="alert(1)" />';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('onerror');
  });

  test('preserves allowed tags', () => {
    const dirty = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('<strong>');
    expect(clean).toContain('<em>');
  });

  test('preserves anchor with href', () => {
    const dirty = '<a href="https://example.com">link</a>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toContain('href="https://example.com"');
  });

  test('handles null/undefined safely', () => {
    expect(sanitizeHtml('')).toEqual('');
    expect(sanitizeHtml(null as any)).toEqual('');
    expect(sanitizeHtml(undefined as any)).toEqual('');
  });
});
```

- [ ] **Step 4: Run test**

```bash
npx vitest run src/__tests__/utilities
```

Expected: 5 test pass.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/utilities/sanitize.ts src/__tests__/utilities/sanitize.test.ts
git commit -m "feat(security): add DOMPurify-based sanitize utility with tests"
```

---

## Task 2: Apply sanitize di ArtikelDetailPage

**Files:** `src/features/artikel/ArtikelDetailPage.tsx`

- [ ] **Step 1: Import + apply sanitize**

Buka `src/features/artikel/ArtikelDetailPage.tsx`. Cari baris dengan `dangerouslySetInnerHTML={{ __html: content }}` (sekitar line 41). Replace:

```tsx
dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
```

Tambah import di header:
```tsx
import { sanitizeHtml } from '../../utilities/sanitize';
```

- [ ] **Step 2: Build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/features/artikel/ArtikelDetailPage.tsx
git commit -m "fix(security): sanitize artikel HTML content via DOMPurify"
```

---

## Task 3: Buat ErrorBoundary component

**Files:** `src/components/ErrorBoundary.tsx` (NEW)

- [ ] **Step 1: Buat ErrorBoundary**

```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';
import Button from './ui/Button';

interface State {
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  reload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-faint-fog px-[17px]">
          <div className="max-w-[480px] w-full bg-white border border-light-ash rounded-default shadow-card p-[33px] text-center">
            <p className="text-caption font-bold uppercase tracking-[0.14em] text-danger mb-[13px]">
              Aplikasi Bermasalah
            </p>
            <h1 className="text-display font-bold text-deep-slate leading-tight mb-[17px]">
              Terjadi Kesalahan
            </h1>
            <p className="text-body-sm text-graphite mb-[25px]">
              Sesuatu yang tidak terduga terjadi. Silakan coba muat ulang halaman.
              Jika masalah berlanjut, hubungi admin.
            </p>
            {import.meta.env.DEV && this.state.error?.message && (
              <pre className="text-caption text-danger bg-faint-fog p-[13px] rounded mb-[17px] overflow-auto text-left">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-[13px] justify-center">
              <Button variant="default" size="md" onClick={this.reset}>
                Coba Lagi
              </Button>
              <Button variant="primary" size="md" onClick={this.reload}>
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Wrap App dengan ErrorBoundary**

Edit `src/App.tsx`. Replace seluruh return:

```tsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import idID from 'antd/locale/id_ID';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

const theme = {
  token: {
    colorPrimary: '#FF7070',
    fontFamily: 'Sen, Inter, system-ui, sans-serif',
    borderRadius: 8,
  },
};

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider theme={theme} locale={idID}>
          <AntApp>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 3: Build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ErrorBoundary.tsx src/App.tsx
git commit -m "feat(reliability): add global ErrorBoundary with reset/reload UI"
```

---

## Task 4: Buat useConfirmDialog hook

**Files:** `src/hooks/useConfirmDialog.ts` (NEW)

- [ ] **Step 1: Buat directory + file**

```bash
New-Item -ItemType Directory -Path "src/hooks" -Force
```

- [ ] **Step 2: Implement hook**

```ts
// src/hooks/useConfirmDialog.ts
import { App } from 'antd';
import type { ReactNode } from 'react';

interface ConfirmOptions {
  title: ReactNode;
  content?: ReactNode;
  icon?: ReactNode;
  okText?: string;
  cancelText?: string;
  okButtonProps?: { danger?: boolean };
  onOk: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirmDialog() {
  const { modal } = App.useApp();

  return (options: ConfirmOptions) => {
    modal.confirm({
      title: options.title,
      content: options.content,
      icon: options.icon,
      okText: options.okText ?? 'Ya',
      cancelText: options.cancelText ?? 'Batal',
      okButtonProps: options.okButtonProps,
      onOk: options.onOk,
      onCancel: options.onCancel,
    });
  };
}
```

- [ ] **Step 3: Build check**

```bash
npx vite build
```

Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useConfirmDialog.ts
git commit -m "feat(antd): add useConfirmDialog hook (App.useApp pattern for v6)"
```

---

## Task 5: Migrate Modal.confirm di AkunOrangTuaPage

**Files:** `src/features/kader/AkunOrangTuaPage.tsx`

- [ ] **Step 1: Replace Modal.confirm dengan hook**

Buka file. Replace import:
```tsx
import { Modal as AntModal, message } from 'antd';
```
dengan:
```tsx
import { message } from 'antd';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
```

Di dalam component, tambah:
```tsx
const confirm = useConfirmDialog();
```

Cari `AntModal.confirm({ ... })` (sekitar line 58). Replace dengan:
```tsx
confirm({
  title: 'Hapus orang tua?',
  icon: <AlertTriangle size={20} className="text-danger" />,
  content: `${record.nama} akan dihapus dari daftar.`,
  okText: 'Ya, Hapus',
  cancelText: 'Batal',
  okButtonProps: { danger: true },
  onOk: () =>
    deleteMutation.mutate(record.id, {
      onSuccess: () => messageApi.success('Orang tua berhasil dihapus'),
      onError: (err) =>
        messageApi.error(err?.message ?? 'Gagal menghapus orang tua'),
    }),
});
```

- [ ] **Step 2: Build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kader/AkunOrangTuaPage.tsx
git commit -m "refactor(kader): use useConfirmDialog hook in AkunOrangTuaPage"
```

---

## Task 6: Migrate Modal.confirm di ModePosyandu

**Files:** `src/features/kader/ModePosyandu.tsx`

- [ ] **Step 1: Replace pattern**

Apply pattern yang sama dengan Task 5:

1. Replace import `import { Modal } from 'antd';` dengan import yang dibutuhkan plus useConfirmDialog
2. Tambah `const confirm = useConfirmDialog();` di dalam component
3. Replace `Modal.confirm({ ... })` (line 73) dengan `confirm({ ... })`

Detail modal di line 73 adalah konfirmasi logout.

- [ ] **Step 2: Build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kader/ModePosyandu.tsx
git commit -m "refactor(kader): use useConfirmDialog hook in ModePosyandu logout"
```

---

## Task 7: Migrate Modal.confirm di PendingApprovalSection

**Files:** `src/features/kader/PendingApprovalSection.tsx`

- [ ] **Step 1: Apply pattern**

Replace `AntModal.confirm` (line 19) dengan `confirm()` dari `useConfirmDialog()`. Pattern sama dengan Task 5-6.

- [ ] **Step 2: Build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kader/PendingApprovalSection.tsx
git commit -m "refactor(kader): use useConfirmDialog hook in PendingApprovalSection"
```

---

## Task 8: Migrate Modal.confirm di AcaraSection + DetailAnak

**Files:** `src/features/desa/AcaraSection.tsx`, `src/features/anak/DetailAnak.tsx`

- [ ] **Step 1: AcaraSection.tsx**

Replace `AntModal.confirm` (line 43) dengan `confirm()`.

- [ ] **Step 2: DetailAnak.tsx**

Replace `AntModal.confirm` (line 46) dengan `confirm()`.

- [ ] **Step 3: Build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/features/desa/AcaraSection.tsx src/features/anak/DetailAnak.tsx
git commit -m "refactor(antd): use useConfirmDialog in AcaraSection + DetailAnak"
```

---

## Task 9: Migrate Modal.confirm di layout components

**Files:** `src/components/layout/AppShell.tsx`, `src/components/layout/Dashboard/Sidebar.tsx`

- [ ] **Step 1: AppShell.tsx**

Replace `Modal.confirm` (line 13, logout dialog) dengan pattern `confirm()`.

- [ ] **Step 2: Sidebar.tsx**

Replace `Modal.confirm` (line 28, logout dialog) dengan pattern `confirm()`.

- [ ] **Step 3: Build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/AppShell.tsx src/components/layout/Dashboard/Sidebar.tsx
git commit -m "refactor(layout): use useConfirmDialog in AppShell + Sidebar logout"
```

---

## Task 10: Migrate Modal.confirm di admin pages

**Files:** `src/pages/AdminDashboard/InputDesa.tsx`, `src/pages/AdminDashboard/InputPosyandu.tsx`, `src/pages/AdminDashboard/ArtikelList.tsx`

- [ ] **Step 1: InputDesa.tsx**

Replace `Modal.confirm` (line 64) dengan `confirm()`. Hapus juga import `Modal` dari `antd` kalau tidak dipakai lagi (cek manual).

- [ ] **Step 2: InputPosyandu.tsx**

Replace `Modal.confirm` (line 105). Sama dengan Task 9.

- [ ] **Step 3: ArtikelList.tsx**

Replace `Modal.confirm` (line 101). Sama dengan Task 9.

- [ ] **Step 4: Build + test**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminDashboard/InputDesa.tsx src/pages/AdminDashboard/InputPosyandu.tsx src/pages/AdminDashboard/ArtikelList.tsx
git commit -m "refactor(admin): use useConfirmDialog in InputDesa/InputPosyandu/ArtikelList"
```

---

## Task 11: Code splitting di AppRoutes

**Files:** `src/routes/AppRoutes.tsx`

- [ ] **Step 1: Replace eager imports dengan lazy**

Edit `src/routes/AppRoutes.tsx`. Replace seluruh imports section dengan lazy versions:

```tsx
// @ts-nocheck
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireRole from './RequireRole';
import { LEGACY_REDIRECTS } from './legacyRedirects';

// Eager: critical for initial render
import LoginPortal from '../features/auth/LoginPortal';
import LandingPage from '../pages/LandingPage';
import NotFound from '../pages/NotFound';

// Lazy: per-role feature pages
const ModePosyandu = lazy(() => import('../features/kader/ModePosyandu'));
const AkunOrangTuaPage = lazy(() => import('../features/kader/AkunOrangTuaPage'));
const DetailAnak = lazy(() => import('../features/anak/DetailAnak'));
const BerandaOT = lazy(() => import('../features/orangtua/BerandaOT'));
const ArtikelPublic = lazy(() => import('../features/artikel/ArtikelList'));
const ArtikelDetailPage = lazy(() => import('../features/artikel/ArtikelDetailPage'));
const LaporanBulananKader = lazy(() => import('../features/laporan/LaporanBulananKader'));
const BerandaDesa = lazy(() => import('../features/desa/BerandaDesa'));
const SignUp = lazy(() => import('../pages/SignUp'));
const Post = lazy(() => import('../pages/Post'));
const DetailForum = lazy(() => import('../pages/DetailForum'));

// Admin pages
const DashboardLayout = lazy(() => import('../components/layout/Dashboard/DashboardLayout'));
const DesaPage = lazy(() => import('../pages/AdminDashboard/InputDesa'));
const InputPosyandu = lazy(() => import('../pages/AdminDashboard/InputPosyandu'));
const RegisterKaderPosyandu = lazy(() => import('../pages/AdminDashboard/RegisterKaderPosyandu'));
const RegisterTenkes = lazy(() => import('../pages/AdminDashboard/RegisterTenagaKesehatan'));
const ArtikelList = lazy(() => import('../pages/AdminDashboard/ArtikelList'));
const ArtikelForm = lazy(() => import('../pages/AdminDashboard/ArtikelForm'));
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-faint-fog">
      <div className="text-body-sm text-graphite">Memuat halaman...</div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/masuk" element={<LoginPortal />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Legacy redirects */}
        {LEGACY_REDIRECTS.map(({ from, to }) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}

        {/* Role: Kader Posyandu */}
        <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
          <Route path="/kader/balita" element={<ModePosyandu />} />
          <Route path="/kader/balita/:id" element={<DetailAnak />} />
          <Route path="/kader/orangtua" element={<AkunOrangTuaPage />} />
          <Route path="/kader/laporan" element={<LaporanBulananKader />} />
        </Route>

        {/* Role: Orang Tua */}
        <Route element={<RequireRole allow={['ORANG_TUA']} />}>
          <Route path="/orangtua/balita" element={<BerandaOT />} />
          <Route path="/orangtua/forum" element={<Post />} />
          <Route path="/orangtua/forum/:id" element={<DetailForum />} />
          <Route path="/orangtua/balita/:id" element={<DetailAnak />} />
        </Route>

        {/* Role: Desa */}
        <Route element={<RequireRole allow={['DESA']} />}>
          <Route path="/desa/beranda" element={<BerandaDesa />} />
        </Route>

        {/* Role: Admin */}
        <Route element={<RequireRole allow={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="desa" element={<DesaPage />} />
            <Route path="posyandu" element={<InputPosyandu />} />
            <Route path="kader-posyandu" element={<RegisterKaderPosyandu />} />
            <Route path="tenaga-kesehatan" element={<RegisterTenkes />} />
            <Route path="artikel" element={<ArtikelList />} />
            <Route path="artikel/baru" element={<ArtikelForm />} />
          </Route>
        </Route>

        {/* Role: Tenaga Kesehatan */}
        <Route element={<RequireRole allow={['TENAGA_KESEHATAN']} />}>
          <Route path="/tenkes/forum" element={<Post />} />
          <Route path="/tenkes/balita/:id" element={<DetailForum />} />
        </Route>

        {/* Artikel public */}
        <Route
          element={
            <RequireRole
              allow={['ORANG_TUA', 'KADER_POSYANDU', 'TENAGA_KESEHATAN', 'DESA', 'ADMIN']}
            />
          }
        >
          <Route path="/artikel" element={<ArtikelPublic />} />
          <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
```

- [ ] **Step 2: Build + verify chunks**

```bash
npx vite build
```

Expected: lebih banyak chunk per route. Main bundle ≤ 300 KB gzip.

- [ ] **Step 3: Test**

```bash
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/AppRoutes.tsx
git commit -m "perf(routes): code-split feature pages with React.lazy + Suspense"
```

---

## Task 12: Card a11y proper button semantic

**Files:** `src/components/ui/Card.tsx`

- [ ] **Step 1: Baca file**

```bash
type src\components\ui\Card.tsx
```

- [ ] **Step 2: Render sebagai button kalau interactive**

Replace render Card. Pattern: kalau ada `onClick`, render `<button>` element. Kalau tidak, render `<div>`.

```tsx
import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function Card({
  title,
  children,
  className = '',
  onClick,
  interactive,
}: CardProps) {
  const isInteractive = interactive || !!onClick;
  const baseClasses =
    'bg-white border border-light-ash rounded-default shadow-card p-[21px] transition-all duration-150 ease-out-quart';
  const interactiveClasses = isInteractive
    ? 'hover:border-primary-300 hover:shadow-raised hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 cursor-pointer text-left w-full'
    : '';

  const content = (
    <>
      {title && (
        <div className="text-body-sm font-semibold text-deep-slate mb-[13px]">
          {title}
        </div>
      )}
      {children}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} ${interactiveClasses} ${className}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`${baseClasses} ${className}`}>{content}</div>;
}
```

- [ ] **Step 3: Build + test**

```bash
npx vite build
npx vitest run
```

Expected: build pass. Visual check optional di browser — interactive card sekarang fully keyboard navigable.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "fix(a11y): render Card as button when interactive (keyboard navigable)"
```

---

## Task 13: Verification sweep

- [ ] **Step 1: Final build**

```bash
npx vite build
```

Expected: build pass. Main bundle ≤ 350 KB gzip (was 478).

- [ ] **Step 2: Final test**

```bash
npx vitest run
```

Expected: 81/81 pass (76 + 5 new).

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: zero error.

- [ ] **Step 4: Verify zero static Modal.confirm di file consumer**

```bash
findstr /S /N /C:"Modal.confirm" src
```

Expected: zero results di file di luar `useConfirmDialog.ts` definition.

- [ ] **Step 5: Tidak commit apa pun di Task 13**

Sweep saja.

---

## Plan Acceptance

- ✅ DOMPurify di-install dan `sanitizeHtml()` utility ready
- ✅ `ArtikelDetailPage` pakai sanitize untuk HTML content (XSS safe)
- ✅ `ErrorBoundary` global di App.tsx dengan UI fallback
- ✅ `useConfirmDialog` hook dengan App.useApp pattern
- ✅ 9 file consumer Modal.confirm di-migrate ke useConfirmDialog
- ✅ Code splitting via React.lazy untuk 17+ feature pages
- ✅ Main bundle ≤ 350 KB gzip
- ✅ Card render `<button>` kalau interactive (a11y)
- ✅ 81 test pass (76 + 5 sanitize tests)
- ✅ Zero TS error, zero ESLint warning

---

## Risk

- **Task 11** (code splitting) bisa tampilkan flicker saat first navigate ke route. Mitigasi: PageFallback minimal dan instant.
- **Task 5-10** (Modal.confirm refactor) ubah behavior modal sedikit (theme inheritance dari ConfigProvider sekarang work). Manual visual verify worth.
- **Task 12** (Card a11y) bisa break visual kalau ada CSS yang assume `<div>`. Test dengan beberapa Card di browser.

---

## Next

Setelah Phase 2 merged:
- Phase 3 (quality refactor): hapus @ts-nocheck bertahap, optimistic updates, Sentry
- Manual visual QA per role di production-like environment
