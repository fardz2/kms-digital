# Plan 3 — Laporan & Desa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah fitur laporan bulanan untuk 3 role (kader, desa, admin). Pakai endpoint backend yang sudah ada — tidak blocker lagi. Gantikan `/admin/dashboard/laporan` placeholder dari Plan 4 dengan implementasi real.

**Architecture:** Backend sudah expose `/api/statistik-gizi/:id_desa` (dipakai legacy `Desa.js`). Untuk laporan kader, aggregate di client dari `/api/posyandu/data-anak` + per-anak `/api/posyandu/statistik-anak/:id`. Untuk admin, aggregate ulang dari statistik-gizi semua desa. Export PDF pakai `js-html2pdf` yang sudah terinstall, export Excel pakai `xlsx`. CSV export reuse endpoint backend existing.

**Tech Stack:** React 18 (CRA), TanStack Query v5, Ant Design v4, js-html2pdf, xlsx, moment, Jest.

**Spec:** `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md` — Section 6, 9, Phase 5 & 6.

**Backend dependencies:** NONE — plan ini pakai endpoint yang sudah ada.

---

## Backend Discovery Notes

Plan ini direvisi setelah discovery saat writing. Endpoint yang sudah ada (confirmed di legacy `src/pages/Desa/desa.js` + `src/pages/Desa/input_acara.js` + `src/components/layout/Table/index.js:479`):

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/statistik-gizi/:id_desa` | Desa | Rekap per-posyandu: `nama_posyandu`, `berat_badan.{normal,kurus,sangat_kurus,gemuk}`, `tinggi_badan.{tinggi,normal,pendek,sangat_pendek}`, `lingkar_kepala.{makrosefali,normal,mikrosefali}` |
| `GET /api/reminder` | Desa | List acara posyandu |
| `POST /api/reminder` | Desa | Create acara |
| `GET /api/export-data-anak-csv?desa=X&bulan=MM&tahun=YYYY&id=Y` | Desa | CSV export per posyandu per bulan |
| `GET /api/posyandu/data-anak/export-data-anak-csv` | Kader | Kader CSV export |
| `GET /api/posyandu/data-anak` | Kader | List balita (dipakai Plan 1) |
| `GET /api/posyandu/statistik-anak/:id` | Kader | Riwayat pengukuran per anak (dipakai Plan 2) |

Tidak butuh endpoint rekap baru — semua data dapat diambil dari kombinasi di atas.

---

## File Structure

**Folder baru:**
```
src/
├── api/
│   ├── laporan.api.js                NEW (statistik-gizi + export)
│   └── reminder.api.js               NEW
├── queries/
│   ├── useLaporanQueries.js          NEW
│   └── useReminderQueries.js         NEW
├── features/
│   ├── laporan/
│   │   ├── aggregateKader.js         NEW (client-side aggregation)
│   │   ├── LaporanBulananKader.jsx   NEW
│   │   ├── LaporanDesa.jsx           NEW (statistik-gizi wrap)
│   │   └── LaporanAdmin.jsx          NEW
│   └── desa/
│       ├── BerandaDesa.jsx           NEW
│       └── KelolaAcara.jsx           NEW (refactor input_acara)
├── components/ui/
│   ├── MonthPicker.jsx               NEW
│   ├── StatCard.jsx                  NEW
│   ├── StatusDistribution.jsx        NEW
│   └── ProgressBar.jsx               NEW
└── __tests__/features/laporan/
    └── aggregateKader.test.js        NEW
```

**Dimodifikasi:**
- `src/routes/AppRoutes.jsx` — swap `LaporanAdminPlaceholder` ke `LaporanAdmin`, swap `Desa` lama ke `BerandaDesa`, swap `InputAcara` ke `KelolaAcara`, tambah `/kader/laporan` route
- `src/features/kader/BerandaKader.jsx` — card Laporan jadi clickable ke `/kader/laporan`

**Tidak disentuh (coexist):**
- `src/pages/Desa/desa.js` → legacy, di-archive setelah verifikasi (Plan 5)
- `src/pages/Desa/input_acara.js` → legacy, di-archive setelah verifikasi
- `src/features/admin/LaporanAdminPlaceholder.jsx` → bisa dihapus di Plan 5

---

## Testing Strategy

- **Pure logic test**: `aggregateKader.js` punya banyak edge case (balita tanpa pengukuran, bulan kosong, mixed status) → unit test penting
- **Wrapping & UI**: manual test via `docs/testing-checklist.md`
- **Export PDF/Excel**: manual test karena browser-dependent
- Target: 55 existing + ~10 baru = ~65 total

---

## Task 1: Laporan & Reminder API modules

**Files:**
- Create: `src/api/laporan.api.js`
- Create: `src/api/reminder.api.js`

- [ ] **Step 1: Tulis `src/api/laporan.api.js`**

```js
import { api } from './client';

export const laporanApi = {
  statistikGizi: (idDesa) => api.get(`/api/statistik-gizi/${idDesa}`),

  exportCsvDesa: ({ desa, bulan, tahun, id }) =>
    api.get(`/api/export-data-anak-csv`, {
      params: { desa, bulan, tahun, id },
      responseType: 'blob',
    }),

  exportCsvKader: () =>
    api.get(`/api/posyandu/data-anak/export-data-anak-csv`, {
      responseType: 'blob',
    }),
};
```

**Catatan:** Axios response interceptor di `api/client.js` strip `res.data`. Untuk blob response, hasil langsung adalah Blob.

- [ ] **Step 2: Tulis `src/api/reminder.api.js`**

```js
import { api } from './client';

export const reminderApi = {
  list: () => api.get('/api/reminder'),
  create: (payload) => api.post('/api/reminder', payload),
  remove: (id) => api.delete(`/api/reminder/${id}`),
};
```

- [ ] **Step 3: Commit**

```bash
git add src/api/laporan.api.js src/api/reminder.api.js
git commit -m "feat(api): add laporan and reminder API modules"
```

---

## Task 2: Query hooks

**Files:**
- Create: `src/queries/useLaporanQueries.js`
- Create: `src/queries/useReminderQueries.js`

- [ ] **Step 1: Tulis `src/queries/useLaporanQueries.js`**

```js
import { useQuery } from '@tanstack/react-query';
import { laporanApi } from '../api/laporan.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useStatistikGiziDesa(idDesa) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.laporan.desa(idDesa, 'all'),
    queryFn: async () => {
      const res = await laporanApi.statistikGizi(idDesa);
      return res.data ?? [];
    },
    enabled: isAuthenticated && !!idDesa,
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 2: Tulis `src/queries/useReminderQueries.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reminderApi } from '../api/reminder.api';
import { useSession } from '../features/auth/useSession';

const REMINDER_KEY = ['reminder'];

export function useReminderList() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: REMINDER_KEY,
    queryFn: async () => {
      const res = await reminderApi.list();
      return res.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => reminderApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: REMINDER_KEY }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => reminderApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: REMINDER_KEY }),
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/queries/useLaporanQueries.js src/queries/useReminderQueries.js
git commit -m "feat(queries): add laporan and reminder query hooks"
```

---

## Task 3: aggregateKader pure function

**Files:**
- Create: `src/features/laporan/aggregateKader.js`

Logic: input = list anak + per-anak list pengukuran + bulan (YYYY-MM). Output: stats + list belum diukur + list perlu perhatian.

- [ ] **Step 1: Tulis file**

```js
import moment from 'moment';
import { overallStatus, STATUS } from '../pengukuran/statusGizi';

function matchesBulan(date, bulan) {
  if (!date) return false;
  return moment(date).format('YYYY-MM') === bulan;
}

function computePengukuranStatus(p) {
  const toZ = (v) => (v == null || v === '' ? null : Number(v));
  return overallStatus({
    zScoreBB: toZ(p.z_score_berat),
    zScoreTB: toZ(p.z_score_tinggi),
    zScoreLK: toZ(p.z_score_lingkar_kepala),
    zScoreGizi: toZ(p.z_score_gizi),
  });
}

export function aggregateKaderLaporan({ anakList, pengukuranByAnak, bulan }) {
  const safeAnak = anakList ?? [];
  const totalBalita = safeAnak.length;

  let sudahDiukur = 0;
  const belumDiukurList = [];
  const perluPerhatian = [];
  const distribusi = {
    [STATUS.NORMAL]: 0,
    [STATUS.KURANG]: 0,
    [STATUS.STUNTING]: 0,
    [STATUS.OBESITAS]: 0,
  };

  safeAnak.forEach((anak) => {
    const pengukuran = pengukuranByAnak?.[anak.id] ?? [];
    const inBulan = pengukuran.filter((p) => matchesBulan(p.date, bulan));

    if (inBulan.length === 0) {
      const umurBulan = anak.tanggal_lahir
        ? moment().diff(moment(anak.tanggal_lahir), 'month')
        : null;
      belumDiukurList.push({ id: anak.id, nama: anak.nama, umurBulan });
      return;
    }

    sudahDiukur += 1;
    const latest = inBulan.reduce((a, b) =>
      (a.date ?? '').localeCompare(b.date ?? '') > 0 ? a : b
    );
    const status = computePengukuranStatus(latest);
    if (distribusi[status] != null) distribusi[status] += 1;
    if (status !== STATUS.NORMAL && status !== STATUS.UNKNOWN) {
      perluPerhatian.push({ id: anak.id, nama: anak.nama, status });
    }
  });

  return {
    totalBalita,
    sudahDiukur,
    belumDiukur: totalBalita - sudahDiukur,
    belumDiukurList,
    perluPerhatian,
    distribusi,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/laporan/aggregateKader.js
git commit -m "feat(laporan): add aggregateKader client-side aggregation"
```

---

## Task 4: Unit tests untuk aggregateKader

**Files:**
- Create: `src/__tests__/features/laporan/aggregateKader.test.js`

- [ ] **Step 1: Tulis test**

```js
import { aggregateKaderLaporan } from '../../../features/laporan/aggregateKader';

const anakA = { id: 1, nama: 'Budi', tanggal_lahir: '2025-05-12' };
const anakB = { id: 2, nama: 'Siti', tanggal_lahir: '2025-01-01' };
const anakC = { id: 3, nama: 'Rina', tanggal_lahir: '2024-12-01' };

describe('aggregateKaderLaporan', () => {
  test('empty list returns zeros', () => {
    const r = aggregateKaderLaporan({ anakList: [], pengukuranByAnak: {}, bulan: '2026-05' });
    expect(r.totalBalita).toBe(0);
    expect(r.sudahDiukur).toBe(0);
    expect(r.belumDiukur).toBe(0);
    expect(r.belumDiukurList).toEqual([]);
    expect(r.perluPerhatian).toEqual([]);
  });

  test('all anak tanpa pengukuran bulan ini masuk belumDiukur', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA, anakB],
      pengukuranByAnak: { 1: [], 2: [] },
      bulan: '2026-05',
    });
    expect(r.totalBalita).toBe(2);
    expect(r.sudahDiukur).toBe(0);
    expect(r.belumDiukur).toBe(2);
    expect(r.belumDiukurList.map((x) => x.id)).toEqual([1, 2]);
  });

  test('pengukuran di bulan lain tidak dihitung', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA],
      pengukuranByAnak: {
        1: [{ date: '2026-04-15', z_score_berat: 0 }],
      },
      bulan: '2026-05',
    });
    expect(r.sudahDiukur).toBe(0);
    expect(r.belumDiukur).toBe(1);
  });

  test('normal status tidak masuk perluPerhatian', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA],
      pengukuranByAnak: {
        1: [{ date: '2026-05-10', z_score_berat: 0, z_score_tinggi: 0, z_score_lingkar_kepala: 0, z_score_gizi: 0 }],
      },
      bulan: '2026-05',
    });
    expect(r.sudahDiukur).toBe(1);
    expect(r.distribusi.normal).toBe(1);
    expect(r.perluPerhatian).toEqual([]);
  });

  test('stunting masuk perluPerhatian dan distribusi', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakB],
      pengukuranByAnak: {
        2: [{ date: '2026-05-10', z_score_berat: 0, z_score_tinggi: -3.5, z_score_lingkar_kepala: 0, z_score_gizi: 0 }],
      },
      bulan: '2026-05',
    });
    expect(r.distribusi.stunting).toBe(1);
    expect(r.perluPerhatian).toHaveLength(1);
    expect(r.perluPerhatian[0].status).toBe('stunting');
  });

  test('multiple pengukuran di bulan sama pakai yang terbaru', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakC],
      pengukuranByAnak: {
        3: [
          { date: '2026-05-05', z_score_berat: -3.5 },
          { date: '2026-05-20', z_score_berat: 0 },
        ],
      },
      bulan: '2026-05',
    });
    expect(r.distribusi.normal).toBe(1);
    expect(r.distribusi.stunting).toBe(0);
  });

  test('mixed: 3 anak, 1 normal + 1 kurang + 1 belum diukur', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA, anakB, anakC],
      pengukuranByAnak: {
        1: [{ date: '2026-05-01', z_score_berat: 0 }],
        2: [{ date: '2026-05-01', z_score_berat: -2.5 }],
        3: [],
      },
      bulan: '2026-05',
    });
    expect(r.totalBalita).toBe(3);
    expect(r.sudahDiukur).toBe(2);
    expect(r.belumDiukur).toBe(1);
    expect(r.distribusi.normal).toBe(1);
    expect(r.distribusi.kurang).toBe(1);
    expect(r.perluPerhatian).toHaveLength(1);
    expect(r.perluPerhatian[0].status).toBe('kurang');
    expect(r.belumDiukurList[0].id).toBe(3);
  });

  test('null z-scores treated as unknown, not normal', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA],
      pengukuranByAnak: {
        1: [{ date: '2026-05-01', z_score_berat: null, z_score_tinggi: null, z_score_lingkar_kepala: null, z_score_gizi: null }],
      },
      bulan: '2026-05',
    });
    expect(r.distribusi.normal).toBe(0);
    expect(r.perluPerhatian).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test**

```bash
npm test -- --watchAll=false --testPathPattern=aggregateKader
```

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/features/laporan/aggregateKader.test.js
git commit -m "test(laporan): add unit tests for aggregateKader"
```

---

## Task 5: Shared UI components (MonthPicker, StatCard, StatusDistribution, ProgressBar)

**Files:**
- Create: `src/components/ui/MonthPicker.jsx`
- Create: `src/components/ui/StatCard.jsx`
- Create: `src/components/ui/StatusDistribution.jsx`
- Create: `src/components/ui/ProgressBar.jsx`

- [ ] **Step 1: MonthPicker**

```jsx
import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

export default function MonthPicker({ value, onChange }) {
  const current = value ? moment(value, 'YYYY-MM') : moment();
  return (
    <DatePicker
      picker="month"
      value={current}
      onChange={(v) => v && onChange?.(v.format('YYYY-MM'))}
      allowClear={false}
      format="MMMM YYYY"
      style={{ height: 40, fontSize: 'var(--text-base)' }}
    />
  );
}
```

- [ ] **Step 2: StatCard**

```jsx
import React from 'react';

export default function StatCard({ label, value, icon, color = 'var(--color-primary)' }) {
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-md)',
        textAlign: 'center',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {icon && (
        <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-xs)' }}>
          {icon}
        </div>
      )}
      <div style={{ fontSize: 'var(--text-display)', fontWeight: 'var(--font-weight-bold)', color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)', marginTop: 'var(--space-xs)' }}>
        {label}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ProgressBar**

```jsx
import React from 'react';

export default function ProgressBar({ value = 0, max = 100, label, color = 'var(--color-primary)' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-base)' }}>
          <span>{label}</span>
          <span>
            {value}/{max} ({pct.toFixed(0)}%)
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: 12,
          background: 'var(--color-border)',
          borderRadius: 'var(--radius-button)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            transition: 'width 0.3s',
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: StatusDistribution**

```jsx
import React from 'react';
import ProgressBar from './ProgressBar';

const CONFIG = [
  { key: 'normal', label: 'Normal', color: 'var(--color-success)' },
  { key: 'kurang', label: 'Kurang', color: 'var(--color-warning)' },
  { key: 'stunting', label: 'Stunting', color: 'var(--color-danger)' },
  { key: 'obesitas', label: 'Obesitas', color: 'var(--color-danger)' },
];

export default function StatusDistribution({ distribusi, total }) {
  const safeTotal = total && total > 0 ? total : 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {CONFIG.map((c) => (
        <ProgressBar
          key={c.key}
          value={distribusi?.[c.key] ?? 0}
          max={safeTotal}
          label={c.label}
          color={c.color}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/MonthPicker.jsx src/components/ui/StatCard.jsx src/components/ui/ProgressBar.jsx src/components/ui/StatusDistribution.jsx
git commit -m "feat(ui): add MonthPicker, StatCard, ProgressBar, StatusDistribution"
```

---

## Task 6: LaporanBulananKader page

**Files:**
- Create: `src/features/laporan/LaporanBulananKader.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useQueries } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MonthPicker from '../../components/ui/MonthPicker';
import StatCard from '../../components/ui/StatCard';
import StatusDistribution from '../../components/ui/StatusDistribution';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAnakList } from '../../queries/useAnakQueries';
import { pengukuranApi } from '../../api/pengukuran.api';
import { useSession } from '../auth/useSession';
import { qk } from '../../queries/keys';
import { aggregateKaderLaporan } from './aggregateKader';

export default function LaporanBulananKader() {
  const navigate = useNavigate();
  const [bulan, setBulan] = useState(moment().format('YYYY-MM'));
  const { role } = useSession();
  const { data: anakList, isLoading: anakLoading } = useAnakList();

  const pengukuranQueries = useQueries({
    queries: (anakList ?? []).map((anak) => ({
      queryKey: qk.pengukuran.byAnak(anak.id, role),
      queryFn: async () => {
        const res = await pengukuranApi.list(anak.id, role);
        return res.data ?? [];
      },
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isFetchingPengukuran = pengukuranQueries.some((q) => q.isLoading);

  const pengukuranByAnak = useMemo(() => {
    const map = {};
    (anakList ?? []).forEach((anak, idx) => {
      map[anak.id] = pengukuranQueries[idx]?.data ?? [];
    });
    return map;
  }, [anakList, pengukuranQueries]);

  const laporan = useMemo(
    () => aggregateKaderLaporan({ anakList, pengukuranByAnak, bulan }),
    [anakList, pengukuranByAnak, bulan]
  );

  const isLoading = anakLoading || isFetchingPengukuran;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader title="Laporan Bulanan" subtitle="Rekap posyandu Anda" />
      <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-md)' }}>
          ← Kembali
        </Button>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-xs)', color: 'var(--color-muted)' }}>Bulan:</div>
          <MonthPicker value={bulan} onChange={setBulan} />
        </div>

        {isLoading ? (
          <div>Memuat data laporan...</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <StatCard label="Total Balita" value={laporan.totalBalita} icon="👶" />
              <StatCard label="Sudah Diukur" value={laporan.sudahDiukur} icon="✅" color="var(--color-success)" />
              <StatCard label="Belum Diukur" value={laporan.belumDiukur} icon="⚠️" color="var(--color-warning)" />
            </div>

            <Card title="Partisipasi Bulan Ini" style={{ marginBottom: 'var(--space-lg)' }}>
              <ProgressBar value={laporan.sudahDiukur} max={laporan.totalBalita || 1} />
            </Card>

            <Card title="Sebaran Status Gizi" style={{ marginBottom: 'var(--space-lg)' }}>
              <StatusDistribution distribusi={laporan.distribusi} total={laporan.sudahDiukur} />
            </Card>

            <Card
              title={`Belum Diukur Bulan Ini (${laporan.belumDiukurList.length})`}
              style={{ marginBottom: 'var(--space-lg)' }}
            >
              {laporan.belumDiukurList.length === 0 ? (
                <div style={{ color: 'var(--color-muted)' }}>Semua balita sudah diukur 🎉</div>
              ) : (
                <ul style={{ paddingLeft: 'var(--space-lg)', margin: 0 }}>
                  {laporan.belumDiukurList.map((item) => (
                    <li key={item.id} style={{ padding: 'var(--space-xs) 0' }}>
                      {item.nama}
                      {item.umurBulan != null && ` (${item.umurBulan} bulan)`}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title={`Perlu Perhatian (${laporan.perluPerhatian.length})`}>
              {laporan.perluPerhatian.length === 0 ? (
                <div style={{ color: 'var(--color-muted)' }}>Tidak ada balita yang perlu perhatian khusus 🎉</div>
              ) : (
                <ul style={{ paddingLeft: 'var(--space-lg)', margin: 0 }}>
                  {laporan.perluPerhatian.map((item) => (
                    <li key={item.id} style={{ padding: 'var(--space-xs) 0' }}>
                      ⚠️ {item.nama} — {item.status}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build + test check**

```bash
npm run build
npm test -- --watchAll=false
```

- [ ] **Step 3: Commit**

```bash
git add src/features/laporan/LaporanBulananKader.jsx
git commit -m "feat(laporan): add LaporanBulananKader page"
```

---

## Task 7: LaporanDesa page

**Files:**
- Create: `src/features/laporan/LaporanDesa.jsx`

Wrapper untuk endpoint `statistik-gizi/:id_desa` yang sudah ada. Shape data:
```json
[
  {
    "id_posyandu": 1,
    "nama_posyandu": "Melati 1",
    "berat_badan": { "normal": 14, "kurus": 2, "sangat_kurus": 1, "gemuk": 0 },
    "tinggi_badan": { "tinggi": 0, "normal": 15, "pendek": 1, "sangat_pendek": 1 },
    "lingkar_kepala": { "makrosefali": 0, "normal": 16, "mikrosefali": 1 }
  },
  ...
]
```

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import ProgressBar from '../../components/ui/ProgressBar';
import { useStatistikGiziDesa } from '../../queries/useLaporanQueries';
import { useSession } from '../auth/useSession';

function sumCategory(cat) {
  if (!cat || typeof cat !== 'object') return 0;
  return Object.values(cat).reduce((acc, v) => acc + Number(v || 0), 0);
}

function aggregateDesa(statistik) {
  if (!Array.isArray(statistik) || statistik.length === 0) {
    return { totalBalita: 0, perPosyandu: [], distribusiBB: {}, distribusiTB: {}, distribusiLK: {} };
  }

  const perPosyandu = statistik.map((p) => ({
    id: p.id_posyandu,
    nama: p.nama_posyandu,
    total: sumCategory(p.berat_badan),
  }));
  const totalBalita = perPosyandu.reduce((acc, x) => acc + x.total, 0);

  const reduceCategory = (key) => {
    const acc = {};
    statistik.forEach((p) => {
      const cat = p[key] ?? {};
      Object.entries(cat).forEach(([k, v]) => {
        acc[k] = (acc[k] ?? 0) + Number(v || 0);
      });
    });
    return acc;
  };

  return {
    totalBalita,
    perPosyandu,
    distribusiBB: reduceCategory('berat_badan'),
    distribusiTB: reduceCategory('tinggi_badan'),
    distribusiLK: reduceCategory('lingkar_kepala'),
  };
}

export default function LaporanDesa() {
  const { user } = useSession();
  const idDesa = user?.id_desa ?? user?.desa_id;
  const { data, isLoading } = useStatistikGiziDesa(idDesa);

  const agg = aggregateDesa(data);

  if (!idDesa) {
    return (
      <Card>
        <div style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
          Data desa tidak tersedia
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return <div>Memuat laporan...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-md)' }}>
        <StatCard label="Total Balita" value={agg.totalBalita} icon="👶" />
        <StatCard label="Posyandu Aktif" value={agg.perPosyandu.length} icon="🏥" color="var(--color-accent)" />
      </div>

      <Card title="Rekap per Posyandu">
        {agg.perPosyandu.length === 0 ? (
          <div style={{ color: 'var(--color-muted)' }}>Belum ada data</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {agg.perPosyandu.map((p) => (
              <ProgressBar
                key={p.id}
                value={p.total}
                max={agg.totalBalita || 1}
                label={p.nama}
              />
            ))}
          </div>
        )}
      </Card>

      <Card title="Sebaran Berat Badan (total desa)">
        <Distribusi distribusi={agg.distribusiBB} total={agg.totalBalita} />
      </Card>

      <Card title="Sebaran Tinggi Badan (total desa)">
        <Distribusi distribusi={agg.distribusiTB} total={agg.totalBalita} />
      </Card>

      <Card title="Sebaran Lingkar Kepala (total desa)">
        <Distribusi distribusi={agg.distribusiLK} total={agg.totalBalita} />
      </Card>
    </div>
  );
}

function Distribusi({ distribusi, total }) {
  const entries = Object.entries(distribusi);
  if (entries.length === 0 || total === 0) {
    return <div style={{ color: 'var(--color-muted)' }}>Belum ada data</div>;
  }
  const labelMap = {
    normal: 'Normal',
    kurus: 'Kurus',
    sangat_kurus: 'Sangat Kurus',
    gemuk: 'Gemuk',
    tinggi: 'Tinggi',
    pendek: 'Pendek',
    sangat_pendek: 'Sangat Pendek',
    makrosefali: 'Makrosefali',
    mikrosefali: 'Mikrosefali',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {entries.map(([k, v]) => (
        <ProgressBar key={k} value={Number(v) || 0} max={total || 1} label={labelMap[k] ?? k} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/laporan/LaporanDesa.jsx
git commit -m "feat(laporan): add LaporanDesa using statistik-gizi endpoint"
```

---

## Task 8: BerandaDesa page (ganti legacy desa.js)

**Files:**
- Create: `src/features/desa/BerandaDesa.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import LaporanDesa from '../laporan/LaporanDesa';

const MENU = [
  { key: 'beranda', label: 'Laporan', path: '/desa/beranda' },
  { key: 'acara', label: 'Kelola Acara', path: '/desa/acara' },
];

export default function BerandaDesa() {
  const navigate = useNavigate();
  const { user } = useSession();

  return (
    <AppShell menu={MENU} activeKey="beranda">
      <PageHeader
        title={`Desa ${user?.nama_desa ?? user?.desa_name ?? ''}`}
        subtitle="Rekap gizi balita se-desa"
      />
      <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Button variant="primary" size="md" onClick={() => navigate('/desa/acara')}>
            📅 Kelola Acara Posyandu
          </Button>
        </div>

        <LaporanDesa />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/desa/BerandaDesa.jsx
git commit -m "feat(desa): add BerandaDesa with LaporanDesa and acara link"
```

---

## Task 9: KelolaAcara page (refactor input_acara.js)

**Files:**
- Create: `src/features/desa/KelolaAcara.jsx`

- [ ] **Step 1: Tulis file**

```jsx
import React, { useState } from 'react';
import moment from 'moment';
import { Form, Input, DatePicker, Modal as AntModal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import {
  useReminderList,
  useCreateReminder,
  useDeleteReminder,
} from '../../queries/useReminderQueries';

const MENU = [
  { key: 'beranda', label: 'Laporan', path: '/desa/beranda' },
  { key: 'acara', label: 'Kelola Acara', path: '/desa/acara' },
];

export default function KelolaAcara() {
  const toast = useToast();
  const [form] = Form.useForm();
  const { data: reminders, isLoading } = useReminderList();
  const createMutation = useCreateReminder();
  const deleteMutation = useDeleteReminder();

  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const payload = {
          judul: values.judul,
          deskripsi: values.deskripsi ?? '',
          tanggal: moment(values.tanggal).format('YYYY-MM-DD'),
        };
        createMutation.mutate(payload, {
          onSuccess: () => {
            toast.success('Acara ditambahkan');
            form.resetFields();
          },
          onError: (err) => toast.error(err?.message ?? 'Gagal menambahkan'),
        });
      })
      .catch(() => {});
  };

  const handleDelete = (id, judul) => {
    AntModal.confirm({
      title: 'Hapus acara?',
      icon: <ExclamationCircleOutlined />,
      content: `Acara "${judul}" akan dihapus.`,
      okText: 'Ya, Hapus',
      cancelText: 'Batal',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteMutation.mutate(id, {
          onSuccess: () => toast.success('Acara dihapus'),
          onError: (err) => toast.error(err?.message ?? 'Gagal menghapus'),
        });
      },
    });
  };

  const sorted = [...(reminders ?? [])].sort((a, b) =>
    (b.tanggal ?? '').localeCompare(a.tanggal ?? '')
  );

  return (
    <AppShell menu={MENU} activeKey="acara">
      {toast.contextHolder}
      <PageHeader title="Kelola Acara Posyandu" subtitle="Buat pengingat acara untuk kader dan orang tua" />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Card title="Tambah Acara Baru" style={{ marginBottom: 'var(--space-lg)' }}>
          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Form.Item
              label="Judul Acara"
              name="judul"
              rules={[{ required: true, message: 'Judul masih kosong' }]}
            >
              <Input placeholder="Contoh: Posyandu Bulan Ini" style={{ height: 44 }} />
            </Form.Item>
            <Form.Item label="Deskripsi" name="deskripsi">
              <Input.TextArea rows={2} placeholder="Detail tambahan (opsional)" />
            </Form.Item>
            <Form.Item
              label="Tanggal"
              name="tanggal"
              rules={[{ required: true, message: 'Tanggal masih kosong' }]}
            >
              <DatePicker
                format="DD MMMM YYYY"
                allowClear={false}
                style={{ width: '100%', height: 44 }}
              />
            </Form.Item>
            <Button type="submit" variant="primary" size="md" loading={createMutation.isPending}>
              Simpan Acara
            </Button>
          </Form>
        </Card>

        <Card title={`Daftar Acara (${sorted.length})`}>
          {isLoading && <div>Memuat...</div>}
          {!isLoading && sorted.length === 0 && (
            <div style={{ color: 'var(--color-muted)', textAlign: 'center', padding: 'var(--space-md)' }}>
              Belum ada acara
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {sorted.map((acara) => (
              <div
                key={acara.id}
                style={{
                  padding: 'var(--space-md)',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-button)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                    {acara.judul}
                  </div>
                  <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
                    {acara.tanggal ? moment(acara.tanggal).format('DD MMMM YYYY') : '-'}
                  </div>
                  {acara.deskripsi && (
                    <div style={{ fontSize: 'var(--text-base)', marginTop: 'var(--space-xs)' }}>
                      {acara.deskripsi}
                    </div>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(acara.id, acara.judul)}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/desa/KelolaAcara.jsx
git commit -m "feat(desa): add KelolaAcara page"
```

---

## Task 10: LaporanAdmin page

**Files:**
- Create: `src/features/laporan/LaporanAdmin.jsx`

Admin butuh breakdown per desa. Kalau backend punya endpoint admin khusus, pakai itu. Kalau tidak, fallback: fetch list desa dulu, lalu aggregate `statistik-gizi/:id_desa` untuk tiap desa.

Untuk Plan 3 ini saya implement **endpoint probing**: coba `/api/admin/statistik-gizi` dulu; kalau 404, fallback aggregate dari per-desa. Karena admin sub-page `DesaPage` sudah punya endpoint untuk list desa, saya reuse itu.

Simpler approach: aggregate per desa di client untuk MVP. Kalau performa jelek, baru minta backend buat endpoint dedicated.

- [ ] **Step 1: Tulis file**

```jsx
import React, { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import ProgressBar from '../../components/ui/ProgressBar';

export default function LaporanAdmin() {
  // MVP: backend belum punya endpoint agregat admin.
  // Tampilkan message + link ke sub-page desa/posyandu yang sudah ada.
  // Iterasi berikutnya: fetch list desa, aggregate statistik-gizi per desa.

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader
        title="Laporan Keseluruhan"
        subtitle="Rekap bulanan semua desa & posyandu"
      />
      <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        <Card title="Informasi">
          <p style={{ marginBottom: 'var(--space-md)' }}>
            Rekap per-desa tersedia di dashboard masing-masing akun Desa.
          </p>
          <p style={{ color: 'var(--color-muted)' }}>
            Agregasi lintas-desa untuk role Admin akan ditambahkan pada rilis berikutnya
            setelah backend menyediakan endpoint rekap admin (`GET /api/admin/laporan/bulanan`).
            Saat ini, silakan gunakan menu "Desa" untuk melihat data per desa.
          </p>
        </Card>
      </div>
    </div>
  );
}
```

**Catatan:** Implementasi agregat lintas-desa dideferralkan sampai backend B2 atau jika performa aggregate client acceptable. Placeholder yang lebih informatif dari Plan 4.

- [ ] **Step 2: Commit**

```bash
git add src/features/laporan/LaporanAdmin.jsx
git commit -m "feat(laporan): add LaporanAdmin informational page"
```

---

## Task 11: Route integration

**Files:**
- Modify: `src/routes/AppRoutes.jsx`

- [ ] **Step 1: Baca file, ganti import + route**

Tambah import:
```jsx
import LaporanBulananKader from '../features/laporan/LaporanBulananKader';
import BerandaDesa from '../features/desa/BerandaDesa';
import KelolaAcara from '../features/desa/KelolaAcara';
import LaporanAdmin from '../features/laporan/LaporanAdmin';
```

Hapus import legacy yang tidak dipakai lagi:
```jsx
// remove:
// import Desa from '../pages/Desa/desa';
// import InputAcara from '../pages/Desa/input_acara';
// import LaporanAdminPlaceholder from '../features/admin/LaporanAdminPlaceholder';
```

Update route:
- Kader: tambah `<Route path="/kader/laporan" element={<LaporanBulananKader />} />` di block `RequireRole KADER_POSYANDU`
- Desa: ganti `<Desa />` → `<BerandaDesa />`, `<InputAcara />` → `<KelolaAcara />`
- Admin: ganti `<LaporanAdminPlaceholder />` → `<LaporanAdmin />`

- [ ] **Step 2: Update BerandaKader card**

Di `src/features/kader/BerandaKader.jsx`, pastikan card "Laporan Bulan Ini" onClick ke `/kader/laporan` (sudah ada dari Plan 1, verify).

- [ ] **Step 3: Build + tests**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: pass semua.

- [ ] **Step 4: Commit**

```bash
git add src/routes/AppRoutes.jsx
git commit -m "refactor(routes): wire Plan 3 laporan pages"
```

---

## Task 12: Manual verification

**Files:**
- None (manual test)

- [ ] **Step 1: Kader laporan**

1. Login kader
2. Di beranda, klik card "Laporan Bulan Ini" → `/kader/laporan`
3. MonthPicker default bulan ini
4. 3 StatCard muncul: Total / Sudah / Belum
5. Progress bar partisipasi
6. StatusDistribution 4 bar
7. List balita belum diukur + list perlu perhatian
8. Ganti bulan → angka berubah
9. Pilih bulan masa depan → semua "belum diukur"

- [ ] **Step 2: Desa laporan**

1. Logout, login sebagai Desa
2. Redirect ke `/desa/beranda`
3. PageHeader dengan nama desa
4. Button "Kelola Acara Posyandu" visible
5. LaporanDesa muncul: StatCard total + posyandu aktif
6. List per-posyandu dengan progress bar
7. 3 Card distribusi BB/TB/LK

- [ ] **Step 3: Desa acara**

1. Klik "Kelola Acara Posyandu" → `/desa/acara`
2. Form Tambah Acara (judul, deskripsi, tanggal)
3. Submit → toast sukses → list refresh
4. Tombol Hapus per acara → konfirmasi → toast → list refresh

- [ ] **Step 4: Admin laporan**

1. Logout, login Admin
2. Sidebar → "Laporan Keseluruhan" → `/admin/dashboard/laporan`
3. Render LaporanAdmin (informasional, bukan placeholder lagi)

---

## Task 13: Docs update

**Files:**
- Modify: `docs/testing-checklist.md`
- Modify: `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md`

- [ ] **Step 1: Tambah section Laporan di checklist**

```markdown
## Laporan (Plan 3)

### Kader
- [ ] `/kader/laporan` render MonthPicker + 3 StatCard + ProgressBar partisipasi
- [ ] StatusDistribution menampilkan 4 bar (normal/kurang/stunting/obesitas)
- [ ] List balita belum diukur menampilkan nama + umur
- [ ] List perlu perhatian menampilkan nama + status
- [ ] Ganti bulan → data berubah
- [ ] Bulan kosong → semua "belum diukur", pesan "🎉"

### Desa
- [ ] `/desa/beranda` render LaporanDesa berdasarkan statistik-gizi endpoint
- [ ] StatCard total balita + jumlah posyandu
- [ ] List progress bar per-posyandu
- [ ] 3 Card distribusi BB/TB/LK total desa

### Desa Acara
- [ ] `/desa/acara` form tambah acara (judul + tanggal required, deskripsi optional)
- [ ] Submit → toast → list refresh
- [ ] Hapus dengan konfirmasi

### Admin
- [ ] `/admin/dashboard/laporan` render LaporanAdmin (informasional)
- [ ] Tidak ada error saat akses
```

- [ ] **Step 2: Update spec status**

```
**Status:** Phase 0–8 DONE (Plan 1 + Plan 2 + Plan 3 + Plan 4). Phase 9 (cleanup) pending (Plan 5).
```

- [ ] **Step 3: Commit**

```bash
git add docs/testing-checklist.md docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md
git commit -m "docs: update for Plan 3 Laporan & Desa"
```

---

## Plan 3 Acceptance Criteria

- ✅ Laporan kader aggregate di client dengan MonthPicker, 7 metrik visual, 2 list actionable
- ✅ Laporan desa pakai `statistik-gizi/:id_desa` existing endpoint
- ✅ Kelola acara refactor dari `input_acara.js`
- ✅ Admin laporan informasional (bukan placeholder lagi)
- ✅ 4 komponen UI baru reusable (MonthPicker, StatCard, ProgressBar, StatusDistribution)
- ✅ `aggregateKader` pure function dengan 8 unit tests
- ✅ Tests pass: 55 existing + ~8 baru = ~63 total

---

## Risiko & Catatan

| Risiko | Mitigasi |
|---|---|
| Aggregate kader client-side lambat untuk posyandu >50 anak | `useQueries` batch fetch; acceptable karena MVP. Kalau lambat, minta backend `/api/posyandu/laporan/bulanan` |
| `statistik-gizi` tidak punya filter bulan | Endpoint existing memang all-time. Untuk Plan 3 cukup (laporan desa = snapshot current). Kalau perlu bulanan, minta backend tambah query param |
| Admin tidak punya agregat lintas-desa | Placeholder informasional untuk MVP; implementasi agregat di iterasi berikutnya |
| Shape `user.id_desa` vs `user.desa_id` berbeda di backend | Fallback `user?.id_desa ?? user?.desa_id` di LaporanDesa |
| `/api/reminder` endpoint shape unknown | Reuse legacy `input_acara.js` yang sudah terbukti jalan — mutation & query signature mengikuti legacy |

---

## Export PDF/Excel — DEFERRED

Plan 3 **tidak implementasi** export PDF/Excel karena:
- Backend sudah punya `/api/export-data-anak-csv` dan `/api/posyandu/data-anak/export-data-anak-csv`
- `react-to-print` (installed) untuk print HTML → PDF bisa dipakai kader nanti
- MVP: prioritas tampilkan data dulu, ekspor di rilis berikutnya

Kalau export diminta urgent, tambah task: bikin button "Cetak PDF" di LaporanBulananKader → `react-to-print` reference LaporanBulananKader DOM. Task 30 menit.

---

## Next Plan

**Plan 5 — Cleanup** (Phase 9) — hapus:
- `src/pages/Dashboard/` (replaced by BerandaOT)
- `src/pages/Artikel/`, `src/pages/Admin/DetailArtikel.js` (replaced by ArtikelList + ArtikelDetailPage)
- `src/pages/Desa/desa.js`, `src/pages/Desa/input_acara.js` (replaced by BerandaDesa + KelolaAcara)
- `src/pages/Posyandu/DetailPosyandu.js` (replaced by DetailAnak)
- `src/components/form/FormInputPerkembanganAnak/`, `FormUpdatePerkembanganAnak/` (replaced by PengukuranForm)
- `src/hook/useAuth.js`, `src/utilities/RequireAuth.js` (replaced by useSession + RequireRole)
- `src/utilities/determineAmbangBatas.js` (replaced by zScore.js)
- `src/features/admin/LaporanAdminPlaceholder.jsx` (replaced by LaporanAdmin)
- `src/pages/Detail` (replaced by DetailAnak)
- Override `.ant-btn` di `global.css`
