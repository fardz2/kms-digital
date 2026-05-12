# KMS Digital — Simplify & Redesign Spec

**Tanggal:** 2026-05-12
**Status:** DONE — Plan 1 + 2 + 3 + 4 + 5 implemented. Known gaps di Section 18.
**Repo:** kms-digital (kmslebakwangi.com)
**Stack:** React 18 (CRA) + Ant Design v4 + Bootstrap + Tailwind + TanStack Query v5

---

## 1. Latar Belakang

Aplikasi KMS Digital Lebakwangi adalah dashboard pantau gizi balita yang digunakan oleh 5 role: Orang Tua, Kader Posyandu, Tenaga Kesehatan, Desa, Admin. Feedback dari pengguna (mayoritas boomer, kurang familiar teknologi) menyebut aplikasi "kurang sederhana", dengan permintaan spesifik:

- One-time login (tidak perlu login berulang)
- Fitur laporan bulanan untuk kader dan admin
- Input BB/TB/LK pakai slider (bukan keyboard)
- Field Lingkar Lengan (LILA) opsional untuk balita 7 bulan+
- Tambah kolom catatan per pengukuran
- Level Desa koordinator (dashboard laporan agregat)

## 2. Tujuan

**Goals:**
- Simplify UX untuk user boomer: UI konsisten, satu aksi per layar, tap target besar, typography dibesarkan
- Pertahankan visual aesthetic existing (pink `#FF9999`, rounded hero, bg-dashboard.svg) — tidak boleh terkesan "app berbeda"
- Backend API unchanged — frontend-only refactor
- Arsitektur reusable & konsisten (zero duplikasi fetch, query key, style)

**Non-goals:**
- Ubah logika Z-Score WHO atau chart gizi (keep as-is)
- Tambah test framework (project tidak punya test, tidak prioritas)
- Ganti Ant Design ke library lain
- Convert ke TypeScript

## 3. Ruang Lingkup

**In scope:**
- Redesign arsitektur folder (`api/`, `queries/`, `features/`, `components/ui/`, `theme/`)
- Satu halaman login portal (ganti 4 `/sign-in/*`)
- Slider-based input form (BB, TB, LK, LILA, catatan)
- Dashboard + laporan bulanan untuk kader, desa, admin
- Design tokens (CSS variables) sebagai single source of truth
- Route restructure dengan backward-compat redirect

**Out of scope:**
- Endpoint baru di backend (akan dikonfirmasi terpisah)
- Refactor chart Z-Score (reuse 1:1)
- Push notification, PWA, offline mode

---

## 4. Prinsip Desain

### Locked (tidak berubah)
- Palet: pink `#FF9999` / `#FFB4B4`, accent biru `#3B82F6`, bg-dashboard.svg
- Shape khas: `rounded-b-[50px]` hero, `cssbuttons-io-button`
- Library: Ant Design v4, Bootstrap grid, Tailwind utilities, Chart.js
- API endpoints (`/api/posyandu/*`, `/api/orang-tua/*`, dst.)

### UX Principles (untuk boomer)
- 1 aksi utama per layar, CTA besar jelas
- Input angka hanya via slider + tombol +/- (tidak pernah keyboard)
- Bahasa Indonesia sederhana, hindari istilah teknis
- Feedback instan: toast besar untuk sukses/gagal
- Tap target minimum 48px
- Body text baseline 16px (bukan 14px default antd)

---

## 5. Arsitektur

### 5.1 Struktur folder

```
src/
├── api/
│   ├── client.js                 ← axios instance + interceptor
│   ├── auth.api.js
│   ├── anak.api.js
│   ├── pengukuran.api.js
│   ├── laporan.api.js
│   └── artikel.api.js
│
├── queries/
│   ├── keys.js                   ← query key factory
│   ├── useAnakQueries.js
│   ├── usePengukuranQueries.js
│   ├── useLaporanQueries.js
│   └── useAuthQueries.js
│
├── features/
│   ├── auth/
│   │   ├── LoginPortal.jsx
│   │   ├── LoginForm.jsx
│   │   └── useSession.js
│   ├── pengukuran/
│   │   ├── PengukuranForm.jsx
│   │   ├── CatatanField.jsx
│   │   └── zScore.js
│   ├── anak/
│   │   ├── DaftarAnak.jsx
│   │   ├── DetailAnak.jsx
│   │   └── ChartWHO.jsx
│   ├── laporan/
│   │   ├── LaporanBulananKader.jsx
│   │   ├── LaporanDesa.jsx
│   │   ├── LaporanAdmin.jsx
│   │   └── useRekapBulanan.js
│   ├── kader/BerandaKader.jsx
│   ├── desa/BerandaDesa.jsx
│   ├── orangtua/BerandaOT.jsx
│   ├── tenkes/BerandaTenkes.jsx
│   └── admin/
│
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── PageHeader.jsx
│   │   ├── NumberSlider.jsx
│   │   ├── Modal.jsx
│   │   ├── DataTable.jsx
│   │   ├── Toast.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── StatCard.jsx
│   │   ├── ProgressBar.jsx
│   │   └── MonthPicker.jsx
│   └── layout/
│       ├── AppShell.jsx
│       └── AdminLayout.jsx
│
├── routes/
│   ├── AppRoutes.jsx
│   ├── RequireRole.jsx
│   └── legacyRedirects.js
│
├── theme/
│   ├── tokens.css
│   └── antd-theme.js
│
├── utils/
│   ├── formatDate.js
│   ├── monthDiff.js
│   └── classNames.js
│
└── App.jsx
```

### 5.2 Aturan boundary antar layer

- `api/` → hanya HTTP, tidak import React
- `queries/` → hanya TanStack Query, panggil `api/`
- `features/` → UI + business logic domain, boleh panggil `queries/` dan `components/ui/`
- `components/ui/` → murni presentational, zero import dari `features/` atau `api/`
- `features/X` tidak import dari `features/Y` (sharing via `components/` atau `queries/`)

### 5.3 Migration approach

File lama di `pages/` dan `components/form/` tetap coexist sampai tiap feature selesai dimigrasi. Tidak ada big-bang rewrite. Per phase bisa rilis ke production independen.

---

## 6. Design System

### 6.1 Theme tokens (`src/theme/tokens.css`)

```css
:root {
  /* Brand */
  --color-primary: #FF9999;
  --color-primary-dark: #FF7070;
  --color-primary-light: #FFB4B4;
  --color-accent: #3B82F6;

  /* Status */
  --color-success: #22C55E;
  --color-warning: #FACC15;
  --color-danger:  #EF4444;

  /* Neutrals */
  --color-bg: #FFFFFF;
  --color-surface: #FFF5F5;
  --color-text: #1F2937;
  --color-muted: #6B7280;
  --color-border: #E5E7EB;

  /* Typography */
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 24px;
  --text-display: 48px;

  /* Radius */
  --radius-card: 16px;
  --radius-hero: 50px;
  --radius-button: 8px;

  /* Spacing */
  --space-tap: 48px;
}
```

### 6.2 Komponen UI reusable

| Komponen | Props utama | Dipakai di |
|---|---|---|
| `<Button>` | `variant`, `size`, `loading`, `icon` | semua form & tombol aksi |
| `<PageHeader>` | `title`, `subtitle`, `action` | tiap halaman |
| `<Card>` | `title`, `footer` | list item, info blok |
| `<NumberSlider>` | `min`, `max`, `step`, `value`, `onChange`, `unit`, `zones?` | BB/TB/LK/LILA |
| `<Modal>` | `title`, `open`, `footer` | semua form popup |
| `<DataTable>` | `columns`, `data`, `loading`, `emptyText` | list tabular |
| `<Toast>` | hook `useToast()` | feedback sukses/error |
| `<StatusBadge>` | `status: 'normal'\|'kurang'\|'stunting'\|'obesitas'` | label gizi |
| `<StatCard>` | `label`, `value`, `icon` | ringkasan laporan |
| `<ProgressBar>` | `value`, `max`, `label` | partisipasi % |
| `<MonthPicker>` | `value`, `onChange` | filter laporan |

### 6.3 NumberSlider anatomi

```
┌──────────────────────────────┐
│ Berat Badan                  │
│         8.3 kg               │  ← text-display, bold
│                              │
│ ━━━━━━●━━━━━━━━━━━━━━━━      │  ← track 12px, thumb 28px
│ 0                    20 kg   │
│                              │
│  ┌──────┐         ┌──────┐   │
│  │  −   │         │  +   │   │  ← button 56×56, radius-button
│  └──────┘         └──────┘   │
└──────────────────────────────┘
```

Opsional `zones` prop untuk colored track (hijau/kuning/merah per range).

### 6.4 Aturan design system

- Semua warna dari CSS variables, zero hardcoded hex
- Semua button pakai `<Button>`, tidak ada `<button className="...">` ad-hoc di features
- Antd theme di-override via `antd-theme.js`, hapus override di `global.css`
- Mobile-first

---

## 7. Session & Autentikasi

### 7.1 One-Time Login

Strategi: **persist sampai logout**. Session di localStorage tidak expire di client. Hanya dibersihkan saat backend respons 401 atau user klik logout.

### 7.2 Storage schema (versioned)

Key: `kms_session_v1`

Shape:
```json
{
  "token": { "value": "..." },
  "user": { "id": 1, "name": "...", "role": "KADER_POSYANDU", "posyandu_name": "..." }
}
```

Migration dari key lama `login_data` di Phase 1: kalau ada, baca → tulis ulang ke `kms_session_v1` → hapus yang lama.

### 7.3 useSession hook

```js
// features/auth/useSession.js
export function useSession() {
  const [session, setSession] = useState(() => readSession());

  const login = (data) => {
    writeSession(data);
    setSession(data);
  };

  const logout = () => {
    clearSession();
    queryClient.clear();
    setSession(null);
  };

  return { session, login, logout, isAuthenticated: !!session?.token?.value };
}
```

- `useMemo` digantikan lazy `useState` init → tidak baca localStorage per render
- Tidak ada side-effect navigation di dalam hook (pindah ke `RequireRole`)

### 7.4 LoginPortal

1 halaman `/masuk` dengan role picker (5 tombol) → form login kontekstual per role.

Legacy route `/sign-in`, `/sign-in/admin`, `/sign-in/desa`, `/sign-in/tenaga-kesehatan`, `/sign-in/kader-posyandu` di-redirect ke `/masuk?role=<ROLE>`.

### 7.5 401 handling

axios response interceptor di `api/client.js`:
```js
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      clearSession();
      window.location.href = '/masuk?expired=1';
    }
    return Promise.reject(err.response?.data ?? err);
  }
);
```

Di `/masuk?expired=1`, tampil banner "Sesi Anda berakhir, silakan masuk kembali."

### 7.6 Role gating

```jsx
// routes/RequireRole.jsx
<RequireRole allow={['KADER_POSYANDU']}>
  <DaftarAnak />
</RequireRole>
```

---

## 8. Pengukuran Form (Slider-based)

### 8.1 Bentuk UI — Opsi Simple-1 (satu layar scroll)

Modal berisi semua field vertically stacked, tanpa step navigation. Kader scroll dari atas ke bawah, klik Simpan sekali di bawah.

```
┌──────────────────────────────────┐
│ Pengukuran — Budi (12 bulan)  ×  │
├──────────────────────────────────┤
│ 📅 Tanggal                       │
│    [ 12 Mei 2026 ▾ ]             │
│                                  │
│ ⚖️  Berat Badan                   │
│         8.3 kg                   │
│    ━━━●━━━━━━━━━━                │
│    [−]              [+]          │
│                                  │
│ 📏  Tinggi Badan                 │
│         72.5 cm                  │
│    ━━━━━●━━━━━━━━                │
│    [−]              [+]          │
│                                  │
│ 🧠  Lingkar Kepala               │
│         45.0 cm                  │
│    ━━━━●━━━━━━━━━                │
│    [−]              [+]          │
│                                  │
│ 💪  Lingkar Lengan (opsional)    │  ← tampil hanya jika umur ≥ 7 bulan
│         13.5 cm                  │
│    ━━━●━━━━━━━━━━                │
│    [−]              [+]          │
│                                  │
│ 📝  Catatan (opsional)           │
│   ┌────────────────────────┐     │
│   │                        │     │
│   └────────────────────────┘     │
│                                  │
│  Status Gizi: ✅ NORMAL           │  ← live preview
│                                  │
├──────────────────────────────────┤
│        [  SIMPAN  ]              │
└──────────────────────────────────┘
```

### 8.2 Spec field

| Field | Range slider | Step | Wajib | Kondisi |
|---|---|---|---|---|
| Tanggal pengukuran | DatePicker | - | ✓ | default: hari ini |
| Berat Badan | 0–20 kg | 0.1 | ✓ | - |
| Tinggi Badan | 0–118 cm | 0.5 | ✓ | - |
| Lingkar Kepala | 30–55 cm | 0.1 | ✓ | - |
| Lingkar Lengan (LILA) | 5–20 cm | 0.1 | opsional | umur ≥ 7 bulan |
| Catatan | textarea | - | opsional | placeholder contoh |

### 8.3 Z-Score dihitung di background

Logic dari `FormInputPerkembanganAnak/index.js` di-extract ke `features/pengukuran/zScore.js` (pure function). Kader **tidak melihat angka SD**, hanya label: Normal / Kurang / Stunting / Obesitas via `<StatusBadge>`.

### 8.4 Payload API

```js
POST /api/posyandu/statistik-anak
POST /api/orang-tua/statistik-anak

{
  "id_anak": 1,
  "berat": 8.3,
  "tinggi": 72.5,
  "lingkar_kepala": 45.0,
  "lila": 13.5,            // NEW
  "catatan": "anak sehat", // NEW
  "date": "2026-05-12",
  "z_score_berat": 0,
  "z_score_tinggi": 0,
  "z_score_lingkar_kepala": 0,
  "z_score_gizi": 0
}
```

**Dependency backend:** field `lila` dan `catatan` harus ditambah di tabel pengukuran dan didukung di endpoint POST/PUT/GET. Lihat Section 13.

### 8.5 Edit pengukuran

Pakai komponen `PengukuranForm` yang sama, load initial value dari data existing. Tidak ada `FormUpdatePerkembanganAnak` terpisah.

---

## 9. Laporan Bulanan

**Aturan:** zero data dummy. Semua angka dari API real.

### 9.1 Laporan Kader (`/kader/laporan`)

Scope: posyandu milik kader itu.

Konten:
- Filter bulan (MonthPicker, default: bulan berjalan)
- 3 StatCard: Total Balita, Sudah Diukur, Belum Diukur
- 4 StatCard: Normal, Kurang, Stunting, Obesitas
- List balita belum diukur bulan itu (nama + umur)
- List balita perlu perhatian (status ≠ normal)
- Tombol Export PDF (js-html2pdf) & Excel (xlsx)

### 9.2 Laporan Desa (`/desa/beranda`)

Scope: semua posyandu di wilayah desa itu.

Konten:
- Filter bulan
- Total balita, ProgressBar partisipasi %
- StatusDistribution (4 bar horizontal: normal/kurang/stunting/obesitas)
- DataTable per-posyandu: nama posyandu, total balita, jumlah yang ikut timbang
- Export PDF & Excel

### 9.3 Laporan Admin (`/admin/laporan`)

Sama struktur dengan Laporan Desa, satu level lebih tinggi: breakdown per desa.

### 9.4 Data source strategy

Urutan preferensi:
1. **Ada endpoint rekap dedicated** (ideal, lihat Section 13 B2) → langsung fetch
2. **Fallback aggregate di client**: fetch `/api/posyandu/data-anak` + loop `/api/posyandu/statistik-anak/:id` → group by bulan → hitung stats di client. Cukup untuk kader (< 50 balita). Tidak efisien untuk desa/admin (180+ balita, N+1 request).

### 9.5 Komponen reusable

`<StatCard>`, `<ProgressBar>`, `<StatusDistribution>`, `<MonthPicker>` — dipakai di 3 laporan.

### 9.6 Query keys

- `qk.laporan.kader(posyanduId, bulan)` → `['laporan', 'kader', posyanduId, bulan]`
- `qk.laporan.desa(desaId, bulan)` → `['laporan', 'desa', desaId, bulan]`
- `qk.laporan.admin(bulan)` → `['laporan', 'admin', bulan]`

staleTime: 5 menit. Di-invalidate saat mutation pengukuran (Section 10.4).

---

## 10. Data Layer

### 10.1 axios client (`api/client.js`)

Single instance, baseURL dari env. Request interceptor tambah `Authorization`, response interceptor handle 401.

### 10.2 API modules per domain

Tiap domain punya file `*.api.js` yang export object berisi method. Komponen tidak tahu URL atau token.

Domains: `auth`, `anak`, `pengukuran`, `laporan`, `artikel`.

### 10.3 Query key factory (`queries/keys.js`)

Central object `qk` dengan semua query key. Keuntungan: invalidate terprediksi, typo tertangkap di satu tempat.

### 10.4 Mutation invalidation rules

- Create/update/delete anak → invalidate `qk.anak.all`
- Create/update/delete pengukuran → invalidate `qk.pengukuran.byAnak(id, role)` + `qk.laporan.all` (laporan ikut refresh)

### 10.5 QueryClient defaults

```js
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
  mutations: { retry: 0 }
}
```

### 10.6 QueryBoundary component

```jsx
<QueryBoundary query={usePengukuranAnak(id)}>
  {(data) => <RiwayatPengukuran data={data} />}
</QueryBoundary>
```

Standardize loading skeleton & error UI.

---

## 11. Route Map

| Lama | Baru | Redirect |
|---|---|---|
| `/` | `/` | - |
| `/sign-in` | `/masuk` | lama → baru |
| `/sign-in/admin` | `/masuk?role=ADMIN` | lama → baru |
| `/sign-in/desa` | `/masuk?role=DESA` | lama → baru |
| `/sign-in/tenaga-kesehatan` | `/masuk?role=TENAGA_KESEHATAN` | lama → baru |
| `/sign-in/kader-posyandu` | `/masuk?role=KADER_POSYANDU` | lama → baru |
| `/dashboard` | `/orangtua/balita` | lama → baru |
| `/dashboard/detail/:id` | `/orangtua/balita/:id` | lama → baru |
| `/tanya-jawab` | `/orangtua/forum` | lama → baru |
| `/forum/detail/:id` | `/orangtua/forum/:id` | lama → baru |
| `/my-forum` | `/orangtua/forum/saya` | lama → baru |
| `/kader-posyandu/dashboard` | `/kader/beranda` | lama → baru |
| `/kader-posyandu/dashboard/detail/:id` | `/kader/balita/:id` | lama → baru |
| (baru) | `/kader/balita` | - |
| (baru) | `/kader/laporan` | - |
| `/desa/dashboard` | `/desa/beranda` | lama → baru |
| `/desa/reminder` | `/desa/acara` | lama → baru |
| `/tenaga-kesehatan/dashboard` | `/tenkes/forum` | lama → baru |
| `/tenaga-kesehatan/detail/:id` | `/tenkes/balita/:id` | lama → baru |
| (baru) | `/tenkes/beranda` | - |
| `/admin/dashboard/*` | `/admin/*` (sama) | - |
| (baru) | `/admin/laporan` | - |

Redirect via `<Navigate>` di `AppRoutes.jsx` → link lama tidak broken.

---

## 12. Migration Plan

### Phase 0 — Scaffolding
- Folder baru: `api/`, `queries/`, `features/`, `routes/`, `theme/`
- axios client + interceptors
- tokens.css import di `index.js`
- 8 komponen UI reusable minimal

**Acceptance:** Halaman lama jalan normal. UI baru pakai tokens.

### Phase 1 — Auth & Session
- Pindah `useAuth.js` → `features/auth/useSession.js`
- LoginPortal.jsx (satu halaman, role picker)
- Redirect legacy `/sign-in/*` → `/masuk`
- RequireRole.jsx

**Acceptance:** Login persist, 401 handled, route lama masih jalan via redirect.

### Phase 2 — Dashboard Kader + Daftar Balita
- BerandaKader.jsx (2 card + CTA)
- DaftarAnak.jsx (list card vertical)
- anak.api.js + useAnakQueries.js
- Route `/kader/beranda`, `/kader/balita`

**Acceptance:** Kader lihat daftar balita, search, navigate detail.

### Phase 3 — Pengukuran Form (Slider) — **blocker B1**
- NumberSlider.jsx final
- PengukuranForm.jsx (Opsi Simple-1)
- zScore.js extract dari form lama
- Hook create/update/delete pengukuran
- Integrasi field lila & catatan (butuh backend ready)

**Acceptance:** Input pengukuran via slider, Z-Score tetap terhitung, status gizi live preview. Deprecated: form lama.

### Phase 4 — Detail Balita (Chart + Riwayat)
- DetailAnak.jsx
- ChartWHO.jsx (reuse chart config 1:1)
- Role-based view (OT read-only)

**Acceptance:** Detail page baru replace DetailPosyandu.js. Chart tidak berubah.

### Phase 5 — Laporan Bulanan Kader — **blocker B2 atau fallback**
- LaporanBulananKader.jsx
- StatCard, StatusDistribution, MonthPicker
- Export PDF & Excel

**Acceptance:** Kader buka laporan, pilih bulan, angka real, export jalan.

### Phase 6 — Dashboard Desa
- BerandaDesa.jsx (laporan agregat inline + link acara)
- LaporanDesa.jsx
- KelolaAcara.jsx (pindah dari input_acara.js)

**Acceptance:** Koordinator desa lihat rekap multi-posyandu.

### Phase 7 — Dashboard OT & Tenkes
- BerandaOT.jsx, BerandaTenkes.jsx
- Reuse DetailAnak read-only

**Acceptance:** OT & tenkes pakai AppShell sama.

### Phase 8 — Admin Refresh
- Sidebar tetap, sub-page re-style dengan PageHeader + DataTable
- Menu "Laporan Keseluruhan"
- Hapus `AdminDashboard/index2.js` (duplikat)
- Refactor sub-page ke `features/admin/*`

**Acceptance:** Admin UI konsisten dengan role lain.

### Phase 9 — Cleanup
- Hapus `pages/` lama
- Hapus `components/form/` lama
- Hapus `hook/useAuth.js`
- Hapus CSS tidak dipakai, override `.ant-btn` di `global.css`
- Hapus legacy redirect setelah periode observasi (opsional)

**Acceptance:** Tidak ada "file lama vs baru" coexist.

---

## 13. Backend Dependencies

### Blocker

**B1. Field `lila` & `catatan` di pengukuran** (Phase 3)
- Tabel pengukuran tambah: `lila DECIMAL(4,1) NULL`, `catatan TEXT NULL`
- Endpoint POST/PUT `/api/posyandu/statistik-anak`, `/api/orang-tua/statistik-anak` terima 2 field baru
- Endpoint GET return 2 field baru

**B2. Endpoint rekap laporan bulanan** (Phase 5, 6, 8)

Preferred endpoints:
- `GET /api/posyandu/laporan/bulanan?bulan=YYYY-MM` (scope: posyandu kader)
- `GET /api/desa/laporan/bulanan?bulan=YYYY-MM` (scope: semua posyandu di desa)
- `GET /api/admin/laporan/bulanan?bulan=YYYY-MM` (scope: semua desa)

Response shape (laporan kader):
```json
{
  "total_balita": 25,
  "sudah_diukur": 18,
  "belum_diukur": 7,
  "belum_diukur_list": [
    {"id": 1, "nama": "Budi", "umur_bulan": 12}
  ],
  "distribusi_gizi": {
    "normal": 14,
    "kurang": 3,
    "stunting": 1,
    "obesitas": 0
  },
  "perlu_perhatian": [
    {"id": 5, "nama": "Andi", "status": "stunting"}
  ]
}
```

Response shape (laporan desa):
```json
{
  "total_balita": 180,
  "partisipasi_persen": 72,
  "distribusi_gizi": { "normal": 135, "kurang": 27, "stunting": 13, "obesitas": 5 },
  "per_posyandu": [
    {"id": 1, "nama": "Melati 1", "total": 25, "ikut": 18}
  ]
}
```

Response shape (laporan admin): sama dengan desa, tapi `per_desa` instead of `per_posyandu`.

Fallback jika endpoint belum ada: frontend aggregate di client dari `/api/posyandu/data-anak` + loop `/api/posyandu/statistik-anak/:id`. Acceptable untuk kader (< 50 balita). Suboptimal untuk desa/admin (N+1 request, potensi 180+ balita).

### Confirmation (non-blocking)

**C1.** Token JWT expiration & refresh — ada atau tidak?
**C2.** Endpoint `POST /api/auth/logout` untuk invalidate token server-side — ada atau tidak?
**C3.** User DESA apakah auto-scoped by backend atau frontend kirim `desa_id`?
**C4.** Status gizi string yang di-return backend: apa saja nilainya?

---

## 14. Testing Strategy

Project tidak punya test framework sebelumnya. **Plan 1 menambah test via Jest + React Testing Library** (sudah bundled dengan Create React App — zero install).

Saat ini (Plan 1):
- 4 test suites, 30 tests untuk logic kritis: session storage, query key factory, role mapping, legacy redirects
- Jalankan: `npm test -- --watchAll=false`
- Coverage fokus di pure logic (tidak test component render — dilanjutkan di plan berikutnya sesuai kebutuhan)

Quality gate kombinasi:
- Automated unit test (Jest) untuk logic murni
- Manual regression checklist di `docs/testing-checklist.md` untuk flow end-to-end
- ESLint config existing (`react-app`, `react-app/jest`) tetap
- Preview staging sebelum merge (jika tersedia)

---

## 15. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Backend belum support `lila` & `catatan` | Phase 3 blocker — konfirmasi sebelum mulai |
| Backend belum ada endpoint rekap laporan | Phase 5 fallback aggregate di client |
| User boomer bingung UI baru saat rollout | Tutorial overlay first-time di beranda kader |
| Chart Z-Score rusak saat refactor | Phase 4 reuse config chart 1:1 (copy-paste exact) |
| localStorage schema breaking change | `kms_session_v1` versioned, migrate dari `login_data` di Phase 1 |
| CSS override `.ant-btn` global break styling lama | Hapus di Phase 9 saja, setelah semua feature migrated |

---

## 16. Keputusan Default (dapat di-override saat implementasi)

- **Tutorial overlay first-time**: tidak termasuk di Phase 2. Jika diperlukan, tambah sebagai Phase tambahan setelah Phase 7.
- **Feature flag rollout bertahap**: tidak dipakai. Setiap phase rilis langsung ke semua user; risiko rendah karena redirect legacy menjamin backward-compat.
- **Bahasa UI**: monolingual Bahasa Indonesia. Tidak ada support bilingual (Sunda) di scope ini.

---

## 17. Appendix — Glossary

- **Z-Score**: ukuran deviasi standar dari median WHO, dipakai klasifikasi status gizi
- **LILA**: Lingkar Lengan Atas, indikator gizi alternatif untuk balita ≥ 7 bulan
- **Posyandu**: Pos Pelayanan Terpadu, unit kesehatan RT/RW
- **Kader**: relawan posyandu, input data balita
- **Stunting**: tinggi badan di bawah -2 SD dari median umur (indikator gagal tumbuh kronis)
- **BB/U, TB/U**: Berat Badan per Umur, Tinggi Badan per Umur (kategori Z-Score WHO)

---

## 18. Known Gaps After Plan 5

File legacy yang **tetap dipakai di production** setelah cleanup:

- **Forum**: `src/pages/Post/`, `src/pages/MyPost/`, `src/pages/DetailForum/` belum di-rewrite. Routed untuk role ORANG_TUA & TENAGA_KESEHATAN. Rewrite ke `features/forum/` menunggu prioritas berikutnya.
- **Admin CMS**: `src/pages/AdminDashboard/{ArtikelAdmin,InputPosyandu,RegisterKaderPosyandu,RegisterTenagaKesehatan,InputDesa}.js` + `src/pages/Admin/Desa/DesaPage.js` tetap pakai style & hook lama (`useAuth`). UI tidak konsisten dengan design tokens. Rewrite per-feature di iterasi berikutnya.
- **`src/hook/useAuth.js`** tetap ada karena masih dipakai 8 consumer legacy (Forum pages, Admin CMS, Table component, Navbar, FormInputDataAnak, FormInputPost). Dihapus setelah semua consumer bermigrasi ke `useSession`.
- **`src/components/layout/Navbar/` + `src/components/form/{FormInputDataAnak,FormInputPost,FormInputDataExcel,FormUpdateDataArtikel}/`** tetap dipakai legacy; belum konsisten dengan design tokens.
- **Master data anak edit**: Tidak ada UI edit untuk data anak (nama, tanggal lahir) di redesign. Legacy `FormUpdateDataAnak` dihapus karena konsumernya juga dihapus. Jika user perlu edit data anak, tambah `EditAnak.jsx` di `features/anak/`.

## 19. Status Final

Plan 1 + 2 + 3 + 4 + 5 selesai. Semua Phase 0–9 dari spec terpenuhi kecuali gap di Section 18. Redesign siap rilis ke production setelah manual smoke test.
