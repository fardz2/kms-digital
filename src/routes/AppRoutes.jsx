import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPortal from '../features/auth/LoginPortal';
import RequireRole from './RequireRole';
import ModePosyandu from '../features/kader/ModePosyandu';
import AkunOrangTuaPage from '../features/kader/AkunOrangTuaPage';
import DetailAnak from '../features/anak/DetailAnak';
import BerandaOT from '../features/orangtua/BerandaOT';
import ArtikelPublic from '../features/artikel/ArtikelList';
import ArtikelDetailPage from '../features/artikel/ArtikelDetailPage';
import LaporanBulananKader from '../features/laporan/LaporanBulananKader';
import BerandaDesa from '../features/desa/BerandaDesa';
import { LEGACY_REDIRECTS } from './legacyRedirects';

// Legacy pages (masih dipakai sampai migrasi selesai)
import LandingPage from '../pages/LandingPage';
import DetailForum from '../pages/DetailForum';
import SignUp from '../pages/SignUp';
import Post from '../pages/Post';
import NotFound from '../pages/NotFound';
import DashboardLayout from '../components/layout/Dashboard/DashboardLayout';
import DesaPage from '../pages/AdminDashboard/InputDesa';
import InputPosyandu from '../pages/AdminDashboard/InputPosyandu';
import RegisterKaderPosyandu from '../pages/AdminDashboard/RegisterKaderPosyandu';
import RegisterTenkes from '../pages/AdminDashboard/RegisterTenagaKesehatan';
import ArtikelList from '../pages/AdminDashboard/ArtikelList';
import ArtikelForm from '../pages/AdminDashboard/ArtikelForm';
import AdminDashboard from '../features/admin/AdminDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/masuk" element={<LoginPortal />} />
      <Route path="/sign-up" element={<SignUp />} />

      {/* Legacy redirects */}
      {LEGACY_REDIRECTS.map(({ from, to }) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}

      {/* Role: Kader Posyandu (NEW) */}
      <Route element={<RequireRole allow={['KADER_POSYANDU']} />}>
        <Route path="/kader/balita" element={<ModePosyandu />} />
        <Route path="/kader/balita/:id" element={<DetailAnak />} />
        <Route path="/kader/orangtua" element={<AkunOrangTuaPage />} />
        <Route path="/kader/laporan" element={<LaporanBulananKader />} />
      </Route>

      {/* Role: Orang Tua (legacy pages, new routes) */}
      <Route element={<RequireRole allow={['ORANG_TUA']} />}>
        <Route path="/orangtua/balita" element={<BerandaOT />} />
        <Route path="/orangtua/forum" element={<Post />} />
        <Route path="/orangtua/forum/:id" element={<DetailForum />} />
        <Route path="/orangtua/balita/:id" element={<DetailAnak />} />
      </Route>

      {/* Role: Desa (legacy) */}
      <Route element={<RequireRole allow={['DESA']} />}>
        <Route path="/desa/beranda" element={<BerandaDesa />} />
      </Route>

      {/* Role: Admin (legacy) */}
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

      {/* Role: Tenaga Kesehatan (legacy) */}
      <Route element={<RequireRole allow={['TENAGA_KESEHATAN']} />}>
        <Route path="/tenkes/forum" element={<Post />} />
        <Route path="/tenkes/balita/:id" element={<DetailForum />} />
      </Route>

      {/* Artikel (accessible by any authenticated role) */}
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
  );
}
