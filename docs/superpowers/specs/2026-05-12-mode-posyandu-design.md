# Mode Posyandu — Simplify Kader Flow Spec

**Tanggal:** 2026-05-12
**Status:** DONE — Plan 6 implemented and merged.
**Repo:** kms-digital (kmslebakwangi.com)
**Depends on:** Plan 1-5 sudah merged ke staging
**Stack:** React 18 (CRA) + Ant Design v4 + TanStack Query v5

---

## 1. Latar Belakang

Setelah Plan 1-5 selesai, aplikasi sudah punya dashboard kader dengan beranda + daftar balita + detail + laporan + form slider. Tetapi struktur navigasi masih menambah friction yang tidak perlu:

- **Beranda → card "Daftar Balita" → daftar → tap balita → halaman detail → tombol "Ukur"** = 4-5 tap untuk satu balita
- Form pengukuran default dari angka statis (8kg) walaupun balita tsb bulan lalu 11kg — kader harus geser banyak tiap kali
- Status balita (sudah/belum diukur bulan ini, perlu perhatian) tidak visible di daftar — kader tidak tahu progress tanpa cek satu per satu

Inti masalah: **kader butuh fokus input, bukan navigasi.** Seberapa sering kader pakai aplikasi (sekali sebulan, sekali seminggu, visit rumah) tidak mengubah kebutuhan ini — yang penting saat kader buka aplikasi, satu layar cukup.

**Skenario tambahan: input backdated.** Sebelum aplikasi ini dipakai, kader catat data posyandu di buku tulis tangan. Mereka akan migrasi data lampau ke aplikasi sebagai dokumentasi. Artinya kader sering input data dengan tanggal lampau, bukan selalu hari ini. Spec ini harus mendukung kasus tsb tanpa alur khusus — cukup DatePicker di form menerima tanggal lampau (sudah default di antd).

## 2. Tujuan

**Goals:**
- Jadikan `/kader/balita` sebagai "Mode Posyandu": satu layar, satu workflow untuk seluruh sesi input
- Kurangi klik: dari 5 tap/balita jadi 2-3 tap/balita
- Tampilkan progress real-time (X/Y sudah diukur) agar kader tahu status sesi
- Smart default form pengukuran (nilai awal = pengukuran terakhir balita)
- Pertahankan semua fitur existing (laporan, detail riwayat, edit) — hanya ubah struktur

**Non-goals:**
- Tidak merombak form pengukuran (slider, LILA, catatan tetap seperti Plan 2)
- Tidak menyentuh role lain (OT, Desa, Tenkes, Admin)
- Tidak menyentuh chart WHO atau logic Z-Score
- Tidak menambah fitur baru (reminder, offline, bulk action — out of scope)

## 3. Ruang Lingkup

**In scope:**
- Halaman baru `ModePosyandu.jsx` (replaces `BerandaKader.jsx` + `DaftarAnak.jsx`)
- Checklist status per balita: ⚪ belum / ✅ sudah / ⚠️ perlu perhatian
- Filter chip: Semua / Belum diukur / Perlu perhatian
- Tombol "✏️ UKUR" langsung di card balita (skip halaman detail)
- Progress bar header: `X/Y sudah diukur bulan ini`
- Smart default `PengukuranForm`: prefill dari pengukuran terakhir balita
- Legacy redirect `/kader/beranda` → `/kader/balita`
- Update `ROLE_HOME.KADER_POSYANDU` ke `/kader/balita`

**Out of scope:**
- Halaman detail balita (`/kader/balita/:id`) — tetap sama
- Form pengukuran modal — hanya terima prop baru `prefillFrom`
- Laporan, Forum, Artikel
- Role selain Kader

---

## 4. UI Anatomy

### 4.1 Layout keseluruhan

```
┌──────────────────────────────────────────────┐
│  KMS Digital · Posyandu Melati 1             │ ← PosyanduHeader (sticky)
│  Mei 2026 · 18/25 sudah diukur  ▓▓▓▓▓░░ 72% │
│                         [📊 Laporan] [Keluar]│
├──────────────────────────────────────────────┤
│  🔍 Cari nama balita...                      │ ← Search (sticky)
├──────────────────────────────────────────────┤
│  [ Semua ] [ Belum diukur ] [ ⚠️ Perhatian ]  │ ← FilterChip
├──────────────────────────────────────────────┤
│                                              │
│  ⚠️ Andi (24 bln) · Laki-laki · Stunting      │ ← BalitaCard (perhatian)
│     Terakhir: 15 Apr · 9.1kg                 │
│                              [✏️ UKUR]       │
│  ─────────────────────────────────           │
│  ⚪ Budi (12 bln) · Laki-laki                │ ← BalitaCard (belum)
│     Terakhir: 10 Apr · 8.2kg · Normal        │
│                              [✏️ UKUR]       │
│  ─────────────────────────────────           │
│  ✅ Siti (8 bln) · Perempuan                 │ ← BalitaCard (sudah)
│     12 Mei · 7.3kg · TB 68cm · Normal        │
│                     [Lihat riwayat] [Ulang]  │
│  ─────────────────────────────────           │
│  ...                                         │
│                                              │
├──────────────────────────────────────────────┤
│       [ + Tambah Balita Baru ]               │ ← Sticky footer
└──────────────────────────────────────────────┘
```

### 4.2 Icon priority

- `⚠️` merah — balita dengan status gizi ≠ normal (stunting/kurang/obesitas)
- `✅` hijau — balita sudah diukur bulan berjalan, status normal
- `⚪` abu — balita belum diukur bulan berjalan

Sort order default: ⚠️ di atas, lalu ⚪, lalu ✅. Kader langsung lihat prioritas.

**Bulan berjalan** di spec ini = bulan kalender berjalan (`moment().format('YYYY-MM')`). Kalau kader ingin lihat progress bulan lain, bisa ganti via MonthPicker di header (future enhancement, tidak di plan ini).

### 4.3 CTA per state

| State | CTA primer | CTA sekunder |
|---|---|---|
| Belum diukur (⚪) | **✏️ UKUR** | (none) |
| Perlu perhatian (⚠️) | **✏️ UKUR** | (none) |
| Sudah diukur (✅) | **Lihat riwayat** | **Ulang** |

**"Ulang"** = edit pengukuran hari ini (kalau kader salah input dan ingin perbaiki).

### 4.4 Mobile-first

Target device utama: HP kader (Android mid-range). Satu kolom full width. Desktop dapat 2 kolom grid opsional (responsive).

---

## 5. Komponen Baru

### 5.1 `ModePosyandu.jsx` (orchestrator)

- Halaman full-screen
- State: `filter` ('semua' | 'belum' | 'perhatian'), `searchQuery`
- Data: `useAnakList()`, `usePengukuranBulananKader(bulan)`, `useSession()`
- Render: `<PosyanduHeader>`, search input, `<FilterChip>`, list `<BalitaCard>`, sticky footer tombol Tambah
- Modal state: `formOpen`, `formMode` ('create' | 'update' | 'ulang'), `selectedAnak`, `existingPengukuran`

### 5.2 `PosyanduHeader.jsx`

- Props: `posyanduName`, `monthLabel`, `sudahCount`, `totalCount`, `onLaporan`, `onKeluar`
- Render: title, progress bar (`<ProgressBar>` existing), action buttons
- Sticky top

### 5.3 `BalitaCard.jsx`

- Props: `anak`, `pengukuranList`, `currentBulan`, `onUkur`, `onUlang`, `onLihat`
- Derived: `sudahDiukur`, `status`, `latest`, `bulanIniLatest`
- Render: icon state, info ringkas, CTA sesuai state

### 5.4 `FilterChip.jsx`

- Props: `value`, `onChange`, `counts: { semua, belum, perhatian }`
- Render: 3 button dengan active state & count badge

### 5.5 `usePengukuranBulananKader.js`

- Hook yang wrap `useQueries` + return map `{ anakId: [pengukuran[]] }`
- Reuse logic dari `LaporanBulananKader.jsx` tapi di-extract jadi hook
- staleTime 5 menit

---

## 6. Data Flow

### 6.1 Hook baru

```js
// src/queries/usePengukuranBulananKader.js
export function usePengukuranBulananKader() {
  const { role } = useSession();
  const { data: anakList } = useAnakList();

  const queries = useQueries({
    queries: (anakList ?? []).map((anak) => ({
      queryKey: qk.pengukuran.byAnak(anak.id, role),
      queryFn: async () => {
        const res = await pengukuranApi.list(anak.id, role);
        return res.data ?? [];
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!role && !!anak.id,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);

  const pengukuranByAnak = useMemo(() => {
    const map = {};
    (anakList ?? []).forEach((anak, idx) => {
      map[anak.id] = queries[idx]?.data ?? [];
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anakList, queries.map((q) => q.dataUpdatedAt).join(',')]);

  return { pengukuranByAnak, isLoading };
}
```

### 6.2 Derived state di BalitaCard

```js
const currentBulan = moment().format('YYYY-MM');
const bulanIni = pengukuranList.filter(
  (p) => moment(p.date).format('YYYY-MM') === currentBulan
);
const sudahDiukur = bulanIni.length > 0;

const latest = pengukuranList
  .slice()
  .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];

const toZ = (v) => (v == null || v === '' ? null : Number(v));
const status = latest
  ? overallStatus({
      zScoreBB: toZ(latest.z_score_berat),
      zScoreTB: toZ(latest.z_score_tinggi),
      zScoreLK: toZ(latest.z_score_lingkar_kepala),
      zScoreGizi: toZ(latest.z_score_gizi),
    })
  : STATUS.UNKNOWN;

const perluPerhatian =
  status !== STATUS.NORMAL && status !== STATUS.UNKNOWN;
```

### 6.3 Sort order

```js
const sortedAnak = [...anakList].sort((a, b) => {
  const aPriority = getPriority(a); // 0=perhatian, 1=belum, 2=sudah
  const bPriority = getPriority(b);
  if (aPriority !== bPriority) return aPriority - bPriority;
  return (a.nama ?? '').localeCompare(b.nama ?? '');
});
```

### 6.4 Filter logic

```js
const filtered = sortedAnak.filter((anak) => {
  const match = searchQuery
    ? anak.nama.toLowerCase().includes(searchQuery.toLowerCase())
    : true;
  if (!match) return false;

  if (filter === 'belum') return !sudahDiukur(anak);
  if (filter === 'perhatian') return perluPerhatian(anak);
  return true;
});
```

### 6.5 Counts untuk FilterChip badge

```js
const counts = {
  semua: anakList.length,
  belum: anakList.filter((a) => !sudahDiukur(a)).length,
  perhatian: anakList.filter((a) => perluPerhatian(a)).length,
};
```

---

## 7. Smart Default Form

### 7.1 PengukuranForm update

Minor refactor di `PengukuranForm.jsx`:

```jsx
export default function PengukuranForm({ open, onClose, anak, existing, prefillFrom }) {
  // existing → edit mode (dari "Ulang" atau edit dari detail anak)
  // prefillFrom → create mode dengan default values (dari "Ukur" di Mode Posyandu)
  // keduanya null → create mode dengan DEFAULTS statis (existing behavior)

  const isEdit = !!existing;

  useEffect(() => {
    if (!open) return;
    const source = existing ?? prefillFrom;
    if (source) {
      setTanggal(existing?.date ? moment(existing.date) : moment());
      setBerat(Number(source.berat) || DEFAULTS.berat);
      setTinggi(Number(source.tinggi) || DEFAULTS.tinggi);
      setLingkarKepala(Number(source.lingkar_kepala) || DEFAULTS.lingkarKepala);
      setLila(Number(source.lila) || DEFAULTS.lila);
      setCatatan(existing?.catatan ?? '');
    } else {
      // fallback ke DEFAULTS statis
      ...
    }
  }, [open, existing, prefillFrom]);
}
```

### 7.2 Dari ModePosyandu

```js
const handleUkur = (anak) => {
  const latest = pengukuranByAnak[anak.id]?.slice().sort(...)[0];
  const prefillFrom = latest
    ? {
        berat: Number(latest.berat),
        tinggi: Number(latest.tinggi),
        lingkar_kepala: Number(latest.lingkar_kepala),
        lila: Number(latest.lila),
      }
    : null;
  setSelectedAnak(anak);
  setFormMode('create');
  setExistingPengukuran(null);
  setPrefillFrom(prefillFrom);
  setFormOpen(true);
};

const handleUlang = (anak, pengukuranBulanIni) => {
  setSelectedAnak(anak);
  setFormMode('update');
  setExistingPengukuran(pengukuranBulanIni);
  setPrefillFrom(null);
  setFormOpen(true);
};
```

### 7.3 Safety untuk smart default

- Tanggal always default ke hari ini (`moment()`), tidak copy dari `latest.date`. Kader bisa ubah manual di DatePicker untuk input data backdated (DatePicker antd menerima tanggal lampau secara default, tidak perlu config khusus)
- Catatan always kosong untuk create mode (catatan terkait kondisi hari ini, bukan sebelumnya)
- z_score akan dihitung ulang di form saat user simpan (sudah ada di Plan 2)
- Prefill diaktifkan untuk semua pengukuran terakhir tanpa batas waktu cutoff. Kalaupun pengukuran terakhir 6 bulan lalu, kader tetap tinggal geser sedikit dari angka itu, bukan dari 0/default statis. Geser sedikit tetap lebih cepat daripada mulai dari nol.
- "Latest" = pengukuran dengan `p.date` terbaru (tanggal pengukuran sebenarnya), bukan `created_at` (kapan di-input). Jadi data backdated yang lebih tua tidak akan menggeser prefill dari data aktual yang lebih baru.

---

## 8. File Structure

**File baru:**

```
src/features/kader/
├── ModePosyandu.jsx           NEW (~120 lines)
├── PosyanduHeader.jsx         NEW (~80 lines)
├── BalitaCard.jsx             NEW (~130 lines)
└── FilterChip.jsx             NEW (~50 lines)

src/queries/
└── usePengukuranBulananKader.js  NEW (~40 lines)
```

**File dimodifikasi:**

- `src/routes/AppRoutes.jsx` — swap `/kader/balita` ke `ModePosyandu`, `/kader/beranda` redirect
- `src/features/auth/roleHome.js` — `KADER_POSYANDU: '/kader/balita'`
- `src/__tests__/features/auth/roleHome.test.js` — update expectation
- `src/features/pengukuran/PengukuranForm.jsx` — tambah prop `prefillFrom`
- `src/routes/legacyRedirects.js` — tambah `/kader/beranda` → `/kader/balita` (internal, bukan dari legacy lama)

**File dihapus:**

- `src/features/kader/BerandaKader.jsx`
- `src/features/anak/DaftarAnak.jsx`

---

## 9. Route Map

| Route lama | Perubahan |
|---|---|
| `/kader/beranda` | Redirect → `/kader/balita` (via `legacyRedirects`) |
| `/kader/balita` | Render `ModePosyandu` (ganti `DaftarAnak`) |
| `/kader/balita/:id` | **Tidak berubah** — render `DetailAnak` existing |
| `/kader/laporan` | **Tidak berubah** — render `LaporanBulananKader` existing |

`ROLE_HOME.KADER_POSYANDU` ganti dari `/kader/beranda` ke `/kader/balita`.

---

## 10. Migration Plan (Phase Summary)

1. Create `usePengukuranBulananKader` hook
2. Create `BalitaCard` component
3. Create `FilterChip` component
4. Create `PosyanduHeader` component
5. Update `PengukuranForm` terima `prefillFrom`
6. Create `ModePosyandu` orchestrator
7. Swap route `/kader/balita` ke `ModePosyandu`
8. Manual smoke test
9. Delete `BerandaKader.jsx` + `DaftarAnak.jsx`, add legacy redirect
10. Update `roleHome.js` + test
11. Run all tests + build
12. Docs update + final review

Detail task breakdown akan ditulis di file plan terpisah (`2026-05-12-plan-6-mode-posyandu.md`).

---

## 11. Testing Strategy

- **Unit test existing (63)**: tetap pass
- **Test update**: `roleHome.test.js` — expectation `/kader/beranda` → `/kader/balita`
- **Manual regression**: tambah section "Mode Posyandu" di `docs/testing-checklist.md`
  - Login kader → langsung di `/kader/balita`
  - Progress bar reflect progress
  - Filter chip: semua, belum, perhatian (dengan count)
  - Search nama
  - Tap "✏️ UKUR" → form dengan prefill dari bulan lalu
  - Simpan → card auto update ke ✅
  - Tap "Ulang" → form edit mode dengan values existing
  - Tap "Lihat riwayat" → navigate ke detail balita
  - Sticky footer "+ Tambah Balita" selalu accessible

Tidak perlu unit test komponen baru (semua presentational, covered via manual).

---

## 12. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Smart default bikin kader tidak sadar nilai belum di-update → data salah | Tanggal always hari ini (visual cue bahwa ini sesi baru). Angka slider tetap menonjol di layar sehingga kader pasti review sebelum tap Simpan |
| 25+ balita paralel queries lambat | Sudah tested di LaporanBulananKader. Kalau lambat, tambah skeleton loading per card |
| User bookmark `/kader/beranda` | Legacy redirect handles |
| `PengukuranForm` prop `existing` vs `prefillFrom` ambigu | Precedence eksplisit di code: `existing` wins |
| Kader boomer bingung dengan filter chip | Default `'semua'`. Filter hanya bantuan, bukan wajib |
| Delete `BerandaKader.jsx` breaking legacy bookmark | Redirect di route, bukan hapus path |

---

## 13. Backend Dependencies

NONE. Pakai endpoint existing:
- `GET /api/posyandu/data-anak` (sudah)
- `GET /api/posyandu/statistik-anak/:id` (sudah)
- `POST /api/posyandu/statistik-anak` (sudah)
- `PUT /api/posyandu/statistik-anak/:id` (sudah)

---

## 14. Acceptance Criteria

- ✅ Login kader → langsung di `/kader/balita` (auto-redirect dari `/kader/beranda`)
- ✅ Header tampilkan nama posyandu + progress `X/Y`
- ✅ Progress bar update live saat pengukuran tersimpan
- ✅ Filter chip berfungsi dengan count badge
- ✅ Search nama berfungsi
- ✅ Sort order: ⚠️ > ⚪ > ✅
- ✅ Tap "✏️ UKUR" → form dengan prefill (kalau ada data ≤2 bulan lalu)
- ✅ Tap "Ulang" → form edit mode
- ✅ Tap "Lihat riwayat" → navigate ke `/kader/balita/:id` existing
- ✅ Menu laporan + keluar di header
- ✅ Sticky footer "+ Tambah Balita"
- ✅ 63 tests existing tetap pass, roleHome test updated
- ✅ Build sukses tanpa warning baru
- ✅ `BerandaKader.jsx` + `DaftarAnak.jsx` dihapus

---

## 15. Next Plan

Setelah Mode Posyandu merged:
- Optional polish Approach C items (chart tab di atas detail anak, card beranda preview counts di role lain)
- Master data anak edit UI (known gap dari Plan 5 Section 18)
- Forum rewrite (known gap)
- Admin CMS rewrite (known gap)
