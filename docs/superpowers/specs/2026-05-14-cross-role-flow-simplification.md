# Simplifikasi Alur Lintas-Role — Design Spec

**Tanggal:** 2026-05-14
**Status:** Draft, awaiting user review.
**Repo:** kms-digital
**Stack:** React 18 (CRA), React Router v6, Ant Design v4, Tailwind CSS 3
**Tidak ada perubahan API.**

---

## 1. Latar Belakang

Setelah Plan 1-8 selesai (struktur clean, Tailwind migration, aesthetic refresh), aplikasi punya beberapa friction sisa di sisi UX:

- **Kader Posyandu:** halaman utama overload dengan 5 modal/sheet (PengukuranForm, FormInputDataAnak, ApproveModal, OrangTuaModal, plus link ke laporan). Manage akun orang tua bercampur dengan workflow ukur balita.
- **Orang Tua:** entry "Postingan Saya" tidak ditampilkan di Beranda; user harus tahu URL `/orangtua/forum/saya` untuk menemukannya.
- **Desa:** 2 page (`/desa/beranda` + `/desa/acara`) untuk fungsi yang sebenarnya bisa ditampilkan dalam 1 page.
- **Tenaga Kesehatan:** Beranda hanya berisi 2 link card (Forum + Artikel) yang sudah ada di navbar. Halaman ini tidak menambah informasi.
- **Admin:** dashboard punya `AdminQuickLinks` yang duplikat sidebar nav. Sidebar pakai label developer ("Input Data", "Register Akun") yang kurang ramah admin awam.

## 2. Tujuan

Sederhanakan UI tanpa menyentuh backend. Goals:

- Kurangi jumlah modal di halaman utama kader.
- Hilangkan duplikasi navigasi (sidebar admin vs QuickLinks, beranda tenkes vs navbar).
- Gabungkan page yang fungsinya sangat kecil (Desa Acara, BerandaTenkes).
- Gunakan label yang lebih ramah end-user (Sidebar admin).

**Non-goals:**
- Tidak mengubah endpoint API atau model data.
- Tidak mengubah role-based access control.
- Tidak menyentuh `PengukuranForm` dan `FormInputDataAnak` (memang harus modal karena konteks workflow).
- Tidak refactor besar arsitektur — semua perubahan tetap di layer page/feature.

## 3. Ruang Lingkup

**In scope:**

| Role | Perubahan |
|---|---|
| Kader | Buat page `/kader/orangtua` baru (gabungan Approve + OrangTua) |
| Kader | Hapus tombol "Kelola OT" di PosyanduHeader, simplify "Approve (X)" jadi "Akun Orang Tua (X)" |
| Orang Tua | Tambah tab "Semua / Punya Saya" di `/orangtua/forum` |
| Orang Tua | `/orangtua/forum/saya` di-redirect ke `/orangtua/forum?tab=saya` |
| Desa | Embed `KelolaAcara` sebagai section di `BerandaDesa` |
| Desa | `/desa/acara` di-redirect ke `/desa/beranda` (anchor #acara) |
| Tenkes | Hapus `BerandaTenkes`, ubah `roleHome.TENAGA_KESEHATAN` ke `/tenkes/forum` |
| Tenkes | `/tenkes/beranda` di-redirect ke `/tenkes/forum` |
| Admin | Hapus `AdminQuickLinks`, ganti layout dashboard jadi single-column (Stats grid → Activity feed) |
| Admin | Reduce `AdminStatsGrid` dari 6 card ke 4 card (Desa, Posyandu, Pengguna agg, Artikel) |
| Admin | Rename label sidebar: "Input Data" → "Data Master", "Register Akun" → "Akun Pengguna" |

**Out of scope:**

- Page Admin CRUD (InputDesa, InputPosyandu, RegisterKaderPosyandu, dll) tidak diubah pola visualnya.
- Route legacy redirects: tetap dipertahankan agar bookmark user tidak rusak.
- Halaman `MyPost`, `Post`, `DetailForum`: hanya tambahkan tab filter di Post page; kode internal tidak refactor besar.
- Tidak hapus file legacy yang dipakai redirect (`src/pages/MyPost`, dll).

## 4. Detail Design Per Role

### 4.1 Kader: `/kader/orangtua` page

Buat file `src/features/kader/AkunOrangTuaPage.jsx`. Struktur:

```
AkunOrangTuaPage
├── PosyanduHeader (reuse, mode "minimal" tanpa filter/search)
└── Container max-w-page
    ├── Tab nav: [Menunggu Persetujuan (X)] [Daftar Aktif (Y)]
    └── Tab content:
        ├── Tab "Pending":
        │   - Section "Pendaftaran Orang Tua Baru" → list pending OT + button Approve/Tolak
        │   - Section "Pengukuran Anak Baru" → list pending Anak + button Approve/Tolak
        │   - Empty state: "Tidak ada antrean. 🎉"
        └── Tab "Aktif":
            - DataTable: Nama / Alamat / Status / Aksi
            - Button "Tambah Orang Tua" (FAB) → modal FormOrangTua (existing)
            - Edit/Hapus inline (tetap pakai modal AntD)
```

**Reuse existing:**
- `useApproveQueries` (hook yang sudah ada)
- `useOrangTuaQueries`
- `FormOrangTua` (komponen internal `OrangTuaModal.jsx` di-extract)

**Diff `ModePosyandu.jsx`:**
- Hapus state: `approveOpen`, `orangTuaOpen`, dan komponen `<ApproveModal>` + `<OrangTuaModal>`.
- Hapus prop `onApprove`, `onKelolaOrangTua` di `PosyanduHeader`.
- Tambah prop baru `onAkunOrangTua` yang navigate ke `/kader/orangtua`.

**Diff `PosyanduHeader.jsx`:**
- Ganti 2 button (Approve + Kelola OT) jadi 1 button "Akun Orang Tua (X)" dengan badge count = pending OT + pending Anak.

**Diff `AppRoutes.jsx`:**
- Tambah route `/kader/orangtua` dengan element `<AkunOrangTuaPage />` di blok kader.

**Acceptance:**
- Halaman `/kader/balita` tidak punya `<ApproveModal>` atau `<OrangTuaModal>` lagi.
- Halaman `/kader/orangtua` punya 2 tab dengan badge count yang akurat.
- Approve/Tolak/Tambah/Edit/Hapus tetap berfungsi pakai endpoint sama.

### 4.2 Orang Tua: Forum Tabs

Modifikasi `src/pages/Post/index.js` (legacy page):

```jsx
function Post() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'semua';
  // ...existing fetch logic
  const filtered = tab === 'saya'
    ? posts.filter(p => p.user_id === currentUserId)
    : posts;

  return (
    <>
      <Tabs value={tab} onChange={(t) => setSearchParams({ tab: t })}>
        <Tab value="semua">Semua</Tab>
        <Tab value="saya">Punya Saya</Tab>
      </Tabs>
      {/* render filtered */}
    </>
  );
}
```

**Diff `MyPost`:** tidak diubah. Hanya tidak dipakai lagi sebagai entry primary.

**Diff `legacyRedirects.js`:**
- `/orangtua/forum/saya` redirect ke `/orangtua/forum?tab=saya`.
- Update test `src/__tests__/routes/legacyRedirects.test.js` agar match.

**Acceptance:**
- `/orangtua/forum` tampil tab "Semua" by default.
- `/orangtua/forum?tab=saya` tampil filter post milik user.
- `/orangtua/forum/saya` redirect ke `?tab=saya` tanpa loss state.

### 4.3 Desa: Embed Acara

Modifikasi `src/features/desa/BerandaDesa.jsx`:

```jsx
<AppShell menu={MENU_SINGLE_ITEM} activeKey="beranda">
  <PageHeader ... />
  <Container>
    <ExportDesaForm ... />
    <LaporanDesa ... />
    <AcaraSection />  {/* NEW: extracted dari KelolaAcara */}
  </Container>
</AppShell>
```

**Refactor:**
- Extract `AcaraSection` dari `KelolaAcara.jsx` jadi komponen reusable. Logic CRUD tetap, hanya wrapper PageHeader+AppShell di-strip.
- `KelolaAcara.jsx` tetap ada untuk render at `/desa/acara` (case ada bookmark), tapi jadi thin wrapper around `AcaraSection`.
- Atau: hapus `/desa/acara` dari route dan tambah redirect.

**Diff `AppShell` menu:**
- Role Desa menu jadi single-item: `[{ key: 'beranda', label: 'Beranda', path: '/desa/beranda' }]`.

**Diff `AppRoutes`:**
- `/desa/acara` di-redirect ke `/desa/beranda#acara`.
- Tambah `LEGACY_REDIRECTS` entry.

**Diff `BerandaDesa`:**
- Hapus button action "Kelola Acara Posyandu" di PageHeader (karena section sudah di bawah).
- Tambah anchor `id="acara"` di section.

**Acceptance:**
- `/desa/beranda` punya 3 section: laporan, export, acara.
- Hash `#acara` scroll ke section acara.
- `/desa/acara` redirect.

### 4.4 Tenaga Kesehatan: Hapus Beranda

Modifikasi `src/features/auth/roleHome.js`:

```js
export const ROLE_HOME = {
  // ...
  TENAGA_KESEHATAN: '/tenkes/forum',  // was /tenkes/beranda
};
```

**Diff `AppRoutes.jsx`:**
- Hapus route `/tenkes/beranda` dan import `BerandaTenkes`.
- Tambah `/tenkes/beranda` ke `LEGACY_REDIRECTS` → `/tenkes/forum`.

**Diff `Post.jsx` (legacy navbar):**
- Pastikan navbar role tenkes tidak menunjuk `/tenkes/beranda`. Jika iya, ganti ke `/tenkes/forum`.

**Optional cleanup:**
- File `src/features/tenkes/BerandaTenkes.jsx` dihapus (atau biarkan unused, dihapus terpisah). Plan ini lebih aman: hapus karena tidak ada referensi lain.

**Acceptance:**
- Login tenkes langsung di `/tenkes/forum`.
- Tidak ada error 404 saat akses `/tenkes/beranda` (redirect kerja).
- Test `src/__tests__/features/auth/roleHome.test.js` di-update.

### 4.5 Admin: Sederhanakan Dashboard + Sidebar

**Diff `AdminDashboard.jsx`:**

```jsx
<div>
  <PageHeader
    eyebrow={`Panel Admin · ${greetingPart()}`}
    title={`Halo, ${adminName}`}
    subtitle="Ringkasan aktivitas KMS Digital Lebakwangi."
  />
  <Container>
    <AdminStatsGrid stats={stats} loading={isLoading} />
    {/* AdminQuickLinks: REMOVED */}
    <AdminActivityFeed
      items={activity}
      loading={isLoading}
      hasPartialError={hasPartialError}
    />
  </Container>
</div>
```

Layout 2-kolom (1.6fr_1fr) digantikan single column. Activity feed full width terlihat lebih dominan.

**Diff `AdminStatsGrid.jsx`:**
- Reduce dari 6 card jadi 4 card:
  - Desa
  - Posyandu
  - Pengguna (gabungan: kader + tenkes + ortu jadi 1 card multi-line)
  - Artikel
- Card "Pengguna" tampilkan 3 angka kecil di bawah angka utama (total).

**Diff `AdminQuickLinks.jsx`:**
- File dihapus (atau biarkan unused, hapus terpisah).
- Sidebar sudah jadi shortcut utama.

**Diff `sidebarLinks.js`:**

```js
export const sidebarlink = [
  {
    title: 'Beranda',  // was 'Utama'
    links: [{ title: 'Dashboard', path: '', icon: LayoutDashboard, exact: true }],
  },
  {
    title: 'Data Master',  // was 'Input Data'
    links: [
      { title: 'Desa', path: 'desa', icon: Home },
      { title: 'Posyandu', path: 'posyandu', icon: Building2 },
      { title: 'Artikel', path: 'artikel', icon: Newspaper },
    ],
  },
  {
    title: 'Akun Pengguna',  // was 'Register Akun'
    links: [
      { title: 'Kader Posyandu', path: 'kader-posyandu', icon: UserCog },
      { title: 'Tenaga Kesehatan', path: 'tenaga-kesehatan', icon: Stethoscope },
    ],
  },
  {
    title: 'Laporan',
    links: [{ title: 'Laporan Keseluruhan', path: 'laporan', icon: BarChart3 }],
  },
];
```

**Acceptance:**
- `/admin/dashboard` punya 1 kolom: header + 4 stats + activity feed.
- Sidebar pakai label baru.
- Tidak ada referensi `AdminQuickLinks` di codebase.

## 5. Backwards Compatibility

| Route lama | Status |
|---|---|
| `/orangtua/forum/saya` | Redirect ke `/orangtua/forum?tab=saya` |
| `/desa/acara` | Redirect ke `/desa/beranda#acara` |
| `/tenkes/beranda` | Redirect ke `/tenkes/forum` |
| `/admin/dashboard/*` | Tidak berubah |
| `/kader/balita` | Tidak berubah |

Bookmark user tetap jalan. Tidak ada perubahan di backend.

## 6. Testing Strategy

**Automated (existing 64 tests harus pass):**
- `legacyRedirects.test.js` — update untuk 2 entry baru (`/desa/acara`, `/tenkes/beranda`, `/orangtua/forum/saya`).
- `roleHome.test.js` — update untuk `TENAGA_KESEHATAN`.

**Manual visual QA:**
- Login 5 role, verify alur sederhana.
- Akses URL legacy dan pastikan redirect.
- Tab forum OT switch antar Semua/Saya.
- Acara desa: tambah, hapus, scroll ke #acara dari URL.

**Lighthouse:**
- Bonus check di `/admin/dashboard` (lebih ringkas, kemungkinan score naik).

## 7. Migration Strategy

1 PR, 6 commit logical:

1. `refactor(kader): create AkunOrangTuaPage with tabs, remove modals from ModePosyandu`
2. `feat(orangtua): add forum tabs (Semua/Saya) with searchParam state`
3. `refactor(desa): embed AcaraSection in BerandaDesa`
4. `refactor(tenkes): redirect /tenkes/beranda to /tenkes/forum`
5. `refactor(admin): single-column dashboard, drop QuickLinks, simplify stats`
6. `chore(admin): rename sidebar labels`

Setiap commit build+test wajib pass.

## 8. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Tab forum OT pakai searchParam, refresh hilang scroll position | useEffect scroll restore via location key |
| AcaraSection diakses dari `#acara` belum ada saat data loading | scrollIntoView dipanggil setelah `isLoading=false` |
| User tenkes terbiasa `/tenkes/beranda` jadi bingung | Redirect plus toast info "Halaman beranda telah disederhanakan" (optional, atau tidak) |
| AdminStatsGrid diubah, partial error per query bisa mismatch dengan card "Pengguna" gabungan | Card Pengguna tetap tampil null/skeleton jika ada partial error |
| Halaman `/kader/orangtua` perlu PosyanduHeader minimal | Buat prop `mode="minimal"` di PosyanduHeader atau extract sub-komponen header |

## 9. Backend Dependencies

NONE. Semua endpoint existing tetap dipakai apa adanya:
- `/api/posyandu/orang-tua/list`
- `/api/posyandu/belum-approve`
- `/api/auth/users/{id}` (PUT/DELETE)
- `/api/auth/orang-tua/register`
- semua endpoint admin/desa/kader yang sudah ada

## 10. Acceptance Criteria

- ✅ `/kader/balita` tidak punya `<ApproveModal>` / `<OrangTuaModal>` di tree component.
- ✅ `/kader/orangtua` page baru tampil 2 tab dengan badge count akurat.
- ✅ `/orangtua/forum` punya tab "Semua / Punya Saya".
- ✅ `/desa/beranda` punya section "Acara" di bawah laporan.
- ✅ Login tenkes langsung di `/tenkes/forum`.
- ✅ `/admin/dashboard` single column, 4 stats card, no QuickLinks.
- ✅ Sidebar admin label updated.
- ✅ Semua redirect lama bekerja (3 entry baru di `LEGACY_REDIRECTS`).
- ✅ 64 tests pass + 2 test (legacyRedirects, roleHome) di-update.
- ✅ Build success, bundle tidak naik signifikan.

## 11. Next

Setelah approved → invoke `writing-plans` skill untuk buat implementation plan task-by-task.
