# Performa Bundle Z-Score Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hapus 2 file JSON mati (~163KB) dan dedupe fungsi pembulatan z-score antara zScore.ts dan ChartWHO.tsx.

**Architecture:** Perubahan berisiko minimal. Tidak mengubah perhitungan (tetap sinkron), tidak lazy-load.

**Tech Stack:** React 19, Vite, Vitest.

---

## File Structure

- Delete: `src/json/ZScoreBeratTinggiBadanLaki.json`
- Delete: `src/json/ZScoreBeratTinggiBadanPerempuan.json`
- Modify: `src/features/anak/ChartWHO.tsx` (hapus roundPb lokal, impor roundPbToHalfStep)
- Reference (sudah mengekspor target): `src/features/pengukuran/zScore.ts`

---

## Task 1: Hapus 2 file JSON mati

**Files:**
- Delete: `src/json/ZScoreBeratTinggiBadanLaki.json`
- Delete: `src/json/ZScoreBeratTinggiBadanPerempuan.json`

- [ ] **Step 1: Verifikasi sekali lagi tak ada referensi**

Run (PowerShell): cari di seluruh repo (kecuali node_modules) string nama file.
```
Get-ChildItem -Recurse -File src | Select-String -Pattern "BeratTinggiBadanLaki\.json|BeratTinggiBadanPerempuan\.json"
```
Expected: TIDAK ada output (selain mungkin file itu sendiri). Yang dipakai adalah varian `...Laki24/Laki60/Perempuan24/Perempuan60`. Jika ADA referensi nyata, STOP dan laporkan.

- [ ] **Step 2: Hapus kedua file via git**

```
git rm src/json/ZScoreBeratTinggiBadanLaki.json src/json/ZScoreBeratTinggiBadanPerempuan.json
```

- [ ] **Step 3: Verifikasi build & test**

Run: `npm run build`
Expected: sukses, tidak ada "Could not resolve" untuk file yang dihapus.

Run: `npm test`
Expected: semua test hijau (245 sebelumnya).

- [ ] **Step 4: Commit**

```
git add -A
git commit -m "chore: remove unused z-score JSON (~163KB dead files)"
```

---

## Task 2: Dedupe fungsi pembulatan

**Files:**
- Modify: `src/features/anak/ChartWHO.tsx`

Context: `zScore.ts` sudah mengekspor `roundPbToHalfStep`? PERIKSA: saat ini
`roundPbToHalfStep` di zScore.ts adalah fungsi MODUL-LEVEL tanpa `export`.
ChartWHO.tsx punya fungsi lokal `roundPb` yang identik:
```ts
function roundPb(t) {
  const frac = t - Math.floor(t);
  if (frac === 0.5) return t;
  if (frac < 0.5) return Math.floor(t);
  return Math.floor(t) + 0.5;
}
```

- [ ] **Step 1: Export roundPbToHalfStep dari zScore.ts**

Di `src/features/pengukuran/zScore.ts`, ubah deklarasi:
```ts
function roundPbToHalfStep(tinggi: number): number {
```
menjadi:
```ts
export function roundPbToHalfStep(tinggi: number): number {
```
(Tidak ada perubahan lain di file ini; pemakaian internal `roundPbToHalfStep(...)` tetap valid.)

- [ ] **Step 2: Ganti roundPb lokal di ChartWHO dengan impor**

Di `src/features/anak/ChartWHO.tsx`:
1. Tambah impor (dekat impor lain, mis. setelah `import Button ...`):
```ts
import { roundPbToHalfStep } from '../pengukuran/zScore';
```
2. Hapus definisi fungsi lokal `roundPb` (blok 6 baris di atas).
3. Ganti SEMUA pemanggilan `roundPb(` menjadi `roundPbToHalfStep(`. Cari di file untuk memastikan tidak ada yang terlewat (kemungkinan di `mapGiziByPb`).

- [ ] **Step 3: Verifikasi**

Run: `npm run lint`
Expected: 0 error (1 warning pre-existing di DataTable boleh ada).

Run: `npm test`
Expected: semua hijau. zScore.test.ts harus tetap lulus (perilaku rounding tak berubah).

Run: `npm run build`
Expected: sukses.

- [ ] **Step 4: Commit**

```
git add src/features/pengukuran/zScore.ts src/features/anak/ChartWHO.tsx
git commit -m "refactor(zscore): share roundPbToHalfStep, drop duplicate roundPb"
```

---

## Final Verification

- [ ] `npm run lint` — 0 error
- [ ] `npm test` — semua hijau
- [ ] `npm run build` — sukses

## Catatan
- YAGNI: tidak lazy-load, tidak ubah PengukuranForm, tidak ubah perhitungan.
- Jika Step 1 Task 1 menemukan referensi nyata, STOP dan eskalasi.
