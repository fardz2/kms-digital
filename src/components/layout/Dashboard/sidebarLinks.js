import {
  Home,
  FileText,
  Building2,
  Newspaper,
  UserCog,
  Stethoscope,
  BarChart3,
} from 'lucide-react';

export const sidebarlink = [
  {
    title: 'Input Data',
    links: [
      { title: 'Desa', path: 'desa', icon: Home },
      { title: 'Posyandu', path: 'posyandu', icon: Building2 },
      { title: 'Artikel', path: 'artikel', icon: Newspaper },
    ],
  },
  {
    title: 'Register Akun',
    links: [
      { title: 'Kader Posyandu', path: 'kader-posyandu', icon: UserCog },
      { title: 'Tenaga Kesehatan', path: 'tenaga-kesehatan', icon: Stethoscope },
    ],
  },
  {
    title: 'Laporan',
    links: [
      { title: 'Laporan Keseluruhan', path: 'laporan', icon: BarChart3 },
    ],
  },
];

// FileText reserved for future menu items needing a document-style icon.
export const _reservedIcons = { FileText };
