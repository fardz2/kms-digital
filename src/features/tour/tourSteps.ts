import type { TourStepProps } from 'antd';
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
        id: 'kader-tambah',
        routePattern: '/kader/balita',
        targetSelector: '[data-tour-id="kader-tambah"]',
        title: 'Tambah Balita Baru',
        description: 'Klik untuk daftarkan balita baru yang belum ada di sistem.',
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
        title: 'Kelola Desa',
        description:
          'Halaman ini berisi master data desa. Tambah desa baru atau edit yang sudah ada.',
      },
      {
        id: 'admin-posyandu-header',
        routePattern: '/admin/dashboard/posyandu',
        title: 'Kelola Posyandu',
        description:
          'Master data posyandu per desa. Pastikan setiap posyandu punya kader yang aktif.',
      },
      {
        id: 'admin-artikel-baru-header',
        routePattern: '/admin/dashboard/artikel/baru',
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
  return flow.steps.find((step) => step.routePattern === path) ?? null;
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

/**
 * Build antd Tour steps untuk role + (opsional) filter ke current path.
 * Backward-compatible: tanpa `path`, kembalikan seluruh step role.
 */
export function buildSteps(role: Role | null, path?: string): TourStepProps[] {
  const flow = getRoleFlow(role);
  if (!flow) return [];
  const filtered = path
    ? flow.steps.filter((step) => step.routePattern === path)
    : flow.steps;
  return filtered.map(toAntdStep);
}
