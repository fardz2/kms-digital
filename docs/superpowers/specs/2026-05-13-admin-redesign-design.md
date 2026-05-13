# Admin Area Redesign — Design

**Status:** Draft
**Date:** 2026-05-13
**Branch:** staging
**Scope:** Redesign admin area — tambah landing dashboard baru, improve layout 5 CMS pages, enhance sidebar, komponen reusable baru

---

## Context

Aplikasi KMS Digital punya role Admin sebagai pengelola back-office. Admin existing punya 5 halaman CMS + 1 halaman Laporan (placeholder):

- `/admin/dashboard/desa` — kelola desa
- `/admin/dashboard/posyandu` — kelola posyandu
- `/admin/dashboard/kader-posyandu` — registrasi kader
- `/admin/dashboard/tenaga-kesehatan` — registrasi tenaga kesehatan
- `/admin/dashboard/artikel` — kelola artikel (tulis + riwayat dalam 1 page dengan toggle)
- `/admin/dashboard/laporan` — placeholder (backend belum siap)

**Masalah saat ini:**

1. Tidak ada landing dashboard — admin login langsung ke sub-page pertama tanpa konteks
2. Page header 5 halaman seragam (eyebrow + heading + CTA kanan atas), tidak ada karakter per halaman
3. Isi page = toolbar + DataTable tanpa konteks kuantitatif
4. ArtikelAdmin dengan toggle form/riwayat dalam 1 page membuat state hilang saat switch, dan viewport jadi crowd
5. Admin kerja "blind" — tidak tahu ada berapa entity tanpa navigate ke page masing-masing
6. Sidebar flat tanpa entry dashboard
7. Tidak ada activity feed — admin tidak tahu apa yang baru berubah

Tujuan redesign: jadikan admin area sebagai **CMS control center yang berkarakter** — setiap halaman punya konteks kuantitatif, ada quick actions, ada feedback aktivitas.

## Goals

- Halaman landing dashboard baru dengan summary stats + activity feed + quick access
- 5 CMS pages punya inline stat bar di header untuk konteks kuantitatif
- Search dipromosikan dari DataTable toolbar ke page header (lebih discoverable)
- DataTable container punya accent line primary + padding lebih generous
- ArtikelAdmin dipecah jadi 2 page (list + form)
- Sidebar tambah Dashboard entry + collapse/expand toggle dengan persist localStorage
- 3-4 komponen reusable baru: `InlineStatBar`, `ActivityItem`, `EmptyState`, extend `StatCard` & `PageHeader`

## Non-Goals

- Tidak redesign palette atau tipografi (pakai existing: primary pink + deep-slate + Sen)
- Tidak implement endpoint backend baru
- Tidak fix LaporanAdmin beyond placeholder cleanup (backend belum siap)
- Tidak redesign modal form (tambah/edit per page tetap pakai pola existing)
- Tidak redesign role non-admin di spec ini (Kader + Ortu ada spec sendiri)

## Register

product

## Architecture

### Route Changes

```
/admin/dashboard                       → AdminDashboard (BARU) — landing
/admin/dashboard/desa                  → InputDesa (improve header+table)
/admin/dashboard/posyandu              → InputPosyandu
/admin/dashboard/kader-posyandu        → RegisterKaderPosyandu
/admin/dashboard/tenaga-kesehatan      → RegisterTenagaKesehatan
/admin/dashboard/artikel               → ArtikelList (BARU, split dari ArtikelAdmin)
/admin/dashboard/artikel/baru          → ArtikelForm (BARU, split dari ArtikelAdmin)
/admin/dashboard/artikel/:id/ubah      → ArtikelForm edit mode (via FormUpdateDataArtikel existing)
/admin/dashboard/laporan               → LaporanAdmin (tetap placeholder, minor cleanup)
```

Role home ganti dari `/admin/dashboard/desa` → `/admin/dashboard`.

### File Structure

**New files:**
```
src/features/admin/
├── AdminDashboard.jsx          — landing page (greeting, stats grid, 2-col content)
├── AdminStatsGrid.jsx          — 6-card stats grid
├── AdminActivityFeed.jsx       — activity stream 10 items
├── AdminQuickLinks.jsx         — 5 shortcut CMS links
└── useAdminDashboardData.js    — useQueries hook for parallel fetch + merge

src/components/ui/
├── InlineStatBar.jsx           — horizontal flex stats row
├── ActivityItem.jsx            — single activity row
└── EmptyState.jsx              — centered empty state card

src/pages/AdminDashboard/
├── ArtikelList.jsx             — baru, riwayat artikel (split dari ArtikelAdmin)
└── ArtikelForm.jsx             — baru, form tulis artikel (split dari ArtikelAdmin)
```

**Modified files:**
```
src/components/ui/StatCard.jsx       — tambah prop trend, href, loading
src/components/ui/PageHeader.jsx     — tambah slot search, stats
src/components/layout/Dashboard/Sidebar.jsx — tambah Dashboard item + collapse toggle
src/components/layout/Dashboard/DashboardLayout.jsx — integrate collapse state
src/components/layout/Dashboard/sidebarLinks.js — tambah link Dashboard di atas section existing
src/routes/AppRoutes.jsx                   — register route dashboard + artikel split
src/hook/useAuth.js                        — ganti ROLE_HOME admin
src/features/auth/roleHome.js              — ganti ROLE_HOME.ADMIN
src/pages/AdminDashboard/InputDesa.js                — integrate InlineStatBar + accent line
src/pages/AdminDashboard/InputPosyandu.js            — sama
src/pages/AdminDashboard/RegisterKaderPosyandu.js    — sama
src/pages/AdminDashboard/RegisterTenagaKesehatan.js  — sama
src/features/laporan/LaporanAdmin.jsx                — minor cleanup (style consistent)
```

**Deleted files:**
```
src/pages/AdminDashboard/ArtikelAdmin.js  — di-replace ArtikelList + ArtikelForm
```

## Components

### 1. AdminDashboard (landing page)

**Layout:**

```
┌────────────────────────────────────────────────────────┐
│ [Sidebar]  │ PANEL ADMIN · SORE                         │
│            │ Halo, {nama admin}                         │
│            │ Ringkasan aktivitas KMS Digital.           │
│            │                                            │
│            │ [Stats Grid: 6 cards]                      │
│            │                                            │
│            │ ┌─────────────────────┐ ┌────────────────┐ │
│            │ │ Aktivitas Terbaru   │ │ Akses Cepat    │ │
│            │ │ (10 items)          │ │ (5 items)      │ │
│            │ └─────────────────────┘ └────────────────┘ │
└────────────────────────────────────────────────────────┘
```

**Greeting header:** pakai `PageHeader` dengan prop `eyebrow` time-aware ("Panel Admin · Pagi/Siang/Sore/Malam" based on `new Date().getHours()`), title "Halo, {admin.name}", subtitle deskriptif.

**Stats grid:** grid responsive `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`, gap 17px. 6 cards: Desa, Posyandu, Kader, Tenaga Kesehatan, Orang Tua, Artikel.

**2-column content:** grid `grid-cols-1 lg:grid-cols-[1.6fr_1fr]` gap 25px.
- Left: `AdminActivityFeed` dalam card (shadow-card + border light-ash + padding 25px)
- Right: `AdminQuickLinks` dalam card

### 2. AdminStatsGrid

Uses `StatCard` (extended). Setiap card:
- `label` (e.g. "Total Desa")
- `value` (count)
- `icon` (lucide: Home, Building2, Users, Stethoscope, Heart, Newspaper)
- `accent` = `primary`
- `href` = link ke CMS page → card jadi clickable
- `loading` state saat fetch

Count dihitung dari response `list()` endpoint via `data?.length ?? 0`.

### 3. AdminActivityFeed

Merge latest 10 dari 6 entity. Setiap item via `ActivityItem`:

- **Desa baru:** "Desa 'Lebakwangi' ditambahkan" · icon `Home`
- **Posyandu baru:** "Posyandu 'Melati' ditambahkan di Desa X" · icon `Building2`
- **Kader baru:** "Kader {nama} bergabung di Posyandu X" · icon `UserCog`
- **Tenaga Kesehatan baru:** "Tenkes {nama} bergabung" · icon `Stethoscope`
- **Orang Tua baru:** "Orang Tua {nama} mendaftar" · icon `Heart`
- **Artikel baru:** "Artikel '{judul}' diterbitkan" · icon `Newspaper`

Timestamp relative ("2 jam lalu", "kemarin", "3 hari lalu") via moment.
Click → navigate ke detail (`/artikel/:id` untuk artikel, `/admin/dashboard/desa` untuk desa, dst).

**Empty state:** "Belum ada aktivitas 7 hari terakhir." — via `EmptyState` component dengan icon `Inbox`.

**Partial failure banner:** kalau salah satu endpoint gagal, tampil banner subtle di atas feed: "Beberapa data tidak dapat dimuat. Data yang tersedia ditampilkan di bawah." + icon AlertTriangle.

### 4. AdminQuickLinks

5 items, pakai pattern `QuickLink` existing (dipakai BerandaOT/Tenkes):
- Kelola Desa → `/admin/dashboard/desa`
- Kelola Posyandu → `/admin/dashboard/posyandu`
- Kelola Kader → `/admin/dashboard/kader-posyandu`
- Kelola Tenaga Kesehatan → `/admin/dashboard/tenaga-kesehatan`
- Kelola Artikel → `/admin/dashboard/artikel`

Plus item soft-disabled "Laporan Keseluruhan" dengan badge "Segera hadir" kecil.

### 5. useAdminDashboardData hook

```js
export function useAdminDashboardData() {
  const queries = useQueries({
    queries: [
      { queryKey: qk.admin.list('desa'),     queryFn: () => desaApi.list(),     staleTime: 2 * 60 * 1000 },
      { queryKey: qk.admin.list('posyandu'), queryFn: () => posyanduApi.list(), staleTime: 2 * 60 * 1000 },
      { queryKey: qk.admin.list('kader'),    queryFn: () => userApi.listByRole('KADER_POSYANDU'), staleTime: 2 * 60 * 1000 },
      { queryKey: qk.admin.list('nakes'),    queryFn: () => userApi.listByRole('TENAGA_KESEHATAN'), staleTime: 2 * 60 * 1000 },
      { queryKey: qk.admin.list('ortu'),     queryFn: () => userApi.listByRole('ORANG_TUA'), staleTime: 2 * 60 * 1000 },
      { queryKey: qk.admin.list('artikel'),  queryFn: () => artikelApi.list(),  staleTime: 2 * 60 * 1000 },
    ],
    combine: (results) => {
      return {
        isLoading: results.every(r => r.isLoading),
        isError: results.every(r => r.isError),
        hasPartialError: results.some(r => r.isError),
        stats: {
          desa:     results[0].data?.length ?? null,
          posyandu: results[1].data?.length ?? null,
          kader:    results[2].data?.length ?? null,
          nakes:    results[3].data?.length ?? null,
          ortu:     results[4].data?.length ?? null,
          artikel:  results[5].data?.length ?? null,
        },
        activity: mergeActivity(results),
      };
    },
  });
  return queries;
}
```

`mergeActivity` map tiap entity → unified shape `{id, type, title, timestamp, href, icon}`, filter 7 hari terakhir, sort desc, take top 10.

Endpoint list user by role belum ada di API. Check: apakah `GET /api/auth/users?role=X` ada? Kalau tidak, gunakan:
- Kader: `GET /api/posyandu/kader-posyandu` (sudah ada)
- Nakes: `GET /api/posyandu/tenaga-kesehatan` (sudah ada)
- Ortu: `GET /api/posyandu/orang-tua/list` (sudah ada)

### 6. Sidebar Enhancement

**Tambah Dashboard link** di atas existing sections. `sidebarLinks.js`:

```js
export const sidebarlink = [
  {
    title: 'Utama',
    links: [
      { title: 'Dashboard', path: '', icon: LayoutDashboard },  // empty path = /admin/dashboard
    ],
  },
  { title: 'Input Data', links: [...] },
  { title: 'Register Akun', links: [...] },
  { title: 'Laporan', links: [...] },
];
```

**Collapse toggle:**
- Button di top-right sidebar, icon `PanelLeftClose` (expanded) / `PanelLeftOpen` (collapsed)
- Collapsed width 64px, expanded 240px, transition 250ms ease-out-quart
- Collapsed state: hide labels, show icon only, show tooltip on hover (pakai antd Tooltip)
- State persist di `localStorage` key `admin-sidebar-collapsed` (`'1' | '0'`)
- DashboardLayout `main` margin-left responsive ke state collapse

**Role badge kecil** di bawah nama admin (optional polish):
```
[avatar] Admin Budi
         [ADMIN pill] bg-primary-50 text-primary-700 text-caption tracking-wider uppercase
```

### 7. InlineStatBar (baru)

```jsx
<InlineStatBar
  items={[
    { label: "Total", value: 42 },
    { label: "Aktif", value: 38, accent: "success" },
    { label: "Baru bulan ini", value: 4, accent: "primary" },
  ]}
  loading={false}
/>
```

Layout: flex horizontal, gap 33px, divider vertikal 1px light-ash antar item. Mobile: wrap.

Each item:
```
[LABEL uppercase tracking-wide] 
[VALUE display tabular accent-colored]
```

Label `text-caption font-bold uppercase tracking-[0.12em] text-graphite mb-[6px]`.
Value `text-heading-lg font-bold tabular-nums` dengan accent color dari prop.

Loading: value skeleton `w-16 h-8 bg-polar-mist animate-pulse rounded`.

### 8. ActivityItem (baru)

```jsx
<ActivityItem
  icon={<Newspaper />}
  iconAccent="primary"
  title="Artikel 'Gizi Bayi 0-6 Bulan'"
  subtitle="Diterbitkan oleh Admin Budi"
  timestamp="2026-05-13T14:20:00Z"
  href="/artikel/42"
/>
```

Layout:
```
[icon 40x40 rounded-full bg-primary-50] [title / subtitle]  [relative time] [chevron]
```

Hover: bg-primary-50/40 transition-colors. Click: navigate via react-router.

### 9. EmptyState (baru)

Centered column:
```
[lucide icon 48px primary-200]
[title heading bold deep-slate]
[description body-sm graphite max-w-[400px]]
[Button primary optional]
```

Padding 50-67px vertikal. Bisa dipakai di activity feed kosong, table empty, dll.

### 10. StatCard (extend existing)

**Props baru:** `trend`, `href`, `loading`.

```jsx
<StatCard
  label="Total Desa"
  value={42}
  icon={<Home size={22} strokeWidth={1.75} />}
  accent="primary"
  trend={{ value: "+4", label: "bulan ini", type: "up" }}  // optional
  href="/admin/dashboard/desa"                             // optional
  loading={false}
/>
```

Kalau `href` ada: wrap dengan `<Link>`, tambah `hover:border-primary-300 hover:shadow-raised hover:-translate-y-[1px]`. Tambah chevron kecil kanan bawah.

Kalau `trend` ada: render di bawah value:
```
[value]
[arrow icon] +4 bulan ini     // color green untuk up, red untuk down, graphite untuk flat
```

Loading state: skeleton untuk value + label placeholder.

### 11. PageHeader (extend existing)

**Props baru:** `search`, `stats`.

```jsx
<PageHeader
  eyebrow="Data Master"
  title="Kelola Desa"
  subtitle="..."
  search={<input ... />}        // slot row toolbar kanan
  action={<Button>Tambah</Button>}
  stats={<InlineStatBar ... />} // row terpisah di bawah subtitle
/>
```

Layout baru:
```
┌─────────────────────────────────────────────────────┐
│ EYEBROW                            [SEARCH] [+ CTA] │
│ Heading Display                                     │
│ Subtitle                                            │
│ ─────────────────────────────────────────────────── │
│ [Total: 42] [Aktif: 38] [Baru: 4]   ← stats slot   │
└─────────────────────────────────────────────────────┘
```

## Page-level stats per CMS page

### InputDesa

- Total (`data?.length ?? 0`)
- Dengan posyandu (count desa yang `posyandu_count > 0` kalau response include, else hide)
- Baru bulan ini (filter by `created_at` month == current month)

### InputPosyandu

- Total
- Tersebar di N desa (unique `id_desa` count)
- Baru bulan ini

### RegisterKaderPosyandu

- Total
- Disetujui / Belum disetujui (split by status)
- Baru bulan ini

### RegisterTenagaKesehatan

- Total
- Aktif (filter status = 1)
- Baru bulan ini

### ArtikelList (baru, split)

- Total artikel
- Terbit minggu ini (filter `created_at` < 7 days)
- Per kategori (skip kalau data kategori tidak mudah didapat)

## Data Flow — 5 CMS Pages

Setiap page sudah fetch list data utama via `useQuery`. Inline stat bar derive via `useMemo` dari data yang sudah ter-load. Tidak fetch tambahan.

Example InputDesa:
```js
const stats = useMemo(() => {
  const rows = dataSource ?? [];
  return [
    { label: "Total", value: rows.length },
    // skip aktif kalau API response tidak include count posyandu per desa
    {
      label: "Baru bulan ini",
      value: rows.filter(d => isThisMonth(d.created_at)).length,
      accent: "primary"
    },
  ];
}, [dataSource]);
```

Helper `isThisMonth(dateStr)` di `utilities/Format.js`:
```js
export function isThisMonth(dateStr) {
  if (!dateStr) return false;
  const d = moment(dateStr);
  const now = moment();
  return d.year() === now.year() && d.month() === now.month();
}
```

## Error Handling

### Dashboard

- Kalau `isLoading` all → tampil skeleton grid + skeleton feed
- Kalau `isError` all → `EmptyState` "Tidak dapat memuat dashboard" + tombol "Coba lagi" (refetch all)
- Kalau `hasPartialError` → render yang ada + banner subtle di atas feed
- Individual stat card: kalau `data` undefined, show "—"

### Page stats

- Kalau data masih loading: render skeleton (`<InlineStatBar loading />`)
- Kalau data empty: tetap render dengan 0 (bukan hide, supaya consistent)

### Form/action errors

Tidak berubah — tetap pakai antd `message` + inline Form validation. Delete confirm via `Modal.confirm`.

## Artikel Split

Current `ArtikelAdmin.js`:
- Header toggle "Tulis Artikel" / "Riwayat"
- State toggle pakai `statePage`
- Kalau "Tulis": form write + toggle subform "Tambah Kategori"
- Kalau "Riwayat": `<DataTable>` daftar artikel

**Problem:** modal state form hilang saat switch ke Riwayat. View crowd saat scroll form di tengah. Toggle button bisa di-miss user awam yang assume artikel list default.

**Solusi:** 2 page terpisah.

### ArtikelList (`/admin/dashboard/artikel`)

- PageHeader dengan eyebrow "Konten Edukasi", title "Kelola Artikel"
- Action: `<Button href="/admin/dashboard/artikel/baru">+ Tulis Artikel</Button>`
- Stats: Total, Terbit minggu ini
- Isi: `<DataTable>` sama seperti existing "Riwayat"
- Update artikel: row action "Ubah" → buka `FormUpdateDataArtikel` modal existing (tetap modal, karena cuma edit)

### ArtikelForm (`/admin/dashboard/artikel/baru`)

- PageHeader dengan eyebrow "Tulis Baru", title "Artikel Baru"
- Back button "Kembali ke daftar" (lucide ArrowLeft)
- Isi: form existing dari ArtikelAdmin bagian "Tulis Artikel" (ReactQuill, image upload, category select, dll)
- Submit sukses → toast + redirect ke `/admin/dashboard/artikel`
- Submit batal → navigate back

Split ini juga bikin ArtikelForm bisa full-width tanpa crowd dengan table.

## Sidebar collapse implementation

```jsx
// components/layout/Dashboard/useSidebarCollapsed.js
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin-sidebar-collapsed') === '1';
  });
  const toggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  }, []);
  return { collapsed, toggle };
}
```

**Sidebar.jsx** pakai hook ini, render sesuai state:
- Width: `w-[240px]` expanded, `w-[64px]` collapsed
- Transition: `transition-[width] duration-250 ease-out-quart`
- Labels: `{!collapsed && <span>{label}</span>}` conditional render
- Tooltip: pakai antd `<Tooltip placement="right" title={label}>...</Tooltip>` saat collapsed
- Toggle button: fixed di top-right sidebar dengan icon lucide `PanelLeftClose`/`PanelLeftOpen`

**DashboardLayout.jsx** update margin-left main sesuai state:
```jsx
<main className={`transition-all duration-250 ease-out-quart ${
  collapsed ? 'md:ml-[64px]' : 'md:ml-[240px]'
}`}>
```

## Testing Strategy

Project tidak punya component test framework yang jalan untuk UI. Skip automated tests.

**Manual smoke test:**

1. Login sebagai admin → navigate ke `/admin/dashboard`
2. Stats grid: muncul 6 card dengan angka benar (cross-check dengan count manual di page masing-masing)
3. Activity feed: 7-10 item mixed entity, click salah satu → navigate benar
4. Quick Links: 5 link navigate ke CMS page
5. Navigate ke setiap CMS page → inline stat bar muncul dengan nilai sesuai
6. Search di page header (bukan di DataTable toolbar) — filter DataTable
7. Sidebar collapse toggle → state persist after reload
8. Tooltip muncul di item sidebar saat collapsed + hover
9. ArtikelList + ArtikelForm split: navigate `/artikel` vs `/artikel/baru` works, back navigation works, submit form redirect ke list
10. Build lolos (`npm run build`)

## Rollout

Urutan commit:

1. Create `InlineStatBar`, `ActivityItem`, `EmptyState` komponen
2. Extend `StatCard` (trend + href + loading)
3. Extend `PageHeader` (search + stats slot)
4. Create `useAdminDashboardData` hook + `adminApi` helpers kalau diperlukan
5. Create `AdminDashboard` + sub-components
6. Update routes + roleHome
7. Improve Sidebar (Dashboard entry + collapse toggle + useSidebarCollapsed hook)
8. Update DashboardLayout (integrate collapse state)
9. Improve 5 CMS pages one-by-one (integrate InlineStatBar, promote search to header, accent line)
10. Split ArtikelAdmin → ArtikelList + ArtikelForm
11. Minor cleanup LaporanAdmin
12. Final build verification

## Risks

- **Backend endpoint variance:** beberapa endpoint mungkin tidak return `created_at`. Mitigation: stats "Baru bulan ini" gracefully hide kalau field tidak ada.
- **Activity feed performance:** fetch 6 endpoint parallel — bisa berat kalau list besar. Mitigation: staleTime 2 menit + limit activity merge ke 10 item + filter 7 hari supaya tidak process all.
- **Sidebar collapse UX:** user baru bisa hilang orientasi saat icon-only. Mitigation: tooltip wajib, collapse tidak default-on.
- **ArtikelForm state:** form saat ini campur dengan kategori-toggle state. Saat extract ke page terpisah, pastikan state form tetap independent dari kategori state.

## Out of scope (untuk spec berikutnya)

- Kader redesign
- Orang tua redesign
- Tenaga Kesehatan redesign (minor, mostly pakai pattern Admin)
- Desa redesign (sudah improve via Export feature)
- Laporan Admin aggregasi (tunggu backend)
