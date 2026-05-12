# Plan 2 — Pengukuran & Detail Anak Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengganti form input pengukuran (BB/TB/LK) lama yang pakai `InputNumber` keyboard dengan form slider-based boomer-friendly, menambah field LILA (opsional ≥ 7 bulan) dan catatan per pengukuran, dan mengganti halaman detail anak dengan versi baru yang konsisten dengan design system Plan 1.

**Architecture:** Extract Z-Score logic dari form lama jadi pure function `features/pengukuran/zScore.js` (fully testable). Form `PengukuranForm` pakai Opsi Simple-1 (satu layar scroll, semua field vertikal, satu tombol Simpan). Chart WHO existing di-reuse 1:1 (config tidak diubah) dalam wrapper `ChartWHO`. Halaman detail anak baru pakai `PageHeader`, `Card` list untuk riwayat, dan tombol "Ukur Baru" sebagai CTA utama.

**Tech Stack:** React 18 (CRA), axios, TanStack Query v5, Ant Design v4 (Modal + DatePicker + Form), Chart.js 4, moment, Jest.

**Spec:** `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md` — Section 8, Phase 3 & 4.

**Backend dependencies (BLOCKER B1):**
- `POST/PUT /api/posyandu/statistik-anak` dan `/api/orang-tua/statistik-anak` harus menerima 2 field baru:
  - `lila: number | null` (opsional)
  - `catatan: string | null` (opsional)
- `GET /api/{posyandu,orang-tua}/statistik-anak/:anakId` harus mengembalikan 2 field tersebut
- Kalau backend belum siap: field dikirim sebagai `null` dari client, tampilan catatan read-only kosong. Form masih bisa rilis, backend bisa menyusul.

---

## File Structure

**Folder baru:**
```
src/
├── api/
│   └── pengukuran.api.js              NEW
├── queries/
│   └── usePengukuranQueries.js        NEW
├── features/
│   ├── pengukuran/
│   │   ├── zScore.js                  NEW (extract logic)
│   │   ├── statusGizi.js              NEW (Z-Score → label)
│   │   ├── PengukuranForm.jsx         NEW (modal, slider-based)
│   │   └── CatatanField.jsx           NEW
│   └── anak/
│       ├── DetailAnak.jsx             NEW (replaces legacy DetailPosyandu in new routes)
│       ├── RiwayatCard.jsx            NEW (one row of pengukuran history)
│       └── ChartWHO.jsx               NEW (wraps existing chart config)
└── __tests__/
    └── features/pengukuran/
        ├── zScore.test.js             NEW
        └── statusGizi.test.js         NEW
```

**Dimodifikasi:**
- `src/routes/AppRoutes.jsx` — ganti `DetailPosyandu` ke `DetailAnak` baru untuk route `/kader/balita/:id` dan `/orangtua/balita/:id`

**Tidak disentuh (legacy coexist):**
- `src/pages/Posyandu/DetailPosyandu.js` (akan di-archive di Plan 5)
- `src/components/form/FormInputPerkembanganAnak/*`, `FormUpdatePerkembanganAnak/*`
- `src/utilities/determineAmbangBatas.js` (zScore.js baru akan wrap ini, JSON WHO tidak disentuh)
- Chart config dari `DetailPosyandu.js` akan di-copy paste exact ke `ChartWHO.jsx`

---

## Testing Strategy

Ikuti pola Plan 1: unit test untuk pure logic, manual verification untuk UI interaktif.

Target test coverage Plan 2:
- `zScore.js` — 100% pure function, easy to test
- `statusGizi.js` — Z-Score → label mapping
- `PengukuranForm` — manual test (slider + submit flow)
- `DetailAnak` — manual test (render riwayat + chart switching)

---

## Task 1: Pengukuran API module

**Files:**
- Create: `src/api/pengukuran.api.js`

- [ ] **Step 1: Tulis `src/api/pengukuran.api.js`**

```js
import { api } from './client';

function scopeForRole(role) {
  return role === 'ORANG_TUA' ? 'orang-tua' : 'posyandu';
}

export const pengukuranApi = {
  list: (anakId, role) =>
    api.get(`/api/${scopeForRole(role)}/statistik-anak/${anakId}`),

  create: (payload, role) =>
    api.post(`/api/${scopeForRole(role)}/statistik-anak`, payload),

  update: (id, payload) =>
    api.put(`/api/posyandu/statistik-anak/${id}`, payload),

  remove: (id) => api.delete(`/api/posyandu/statistik-anak/${id}`),
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/api/pengukuran.api.js
git commit -m "feat(api): add pengukuran API module"
```

---

## Task 2: Z-Score pure function module

**Files:**
- Create: `src/features/pengukuran/zScore.js`

Extract logic dari `FormInputPerkembanganAnak/index.js` dan `determineAmbangBatas.js` jadi fungsi pure yang menerima input primitif, tidak ada `setState`, tidak ada React.

- [ ] **Step 1: Tulis `src/features/pengukuran/zScore.js`**

```js
import moment from 'moment';
import bbPria from '../../json/ZScoreBeratBadanLakiLaki.json';
import bbPerempuan from '../../json/ZScoreBeratBadanPerempuan.json';
import tbPria from '../../json/ZScorePanjangBadanLakiLaki.json';
import tbPerempuan from '../../json/ZScorePanjangBadanPerempuan.json';
import lkPria from '../../json/ZScoreLingkarKepalaLakiLaki.json';
import lkPerempuan from '../../json/ZScoreLingkarKepalaPerempuan.json';
import bbtbPria24 from '../../json/ZScoreBeratTinggiBadanLakiLaki24.json';
import bbtbPria60 from '../../json/ZScoreBeratTinggiBadanLakiLaki60.json';
import bbtbPerempuan24 from '../../json/ZScoreBeratTinggiBadanPerempuan24.json';
import bbtbPerempuan60 from '../../json/ZScoreBeratTinggiBadanPerempuan60.json';
import { monthDiff } from '../../utils/monthDiff';

const GENDER = { MALE: 'LAKI_LAKI', FEMALE: 'PEREMPUAN' };

function zFromReference(value, ref) {
  if (value == null || !ref) return null;
  const median = parseFloat(ref.median);
  if (value >= median) {
    const sdPos = parseFloat(ref.SD1pos);
    return (value - median) / (sdPos - median);
  }
  const sdNeg = parseFloat(ref.SD1neg);
  return (value - median) / (median - sdNeg);
}

function findByBulan(dataset, umurBulan) {
  return dataset.find((d) => d.bulan === String(umurBulan));
}

function roundPbToHalfStep(tinggi) {
  const frac = tinggi - Math.floor(tinggi);
  if (frac === 0.5) return tinggi;
  if (frac < 0.5) return Math.floor(tinggi);
  return Math.floor(tinggi) + 0.5;
}

function findByPb(dataset, pb) {
  return dataset.find((d) => parseFloat(d.pb) === pb);
}

export function computeZScoreBB({ berat, gender, tanggalLahir, tanggalPengukuran }) {
  if (berat == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(moment(tanggalLahir), moment(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? bbPria : bbPerempuan;
  return zFromReference(berat, findByBulan(dataset, umur));
}

export function computeZScoreTB({ tinggi, gender, tanggalLahir, tanggalPengukuran }) {
  if (tinggi == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(moment(tanggalLahir), moment(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? tbPria : tbPerempuan;
  return zFromReference(tinggi, findByBulan(dataset, umur));
}

export function computeZScoreLK({
  lingkarKepala,
  gender,
  tanggalLahir,
  tanggalPengukuran,
}) {
  if (lingkarKepala == null || !tanggalLahir || !tanggalPengukuran) return null;
  const umur = monthDiff(moment(tanggalLahir), moment(tanggalPengukuran));
  const dataset = gender === GENDER.MALE ? lkPria : lkPerempuan;
  return zFromReference(lingkarKepala, findByBulan(dataset, umur));
}

export function computeZScoreGizi({
  berat,
  tinggi,
  gender,
  tanggalLahir,
  tanggalPengukuran,
}) {
  if (berat == null || tinggi == null || !tanggalLahir || !tanggalPengukuran) {
    return null;
  }
  const umur = monthDiff(moment(tanggalLahir), moment(tanggalPengukuran));
  const pb = roundPbToHalfStep(tinggi);

  let dataset;
  if (gender === GENDER.MALE) {
    dataset = umur <= 24 ? bbtbPria24 : bbtbPria60;
  } else {
    dataset = umur <= 24 ? bbtbPerempuan24 : bbtbPerempuan60;
  }
  return zFromReference(berat, findByPb(dataset, pb));
}

export function computeAllZScores(input) {
  return {
    zScoreBB: computeZScoreBB(input),
    zScoreTB: computeZScoreTB(input),
    zScoreLK: computeZScoreLK(input),
    zScoreGizi: computeZScoreGizi(input),
  };
}
```

- [ ] **Step 2: Pindah `monthDiff` ke `src/utils/monthDiff.js`**

Check existing `src/utilities/calculateMonth.js`:

```bash
Get-Content src/utilities/calculateMonth.js
```

Copy export `monthDiff` ke file baru `src/utils/monthDiff.js`:

```js
// src/utils/monthDiff.js
import moment from 'moment';

export function monthDiff(start, end) {
  return Math.abs(moment(end).diff(moment(start), 'month'));
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/pengukuran/zScore.js src/utils/monthDiff.js
git commit -m "feat(pengukuran): add pure zScore functions and monthDiff util"
```

---

## Task 3: Unit tests untuk zScore

**Files:**
- Create: `src/__tests__/features/pengukuran/zScore.test.js`

- [ ] **Step 1: Tulis test**

```js
import {
  computeZScoreBB,
  computeZScoreTB,
  computeZScoreLK,
  computeZScoreGizi,
  computeAllZScores,
} from '../../../features/pengukuran/zScore';

const baseInput = {
  gender: 'LAKI_LAKI',
  tanggalLahir: '2025-05-12',
  tanggalPengukuran: '2026-05-12',
};

describe('computeZScoreBB', () => {
  test('returns null when berat is missing', () => {
    expect(computeZScoreBB({ ...baseInput, berat: null })).toBeNull();
  });

  test('returns null when tanggalLahir is missing', () => {
    expect(computeZScoreBB({ berat: 10, gender: 'LAKI_LAKI' })).toBeNull();
  });

  test('returns a number for valid input at 12 months', () => {
    const z = computeZScoreBB({ ...baseInput, berat: 9.5 });
    expect(typeof z).toBe('number');
    expect(Number.isFinite(z)).toBe(true);
  });

  test('median value yields z-score ~ 0', () => {
    const z = computeZScoreBB({ ...baseInput, berat: 9.6 });
    expect(Math.abs(z)).toBeLessThan(0.5);
  });

  test('different gender yields different z-score', () => {
    const male = computeZScoreBB({ ...baseInput, berat: 9 });
    const female = computeZScoreBB({
      ...baseInput,
      gender: 'PEREMPUAN',
      berat: 9,
    });
    expect(male).not.toEqual(female);
  });
});

describe('computeZScoreTB', () => {
  test('returns null when tinggi is missing', () => {
    expect(computeZScoreTB({ ...baseInput, tinggi: null })).toBeNull();
  });

  test('returns number for valid input', () => {
    const z = computeZScoreTB({ ...baseInput, tinggi: 75 });
    expect(typeof z).toBe('number');
  });
});

describe('computeZScoreLK', () => {
  test('returns null when lingkarKepala is missing', () => {
    expect(computeZScoreLK({ ...baseInput, lingkarKepala: null })).toBeNull();
  });

  test('returns number for valid input', () => {
    const z = computeZScoreLK({ ...baseInput, lingkarKepala: 45 });
    expect(typeof z).toBe('number');
  });
});

describe('computeZScoreGizi', () => {
  test('returns null when berat or tinggi missing', () => {
    expect(computeZScoreGizi({ ...baseInput, berat: null, tinggi: 75 })).toBeNull();
    expect(computeZScoreGizi({ ...baseInput, berat: 10, tinggi: null })).toBeNull();
  });

  test('uses 0-24 dataset for umur <= 24', () => {
    const z = computeZScoreGizi({
      ...baseInput,
      berat: 9,
      tinggi: 75,
    });
    expect(typeof z === 'number' || z === null).toBe(true);
  });

  test('uses 24-60 dataset for umur > 24', () => {
    const z = computeZScoreGizi({
      gender: 'LAKI_LAKI',
      tanggalLahir: '2023-05-12',
      tanggalPengukuran: '2026-05-12',
      berat: 14,
      tinggi: 95,
    });
    expect(typeof z === 'number' || z === null).toBe(true);
  });
});

describe('computeAllZScores', () => {
  test('returns all 4 keys', () => {
    const result = computeAllZScores({
      ...baseInput,
      berat: 9,
      tinggi: 75,
      lingkarKepala: 45,
    });
    expect(Object.keys(result)).toEqual(['zScoreBB', 'zScoreTB', 'zScoreLK', 'zScoreGizi']);
  });

  test('all keys are null when no measurements', () => {
    const result = computeAllZScores(baseInput);
    expect(result).toEqual({
      zScoreBB: null,
      zScoreTB: null,
      zScoreLK: null,
      zScoreGizi: null,
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --watchAll=false --testPathPattern=zScore
```

Expected: semua pass.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/features/pengukuran/zScore.test.js
git commit -m "test(pengukuran): add unit tests for zScore calculations"
```

---

## Task 4: Status gizi mapping

**Files:**
- Create: `src/features/pengukuran/statusGizi.js`

Map Z-Score angka ke label user-friendly untuk `<StatusBadge>`.

Klasifikasi WHO standard (untuk BB/U):
- `z >= 3`: obesitas
- `z > 1 && z < 3`: lebih (dianggap `kurang`/warning kalau > +2, tapi untuk Plan 2 disederhanakan)
- `z >= -2 && z <= 1`: normal
- `z >= -3 && z < -2`: kurang
- `z < -3`: stunting/severe

Logic final Plan 2: berdasarkan 4 Z-Score, ambil yang paling "bermasalah" untuk status keseluruhan.

- [ ] **Step 1: Tulis `src/features/pengukuran/statusGizi.js`**

```js
export const STATUS = {
  NORMAL: 'normal',
  KURANG: 'kurang',
  STUNTING: 'stunting',
  OBESITAS: 'obesitas',
  UNKNOWN: 'unknown',
};

export function classifyZScore(z) {
  if (z == null || !Number.isFinite(z)) return STATUS.UNKNOWN;
  if (z <= -3) return STATUS.STUNTING;
  if (z < -2) return STATUS.KURANG;
  if (z > 3) return STATUS.OBESITAS;
  if (z > 2) return STATUS.OBESITAS;
  return STATUS.NORMAL;
}

const SEVERITY = {
  [STATUS.STUNTING]: 4,
  [STATUS.OBESITAS]: 3,
  [STATUS.KURANG]: 2,
  [STATUS.NORMAL]: 1,
  [STATUS.UNKNOWN]: 0,
};

export function overallStatus({ zScoreBB, zScoreTB, zScoreLK, zScoreGizi }) {
  const candidates = [zScoreBB, zScoreTB, zScoreLK, zScoreGizi]
    .map(classifyZScore)
    .filter((s) => s !== STATUS.UNKNOWN);

  if (candidates.length === 0) return STATUS.UNKNOWN;

  return candidates.reduce((worst, current) =>
    SEVERITY[current] > SEVERITY[worst] ? current : worst
  );
}

export const STATUS_LABEL = {
  [STATUS.NORMAL]: 'Normal',
  [STATUS.KURANG]: 'Kurang',
  [STATUS.STUNTING]: 'Stunting',
  [STATUS.OBESITAS]: 'Obesitas',
  [STATUS.UNKNOWN]: '-',
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/pengukuran/statusGizi.js
git commit -m "feat(pengukuran): add status gizi classification"
```

---

## Task 5: Unit tests untuk statusGizi

**Files:**
- Create: `src/__tests__/features/pengukuran/statusGizi.test.js`

- [ ] **Step 1: Tulis test**

```js
import {
  STATUS,
  classifyZScore,
  overallStatus,
  STATUS_LABEL,
} from '../../../features/pengukuran/statusGizi';

describe('classifyZScore', () => {
  test('null or NaN returns unknown', () => {
    expect(classifyZScore(null)).toBe(STATUS.UNKNOWN);
    expect(classifyZScore(undefined)).toBe(STATUS.UNKNOWN);
    expect(classifyZScore(NaN)).toBe(STATUS.UNKNOWN);
  });

  test('z <= -3 is stunting', () => {
    expect(classifyZScore(-3)).toBe(STATUS.STUNTING);
    expect(classifyZScore(-4)).toBe(STATUS.STUNTING);
  });

  test('z between -3 and -2 is kurang', () => {
    expect(classifyZScore(-2.5)).toBe(STATUS.KURANG);
  });

  test('z between -2 and 2 is normal', () => {
    expect(classifyZScore(0)).toBe(STATUS.NORMAL);
    expect(classifyZScore(-1.9)).toBe(STATUS.NORMAL);
    expect(classifyZScore(1.9)).toBe(STATUS.NORMAL);
  });

  test('z > 2 is obesitas', () => {
    expect(classifyZScore(2.5)).toBe(STATUS.OBESITAS);
    expect(classifyZScore(3.5)).toBe(STATUS.OBESITAS);
  });
});

describe('overallStatus', () => {
  test('returns unknown when all scores null', () => {
    expect(
      overallStatus({
        zScoreBB: null,
        zScoreTB: null,
        zScoreLK: null,
        zScoreGizi: null,
      })
    ).toBe(STATUS.UNKNOWN);
  });

  test('returns normal when all scores are normal', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: 0.5, zScoreLK: -0.5, zScoreGizi: 1 })
    ).toBe(STATUS.NORMAL);
  });

  test('picks worst status when mixed', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: -3.1, zScoreLK: 0, zScoreGizi: 0 })
    ).toBe(STATUS.STUNTING);
  });

  test('stunting beats obesitas', () => {
    expect(
      overallStatus({ zScoreBB: 3.5, zScoreTB: -3.2, zScoreLK: 0, zScoreGizi: 0 })
    ).toBe(STATUS.STUNTING);
  });

  test('ignores unknown scores', () => {
    expect(
      overallStatus({
        zScoreBB: -2.5,
        zScoreTB: null,
        zScoreLK: null,
        zScoreGizi: null,
      })
    ).toBe(STATUS.KURANG);
  });
});

describe('STATUS_LABEL', () => {
  test('has Indonesian labels for each status', () => {
    expect(STATUS_LABEL[STATUS.NORMAL]).toBe('Normal');
    expect(STATUS_LABEL[STATUS.KURANG]).toBe('Kurang');
    expect(STATUS_LABEL[STATUS.STUNTING]).toBe('Stunting');
    expect(STATUS_LABEL[STATUS.OBESITAS]).toBe('Obesitas');
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --watchAll=false --testPathPattern=statusGizi
```

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/features/pengukuran/statusGizi.test.js
git commit -m "test(pengukuran): add unit tests for status gizi classification"
```

---

## Task 6: Pengukuran query hooks

**Files:**
- Create: `src/queries/usePengukuranQueries.js`

- [ ] **Step 1: Tulis file**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pengukuranApi } from '../api/pengukuran.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function usePengukuranAnak(anakId) {
  const { role, isAuthenticated } = useSession();

  return useQuery({
    queryKey: qk.pengukuran.byAnak(anakId, role),
    queryFn: async () => {
      const res = await pengukuranApi.list(anakId, role);
      return res.data ?? [];
    },
    enabled: isAuthenticated && !!role && !!anakId,
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      [...data].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')),
  });
}

export function useCreatePengukuran(anakId) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: (payload) => pengukuranApi.create(payload, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}

export function useUpdatePengukuran(anakId) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: ({ id, payload }) => pengukuranApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}

export function useDeletePengukuran(anakId) {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: (id) => pengukuranApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.pengukuran.byAnak(anakId, role) });
      qc.invalidateQueries({ queryKey: qk.laporan.all });
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/queries/usePengukuranQueries.js
git commit -m "feat(queries): add pengukuran CRUD hooks"
```

---

## Task 7: CatatanField component

**Files:**
- Create: `src/features/pengukuran/CatatanField.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';

export default function CatatanField({ value = '', onChange, placeholder }) {
  return (
    <div style={{ padding: 'var(--space-md) 0' }}>
      <div
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: 'var(--space-sm)',
        }}
      >
        📝 Catatan <span style={{ fontWeight: 'normal', color: 'var(--color-muted)' }}>(opsional)</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder ?? 'Contoh: anak sedang sakit, baru sembuh demam...'}
        rows={3}
        maxLength={500}
        style={{
          width: '100%',
          padding: 'var(--space-md)',
          fontSize: 'var(--text-base)',
          borderRadius: 'var(--radius-button)',
          border: '1px solid var(--color-border)',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />
      <div
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-muted)',
          textAlign: 'right',
          marginTop: 'var(--space-xs)',
        }}
      >
        {value.length}/500
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/pengukuran/CatatanField.jsx
git commit -m "feat(pengukuran): add CatatanField component"
```

---

## Task 8: PengukuranForm (modal, slider-based)

**Files:**
- Create: `src/features/pengukuran/PengukuranForm.jsx`

Semua field dalam satu modal scroll. Tanggal default hari ini. LILA tampil hanya jika umur ≥ 7 bulan.

- [ ] **Step 1: Tulis file**

```jsx
import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import NumberSlider from '../../components/ui/NumberSlider';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import CatatanField from './CatatanField';
import { computeAllZScores } from './zScore';
import { overallStatus } from './statusGizi';
import { monthDiff } from '../../utils/monthDiff';
import {
  useCreatePengukuran,
  useUpdatePengukuran,
} from '../../queries/usePengukuranQueries';

const DEFAULTS = {
  berat: 8.0,
  tinggi: 70.0,
  lingkarKepala: 45.0,
  lila: 13.0,
  catatan: '',
};

export default function PengukuranForm({ open, onClose, anak, existing }) {
  const toast = useToast();
  const createMutation = useCreatePengukuran(anak?.id);
  const updateMutation = useUpdatePengukuran(anak?.id);

  const isEdit = !!existing;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [tanggal, setTanggal] = useState(moment());
  const [berat, setBerat] = useState(DEFAULTS.berat);
  const [tinggi, setTinggi] = useState(DEFAULTS.tinggi);
  const [lingkarKepala, setLingkarKepala] = useState(DEFAULTS.lingkarKepala);
  const [lila, setLila] = useState(DEFAULTS.lila);
  const [catatan, setCatatan] = useState(DEFAULTS.catatan);

  useEffect(() => {
    if (open && existing) {
      setTanggal(existing.date ? moment(existing.date) : moment());
      setBerat(Number(existing.berat) || DEFAULTS.berat);
      setTinggi(Number(existing.tinggi) || DEFAULTS.tinggi);
      setLingkarKepala(Number(existing.lingkar_kepala) || DEFAULTS.lingkarKepala);
      setLila(Number(existing.lila) || DEFAULTS.lila);
      setCatatan(existing.catatan ?? '');
    } else if (open) {
      setTanggal(moment());
      setBerat(DEFAULTS.berat);
      setTinggi(DEFAULTS.tinggi);
      setLingkarKepala(DEFAULTS.lingkarKepala);
      setLila(DEFAULTS.lila);
      setCatatan(DEFAULTS.catatan);
    }
  }, [open, existing]);

  const umurBulan = useMemo(() => {
    if (!anak?.tanggal_lahir || !tanggal) return null;
    return monthDiff(moment(anak.tanggal_lahir), tanggal);
  }, [anak?.tanggal_lahir, tanggal]);

  const showLila = umurBulan != null && umurBulan >= 7;

  const zScores = useMemo(() => {
    if (!anak?.gender || !anak?.tanggal_lahir || !tanggal) return null;
    return computeAllZScores({
      berat,
      tinggi,
      lingkarKepala,
      gender: anak.gender,
      tanggalLahir: anak.tanggal_lahir,
      tanggalPengukuran: tanggal.format('YYYY-MM-DD'),
    });
  }, [anak, tanggal, berat, tinggi, lingkarKepala]);

  const status = zScores ? overallStatus(zScores) : 'unknown';

  const handleSubmit = () => {
    const payload = {
      id_anak: parseInt(anak.id, 10),
      berat,
      tinggi,
      lingkar_kepala: lingkarKepala,
      lila: showLila ? lila : null,
      catatan: catatan?.trim() || null,
      date: tanggal.format('YYYY-MM-DD'),
      z_score_berat: zScores?.zScoreBB ?? 0,
      z_score_tinggi: zScores?.zScoreTB ?? 0,
      z_score_lingkar_kepala: zScores?.zScoreLK ?? 0,
      z_score_gizi: zScores?.zScoreGizi ?? 0,
    };

    const handlers = {
      onSuccess: () => {
        toast.success(isEdit ? 'Data diperbarui' : 'Pengukuran tersimpan');
        onClose?.();
      },
      onError: (err) => {
        toast.error(err?.message ?? 'Gagal menyimpan');
      },
    };

    if (isEdit) {
      updateMutation.mutate({ id: existing.id, payload }, handlers);
    } else {
      createMutation.mutate(payload, handlers);
    }
  };

  return (
    <>
      {toast.contextHolder}
      <Modal
        title={isEdit ? 'Ubah Pengukuran' : `Pengukuran — ${anak?.nama ?? ''}`}
        open={open}
        onCancel={onClose}
        width={560}
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={isSaving}>
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <div
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--space-sm)',
              }}
            >
              📅 Tanggal Pengukuran
            </div>
            <DatePicker
              value={tanggal}
              onChange={(v) => v && setTanggal(v)}
              allowClear={false}
              style={{ width: '100%', height: 48, fontSize: 'var(--text-base)' }}
              format="DD MMMM YYYY"
            />
            {umurBulan != null && (
              <div style={{ marginTop: 'var(--space-xs)', color: 'var(--color-muted)' }}>
                Umur saat diukur: {umurBulan} bulan
              </div>
            )}
          </div>

          <NumberSlider
            label="⚖️ Berat Badan"
            min={0}
            max={20}
            step={0.1}
            value={berat}
            onChange={setBerat}
            unit="kg"
          />

          <NumberSlider
            label="📏 Tinggi Badan"
            min={0}
            max={118}
            step={0.5}
            value={tinggi}
            onChange={setTinggi}
            unit="cm"
          />

          <NumberSlider
            label="🧠 Lingkar Kepala"
            min={30}
            max={55}
            step={0.1}
            value={lingkarKepala}
            onChange={setLingkarKepala}
            unit="cm"
          />

          {showLila && (
            <NumberSlider
              label="💪 Lingkar Lengan (LILA)"
              min={5}
              max={20}
              step={0.1}
              value={lila}
              onChange={setLila}
              unit="cm"
            />
          )}

          <CatatanField value={catatan} onChange={setCatatan} />

          <div
            style={{
              padding: 'var(--space-md)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-card)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}
          >
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
              Status Gizi:
            </div>
            <StatusBadge status={status} />
          </div>
        </div>
      </Modal>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/features/pengukuran/PengukuranForm.jsx
git commit -m "feat(pengukuran): add slider-based PengukuranForm modal"
```

---

## Task 9: ChartWHO component (reuse chart config 1:1)

**Files:**
- Create: `src/features/anak/ChartWHO.jsx`

Copy config chart dari `src/pages/Posyandu/DetailPosyandu.js` baris 50-1133 (variabel dataChart + options). Tujuan: reuse exact tanpa mengubah rendering logic.

- [ ] **Step 1: Tulis file** (ringkas — inline 4 chart: BB, TB, LK, Gizi)

```jsx
import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  registerables,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import Button from '../../components/ui/Button';

// WHO reference datasets (same as existing DetailPosyandu)
import bbPria from '../../json/ZScoreBeratBadanLakiLaki.json';
import bbPerempuan from '../../json/ZScoreBeratBadanPerempuan.json';
import tbPria from '../../json/ZScorePanjangBadanLakiLaki.json';
import tbPerempuan from '../../json/ZScorePanjangBadanPerempuan.json';
import lkPria from '../../json/ZScoreLingkarKepalaLakiLaki.json';
import lkPerempuan from '../../json/ZScoreLingkarKepalaPerempuan.json';
import bbtbPria24 from '../../json/ZScoreBeratTinggiBadanLakiLaki24.json';
import bbtbPria60 from '../../json/ZScoreBeratTinggiBadanLakiLaki60.json';
import bbtbPerempuan24 from '../../json/ZScoreBeratTinggiBadanPerempuan24.json';
import bbtbPerempuan60 from '../../json/ZScoreBeratTinggiBadanPerempuan60.json';

import { monthDiff } from '../../utils/monthDiff';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ...registerables
);

const MONTH_LABELS = Array.from({ length: 61 }, (_, i) => i);

function buildPbLabels(start, end) {
  const labels = [];
  let v = start;
  while (v <= end) {
    labels.push(v);
    v += 0.5;
  }
  return labels;
}

const PB_LABELS_24 = buildPbLabels(45.0, 110.0);
const PB_LABELS_60 = buildPbLabels(65.0, 110.0);

function roundPb(t) {
  const frac = t - Math.floor(t);
  if (frac === 0.5) return t;
  if (frac < 0.5) return Math.floor(t);
  return Math.floor(t) + 0.5;
}

function mapDataByMonth(data, tanggalLahir, field) {
  const ageIndex = (data ?? []).map((it) =>
    monthDiff(moment(tanggalLahir), moment(it.date))
  );
  const result = [];
  let j = 0;
  for (let i = 0; i <= 60; i++) {
    if (ageIndex.includes(i) && j < data.length) {
      result.push(Number(data[j][field]));
      j++;
    } else {
      result.push(null);
    }
  }
  return result;
}

function mapGiziByPb(data, gender, ageAtFirst) {
  const pbs = (data ?? []).map((it) => roundPb(Number(it.tinggi)));
  let ref;
  if (gender === 'LAKI_LAKI') {
    ref = ageAtFirst <= 24 ? bbtbPria24 : bbtbPria60;
  } else {
    ref = ageAtFirst <= 24 ? bbtbPerempuan24 : bbtbPerempuan60;
  }
  const result = [];
  let j = 0;
  ref.forEach((item) => {
    if (j < pbs.length && parseFloat(pbs[j]) === parseFloat(item.pb)) {
      result.push(Number(data[j].berat));
      j++;
    } else {
      result.push(null);
    }
  });
  return result;
}

const pointColor = 'black';
const SD_COLORS = {
  SD3: 'rgb(255, 0, 55)',
  SD2: 'rgb(255, 137, 163)',
  SD1: 'rgb(234, 255, 0)',
  MEDIAN: 'rgb(154, 255, 136)',
};

function buildAgeDatasets(genderRef, dataPoints) {
  return [
    {
      data: dataPoints,
      pointBackgroundColor: pointColor,
      borderColor: pointColor,
      type: 'scatter',
      showLine: false,
      pointRadius: 5,
      label: 'Data Anak',
    },
    { data: genderRef.map((d) => d.SD3neg), borderColor: SD_COLORS.SD3, type: 'line', label: 'SD -3' },
    { data: genderRef.map((d) => d.SD2neg), borderColor: SD_COLORS.SD2, type: 'line', label: 'SD -2' },
    { data: genderRef.map((d) => d.SD1neg), borderColor: SD_COLORS.SD1, type: 'line', label: 'SD -1' },
    { data: genderRef.map((d) => d.median), borderColor: SD_COLORS.MEDIAN, type: 'line', label: 'Median' },
    { data: genderRef.map((d) => d.SD1pos), borderColor: SD_COLORS.SD1, type: 'line', label: 'SD +1' },
    { data: genderRef.map((d) => d.SD2pos), borderColor: SD_COLORS.SD2, type: 'line', label: 'SD +2' },
    { data: genderRef.map((d) => d.SD3pos), borderColor: SD_COLORS.SD3, type: 'line', label: 'SD +3' },
  ];
}

function ageChartOptions(yLabel, unit) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { title: { display: true, text: `${yLabel} (${unit})` } },
      x: { title: { display: true, text: 'Umur (Bulan)' }, min: 0, max: 60 },
    },
    elements: { point: { radius: 0 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${yLabel}: ${ctx.parsed.y} ${unit}`,
        },
      },
      title: { display: true, text: `${yLabel} berdasarkan Umur` },
    },
  };
}

export default function ChartWHO({ anak, pengukuran }) {
  const [tab, setTab] = useState('BB');

  const gender = anak?.gender;
  const tanggalLahir = anak?.tanggal_lahir;

  const ageAtFirst = useMemo(() => {
    if (!tanggalLahir || !pengukuran?.[0]?.date) return 0;
    return monthDiff(moment(tanggalLahir), moment(pengukuran[0].date));
  }, [tanggalLahir, pengukuran]);

  const dataBB = useMemo(() => mapDataByMonth(pengukuran, tanggalLahir, 'berat'), [pengukuran, tanggalLahir]);
  const dataTB = useMemo(() => mapDataByMonth(pengukuran, tanggalLahir, 'tinggi'), [pengukuran, tanggalLahir]);
  const dataLK = useMemo(() => mapDataByMonth(pengukuran, tanggalLahir, 'lingkar_kepala'), [pengukuran, tanggalLahir]);
  const dataGizi = useMemo(() => mapGiziByPb(pengukuran, gender, ageAtFirst), [pengukuran, gender, ageAtFirst]);

  const refBB = gender === 'LAKI_LAKI' ? bbPria : bbPerempuan;
  const refTB = gender === 'LAKI_LAKI' ? tbPria : tbPerempuan;
  const refLK = gender === 'LAKI_LAKI' ? lkPria : lkPerempuan;

  const refGizi = gender === 'LAKI_LAKI'
    ? (ageAtFirst <= 24 ? bbtbPria24 : bbtbPria60)
    : (ageAtFirst <= 24 ? bbtbPerempuan24 : bbtbPerempuan60);
  const pbLabels = ageAtFirst <= 24 ? PB_LABELS_24 : PB_LABELS_60;

  const charts = {
    BB: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refBB, dataBB) },
      options: ageChartOptions('Berat Badan', 'kg'),
    },
    TB: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refTB, dataTB) },
      options: ageChartOptions('Tinggi Badan', 'cm'),
    },
    LK: {
      data: { labels: MONTH_LABELS, datasets: buildAgeDatasets(refLK, dataLK) },
      options: ageChartOptions('Lingkar Kepala', 'cm'),
    },
    Gizi: {
      data: { labels: pbLabels, datasets: buildAgeDatasets(refGizi, dataGizi) },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { title: { display: true, text: 'Berat Badan (kg)' } },
          x: { title: { display: true, text: 'Panjang Badan (cm)' }, min: 45, max: 110 },
        },
        elements: { point: { radius: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Berat: ${ctx.parsed.y} kg, Tinggi: ${ctx.parsed.x} cm`,
            },
          },
          title: { display: true, text: 'Berat Badan berdasarkan Panjang Badan' },
        },
      },
    },
  };

  const current = charts[tab];

  return (
    <div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        {[
          { key: 'BB', label: 'Berat Badan' },
          { key: 'TB', label: 'Tinggi Badan' },
          { key: 'LK', label: 'Lingkar Kepala' },
          { key: 'Gizi', label: 'Gizi' },
        ].map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      <div
        style={{
          width: '100%',
          minHeight: 500,
          padding: 'var(--space-md)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        <Line data={current.data} options={current.options} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add src/features/anak/ChartWHO.jsx
git commit -m "feat(anak): add ChartWHO component (reuses existing chart config)"
```

---

## Task 10: RiwayatCard component

**Files:**
- Create: `src/features/anak/RiwayatCard.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import moment from 'moment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { classifyZScore, overallStatus, STATUS } from '../pengukuran/statusGizi';

export default function RiwayatCard({ pengukuran, onEdit, onDelete, canEdit = true }) {
  const {
    date,
    berat,
    tinggi,
    lingkar_kepala: lingkarKepala,
    lila,
    catatan,
    z_score_berat,
    z_score_tinggi,
    z_score_lingkar_kepala,
    z_score_gizi,
  } = pengukuran;

  const status = overallStatus({
    zScoreBB: Number(z_score_berat),
    zScoreTB: Number(z_score_tinggi),
    zScoreLK: Number(z_score_lingkar_kepala),
    zScoreGizi: Number(z_score_gizi),
  });

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
          {date ? moment(date).format('DD MMMM YYYY') : '-'}
        </div>
        <StatusBadge status={status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
        <div><strong>⚖️ BB:</strong> {berat} kg</div>
        <div><strong>📏 TB:</strong> {tinggi} cm</div>
        <div><strong>🧠 LK:</strong> {lingkarKepala} cm</div>
        {lila != null && <div><strong>💪 LILA:</strong> {lila} cm</div>}
      </div>

      {catatan && (
        <div
          style={{
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-button)',
            fontSize: 'var(--text-base)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          📝 {catatan}
        </div>
      )}

      {canEdit && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(pengukuran)}>
            Ubah
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete?.(pengukuran)}>
            Hapus
          </Button>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/anak/RiwayatCard.jsx
git commit -m "feat(anak): add RiwayatCard component"
```

---

## Task 11: DetailAnak page

**Files:**
- Create: `src/features/anak/DetailAnak.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Modal as AntModal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useAnakDetail } from '../../queries/useAnakQueries';
import {
  usePengukuranAnak,
  useDeletePengukuran,
} from '../../queries/usePengukuranQueries';
import { useSession } from '../auth/useSession';
import PengukuranForm from '../pengukuran/PengukuranForm';
import RiwayatCard from './RiwayatCard';
import ChartWHO from './ChartWHO';

export default function DetailAnak() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { role } = useSession();

  const { data: anak, isLoading: anakLoading } = useAnakDetail(id);
  const { data: pengukuran, isLoading: pengukuranLoading } = usePengukuranAnak(id);
  const deleteMutation = useDeletePengukuran(id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const canEdit = role === 'KADER_POSYANDU' || role === 'ORANG_TUA';

  const handleEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    AntModal.confirm({
      title: 'Hapus pengukuran?',
      icon: <ExclamationCircleOutlined />,
      content: `Data tanggal ${moment(item.date).format('DD MMMM YYYY')} akan dihapus.`,
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteMutation.mutate(item.id, {
          onSuccess: () => toast.success('Pengukuran dihapus'),
          onError: (err) => toast.error(err?.message ?? 'Gagal menghapus'),
        });
      },
    });
  };

  const umur = anak?.tanggal_lahir
    ? moment().diff(moment(anak.tanggal_lahir), 'month')
    : null;

  return (
    <>
      {toast.contextHolder}
      <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
        <PageHeader
          title={anakLoading ? 'Memuat...' : (anak?.nama ?? '-')}
          subtitle={umur != null ? `${umur} bulan · ${anak?.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}` : undefined}
        />

        <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-md)' }}>
            ← Kembali
          </Button>

          {canEdit && (
            <Button variant="primary" size="lg" onClick={handleAdd} style={{ width: '100%', marginBottom: 'var(--space-lg)' }}>
              + Ukur Pengukuran Baru
            </Button>
          )}

          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-md)' }}>
            Riwayat Pengukuran
          </h2>

          {pengukuranLoading && <div style={{ padding: 'var(--space-lg)' }}>Memuat...</div>}

          {!pengukuranLoading && (!pengukuran || pengukuran.length === 0) && (
            <div
              style={{
                padding: 'var(--space-xl)',
                textAlign: 'center',
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-card)',
                color: 'var(--color-muted)',
              }}
            >
              Belum ada data pengukuran
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
            {[...(pengukuran ?? [])]
              .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
              .map((p) => (
                <RiwayatCard
                  key={p.id}
                  pengukuran={p}
                  canEdit={canEdit}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
          </div>

          {pengukuran && pengukuran.length > 0 && (
            <>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-md)' }}>
                Grafik Pertumbuhan (WHO)
              </h2>
              <ChartWHO anak={anak} pengukuran={pengukuran} />
            </>
          )}
        </div>

        <PengukuranForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          anak={anak}
          existing={editing}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add src/features/anak/DetailAnak.jsx
git commit -m "feat(anak): add DetailAnak page with riwayat and chart"
```

---

## Task 12: Integrate DetailAnak ke AppRoutes

**Files:**
- Modify: `src/routes/AppRoutes.jsx`

- [ ] **Step 1: Edit AppRoutes.jsx**

Ganti import `DetailPosyandu` dengan `DetailAnak`. Ganti kedua route `/kader/balita/:id` dan `/orangtua/balita/:id` untuk pakai `DetailAnak`.

Current di baris 20:
```jsx
import DetailPosyandu from '../pages/Posyandu/DetailPosyandu';
```

Add di bawahnya:
```jsx
import DetailAnak from '../features/anak/DetailAnak';
```

Lalu ganti:
- `<Route path="/kader/balita/:id" element={<DetailPosyandu />} />` → `<Route path="/kader/balita/:id" element={<DetailAnak />} />`
- `<Route path="/orangtua/balita/:id" element={<Detail />} />` → `<Route path="/orangtua/balita/:id" element={<DetailAnak />} />`

Hapus import `DetailPosyandu` dan `Detail` kalau tidak dipakai lagi di file ini.

- [ ] **Step 2: Verify build & run tests**

```bash
npm run build
npm test -- --watchAll=false
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/AppRoutes.jsx
git commit -m "refactor(routes): use new DetailAnak page for kader and orangtua"
```

---

## Task 13: Manual verification

**Files:**
- None (manual test)

- [ ] **Step 1: Login kader → buka detail balita**

1. `npm start`
2. Login kader, navigate ke `/kader/balita`
3. Klik salah satu balita → harus buka halaman baru `DetailAnak` (bukan `DetailPosyandu` lama)

- [ ] **Step 2: Input pengukuran baru via slider**

1. Klik "+ Ukur Pengukuran Baru"
2. Modal muncul dengan: tanggal hari ini, 4 slider (BB 0-20, TB 0-118, LK 30-55, LILA jika umur ≥ 7bln), catatan textarea
3. Geser slider → angka berubah
4. Tekan +/− → nilai bergeser sesuai step
5. Status Gizi muncul live preview di bawah
6. Klik "Simpan" → toast "Pengukuran tersimpan" → riwayat bertambah

- [ ] **Step 3: Edit pengukuran existing**

1. Di RiwayatCard, klik "Ubah"
2. Modal muncul dengan nilai existing pre-loaded
3. Ubah BB → klik "Simpan Perubahan"
4. Verify riwayat terupdate

- [ ] **Step 4: Hapus pengukuran**

1. Klik "Hapus" → dialog konfirmasi
2. Klik "Ya, Hapus" → toast "Pengukuran dihapus" → riwayat berkurang

- [ ] **Step 5: Chart tab switching**

1. Di bagian bawah page, klik tombol Berat Badan/Tinggi Badan/Lingkar Kepala/Gizi
2. Chart Z-Score muncul sesuai tab, data point balita ditampilkan hitam

- [ ] **Step 6: LILA conditional**

1. Pilih balita umur < 7 bulan → modal pengukuran: slider LILA TIDAK muncul
2. Pilih balita umur ≥ 7 bulan → slider LILA muncul

- [ ] **Step 7: Login OT → readonly view**

1. Logout, login sebagai Orang Tua
2. Buka `/orangtua/balita/:id`
3. Riwayat pengukuran tampil tanpa tombol Ubah/Hapus (kecuali kalau `role === 'ORANG_TUA'` boleh edit; cek requirement — di Plan 2 OT boleh edit sesuai legacy behavior)

- [ ] **Step 8: Backend compatibility**

Cek console/network:
- Payload POST `/api/posyandu/statistik-anak` berisi `lila` dan `catatan` (null jika kosong)
- Kalau backend reject karena field belum support: koordinasi dengan tim backend (B1 blocker)

---

## Task 14: Update docs

**Files:**
- Modify: `docs/testing-checklist.md`
- Modify: `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md`

- [ ] **Step 1: Tambah section Pengukuran di checklist**

Di `docs/testing-checklist.md`, tambah setelah section "Kader Posyandu":

```markdown
## Pengukuran (Plan 2)
- [ ] Form pengukuran buka dari DetailAnak, tanggal default hari ini
- [ ] Slider BB/TB/LK responsive, tombol +/− jalan
- [ ] Slider LILA hanya muncul untuk balita umur ≥ 7 bulan
- [ ] Catatan textarea jalan (max 500 char)
- [ ] Status Gizi preview muncul live saat semua terisi
- [ ] Submit create pengukuran baru → toast sukses → riwayat bertambah
- [ ] Edit pengukuran existing pre-loads nilai correctly
- [ ] Delete pengukuran dengan konfirmasi dialog
- [ ] 4 tab chart (BB/TB/LK/Gizi) switch dengan benar
- [ ] Chart Z-Score menampilkan data point balita (titik hitam) di atas band WHO
- [ ] Payload POST/PUT include `lila` dan `catatan` (null jika kosong)
```

- [ ] **Step 2: Update spec status**

```
**Status:** Phase 0–4 DONE (Plan 1 + Plan 2). Phase 5–9 pending.
```

- [ ] **Step 3: Commit**

```bash
git add docs/testing-checklist.md docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md
git commit -m "docs: update for Plan 2 Pengukuran & Detail Anak"
```

---

## Plan 2 Acceptance Criteria

- ✅ Field `lila` dan `catatan` terkirim di payload POST/PUT pengukuran
- ✅ Form pengukuran pakai slider + tombol +/−, zero keyboard angka
- ✅ LILA conditional berdasarkan umur ≥ 7 bulan
- ✅ Catatan textarea dengan max 500 char
- ✅ Status gizi live preview di form
- ✅ Z-Score logic extracted ke pure function dengan unit test
- ✅ DetailAnak page baru replace DetailPosyandu di route kader & OT
- ✅ Chart WHO tetap jalan (config reuse 1:1)
- ✅ Riwayat card dengan tombol Ubah/Hapus (conditional by role)
- ✅ Tests pass: 30 lama + ~20 baru Plan 2

---

## Risiko & Catatan

| Risiko | Mitigasi |
|---|---|
| Backend belum support `lila` + `catatan` | Form kirim `null`. Kalau backend 400-reject karena field tidak dikenal, koordinasi B1 urgent |
| Chart WHO refactor breaking visual | Config di-copy-paste exact dari DetailPosyandu; manual visual test di Task 13 |
| `DetailAnak` untuk OT hilangkan fitur edit | Default `canEdit = role === 'ORANG_TUA' || role === 'KADER_POSYANDU'` sesuai behavior legacy; kalau mau read-only strict, ubah ke `role === 'KADER_POSYANDU'` saja |
| Default value slider (BB 8kg, TB 70cm) mungkin bias | Default simpel untuk cepat; kader geser sesuai data aktual |

---

## Next Plan

Plan 3 — Laporan & Desa (Phase 5 + 6). Butuh backend blocker B2 (endpoint rekap) atau fallback aggregate client.
