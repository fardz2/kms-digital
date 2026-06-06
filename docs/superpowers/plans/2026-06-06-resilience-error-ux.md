# Resilience & Error UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tampilkan error fetch + retry di halaman data utama, dan indikator offline global.

**Architecture:** Komponen ErrorState reusable (bungkus EmptyState). Hook useOnlineStatus + OfflineBanner global. Halaman menambah isError/refetch. AdminDashboard sudah punya hasPartialError (degradasi anggun) - tidak diganti ErrorState penuh, cukup tetap.

**Tech Stack:** React 19, React Query, Vitest, Testing Library, lucide-react.

---

## File Structure

- Create: `src/components/ui/ErrorState.tsx` + test
- Create: `src/hooks/useOnlineStatus.ts` + test
- Create: `src/components/OfflineBanner.tsx`
- Modify: `src/App.tsx` (pasang OfflineBanner)
- Modify: `src/queries/usePengukuranBulananKader.ts` (ekspos isError + refetch)
- Modify halaman: BerandaOT, ModePosyandu, DetailAnak, ArtikelList (artikel), LaporanBulananKader, BerandaDesa

Catatan: AdminDashboard dikecualikan dari ErrorState penuh (sudah punya hasPartialError yang menampilkan data parsial; mengganti dengan ErrorState penuh = regresi).

---

## Task 1: Komponen ErrorState

**Files:**
- Create: `src/components/ui/ErrorState.tsx`
- Test: `src/__tests__/components/ui/ErrorState.test.tsx`

Context: `EmptyState` (src/components/ui/EmptyState.tsx) accepts `{ icon, title, description, action, className }`. `Button` (src/components/ui/Button.tsx) accepts `variant`, `size`, `leadingIcon`, `onClick`, children. lucide-react provides `AlertTriangle` and `RefreshCw`.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/components/ui/ErrorState.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ErrorState from '../../../components/ui/ErrorState';

describe('ErrorState', () => {
  test('renders default title', () => {
    render(<ErrorState />);
    expect(screen.getByText('Gagal memuat data')).toBeInTheDocument();
  });

  test('shows error message in description when provided', () => {
    render(<ErrorState error={new Error('Koneksi terputus')} />);
    expect(screen.getByText('Koneksi terputus')).toBeInTheDocument();
  });

  test('calls onRetry when the retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('does not render a retry button when onRetry is absent', () => {
    render(<ErrorState />);
    expect(screen.queryByRole('button', { name: /coba lagi/i })).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/components/ui/ErrorState.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement ErrorState**

Create `src/components/ui/ErrorState.tsx`:

```tsx
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import EmptyState from './EmptyState';
import Button from './Button';

interface ErrorStateProps {
  onRetry?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  error?: unknown;
  className?: string;
}

function messageFromError(error: unknown): string | undefined {
  if (!error) return undefined;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  if (typeof error === 'string') return error;
  return undefined;
}

export default function ErrorState({
  onRetry,
  title = 'Gagal memuat data',
  description,
  error,
  className,
}: ErrorStateProps) {
  const desc =
    description ??
    messageFromError(error) ??
    'Periksa koneksi Anda lalu coba lagi.';

  return (
    <EmptyState
      className={className}
      icon={<AlertTriangle size={28} strokeWidth={1.75} />}
      title={title}
      description={desc}
      action={
        onRetry ? (
          <Button
            variant="primary"
            size="md"
            leadingIcon={<RefreshCw size={18} strokeWidth={2} />}
            onClick={onRetry}
          >
            Coba Lagi
          </Button>
        ) : undefined
      }
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/components/ui/ErrorState.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```
git add src/components/ui/ErrorState.tsx src/__tests__/components/ui/ErrorState.test.tsx
git commit -m "feat(ui): add ErrorState component with retry"
```

---

## Task 2: useOnlineStatus + OfflineBanner + pasang di App

**Files:**
- Create: `src/hooks/useOnlineStatus.ts`
- Test: `src/__tests__/hooks/useOnlineStatus.test.tsx`
- Create: `src/components/OfflineBanner.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing hook test**

Create `src/__tests__/hooks/useOnlineStatus.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react';
import { describe, expect, test, afterEach, vi } from 'vitest';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useOnlineStatus', () => {
  test('reflects initial navigator.onLine', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  test('updates to false on offline event', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const { result } = renderHook(() => useOnlineStatus());
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);
  });

  test('updates to true on online event', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/hooks/useOnlineStatus.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the hook**

Create `src/hooks/useOnlineStatus.ts`:

```ts
import { useEffect, useState } from 'react';

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/hooks/useOnlineStatus.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement OfflineBanner**

Create `src/components/OfflineBanner.tsx`:

```tsx
import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-center gap-[10px] bg-deep-slate text-white px-[17px] py-[10px] text-body-sm"
    >
      <WifiOff size={16} strokeWidth={2} aria-hidden />
      <span>Anda sedang offline. Sebagian data mungkin tidak terbarui.</span>
    </div>
  );
}
```

- [ ] **Step 6: Wire OfflineBanner into App.tsx**

In `src/App.tsx`, add the import near the other component imports:
```tsx
import OfflineBanner from './components/OfflineBanner';
```
Then render `<OfflineBanner />` inside `<BrowserRouter>`, right after `<AppPrompts />`:
```tsx
              <AppPrompts />
              <OfflineBanner />
```

- [ ] **Step 7: Verify**

Run: `npm run lint` — 0 errors.
Run: `npm test` — all green.
Run: `npm run build` — success.

- [ ] **Step 8: Commit**

```
git add src/hooks/useOnlineStatus.ts src/__tests__/hooks/useOnlineStatus.test.tsx src/components/OfflineBanner.tsx src/App.tsx
git commit -m "feat: global offline banner via useOnlineStatus"
```

---

## Task 3: Perluas usePengukuranBulananKader (isError + refetch)

**Files:**
- Modify: `src/queries/usePengukuranBulananKader.ts`

Context: current hook returns `{ anakList, pengukuranByAnak, isLoading }`. It uses `useAnakList()` (standard useQuery, exposes isError + refetch) and `useQueries(...)` (array of query results, each has isError + refetch). We add aggregate `isError` and a `refetch` that refetches the anak list and all per-anak queries.

- [ ] **Step 1: Destructure isError + refetch from useAnakList**

Change line 9:
```ts
  const { data: anakList, isLoading: anakLoading } = useAnakList();
```
to:
```ts
  const {
    data: anakList,
    isLoading: anakLoading,
    isError: anakError,
    refetch: refetchAnak,
  } = useAnakList();
```

- [ ] **Step 2: Compute aggregate error and refetch, add to return**

After the `const isFetchingPengukuran = ...` line (line 23), add:
```ts
  const isError = anakError || queries.some((q) => q.isError);

  const refetch = () => {
    refetchAnak();
    queries.forEach((q) => q.refetch());
  };
```

Then update the return object to include them:
```ts
  return {
    anakList: anakList ?? [],
    pengukuranByAnak,
    isLoading: anakLoading || isFetchingPengukuran,
    isError,
    refetch,
  };
```

- [ ] **Step 3: Verify**

Run: `npm run lint` — 0 errors.
Run: `npm test` — all green (no existing test asserts the old return shape exclusively; if one does, it only reads isLoading and remains valid).
Run: `npm run build` — success.

- [ ] **Step 4: Commit**

```
git add src/queries/usePengukuranBulananKader.ts
git commit -m "feat(query): expose isError and refetch from usePengukuranBulananKader"
```

---

## Task 4: Terapkan ErrorState di halaman data utama

**Files (modify):**
- `src/features/artikel/ArtikelList.tsx`
- `src/features/orangtua/BerandaOT.tsx`
- `src/features/kader/ModePosyandu.tsx`
- `src/features/anak/DetailAnak.tsx`
- `src/features/laporan/LaporanBulananKader.tsx`
- `src/features/desa/BerandaDesa.tsx`

General pattern for each page:
1. `import ErrorState from '<relative>/components/ui/ErrorState';`
2. Add `isError` (and `error`, `refetch`) to the query destructure.
3. Render `<ErrorState onRetry={refetch} error={error} />` when `isError`, placed BEFORE the loading/empty blocks, inside the page's content container.

- [ ] **Step 1: ArtikelList**

In `src/features/artikel/ArtikelList.tsx`:
- Add import: `import ErrorState from '../../components/ui/ErrorState';`
- Change line 13 to:
```tsx
  const { data: artikel, isLoading, isError, error, refetch } = useArtikelList();
```
- Immediately after the `Kembali` Button block (after line 31's closing `</Button>`), add:
```tsx
        {isError && <ErrorState onRetry={() => refetch()} error={error} />}
```
- Change the loading guard to also require no error: `{isLoading && !isError && (` and the empty guard to `{!isLoading && !isError && (!artikel || artikel.length === 0) && (`.

- [ ] **Step 2: BerandaOT**

In `src/features/orangtua/BerandaOT.tsx`:
- Add import: `import ErrorState from '../../components/ui/ErrorState';`
- Change line 36 to:
```tsx
  const { data: anakList, isLoading, isError, error, refetch } = useAnakList();
```
- In the anak section, before `{isLoading && <SkeletonList count={2} />}` (line 70), add:
```tsx
          {isError && <ErrorState onRetry={() => refetch()} error={error} />}
```
- Guard loading and empty with `!isError`: `{isLoading && !isError && ...}` and `{!isLoading && !isError && (!anakList || anakList.length === 0) && (`.

- [ ] **Step 3: ModePosyandu**

In `src/features/kader/ModePosyandu.tsx`:
- Add import: `import ErrorState from '../../components/ui/ErrorState';`
- Change the destructure (line 25) to:
```tsx
  const { anakList, pengukuranByAnak, isLoading, isError, refetch } = usePengukuranBulananKader();
```
- Inside the content container, before `{isLoading && <SkeletonList count={3} />}` (line 153), add:
```tsx
        {isError && <ErrorState onRetry={() => refetch()} />}
```
- Guard loading and the "no result" block with `!isError`: change to `{isLoading && !isError && <SkeletonList count={3} />}` and `{!isLoading && !isError && filtered.length === 0 && (`.

- [ ] **Step 4: DetailAnak**

In `src/features/anak/DetailAnak.tsx`:
- Add import: `import ErrorState from '../../components/ui/ErrorState';`
- Change the two query lines (28-29) to include error+refetch:
```tsx
  const { data: anak, isLoading: anakLoading, isError: anakError, refetch: refetchAnak } = useAnakDetail(id);
  const { data: pengukuran, isLoading: pengukuranLoading, isError: pengukuranError, refetch: refetchPengukuran } = usePengukuranAnak(id);
```
- Inside the `px-4 py-6 max-w-4xl` container, right after the `Kembali` Button (after line 90), add:
```tsx
          {(anakError || pengukuranError) && (
            <ErrorState
              onRetry={() => {
                refetchAnak();
                refetchPengukuran();
              }}
            />
          )}
```
- Guard the existing pengukuran loading/empty blocks with `!pengukuranError` so the error state is the single source of truth on failure: change `{pengukuranLoading && (` to `{pengukuranLoading && !pengukuranError && (` and `{!pengukuranLoading && (!pengukuran || pengukuran.length === 0) && (` to `{!pengukuranLoading && !pengukuranError && (!pengukuran || pengukuran.length === 0) && (`.

- [ ] **Step 5: LaporanBulananKader**

In `src/features/laporan/LaporanBulananKader.tsx`:
- Add import: `import ErrorState from '../../components/ui/ErrorState';`
- Change line 29 to:
```tsx
  const { data: anakList, isLoading: anakLoading, isError: anakError, refetch: refetchAnak } = useAnakList();
```
- Compute a combined error after line 42:
```tsx
  const isError = anakError || pengukuranQueries.some((q) => q.isError);
  const refetchAll = () => {
    refetchAnak();
    pengukuranQueries.forEach((q) => q.refetch());
  };
```
- Inside the content container, right after the `Kembali` Button (after line 70's block), add:
```tsx
        {isError && <ErrorState onRetry={refetchAll} />}
```
- If the rest of the report renders below, wrap it so it only shows when `!isError` (e.g. guard the main report section with `{!isError && ( ... )}`). Read lines 71-178 to place the guard around the report body without breaking JSX.

- [ ] **Step 6: BerandaDesa**

In `src/features/desa/BerandaDesa.tsx`:
- Add import: `import ErrorState from '../../components/ui/ErrorState';`
- Change line 17 to:
```tsx
  const { data: statistikData, isError, refetch } = useStatistikGiziDesa(idDesa);
```
- Inside the content container (after line 43 opening div), before `<ExportDesaForm ...>`, add:
```tsx
        {isError && <ErrorState onRetry={() => refetch()} />}
```
Keep the existing children rendering; the banner appears above them on error.

- [ ] **Step 7: Verify all**

Run: `npm run lint` — 0 errors.
Run: `npm test` — all green.
Run: `npm run build` — success.

- [ ] **Step 8: Commit**

```
git add src/features/artikel/ArtikelList.tsx src/features/orangtua/BerandaOT.tsx src/features/kader/ModePosyandu.tsx src/features/anak/DetailAnak.tsx src/features/laporan/LaporanBulananKader.tsx src/features/desa/BerandaDesa.tsx
git commit -m "feat: show ErrorState with retry on data fetch failure"
```

---

## Final Verification

- [ ] `npm run lint` — 0 errors (1 pre-existing warning OK)
- [ ] `npm test` — all green (added: ErrorState 4, useOnlineStatus 3)
- [ ] `npm run build` — success

## Catatan
- AdminDashboard sengaja TIDAK diubah ke ErrorState penuh (sudah punya hasPartialError yang menampilkan data parsial dengan anggun).
- YAGNI: tanpa offline write queue, tanpa retry otomatis.
- Jika sebuah halaman punya struktur JSX berbeda dari asumsi, baca file dan tempatkan ErrorState mengikuti pola yang sama (sebelum loading/empty, di dalam kontainer konten).

