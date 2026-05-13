# Design

## Register

product

## Style Reference — 21n (adapted)

> **Architectural blueprint on white marble, warmed by salmon.** Clean lines and precise text on a bright, expansive background, dengan aksen interaktif warna primary pink existing.

**Theme:** light

Desain ini menghadirkan pengalaman digital yang ramah namun berwibawa, seperti perpustakaan pribadi yang tertata rapi. Light theme + ruang putih lebar sebagai latar tenang, diimbangi tipografi tajam dan presisi. Palet nyaris akromatik (cloud white → graphite → deep slate) dengan highlight salmon pink di elemen interaktif — menghasilkan keseimbangan antara kejernihan teknis dan kelembutan lewat tombol pill yang membulat.

**Adaptasi dari 21n:** warna brand pink/salmon existing dari `tailwind.config.js` dipertahankan dan menggantikan "Accent Blue" 21n. Brand identity tetap, strukturnya yang baru.

Untuk konteks posyandu dengan user lansia, pilihan ini bekerja karena:
- Kontras tinggi (deep slate di atas cloud white) mudah dibaca saat layar terkena silau
- Pill button besar dengan radius penuh terasa akrab (mirip tombol aplikasi bank/WhatsApp)
- Monokrom + satu aksen warm berarti mata tidak lelah setelah pemakaian panjang
- Satu font family (Sen) menurunkan cognitive load
- Pink salmon tetap dipakai tapi hemat — untuk titik keputusan, bukan latar besar

## Color Strategy

**Restrained + warmth.** Permukaan dominan cloud white / faint fog. Primary pink dipakai untuk elemen interaktif (link, tombol primary, state aktif sidebar, sort indicator, focus ring). Warna tinggi saturasi tidak pernah mengisi latar besar.

Perbedaan dari state existing:
- Sekarang pink dipakai di banyak permukaan (header tabel `bg-primary-300`, sidebar, badge) — ini membuat UI terasa "penuh"
- Baru: pink hanya di titik keputusan. Latar tetap netral.

## Color Tokens

### Palet netral 21n (baru)

| Name | Value | Token Tailwind | Role |
|------|-------|----------------|------|
| Cloud White | `#ffffff` | `white` | Background halaman, teks di tombol gelap, isi ikon |
| Faint Fog | `#f9f9fb` | `neutral-50` (overwrite) | Latar UI halus, body background |
| Polar Mist | `#eff0f6` | `neutral-100` (overwrite) | Section block, row stripe, active state bg |
| Light Ash | `#e5e7eb` | `neutral-200` (overwrite) | Border, divider, edge card |
| Graphite | `#545454` | `neutral-500` (overwrite) | Teks sekunder, placeholder |
| Deep Slate | `#333333` | `neutral-700` / `neutral-900` (overwrite) | Teks primer, heading, ikon menonjol |

### Palet primary (existing — dipertahankan)

| Name | Value | Token Tailwind | Role |
|------|-------|----------------|------|
| Pink 50 | `#FFF5F5` | `primary-50` | Hover bg, badge soft |
| Pink 100 | `#FFE5E5` | `primary-100` | Badge bg |
| Pink 200 | `#FFCCCC` | `primary-200` | Border subtle accent |
| Pink 300 | `#FFB4B4` | `primary-300` | Accent ringan |
| Pink 400 | `#FF9999` | `primary-400` / `primary` DEFAULT | Aksen, icon tersortir |
| Pink 500 | `#FF7070` | `primary-500` | CTA utama |
| Pink 600 | `#E54D4D` | `primary-600` | CTA hover, state aktif link |
| Pink 700 | `#B32E2E` | `primary-700` | Teks accent, badge text |

### Status colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Accent Green | `#24b26d` | `success` | Sukses, indikator positif |
| Warning | `#facc15` | `warning` | Pesan warning |
| Danger | `#ef4444` | `danger` | Error, delete action |

## Typography

**Satu font: Sen.** Geometric sans dengan terminal agak bulat — modern untuk heading, nyaman untuk body. Inter dan Plus Jakarta Sans digantikan Sen.

Substitute font stack: `Sen, system-ui, sans-serif`.
Weights yang dipakai: 400, 500, 600, 700.

### Type Scale

| Role | Size | Line Height | Token Tailwind |
|------|------|-------------|----------------|
| caption | 13px | 1.75 | `text-caption` |
| body-sm | 15px | 1.75 | `text-body-sm` |
| base / body | 16px | 1.6 | `text-base` |
| heading-sm | 19px | 1.5 | `text-heading-sm` |
| heading | 22px | 1.25 | `text-heading` |
| heading-lg | 36px | 1.25 | `text-heading-lg` |
| display | 44px | 1.07 | `text-display` |
| display-lg | 56px | 1.07 | `text-display-lg` |

**Aturan hirarki:**
- Heading ≥36px: weight **700**, warna Deep Slate
- Heading 19–22px: weight **600**, warna Deep Slate
- Body: weight **400**, warna Deep Slate
- Secondary text/caption: weight **400**, warna Graphite

Minimum ukuran teks di UI: 15px (`body-sm`). Jangan turun ke 13px untuk "density" — user lansia butuh readability.

## Spacing & Shapes

**Base unit:** 4px.
**Density:** comfortable.

### Spacing Scale (tambahan non-standar 21n)

| Name | Value | Token Tailwind |
|------|-------|----------------|
| 4 | 4px | `space-1` |
| 6 | 6px | `space-1.5` |
| 8 | 8px | `space-2` |
| 13 | 13px | custom `space-13` |
| 17 | 17px | custom `space-17` |
| 21 | 21px | custom `space-21` |
| 25 | 25px | custom `space-25` |
| 29 | 29px | custom `space-29` |
| 33 | 33px | custom `space-33` |
| 38 | 38px | custom `space-38` |
| 50 | 50px | custom `space-50` |
| 67 | 67px | custom `space-67` |
| 84 | 84px | custom `space-84` |
| 90 | 90px | custom `space-90` |
| 95 | 95px | custom `space-95` |
| 134 | 134px | custom `space-134` |

Skala ini jarak tidak konsisten (4, 6, 8, 13, 17, 21...) — intensional dari reference untuk menghindari "perfect rhythm" yang terlihat buatan mesin.

### Border Radius

| Element | Value | Token |
|---------|-------|-------|
| Pills (tombol utama, tag) | 9999px | `rounded-full` / `rounded-pill` |
| Buttons (standar/sekunder) | 12.53px | `rounded-button` |
| Default (card, input) | 6.26px | `rounded-default` |

### Layout

- **Page max-width:** 1247px (centered, `max-w-page mx-auto`)
- **Section gap vertikal:** 50px
- **Card padding:** 25px
- **Gap elemen dalam row:** 4px

## Theme

**Light only.** Kader posyandu kerja siang hari di balai desa yang terang. Dark mode ditolak — out of scope.

## Component Conventions

### Button

Tiga varian:

**1. Default (aksi standar, sekunder)**
```
bg-white text-deep-slate
border border-light-ash
rounded-button px-[25px] py-[17px]
hover:bg-faint-fog
```

**2. Primary (aksi utama — pill)**
```
bg-primary-500 text-white        /* #FF7070 — lebih "matang" daripada 400 */
rounded-full px-[25px] py-[17px]
font-medium
hover:bg-primary-600             /* #E54D4D */
```
Pink 500 → Pink 600 hover. Pill shape untuk CTA utama (Simpan, Tambah, Approve).

**Alternatif Primary dark** (untuk kontras tertinggi di halaman dengan banyak warna netral):
```
bg-deep-slate text-white
rounded-full px-[25px] py-[17px]
hover:bg-primary-600
```

**3. Pill Secondary (tag, aksi ringan)**
```
bg-transparent text-deep-slate
rounded-full px-[12.53px] py-0
hover:bg-polar-mist
```

**4. Destructive**
```
bg-white text-danger
border border-danger/30
rounded-button px-[25px] py-[17px]
hover:bg-danger hover:text-white
```

**Minimum tinggi tap target:** 44px. Jangan pakai antd `size="small"` (32px terlalu kecil untuk user lansia).

### Form Field

- Label di atas input (vertikal)
- Input: `h-[52px]`, `bg-white`, `border border-light-ash`, `rounded-default`, `px-[17px] text-base`
- Focus: `border-primary-500` + `ring-1 ring-primary-500`
- Placeholder: warna `graphite` weight 400
- Error state: `border-danger` + message di bawah input warna `danger`

### Modal

- Lebar 600px default
- Background `bg-white`, border `border-light-ash`
- `rounded-default` (6.26px) untuk modal body
- Header teks 22px weight 600, Deep Slate
- Close button top-right dengan ikon `X` lucide atau label "Tutup" jelas terlihat
- Footer: tombol Batal (Default variant) + Simpan (Primary pink pill) rata kanan, gap 13px

### Card / Section Block

- Background `bg-white` di atas `bg-faint-fog` page
- Border `border border-light-ash`, tanpa shadow
- Padding internal **25px**
- Radius `rounded-default` (6.26px)
- Tidak pernah nested

### Table (DataTable custom)

Perubahan dari state saat ini:

| Area | Sekarang | Baru |
|------|----------|------|
| Container | `rounded-card` + `shadow-card` | `rounded-default` + `border-light-ash`, no shadow |
| Header | `bg-primary-300 text-white text-overline` | `bg-polar-mist text-deep-slate text-caption font-semibold uppercase tracking-wider` |
| Row hover | `bg-primary-50/40` | `bg-faint-fog` |
| Cell | `px-4 py-3 text-sm` | `px-[17px] py-[13px] text-body-sm` |
| Sort icon color | `text-white/80` | `text-deep-slate` (active) / `text-graphite` (inactive) |
| Pagination active | `bg-primary text-white` | `bg-deep-slate text-white rounded-full` |

Pink tetap muncul di sort indicator aktif dan row selected, tapi header berubah tenang.

### Sidebar / Navigation

- Background `bg-white`, border kanan `border-light-ash`
- Item: tinggi **50px**, padding horizontal 21px
- Item icon: lucide 20px, warna `graphite` (inactive) / `primary-600` (active)
- Item label: 15px weight 500, warna `deep-slate`
- **Active state:** `bg-polar-mist`, ikon ganti ke `primary-600`, text weight 600
  (TIDAK side-stripe border — impeccable ban)
- Hover inactive: `bg-faint-fog`

### Icon

- **Library:** `lucide-react` (exclusive untuk elemen baru, `@ant-design/icons` di-deprecate)
- Ukuran standar: 20px di button, 16px inline teks
- Stroke width: `1.75` (default lucide)
- Warna default: currentColor
- Icon selalu dengan label teks, kecuali close/more-menu universal

### Badge / Tag / Status Pill

- Bentuk: `rounded-full`
- Padding: `px-[13px] py-[4px]`
- Size: 13px weight 500
- Varian:
  - Default: `bg-polar-mist text-graphite`
  - Success: `bg-success/10 text-success` (#24b26d)
  - Warning: `bg-warning/15 text-[#8a6200]`
  - Danger: `bg-danger/10 text-danger`
  - Primary (pink): `bg-primary-100 text-primary-700`

## Motion

- Durasi default 150ms
- Easing: `cubic-bezier(0.25, 1, 0.5, 1)` (out-quart) — sudah ada di token existing
- Hanya animasi opacity + transform. Tidak pernah width/height.
- Tidak ada bounce, tidak ada elastic.
- Hover transition hanya pada background-color dan border-color.

## Absolute Bans

- **Side-stripe border** > 1px sebagai accent
- **Gradient text** (`background-clip: text`) untuk heading
- **Glassmorphism** dekoratif
- **Card grid 3 identik** "icon + heading + text"
- **Hero-metric template** (big number + label + gradient accent)
- **Modal** untuk aksi remeh
- **Em dash** di copy
- **Shadow dekoratif.** Sistem flat — kedalaman cukup lewat border Light Ash
- **Gradient** apapun
- **Background gelap** untuk area konten utama

## Do's and Don'ts

### Do

- Sen weight 700 untuk display heading ≥36px, Deep Slate
- Hirarki visual via Deep Slate (primer) vs Graphite (sekunder)
- Light Ash untuk semua border dan divider primer
- Rounded-full untuk tombol aksi utama
- Pink Primary 500 untuk CTA utama, Pink 600 untuk hover dan link aktif
- Padding content block: 25px horizontal, 17px vertikal
- Section transition di atas Cloud White/Faint Fog
- Pink hemat — max ~10% permukaan visual (restrained)

### Don't

- Jangan warna saturasi tinggi untuk background lebar
- Jangan keluar dari Sen
- Jangan custom shadow — border color subtle saja
- Jangan sudut tajam untuk UI primer (min radius 6.26px)
- Jangan padatkan teks
- Jangan background gelap untuk area konten utama
- Jangan gradient
- Jangan isi seluruh header / sidebar / banner dengan pink — pink adalah aksen, bukan skin

## Imagery & Illustration

- Foto produk atau screenshot: frame netral, tanpa border, tanpa shadow
- Abstract background graphic hanya untuk landing — TIDAK untuk admin/produktif
- Ikon: `lucide-react`, monokrom currentColor
- Avatar: inisial di atas Polar Mist, tidak foto default
- Empty state: lucide icon besar (64px) warna graphite di atas Faint Fog + teks

## Layout Principles

- **Page max-width:** 1247px centered
- **Vertical rhythm:** 50px antar section utama
- **Admin layout:** sidebar 240px kiri, konten fluid hingga 1247px, top nav 76px
- **Content density:** comfortable — jangan kompres

## Agent Prompt Guide (quick reference)

### Warna inti

- Text primary: `#333333` (Deep Slate)
- Background page: `#f9f9fb` (Faint Fog) untuk admin, `#ffffff` untuk landing
- Button primary bg: `#FF7070` (primary-500), text `#ffffff`, hover `#E54D4D` (primary-600)
- Border default: `#e5e7eb` (Light Ash)
- Accent interactive: `#FF7070` (Pink 500) / `#E54D4D` (Pink 600) untuk hover & link
- Success: `#24b26d`

### Example components

**Button primary (pill pink):**
```jsx
<button className="bg-primary-500 hover:bg-primary-600 text-white rounded-full px-[25px] py-[17px] font-medium text-base transition-colors duration-150 ease-out-quart">
  Simpan
</button>
```

**Button primary dark (alternatif):**
```jsx
<button className="bg-deep-slate hover:bg-primary-600 text-white rounded-full px-[25px] py-[17px] font-medium text-base transition-colors duration-150">
  Lanjut
</button>
```

**Button default:**
```jsx
<button className="bg-white border border-light-ash text-deep-slate rounded-button px-[25px] py-[17px] text-base hover:bg-faint-fog transition-colors duration-150">
  Batal
</button>
```

**Card block:**
```jsx
<div className="bg-white border border-light-ash rounded-default p-[25px]">
  <h2 className="text-heading font-semibold text-deep-slate">Daftar Desa</h2>
  <p className="text-body-sm text-graphite mt-[13px]">...</p>
</div>
```

**Input field:**
```jsx
<label className="block">
  <span className="text-body-sm font-medium text-deep-slate">Nama Desa</span>
  <input
    className="mt-[6px] block w-full h-[52px] bg-white border border-light-ash rounded-default px-[17px] text-base text-deep-slate placeholder:text-graphite focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
    placeholder="Masukkan nama desa"
  />
</label>
```

## Similar Aesthetic References

- **Notion** — minimalism, ample whitespace, fokus tipografi
- **Obsidian** — UI fungsional, minimal ornamentation, font tunggal elegan
- **Linear** — monokrom disempurnakan, tipografi presisi
- Adaptasi dari 21n "Architectural blueprint on white marble" dengan primary salmon existing

## Migration Notes (dari state existing)

Berkas yang perlu diupdate ketika refactor dimulai:

### 1. `package.json`
Tambah: `@fontsource/sen`
Hapus setelah semua halaman termigrasi: `@fontsource/inter`, `@fontsource/plus-jakarta-sans`

### 2. `src/index.js` / entry point
Import `@fontsource/sen` dengan weights 400, 500, 600, 700. Hapus import Inter + Plus Jakarta Sans.

### 3. `tailwind.config.js`

Ganti `theme.extend`:

```js
extend: {
  colors: {
    // Palet pink EXISTING dipertahankan
    primary: {
      50:  '#FFF5F5',
      100: '#FFE5E5',
      200: '#FFCCCC',
      300: '#FFB4B4',
      400: '#FF9999',
      500: '#FF7070',
      600: '#E54D4D',
      700: '#B32E2E',
      DEFAULT: '#FF7070',  // ganti default dari 400 → 500 supaya CTA lebih kuat kontras
    },
    // Palet netral 21n (menggantikan existing neutral)
    'cloud-white': '#ffffff',
    'faint-fog':   '#f9f9fb',
    'polar-mist':  '#eff0f6',
    'light-ash':   '#e5e7eb',
    'graphite':    '#545454',
    'deep-slate':  '#333333',
    neutral: {
      50:  '#f9f9fb',   // Faint Fog
      100: '#eff0f6',   // Polar Mist
      200: '#e5e7eb',   // Light Ash
      500: '#545454',   // Graphite
      700: '#333333',   // Deep Slate
      900: '#333333',
    },
    accent: { DEFAULT: '#3B82F6', bg: '#EFF6FF' }, // keep existing untuk backward compat
    success: { DEFAULT: '#24b26d', bg: '#ecfdf5' },
    warning: { DEFAULT: '#facc15', bg: '#fffbeb' },
    danger:  { DEFAULT: '#ef4444', bg: '#fef2f2' },
  },
  fontFamily: {
    sans:    ['Sen', 'system-ui', 'sans-serif'],
    display: ['Sen', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    'caption':    ['13px', { lineHeight: '1.75' }],
    'body-sm':    ['15px', { lineHeight: '1.75' }],
    'base':       ['16px', { lineHeight: '1.6' }],
    'overline':   ['13px', { lineHeight: '1.2',  letterSpacing: '0.08em', fontWeight: '600' }], // keep
    'heading-sm': ['19px', { lineHeight: '1.5',  fontWeight: '600' }],
    'heading':    ['22px', { lineHeight: '1.25', fontWeight: '600' }],
    'heading-lg': ['36px', { lineHeight: '1.25', fontWeight: '700' }],
    'display':    ['44px', { lineHeight: '1.07', fontWeight: '700' }],
    'display-lg': ['56px', { lineHeight: '1.07', fontWeight: '700' }],
    // Keep legacy tokens for gradual migration
    'h1':         ['2rem',   { lineHeight: '1.2',  letterSpacing: '-0.02em',  fontWeight: '700' }],
    'h2':         ['1.5rem', { lineHeight: '1.3',  letterSpacing: '-0.015em', fontWeight: '600' }],
    'h3':         ['1.25rem',{ lineHeight: '1.4',  letterSpacing: '-0.01em',  fontWeight: '600' }],
    'body-lg':    ['1.125rem', { lineHeight: '1.6' }],
  },
  spacing: {
    '13':  '13px',
    '17':  '17px',
    '21':  '21px',
    '25':  '25px',
    '29':  '29px',
    '33':  '33px',
    '38':  '38px',
    '50':  '50px',
    '67':  '67px',
    '84':  '84px',
    '90':  '90px',
    '95':  '95px',
    '134': '134px',
    'tap': '3rem', // keep existing
  },
  borderRadius: {
    'default': '6.26px',
    'button':  '12.53px',   // overwrite existing 10px → 12.53px
    'card':    '1rem',      // keep existing for backward compat
    'pill':    '9999px',
    'hero':    '3rem',      // keep
  },
  boxShadow: {
    // Sistem flat — hapus dekoratif
    'card':   '0 1px 2px rgba(0, 0, 0, 0.04)', // very subtle
    'none':   'none',
  },
  maxWidth: {
    'reading': '65ch',
    'page':    '1247px',
    'dashboard-content': 'calc(100% - 240px)',
  },
  transitionTimingFunction: {
    'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
    'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  transitionDuration: {
    '150': '150ms',
    '250': '250ms',
    '400': '400ms',
  },
},
```

**Catatan migrasi:** token existing `rounded-card`, `rounded-button`, `shadow-card`, `text-h1/h2/h3` tetap ada untuk backward compatibility — supaya 5 admin page yang baru saja migrate masih build. Migrasi ke token baru (`rounded-default`, `text-heading`, dll) dilakukan per-halaman.

### 4. `src/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }

body {
  margin: 0;
  font-family: 'Sen', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #333333;
  background: #f9f9fb;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* { box-sizing: border-box; }

.ant-select, .ant-input, .ant-picker, .ant-modal, .ant-message {
  font-family: inherit;
}
```

### 5. Komponen yang butuh update (fase 1)

| Komponen | Perubahan utama |
|----------|----------------|
| `components/ui/DataTable/*` | Header bg `primary-300` → `polar-mist`, sort icon color deep-slate, row hover faint-fog, container shadow hilang |
| `components/layout/Dashboard/Sidebar` | Bg white, item aktif `bg-polar-mist` + icon `primary-600` |
| `components/layout/Navbar/*` | Bg white, border bottom `light-ash` |
| Button reusable | Buat `components/ui/Button.jsx` dengan 4 varian (Default / Primary pink / Primary dark / Destructive) |
| Form field reusable | Buat `components/ui/FormField.jsx` — label + input style baru |
| 5 admin pages | Button inline `bg-primary` tetap jalan (primary default ganti ke 500), tapi migrasi ke `<Button variant="primary">` saat refactor |

## Scope refactor fase 1

1. Install Sen + update `tailwind.config.js` + `global.css` + import di entry (warna existing aman, token lama aman)
2. Refactor `components/layout/Dashboard/` (Sidebar + layout — paling sering dilihat kader)
3. Refactor `components/ui/DataTable/` (header color, row hover, container flat)
4. Buat `components/ui/Button.jsx` + `components/ui/FormField.jsx` reusable
5. Migrasi 5 admin pages ke komponen baru + token baru (button pink pill, card flat, form field baru)

Fase berikutnya (scope terpisah): Landing, Login, Orang Tua portal, Navbar, Footer.
