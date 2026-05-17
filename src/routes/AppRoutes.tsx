// @ts-nocheck
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireRole from './RequireRole';
import { LEGACY_REDIRECTS } from './legacyRedirects';

// Eager: critical for initial render
import LoginPortal from '../features/auth/LoginPortal';
import LandingPage from '../pages/LandingPage';
import NotFound from '../pages/NotFound';

// Lazy: per-role feature pages
const ModePosyandu = lazy(() => import('../features/kader/ModePosyandu'));
const AkunOrangTuaPage = lazy(() => import('../features/kader/AkunOrangTuaPage'));
const DetailAnak = lazy(() => import('../features/anak/DetailAnak'));
const BerandaOT = lazy(() => import('../features/orangtua/BerandaOT'));
const ArtikelPublic = lazy(() => import('../features/artikel/ArtikelList'));
const ArtikelDetailPage = lazy(() => import('../features/artikel/ArtikelDetailPage'));
const LaporanBulananKader = lazy(() => import('../features/laporan/LaporanBulananKader'));
const BerandaDesa = lazy(() => import('../features/desa/BerandaDesa'));
const SignUp = lazy(() => import('../pages/SignUp'));
const Post = lazy(() => import('../pages/Post'));
const DetailForum = lazy(() => import('../pages/DetailForum'));

// Admin pages
const DashboardLayout = lazy(() => import('../components/layout/Dashboard/DashboardLayout'));
const DesaPage = lazy(() => import('../pages/AdminDashboard/InputDesa'));
const InputPosyandu = lazy(() => import('../pages/AdminDashboard/InputPosyandu'));
const RegisterKaderPosyandu = lazy(() => import('../pages/AdminDashboard/RegisterKaderPosyandu'));
const RegisterTenkes = lazy(() => import('../pages/AdminDashboard/RegisterTenagaKesehatan'));
const ArtikelList = lazy(() => import('../pages/AdminDashboard/ArtikelList'));
const ArtikelForm = lazy(() => import('../pages/AdminDashboard/ArtikelForm'));
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-faint-fog">
      <div className="text-body-sm text-graphite">Memuat halaman...</div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/masuk" element={<LoginPortal />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Legacy redirects */}
        {LEGACY_REDIRECTS.map(({ from, to }) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}

        {/* Role: Kader Posyandu */}
        <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
          <Route path="/kader/balita" element={<ModePosyandu />} />
          <Route path="/kader/balita/:id" element={<DetailAnak />} />
          <Route path="/kader/orangtua" element={<AkunOrangTuaPage />} />
          <Route path="/kader/laporan" element={<LaporanBulananKader />} />
        </Route>

        {/* Role: Orang Tua */}
        <Route element={<RequireRole allow={['ORANG_TUA']} />}>
          <Route path="/orangtua/balita" element={<BerandaOT />} />
          <Route path="/orangtua/forum" element={<Post />} />
          <Route path="/orangtua/forum/:id" element={<DetailForum />} />
          <Route path="/orangtua/balita/:id" element={<DetailAnak />} />
        </Route>

        {/* Role: Desa */}
        <Route element={<RequireRole allow={['DESA']} />}>
          <Route path="/desa/beranda" element={<BerandaDesa />} />
        </Route>

        {/* Role: Admin */}
        <Route element={<RequireRole allow={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="desa" element={<DesaPage />} />
            <Route path="posyandu" element={<InputPosyandu />} />
            <Route path="kader-posyandu" element={<RegisterKaderPosyandu />} />
            <Route path="tenaga-kesehatan" element={<RegisterTenkes />} />
            <Route path="artikel" element={<ArtikelList />} />
            <Route path="artikel/baru" element={<ArtikelForm />} />
          </Route>
        </Route>

        {/* Role: Tenaga Kesehatan */}
        <Route element={<RequireRole allow={['TENAGA_KESEHATAN']} />}>
          <Route path="/tenkes/forum" element={<Post />} />
          <Route path="/tenkes/balita/:id" element={<DetailForum />} />
        </Route>

        {/* Artikel public */}
        <Route
          element={
            <RequireRole
              allow={['ORANG_TUA', 'KADER_POSYANDU', 'TENAGA_KESEHATAN', 'DESA', 'ADMIN']}
            />
          }
        >
          <Route path="/artikel" element={<ArtikelPublic />} />
          <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
