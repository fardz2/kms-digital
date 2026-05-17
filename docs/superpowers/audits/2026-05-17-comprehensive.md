# Comprehensive Frontend Audit — KMS Digital

**Date:** 2026-05-17
**Branch:** `migrate-vite-react19-ts`
**Stack:** Vite 8 + React 19 + antd v6 + TypeScript 5
**Scope:** 131 source files (`src/**/*.{ts,tsx}`)
**Build:** Compiled successfully, 73/73 tests pass

---

## Executive Summary

| Severity | Count |
|---|---|
| Critical | 4 |
| High | 9 |
| Medium | 14 |
| Low | 8 |
| **Total** | **35** |

### Top 10 Priority Fix

1. [Critical] Bundle 1.8 MB pre-gzip — no code splitting di routes
2. [Critical] Static `Modal.confirm` di 9 file — antd v6 deprecated
3. [Critical] Tidak ada Error Boundary global
4. [Critical] `dangerouslySetInnerHTML` di ArtikelDetailPage tanpa sanitization
5. [High] 41 file pakai `@ts-nocheck` (38% codebase)
6. [High] `key={idx}` di 3 lokasi (anti-pattern React)
7. [High] `useAuth` legacy duplicate dengan `RequireRole` (double validation)
8. [High] 3 query hook bypass `qk.*` factory (inkonsisten)
9. [High] BalitaCard list tanpa `<ul>/<li>` semantic
10. [Medium] `RegisterKaderPosyandu` 469 baris — terlalu besar

---

## Dimension 1: Bug & Runtime Risk

### 1.1 Tidak ada Error Boundary global [Critical]
- **File:** `src/App.tsx`
- **Severity:** Critical
- **Effort:** 1 jam
- **Impact:** Jika query fail atau component crash, seluruh aplikasi jadi white screen tanpa fallback. User harus refresh manual.
- **Recommendation:** Tambah `<ErrorBoundary>` di App, integrate dengan `useQueryErrorResetBoundary`, render fallback page dengan retry button.

### 1.2 Static `Modal.confirm` deprecated di antd v6 [Critical]
- **Files:** 9 lokasi (Sidebar:28, AppShell:13, ModePosyandu:73, AkunOrangTuaPage:58, PendingApprovalSection:19, AcaraSection:43, DetailAnak:46, InputDesa:64, InputPosyandu:105, ArtikelList:101)
- **Severity:** Critical
- **Effort:** 2 jam
- **Impact:** antd v6 deprecated static API tanpa context. Modal akan render tanpa theme inheritance, locale id_ID tidak terapply, console warning di runtime.
- **Recommendation:** Refactor ke `App.useApp().modal.confirm()` hook pattern. Bisa dibungkus jadi shared `useConfirmDialog()` util.

### 1.3 `dangerouslySetInnerHTML` tanpa sanitize [Critical]
- **File:** `src/features/artikel/ArtikelDetailPage.tsx:41`
- **Severity:** Critical (XSS risk)
- **Effort:** 30 min
- **Impact:** Konten artikel dari admin di-render apa adanya. Kalau admin compromised atau ada bug input, attacker bisa inject `<script>`.
- **Recommendation:** Pakai `DOMPurify` atau `sanitize-html` untuk filter HTML dulu sebelum render. Atau pakai library renderer markdown safe.

### 1.4 Type erasure di `user.user.role` [High]
- **Files:** Navbar:107, useAuth:32, ProfileModal:44, SignUp:59
- **Severity:** High
- **Effort:** 1 jam
- **Impact:** Akses nested `user.user.role` rapuh. Kalau session schema berubah, runtime error tidak ketahuan saat compile.
- **Recommendation:** Define `Session` type proper di `session-storage.ts`, ekspos sebagai return type. Hilangkan double `.user.user`.

### 1.5 `key={idx}` di list rendering [High]
- **Files:** AdminActivityFeed:49, Post:190, DataTablePagination:65
- **Severity:** High
- **Effort:** 30 min
- **Impact:** React reconciler akan misidentify item saat list reorder/remove. Bug visual bisa terjadi (state nempel di wrong row).
- **Recommendation:** Pakai stable id dari data (mis. `comment_id`, `post_id`). Untuk pagination skeleton OK pakai index karena tidak reorder.

### 1.6 `useState(() => readSession())` snapshot di mount [Medium]
- **File:** `src/hook/useAuth.ts:15`, `src/components/layout/Dashboard/Sidebar.tsx:24`
- **Severity:** Medium
- **Effort:** 30 min
- **Impact:** `useMemo(() => readSession(), [])` di useAuth.ts snapshot 1x. Kalau session berubah selama lifecycle (mis. logout di tab lain), tidak tahu sampai navigate.
- **Recommendation:** Sudah ada `useSession` reactive. Hapus `useAuth` legacy, gunakan `useSession()` di Navbar (1 sisa user).

### 1.7 Inconsistent error catch [Medium]
- **Files:** `FormInputPost:34`, `FormInputDataAnak:55`, `FormInputDataExcel:39`, `AcaraSection:39`, `FormOrangTua:99`, `ProfileModal:55`
- **Severity:** Medium
- **Effort:** 1 jam
- **Impact:** Pattern `.catch(() => {})` swallow error tanpa logging. Validation error jadi silent failure dari sisi user.
- **Recommendation:** Catch should at minimum `console.error` atau toast.error. Form validation error sudah di-handle antd Form, jadi catch ini hanya untuk safety. Worth log.

### 1.8 `forwardRef` + `noImplicitAny: false` mengizinkan loose typing [Low]
- **File:** Various component files dengan `@ts-nocheck`
- **Severity:** Low
- **Effort:** Per file 30 min
- **Impact:** Props type leak, runtime crash bisa terjadi kalau parent kasih wrong shape.

---

## Dimension 2: TypeScript Coverage

### 2.1 41 file pakai `@ts-nocheck` [High]
- **Files:** Lihat `git grep '@ts-nocheck'`
- **Severity:** High (technical debt)
- **Effort:** 30 min - 2 jam per file
- **Impact:** 38% file source bypass type check. Hilang manfaat utama TypeScript di area paling penting (UI components).
- **Recommendation:** Hapus per file mulai dari yang paling sederhana. Prioritaskan: 4 query hooks (useExportQueries, useCommentQueries, useOrangTuaQueries, usePengukuranQueries) yang tidak butuh component types.

### 2.2 No type definition untuk Session [Medium]
- **File:** `src/features/auth/session-storage.ts`
- **Severity:** Medium
- **Effort:** 30 min
- **Recommendation:** Define `Session` interface dengan `user: User`, `token: { value: string; expires_at: string }`, etc. Export dari session-storage.ts.

### 2.3 No API response types [Medium]
- **Files:** `src/api/*.ts`
- **Severity:** Medium
- **Effort:** 2-4 jam
- **Recommendation:** Define `Anak`, `Pengukuran`, `Posyandu`, `Desa`, `User` types. Bisa pakai zod untuk runtime validation + type inference.

### 2.4 Implicit any di event handlers [Low]
- **Files:** Components dengan `(e) => ...`
- **Severity:** Low
- **Recommendation:** Type explicit `React.ChangeEvent<HTMLInputElement>` etc atau biarkan inference dari prop type.

---

## Dimension 3: Performance

### 3.1 Bundle main 1.8 MB pre-gzip [Critical]
- **File:** `build/assets/index-*.js`
- **Severity:** Critical
- **Effort:** 4-6 jam
- **Impact:** Initial load besar untuk LCP. User di mobile/3G akan delayed > 5s sebelum interactive.
- **Recommendation:** Implement route-based code splitting via `React.lazy`. Setiap role page jadi chunk terpisah. Target main < 300 KB.

### 3.2 Image `<img>` tanpa lazy loading [High]
- **Files:** `LandingPage:151`, `DetailForum:68/148`, `Post:135`
- **Severity:** High
- **Effort:** 30 min
- **Impact:** Gambar avatar/banner load eager, blocking LCP.
- **Recommendation:** Tambah `loading="lazy"` di semua `<img>` non-critical (avatar, content image).

### 3.3 baby-banner.svg 517 KB di LandingPage [High]
- **File:** `src/assets/img/baby-banner.svg`
- **Severity:** High
- **Effort:** 1 jam
- **Impact:** SVG ini 387 KB gzip. Dipakai di landing page yang harus cepat.
- **Recommendation:** Compress SVG via SVGO, atau replace dengan PNG/WebP. Atau split: load SVG asynchronous setelah hero text muncul.

### 3.4 Tidak ada `key` di `useQueries` admin dashboard [Medium]
- **File:** `src/features/admin/useAdminDashboardData.ts:97-102`
- **Severity:** Medium
- **Effort:** 30 min
- **Impact:** 6 parallel query OK, tapi bukan paling efisien. Network waterfall via Network tab worth audit.
- **Recommendation:** Pertimbangkan `useSuspenseQueries` atau aggregate endpoint single backend call.

### 3.5 `react-quill-new` di-load eager [Medium]
- **Files:** `ArtikelForm.tsx`, `FormUpdateDataArtikel/index.tsx`
- **Severity:** Medium
- **Effort:** 1 jam
- **Impact:** Editor WYSIWYG hanya dipakai admin, tapi ter-load di main bundle.
- **Recommendation:** Dynamic import: `const ReactQuill = lazy(() => import('react-quill-new'))`. Wrap dengan `<Suspense>`.

### 3.6 Inline component definition [Medium]
- **File:** `src/features/orangtua/BerandaOT.tsx:13` (`QuickLink`)
- **Severity:** Medium
- **Effort:** 30 min
- **Impact:** Component re-defined every render, breaks memo and ref identity.
- **Recommendation:** Extract `QuickLink` ke file terpisah atau hoist out of `BerandaOT`.

### 3.7 No `loading="eager"` di hero image [Low]
- **File:** `LandingPage:151`
- **Severity:** Low
- **Recommendation:** Mark hero image (LCP candidate) dengan `loading="eager"` + `fetchpriority="high"`.

---

## Dimension 4: Accessibility

### 4.1 Card-as-button tanpa proper semantic [High]
- **File:** `src/features/orangtua/BerandaOT.tsx:91`, `BalitaCard.tsx`
- **Severity:** High
- **Effort:** 30 min per file
- **Impact:** `<Card onClick>` di-attach role="button" tapi keyboard nav (Enter/Space) tidak bekerja proper.
- **Recommendation:** Pakai `<button type="button">` semantic langsung, atau `Card` wrap dengan tabindex + keyboard handler explicit.

### 4.2 Forum post list tanpa landmark [Medium]
- **File:** `src/pages/Post/index.tsx`
- **Severity:** Medium
- **Effort:** 15 min
- **Impact:** Screen reader tidak punya landmark untuk navigate. List of posts harusnya `<ul>` + `<li>`.
- **Recommendation:** Wrap `<article>` list di `<ul role="list">`. Tab navigation pakai `role="tablist"` + `role="tab"`.

### 4.3 Image avatar tanpa alt [Medium]
- **Files:** `Post:135`, `DetailForum:68/148`
- **Severity:** Medium
- **Effort:** 15 min
- **Impact:** `<img src={avatar} alt="" />` decorative — OK kalau memang decorative. Tapi worth re-evaluate apakah perlu nama user di alt.
- **Recommendation:** Kalau avatar mewakili user, pakai `alt={user.nama}`. Kalau placeholder default, `alt=""` OK.

### 4.4 Color contrast belum di-audit [Medium]
- **Severity:** Medium
- **Effort:** 1 jam manual
- **Recommendation:** Run Lighthouse atau axe DevTools di Chrome. Cek terutama: text-graphite, text-light-ash, primary-300 di white.

### 4.5 Modal antd v6 fokus management [Medium]
- **Severity:** Medium
- **Effort:** 1 jam audit
- **Recommendation:** Verify Modal trap focus + return focus ke trigger element. antd v6 native handle, tapi worth verify.

### 4.6 Form auto-fill consistency [Low]
- **File:** Various form pages
- **Severity:** Low
- **Recommendation:** SignUp + LoginForm sudah pakai `autoComplete`. Worth tambah di form profile, edit data anak, dll.

---

## Dimension 5: TanStack Query

### 5.1 3 hook bypass `qk.*` factory [High]
- **Files:** `useApproveQueries.ts:5-6` (OT_KEY, ANAK_KEY), `useReminderQueries.ts:5` (REMINDER_KEY), `useOrangTuaQueries.ts:5` (OT_LIST_KEY)
- **Severity:** High
- **Effort:** 30 min
- **Impact:** Inkonsisten cache invalidation. Cross-key invalidation manual via string array.
- **Recommendation:** Pindah ke `qk.approve.*`, `qk.reminder.*`, `qk.orangTua.*`. Tambah ke `keys.ts`.

### 5.2 Cross-namespace invalidation pakai magic string [Medium]
- **File:** `useApproveQueries.ts:51,62,81` (`qc.invalidateQueries({ queryKey: ['anak'] })`)
- **Severity:** Medium
- **Effort:** 15 min
- **Impact:** String literal `['anak']` rapuh. Kalau prefix berubah, broken.
- **Recommendation:** Pakai `qk.anak.all`.

### 5.3 No `select` transform [Medium]
- **Files:** Various query hooks
- **Severity:** Medium
- **Effort:** 1 jam
- **Recommendation:** Move sort/filter logic ke `select` option. Saat ini banyak yang sort di `queryFn` (lebih sulit cache).

### 5.4 No optimistic update [Medium]
- **Files:** All mutations (deleteAnak, approveOT, etc.)
- **Severity:** Medium
- **Effort:** 2-3 jam
- **Impact:** Setelah mutation, UI menunggu refetch. UX terasa lambat.
- **Recommendation:** Tambah `onMutate` + `setQueryData` + rollback context untuk mutations yang tampak di list (delete, approve).

### 5.5 No error boundary integration [Medium]
- **File:** `src/App.tsx`
- **Severity:** Medium
- **Effort:** 1 jam
- **Recommendation:** Pakai `useQueryErrorResetBoundary` dengan `<ErrorBoundary>`. Sekarang error fall through tanpa fallback.

### 5.6 stale time inconsistent [Low]
- **Files:** Various (60s, 30s, 5min, 10min mixed)
- **Severity:** Low
- **Recommendation:** Document rationale per query type. List = 60s, detail = 5min, master data = 10min.

---

## Dimension 6: React Patterns

### 6.1 `useAuth` duplicate `RequireRole` [High]
- **File:** `src/hook/useAuth.ts`
- **Severity:** High
- **Effort:** 1 jam
- **Impact:** Double role validation di Navbar. `RequireRole` di route sudah handle. Performance + complexity.
- **Recommendation:** Hapus `useAuth`, replace dengan `useSession()` di Navbar (1 satu pemakaian).

### 6.2 `RegisterKaderPosyandu` 469 baris [Medium]
- **File:** `src/pages/AdminDashboard/RegisterKaderPosyandu.tsx`
- **Severity:** Medium
- **Effort:** 2-3 jam
- **Impact:** Single file untuk page + 3 mutation + 2 modal + 5 query + form + table = sulit di-maintain.
- **Recommendation:** Extract: `KaderForm.tsx`, `DeleteConfirm.tsx`, `useKaderMutations.ts` (custom hook).

### 6.3 `SignUp` 468 baris dengan 2 role [Medium]
- **File:** `src/pages/SignUp/index.tsx`
- **Severity:** Medium
- **Effort:** 2 jam
- **Recommendation:** Extract: `SignUpForm.tsx`, `RolePicker.tsx`, `BrandPanel.tsx`, `useSignUpMutation.ts`.

### 6.4 `LandingPage` 375 baris [Medium]
- **File:** `src/pages/LandingPage/index.tsx`
- **Severity:** Medium
- **Effort:** 2 jam
- **Recommendation:** Extract: `Hero.tsx`, `RoleCards.tsx`, `FeatureList.tsx`, `CTABlock.tsx`.

### 6.5 Inline component definition [Medium]
- **File:** `BerandaOT.tsx:13` (`QuickLink`)
- **Severity:** Medium
- **Recommendation:** Extract ke file terpisah.

### 6.6 Boolean prop proliferation di Button [Low]
- **File:** `src/components/ui/Button.tsx`
- **Severity:** Low
- **Recommendation:** OK saat ini. Pertimbangkan compound component pattern jika variant > 10.

---

## Dimension 7: Code Quality

### 7.1 Largest files [Medium]
| File | Lines |
|---|---|
| RegisterKaderPosyandu.tsx | 469 |
| SignUp/index.tsx | 468 |
| LandingPage/index.tsx | 375 |
| LoginPortal.tsx | 295 |
| RegisterTenagaKesehatan.tsx | 294 |
| Navbar/index.tsx | 292 |

### 7.2 `berat_badan_by_umur.ts` 612 baris [Low]
- **File:** `src/json/berat_badan_by_umur.ts`
- **Severity:** Low
- **Recommendation:** Data WHO standard tidak perlu di-bundle. Pindah ke `public/who-data.json` + fetch on-demand. Hemat ~30 KB bundle.

### 7.3 Unused imports / vars [Low]
- **Recommendation:** Run `eslint --fix` untuk clean up.

### 7.4 Komentar dalam Bahasa Indonesia mixed dengan English [Low]
- **Recommendation:** Pilih satu (Indonesia preferred untuk team lokal).

### 7.5 No JSDoc [Low]
- **Recommendation:** Worth tambah JSDoc di shared components (Button, ProfileModal, DataTable) untuk auto-suggestion di IDE.

---

## Dimension 8: Production Readiness

### 8.1 No source maps di production [Medium]
- **File:** `vite.config.js:13`
- **Severity:** Medium
- **Effort:** 5 min
- **Impact:** Error stacktrace di prod tidak bisa dibaca tanpa sourcemap.
- **Recommendation:** Set `sourcemap: 'hidden'` (generate tapi tidak link di file). Upload ke error tracking service (Sentry/LogRocket).

### 8.2 No error tracking [Medium]
- **Severity:** Medium
- **Effort:** 1-2 jam
- **Recommendation:** Integrate Sentry atau alternative untuk capture runtime error in production.

### 8.3 No environment-specific config [Medium]
- **File:** `.env`
- **Severity:** Medium
- **Effort:** 30 min
- **Recommendation:** Pisah `.env.development` dan `.env.production`. Tambah `.env.example` untuk dokumentasi.

### 8.4 No HTTP cache headers di Vite [Low]
- **Severity:** Low
- **Recommendation:** Vite default sudah set hash di filename, immutable. Verify deploy server set `Cache-Control: max-age=31536000, immutable` untuk asset hashed.

### 8.5 No PWA setup [Low]
- **Severity:** Low
- **Recommendation:** Optional. Pakai `vite-plugin-pwa` kalau target offline-capable.

### 8.6 No bundle analyzer setup [Low]
- **Severity:** Low
- **Recommendation:** Tambah `rollup-plugin-visualizer` untuk inspect bundle composition.

---

## Tooling rekomendasi

| Tool | Purpose |
|---|---|
| `@sentry/react` | Error tracking |
| `vite-plugin-pwa` | Offline support |
| `rollup-plugin-visualizer` | Bundle analysis |
| `dompurify` | HTML sanitize |
| `zod` | Runtime validation + type infer |
| `@axe-core/react` | Accessibility audit at dev |

---

## Rekomendasi roadmap

### Phase 1 — Quick wins (1 sesi, ~3 jam)
1. Fix Issue 1.5 (key={idx})
2. Fix Issue 5.1 (qk factory consistency)
3. Fix Issue 6.1 (hapus useAuth duplicate)
4. Fix Issue 3.5 (lazy load react-quill)
5. Fix Issue 8.1 (source maps hidden)

### Phase 2 — High impact (2-3 sesi)
1. Issue 3.1 (route-based code splitting)
2. Issue 1.1 (Error Boundary global)
3. Issue 1.3 (DOMPurify untuk artikel)
4. Issue 1.2 (Modal.confirm refactor)
5. Issue 4.1 (Card a11y)

### Phase 3 — Quality refactor (4-6 sesi)
1. Issue 6.2-6.4 (extract large components)
2. Issue 2.1 (hapus @ts-nocheck bertahap)
3. Issue 5.4 (optimistic updates)
4. Issue 8.2 (Sentry integration)

### Phase 4 — Polish (ongoing)
1. Issue 4.4 (color contrast audit)
2. Issue 7.5 (JSDoc)
3. Issue 8.4-8.6 (cache, PWA, bundle analyzer)

---

## Kesimpulan

Codebase dalam kondisi **good baseline**:
- Architecture solid (api/queries/features/components/pages structure)
- TanStack Query pattern konsisten 90%
- Accessibility coverage decent (53 aria attributes)
- Test coverage 73 unit tests, 7 suites

**Critical findings** (4) harus di-address sebelum production:
1. Bundle size (LCP risk)
2. Error Boundary (crash UX risk)
3. XSS via dangerouslySetInnerHTML (security)
4. Modal.confirm deprecated (runtime warning)

**Effort total estimate** untuk address semua critical+high: **~30 jam kerja**.
