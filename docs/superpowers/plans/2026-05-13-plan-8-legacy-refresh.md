# Plan 8 — Legacy Pages Tailwind Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate semua legacy pages (landing, auth signup, forum OT/Tenkes, admin CMS, navbar/sidebar/table shared) dari inline style + legacy CSS ke Tailwind menggunakan design tokens yang sudah ada dari Plan 7. Mencapai konsistensi visual 100% di seluruh aplikasi.

**Architecture:** Reuse design tokens dari Plan 7 (`tailwind.config.js` sudah extend). Legacy files keep their data fetching + state logic, hanya styling yang di-refresh. Pattern sama: inline style → Tailwind className, CSS var → Tailwind token. Keep legacy `useAuth` hook (bukan `useSession`) untuk minimize churn.

**Tech Stack:** React 18 (CRA), Tailwind CSS 3.3 (config sudah di Plan 7), Ant Design v4 wrapper pattern, Inter + Plus Jakarta Sans fonts.

**Spec:** `docs/superpowers/specs/2026-05-13-aesthetic-refresh-design.md` (Section 8 komponen pattern, Section 9 scope extended).

**Depends on:** Plan 7 merged — tailwind config + fonts + tokens sudah ready.

**Backend dependencies:** NONE.

---

## File Scope (29 files)

**Shared layout (5):**
- `src/components/layout/Navbar/index.js` + `index.css`
- `src/components/layout/Navigation/index.js`
- `src/components/layout/Dashboard/DashboardLayout.jsx`
- `src/components/layout/Dashboard/Sidebar.jsx` + `DropdownLink.js` + `Navbar.js` + `Style.css`
- `src/components/layout/Table/index.js` + `Button.js` + `GlobalFilter.js` + `Icons.js`

**Public pages (3):**
- `src/pages/LandingPage/index.js` (+ login_bg.svg keep)
- `src/pages/SignUp/index.js` (+ GiziBalita_logo.png, login_bg.svg keep)
- `src/pages/NotFound/index.js`

**Forum (3, shared OT + Tenkes):**
- `src/pages/Post/index.js`
- `src/pages/MyPost/index.js`
- `src/pages/DetailForum/index.js` + `forum-style.css`

**Admin CMS (5):**
- `src/pages/AdminDashboard/InputDesa.js`
- `src/pages/AdminDashboard/InputPosyandu.js`
- `src/pages/AdminDashboard/RegisterKaderPosyandu.js`
- `src/pages/AdminDashboard/RegisterTenagaKesehatan.js`
- `src/pages/AdminDashboard/ArtikelAdmin.js`
- `src/pages/Admin/Desa/DesaPage.js`

**Form components (4):**
- `src/components/form/FormInputDataAnak/index.js`
- `src/components/form/FormInputPost/index.js`
- `src/components/form/FormInputDataExcel/index.js`
- `src/components/form/FormUpdateDataArtikel/index.js` + `style.css`

---

## Testing Strategy

- 64 existing tests harus tetap pass setelah setiap task batch
- Build (`npm run build`) wajib pass setelah setiap batch
- Manual visual test per flow:
  - Landing page → public access
  - SignUp flow
  - OT/Tenkes forum (Post + MyPost + DetailForum)
  - Admin sidebar + sub-pages (Desa, Posyandu, Kader register, Tenkes register, Artikel CMS)
  - Form modal (input anak, input post, input excel, update artikel)
- Legacy useAuth wiring tetap jalan (jangan migrate ke useSession di plan ini — scope terpisah)

---

## Task 1: LandingPage

**Files:** `src/pages/LandingPage/index.js`

- [ ] **Step 1: Baca file existing**

```bash
Get-Content src/pages/LandingPage/index.js
```

- [ ] **Step 2: Replace wrapper & styling**

Pattern:
- Outer container: `className="min-h-screen bg-cover bg-center bg-no-repeat"` dengan inline `style={{ backgroundImage: `url(${background})` }}`
- Content wrapper: `className="container mx-auto px-4 py-8 md:py-16"`
- Hero heading: `className="text-display font-display text-primary-700 text-center leading-tight"`
- Hero subheading: `className="text-body-lg text-neutral-700 text-center mt-4 max-w-reading mx-auto"`
- CTA buttons: replace existing `<button className="button__">` dengan:
  ```jsx
  <Link to="/masuk" className="inline-flex items-center justify-center gap-2 px-6 py-4 min-h-[3.5rem] rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold text-body-lg shadow-raised active:scale-[0.98] transition-all duration-150 ease-out-quart">
    Masuk
  </Link>
  ```
- SignUp link: secondary variant dengan `bg-white border border-primary-200 text-primary-700`
- Semua `style={{ ... }}` inline → className

Keep:
- `background` import (login_bg.svg)
- `BackgroundComponent` logic (ubah ke Tailwind class)
- Navigasi logic & content markup

- [ ] **Step 3: Build**
```bash
npm run build
```

- [ ] **Step 4: Commit**
```bash
git add src/pages/LandingPage/index.js
git commit -m "refactor(landing): migrate LandingPage to Tailwind"
```

---

## Task 2: SignUp

**Files:** `src/pages/SignUp/index.js`

- [ ] **Step 1: Replace styling**

Pattern:
- Outer wrapper: `className="min-h-screen bg-neutral-50 flex items-center justify-center p-6"`
- Card container: `className="w-full max-w-lg bg-white rounded-card shadow-card p-8"`
- Logo + heading: `className="flex flex-col items-center mb-6"` dengan heading `text-h1 font-display`
- Form: antd Form keep, label pakai `text-caption text-neutral-700`
- Input: `className="h-12 text-base"` pada antd Input components
- Button submit: `<Button>` component Plan 7, `variant="primary" size="lg"` full width
- Link ke login: `<Link className="text-primary-700 hover:text-primary-800 font-medium">`

Keep:
- `useQuery` auth check + `useMutation` register flow
- `readSession` import (sudah benar dari fix sebelumnya)
- ROLE_HOME redirect
- Form validation rules

- [ ] **Step 2: Build + commit**
```bash
npm run build
git add src/pages/SignUp/index.js
git commit -m "refactor(signup): migrate SignUp to Tailwind"
```

---

## Task 3: NotFound

**Files:** `src/pages/NotFound/index.js`

- [ ] **Step 1: Replace**

```jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-display font-display text-primary mb-4">404</div>
        <h1 className="text-h1 font-display text-neutral-900 mb-3">Halaman tidak ditemukan</h1>
        <p className="text-body-lg text-neutral-600 mb-8">
          Alamat yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-tap rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm active:scale-[0.98] transition-all duration-150"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/pages/NotFound/index.js
git commit -m "refactor(notfound): rewrite 404 page with Tailwind"
```

---

## Task 4: Shared Navbar (legacy)

**Files:** `src/components/layout/Navbar/index.js` + `index.css`

- [ ] **Step 1: Replace wrapper styling + logout integration**

Pattern navbar:
- Outer: `className="sticky top-0 z-40 bg-primary text-white shadow-card"`
- Container: `className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4"`
- Logo/brand: `className="font-display font-bold text-h3"` 
- Nav links: `className="flex gap-1 items-center flex-wrap"` dengan tiap link `className="px-3 py-2 rounded-button text-white/90 hover:bg-white/10 hover:text-white transition-colors font-medium"`
- Avatar/user menu: keep antd Avatar wrapper, style dengan Tailwind
- Logout button: keep `clearSession()` + `navigate('/')`

- [ ] **Step 2: Empty `index.css`** (legacy CSS rules tidak dipakai lagi)

```css
/* Navbar styles moved to Tailwind utility classes */
```

- [ ] **Step 3: Build + commit**
```bash
npm run build
git add src/components/layout/Navbar/
git commit -m "refactor(layout): migrate legacy Navbar to Tailwind"
```

---

## Task 5: Navigation component

**Files:** `src/components/layout/Navigation/index.js`

- [ ] **Step 1: Baca file**

```bash
Get-Content src/components/layout/Navigation/index.js
```

- [ ] **Step 2: Replace styling**

Component simple navigation bar — ganti semua inline style dengan Tailwind. Jika pakai `className="..."` existing dengan utility Tailwind, keep. Jika pakai `style={{}}`, convert ke className.

- [ ] **Step 3: Commit**
```bash
git add src/components/layout/Navigation/index.js
git commit -m "refactor(layout): migrate Navigation to Tailwind"
```

---

## Task 6: Admin Sidebar + DashboardLayout + DropdownLink + Dashboard Navbar

**Files:** `src/components/layout/Dashboard/Sidebar.jsx`, `DropdownLink.js`, `DashboardLayout.jsx`, `Navbar.js`, `Style.css`

- [ ] **Step 1: DashboardLayout wrapper**

```jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <Sidebar
        showSidebar={sidebarOpen}
        isMobile={true}
        closeSidebar={closeSidebar}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-dashboard-content w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Sidebar styling**

Pattern sidebar:
- Container: `className="fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 shadow-card transform transition-transform duration-250 ease-out-quart ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}"`
- Header (logo + nama admin): `className="p-6 border-b border-neutral-200"`
- Section group: `className="p-4 space-y-6"` dengan header section `className="text-overline text-neutral-500 mb-2"`
- Link item: 
  ```jsx
  <Link to={...} className="flex items-center gap-3 px-3 py-2.5 rounded-button text-neutral-700 hover:bg-primary-50 hover:text-primary-700 transition-colors font-medium">
    <Icon className="w-5 h-5" />
    {title}
  </Link>
  ```
- Active state: `bg-primary-50 text-primary-700 font-semibold`
- Logout button bottom: `className="flex items-center gap-3 px-3 py-2.5 rounded-button text-danger hover:bg-danger-bg transition-colors w-full font-medium"`

Keep `clearSession()` + `navigate('/masuk')` logout handler dari fix sebelumnya.

- [ ] **Step 3: DropdownLink component**

Sub-menu expansion:
```jsx
<div className="space-y-1">
  <button className="flex items-center justify-between w-full px-3 py-2.5 rounded-button hover:bg-neutral-100 transition-colors">
    <span className="flex items-center gap-3">...</span>
    <ChevronIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
  </button>
  {open && (
    <div className="ml-8 space-y-1 py-1">
      {sub links}
    </div>
  )}
</div>
```

- [ ] **Step 4: Dashboard Navbar (top bar)**

```jsx
<header className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
  <button onClick={onMenuClick} className="md:hidden p-2 rounded-button hover:bg-neutral-100">
    <MenuIcon className="w-6 h-6" />
  </button>
  <h1 className="text-h3 font-display text-neutral-900">Admin Dashboard</h1>
  <div className="flex items-center gap-3">
    {/* avatar / user info */}
  </div>
</header>
```

- [ ] **Step 5: Style.css — empty**

```css
/* Dashboard layout styles moved to Tailwind utility classes */
```

- [ ] **Step 6: Build + test manual**
```bash
npm run build
npm test -- --watchAll=false
```

Manual: login admin, buka `/admin/dashboard/desa` — sidebar harus muncul, nav-link active state, submenu expand.

- [ ] **Step 7: Commit**
```bash
git add src/components/layout/Dashboard/
git commit -m "refactor(layout): migrate Admin Dashboard layout (Sidebar, DashboardLayout, DropdownLink, Navbar) to Tailwind"
```

---

## Task 7: Table component (react-table wrapper)

**Files:** `src/components/layout/Table/index.js`, `Button.js`, `GlobalFilter.js`, `Icons.js`

File ini besar (~1000+ lines) karena include global filter + pagination + modal orangTua + modal anak approve. Keep semua logic, ganti styling.

- [ ] **Step 1: GlobalFilter component**

```jsx
import React from 'react';

export default function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <div className="relative mb-4">
      <input
        type="search"
        value={globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value || undefined)}
        placeholder="Cari..."
        className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-button text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-colors"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden>🔍</span>
    </div>
  );
}
```

- [ ] **Step 2: Button (pagination) component**

```jsx
import React from 'react';

export function Button({ children, className = '', ...rest }) {
  return (
    <button
      className={`relative inline-flex items-center px-4 py-2 rounded-button bg-white border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PageButton({ children, className = '', ...rest }) {
  return (
    <button
      className={`relative inline-flex items-center px-3 py-2 border border-neutral-200 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 3: Main Table component styling**

Pattern (di file `index.js`):

Table wrapper: 
```jsx
<div className="overflow-x-auto rounded-card border border-neutral-200 bg-white shadow-card">
  <table {...getTableProps()} className="min-w-full divide-y divide-neutral-200">
    <thead className="bg-neutral-50">
      {headerGroups.map(headerGroup => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map(column => (
            <th {...column.getHeaderProps(...)} 
              className="px-6 py-3 text-overline text-neutral-600 text-left">
              {column.render('Header')}
            </th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody {...getTableBodyProps()} className="bg-white divide-y divide-neutral-100">
      {page.map(row => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()} className="hover:bg-primary-50/40 transition-colors">
            {row.cells.map(cell => (
              <td {...cell.getCellProps()} className="px-6 py-4 text-sm text-neutral-700">
                {cell.render('Cell')}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
```

Pagination container:
```jsx
<div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
  <div className="flex items-center gap-2 text-sm text-neutral-600">
    <span>Halaman</span>
    <span className="font-semibold">{pageIndex + 1}</span>
    <span>dari</span>
    <span className="font-semibold">{pageOptions.length}</span>
  </div>
  <nav className="inline-flex -space-x-px rounded-button shadow-sm">
    <PageButton onClick={() => gotoPage(0)} disabled={!canPreviousPage}>««</PageButton>
    <PageButton onClick={() => previousPage()} disabled={!canPreviousPage}>«</PageButton>
    <PageButton onClick={() => nextPage()} disabled={!canNextPage}>»</PageButton>
    <PageButton onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>»»</PageButton>
  </nav>
</div>
```

Modal title (dalam antd Modal wrapper): 
```jsx
title={<span className="text-h3 font-display text-neutral-900">Daftar Orang Tua</span>}
```

Button `ButtonCus` (approve/export buttons):
```jsx
<button onClick={...}
  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold transition-colors">
  {icon} Lihat Anak Belum Approve
</button>
```

- [ ] **Step 4: Icons.js** — keep, icon SVG tidak perlu di-migrate

- [ ] **Step 5: Build + test**
```bash
npm run build
npm test -- --watchAll=false
```

Manual: login kader, buka legacy page yang pakai Table (bisa via admin dashboard atau refactored page). Pastikan table header + row + pagination render.

- [ ] **Step 6: Commit**
```bash
git add src/components/layout/Table/
git commit -m "refactor(layout): migrate Table component to Tailwind"
```

---

## Task 8: Form components (FormInputDataAnak, FormInputPost, FormInputDataExcel, FormUpdateDataArtikel)

**Files:** `src/components/form/FormInputDataAnak/index.js`, `FormInputPost/index.js`, `FormInputDataExcel/index.js`, `FormUpdateDataArtikel/index.js` + `style.css`

Pattern shared di 4 modal form:

Modal title:
```jsx
title={<span className="text-h3 font-display text-neutral-900">{title}</span>}
```

Field wrapper:
```jsx
<Form.Item
  label={<span className="text-caption text-neutral-700">{label}</span>}
  name={...}
  rules={...}
>
  <Input className="h-11 text-base" />
</Form.Item>
```

Footer buttons:
```jsx
<div className="flex gap-2 justify-end mt-4">
  <button onClick={onCancel} className="px-5 py-2.5 rounded-button bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 font-display font-semibold transition-colors">
    Batal
  </button>
  <button type="submit" className="px-5 py-2.5 rounded-button bg-primary hover:bg-primary-600 text-white font-display font-semibold shadow-sm active:scale-[0.98] transition-all">
    Simpan
  </button>
</div>
```

- [ ] **Step 1: FormInputDataAnak** — migrate modal styling + form fields

- [ ] **Step 2: FormInputPost** — migrate (pakai ReactQuill untuk content; quill biarkan default, wrapper class)

- [ ] **Step 3: FormInputDataExcel** — migrate file upload wrapper + info teks
  
Upload area:
```jsx
<div className="p-6 bg-primary-50 border-2 border-dashed border-primary-200 rounded-card text-center">
  <p className="text-body-lg font-display font-semibold text-neutral-900 mb-2">
    Pilih file Excel
  </p>
  <p className="text-caption text-neutral-600 mb-4">
    Format .xlsx atau .xls
  </p>
  <input type="file" onChange={...} className="text-sm text-neutral-700 file:mr-4 file:py-2 file:px-4 file:rounded-button file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-600 file:cursor-pointer" />
</div>
```

- [ ] **Step 4: FormUpdateDataArtikel + style.css**

ReactQuill container:
```jsx
<div className="border border-neutral-200 rounded-button overflow-hidden">
  <ReactQuill value={valueContent} onChange={setValueContent} theme="snow" />
</div>
```

Image upload preview:
```jsx
<div className="mt-2 flex items-start gap-3">
  <img src={imagePreview} alt="" className="w-24 h-24 object-cover rounded-button border border-neutral-200" />
  <button onClick={removeImage} className="text-danger text-sm hover:underline">
    Hapus gambar
  </button>
</div>
```

Empty `style.css`:
```css
/* Form update artikel styles moved to Tailwind utility classes.
   ReactQuill default theme retained via 'quill.snow.css' import. */

/* Minimal Quill toolbar match body font */
.ql-editor {
  font-family: Inter, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}
```

- [ ] **Step 5: Build + test**
```bash
npm run build
npm test -- --watchAll=false
```

Manual: buka tiap modal (Admin artikel CMS, OT add post, kader add anak).

- [ ] **Step 6: Commit**
```bash
git add src/components/form/FormInputDataAnak/ src/components/form/FormInputPost/ src/components/form/FormInputDataExcel/ src/components/form/FormUpdateDataArtikel/
git commit -m "refactor(form): migrate 4 legacy form components to Tailwind"
```

---

## Task 9: Forum pages (Post, MyPost, DetailForum)

**Files:** `src/pages/Post/index.js`, `MyPost/index.js`, `DetailForum/index.js` + `forum-style.css`

Pattern forum:

Forum page wrapper:
```jsx
<div className="min-h-screen bg-neutral-50">
  <Navbar />
  <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-h1 font-display text-neutral-900">Forum Tanya Jawab</h1>
      <Button onClick={openInputPost} variant="primary">+ Tulis Pertanyaan</Button>
    </header>
    <div className="space-y-3">
      {posts.map(post => <PostCard post={post} />)}
    </div>
  </div>
</div>
```

Post card:
```jsx
<article onClick={() => navigate(`/orangtua/forum/${post.id}`)}
  className="bg-white border border-neutral-200 rounded-card p-5 cursor-pointer hover:border-primary-200 hover:shadow-card transition-all duration-200 ease-out-quart">
  <div className="flex items-center gap-2 mb-2">
    <img src={avatar} alt="" className="w-8 h-8 rounded-full" />
    <div>
      <p className="text-caption text-neutral-900 font-medium">{post.nama}</p>
      <p className="text-xs text-neutral-500 tabular-nums">{moment(post.created_at).format('DD MMM YYYY')}</p>
    </div>
  </div>
  <h3 className="text-h3 font-display text-neutral-900 mb-2">{post.judul}</h3>
  <p className="text-base text-neutral-700 line-clamp-3">{post.content}</p>
  <div className="mt-3 flex items-center gap-4 text-caption text-neutral-500">
    <span>💬 {post.jumlah_komentar} komentar</span>
  </div>
</article>
```

DetailForum thread:
- Post utama di atas (sama dengan PostCard tapi expanded)
- Comment list:
  ```jsx
  <section className="mt-6 space-y-3">
    <h2 className="text-h3 font-display text-neutral-900">Komentar</h2>
    {comments.map(c => (
      <div className="bg-white border border-neutral-200 rounded-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <img src={avatar} alt="" className="w-7 h-7 rounded-full" />
          <p className="text-caption font-medium text-neutral-900">{c.nama}</p>
          <span className="text-xs text-neutral-500">{moment(c.created_at).fromNow()}</span>
        </div>
        <p className="text-base text-neutral-700">{c.content}</p>
      </div>
    ))}
  </section>
  ```
- Input comment form at bottom:
  ```jsx
  <Form form={form} onFinish={handleSubmitComment}>
    <Form.Item name="content" rules={[{ required: true, message: 'Tulis komentar dulu' }]}>
      <Input.TextArea rows={3} placeholder="Tulis komentar..." className="text-base" />
    </Form.Item>
    <Button type="submit" variant="primary">Kirim</Button>
  </Form>
  ```

`forum-style.css` — empty:
```css
/* Forum styles moved to Tailwind utility classes */
```

- [ ] **Step 1: Post** (list forum)
- [ ] **Step 2: MyPost** (forum milik user)
- [ ] **Step 3: DetailForum** (thread detail + comments)
- [ ] **Step 4: Empty forum-style.css**
- [ ] **Step 5: Build + test manual** (login OT, buka forum)
- [ ] **Step 6: Commit**
```bash
git add src/pages/Post/ src/pages/MyPost/ src/pages/DetailForum/
git commit -m "refactor(forum): migrate Post, MyPost, DetailForum to Tailwind"
```

---

## Task 10: Admin CMS (InputDesa, InputPosyandu, RegisterKaderPosyandu, RegisterTenagaKesehatan, ArtikelAdmin, DesaPage)

**Files:** `src/pages/AdminDashboard/*.js`, `src/pages/Admin/Desa/DesaPage.js`

Pattern admin CMS:

Page wrapper (di dalam DashboardLayout Outlet):
```jsx
<div className="space-y-6">
  <header className="flex items-center justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-h1 font-display text-neutral-900">Kelola Desa</h1>
      <p className="text-caption text-neutral-600 mt-1">{subtitle}</p>
    </div>
    <Button onClick={openAddModal} variant="primary">+ Tambah Desa</Button>
  </header>

  <GlobalFilter ... />

  <div className="bg-white border border-neutral-200 rounded-card shadow-card overflow-hidden">
    <Table ... />
  </div>
</div>
```

Action buttons di row (tombol Edit/Delete/Approve):
```jsx
<div className="flex gap-2">
  <button onClick={handleEdit} className="px-3 py-1.5 rounded-button bg-accent-bg text-accent border border-accent/20 hover:bg-accent hover:text-white text-xs font-semibold transition-colors">
    Edit
  </button>
  <button onClick={handleDelete} className="px-3 py-1.5 rounded-button bg-danger-bg text-danger border border-danger/20 hover:bg-danger hover:text-white text-xs font-semibold transition-colors">
    Hapus
  </button>
</div>
```

Status badge dalam row (untuk field status user/anak):
```jsx
<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${status ? 'bg-success-bg text-success' : 'bg-warning-bg text-amber-800'}`}>
  {status ? 'Approved' : 'Belum Approve'}
</span>
```

- [ ] **Step 1: InputDesa.js** — CRUD desa
- [ ] **Step 2: InputPosyandu.js** — CRUD posyandu
- [ ] **Step 3: RegisterKaderPosyandu.js** — register kader + approve
- [ ] **Step 4: RegisterTenagaKesehatan.js** — register tenkes + approve
- [ ] **Step 5: ArtikelAdmin.js** — CMS artikel (ReactQuill keep, wrapper Tailwind)
- [ ] **Step 6: DesaPage.js** — wraps InputDesa (thin wrapper, follow InputDesa pattern)

Setiap file:
- Replace `style={{ }}` dengan className
- Keep semua `useQuery`, `useMutation`, form logic
- Keep fetch URLs
- Modal title + footer pakai pattern Task 8

- [ ] **Step 7: Build + test manual** (login admin, uji tiap sub-page + CRUD)

- [ ] **Step 8: Commit**
```bash
git add src/pages/AdminDashboard/ src/pages/Admin/
git commit -m "refactor(admin): migrate 6 admin CMS pages to Tailwind"
```

---

## Task 11: Verification sweep

- [ ] **Step 1: Zero inline style audit (legacy scope)**

```bash
rg "style={{" src/pages/LandingPage/ src/pages/SignUp/ src/pages/NotFound/ src/pages/Post/ src/pages/MyPost/ src/pages/DetailForum/ src/pages/AdminDashboard/ src/pages/Admin/ src/components/layout/Navbar/ src/components/layout/Navigation/ src/components/layout/Dashboard/ src/components/layout/Table/ src/components/form/
```

Expected: near-zero. Acceptable exceptions:
- `style={{ backgroundImage: `url(${bg})` }}` untuk dynamic image
- `style={{ width: `${pct}%` }}` untuk progress
- Font family inline di Modal bodyStyle (antd wrapper)

- [ ] **Step 2: Audit CSS file**

```bash
Get-Content src/components/layout/Navbar/index.css, src/components/layout/Dashboard/Style.css, src/pages/DetailForum/forum-style.css, src/components/form/FormUpdateDataArtikel/style.css
```

Expected: tiap file kosong atau hanya comment + ReactQuill font override.

- [ ] **Step 3: Final build + test**

```bash
npm run build
npm test -- --watchAll=false
```

Expected: 64/64 tests pass, build success. Bundle size delta vs Plan 7 baseline: ≤ +30 kB (mayoritas udah dari Plan 7).

- [ ] **Step 4: Commit residual fix (kalau ada)**

---

## Task 12: Docs + final verify

**Files:** `docs/testing-checklist.md`

- [ ] **Step 1: Extend checklist**

Tambah setelah section "Aesthetic Refresh (Plan 7)":

```markdown
## Legacy Pages Refresh (Plan 8)
- [ ] LandingPage render dengan hero heading font display, CTA pink button
- [ ] SignUp form dengan Tailwind styling, antd Input inherit font Inter
- [ ] NotFound tampil rapi (bukan plain HTML)
- [ ] Navbar legacy (dipakai OT/Tenkes forum) bg pink-500, link hover state
- [ ] Admin sidebar: Active link primary-50, hover transition, DropdownLink submenu
- [ ] Admin DashboardLayout: responsive sidebar mobile hamburger
- [ ] Table (react-table) header overline caps, row hover primary-50/40
- [ ] Pagination button rounded, disabled state opacity
- [ ] Form modal (Add anak, Add post, Upload excel, Update artikel) styling konsisten
- [ ] Forum post card hover lift + shadow-card
- [ ] Admin CMS action buttons (Edit/Delete/Approve) variants consistent
- [ ] Status badge Approved/Belum Approve pill rounded
```

- [ ] **Step 2: Commit**
```bash
git add docs/testing-checklist.md
git commit -m "docs: add Plan 8 legacy refresh testing checklist"
```

- [ ] **Step 3: Final visual QA**

`npm start`. Manual verify:
- `/` (LandingPage) — hero + CTA
- `/sign-up` — form signup
- `/xxx-not-exist` — 404 page
- OT login → `/orangtua/forum` — post list
- OT → click post → `/orangtua/forum/:id` — thread detail
- OT → `/orangtua/forum/saya` — MyPost
- Tenkes login → `/tenkes/forum` — same flow
- Admin login → sidebar + sub pages (desa, posyandu, kader-posyandu, tenaga-kesehatan, artikel, laporan)
- Admin → test CRUD modal di tiap sub-page
- Admin → kader page → approve button action visible

Task 12 no commit, hanya verify.

---

## Plan 8 Acceptance

- ✅ 29 legacy files migrated ke Tailwind className
- ✅ Zero inline `style={{ }}` di scope files (kecuali exception documented)
- ✅ 5 CSS file legacy di-empty (Navbar index.css, Dashboard Style.css, DetailForum forum-style.css, FormUpdateDataArtikel style.css)
- ✅ 64 tests tetap pass
- ✅ Build success
- ✅ Visual konsisten dengan Plan 7 di semua role (public, OT, Tenkes, Admin, Kader, Desa)
- ✅ Legacy `useAuth` hook tetap dipakai (tidak migrate ke useSession — scope terpisah)

---

## Risiko & Catatan

| Risiko | Mitigasi |
|---|---|
| Table component sangat besar (1000+ lines), risky refactor | Task 7 split per sub-file (GlobalFilter, Button, Icons), main index keep logic + style-only changes |
| ReactQuill editor styling konflik dengan Tailwind | Wrapper Tailwind di container, Quill internal CSS keep via snow.css import |
| Admin sidebar mobile responsiveness break | Task 6 Step 2 pattern `fixed md:static transform translate-x-0/-full` — test di mobile viewport |
| Form modal antd internal padding/color tidak match | Task 8 keep antd component default internal, hanya title + footer + label custom |
| Legacy `useAuth` akses localStorage | Sudah di-fix (Plan 5+ session migration) — baca `readSession()` |
| File `Table/index.js` modal handler `.approveAnak` dll masih pakai legacy invalidate queryKey `['anakBelumApprove']` | Tidak disentuh di plan ini — admin flow menggunakan modal internal Table component, tidak affect ModePosyandu approve yang pakai `qk.pengukuran.byAnak` + qk.anak.all |

---

## Next

Setelah Plan 8 merged → Plan 7 + Plan 8 jadi complete refresh aplikasi. Deploy.

Optional future:
- Migrate legacy `useAuth` ke `useSession` di remaining legacy files (8 consumers) — scope terpisah, deletion `hook/useAuth.js`
- Dark mode via `dark:` variants
- Replace emoji icons ke `lucide-react` untuk consistency lintas device
