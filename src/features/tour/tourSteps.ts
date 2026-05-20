import type { TourStepProps } from 'antd';
import { matchPath } from 'react-router-dom';
import type { Role } from '../../types';

export interface FlowStep {
  id: string;
  routePattern: string;
  title: string;
  description: string;
  targetSelector?: string | null;
}

export interface RoleFlow {
  role: Role;
  steps: FlowStep[];
}

const FLOWS: Partial<Record<Role, RoleFlow>> = {
  KADER_POSYANDU: {
    role: 'KADER_POSYANDU',
    steps: [
      {
        id: 'kader-mode-intro',
        routePattern: '/kader/balita',
        title: 'Selamat datang di Mode Posyandu',
        description:
          'Halaman ini membantu Anda mencatat pengukuran balita dengan cepat saat hari posyandu. Mari kita lihat fitur utamanya.',
      },
      {
        id: 'kader-search',
        routePattern: '/kader/balita',
        targetSelector: '[data-tour-id="kader-search"]',
        title: 'Cari Balita',
        description: 'Ketik nama balita untuk filter daftar dengan cepat.',
      },
      {
        id: 'kader-filter',
        routePattern: '/kader/balita',
        targetSelector: '[data-tour-id="kader-filter"]',
        title: 'Filter Status',
        description:
          'Pilih "Belum" untuk lihat balita yang belum diukur, atau "Perhatian" untuk yang butuh tindakan.',
      },
      {
        id: 'kader-akun-ortu',
        routePattern: '/kader/balita',
        targetSelector: '[data-tour-id="kader-akun-ortu"]',
        title: 'Akun Orang Tua',
        description:
          'Setujui pendaftaran orang tua dan kelola data akun di sini. Badge angka menunjukkan jumlah yang menunggu persetujuan.',
      },
      {
        id: 'kader-laporan',
        routePattern: '/kader/balita',
        targetSelector: '[data-tour-id="kader-laporan"]',
        title: 'Laporan Bulanan',
        description:
          'Buka ringkasan pengukuran balita untuk melihat progres dan status gizi per bulan.',
      },
      {
        id: 'kader-tambah',
        routePattern: '/kader/balita',
        targetSelector: '[data-tour-id="kader-tambah"]',
        title: 'Tambah Balita Baru',
        description: 'Klik untuk daftarkan balita baru yang belum ada di sistem.',
      },
      {
        id: 'kader-orangtua-header',
        routePattern: '/kader/orangtua',
        targetSelector: '[data-tour-id="kader-orangtua-header"]',
        title: 'Kelola Akun Orang Tua',
        description:
          'Halaman ini memuat persetujuan pendaftaran dan daftar akun orang tua aktif.',
      },
      {
        id: 'kader-orangtua-tabs',
        routePattern: '/kader/orangtua',
        targetSelector: '[data-tour-id="kader-akunortu-tabs"]',
        title: 'Tab Persetujuan',
        description:
          'Gunakan tab untuk berganti antara daftar menunggu persetujuan dan akun yang aktif.',
      },
      {
        id: 'kader-orangtua-table',
        routePattern: '/kader/orangtua',
        targetSelector: '[data-tour-id="kader-akunortu-table"]',
        title: 'Daftar Orang Tua Aktif',
        description:
          'Tabel ini dipakai untuk menambah, mengubah, dan menghapus akun orang tua yang aktif.',
      },
      {
        id: 'kader-laporan-header',
        routePattern: '/kader/laporan',
        targetSelector: '[data-tour-id="kader-laporan-header"]',
        title: 'Laporan Bulanan Kader',
        description:
          'Halaman rekap ini menampilkan ringkasan pengukuran balita dan distribusi status gizi.',
      },
      {
        id: 'kader-laporan-picker',
        routePattern: '/kader/laporan',
        targetSelector: '[data-tour-id="kader-laporan-picker"]',
        title: 'Pilih Bulan',
        description:
          'Ganti bulan untuk melihat laporan pengukuran pada periode yang berbeda.',
      },
      {
        id: 'kader-laporan-stats',
        routePattern: '/kader/laporan',
        targetSelector: '[data-tour-id="kader-laporan-stats"]',
        title: 'Ringkasan Bulanan',
        description:
          'Stat card ini menunjukkan total balita, yang sudah diukur, dan yang belum diukur.',
      },
    ],
  },

  ORANG_TUA: {
    role: 'ORANG_TUA',
    steps: [
      {
        id: 'ot-intro',
        routePattern: '/orangtua/balita',
        title: 'Selamat datang Orang Tua',
        description:
          'Pantau pertumbuhan anak Anda dan ajukan pertanyaan ke tenaga kesehatan dari aplikasi ini.',
      },
      {
        id: 'ot-tambah-anak',
        routePattern: '/orangtua/balita',
        targetSelector: '[data-tour-id="ot-tambah-anak"]',
        title: 'Tambah Anak',
        description: 'Daftarkan anak Anda di sini agar bisa dipantau pertumbuhannya.',
      },
      {
        id: 'ot-forum',
        routePattern: '/orangtua/balita',
        targetSelector: '[data-tour-id="ot-forum"]',
        title: 'Forum Tanya Jawab',
        description:
          'Tanyakan apa pun tentang gizi atau tumbuh kembang anak ke tenaga kesehatan.',
      },
      {
        id: 'ot-artikel',
        routePattern: '/orangtua/balita',
        targetSelector: '[data-tour-id="ot-artikel"]',
        title: 'Artikel Edukasi',
        description: 'Baca artikel pilihan tentang gizi dan pengasuhan balita.',
      },
      {
        id: 'ot-forum-header',
        routePattern: '/orangtua/forum',
        targetSelector: '[data-tour-id="ot-forum-header"]',
        title: 'Forum Tanya Jawab',
        description:
          'Halaman ini dipakai untuk membaca dan menulis pertanyaan terkait tumbuh kembang anak.',
      },
      {
        id: 'ot-forum-tabs',
        routePattern: '/orangtua/forum',
        targetSelector: '[data-tour-id="ot-forum-tabs"]',
        title: 'Filter Forum',
        description:
          'Pakai tab untuk berpindah antara semua pertanyaan dan pertanyaan milik Anda.',
      },
      {
        id: 'ot-forum-detail-form',
        routePattern: '/orangtua/forum/:id',
        targetSelector: '[data-tour-id="ot-forum-detail-form"]',
        title: 'Kirim Komentar',
        description:
          'Balas pertanyaan yang sedang dibuka lewat form komentar di halaman detail forum.',
      },
    ],
  },

  TENAGA_KESEHATAN: {
    role: 'TENAGA_KESEHATAN',
    steps: [
      {
        id: 'tenkes-intro',
        routePattern: '/tenkes/forum',
        title: 'Selamat datang Tenaga Kesehatan',
        description:
          'Halaman forum berisi pertanyaan dari orang tua. Anda bisa menjawab dan memberi saran kesehatan.',
      },
      {
        id: 'tenkes-forum-list',
        routePattern: '/tenkes/forum',
        targetSelector: '[data-tour-id="tenkes-forum-list"]',
        title: 'Daftar Pertanyaan',
        description:
          'Daftar ini menampilkan pertanyaan dari orang tua yang bisa Anda buka untuk menjawab.',
      },
      {
        id: 'tenkes-detail-form',
        routePattern: '/tenkes/balita/:id',
        targetSelector: '[data-tour-id="tenkes-forum-detail-form"]',
        title: 'Tulis Jawaban',
        description:
          'Gunakan form komentar untuk mengirim jawaban atau saran kesehatan pada detail forum.',
      },
    ],
  },

  DESA: {
    role: 'DESA',
    steps: [
      {
        id: 'desa-intro',
        routePattern: '/desa/beranda',
        title: 'Selamat datang Pemerintah Desa',
        description:
          'Pantau rekap gizi balita se-desa, ekspor laporan, dan kelola acara posyandu.',
      },
      {
        id: 'desa-header',
        routePattern: '/desa/beranda',
        targetSelector: '[data-tour-id="desa-header"]',
        title: 'Ringkasan Desa',
        description:
          'Header ini menunjukkan nama desa dan memberi konteks halaman rekap yang sedang dibuka.',
      },
      {
        id: 'desa-export',
        routePattern: '/desa/beranda',
        targetSelector: '[data-tour-id="desa-export"]',
        title: 'Ekspor Data',
        description:
          'Unduh rekap CSV atau PDF langsung dari kartu ekspor data di bagian atas halaman.',
      },
      {
        id: 'desa-laporan',
        routePattern: '/desa/beranda',
        targetSelector: '[data-tour-id="desa-laporan"]',
        title: 'Laporan Desa',
        description:
          'Bagian ini menampilkan statistik gizi, progres per posyandu, dan distribusi total desa.',
      },
      {
        id: 'desa-acara',
        routePattern: '/desa/beranda',
        targetSelector: '[data-tour-id="desa-acara"]',
        title: 'Kelola Acara',
        description:
          'Buat pengingat acara posyandu yang akan disebar ke kader dan orang tua.',
      },
    ],
  },

  ADMIN: {
    role: 'ADMIN',
    steps: [
      {
        id: 'admin-dashboard-intro',
        routePattern: '/admin/dashboard',
        title: 'Selamat datang Admin',
        description:
          'Dashboard admin untuk kelola data master desa, posyandu, kader, tenaga kesehatan, dan artikel.',
      },
      {
        id: 'admin-dashboard-header',
        routePattern: '/admin/dashboard',
        targetSelector: '[data-tour-id="admin-dashboard-header"]',
        title: 'Ringkasan Admin',
        description:
          'Header dashboard menunjukkan konteks panel dan sapaan pengguna yang sedang login.',
      },
      {
        id: 'admin-dashboard-stats',
        routePattern: '/admin/dashboard',
        targetSelector: '[data-tour-id="admin-stats"]',
        title: 'Statistik Ringkas',
        description:
          'Pantau total desa, posyandu, dan pengguna terdaftar. Klik card untuk masuk ke daftarnya.',
      },
      {
        id: 'admin-dashboard-sidebar',
        routePattern: '/admin/dashboard',
        targetSelector: '[data-tour-id="admin-sidebar"]',
        title: 'Menu Navigasi',
        description:
          'Sidebar berisi shortcut ke semua data master. Klik panah untuk ciutkan jika perlu ruang lebih.',
      },
      {
        id: 'admin-desa-header',
        routePattern: '/admin/dashboard/desa',
        targetSelector: '[data-tour-id="admin-desa-header"]',
        title: 'Kelola Desa',
        description:
          'Halaman ini berisi master data desa. Tambah desa baru atau edit yang sudah ada.',
      },
      {
        id: 'admin-posyandu-header',
        routePattern: '/admin/dashboard/posyandu',
        targetSelector: '[data-tour-id="admin-posyandu-header"]',
        title: 'Kelola Posyandu',
        description:
          'Master data posyandu per desa. Pastikan setiap posyandu punya kader yang aktif.',
      },
      {
        id: 'admin-kader-header',
        routePattern: '/admin/dashboard/kader-posyandu',
        targetSelector: '[data-tour-id="admin-kader-header"]',
        title: 'Kelola Kader Posyandu',
        description:
          'Halaman ini dipakai untuk registrasi, filter status, dan edit data kader posyandu.',
      },
      {
        id: 'admin-tenkes-header',
        routePattern: '/admin/dashboard/tenaga-kesehatan',
        targetSelector: '[data-tour-id="admin-tenkes-header"]',
        title: 'Kelola Tenaga Kesehatan',
        description:
          'Daftar bidan dan tenaga kesehatan dikelola dari halaman ini.',
      },
      {
        id: 'admin-artikel-header',
        routePattern: '/admin/dashboard/artikel',
        targetSelector: '[data-tour-id="admin-artikel-header"]',
        title: 'Kelola Artikel',
        description:
          'Halaman daftar artikel digunakan untuk mengubah atau menghapus konten edukasi.',
      },
      {
        id: 'admin-artikel-baru-header',
        routePattern: '/admin/dashboard/artikel/baru',
        targetSelector: '[data-tour-id="admin-artikel-baru-header"]',
        title: 'Tulis Artikel Baru',
        description:
          'Buat artikel edukasi yang akan dibaca orang tua, kader, dan tenaga kesehatan.',
      },
    ],
  },
};

export function getRoleFlow(role: Role | null): RoleFlow | null {
  if (!role) return null;
  return FLOWS[role] ?? null;
}

export function getFirstStepForPath(
  role: Role | null,
  path: string
): FlowStep | null {
  const flow = getRoleFlow(role);
  if (!flow) return null;
  return flow.steps.find((step) => matchesRoute(step.routePattern, path)) ?? null;
}

export function getNextStep(role: Role | null, currentId: string): FlowStep | null {
  const flow = getRoleFlow(role);
  if (!flow) return null;
  const idx = flow.steps.findIndex((step) => step.id === currentId);
  if (idx === -1 || idx >= flow.steps.length - 1) return null;
  return flow.steps[idx + 1];
}

export function getPreviousStep(
  role: Role | null,
  currentId: string
): FlowStep | null {
  const flow = getRoleFlow(role);
  if (!flow) return null;
  const idx = flow.steps.findIndex((step) => step.id === currentId);
  if (idx <= 0) return null;
  return flow.steps[idx - 1];
}

function toAntdStep(step: FlowStep): TourStepProps {
  return {
    title: step.title,
    description: step.description,
    target: step.targetSelector
      ? () => document.querySelector(step.targetSelector!) as HTMLElement | null
      : null,
  };
}

function matchesRoute(routePattern: string, pathname: string) {
  return Boolean(matchPath({ path: routePattern, end: true }, pathname));
}

/**
 * Build antd Tour steps untuk role + (opsional) filter ke current path.
 * Backward-compatible: tanpa `path`, kembalikan seluruh step role.
 */
export function buildSteps(role: Role | null, path?: string): TourStepProps[] {
  const flow = getRoleFlow(role);
  if (!flow) return [];
  const filtered = path
    ? flow.steps.filter((step) => matchesRoute(step.routePattern, path))
    : flow.steps;
  return filtered.map(toAntdStep);
}
