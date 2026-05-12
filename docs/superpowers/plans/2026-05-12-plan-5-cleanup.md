# Plan 5 — Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hapus file legacy yang sudah tidak di-import oleh route atau komponen aktif setelah Plan 1–4 selesai. Kurangi maintenance burden tanpa merombak fitur yang masih jalan. Ganti override `.ant-btn` di `global.css` dengan theme config antd yang lebih terkontrol.

**Architecture:** Hanya hapus file yang **terbukti dead** (tidak ada consumer di-reach dari `AppRoutes.jsx`). File legacy yang masih dipakai tetap dibiarkan dan dicatat sebagai out-of-scope untuk migrasi di rilis berikutnya.

**Tech Stack:** Tidak ada tech baru. Hanya `git rm` + minor edits.

**Spec:** `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md` — Phase 9.

**Backend dependencies:** NONE.

---

## Scope & Inventory

### Dead (aman dihapus)

File berikut **tidak di-import** oleh apa pun yang reachable dari `AppRoutes.jsx`. Verifikasi di Task 1.

| File | Pengganti |
|---|---|
| `src/pages/SignIn/index.js` + assets | `features/auth/LoginPortal.jsx` |
| `src/pages/Dashboard/index.js` + `dashboard-style.css` | `features/orangtua/BerandaOT.jsx` |
| `src/pages/Artikel/index.js` | `features/artikel/ArtikelList.jsx` |
| `src/pages/Detail/index.js` | `features/anak/DetailAnak.jsx` |
| `src/pages/Posyandu/index.js` + `DetailPosyandu.js` + `BukuPanduan.js` + `ExportTemplate.js` + `posyandu.css` | `features/kader/BerandaKader.jsx` + `features/anak/DaftarAnak.jsx` + `features/anak/DetailAnak.jsx` |
| `src/pages/Desa/desa.js` + `input_acara.js` + `desa-style.css` | `features/desa/BerandaDesa.jsx` + `features/desa/KelolaAcara.jsx` |
| `src/pages/Admin/DetailArtikel.js` | `features/artikel/ArtikelDetailPage.jsx` |
| `src/pages/Admin/index.js` | tidak ada (unused) |
| `src/pages/AdminDashboard/index.js` + `index2.js` + `index.css` + `Search.css` | tidak ada (unused duplicate dashboards) |
| `src/components/form/FormInputPerkembanganAnak/` | `features/pengukuran/PengukuranForm.jsx` |
| `src/components/form/FormUpdatePerkembanganAnak/` | `features/pengukuran/PengukuranForm.jsx` |
| `src/components/form/FormDetailDataPerkembanganAnak/` | tidak ada (unused) |
| `src/components/form/FormUpdateDataAnak/` | tidak ada — edit anak master tidak ada di UI baru (documented as known gap) |
| `src/utilities/determineAmbangBatas.js` | `features/pengukuran/zScore.js` |
| `src/utilities/Berat.js` | `features/laporan/LaporanDesa.jsx` (computation inline) |
| `src/utilities/RequireAuth.js` | `routes/RequireRole.jsx` |
| `src/utilities/calculateMonth.js` | `utils/monthDiff.js` |
| `src/utilities/columnMonth.js` | tidak ada (unused) |
| `src/hook/useAuth.js` | `features/auth/useSession.js` |
| `src/features/admin/LaporanAdminPlaceholder.jsx` | `features/laporan/LaporanAdmin.jsx` |

### Tetap dipakai (DO NOT delete — masih aktif di route)

- `src/pages/Post/`, `src/pages/MyPost/`, `src/pages/DetailForum/` — forum, aktif di `/orangtua/forum`, `/tenkes/forum`
- `src/pages/LandingPage/`, `src/pages/SignUp/`, `src/pages/NotFound/` — public route
- `src/pages/AdminDashboard/{ArtikelAdmin,InputPosyandu,RegisterKaderPosyandu,RegisterTenagaKesehatan,InputDesa}.js` — admin CMS, routed
- `src/pages/Admin/Desa/DesaPage.js` — admin, routed (imports InputDesa)
- `src/components/form/FormInputDataAnak/` — dipakai `features/orangtua/BerandaOT.jsx`
- `src/components/form/FormInputPost/` — dipakai `src/pages/Post/index.js`
- `src/components/form/FormInputDataExcel/` — dipakai `src/components/layout/Table/index.js`
- `src/components/form/FormUpdateDataArtikel/` — dipakai `src/pages/AdminDashboard/ArtikelAdmin.js`
- `src/components/layout/Dashboard/` + `Navbar/` + `Navigation/` + `Table/` + `Button/` — layout shared
- `src/hook/useAuth.js` — masih dipakai legacy pages di atas **(dihapus di akhir)**

### Out-of-scope untuk Plan 5

Migrasi legacy yang masih aktif butuh waktu signifikan:
- Forum (`Post`, `MyPost`, `DetailForum`) — butuh rewrite penuh
- Admin CMS (ArtikelAdmin, Register*, Input*) — butuh rewrite penuh
- Master data anak edit flow (`FormUpdateDataAnak`) — belum ada di UI baru, bisa di-skip atau ditambah jika diminta

Catat sebagai known gap di docs.

---

## File Structure — Delete List

```
DELETE:
├── src/hook/useAuth.js                                 (setelah semua legacy pakai useSession)
├── src/utilities/
│   ├── determineAmbangBatas.js
│   ├── Berat.js
│   ├── RequireAuth.js
│   ├── calculateMonth.js
│   └── columnMonth.js
├── src/pages/
│   ├── SignIn/
│   ├── Dashboard/
│   ├── Artikel/
│   ├── Detail/
│   ├── Posyandu/
│   ├── Desa/
│   ├── Admin/DetailArtikel.js
│   ├── Admin/index.js
│   └── AdminDashboard/{index.js,index2.js,index.css,Search.css}
├── src/components/form/
│   ├── FormInputPerkembanganAnak/
│   ├── FormUpdatePerkembanganAnak/
│   ├── FormDetailDataPerkembanganAnak/
│   └── FormUpdateDataAnak/
└── src/features/admin/LaporanAdminPlaceholder.jsx

MODIFY:
├── src/global.css                                      (remove .ant-btn + sm:rounded-full overrides)
└── docs/superpowers/specs/2026-05-12-...               (status DONE)
```

---

## Testing Strategy

- Build harus pass setelah tiap batch delete
- 63 unit test harus tetap pass
- Manual smoke test setelah semua selesai: buka semua route utama

---

## Task 1: Verify dead file inventory

**Files:**
- None (verification only)

- [ ] **Step 1: Cek tiap file dead benar-benar tidak diimport**

Jalankan (satu per satu di PowerShell):

```powershell
rg "from ['\"].*hook/useAuth" src --glob '!src/pages/**' --glob '!src/components/form/**' --glob '!src/components/layout/Table/**' --glob '!src/components/layout/Navbar/**'
rg "from ['\"].*utilities/determineAmbangBatas" src --glob '!src/components/form/Form*PerkembanganAnak/**'
rg "from ['\"].*utilities/Berat" src --glob '!src/pages/Desa/**'
rg "from ['\"].*utilities/calculateMonth" src --glob '!src/pages/**' --glob '!src/components/form/Form*PerkembanganAnak/**'
rg "pages/SignIn" src
rg "pages/Dashboard" src --glob '!src/pages/Dashboard/**'
rg "pages/Artikel\b" src --glob '!src/pages/Artikel/**'
rg "pages/Detail/" src
rg "pages/Posyandu" src --glob '!src/pages/Posyandu/**'
rg "pages/Desa" src --glob '!src/pages/Desa/**'
rg "Admin/DetailArtikel" src
rg "pages/Admin/index" src
rg "AdminDashboard/index" src --glob '!src/pages/AdminDashboard/**'
rg "FormInputPerkembanganAnak" src --glob '!src/components/form/FormInputPerkembanganAnak/**'
rg "FormUpdatePerkembanganAnak" src --glob '!src/components/form/FormUpdatePerkembanganAnak/**'
rg "FormDetailDataPerkembanganAnak" src
rg "FormUpdateDataAnak" src --glob '!src/components/form/FormUpdateDataAnak/**' --glob '!src/pages/Dashboard/**' --glob '!src/pages/Posyandu/**'
rg "LaporanAdminPlaceholder" src
```

Expected: zero hasil untuk file dead. Jika ada hasil, investigasi & keluarkan dari delete list.

Kalau `hook/useAuth` masih punya consumer setelah exclude list di atas (artinya dipakai Forum/Admin CMS/Table/Navbar/etc), biarkan file tetap ada. Hapus hanya kalau zero consumer.

- [ ] **Step 2: Checkpoint**

Commit tidak perlu. Verifikasi saja.

---

## Task 2: Delete dead pages (batch 1 — standalone routes)

**Files:**
- Delete: `src/pages/SignIn/` (entire folder)
- Delete: `src/pages/Dashboard/` (entire folder)
- Delete: `src/pages/Artikel/` (entire folder)
- Delete: `src/pages/Detail/` (entire folder)
- Delete: `src/pages/Admin/DetailArtikel.js`
- Delete: `src/pages/Admin/index.js`

- [ ] **Step 1: Delete folders/files**

```powershell
Remove-Item -LiteralPath "src/pages/SignIn" -Recurse -Force
Remove-Item -LiteralPath "src/pages/Dashboard" -Recurse -Force
Remove-Item -LiteralPath "src/pages/Artikel" -Recurse -Force
Remove-Item -LiteralPath "src/pages/Detail" -Recurse -Force
Remove-Item -LiteralPath "src/pages/Admin/DetailArtikel.js" -Force
Remove-Item -LiteralPath "src/pages/Admin/index.js" -Force
```

- [ ] **Step 2: Build + tests**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: pass. Kalau build fail karena import dangling, keluarkan file dari delete list dan commit ulang.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(cleanup): remove legacy pages SignIn, Dashboard, Artikel, Detail, Admin stubs"
```

---

## Task 3: Delete dead pages (batch 2 — Posyandu, Desa, AdminDashboard duplicates)

**Files:**
- Delete: `src/pages/Posyandu/` (entire folder)
- Delete: `src/pages/Desa/` (entire folder)
- Delete: `src/pages/AdminDashboard/index.js`
- Delete: `src/pages/AdminDashboard/index2.js`
- Delete: `src/pages/AdminDashboard/index.css`
- Delete: `src/pages/AdminDashboard/Search.css`

Note: `src/pages/AdminDashboard/{ArtikelAdmin,InputDesa,InputPosyandu,RegisterKaderPosyandu,RegisterTenagaKesehatan}.js` **tetap** karena masih dipakai admin sidebar.

- [ ] **Step 1: Delete**

```powershell
Remove-Item -LiteralPath "src/pages/Posyandu" -Recurse -Force
Remove-Item -LiteralPath "src/pages/Desa" -Recurse -Force
Remove-Item -LiteralPath "src/pages/AdminDashboard/index.js" -Force
Remove-Item -LiteralPath "src/pages/AdminDashboard/index2.js" -Force
Remove-Item -LiteralPath "src/pages/AdminDashboard/index.css" -Force
Remove-Item -LiteralPath "src/pages/AdminDashboard/Search.css" -Force
```

- [ ] **Step 2: Build + tests**

```bash
npm run build
npm test -- --watchAll=false
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(cleanup): remove legacy Posyandu, Desa pages and AdminDashboard root stubs"
```

---

## Task 4: Delete dead form components

**Files:**
- Delete: `src/components/form/FormInputPerkembanganAnak/`
- Delete: `src/components/form/FormUpdatePerkembanganAnak/`
- Delete: `src/components/form/FormDetailDataPerkembanganAnak/`
- Delete: `src/components/form/FormUpdateDataAnak/`

- [ ] **Step 1: Delete**

```powershell
Remove-Item -LiteralPath "src/components/form/FormInputPerkembanganAnak" -Recurse -Force
Remove-Item -LiteralPath "src/components/form/FormUpdatePerkembanganAnak" -Recurse -Force
Remove-Item -LiteralPath "src/components/form/FormDetailDataPerkembanganAnak" -Recurse -Force
Remove-Item -LiteralPath "src/components/form/FormUpdateDataAnak" -Recurse -Force
```

- [ ] **Step 2: Build + tests**

Expected: pass. `FormInputDataAnak`, `FormInputPost`, `FormInputDataExcel`, `FormUpdateDataArtikel` tetap.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(cleanup): remove legacy pengukuran forms (replaced by PengukuranForm)"
```

---

## Task 5: Delete dead utilities + LaporanAdminPlaceholder

**Files:**
- Delete: `src/utilities/determineAmbangBatas.js`
- Delete: `src/utilities/Berat.js`
- Delete: `src/utilities/RequireAuth.js`
- Delete: `src/utilities/calculateMonth.js`
- Delete: `src/utilities/columnMonth.js`
- Delete: `src/features/admin/LaporanAdminPlaceholder.jsx`

- [ ] **Step 1: Delete**

```powershell
Remove-Item -LiteralPath "src/utilities/determineAmbangBatas.js" -Force
Remove-Item -LiteralPath "src/utilities/Berat.js" -Force
Remove-Item -LiteralPath "src/utilities/RequireAuth.js" -Force
Remove-Item -LiteralPath "src/utilities/calculateMonth.js" -Force
Remove-Item -LiteralPath "src/utilities/columnMonth.js" -Force
Remove-Item -LiteralPath "src/features/admin/LaporanAdminPlaceholder.jsx" -Force
```

- [ ] **Step 2: Build + tests**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(cleanup): remove legacy utilities and LaporanAdminPlaceholder"
```

---

## Task 6: Remove useAuth + Routes utilities if fully dead

**Files:**
- Conditionally delete: `src/hook/useAuth.js`
- Conditionally delete: `src/utilities/Routes.js`

- [ ] **Step 1: Re-check consumers**

Setelah Task 2-5 jalan, rerun:

```powershell
rg "hook/useAuth" src
rg "utilities/Routes" src
```

Kalau zero, aman delete. Kalau ada, file masih dipakai — biarkan dan dokumentasikan di Task 8.

- [ ] **Step 2: Delete kalau dead**

```powershell
# Only if previous step returned zero matches:
Remove-Item -LiteralPath "src/hook/useAuth.js" -Force
Remove-Item -LiteralPath "src/utilities/Routes.js" -Force
# Also remove empty src/hook folder:
Remove-Item -LiteralPath "src/hook" -Force -ErrorAction SilentlyContinue
```

- [ ] **Step 3: Build + tests**

- [ ] **Step 4: Commit (kalau ada perubahan)**

```bash
git add -A
git commit -m "chore(cleanup): remove hook/useAuth (now zero consumers)"
```

---

## Task 7: Clean up global.css overrides

**Files:**
- Modify: `src/global.css`

`src/global.css` punya override `.ant-btn` dan `.sm\:rounded-full` yang konflik dengan design tokens. Hapus.

- [ ] **Step 1: Baca file**

```bash
Get-Content src/global.css
```

- [ ] **Step 2: Hapus rule problematik**

Edit `src/global.css`, hilangkan:
- Seluruh `.ant-btn { ... }` block (baris 1-24 berdasarkan inventory)
- Seluruh `.sm\:rounded-full { border-radius: 2px!important; }` block

Biarkan `.dash-bg` kalau masih dipakai (cek `rg 'dash-bg' src`).

- [ ] **Step 3: Build + manual test**

`npm run build`, lalu `npm start`, cek:
- Tombol antd (DatePicker OK, Modal footer) tidak pecah
- Layout landing page + pages Plan 4 (BerandaOT, BerandaTenkes) tidak bergeser

- [ ] **Step 4: Commit**

```bash
git add src/global.css
git commit -m "style: remove legacy antd button override from global.css"
```

---

## Task 8: Document known gaps

**Files:**
- Modify: `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md`

Tambah section "Known Gaps After Plan 5".

- [ ] **Step 1: Append section**

```markdown
## 18. Known Gaps After Plan 5

File legacy yang **tetap dipakai di production** setelah cleanup:

- **Forum**: `src/pages/Post/`, `src/pages/MyPost/`, `src/pages/DetailForum/` belum di-rewrite. Routed untuk role ORANG_TUA & TENAGA_KESEHATAN. Rewrite ke `features/forum/` menunggu prioritas berikutnya.
- **Admin CMS**: `src/pages/AdminDashboard/{ArtikelAdmin,InputPosyandu,RegisterKader*,RegisterTenkes,InputDesa}.js` tetap pakai style & hook lama (`useAuth` kalau masih ada). UI tidak konsisten dengan design tokens. Rewrite per-feature di iterasi berikutnya.
- **Master data anak edit**: Tidak ada UI edit untuk data anak (nama, tanggal lahir) di redesign. Legacy `FormUpdateDataAnak` dihapus karena konsumernya (pages/Dashboard, pages/Posyandu) juga dihapus. Jika user perlu edit data anak, tambah `EditAnak.jsx` di `features/anak/` dengan komponen slider + form sederhana.
- **`src/global.css`**: masih ada rule `.dash-bg` dan lainnya yang tidak pakai tokens. Review saat refactor landing page.

## 19. Status Final

Plan 1 + 2 + 3 + 4 + 5 selesai. Semua Phase 0–9 dari spec terpenuhi kecuali gap di Section 18. Redesign siap rilis ke production.
```

- [ ] **Step 2: Update status header**

```
**Status:** DONE — Plan 1 + 2 + 3 + 4 + 5 implemented. Known gaps di Section 18.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md
git commit -m "docs: document known gaps after Plan 5 cleanup"
```

---

## Task 9: Manual smoke test

**Files:**
- None (manual)

- [ ] **Step 1: Jalankan app**

```bash
npm start
```

- [ ] **Step 2: Login semua 5 role, navigate ke semua route utama**

Checklist ringkas:
- [ ] `/masuk` (LoginPortal) + login semua role
- [ ] `/kader/beranda` + `/kader/balita` + `/kader/balita/:id` + `/kader/laporan`
- [ ] `/orangtua/balita` + `/orangtua/balita/:id` + `/orangtua/forum`
- [ ] `/tenkes/beranda` + `/tenkes/forum`
- [ ] `/desa/beranda` + `/desa/acara`
- [ ] `/admin/dashboard/desa` + posyandu + kader-posyandu + tenaga-kesehatan + artikel + laporan
- [ ] `/artikel` + `/artikel/:id`
- [ ] Legacy redirect: `/sign-in` → `/masuk`, `/dashboard` → `/orangtua/balita`, dst.

- [ ] **Step 3: Update testing-checklist**

Di `docs/testing-checklist.md`, tambah section:

```markdown
## Post-Cleanup (Plan 5)
- [ ] Tidak ada 404/ReferenceError saat navigate ke semua route
- [ ] Build size lebih kecil dibanding sebelum cleanup
- [ ] Tidak ada console error "Cannot resolve module 'xxx'"
- [ ] npm test 63/63 pass
```

- [ ] **Step 4: Commit**

```bash
git add docs/testing-checklist.md
git commit -m "docs: add post-cleanup smoke test checklist"
```

---

## Plan 5 Acceptance Criteria

- ✅ ≥15 folder/file legacy dihapus tanpa breaking runtime
- ✅ `npm run build` pass, bundle lebih kecil (indikator file benar-benar dihapus)
- ✅ 63 unit test tetap pass
- ✅ `global.css` bersih dari override antd
- ✅ Known gaps terdokumentasi di spec
- ✅ Status spec updated ke DONE

---

## Risiko & Catatan

| Risiko | Mitigasi |
|---|---|
| File yang dianggap dead ternyata punya consumer tersembunyi (dynamic import, require) | Task 1 verify dengan rg; build akan fail kalau ada dangling import |
| `global.css` override dihapus bikin UI antd berantakan | Task 7 manual smoke test; rollback kalau ada regresi |
| `hook/useAuth.js` masih dipakai banyak legacy | Task 6 conditional delete — skip kalau masih dipakai, dokumentasikan di Task 8 |
| Git history hilang untuk file dihapus | `git log --follow` tetap bisa trace; semua commit Plan 1-4 sudah pakai path baru |

---

## Post-Plan-5 Next Steps

Setelah Plan 5 merged:
1. Tag release `v2.0.0` di git (breaking redesign complete)
2. Merge staging → main
3. Deploy ke production
4. Koordinasi user training untuk kader & OT pakai UI baru
5. (Opsional, future plan) Plan 6: rewrite forum, admin CMS, edit anak master — sesuai prioritas
