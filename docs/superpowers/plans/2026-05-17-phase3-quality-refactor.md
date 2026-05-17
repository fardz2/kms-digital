# Phase 3 Quality Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hapus `@ts-nocheck` dari 4 query hook + 3 file shared kecil, define foundation types (Session, User, etc), establish TS-first migration pattern untuk file selanjutnya.

**Architecture:** Foundation-first typing. Define core types di `src/types/`, lalu apply gradual ke file utility, queries, dan shared components. Stop di sini untuk Phase 3 — Phase 4 nanti untuk page-level migration.

**Tech Stack:** TypeScript 5, React 19, TanStack Query, antd v6.

**Audit reference:** `docs/superpowers/audits/2026-05-17-comprehensive.md` Phase 3 quality refactor

---

## Scope (REALISTIC)

**Yang dikerjakan di plan ini:**
- Define foundation types: `Session`, `User`, `Anak`, `Pengukuran`, `Posyandu`, `Desa`, `Reminder`
- Hapus `@ts-nocheck` dari 4 query hook (`useCommentQueries`, `useExportQueries`, `useOrangTuaQueries`, `usePengukuranQueries`)
- Hapus `@ts-nocheck` dari 3 small file (`main.tsx`, `AdminDashboard`, `BerandaDesa`)

**Yang TIDAK dikerjakan (deferred to Phase 4+):**
- 30+ file `@ts-nocheck` lainnya
- Optimistic updates (need API contract verification dulu)
- Sentry integration (need backend collaboration)
- Strict mode TypeScript

---

## File Scope

### Create
- `src/types/index.ts` — re-export semua types
- `src/types/session.ts` — Session, User, Token, Role
- `src/types/anak.ts` — Anak interface
- `src/types/pengukuran.ts` — Pengukuran interface
- `src/types/posyandu.ts` — Posyandu, Desa
- `src/types/reminder.ts` — Reminder

### Modify
- `src/features/auth/session-storage.ts` — type readSession/writeSession return
- `src/queries/useCommentQueries.ts` — hapus @ts-nocheck, type params
- `src/queries/useExportQueries.ts` — sda
- `src/queries/useOrangTuaQueries.ts` — sda
- `src/queries/usePengukuranQueries.ts` — sda
- `src/main.tsx` — hapus @ts-nocheck (file sederhana)
- `src/features/admin/AdminDashboard.tsx` — hapus @ts-nocheck
- `src/features/desa/BerandaDesa.tsx` — hapus @ts-nocheck

---

## Testing Strategy

- 81 unit test existing harus tetap pass per task
- Build (`npx vite build`) wajib pass per task
- Type check (`npx tsc --noEmit`) wajib zero error per task

---

## Task 1: Define foundation types

**Files:** `src/types/session.ts`, `src/types/anak.ts`, `src/types/pengukuran.ts`, `src/types/posyandu.ts`, `src/types/reminder.ts`, `src/types/index.ts` (semua NEW)

- [ ] **Step 1: Buat directory + session.ts**

```bash
New-Item -ItemType Directory -Path "src/types" -Force
```

`src/types/session.ts`:

```ts
export type Role = 'ADMIN' | 'KADER_POSYANDU' | 'TENAGA_KESEHATAN' | 'DESA' | 'ORANG_TUA';

export interface User {
  id: number;
  name: string;
  email?: string;
  role: Role;
  id_desa?: number;
  id_posyandu?: number;
  desa_name?: string;
  nama_desa?: string;
  posyandu_name?: string;
}

export interface Token {
  value: string;
  expires_at?: string;
}

export interface Session {
  user: User;
  token: Token;
}
```

- [ ] **Step 2: Buat anak.ts**

`src/types/anak.ts`:

```ts
export type Gender = 'LAKI_LAKI' | 'PEREMPUAN';

export interface Anak {
  id: number;
  nama: string;
  panggilan?: string;
  tanggal_lahir: string;
  gender: Gender;
  alamat?: string;
  nama_ortu?: string;
  id_orang_tua?: number;
  id_posyandu?: number;
  status?: boolean | number | string;
  created_at?: string;
  updated_at?: string;
}
```

- [ ] **Step 3: Buat pengukuran.ts**

`src/types/pengukuran.ts`:

```ts
export interface Pengukuran {
  id: number;
  id_anak: number;
  date: string;
  berat: number;
  tinggi: number;
  lingkar_kepala: number;
  lila?: number | null;
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
}
```

- [ ] **Step 4: Buat posyandu.ts**

`src/types/posyandu.ts`:

```ts
export interface Desa {
  id: number;
  name: string;
  created_at?: string;
}

export interface Posyandu {
  id: number;
  nama: string;
  alamat?: string;
  id_desa: number;
  desa?: Desa;
  created_at?: string;
}
```

- [ ] **Step 5: Buat reminder.ts**

`src/types/reminder.ts`:

```ts
export interface Reminder {
  id: number;
  judul: string;
  deskripsi?: string;
  tanggal_reminder: string;
  created_at?: string;
}
```

- [ ] **Step 6: Buat index.ts**

`src/types/index.ts`:

```ts
export type { Role, User, Token, Session } from './session';
export type { Gender, Anak } from './anak';
export type { Pengukuran } from './pengukuran';
export type { Desa, Posyandu } from './posyandu';
export type { Reminder } from './reminder';
```

- [ ] **Step 7: Verify type check**

```bash
npx tsc --noEmit
```

Expected: zero error.

- [ ] **Step 8: Commit**

```bash
git add src/types
git commit -m "feat(types): add foundation types (Session, Anak, Pengukuran, Posyandu, Reminder)"
```

---

## Task 2: Type session-storage

**Files:** `src/features/auth/session-storage.ts`

- [ ] **Step 1: Type return value**

Buka `src/features/auth/session-storage.ts`. Replace function signatures:

```ts
import type { Session } from '../../types';

const STORAGE_KEY = 'kms_session_v1';
const LEGACY_KEY = 'login_data';

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Session;
      if (parsed?.token?.value && parsed?.user?.role) return parsed;
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as Session;
      if (parsed?.token?.value && parsed?.user?.role) {
        localStorage.setItem(STORAGE_KEY, legacy);
        localStorage.removeItem(LEGACY_KEY);
        return parsed;
      }
    }
    return null;
  } catch (e) {
    console.error('readSession parse error:', e);
    return null;
  }
}

export function writeSession(data: Session): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('writeSession error:', e);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch (e) {
    console.error('clearSession error:', e);
  }
}
```

- [ ] **Step 2: Verify type check + test**

```bash
npx tsc --noEmit
npx vitest run
```

Expected: zero error, 81 test pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/session-storage.ts
git commit -m "feat(types): type readSession/writeSession with Session interface"
```

---

## Task 3: Hapus @ts-nocheck dari useCommentQueries

**Files:** `src/queries/useCommentQueries.ts`

- [ ] **Step 1: Type params + hapus @ts-nocheck**

Replace seluruh file:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/comment.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

interface Comment {
  comment_id?: number;
  id?: number;
  user_id: number;
  post_id: number;
  content: string;
  nama?: string;
  role?: string;
  time?: string;
}

interface CreateCommentPayload {
  user_id: number;
  post_id: number | string;
  content: string;
}

export function useCommentList(postId: number | string | undefined) {
  const { isAuthenticated } = useSession();
  return useQuery<Comment[]>({
    queryKey: qk.comment.byPost(postId),
    queryFn: async () => {
      const res = await commentApi.listByPost(postId);
      const list: Comment[] = res.data ?? [];
      return [...list].sort((a, b) =>
        (b.time ?? '').localeCompare(a.time ?? '')
      );
    },
    enabled: isAuthenticated && !!postId,
    staleTime: 30 * 1000,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => commentApi.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: qk.comment.byPost(variables.post_id) });
    },
  });
}
```

- [ ] **Step 2: Verify type check + build**

```bash
npx tsc --noEmit
npx vite build
```

- [ ] **Step 3: Commit**

```bash
git add src/queries/useCommentQueries.ts
git commit -m "feat(types): remove @ts-nocheck from useCommentQueries with proper types"
```

---

## Task 4: Hapus @ts-nocheck dari useExportQueries

**Files:** `src/queries/useExportQueries.ts`

- [ ] **Step 1: Baca file dulu**

```bash
type src\queries\useExportQueries.ts
```

- [ ] **Step 2: Hapus @ts-nocheck + add types**

Replace baris pertama (`// @ts-nocheck`) dengan tipe yang sesuai. Pakai pattern yang sama dengan Task 3:

```ts
// (replace whole file based on actual content from Step 1)
```

Pseudo: function signatures harus pakai explicit type untuk parameter (mis. `idDesa: number`, dll).

- [ ] **Step 3: Verify type check**

```bash
npx tsc --noEmit
```

Kalau ada error, fix di file ini saja (jangan touch file lain).

- [ ] **Step 4: Commit**

```bash
git add src/queries/useExportQueries.ts
git commit -m "feat(types): remove @ts-nocheck from useExportQueries"
```

---

## Task 5: Hapus @ts-nocheck dari useOrangTuaQueries

**Files:** `src/queries/useOrangTuaQueries.ts`

- [ ] **Step 1: Replace seluruh file dengan typed version**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orangTuaApi } from '../api/approve.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

interface OrangTua {
  id: number;
  nama: string;
  email?: string;
  alamat?: string;
  status?: boolean | number | string;
  id_posyandu?: number;
  id_desa?: number;
  created_at?: string;
}

interface CreateOrangTuaPayload {
  email: string;
  password: string;
  nama: string;
  alamat: string;
  status?: boolean;
  id_posyandu?: number;
  id_desa?: number;
}

interface UpdateOrangTuaParams {
  id: number;
  payload: Partial<CreateOrangTuaPayload>;
}

export function useOrangTuaList(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery<OrangTua[]>({
    queryKey: qk.orangTua.list,
    queryFn: async () => {
      const res = await orangTuaApi.list();
      return res.data ?? [];
    },
    enabled: enabled && isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useCreateOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrangTuaPayload) => orangTuaApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
    },
  });
}

export function useUpdateOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: UpdateOrangTuaParams) =>
      orangTuaApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
    },
  });
}

export function useDeleteOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orangTuaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.orangTua.list });
    },
  });
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx vite build
```

- [ ] **Step 3: Commit**

```bash
git add src/queries/useOrangTuaQueries.ts
git commit -m "feat(types): remove @ts-nocheck from useOrangTuaQueries"
```

---

## Task 6: Hapus @ts-nocheck dari usePengukuranQueries

**Files:** `src/queries/usePengukuranQueries.ts`

- [ ] **Step 1: Baca file**

```bash
type src\queries\usePengukuranQueries.ts
```

- [ ] **Step 2: Add types berdasarkan structure file**

Pakai `Pengukuran` type dari `src/types`. Pattern:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pengukuranApi } from '../api/pengukuran.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';
import type { Pengukuran } from '../types';

// Tambahkan typed signatures sesuai existing function:
// useQuery<Pengukuran[]> untuk list
// useMutation dengan payload type explicit
```

Replace `// @ts-nocheck` dengan signatures typed. Detail tergantung file existing — keep all logic, hanya tambah types.

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
```

Fix sampai zero error.

- [ ] **Step 4: Commit**

```bash
git add src/queries/usePengukuranQueries.ts
git commit -m "feat(types): remove @ts-nocheck from usePengukuranQueries"
```

---

## Task 7: Hapus @ts-nocheck dari main.tsx

**Files:** `src/main.tsx`

- [ ] **Step 1: Hapus baris pertama**

Baca file:
```bash
type src\main.tsx
```

Hapus baris `// @ts-nocheck` (baris 1). File ini sederhana, tidak ada type issue.

Kalau ada error di `document.getElementById('root')` (return type `HTMLElement | null`), tambah non-null assertion:

```ts
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = ReactDOM.createRoot(rootElement);
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npx vite build
```

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat(types): remove @ts-nocheck from main.tsx"
```

---

## Task 8: Hapus @ts-nocheck dari AdminDashboard

**Files:** `src/features/admin/AdminDashboard.tsx`

- [ ] **Step 1: Hapus baris pertama**

Buka `src/features/admin/AdminDashboard.tsx`. File 36 baris. Hapus `// @ts-nocheck`.

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

Kalau ada error, biasanya karena `useAdminDashboardData` return type tidak terdeklarasi. Tambah type assertion atau cast safe:

```ts
const { stats, activity, isLoading, hasPartialError } = useAdminDashboardData();
// stats, activity will be inferred dari hook return
```

Kalau implicit any di destructure, restore @ts-nocheck dan stop. Goal task ini adalah verify file kompatibel — kalau butuh type definition di `useAdminDashboardData`, defer ke task lain.

- [ ] **Step 3: Verify build**

```bash
npx vite build
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/AdminDashboard.tsx
git commit -m "feat(types): remove @ts-nocheck from AdminDashboard"
```

---

## Task 9: Hapus @ts-nocheck dari BerandaDesa

**Files:** `src/features/desa/BerandaDesa.tsx`

- [ ] **Step 1: Hapus baris pertama**

Buka `src/features/desa/BerandaDesa.tsx`. File 41 baris. Hapus `// @ts-nocheck`.

- [ ] **Step 2: Type check**

```bash
npx tsc --noEmit
```

Kalau ada error related ke `useStatistikGiziDesa` atau `printableRef`, tambah type assertion minimal.

- [ ] **Step 3: Verify**

```bash
npx vite build
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/features/desa/BerandaDesa.tsx
git commit -m "feat(types): remove @ts-nocheck from BerandaDesa"
```

---

## Task 10: Verification sweep

- [ ] **Step 1: Final build + test + type check**

```bash
npx vite build
npx vitest run
npx tsc --noEmit
```

Expected: build success, 81/81 test pass, zero TS error.

- [ ] **Step 2: Count remaining @ts-nocheck**

```bash
findstr /S /N /C:"@ts-nocheck" src
```

Expected: ~33 (was 41 di awal, turun 8).

- [ ] **Step 3: Tidak commit apa pun di Task 10**

Sweep saja.

---

## Plan Acceptance

- ✅ 5 file types baru di `src/types/`
- ✅ `Session`, `User`, `Anak`, `Pengukuran`, `Posyandu`, `Desa`, `Reminder` interfaces tersedia
- ✅ `session-storage.ts` typed
- ✅ 4 query hook (`useCommentQueries`, `useExportQueries`, `useOrangTuaQueries`, `usePengukuranQueries`) hilang `@ts-nocheck`
- ✅ 3 small file (`main.tsx`, `AdminDashboard`, `BerandaDesa`) hilang `@ts-nocheck`
- ✅ 81 test pass, zero TS error, build pass
- ✅ `@ts-nocheck` count: 41 → 33

---

## Risk

- **Task 4, 6** depend pada actual file content. Plan kasih pseudo, perlu adjust per file. Worth read existing file dulu.
- Beberapa task bisa fail karena hook chain (mis. AdminDashboard depend useAdminDashboardData yang masih untyped). Kalau fail, restore @ts-nocheck dan defer ke Phase 4.
- Goal Phase 3 adalah momentum — hapus 8 dari 41 file. Sisanya gradual di phase berikutnya.

---

## Next

Setelah Phase 3:
- Phase 4: hapus @ts-nocheck dari pages (SignUp, LandingPage, etc) — heavier lift
- Optimistic updates di mutations
- Sentry integration
- Implementasi rekomendasi audit yang masih low priority
