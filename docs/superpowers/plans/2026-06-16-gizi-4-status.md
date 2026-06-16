# Gizi 4 Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Samakan semua tampilan gizi di kader dan desa menjadi 4 status ringkas: `normal`, `kurang`, `stunting`, `obesitas`.

**Architecture:** Keep the Z-score pipeline unchanged and make `overallStatus` the single source of truth for all summary views. Update the kader and desa aggregators to count only the 4 ringkas status, then simplify the tables so both areas render the same status vocabulary. Preserve detailed Z-scores in storage and measurement forms.

**Tech Stack:** React, TypeScript, Vitest, existing in-repo aggregation helpers and table components.

---

### Task 1: Lock the new 4-status behavior in tests

**Files:**
- Modify: `src/__tests__/features/laporan/aggregateKader.test.ts`
- Modify: `src/__tests__/features/laporan/aggregateDesa.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
test('aggregateKaderLaporan counts only normal kurang stunting obesitas', () => {
  const r = aggregateKaderLaporan({
    anakList: [
      { id: 1, nama: 'A', tanggal_lahir: '2025-01-01' },
      { id: 2, nama: 'B', tanggal_lahir: '2025-01-01' },
      { id: 3, nama: 'C', tanggal_lahir: '2025-01-01' },
      { id: 4, nama: 'D', tanggal_lahir: '2025-01-01' },
    ],
    pengukuranByAnak: {
      1: [{ date: '2026-05-01', z_score_berat: 0, z_score_tinggi: 0, z_score_lingkar_kepala: 0, z_score_gizi: 0 }],
      2: [{ date: '2026-05-01', z_score_berat: -2.5, z_score_tinggi: 0, z_score_lingkar_kepala: 0, z_score_gizi: 0 }],
      3: [{ date: '2026-05-01', z_score_berat: 0, z_score_tinggi: -3.5, z_score_lingkar_kepala: 0, z_score_gizi: 0 }],
      4: [{ date: '2026-05-01', z_score_berat: 0, z_score_tinggi: 0, z_score_lingkar_kepala: 0, z_score_gizi: 2.5 }],
    },
    bulan: '2026-05',
  });

  expect(r.distribusi.normal).toBe(1);
  expect(r.distribusi.kurang).toBe(1);
  expect(r.distribusi.stunting).toBe(1);
  expect(r.distribusi.obesitas).toBe(1);
});
```

```ts
test('aggregateDesaDariAnak counts only normal kurang stunting obesitas', () => {
  const result = aggregateDesaDariAnak({
    posyanduStats: [{ id_posyandu: 10, nama_posyandu: 'Posyandu Melati' }],
    anakList: [
      { id: 1, id_posyandu: 10 },
      { id: 2, id_posyandu: 10 },
    ],
    pengukuranByAnak: {
      1: [{ date: '2026-06-01', z_score_berat: 0, z_score_tinggi: 0, z_score_lingkar_kepala: 0, z_score_gizi: 0 }],
      2: [{ date: '2026-06-02', z_score_berat: 0, z_score_tinggi: -3.5, z_score_lingkar_kepala: 0, z_score_gizi: 2.5 }],
    },
  });

  expect(result.perPosyandu[0].gizi).toMatchObject({
    normal: 1,
    kurang: 0,
    stunting: 0,
    obesitas: 1,
  });
  expect(result.distribusiGizi).toMatchObject({
    normal: 1,
    kurang: 0,
    stunting: 0,
    obesitas: 1,
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run:
```bash
npm test -- src/__tests__/features/laporan/aggregateKader.test.ts src/__tests__/features/laporan/aggregateDesa.test.ts
```

Expected: failures because the current aggregators still emit the old detailed gizi shape.

- [ ] **Step 3: Commit the failing tests**

```bash
git add src/__tests__/features/laporan/aggregateKader.test.ts src/__tests__/features/laporan/aggregateDesa.test.ts
git commit -m "test(laporan): lock 4-status gizi summaries"
```

### Task 2: Change the aggregators to emit 4 ringkas status

**Files:**
- Modify: `src/features/laporan/aggregateKader.ts`
- Modify: `src/features/laporan/aggregateDesa.ts`

- [ ] **Step 1: Write the minimal implementation**

```ts
import { overallStatus, STATUS } from '../pengukuran/statusGizi';

function toRingkasStatus(input: {
  zScoreBB?: number | string | null;
  zScoreTB?: number | string | null;
  zScoreGizi?: number | string | null;
}) {
  const toZ = (v: number | string | null | undefined) => (v == null || v === '' ? null : Number(v));
  return overallStatus({
    zScoreBB: toZ(input.zScoreBB),
    zScoreTB: toZ(input.zScoreTB),
    zScoreLK: null,
    zScoreGizi: toZ(input.zScoreGizi),
  });
}
```

- [ ] **Step 2: Update `aggregateKaderLaporan` and `aggregateKaderPerBalita`**
- [ ] **Step 3: Update `aggregateDesaDariAnak` and `aggregateDesa` fallback mapping**
- [ ] **Step 4: Run the tests to confirm they pass**

Run:
```bash
npm test -- src/__tests__/features/laporan/aggregateKader.test.ts src/__tests__/features/laporan/aggregateDesa.test.ts
```

- [ ] **Step 5: Commit the aggregator change**

```bash
git add src/features/laporan/aggregateKader.ts src/features/laporan/aggregateDesa.ts
git commit -m "feat(laporan): use 4-status gizi summaries"
```

### Task 3: Simplify the kader and desa tables

**Files:**
- Modify: `src/features/laporan/RekapPerBalitaTable.tsx`
- Modify: `src/features/laporan/LaporanDesa.tsx`
- Modify: `src/features/laporan/LaporanBulananKader.tsx`

- [ ] **Step 1: Replace detailed gizi table columns with the 4-status labels**
- [ ] **Step 2: Ensure the per-balita rows still render the latest measurement date and the 4-status badge/check**
- [ ] **Step 3: Run the relevant UI tests or table tests**
- [ ] **Step 4: Commit the UI update**

```bash
git add src/features/laporan/RekapPerBalitaTable.tsx src/features/laporan/LaporanDesa.tsx src/features/laporan/LaporanBulananKader.tsx
git commit -m "feat(ui): show 4-status gizi in kader and desa"
```

### Task 4: Final verification

**Files:**
- All modified files

- [ ] **Step 1: Run the focused test suite**

Run:
```bash
npm test -- src/__tests__/features/pengukuran/statusGizi.test.ts src/__tests__/features/laporan/aggregateKader.test.ts src/__tests__/features/laporan/aggregateDesa.test.ts
```

- [ ] **Step 2: Run the app-level checks used in this repo**
- [ ] **Step 3: Review the diff for accidental changes**
- [ ] **Step 4: Commit any remaining fixes**
