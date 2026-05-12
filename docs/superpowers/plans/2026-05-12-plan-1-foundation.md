# Plan 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun fondasi arsitektur redesign KMS Digital: folder baru, axios client, design tokens, 8 komponen UI reusable, session management (one-time login), dan dashboard kader baru dengan daftar balita.

**Architecture:** Frontend-only refactor. File lama di `src/pages/` dan `src/components/form/` tetap coexist — tidak diubah. Feature baru hidup di `src/features/`, `src/api/`, `src/queries/`, `src/components/ui/`. Migrasi per phase, tiap phase bisa rilis ke production independen.

**Tech Stack:** React 18 (CRA), axios, TanStack Query v5, Ant Design v4, Bootstrap, Tailwind, React Router v6, moment.

**Spec:** `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md` — Section 5, 6, 7, 10, 11, Phase 0–2.

**Backend dependencies:** NONE. Plan ini bisa dikerjakan tanpa menunggu backend.

---

## File Structure

Berikut file yang akan dibuat/dimodifikasi dalam plan ini. File lama tidak dihapus.

**Folder baru:**
```
src/
├── api/                       NEW
│   ├── client.js
│   ├── auth.api.js
│   └── anak.api.js
├── queries/                   NEW
│   ├── keys.js
│   ├── useAuthQueries.js
│   └── useAnakQueries.js
├── features/                  NEW
│   ├── auth/
│   │   ├── session-storage.js
│   │   ├── useSession.js
│   │   ├── LoginPortal.jsx
│   │   └── LoginForm.jsx
│   ├── anak/
│   │   └── DaftarAnak.jsx
│   └── kader/
│       └── BerandaKader.jsx
├── routes/                    NEW
│   ├── AppRoutes.jsx
│   ├── RequireRole.jsx
│   └── legacyRedirects.js
├── components/ui/             NEW
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── PageHeader.jsx
│   ├── NumberSlider.jsx
│   ├── Modal.jsx
│   ├── DataTable.jsx
│   ├── Toast.jsx
│   └── StatusBadge.jsx
├── components/layout/         NEW
│   └── AppShell.jsx
└── theme/                     NEW
    ├── tokens.css
    └── antd-theme.js
```

**File dimodifikasi:**
- `src/App.js` — integrate QueryClient defaults + import `AppRoutes`, legacy redirects
- `src/index.js` — import `theme/tokens.css`

**File lama yang tetap jalan (tidak disentuh):**
- `src/hook/useAuth.js` (akan di-deprecate di Plan berikutnya setelah semua feature migrated)
- `src/pages/SignIn/*`, `src/pages/Posyandu/*`, `src/components/form/*`
- Semua route lama tetap accessible via redirect

---

## Testing Strategy

Project tidak punya test framework. Setiap task include **manual verification step** berupa:
- `npm start` → buka halaman → verify UI & behavior
- Untuk task pure-function (zScore, monthDiff): buat file `.test.js` skrip node-runnable yang bisa dijalankan `node script.js` tanpa framework

Quality gate:
- `npm run build` harus sukses tanpa warning baru di setiap commit besar
- Manual regression checklist di Task 30 akhir plan

---

## Task 1: Buat folder kosong untuk struktur baru

**Files:**
- Create: `src/api/.gitkeep`
- Create: `src/queries/.gitkeep`
- Create: `src/features/.gitkeep`
- Create: `src/routes/.gitkeep`
- Create: `src/components/ui/.gitkeep`
- Create: `src/theme/.gitkeep`

- [ ] **Step 1: Create placeholder files untuk setiap folder**

Jalankan satu per satu:

```powershell
New-Item -ItemType Directory -Path "src/api" -Force
New-Item -ItemType Directory -Path "src/queries" -Force
New-Item -ItemType Directory -Path "src/features/auth" -Force
New-Item -ItemType Directory -Path "src/features/anak" -Force
New-Item -ItemType Directory -Path "src/features/kader" -Force
New-Item -ItemType Directory -Path "src/routes" -Force
New-Item -ItemType Directory -Path "src/components/ui" -Force
New-Item -ItemType Directory -Path "src/theme" -Force
New-Item -ItemType File -Path "src/api/.gitkeep" -Force
New-Item -ItemType File -Path "src/queries/.gitkeep" -Force
New-Item -ItemType File -Path "src/features/.gitkeep" -Force
New-Item -ItemType File -Path "src/routes/.gitkeep" -Force
New-Item -ItemType File -Path "src/components/ui/.gitkeep" -Force
New-Item -ItemType File -Path "src/theme/.gitkeep" -Force
```

- [ ] **Step 2: Verify folder terbuat**

```powershell
Get-ChildItem -LiteralPath "src" -Directory | Select-Object Name
```

Expected: list termasuk `api`, `queries`, `features`, `routes`, `components`, `theme`.

- [ ] **Step 3: Commit**

```bash
git add src/api src/queries src/features src/routes src/components/ui src/theme
git commit -m "chore: scaffold folders for new architecture"
```

---

## Task 2: Design tokens CSS

**Files:**
- Create: `src/theme/tokens.css`
- Modify: `src/index.js`

- [ ] **Step 1: Tulis `src/theme/tokens.css`**

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
  --color-danger: #EF4444;

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
  --font-weight-normal: 400;
  --font-weight-bold: 700;

  /* Radius */
  --radius-card: 16px;
  --radius-hero: 50px;
  --radius-button: 8px;

  /* Spacing */
  --space-tap: 48px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Shadow */
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-hero: 0 10px 20px rgba(0, 0, 0, 0.19);
}
```

- [ ] **Step 2: Import di `src/index.js`**

Tambahkan import di baris setelah `import './global.css';` (atau `import './index.css';` jika ada):

```js
import './theme/tokens.css';
```

- [ ] **Step 3: Verify `npm start` jalan**

```bash
npm start
```

Expected: app jalan di http://localhost:3000, tidak ada error console.

- [ ] **Step 4: Commit**

```bash
git add src/theme/tokens.css src/index.js
git commit -m "feat(theme): add CSS design tokens"
```

---

## Task 3: Session storage helper

**Files:**
- Create: `src/features/auth/session-storage.js`

- [ ] **Step 1: Tulis `src/features/auth/session-storage.js`**

```js
const STORAGE_KEY = 'kms_session_v1';
const LEGACY_KEY = 'login_data';

export function readSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token?.value && parsed?.user?.role) return parsed;
      return null;
    }
    // Migration dari key lama
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.token?.value && parsed?.user?.role) {
        localStorage.setItem(STORAGE_KEY, legacy);
        localStorage.removeItem(LEGACY_KEY);
        return parsed;
      }
    }
    return null;
  } catch (e) {
    console.error('readSession parse error:', e);
    return null;
  }
}

export function writeSession(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('writeSession error:', e);
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch (e) {
    console.error('clearSession error:', e);
  }
}
```

- [ ] **Step 2: Verify**

Buka DevTools console di app existing yang sudah login, jalankan:

```js
localStorage.getItem('login_data')
```

Catat hasilnya. Setelah Task 8 selesai, verifikasi migrasi berhasil.

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/session-storage.js
git commit -m "feat(auth): add versioned session storage helper with legacy migration"
```

---

## Task 4: axios client + interceptors

**Files:**
- Create: `src/api/client.js`

- [ ] **Step 1: Tulis `src/api/client.js`**

```js
import axios from 'axios';
import { readSession, clearSession } from '../features/auth/session-storage';

export const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(
  (cfg) => {
    const token = readSession()?.token?.value;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/masuk')) {
        window.location.href = '/masuk?expired=1';
      }
    }
    const payload = err.response?.data ?? { message: err.message || 'Terjadi kesalahan' };
    return Promise.reject(payload);
  }
);
```

- [ ] **Step 2: Verify tidak ada syntax error**

```bash
npm run build
```

Expected: build sukses.

- [ ] **Step 3: Commit**

```bash
git add src/api/client.js
git commit -m "feat(api): add axios client with auth + 401 interceptors"
```

---

## Task 5: Query key factory

**Files:**
- Create: `src/queries/keys.js`

- [ ] **Step 1: Tulis `src/queries/keys.js`**

```js
export const qk = {
  auth: {
    all: ['auth'],
    session: ['auth', 'session'],
  },
  anak: {
    all: ['anak'],
    list: (role) => ['anak', 'list', role],
    detail: (id, role) => ['anak', 'detail', id, role],
  },
  pengukuran: {
    all: ['pengukuran'],
    byAnak: (anakId, role) => ['pengukuran', 'by-anak', anakId, role],
  },
  laporan: {
    all: ['laporan'],
    kader: (posyanduId, bulan) => ['laporan', 'kader', posyanduId, bulan],
    desa: (desaId, bulan) => ['laporan', 'desa', desaId, bulan],
    admin: (bulan) => ['laporan', 'admin', bulan],
  },
  artikel: {
    all: ['artikel'],
    list: ['artikel', 'list'],
    detail: (id) => ['artikel', 'detail', id],
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/queries/keys.js
git commit -m "feat(queries): add query key factory"
```

---

## Task 6: API module - auth

**Files:**
- Create: `src/api/auth.api.js`

- [ ] **Step 1: Tulis `src/api/auth.api.js`**

```js
import { api } from './client';

export const authApi = {
  login: (credentials) =>
    api.post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    }),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/api/auth.api.js
git commit -m "feat(api): add auth API module"
```

---

## Task 7: useSession hook

**Files:**
- Create: `src/features/auth/useSession.js`

- [ ] **Step 1: Tulis `src/features/auth/useSession.js`**

```js
import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { readSession, writeSession, clearSession } from './session-storage';

export function useSession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(() => readSession());

  const login = useCallback((data) => {
    writeSession(data);
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
    setSession(null);
  }, [queryClient]);

  return {
    session,
    login,
    logout,
    isAuthenticated: !!session?.token?.value,
    role: session?.user?.role ?? null,
    user: session?.user ?? null,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/useSession.js
git commit -m "feat(auth): add useSession hook"
```

---

## Task 8: Button component

**Files:**
- Create: `src/components/ui/Button.jsx`

- [ ] **Step 1: Tulis `src/components/ui/Button.jsx`**

```jsx
import React from 'react';

const VARIANTS = {
  primary: {
    background: 'var(--color-primary)',
    color: '#FFFFFF',
    border: 'none',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    background: 'var(--color-danger)',
    color: '#FFFFFF',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: 'none',
  },
};

const SIZES = {
  sm: { padding: '8px 16px', fontSize: 'var(--text-base)', minHeight: '36px' },
  md: { padding: '12px 24px', fontSize: 'var(--text-base)', minHeight: 'var(--space-tap)' },
  lg: { padding: '16px 32px', fontSize: 'var(--text-lg)', minHeight: '56px' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  type = 'button',
  onClick,
  style: styleProp,
  children,
  ...rest
}) {
  const style = {
    ...VARIANTS[variant],
    ...SIZES[size],
    borderRadius: 'var(--radius-button)',
    fontWeight: 'var(--font-weight-bold)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    transition: 'opacity 0.15s',
    ...styleProp,
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={style} {...rest}>
      {icon && !loading && <span aria-hidden="true">{icon}</span>}
      {loading ? 'Memuat...' : children}
    </button>
  );
}
```

- [ ] **Step 2: Verify `npm run build` sukses**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.jsx
git commit -m "feat(ui): add Button component with 4 variants"
```

---

## Task 9: Card component

**Files:**
- Create: `src/components/ui/Card.jsx`

- [ ] **Step 1: Tulis `src/components/ui/Card.jsx`**

```jsx
import React from 'react';

export default function Card({ title, footer, onClick, style: styleProp, children }) {
  const style = {
    background: 'var(--color-bg)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: 'var(--space-lg)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.15s',
    ...styleProp,
  };

  return (
    <div
      onClick={onClick}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
    >
      {title && (
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-md)' }}>
          {title}
        </div>
      )}
      <div>{children}</div>
      {footer && <div style={{ marginTop: 'var(--space-md)' }}>{footer}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Card.jsx
git commit -m "feat(ui): add Card component"
```

---

## Task 10: PageHeader component

**Files:**
- Create: `src/components/ui/PageHeader.jsx`

- [ ] **Step 1: Tulis `src/components/ui/PageHeader.jsx`**

```jsx
import React from 'react';
import bgDashboard from '../../assets/img/bg-dashboard.svg';

export default function PageHeader({ title, subtitle, action, children }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 200,
        padding: 'var(--space-xl) var(--space-lg)',
        borderBottomLeftRadius: 'var(--radius-hero)',
        borderBottomRightRadius: 'var(--radius-hero)',
        boxShadow: 'var(--shadow-hero)',
        backgroundImage: `url(${bgDashboard})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {title && <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', margin: 0 }}>{title}</h1>}
      {subtitle && <p style={{ fontSize: 'var(--text-lg)', margin: 'var(--space-sm) 0 0' }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 'var(--space-lg)' }}>{action}</div>}
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/PageHeader.jsx
git commit -m "feat(ui): add PageHeader component"
```

---

## Task 11: StatusBadge component

**Files:**
- Create: `src/components/ui/StatusBadge.jsx`

- [ ] **Step 1: Tulis `src/components/ui/StatusBadge.jsx`**

```jsx
import React from 'react';

const STATUS_CONFIG = {
  normal: { label: 'Normal', bg: 'var(--color-success)', icon: '✅' },
  kurang: { label: 'Kurang', bg: 'var(--color-warning)', icon: '⚠️' },
  stunting: { label: 'Stunting', bg: 'var(--color-danger)', icon: '🔴' },
  obesitas: { label: 'Obesitas', bg: 'var(--color-danger)', icon: '🔴' },
  unknown: { label: '-', bg: 'var(--color-muted)', icon: '❓' },
};

export default function StatusBadge({ status }) {
  const key = String(status || 'unknown').toLowerCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.unknown;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
        background: config.bg,
        color: '#FFFFFF',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-button)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-bold)',
      }}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/StatusBadge.jsx
git commit -m "feat(ui): add StatusBadge component"
```

---

## Task 12: Toast helper

**Files:**
- Create: `src/components/ui/Toast.jsx`

- [ ] **Step 1: Tulis `src/components/ui/Toast.jsx`** (wrap antd message untuk konsistensi)

```jsx
import { message } from 'antd';

message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
});

export function useToast() {
  const [api, contextHolder] = message.useMessage();

  return {
    contextHolder,
    success: (content) => api.open({ type: 'success', content, style: { fontSize: 'var(--text-lg)' } }),
    error: (content) => api.open({ type: 'error', content, style: { fontSize: 'var(--text-lg)' } }),
    info: (content) => api.open({ type: 'info', content, style: { fontSize: 'var(--text-lg)' } }),
    warning: (content) => api.open({ type: 'warning', content, style: { fontSize: 'var(--text-lg)' } }),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Toast.jsx
git commit -m "feat(ui): add useToast hook wrapping antd message"
```

---

## Task 13: Modal wrapper

**Files:**
- Create: `src/components/ui/Modal.jsx`

- [ ] **Step 1: Tulis `src/components/ui/Modal.jsx`**

```jsx
import React from 'react';
import { Modal as AntModal } from 'antd';

export default function Modal({ title, open, onCancel, footer, width, children }) {
  return (
    <AntModal
      title={<span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>{title}</span>}
      open={open}
      onCancel={onCancel}
      footer={footer}
      width={width ?? 560}
      destroyOnClose
      maskClosable={false}
      bodyStyle={{ padding: 'var(--space-lg)', fontSize: 'var(--text-base)' }}
    >
      {children}
    </AntModal>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Modal.jsx
git commit -m "feat(ui): add Modal wrapper over antd Modal"
```

---

## Task 14: DataTable wrapper

**Files:**
- Create: `src/components/ui/DataTable.jsx`

- [ ] **Step 1: Tulis `src/components/ui/DataTable.jsx`** (wrap komponen Table existing)

```jsx
import React from 'react';
import Table from '../layout/Table';

export default function DataTable({ columns, data, loading, emptyText = 'Tidak ada data' }) {
  if (!loading && (!data || data.length === 0)) {
    return (
      <div
        style={{
          padding: 'var(--space-xl)',
          textAlign: 'center',
          color: 'var(--color-muted)',
          fontSize: 'var(--text-base)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        {emptyText}
      </div>
    );
  }

  return <Table columns={columns} data={data || []} loading={loading} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/DataTable.jsx
git commit -m "feat(ui): add DataTable wrapper with empty state"
```

---

## Task 15: NumberSlider component (minimal — full implementation di Plan 2)

**Files:**
- Create: `src/components/ui/NumberSlider.jsx`

- [ ] **Step 1: Tulis `src/components/ui/NumberSlider.jsx`** (minimal scaffolding, final version di Plan 2 Task pengukuran)

```jsx
import React from 'react';

export default function NumberSlider({
  label,
  min = 0,
  max = 100,
  step = 0.1,
  value = 0,
  onChange,
  unit = '',
}) {
  const handleChange = (e) => {
    const next = parseFloat(e.target.value);
    if (!Number.isNaN(next)) onChange?.(Number(next.toFixed(1)));
  };

  const decrement = () => {
    const next = Math.max(min, value - step);
    onChange?.(Number(next.toFixed(1)));
  };

  const increment = () => {
    const next = Math.min(max, value + step);
    onChange?.(Number(next.toFixed(1)));
  };

  return (
    <div style={{ padding: 'var(--space-md) 0' }}>
      {label && (
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-sm)' }}>
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: 'var(--text-display)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center',
          marginBottom: 'var(--space-md)',
        }}
      >
        {value.toFixed(1)} {unit}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        style={{ width: '100%', height: 12 }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--text-base)',
          color: 'var(--color-muted)',
          marginTop: 'var(--space-xs)',
        }}
      >
        <span>{min}</span>
        <span>
          {max} {unit}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 'var(--space-md)' }}>
        <button
          type="button"
          onClick={decrement}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: '2px solid var(--color-primary)',
            background: 'var(--color-bg)',
            color: 'var(--color-primary)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
            cursor: 'pointer',
          }}
        >
          −
        </button>
        <button
          type="button"
          onClick={increment}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/NumberSlider.jsx
git commit -m "feat(ui): add NumberSlider component (minimal)"
```

---

## Task 16: Anak API module

**Files:**
- Create: `src/api/anak.api.js`

- [ ] **Step 1: Tulis `src/api/anak.api.js`**

```js
import { api } from './client';

function scopeForRole(role) {
  return role === 'ORANG_TUA' ? 'orang-tua' : 'posyandu';
}

export const anakApi = {
  list: (role) => api.get(`/api/${scopeForRole(role)}/data-anak`),
  detail: (id, role) => api.get(`/api/${scopeForRole(role)}/data-anak/${id}`),
  remove: (id) => api.delete(`/api/posyandu/data-anak/${id}`),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/api/anak.api.js
git commit -m "feat(api): add anak API module"
```

---

## Task 17: Anak query hooks

**Files:**
- Create: `src/queries/useAnakQueries.js`

- [ ] **Step 1: Tulis `src/queries/useAnakQueries.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { anakApi } from '../api/anak.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useAnakList() {
  const { role, isAuthenticated } = useSession();

  return useQuery({
    queryKey: qk.anak.list(role),
    queryFn: async () => {
      const res = await anakApi.list(role);
      return res.data ?? [];
    },
    enabled: isAuthenticated && !!role,
    staleTime: 5 * 60 * 1000,
    select: (data) =>
      [...data].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')),
  });
}

export function useAnakDetail(id) {
  const { role, isAuthenticated } = useSession();

  return useQuery({
    queryKey: qk.anak.detail(id, role),
    queryFn: async () => {
      const res = await anakApi.detail(id, role);
      return res.data;
    },
    enabled: isAuthenticated && !!role && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteAnak() {
  const qc = useQueryClient();
  const { role } = useSession();

  return useMutation({
    mutationFn: (id) => anakApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.anak.list(role) });
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/queries/useAnakQueries.js
git commit -m "feat(queries): add anak query hooks"
```

---

## Task 18: Auth mutation hook

**Files:**
- Create: `src/queries/useAuthQueries.js`

- [ ] **Step 1: Tulis `src/queries/useAuthQueries.js`**

```js
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useSession } from '../features/auth/useSession';

export function useLogin() {
  const { login } = useSession();

  return useMutation({
    mutationFn: async (credentials) => {
      const res = await authApi.login(credentials);
      return res.data;
    },
    onSuccess: (data) => {
      login(data);
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/queries/useAuthQueries.js
git commit -m "feat(queries): add login mutation hook"
```

---

## Task 19: RequireRole component

**Files:**
- Create: `src/routes/RequireRole.jsx`

- [ ] **Step 1: Tulis `src/routes/RequireRole.jsx`**

```jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../features/auth/useSession';

const ROLE_HOME = {
  ORANG_TUA: '/orangtua/balita',
  KADER_POSYANDU: '/kader/beranda',
  TENAGA_KESEHATAN: '/tenkes/forum',
  DESA: '/desa/beranda',
  ADMIN: '/admin/dashboard/desa',
};

export default function RequireRole({ allow, children }) {
  const { isAuthenticated, role } = useSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/masuk" state={{ from: location }} replace />;
  }

  if (allow && allow.length > 0 && !allow.includes(role)) {
    const home = ROLE_HOME[role] ?? '/';
    return <Navigate to={home} replace />;
  }

  return children ?? <Outlet />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/RequireRole.jsx
git commit -m "feat(routes): add RequireRole guard"
```

---

## Task 20: LoginForm component

**Files:**
- Create: `src/features/auth/LoginForm.jsx`

- [ ] **Step 1: Tulis `src/features/auth/LoginForm.jsx`**

```jsx
import React from 'react';
import { Form, Input } from 'antd';
import { MailOutlined, KeyOutlined } from '@ant-design/icons';
import Button from '../../components/ui/Button';

const ROLE_LABELS = {
  ORANG_TUA: 'Orang Tua',
  KADER_POSYANDU: 'Kader Posyandu',
  TENAGA_KESEHATAN: 'Tenaga Kesehatan',
  DESA: 'Pemerintah Desa',
  ADMIN: 'Admin',
};

export default function LoginForm({ role, onSubmit, loading, errorText }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit?.({ email: values.email, password: values.password, role });
  };

  return (
    <div style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-sm)' }}>
        Masuk sebagai {ROLE_LABELS[role] ?? 'Pengguna'}
      </h2>
      {errorText && (
        <div
          role="alert"
          style={{
            background: 'var(--color-danger)',
            color: '#FFFFFF',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-button)',
            marginBottom: 'var(--space-md)',
            fontSize: 'var(--text-base)',
          }}
        >
          {errorText}
        </div>
      )}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email masih kosong' },
            { type: 'email', message: 'Format email tidak valid' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="email@contoh.com"
            style={{ height: 48, fontSize: 'var(--text-base)' }}
          />
        </Form.Item>
        <Form.Item
          label="Kata Sandi"
          name="password"
          rules={[{ required: true, message: 'Kata sandi masih kosong' }]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder="Kata sandi"
            style={{ height: 48, fontSize: 'var(--text-base)' }}
          />
        </Form.Item>
        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
          MASUK
        </Button>
      </Form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/LoginForm.jsx
git commit -m "feat(auth): add LoginForm component"
```

---

## Task 21: LoginPortal page

**Files:**
- Create: `src/features/auth/LoginPortal.jsx`

- [ ] **Step 1: Tulis `src/features/auth/LoginPortal.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import LoginForm from './LoginForm';
import { useLogin } from '../../queries/useAuthQueries';
import { useSession } from './useSession';

const ROLES = [
  { key: 'ORANG_TUA', label: 'Orang Tua', icon: '👨‍👩‍👧' },
  { key: 'KADER_POSYANDU', label: 'Kader Posyandu', icon: '🏥' },
  { key: 'TENAGA_KESEHATAN', label: 'Tenaga Kesehatan', icon: '👩‍⚕️' },
  { key: 'DESA', label: 'Pemerintah Desa', icon: '🏛️' },
  { key: 'ADMIN', label: 'Admin', icon: '⚙️' },
];

const ROLE_HOME = {
  ORANG_TUA: '/orangtua/balita',
  KADER_POSYANDU: '/kader/beranda',
  TENAGA_KESEHATAN: '/tenkes/forum',
  DESA: '/desa/beranda',
  ADMIN: '/admin/dashboard/desa',
};

export default function LoginPortal() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  const expired = searchParams.get('expired') === '1';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [errorText, setErrorText] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated, role: currentRole } = useSession();
  const loginMutation = useLogin();

  useEffect(() => {
    if (isAuthenticated && currentRole) {
      navigate(ROLE_HOME[currentRole] ?? '/', { replace: true });
    }
  }, [isAuthenticated, currentRole, navigate]);

  const handleLogin = ({ email, password, role }) => {
    setErrorText(null);
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          const userRole = data?.user?.role;
          const userStatus = data?.user?.status;

          if (userStatus === 0) {
            setErrorText('Akun Anda belum disetujui. Silakan hubungi admin/kader.');
            return;
          }

          if (role !== 'ORANG_TUA' && userRole !== role) {
            setErrorText(`Akun ini bukan ${role.replace('_', ' ').toLowerCase()}.`);
            return;
          }

          toast.success('Berhasil masuk');
          navigate(ROLE_HOME[userRole] ?? '/', { replace: true });
        },
        onError: (err) => {
          setErrorText(err?.message ?? 'Email atau kata sandi salah');
        },
      }
    );
  };

  return (
    <>
      {toast.contextHolder}
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-lg)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          <h1
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-bold)',
              textAlign: 'center',
              marginBottom: 'var(--space-lg)',
            }}
          >
            KMS Digital Lebakwangi
          </h1>

          {expired && (
            <div
              role="alert"
              style={{
                background: 'var(--color-warning)',
                color: 'var(--color-text)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-button)',
                marginBottom: 'var(--space-md)',
                textAlign: 'center',
              }}
            >
              Sesi Anda berakhir, silakan masuk kembali.
            </div>
          )}

          {!selectedRole ? (
            <Card>
              <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Masuk sebagai:</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {ROLES.map((r) => (
                  <Button
                    key={r.key}
                    variant="secondary"
                    size="lg"
                    onClick={() => setSelectedRole(r.key)}
                    style={{ justifyContent: 'flex-start', width: '100%' }}
                  >
                    <span style={{ marginRight: 'var(--space-sm)' }}>{r.icon}</span>
                    {r.label}
                  </Button>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} style={{ marginBottom: 'var(--space-md)' }}>
                ← Kembali
              </Button>
              <LoginForm
                role={selectedRole}
                onSubmit={handleLogin}
                loading={loginMutation.isPending}
                errorText={errorText}
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/auth/LoginPortal.jsx
git commit -m "feat(auth): add LoginPortal page with role picker"
```

---

## Task 22: Legacy redirect helper

**Files:**
- Create: `src/routes/legacyRedirects.js`

- [ ] **Step 1: Tulis `src/routes/legacyRedirects.js`**

```js
export const LEGACY_REDIRECTS = [
  { from: '/sign-in', to: '/masuk' },
  { from: '/sign-in/admin', to: '/masuk?role=ADMIN' },
  { from: '/sign-in/desa', to: '/masuk?role=DESA' },
  { from: '/sign-in/tenaga-kesehatan', to: '/masuk?role=TENAGA_KESEHATAN' },
  { from: '/sign-in/kader-posyandu', to: '/masuk?role=KADER_POSYANDU' },
  { from: '/dashboard', to: '/orangtua/balita' },
  { from: '/tanya-jawab', to: '/orangtua/forum' },
  { from: '/my-forum', to: '/orangtua/forum/saya' },
  { from: '/kader-posyandu/dashboard', to: '/kader/beranda' },
  { from: '/desa/dashboard', to: '/desa/beranda' },
  { from: '/desa/reminder', to: '/desa/acara' },
  { from: '/tenaga-kesehatan/dashboard', to: '/tenkes/forum' },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/legacyRedirects.js
git commit -m "feat(routes): add legacy redirect map"
```

---

## Task 23: BerandaKader page

**Files:**
- Create: `src/features/kader/BerandaKader.jsx`

- [ ] **Step 1: Tulis `src/features/kader/BerandaKader.jsx`**

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useSession } from '../auth/useSession';
import { useAnakList } from '../../queries/useAnakQueries';

export default function BerandaKader() {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const { data: anakList, isLoading } = useAnakList();

  const total = anakList?.length ?? 0;

  const handleLogout = () => {
    if (window.confirm('Keluar dari akun?')) {
      logout();
      navigate('/masuk', { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader
        title={`Halo, ${user?.name ?? 'Kader'}`}
        subtitle={user?.posyandu_name ? `Posyandu ${user.posyandu_name}` : undefined}
        action={
          <Button variant="ghost" size="sm" onClick={handleLogout} style={{ color: '#FFFFFF' }}>
            Keluar
          </Button>
        }
      />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}
        >
          <Card onClick={() => navigate('/kader/balita')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>📋</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>Daftar Balita</div>
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
              {isLoading ? 'Memuat...' : `${total} balita`}
            </div>
          </Card>

          <Card onClick={() => navigate('/kader/laporan')}>
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-sm)' }}>📊</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>Laporan Bulan Ini</div>
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>Lihat rekap</div>
          </Card>
        </div>

        <Button variant="primary" size="lg" onClick={() => navigate('/kader/balita')} style={{ width: '100%' }}>
          + Lihat Semua Balita
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/kader/BerandaKader.jsx
git commit -m "feat(kader): add beranda page with summary cards"
```

---

## Task 24: DaftarAnak page (list card)

**Files:**
- Create: `src/features/anak/DaftarAnak.jsx`

- [ ] **Step 1: Tulis `src/features/anak/DaftarAnak.jsx`**

```jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAnakList } from '../../queries/useAnakQueries';

export default function DaftarAnak() {
  const navigate = useNavigate();
  const { data: anakList, isLoading } = useAnakList();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!anakList) return [];
    const q = query.trim().toLowerCase();
    if (!q) return anakList;
    return anakList.filter(
      (a) =>
        (a.nama ?? '').toLowerCase().includes(q) ||
        (a.nama_ortu ?? '').toLowerCase().includes(q)
    );
  }, [anakList, query]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader title="Daftar Balita" subtitle={`${filtered.length} balita`} />

      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-md)' }}>
          ← Kembali
        </Button>

        <input
          type="search"
          placeholder="🔍 Cari nama balita atau orang tua..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            fontSize: 'var(--text-base)',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--color-border)',
            marginBottom: 'var(--space-md)',
          }}
        />

        {isLoading && (
          <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>Memuat...</div>
        )}

        {!isLoading && filtered.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
              {query ? 'Tidak ada balita yang cocok' : 'Belum ada data balita'}
            </div>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {filtered.map((anak) => {
            const umurBulan = anak.tanggal_lahir
              ? moment().diff(moment(anak.tanggal_lahir), 'month')
              : null;
            return (
              <Card
                key={anak.id}
                onClick={() => navigate(`/kader/balita/${anak.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                      {anak.nama}
                    </div>
                    <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
                      {umurBulan != null ? `${umurBulan} bulan` : '-'} · {anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                    </div>
                    {anak.nama_ortu && (
                      <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-muted)' }}>
                        Ortu: {anak.nama_ortu}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 'var(--text-xl)', color: 'var(--color-muted)' }}>›</div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/anak/DaftarAnak.jsx
git commit -m "feat(anak): add DaftarAnak list page"
```

---

## Task 25: AppRoutes — integrasi route baru + legacy redirect

**Files:**
- Create: `src/routes/AppRoutes.jsx`

- [ ] **Step 1: Tulis `src/routes/AppRoutes.jsx`**

```jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPortal from '../features/auth/LoginPortal';
import RequireRole from './RequireRole';
import BerandaKader from '../features/kader/BerandaKader';
import DaftarAnak from '../features/anak/DaftarAnak';
import { LEGACY_REDIRECTS } from './legacyRedirects';

// Legacy pages (masih dipakai sampai migrasi selesai)
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import Desa from '../pages/Desa/desa';
import Detail from '../pages/Detail';
import DetailForum from '../pages/DetailForum';
import SignUp from '../pages/SignUp';
import Post from '../pages/Post';
import MyPost from '../pages/MyPost';
import NotFound from '../pages/NotFound';
import Artikel from '../pages/Artikel';
import PosyanduDashboard from '../pages/Posyandu';
import DetailPosyandu from '../pages/Posyandu/DetailPosyandu';
import DashboardLayout from '../components/layout/Dashboard/DashboardLayout';
import DesaPage from '../pages/Admin/Desa/DesaPage';
import InputPosyandu from '../pages/AdminDashboard/InputPosyandu';
import RegisterKaderPosyandu from '../pages/AdminDashboard/RegisterKaderPosyandu';
import RegisterTenkes from '../pages/AdminDashboard/RegisterTenagaKesehatan';
import InputAcara from '../pages/Desa/input_acara';
import ArtikelAdmin from '../pages/AdminDashboard/ArtikelAdmin';
import DetailArtikel from '../pages/Admin/DetailArtikel';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/masuk" element={<LoginPortal />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/artikel" element={<Artikel />} />
      <Route path="/artikel/:id" element={<DetailArtikel />} />

      {/* Legacy redirects */}
      {LEGACY_REDIRECTS.map(({ from, to }) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}

      {/* Role: Kader Posyandu (NEW) */}
      <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
        <Route path="/kader/beranda" element={<BerandaKader />} />
        <Route path="/kader/balita" element={<DaftarAnak />} />
        <Route path="/kader/balita/:id" element={<DetailPosyandu />} />
      </Route>

      {/* Role: Orang Tua (legacy, unchanged) */}
      <Route element={<RequireRole allow={['ORANG_TUA']} />}>
        <Route path="/orangtua/balita" element={<Dashboard />} />
        <Route path="/orangtua/forum" element={<Post />} />
        <Route path="/orangtua/forum/saya" element={<MyPost />} />
        <Route path="/orangtua/forum/:id" element={<DetailForum />} />
        <Route path="/orangtua/balita/:id" element={<Detail />} />
      </Route>

      {/* Role: Desa (legacy) */}
      <Route element={<RequireRole allow={['DESA']} />}>
        <Route path="/desa/beranda" element={<Desa />} />
        <Route path="/desa/acara" element={<InputAcara />} />
      </Route>

      {/* Role: Admin (legacy) */}
      <Route element={<RequireRole allow={['ADMIN']} />}>
        <Route path="/admin/dashboard" element={<DashboardLayout />}>
          <Route path="desa" element={<DesaPage />} />
          <Route path="posyandu" element={<InputPosyandu />} />
          <Route path="kader-posyandu" element={<RegisterKaderPosyandu />} />
          <Route path="tenaga-kesehatan" element={<RegisterTenkes />} />
          <Route path="artikel" element={<ArtikelAdmin />} />
        </Route>
      </Route>

      {/* Role: Tenaga Kesehatan (legacy) */}
      <Route element={<RequireRole allow={['TENAGA_KESEHATAN']} />}>
        <Route path="/tenkes/forum" element={<Post />} />
        <Route path="/tenkes/balita/:id" element={<DetailForum />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/AppRoutes.jsx
git commit -m "feat(routes): add AppRoutes with new routes and legacy redirects"
```

---

## Task 26: Integrasi di App.js

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Baca file lama untuk referensi**

Sudah dibaca sebelumnya (`src/App.js` baris 1-160). Ganti seluruh isi dengan:

```jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: sukses. Warning tentang unused import dari file lama bisa diabaikan.

- [ ] **Step 3: Verify `npm start` jalan**

```bash
npm start
```

Buka:
- http://localhost:3000/ → landing page muncul
- http://localhost:3000/masuk → LoginPortal muncul dengan 5 role
- http://localhost:3000/sign-in → redirect ke `/masuk`
- http://localhost:3000/sign-in/admin → redirect ke `/masuk?role=ADMIN`
- http://localhost:3000/kader-posyandu/dashboard → redirect ke `/kader/beranda` (lalu bounce ke `/masuk` karena belum login)

- [ ] **Step 4: Commit**

```bash
git add src/App.js
git commit -m "refactor(app): integrate AppRoutes and QueryClient defaults"
```

---

## Task 27: Test manual — Login flow

**Files:**
- None (manual test)

- [ ] **Step 1: Login sebagai Kader Posyandu**

1. `npm start`
2. Buka http://localhost:3000/masuk
3. Klik "Kader Posyandu"
4. Isi email + password kader asli (dari database) → submit
5. Expected: toast "Berhasil masuk" → redirect ke `/kader/beranda`
6. Di `/kader/beranda`, lihat greeting "Halo, <nama>" + 2 card

- [ ] **Step 2: Navigate ke Daftar Balita**

1. Klik card "Daftar Balita" atau tombol "+ Lihat Semua Balita"
2. Expected: `/kader/balita` muncul, list card balita ter-render

- [ ] **Step 3: Klik balita → detail**

1. Klik salah satu card balita
2. Expected: `/kader/balita/:id` muncul dengan detail (pakai komponen lama `DetailPosyandu`)

- [ ] **Step 4: Session persist**

1. Tutup tab, buka lagi http://localhost:3000/kader/beranda
2. Expected: masih login, langsung lihat beranda

- [ ] **Step 5: Logout**

1. Klik tombol "Keluar" di header beranda kader
2. Konfirmasi "Keluar dari akun?" → OK
3. Expected: redirect ke `/masuk`
4. DevTools → Application → Local Storage: `kms_session_v1` terhapus

- [ ] **Step 6: 401 expire flow (simulasi)**

1. Login lagi
2. DevTools → Application → Local Storage: edit value `kms_session_v1` → ganti `token.value` jadi string sembarang
3. Navigate ke beranda, trigger fetch (misal buka `/kader/balita`)
4. Expected: redirect ke `/masuk?expired=1` dengan banner "Sesi Anda berakhir"

- [ ] **Step 7: Legacy route masih jalan**

1. Logout
2. Buka http://localhost:3000/sign-in/kader-posyandu
3. Expected: redirect ke `/masuk?role=KADER_POSYANDU` → LoginPortal langsung buka form kader

---

## Task 28: Test migrasi session lama → baru

**Files:**
- None (manual test)

- [ ] **Step 1: Simulasi user lama yang punya `login_data`**

1. Logout
2. DevTools → Application → Local Storage:
   - Tambah key `login_data` dengan value dari session login asli sebelumnya (contoh dari production atau backup)
3. Buka http://localhost:3000/kader/beranda
4. Expected:
   - `login_data` terhapus
   - `kms_session_v1` terisi dengan data yang sama
   - User langsung masuk ke beranda (tidak redirect ke `/masuk`)

- [ ] **Step 2: Commit (tidak ada code change, hanya verify)**

Skip commit kalau tidak ada perubahan file.

---

## Task 29: Test legacy Orang Tua + Admin masih jalan

**Files:**
- None (manual test)

- [ ] **Step 1: Login sebagai Orang Tua**

1. `/masuk` → Orang Tua → login
2. Expected: redirect ke `/orangtua/balita` → halaman lama `Dashboard.js` muncul
3. Buka `/orangtua/forum`, `/orangtua/forum/saya` → halaman lama muncul

- [ ] **Step 2: Login sebagai Admin**

1. `/masuk` → Admin → login
2. Expected: redirect ke `/admin/dashboard/desa`
3. Sidebar admin existing jalan normal

- [ ] **Step 3: Login sebagai Desa, Tenkes**

1. Test serupa. Masing-masing landing ke halaman lama.

Kalau ada yang broken, catat di issue untuk fix di Plan berikutnya. Untuk Plan 1, hanya kader + login portal yang prioritas.

---

## Task 30: Final verification + docs update

**Files:**
- Create: `docs/testing-checklist.md`
- Modify: `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md` (update status Phase 0-2 ke DONE)

- [ ] **Step 1: Buat manual regression checklist**

Tulis `docs/testing-checklist.md`:

```markdown
# KMS Digital — Manual Regression Checklist

Dijalankan sebelum merge tiap PR besar atau rilis ke production.

## Login & Session
- [ ] Login semua 5 role via `/masuk` portal sukses
- [ ] Legacy `/sign-in/*` redirect ke `/masuk` dengan role terisi
- [ ] Session persist setelah tutup tab
- [ ] Logout clear `kms_session_v1` dan redirect ke `/masuk`
- [ ] 401 expired redirect ke `/masuk?expired=1` dengan banner
- [ ] Migrasi `login_data` → `kms_session_v1` otomatis

## Kader Posyandu
- [ ] `/kader/beranda` render greeting + 2 card
- [ ] `/kader/balita` render list card, search jalan
- [ ] Klik balita → `/kader/balita/:id` render detail existing
- [ ] Tombol keluar di beranda berfungsi

## Orang Tua (legacy)
- [ ] `/orangtua/balita` render dashboard lama
- [ ] `/orangtua/forum`, `/orangtua/forum/saya`, `/orangtua/forum/:id`, `/orangtua/balita/:id` jalan

## Admin (legacy)
- [ ] `/admin/dashboard/desa`, posyandu, kader-posyandu, tenaga-kesehatan, artikel jalan

## Desa & Tenkes (legacy)
- [ ] `/desa/beranda`, `/desa/acara` jalan
- [ ] `/tenkes/forum`, `/tenkes/balita/:id` jalan

## Build & Runtime
- [ ] `npm run build` sukses tanpa error
- [ ] Tidak ada console error saat navigate semua role
- [ ] Browser back/forward jalan normal
```

- [ ] **Step 2: Update status di spec**

Di `docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md`, ubah header:

```
**Status:** Phase 0–2 DONE (Plan 1). Phase 3–9 pending.
```

- [ ] **Step 3: Commit**

```bash
git add docs/testing-checklist.md docs/superpowers/specs/2026-05-12-kms-simplify-redesign-design.md
git commit -m "docs: add manual regression checklist and update spec status"
```

- [ ] **Step 4: Final build**

```bash
npm run build
```

Expected: sukses.

---

## Plan 1 Acceptance Criteria

Setelah semua task selesai:

- ✅ Folder `api/`, `queries/`, `features/`, `routes/`, `components/ui/`, `theme/` ada
- ✅ 8 komponen UI reusable (`Button`, `Card`, `PageHeader`, `NumberSlider`, `Modal`, `DataTable`, `Toast`, `StatusBadge`) bisa diimport
- ✅ Design tokens di `tokens.css` dipakai oleh semua komponen UI baru
- ✅ 1 halaman `/masuk` menggantikan 4 halaman `/sign-in/*`
- ✅ Session persist via `kms_session_v1`, migrasi otomatis dari `login_data`
- ✅ 401 handler terpusat di axios client
- ✅ Legacy route `/sign-in/*`, `/dashboard`, dll. redirect ke route baru
- ✅ Dashboard kader baru (`/kader/beranda`, `/kader/balita`) jalan dengan API real
- ✅ Semua halaman lama (OT, Admin, Desa, Tenkes, detail anak) tetap accessible
- ✅ Manual regression checklist didokumentasikan

---

## Catatan untuk Plan Berikutnya

- Plan 2 (Pengukuran Form + Detail Anak) tunggu konfirmasi backend untuk field `lila` & `catatan`
- Detail anak (`DetailPosyandu`) masih pakai komponen lama di Plan 1 — akan direplace di Plan 2 Phase 4
- Logout button sementara pakai `window.confirm` — bisa di-upgrade ke custom Modal di Plan berikutnya
