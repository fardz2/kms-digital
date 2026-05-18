# Cross-Role Onboarding Tour Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperjelas onboarding tour untuk semua role login dengan step yang lebih spesifik dan anchor UI yang lebih lengkap, tanpa mengubah mekanisme auto-show dan replay yang sudah ada.

**Architecture:** Pertahankan arsitektur existing: `TourProvider` tetap render satu `antd` Tour di root, `useTour` tetap simpan completion flag per role, dan `buildSteps(role)` tetap jadi sumber step tunggal. Perubahan difokuskan pada penambahan `data-tour-id` di area kerja utama dan rewrite isi step di `tourSteps.ts` agar lebih operasional per role.

**Tech Stack:** React 19, TypeScript, Vite, Ant Design Tour, lucide-react, Vitest.

---

## File Structure

### Modify
- `src/features/tour/tourSteps.ts` — rewrite isi step semua role, tambah step baru berbasis anchor yang lebih lengkap
- `src/features/kader/ModePosyandu.tsx` — tambah anchor daftar balita / area kerja utama
- `src/features/kader/PosyanduHeader.tsx` — tambah anchor progress bulan ini dan tombol laporan
- `src/features/orangtua/BerandaOT.tsx` — tambah anchor daftar anak
- `src/pages/Post/index.tsx` — tambah anchor forum untuk Tenkes dan OT tanpa ubah alur page
- `src/features/desa/BerandaDesa.tsx` — tambah anchor area laporan bila perlu wrapper stabil
- `src/features/desa/ExportDesaForm.tsx` — tambah anchor blok export CSV dan PDF
- `src/features/desa/AcaraSection.tsx` — tambah anchor form acara dan daftar acara
- `src/features/admin/AdminDashboard.tsx` — tambah anchor activity area
- `src/features/admin/AdminActivityFeed.tsx` — tambah anchor section activity feed
- `src/components/layout/Dashboard/Sidebar.tsx` — tambah anchor link/menu penting admin bila perlu target lebih spesifik

### Verify
- `package.json` — source of truth untuk test/build scripts

---

## Testing Strategy

- Automated regression:
  - `rtk npm test -- --watchAll=false`
  - `rtk npm run build`
- Typecheck command tidak ada di `package.json`, jadi pakai direct tool:
  - `rtk tsc --noEmit`
- Lint script belum ada di `package.json`. Jika tetap dibutuhkan, konfirmasi ke user atau cek tool repo lain sebelum klaim selesai.
- Manual QA:
  - login sebagai Kader, OT, Tenkes, Desa, Admin
  - pastikan tour auto-show sekali per role
  - cek semua step menempel ke target yang benar
  - klik tombol Bantuan untuk replay di role relevan

---

### Task 1: Add stable tour anchors for Kader and Orang Tua

**Files:**
- Modify: `src/features/kader/ModePosyandu.tsx`
- Modify: `src/features/kader/PosyanduHeader.tsx`
- Modify: `src/features/orangtua/BerandaOT.tsx`

- [ ] **Step 1: Add Kader list anchor in `src/features/kader/ModePosyandu.tsx`**

Replace list wrapper:

```tsx
        <div className="flex flex-col gap-[8px]">
```

with:

```tsx
        <div className="flex flex-col gap-[8px]" data-tour-id="kader-daftar-balita">
```

- [ ] **Step 2: Add Kader laporan and progress anchors in `src/features/kader/PosyanduHeader.tsx`**

Update tombol laporan and progress wrapper:

```tsx
            <Button
              variant="default"
              size="md"
              leadingIcon={<BarChart3 size={18} strokeWidth={2} />}
              onClick={onLaporan}
              data-tour-id="kader-laporan"
            >
              Laporan
            </Button>
```

```tsx
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-[25px] items-end" data-tour-id="kader-progress">
```

- [ ] **Step 3: Add Orang Tua child list anchor in `src/features/orangtua/BerandaOT.tsx`**

Replace child list wrapper:

```tsx
          <div className="flex flex-col gap-[13px]">
```

with:

```tsx
          <div className="flex flex-col gap-[13px]" data-tour-id="ot-daftar-anak">
```

- [ ] **Step 4: Run typecheck for changed files**

Run:

```bash
rtk tsc --noEmit
```

Expected: no TypeScript error from new `data-tour-id` props.

- [ ] **Step 5: Commit Kader/OT anchors**

```bash
rtk git add src/features/kader/ModePosyandu.tsx src/features/kader/PosyanduHeader.tsx src/features/orangtua/BerandaOT.tsx
rtk git commit -m "feat(tour): add kader and parent tour anchors"
```

---

### Task 2: Add stable tour anchors for Forum pages

**Files:**
- Modify: `src/pages/Post/index.tsx`

- [ ] **Step 1: Add forum list anchor**

Replace posts wrapper:

```tsx
        <div className="space-y-[17px]">
```

with:

```tsx
        <div className="space-y-[17px]" data-tour-id="forum-list">
```

- [ ] **Step 2: Add forum answer action anchor**

Update answer link:

```tsx
              <Link
                to={item.href}
                className="inline-flex items-center gap-[6px] text-body-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                data-tour-id={role === 'TENAGA_KESEHATAN' ? 'tenkes-jawab' : 'ot-forum-detail'}
              >
```

- [ ] **Step 3: Add answer preview anchor**

Update answer block wrapper:

```tsx
                <div className="mt-[17px] p-[17px] bg-polar-mist rounded-default space-y-[13px]" data-tour-id="forum-jawaban">
```

- [ ] **Step 4: Run tests focused on existing suite baseline**

Run:

```bash
rtk npm test -- --watchAll=false
```

Expected: existing test suite stays green.

- [ ] **Step 5: Commit forum anchors**

```bash
rtk git add src/pages/Post/index.tsx
rtk git commit -m "feat(tour): add forum tour anchors"
```

---

### Task 3: Add stable tour anchors for Desa pages

**Files:**
- Modify: `src/features/desa/BerandaDesa.tsx`
- Modify: `src/features/desa/ExportDesaForm.tsx`
- Modify: `src/features/desa/AcaraSection.tsx`

- [ ] **Step 1: Add laporan wrapper anchor in `src/features/desa/BerandaDesa.tsx`**

Replace laporan render:

```tsx
        <LaporanDesa ref={printableRef} />
```

with:

```tsx
        <div data-tour-id="desa-laporan">
          <LaporanDesa ref={printableRef} />
        </div>
```

- [ ] **Step 2: Add export anchors in `src/features/desa/ExportDesaForm.tsx`**

Update both column wrappers:

```tsx
        <div className="space-y-[13px]" data-tour-id="desa-export-csv">
```

```tsx
        <div className="space-y-[13px] md:border-l md:border-light-ash md:pl-[25px]" data-tour-id="desa-export-pdf">
```

- [ ] **Step 3: Add acara form and list anchors in `src/features/desa/AcaraSection.tsx`**

Update cards:

```tsx
      <Card title="Tambah Acara Baru">
```

becomes:

```tsx
      <div data-tour-id="desa-acara-form">
        <Card title="Tambah Acara Baru">
```

and close it before second card, then wrap second card:

```tsx
      </div>

      <div data-tour-id="desa-acara-list">
        <Card title={`Daftar Acara (${sorted.length})`}>
```

close after second card:

```tsx
        </Card>
      </div>
```

- [ ] **Step 4: Run build to verify JSX structure stays valid**

Run:

```bash
rtk npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit Desa anchors**

```bash
rtk git add src/features/desa/BerandaDesa.tsx src/features/desa/ExportDesaForm.tsx src/features/desa/AcaraSection.tsx
rtk git commit -m "feat(tour): add desa tour anchors"
```

---

### Task 4: Add stable tour anchors for Admin pages

**Files:**
- Modify: `src/features/admin/AdminDashboard.tsx`
- Modify: `src/features/admin/AdminActivityFeed.tsx`
- Modify: `src/components/layout/Dashboard/Sidebar.tsx`

- [ ] **Step 1: Add admin activity anchor in `src/features/admin/AdminDashboard.tsx`**

Replace activity render:

```tsx
        <AdminActivityFeed
          items={activity}
          loading={isLoading}
          hasPartialError={hasPartialError}
        />
```

with:

```tsx
        <div data-tour-id="admin-activity">
          <AdminActivityFeed
            items={activity}
            loading={isLoading}
            hasPartialError={hasPartialError}
          />
        </div>
```

- [ ] **Step 2: Add feed section anchor in `src/features/admin/AdminActivityFeed.tsx`**

Update section tag:

```tsx
    <section data-tour-id="admin-activity-feed" className="bg-white border border-light-ash rounded-default shadow-card p-[25px]">
```

- [ ] **Step 3: Add sidebar help anchor in `src/components/layout/Dashboard/Sidebar.tsx`**

Update expanded help button:

```tsx
              <button
                onClick={replay}
                className="flex items-center gap-3 h-[50px] w-full px-[13px] rounded-default text-body-sm text-deep-slate hover:bg-faint-fog transition-colors"
                data-tour-id="admin-bantuan"
              >
```

and collapsed button:

```tsx
                <button
                  onClick={replay}
                  className="flex items-center justify-center w-full h-[48px] rounded-default text-graphite hover:text-deep-slate hover:bg-faint-fog transition-colors"
                  aria-label="Bantuan"
                  data-tour-id="admin-bantuan"
                >
```

- [ ] **Step 4: Run typecheck and build**

Run:

```bash
rtk tsc --noEmit
rtk npm run build
```

Expected: both succeed.

- [ ] **Step 5: Commit Admin anchors**

```bash
rtk git add src/features/admin/AdminDashboard.tsx src/features/admin/AdminActivityFeed.tsx src/components/layout/Dashboard/Sidebar.tsx
rtk git commit -m "feat(tour): add admin tour anchors"
```

---

### Task 5: Rewrite all role tour steps in `tourSteps.ts`

**Files:**
- Modify: `src/features/tour/tourSteps.ts`

- [ ] **Step 1: Expand Kader steps**

Replace Kader block with:

```ts
    case 'KADER_POSYANDU':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang di Mode Posyandu',
          description:
            'Halaman ini dipakai kader saat pelayanan berlangsung. Dari sini Anda bisa melihat daftar balita, menentukan prioritas, lalu membuka proses pengukuran tanpa pindah alur kerja.',
        }),
        stepWithSelector('[data-tour-id="kader-progress"]', {
          title: 'Pantau cakupan bulan ini',
          description:
            'Bagian ini menunjukkan berapa balita yang sudah diukur dibanding total balita aktif. Gunakan angka dan progress bar ini untuk melihat apakah pelayanan bulan berjalan sudah mendekati selesai.',
        }),
        stepWithSelector('[data-tour-id="kader-search"]', {
          title: 'Cari balita lebih cepat',
          description:
            'Ketik nama balita untuk mempersempit daftar. Fitur ini berguna saat antrean ramai dan Anda ingin langsung membuka data anak tertentu tanpa scroll panjang.',
        }),
        stepWithSelector('[data-tour-id="kader-filter"]', {
          title: 'Prioritaskan dengan filter status',
          description:
            'Pilih filter Belum untuk mencari balita yang belum diukur bulan ini, atau Perhatian untuk fokus ke balita yang memerlukan tindak lanjut lebih dulu.',
        }),
        stepWithSelector('[data-tour-id="kader-daftar-balita"]', {
          title: 'Daftar balita sebagai area kerja utama',
          description:
            'Kartu-kartu di bagian ini adalah pusat kerja kader. Dari sini Anda bisa melihat status tiap balita, membuka riwayat, atau langsung masuk ke aksi ukur maupun ulang ukur.',
        }),
        stepWithSelector('[data-tour-id="kader-akun-ortu"]', {
          title: 'Kelola akun orang tua',
          description:
            'Gunakan tombol ini untuk meninjau pendaftaran orang tua dan data anak yang menunggu persetujuan. Jika ada angka badge, berarti ada item yang perlu Anda cek.',
        }),
        stepWithSelector('[data-tour-id="kader-laporan"]', {
          title: 'Buka laporan bulanan',
          description:
            'Masuk ke laporan untuk melihat rekap pengukuran, distribusi status gizi, dan daftar balita yang belum diukur agar tindak lanjut posyandu lebih terarah.',
        }),
        stepWithSelector('[data-tour-id="kader-tambah"]', {
          title: 'Tambah balita baru',
          description:
            'Gunakan tombol ini jika ada balita yang belum terdaftar di sistem. Setelah data masuk, balita akan muncul di daftar dan bisa langsung diukur pada periode berikutnya.',
        }),
      ];
```

- [ ] **Step 2: Expand Orang Tua and Tenkes steps**

Replace OT and Tenkes blocks with:

```ts
    case 'ORANG_TUA':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Orang Tua',
          description:
            'Aplikasi ini membantu Anda mendaftarkan anak, memantau pertumbuhan, dan bertanya langsung kepada tenaga kesehatan dari satu tempat.',
        }),
        stepWithSelector('[data-tour-id="ot-tambah-anak"]', {
          title: 'Mulai dari tambah anak',
          description:
            'Jika data anak belum ada, gunakan tombol ini terlebih dahulu. Setelah anak terdaftar, Anda bisa membuka detail pertumbuhan dan mengikuti riwayat pengukuran berikutnya.',
        }),
        stepWithSelector('[data-tour-id="ot-daftar-anak"]', {
          title: 'Buka kartu anak untuk pemantauan',
          description:
            'Setiap kartu anak bisa diketuk untuk membuka halaman detail. Di sana Anda dapat melihat informasi anak dan riwayat pengukuran yang sudah tercatat.',
        }),
        stepWithSelector('[data-tour-id="ot-forum"]', {
          title: 'Gunakan forum saat butuh jawaban',
          description:
            'Masuk ke forum untuk bertanya tentang gizi, tumbuh kembang, atau kondisi anak. Pertanyaan Anda akan tampil agar dapat dijawab tenaga kesehatan.',
        }),
        stepWithSelector('[data-tour-id="ot-artikel"]', {
          title: 'Pelajari artikel kesehatan',
          description:
            'Buka artikel untuk membaca materi edukasi seputar gizi, pengasuhan, dan perkembangan balita sehingga Anda tetap mendapat panduan meski di luar hari posyandu.',
        }),
      ];

    case 'TENAGA_KESEHATAN':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Tenaga Kesehatan',
          description:
            'Halaman forum ini adalah area kerja utama Anda untuk membaca pertanyaan dari orang tua lalu memberi jawaban yang relevan dan mudah dipahami.',
        }),
        stepWithSelector('[data-tour-id="forum-list"]', {
          title: 'Lihat daftar pertanyaan terbaru',
          description:
            'Bagian ini menampilkan kumpulan pertanyaan yang masuk. Gunakan daftar ini untuk memilih topik yang perlu ditanggapi lebih dulu.',
        }),
        stepWithSelector('[data-tour-id="tenkes-jawab"]', {
          title: 'Buka detail untuk menjawab',
          description:
            'Klik aksi ini untuk membuka detail pertanyaan. Dari halaman detail Anda bisa membaca konteks lengkap lalu mengirim jawaban kepada orang tua.',
        }),
        stepWithSelector('[data-tour-id="forum-jawaban"]', {
          title: 'Lihat contoh jawaban yang sudah ada',
          description:
            'Jika sebuah pertanyaan sudah memiliki jawaban, bagian ini menampilkan balasan yang pernah diberikan sehingga Anda bisa menjaga konsistensi informasi yang disampaikan.',
        }),
      ];
```

- [ ] **Step 3: Expand Desa and Admin steps**

Replace Desa and Admin blocks with:

```ts
    case 'DESA':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Pemerintah Desa',
          description:
            'Halaman ini dipakai untuk memantau rekap kondisi gizi balita tingkat desa, menyiapkan laporan, dan mengelola agenda kegiatan posyandu.',
        }),
        stepWithSelector('[data-tour-id="desa-export-csv"]', {
          title: 'Unduh data CSV pengukuran',
          description:
            'Gunakan blok ini untuk memilih bulan dan posyandu, lalu mengunduh data pengukuran secara rinci dalam format CSV untuk kebutuhan rekap atau olah data lanjutan.',
        }),
        stepWithSelector('[data-tour-id="desa-export-pdf"]', {
          title: 'Cetak laporan PDF',
          description:
            'Bagian ini menyiapkan ringkasan laporan dalam format PDF yang lebih siap dibagikan atau dicetak sebagai dokumen pelaporan.',
        }),
        stepWithSelector('[data-tour-id="desa-laporan"]', {
          title: 'Pantau ringkasan laporan desa',
          description:
            'Di sini Anda dapat melihat statistik dan distribusi kondisi gizi sebagai gambaran umum situasi balita di seluruh desa.',
        }),
        stepWithSelector('[data-tour-id="desa-acara-form"]', {
          title: 'Tambah acara posyandu',
          description:
            'Gunakan formulir ini untuk membuat agenda atau pengingat kegiatan. Isi judul dan tanggal agar kader dan orang tua punya acuan kegiatan yang jelas.',
        }),
        stepWithSelector('[data-tour-id="desa-acara-list"]', {
          title: 'Periksa daftar acara yang sudah dibuat',
          description:
            'Bagian ini menampilkan acara yang sudah tersimpan sehingga Anda bisa meninjau ulang jadwal aktif atau menghapus agenda yang tidak lagi digunakan.',
        }),
      ];

    case 'ADMIN':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Admin',
          description:
            'Dashboard admin adalah pusat kontrol untuk memantau data master KMS Digital dan berpindah ke halaman pengelolaan yang Anda butuhkan.',
        }),
        stepWithSelector('[data-tour-id="admin-stats"]', {
          title: 'Baca statistik ringkas sistem',
          description:
            'Bagian ini menampilkan total data penting seperti desa, posyandu, dan pengguna. Gunakan ringkasan ini untuk memahami skala data yang sedang dikelola.',
        }),
        stepWithSelector('[data-tour-id="admin-activity"]', {
          title: 'Pantau aktivitas terbaru',
          description:
            'Blok ini merangkum perubahan terbaru dari beberapa entitas sehingga Anda bisa cepat mengetahui data apa yang baru ditambahkan atau diperbarui.',
        }),
        stepWithSelector('[data-tour-id="admin-sidebar"]', {
          title: 'Gunakan menu navigasi admin',
          description:
            'Sidebar adalah jalur utama untuk masuk ke halaman kelola desa, posyandu, kader, tenaga kesehatan, dan artikel. Gunakan menu ini saat ingin berpindah antar data master.',
        }),
        stepWithSelector('[data-tour-id="admin-bantuan"]', {
          title: 'Putar ulang tutorial kapan saja',
          description:
            'Jika Anda ingin melihat panduan ini lagi, gunakan tombol Bantuan. Ini berguna saat Anda perlu mengingat kembali fungsi area admin setelah lama tidak membuka dashboard.',
        }),
      ];
```

- [ ] **Step 4: Run full verification**

Run:

```bash
rtk npm test -- --watchAll=false
rtk tsc --noEmit
rtk npm run build
```

Expected: all commands pass.

- [ ] **Step 5: Commit expanded tour copy**

```bash
rtk git add src/features/tour/tourSteps.ts
rtk git commit -m "feat(tour): expand onboarding copy for all roles"
```

---

### Task 6: Manual QA and final verification

**Files:**
- No code changes required

- [ ] **Step 1: Clear tour completion flags in browser storage**

Remove keys with prefix:

```text
kms_tour_completed_
```

Expected keys likely include:

```text
kms_tour_completed_KADER_POSYANDU
kms_tour_completed_ORANG_TUA
kms_tour_completed_TENAGA_KESEHATAN
kms_tour_completed_DESA
kms_tour_completed_ADMIN
```

- [ ] **Step 2: Manual QA Kader and Orang Tua**

Verify:
- Kader auto-show covers progress, search, filter, list, akun OT, laporan, tambah balita
- OT auto-show covers tambah anak, daftar anak, forum, artikel

Expected: every step points to visible, relevant UI.

- [ ] **Step 3: Manual QA Tenkes, Desa, Admin**

Verify:
- Tenkes auto-show covers forum list, open detail/jawab, existing answers
- Desa auto-show covers export CSV, export PDF, laporan, acara form, acara list
- Admin auto-show covers stats, activity, sidebar, bantuan

Expected: no missing selector or awkward spotlight placement.

- [ ] **Step 4: Capture final status**

Run:

```bash
rtk git status
```

Expected: clean working tree if all commits done, or only intended unstaged changes if user wants review first.

---

## Self-Review

Spec coverage check:
- Tour tetap per role login — covered by keeping existing runtime model and editing only copy/anchors.
- Semua role masuk scope — covered by Tasks 1–5.
- Lebih detail dan spesifik — covered by full rewrite in Task 5.
- Replay tetap jalan — preserved explicitly, plus admin help anchor and manual QA in Task 6.

Placeholder scan:
- Tidak ada TBD/TODO.
- Semua command eksplisit.
- Semua file path eksplisit.

Type consistency:
- Anchor IDs konsisten antara plan tasks dan `tourSteps.ts` target selectors.
- Tidak ada perubahan API `useTour`, `TourProvider`, atau `useTourContext`.
