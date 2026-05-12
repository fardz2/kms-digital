import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPortal from '../features/auth/LoginPortal';
import RequireRole from './RequireRole';
import BerandaKader from '../features/kader/BerandaKader';
import DaftarAnak from '../features/anak/DaftarAnak';
import DetailAnak from '../features/anak/DetailAnak';
import { LEGACY_REDIRECTS } from './legacyRedirects';

// Legacy pages (masih dipakai sampai migrasi selesai)
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import Desa from '../pages/Desa/desa';
import DetailForum from '../pages/DetailForum';
import SignUp from '../pages/SignUp';
import Post from '../pages/Post';
import MyPost from '../pages/MyPost';
import NotFound from '../pages/NotFound';
import Artikel from '../pages/Artikel';
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
        <Route path="/kader/balita/:id" element={<DetailAnak />} />
      </Route>

      {/* Role: Orang Tua (legacy pages, new routes) */}
      <Route element={<RequireRole allow={['ORANG_TUA']} />}>
        <Route path="/orangtua/balita" element={<Dashboard />} />
        <Route path="/orangtua/forum" element={<Post />} />
        <Route path="/orangtua/forum/saya" element={<MyPost />} />
        <Route path="/orangtua/forum/:id" element={<DetailForum />} />
        <Route path="/orangtua/balita/:id" element={<DetailAnak />} />
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
