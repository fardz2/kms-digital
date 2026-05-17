import {
  LayoutDashboard,
  Home,
  FileText,
  Building2,
  Newspaper,
  UserCog,
  Stethoscope,
} from 'lucide-react';

export const sidebarlink = [
  {
    title: 'Beranda',
    links: [
      { title: 'Dashboard', path: '', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Data Master',
    links: [
      { title: 'Desa', path: 'desa', icon: Home },
      { title: 'Posyandu', path: 'posyandu', icon: Building2 },
      { title: 'Artikel', path: 'artikel', icon: Newspaper },
    ],
  },
  {
    title: 'Akun Pengguna',
    links: [
      { title: 'Kader Posyandu', path: 'kader-posyandu', icon: UserCog },
      { title: 'Tenaga Kesehatan', path: 'tenaga-kesehatan', icon: Stethoscope },
    ],
  },
];

export const _reservedIcons = { FileText };
