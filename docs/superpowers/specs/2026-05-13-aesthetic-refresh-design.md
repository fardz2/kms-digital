# Modern Aesthetic Refresh — Tailwind Migration Spec

**Tanggal:** 2026-05-13
**Status:** DONE — Plan 7 implemented and merged.
**Repo:** kms-digital (kmslebakwangi.com)
**Depends on:** Plan 1-6 + approve flow sudah merged ke staging
**Stack:** React 18 (CRA), Tailwind CSS 3.3 (existing), Ant Design v4

---

## 1. Latar Belakang

Setelah Plan 1-6 selesai, aplikasi sudah punya arsitektur bersih, UX flow simple, semua fitur ready. Tetapi tampilan visual terasa "generic":

- Inline styles tersebar di ~25 file komponen → tidak ada design system enforced
- Palet brand (pink `#FF9999`) dipakai flat tanpa hierarchy → terasa monoton
- Typography default antd/Tailwind base → tidak berkarakter
- Layout semua halaman = PageHeader + wrapper card → repetitif
- Tidak ada motion, tidak ada micro-interaction → terasa statis

Tujuan: refresh visual jadi modern & aesthetic dengan 3 constraint ketat:
1. **Brand colors LOCK** — pink `#FF9999` / `#FFB4B4` + accent biru `#3B82F6` tidak berubah
2. **Boomer-friendly** — kontras tinggi, tap target besar, body ≥16px, animasi halus
3. **Full Tailwind** — hapus semua inline styles, hapus `tokens.css`, satu source of truth di `tailwind.config.js`

## 2. Tujuan

**Goals:**
- Design system enforced via Tailwind config (tidak ada hardcoded value di JSX)
- Typography berkarakter: `Plus Jakarta Sans` (display) + `Inter` (body)
- Hierarchy visual jelas lewat scale + weight + color tinting
- Layout variety: 3 max-width pattern (workflow / reading / wide data)
- Motion purposeful: ease-out-quart, max 400ms
- Semua komponen migrasi ke Tailwind className

**Non-goals:**
- Tidak mengubah palet brand
- Tidak menambah fitur fungsional baru
- Tidak ganti Ant Design (DatePicker, Modal tetap dipakai, styling overlay)
- Tidak konversi komponen ke TypeScript

## 3. Ruang Lingkup

**In scope:**
- Extend `tailwind.config.js` dengan full token (colors, typography, shadow, radius, motion)
- Install font via `@fontsource` (self-host, no external CDN)
- Hapus `src/theme/tokens.css` (pindah ke config), hapus `src/global.css` override `.ant-btn` residual
- Migrate 12 file `src/components/ui/` dari inline style → Tailwind className
- Migrate 4 file `src/components/layout/` (AppShell, PosyanduHeader, Navbar legacy, Sidebar legacy)
- Migrate 19+ file `src/features/` (semua halaman: auth, anak, pengukuran, kader, orangtua, tenkes, desa, laporan, artikel, admin)
- Refresh komponen besar (BalitaCard, PengukuranForm, PosyanduHeader, ApproveModal, DataTable wrapper)
- Antd ConfigProvider + theme override agar selaras dengan Tailwind scale

**Out of scope:**
- Legacy pages (`src/pages/Post`, `MyPost`, `DetailForum`, `AdminDashboard/*`, `SignUp`, `LandingPage`, `NotFound`) — styling lama tetap. Phase F opsional, tidak diikat ke plan ini.
- Chart.js styling — config chart WHO di `ChartWHO.jsx` tetap. Hanya wrapper yang di-refresh.
- Form antd internal — Input/Select/Form antd keep default, hanya wrapper + label pakai Tailwind.

---

## 4. Typography System

**Font:**
- Display (heading, button, display numbers): `Plus Jakarta Sans`, weights 400/500/600/700
- Body (paragraph, UI text, form input): `Inter`, weights 400/500/600/700

**Loading:** via `@fontsource` (self-host). Tambah ke `src/index.js`:
```js
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
```

**Scale** (`tailwind.config.js` extend):
```js
fontSize: {
  'caption':  ['0.875rem', { lineHeight: '1.4',  fontWeight: '500' }],
  'overline': ['0.75rem',  { lineHeight: '1.2',  letterSpacing: '0.08em', fontWeight: '600' }],
  'base':     ['1rem',     { lineHeight: '1.6' }],
  'body-lg':  ['1.125rem', { lineHeight: '1.6' }],
  'h3':       ['1.25rem',  { lineHeight: '1.4',  letterSpacing: '-0.01em',  fontWeight: '600' }],
  'h2':       ['1.5rem',   { lineHeight: '1.3',  letterSpacing: '-0.015em', fontWeight: '600' }],
  'h1':       ['2rem',     { lineHeight: '1.2',  letterSpacing: '-0.02em',  fontWeight: '700' }],
  'display':  ['3rem',     { lineHeight: '1.1',  letterSpacing: '-0.025em', fontWeight: '700' }],
}
```

**Rules:**
- Minimum body 16px, heading 20px
- Hierarchy: size + weight combo, tidak pakai size saja
- Contrast ratio antar step ≥ 1.25
- `tabular-nums` untuk semua angka (BB, TB, count, persen)
- Overline uppercase letter-spacing untuk section markers

---

## 5. Color Tokens (dalam palet existing)

```js
colors: {
  primary: {
    50:  '#FFF5F5',
    100: '#FFE5E5',
    200: '#FFCCCC',
    300: '#FFB4B4',  // = existing primary-light
    400: '#FF9999',  // = existing primary (DEFAULT)
    500: '#FF7070',  // = existing primary-dark
    600: '#E54D4D',
    700: '#B32E2E',
    DEFAULT: '#FF9999',
  },
  accent: {
    DEFAULT: '#3B82F6',
    bg: '#EFF6FF',
  },
  neutral: {
    50:  '#FCFAFA',
    100: '#F5F1F1',
    200: '#E8E2E2',
    300: '#D0C8C8',
    500: '#6B6464',
    700: '#3D3838',
    900: '#1F1C1C',
  },
  success: { DEFAULT: '#22C55E', bg: '#ECFDF5' },
  warning: { DEFAULT: '#FACC15', bg: '#FFFBEB' },
  danger:  { DEFAULT: '#EF4444', bg: '#FEF2F2' },
},
```

**Prinsip:**
- Neutral tinted (chroma ~0.005 ke arah pink hue) — bukan cool gray, terasa hangat
- Pink scale 50-700 expand dari 3 warna brand existing — tetap dalam keluarga
- Status colors + pair `bg` untuk soft alert style
- Body text pakai `text-neutral-900` (bukan full black `#000`), heading sama
- Muted text `text-neutral-500`
- Border default `border-neutral-200`

---

## 6. Spacing, Radius, Shadow

```js
borderRadius: {
  'button': '0.625rem',  // 10px — button, input
  'card':   '1rem',      // 16px — card, section
  'hero':   '3rem',      // 48px — PageHeader bottom (existing)
},

boxShadow: {
  'card':   '0 4px 12px rgba(0, 0, 0, 0.06)',
  'raised': '0 8px 24px rgba(255, 153, 153, 0.18)',  // soft pink glow untuk hover
  'hero':   '0 12px 32px rgba(0, 0, 0, 0.12)',
},

spacing: {
  'tap': '3rem',  // 48px minimum tap target
},

maxWidth: {
  'reading':            '65ch',
  'dashboard-content':  'calc(100% - 15rem)',  // keep existing
},
```

**Layout pattern per context:**
- Workflow page (ModePosyandu, DaftarAnak): `max-w-3xl` (~48rem) — list focused
- Reading page (DetailAnak, ArtikelDetail): `max-w-reading` (65ch) — paragraph focused
- Wide data (Laporan): `max-w-5xl` (~64rem) + `grid md:grid-cols-2` — charts side-by-side

---

## 7. Motion

**Plugin:** `tailwindcss-animate` (~2KB).

```js
transitionTimingFunction: {
  'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
  'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
},
transitionDuration: {
  '150': '150ms',
  '250': '250ms',
  '400': '400ms',
},
```

**Rules:**
- Max 400ms untuk layout transition, 250ms untuk micro-interaction, 150ms untuk color/bg
- Selalu ease-out-quart atau ease-out-expo
- **No** bounce, elastic, spring, scale-up-then-down
- Respect `prefers-reduced-motion` via `motion-safe:` prefix untuk motion non-essential
- Page enter: `animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out-quart`
- List item stagger: `animate-in fade-in slide-in-from-bottom-1 duration-250` dengan `style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'backwards' }}`
- Modal open: `data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95`
- Button active: `active:scale-[0.98]` tactile feedback
- Hover lift: `hover:-translate-y-0.5 hover:shadow-card`

---

## 8. Komponen Refresh Detail

### 8.1 Button

4 variant: primary, secondary, ghost, danger. Semua 3 size: sm/md/lg. Base pattern:

```jsx
// Primary
<button className="
  inline-flex items-center justify-center gap-2
  px-5 py-3 min-h-tap
  bg-primary hover:bg-primary-600 active:bg-primary-700
  text-white font-display font-semibold text-base
  rounded-button shadow-sm hover:shadow-raised
  transition-all duration-150 ease-out-quart
  active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2
  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:shadow-sm
" />

// Secondary (pink tinted outline)
bg-primary-50 hover:bg-primary-100 text-primary-700
border border-primary-200
font-display font-semibold

// Ghost (minimal)
text-neutral-700 hover:bg-neutral-100
font-medium

// Danger
bg-danger hover:bg-red-600 text-white
font-display font-semibold
```

### 8.2 Card (3 variants, bukan identical grid)

```jsx
// Compact list item (BalitaCard)
<article className="flex items-start justify-between gap-4 p-5 bg-white border border-neutral-200 rounded-card hover:shadow-card hover:border-primary-200 transition-all duration-200 ease-out-quart">

// Feature block (link cards di BerandaOT/BerandaTenkes)
<article className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-card hover:shadow-raised hover:-translate-y-0.5 transition-all duration-250 ease-out-quart">

// Data surface (section blocks di Laporan, tanpa border)
<section className="p-6 bg-primary-50 rounded-card">
```

### 8.3 PageHeader / PosyanduHeader (branded hero)

Decorative blur circles untuk depth (dalam palet):
```jsx
<header className="relative overflow-hidden bg-primary text-white rounded-b-hero shadow-hero">
  <div aria-hidden className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-300 opacity-50 blur-3xl pointer-events-none" />
  <div aria-hidden className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary-500 opacity-30 blur-3xl pointer-events-none" />
  <div className="relative px-6 py-8 md:py-10 max-w-5xl mx-auto">
    {/* content */}
  </div>
</header>
```

### 8.4 BalitaCard (status-aware border)

Per state treatment:
- Perlu perhatian: `border-danger/30 bg-danger-bg/30` + icon ⚠️ di kiri
- Sudah diukur: `border-success/20 bg-white` + icon ✅
- Belum diukur: `border-neutral-200 bg-white` + bullet ⚪ kecil

3-column flex: icon anchor kiri | content center flex-1 | action kanan. Action tombol varies by state (Ukur primary untuk belum/perhatian; Lihat riwayat + Ulang untuk sudah).

Data display pakai `tabular-nums` + color mix (checkmark success hijau, separator neutral-500, value neutral-900).

### 8.5 ModePosyandu (grouped sections)

3 sections dengan overline markers color-coded:
- "⚠ Perlu perhatian" — `text-overline text-danger`
- "Belum diukur bulan ini" — `text-overline text-neutral-600`
- "✓ Sudah diukur" — `text-overline text-success` + `<details>/<summary>` collapse by default

Count di kanan tiap overline (`tabular-nums`). Stagger animation untuk list items. Sticky footer + Tambah Balita dengan `backdrop-blur`.

### 8.6 PengukuranForm slider

Per field block:
```jsx
<div className="rounded-card border border-neutral-200 bg-white p-5">
  <div className="flex items-baseline justify-between mb-4">
    <label className="text-overline text-neutral-600">Berat Badan</label>
    <div className="text-h3 font-display text-neutral-900 tabular-nums">
      {value.toFixed(1)}<span className="text-base text-neutral-500 ml-1">kg</span>
    </div>
  </div>
  <input type="range" className="..." />
  <div className="flex justify-between text-xs text-neutral-400 mt-1 tabular-nums">
    <span>0</span><span>20 kg</span>
  </div>
  <div className="flex justify-between items-center gap-3 mt-4">
    <button className="w-14 h-14 rounded-full bg-neutral-100 hover:bg-primary-50 text-2xl font-display ...">−</button>
    <div className="text-caption text-neutral-500">Geser atau tap</div>
    <button className="w-14 h-14 rounded-full bg-primary hover:bg-primary-600 text-white text-2xl font-display shadow-raised ...">+</button>
  </div>
</div>
```

Slider track: `bg-gradient-to-r from-primary-100 to-primary-300`. Thumb: 28px bulat dengan `border-4 border-white` + `shadow-raised`.

### 8.7 FilterChip

```jsx
<div className="flex gap-2 flex-wrap">
  {options.map(opt => (
    <button className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full
      text-sm font-medium
      transition-all duration-150
      ${active
        ? 'bg-primary text-white shadow-sm'
        : 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary-200'}
    `}>
      {opt.label}
      {count != null && (
        <span className={`
          px-2 py-0.5 rounded-full text-xs tabular-nums font-semibold
          ${active ? 'bg-white/25' : 'bg-neutral-100'}
        `}>
          {count}
        </span>
      )}
    </button>
  ))}
</div>
```

Chip rounded-full (pill), bukan square. Transisi color + border halus.

### 8.8 StatusBadge

```jsx
const STYLES = {
  normal:    'bg-success-bg text-success',
  kurang:    'bg-warning-bg text-amber-800',
  stunting:  'bg-danger-bg text-danger',
  obesitas:  'bg-danger-bg text-danger',
  unknown:   'bg-neutral-100 text-neutral-500',
};

<span className={`
  inline-flex items-center gap-1 px-2.5 py-1 rounded-full
  text-xs font-semibold uppercase tracking-wide
  ${STYLES[status] ?? STYLES.unknown}
`}>
  {LABEL[status]}
</span>
```

Soft badge style (bg tinted + text color dari family sama), rounded-full, uppercase small caps.

### 8.9 Input / Search

```jsx
<div className="relative">
  <input
    type="search"
    className="
      w-full pl-12 pr-4 py-3
      bg-white border border-neutral-200 rounded-button
      text-base placeholder:text-neutral-400
      focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400
      transition-colors
    "
    placeholder="Cari..."
  />
  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
</div>
```

### 8.10 Antd interop — minimal, no ConfigProvider

Antd v4 pakai Less variables untuk deep theming. Override via Less memerlukan craco atau eject, scope yang tidak sebanding untuk plan ini. Keputusan final:

- **Tidak pakai `ConfigProvider`** custom theme di plan ini
- Antd components (DatePicker, Input, Select, Form item, Modal) keep **default antd styling** di internal
- Tailwind styling diterapkan di **wrapper** (label, container, footer) di sekitar antd component
- Button existing antd (`<Button>` antd) diganti dengan `<Button>` custom kita di scope files — sudah dilakukan sebagian di Plan 1-6
- Font antd otomatis inherit dari `body { font-family: Inter, ... }` yang set via Tailwind

Contoh pattern:
```jsx
// label pakai Tailwind, antd DatePicker inner keep default
<div className="space-y-2">
  <label className="text-overline text-neutral-600">Tanggal Pengukuran</label>
  <DatePicker
    className="w-full"
    // antd built-in styling tetap, hanya width 100% dari Tailwind
  />
</div>
```

Kalau di masa depan user ingin antd deep theme (rounded DatePicker, primary pink di antd Button antd), itu scope plan terpisah (setup craco + Less variable override).

---

## 9. File Structure

**File baru:**
- `tailwind.config.js` — expanded (replace existing 20-line config)

**File dimodifikasi:**
- `src/index.js` — import @fontsource, remove `./theme/tokens.css`
- `src/global.css` — empty atau hanya reset (remove sudah dilakukan di Plan 5)

**File dihapus:**
- `src/theme/tokens.css` (content pindah ke tailwind.config)

**File migrate (~35 file):**

Components (12):
- Button, Card, PageHeader, NumberSlider, Modal, DataTable, Toast, StatusBadge, MonthPicker, StatCard, ProgressBar, StatusDistribution

Layout (4 aktif):
- AppShell, PosyanduHeader (hanya yang new; Navbar legacy dan Sidebar legacy biarkan)

Features (19):
- features/auth: LoginPortal, LoginForm
- features/anak: DetailAnak, RiwayatCard, ChartWHO wrapper (chart config tidak diubah)
- features/pengukuran: PengukuranForm, CatatanField
- features/kader: ModePosyandu, BalitaCard, FilterChip, PosyanduHeader, ApproveModal, classifyBalita (no UI)
- features/orangtua: BerandaOT
- features/tenkes: BerandaTenkes
- features/desa: BerandaDesa, KelolaAcara
- features/laporan: LaporanBulananKader, LaporanDesa, LaporanAdmin
- features/artikel: ArtikelList, ArtikelDetailPage

**Install dependencies:**
```bash
npm install @fontsource/inter @fontsource/plus-jakarta-sans tailwindcss-animate
```

---

## 10. Migration Strategy

6 phase, execute berurutan. Setiap phase build+test harus pass sebelum lanjut.

### Phase A — Tokens & Foundation (1 PR)
1. Update `tailwind.config.js`
2. Install deps (@fontsource-inter, @fontsource-plus-jakarta-sans, tailwindcss-animate)
3. Import font di `src/index.js`
4. Hapus `src/theme/tokens.css`, remove import
5. Set body default: `<body className="font-sans text-base text-neutral-900 bg-neutral-50">` di public/index.html atau App.js
6. Build check, verify existing pages masih render (inline style belum diconvert tapi Tailwind class tambahan tidak konflik)

### Phase B — UI Components (1 PR per 3-4 komponen, atau 1 PR besar)
Migrate per komponen di `src/components/ui/`:
- Button → migrate dulu (dipakai semua)
- StatusBadge, StatCard, ProgressBar, FilterChip, MonthPicker — small, straightforward
- Card — variants
- PageHeader, Modal, DataTable — layout wrappers
- NumberSlider — paling kompleks
- Toast — wrapper antd message

Setiap file:
- Replace `style={{ ... }}` dengan `className="..."`
- Remove `var(--*)` references
- Test visual di 1 page yang pakai komponen tsb

### Phase C — Feature pages (4 batch)
Batch 1: auth (LoginPortal, LoginForm)
Batch 2: kader (ModePosyandu, BalitaCard, FilterChip, PosyanduHeader, ApproveModal)
Batch 3: anak + pengukuran (DetailAnak, RiwayatCard, ChartWHO, PengukuranForm, CatatanField)
Batch 4: OT/Tenkes/Desa/Laporan/Artikel (semua sisanya)

### Phase D — Layout & AppShell
- AppShell navbar refresh
- Integrate ke BerandaOT / BerandaTenkes / BerandaDesa

### Phase E — Antd interop check (minimal)
- Verify antd DatePicker/Modal/Select inherit body font (Inter) via CSS cascade
- Kalau ada ghost text yang putus/kecil di antd, add Tailwind utility di wrapper (no deep theming di plan ini — lihat Section 8.10)

### Phase F — Cleanup
- Audit zero `style={{ }}` di scope files via grep
- Remove `tokens.css` dari repo kalau belum
- Final build + test
- Visual QA via manual test setiap role

---

## 11. Testing Strategy

- **Automated** — 64 unit test existing harus tetap pass (pure logic, tidak terpengaruh styling)
- **Visual regression** — manual test di `docs/testing-checklist.md`, tambah section baru "Visual Aesthetic Refresh":
  - Login portal: 5 role button pill semua tampil rapi
  - BerandaKader / ModePosyandu: header branded, 3 section grouped, cards responsive
  - Detail anak: reading-focused layout, chart tab pill filter jelas
  - Form pengukuran: slider thumb visible, +/- button 56px, status preview card
  - Laporan: stat card grid, progress bar, status distribution color-coded
  - Admin dashboard: sidebar + content layout tidak break (legacy, minimal touches)
- **Lighthouse audit** — target scores: Performance ≥ 90, A11y ≥ 95 (kontras check, focus ring, semantic HTML)

---

## 12. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Legacy pages (Post, MyPost, ArtikelAdmin) styling break karena purge tailwind content | Purge content glob `"./src/**/*.{js,jsx,ts,tsx}"` sudah cover semua file, tidak ada yang miss |
| Bundle size naik signifikan karena font self-host | @fontsource subset loading (hanya weights yang dipakai); + compression dari CRA build. Target total CSS + fonts ≤ 150KB gzipped |
| Antd component visual conflict dengan Tailwind | Antd CSS imported di index.js, Tailwind diatasnya. Tailwind utility dipakai di wrapper, antd inner keep default. Tidak ada konflik selektor. |
| Inline style accidentally left in new PRs | Add ESLint rule `no-inline-styles` (optional strict), atau manual grep di pre-merge |
| Boomer user keluhkan font baru ("kenapa huruf beda?") | Dokumentasikan di rilis notes; kirim preview ke user test sebelum production |
| `@fontsource` paket tidak tersedia di npm Indonesia mirror | Paket standar, tersedia di npm registry global. Verify install di Phase A |

---

## 13. Backend Dependencies

NONE. Pure frontend.

---

## 14. Acceptance Criteria

- ✅ `tailwind.config.js` extended dengan full token (colors 8 scales, typography 8 sizes, shadow 3, radius 3, motion 2 easing)
- ✅ Plus Jakarta Sans + Inter loaded via @fontsource
- ✅ `tokens.css` removed, semua token di tailwind config
- ✅ Zero `style={{ }}` di files di scope (components/ui, features, components/layout/AppShell, components/layout/PosyanduHeader)
- ✅ 64 automated tests pass
- ✅ Build succeeds, bundle ≤ size sebelum + 30KB
- ✅ Manual visual QA pass untuk 5 role utama
- ✅ Lighthouse A11y ≥ 95 di 3 page sample (ModePosyandu, DetailAnak, LaporanBulananKader)
- ✅ Legacy pages masih render tanpa regression (Post, MyPost, ArtikelAdmin, Register*)

---

## 15. Next Plan

Setelah refresh aesthetic merged:
- Optional Phase E legacy pages (Post/MyPost/DetailForum) → refresh ke Tailwind untuk konsistensi total
- Optional dark mode — class `dark:` variant tambahan di token (tidak di scope plan ini)
- Optional page-level personality tambahan (lucide-react icons untuk replace emoji di section markers)
