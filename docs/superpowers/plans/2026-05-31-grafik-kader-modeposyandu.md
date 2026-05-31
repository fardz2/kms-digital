# Grafik WHO di ModePosyandu (Kader) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tampilkan grafik pertumbuhan WHO (`ChartWHO`) langsung dari halaman ModePosyandu kader via modal overlay, tanpa meninggalkan list.

**Architecture:** Komponen baru `ChartModal` membungkus `Modal` shared + `ChartWHO` (dipakai apa adanya). `BalitaCard` dapat tombol "Grafik" yang memanggil callback `onGrafik`. `ModePosyandu` menyimpan state `chartAnak` dan meneruskan data `pengukuranByAnak[id]` yang sudah tersedia (nol fetch baru).

**Tech Stack:** React + TypeScript, antd Modal (via `components/ui/Modal`), chart.js + react-chartjs-2 (via `ChartWHO`), lucide-react icons, Vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-05-31-grafik-kader-modeposyandu-design.md`

---

## File Structure

- Create: `src/features/kader/ChartModal.tsx` — modal wrapper untuk ChartWHO.
- Modify: `src/features/kader/BalitaCard.tsx` — tambah prop `onGrafik` + tombol "Grafik".
- Modify: `src/features/kader/ModePosyandu.tsx` — state `chartAnak`, handler, render `ChartModal`.
- Create: `src/__tests__/features/kader/BalitaCard.test.tsx` — test tombol Grafik.
- Create: `src/__tests__/features/kader/ChartModal.test.tsx` — smoke test render.

---

### Task 1: ChartModal component

**Files:**
- Create: `src/features/kader/ChartModal.tsx`
- Test: `src/__tests__/features/kader/ChartModal.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/features/kader/ChartModal.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ChartModal from '../../../features/kader/ChartModal';

vi.mock('../../../features/anak/ChartWHO', () => ({
  default: ({ anak }: { anak: { nama: string } }) => (
    <div data-testid="chart-who-stub">{anak?.nama}</div>
  ),
}));

const anak = { id: 1, nama: 'Budi', gender: 'LAKI_LAKI', tanggal_lahir: '2024-01-01' };
const pengukuran = [{ id: 1, date: '2024-06-01', berat: 7, tinggi: 65, lingkar_kepala: 42 }];

describe('ChartModal', () => {
  test('renders chart and title when anak is provided', () => {
    render(<ChartModal anak={anak} pengukuran={pengukuran} onClose={() => {}} />);
    expect(screen.getByTestId('chart-who-stub')).toHaveTextContent('Budi');
    expect(screen.getByText('Budi')).toBeInTheDocument();
  });

  test('does not render chart content when anak is null', () => {
    render(<ChartModal anak={null} pengukuran={[]} onClose={() => {}} />);
    expect(screen.queryByTestId('chart-who-stub')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx vitest run src/__tests__/features/kader/ChartModal.test.tsx`
Expected: FAIL — cannot resolve `../../../features/kader/ChartModal` (file not created yet).

- [ ] **Step 3: Write minimal implementation**

Create `src/features/kader/ChartModal.tsx`:

```tsx
import React from 'react';
import Modal from '../../components/ui/Modal';
import ChartWHO from '../anak/ChartWHO';

export default function ChartModal({ anak, pengukuran, onClose }) {
  return (
    <Modal
      title={anak?.nama ?? 'Grafik Pertumbuhan'}
      open={!!anak}
      onCancel={onClose}
      footer={null}
      width={760}
    >
      {anak && <ChartWHO anak={anak} pengukuran={pengukuran ?? []} />}
    </Modal>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx vitest run src/__tests__/features/kader/ChartModal.test.tsx`
Expected: PASS (2 tests).

Note: antd `Modal` uses `destroyOnClose` (set in `components/ui/Modal.tsx`), so `ChartWHO` tab state resets each open. When `anak` is null, `open` is false and antd does not render children — matching the second test.

- [ ] **Step 5: Commit**

```bash
rtk git add src/features/kader/ChartModal.tsx src/__tests__/features/kader/ChartModal.test.tsx
rtk git commit -m "feat(kader): add ChartModal wrapping ChartWHO"
```

---

### Task 2: Tombol "Grafik" di BalitaCard

**Files:**
- Modify: `src/features/kader/BalitaCard.tsx`
- Test: `src/__tests__/features/kader/BalitaCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/features/kader/BalitaCard.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import BalitaCard from '../../../features/kader/BalitaCard';

const anak = { id: 1, nama: 'Budi', gender: 'LAKI_LAKI', tanggal_lahir: '2024-01-01' };

const metaWithData = {
  latest: { id: 1, date: '2024-06-01', berat: 7, tinggi: 65, lingkar_kepala: 42 },
  latestBulanIni: null,
  status: 'NORMAL',
  sudahDiukur: false,
  perluPerhatian: false,
};

const metaNoData = {
  latest: null,
  latestBulanIni: null,
  status: 'UNKNOWN',
  sudahDiukur: false,
  perluPerhatian: false,
};

describe('BalitaCard grafik button', () => {
  test('shows Grafik button when latest measurement exists', () => {
    render(<BalitaCard anak={anak} meta={metaWithData} onGrafik={() => {}} />);
    expect(screen.getByRole('button', { name: /grafik/i })).toBeInTheDocument();
  });

  test('hides Grafik button when there is no measurement', () => {
    render(<BalitaCard anak={anak} meta={metaNoData} onGrafik={() => {}} />);
    expect(screen.queryByRole('button', { name: /grafik/i })).not.toBeInTheDocument();
  });

  test('calls onGrafik with anak when clicked', () => {
    const onGrafik = vi.fn();
    render(<BalitaCard anak={anak} meta={metaWithData} onGrafik={onGrafik} />);
    fireEvent.click(screen.getByRole('button', { name: /grafik/i }));
    expect(onGrafik).toHaveBeenCalledWith(anak);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx vitest run src/__tests__/features/kader/BalitaCard.test.tsx`
Expected: FAIL — no button matching `/grafik/i` (button not added yet).

- [ ] **Step 3: Write minimal implementation**

In `src/features/kader/BalitaCard.tsx`:

3a. Add `LineChart` to the lucide-react import (line 3):

```tsx
import { AlertTriangle, CheckCircle2, Pencil, Eye, LineChart } from 'lucide-react';
```

3b. Add `onGrafik` to the component signature (line 7):

```tsx
export default function BalitaCard({ anak, meta, onUkur, onUlang, onLihat, onGrafik }) {
```

3c. In the action column (the `<div className="shrink-0 flex flex-col gap-[6px]">` block, around lines 71-101), add a Grafik button as the LAST child inside that div, after the existing conditional, gated on `latest`:

```tsx
      <div className="shrink-0 flex flex-col gap-[6px]">
        {sudahDiukur ? (
          <>
            <Button
              variant="default"
              size="sm"
              leadingIcon={<Eye size={16} strokeWidth={1.75} />}
              onClick={() => onLihat?.(anak)}
            >
              Riwayat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<Pencil size={16} strokeWidth={1.75} />}
              onClick={() => onUlang?.(anak, latestBulanIni)}
            >
              Ubah
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="md"
            leadingIcon={<Pencil size={18} strokeWidth={1.75} />}
            onClick={() => onUkur?.(anak, latest)}
          >
            Ukur
          </Button>
        )}
        {latest && (
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<LineChart size={16} strokeWidth={1.75} />}
            onClick={() => onGrafik?.(anak)}
          >
            Grafik
          </Button>
        )}
      </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx vitest run src/__tests__/features/kader/BalitaCard.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
rtk git add src/features/kader/BalitaCard.tsx src/__tests__/features/kader/BalitaCard.test.tsx
rtk git commit -m "feat(kader): add Grafik button to BalitaCard"
```

---

### Task 3: Wire ChartModal into ModePosyandu

**Files:**
- Modify: `src/features/kader/ModePosyandu.tsx`

This task wires UI together; covered by the build + full test run (no new unit test — ModePosyandu has no existing test harness and depends on many queries).

- [ ] **Step 1: Import ChartModal**

In `src/features/kader/ModePosyandu.tsx`, add after the `BalitaCard` import (line 7):

```tsx
import ChartModal from './ChartModal';
```

- [ ] **Step 2: Add chartAnak state**

After the `tambahOpen` state (line 32), add:

```tsx
  const [chartAnak, setChartAnak] = useState(null);
```

- [ ] **Step 3: Add handleGrafik handler**

After `handleLihat` (lines 111-113), add:

```tsx
  const handleGrafik = (anak) => {
    setChartAnak(anak);
  };
```

- [ ] **Step 4: Pass onGrafik to BalitaCard**

In the `filtered.map` render (lines 175-181), add the `onGrafik` prop:

```tsx
              <BalitaCard
                anak={anak}
                meta={meta}
                onUkur={(a) => handleUkur(a, meta.latest)}
                onUlang={handleUlang}
                onLihat={handleLihat}
                onGrafik={handleGrafik}
              />
```

- [ ] **Step 5: Render ChartModal**

After the `FormInputDataAnak` element (lines 210-213), before the closing `</div>`, add:

```tsx
      <ChartModal
        anak={chartAnak}
        pengukuran={chartAnak ? (pengukuranByAnak[chartAnak.id] ?? []) : []}
        onClose={() => setChartAnak(null)}
      />
```

- [ ] **Step 6: Run full test suite**

Run: `rtk vitest run`
Expected: PASS — 214 existing + 5 new = 219 tests, 0 fail.

- [ ] **Step 7: Build**

Run: `rtk npm run build`
Expected: Compiled successfully, no new errors.

- [ ] **Step 8: Commit**

```bash
rtk git add src/features/kader/ModePosyandu.tsx
rtk git commit -m "feat(kader): show growth chart modal from ModePosyandu"
```

---

## Self-Review Notes

- **Spec coverage:** ChartModal (Task 1) ✓, BalitaCard button gated on `meta.latest` (Task 2) ✓, ModePosyandu state + reuse of `pengukuranByAnak` with zero new fetch (Task 3) ✓. ChartWHO unchanged ✓. No new route/query ✓.
- **Type consistency:** `onGrafik(anak)` signature consistent across BalitaCard test, BalitaCard impl, and ModePosyandu `handleGrafik`. `ChartModal` props `{ anak, pengukuran, onClose }` consistent between Task 1 and Task 3.
- **Manual verify:** open ModePosyandu as kader → balita with measurements shows "Grafik" → click opens modal with 4 tabs → close returns to list at same scroll position.
