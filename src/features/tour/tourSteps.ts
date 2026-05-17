import type { TourStepProps } from 'antd';
import type { Role } from '../../types';

/**
 * Tour step config per role.
 * Pakai data-tour-id selector untuk find target di DOM, supaya tidak perlu lifting refs.
 *
 * Setiap step:
 *   - title, description (Indonesian)
 *   - target: () => document.querySelector('[data-tour-id="X"]')
 *   - placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
 */

type StepFn = () => Omit<TourStepProps, 'target'> & {
  targetSelector?: string | null;
};

const stepWithSelector = (
  targetSelector: string | null,
  step: Omit<TourStepProps, 'target'>
): TourStepProps => ({
  ...step,
  target: targetSelector
    ? () => document.querySelector(targetSelector) as HTMLElement | null
    : null,
});

export function buildSteps(role: Role | null): TourStepProps[] {
  if (!role) return [];

  switch (role) {
    case 'KADER_POSYANDU':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang di Mode Posyandu',
          description:
            'Halaman ini membantu Anda mencatat pengukuran balita dengan cepat saat hari posyandu. Mari kita lihat fitur utamanya.',
        }),
        stepWithSelector('[data-tour-id="kader-search"]', {
          title: 'Cari Balita',
          description: 'Ketik nama balita untuk filter daftar dengan cepat.',
        }),
        stepWithSelector('[data-tour-id="kader-filter"]', {
          title: 'Filter Status',
          description:
            'Pilih "Belum" untuk lihat balita yang belum diukur, atau "Perhatian" untuk yang butuh tindakan.',
        }),
        stepWithSelector('[data-tour-id="kader-akun-ortu"]', {
          title: 'Akun Orang Tua',
          description:
            'Setujui pendaftaran orang tua dan kelola data akun di sini. Badge angka menunjukkan jumlah yang menunggu persetujuan.',
        }),
        stepWithSelector('[data-tour-id="kader-tambah"]', {
          title: 'Tambah Balita Baru',
          description: 'Klik untuk daftarkan balita baru yang belum ada di sistem.',
        }),
      ];

    case 'ORANG_TUA':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Orang Tua',
          description:
            'Pantau pertumbuhan anak Anda dan ajukan pertanyaan ke tenaga kesehatan dari aplikasi ini.',
        }),
        stepWithSelector('[data-tour-id="ot-tambah-anak"]', {
          title: 'Tambah Anak',
          description: 'Daftarkan anak Anda di sini agar bisa dipantau pertumbuhannya.',
        }),
        stepWithSelector('[data-tour-id="ot-forum"]', {
          title: 'Forum Tanya Jawab',
          description:
            'Tanyakan apa pun tentang gizi atau tumbuh kembang anak ke tenaga kesehatan.',
        }),
        stepWithSelector('[data-tour-id="ot-artikel"]', {
          title: 'Artikel Edukasi',
          description: 'Baca artikel pilihan tentang gizi dan pengasuhan balita.',
        }),
      ];

    case 'TENAGA_KESEHATAN':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Tenaga Kesehatan',
          description:
            'Halaman forum berisi pertanyaan dari orang tua. Anda bisa menjawab dan memberi saran kesehatan.',
        }),
      ];

    case 'DESA':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Pemerintah Desa',
          description:
            'Pantau rekap gizi balita se-desa, ekspor laporan, dan kelola acara posyandu.',
        }),
        stepWithSelector('[data-tour-id="desa-acara"]', {
          title: 'Kelola Acara',
          description: 'Buat pengingat acara posyandu yang akan disebar ke kader dan orang tua.',
        }),
      ];

    case 'ADMIN':
      return [
        stepWithSelector(null, {
          title: 'Selamat datang Admin',
          description:
            'Dashboard admin untuk kelola data master desa, posyandu, kader, tenaga kesehatan, dan artikel.',
        }),
        stepWithSelector('[data-tour-id="admin-stats"]', {
          title: 'Statistik Ringkas',
          description:
            'Pantau total desa, posyandu, dan pengguna terdaftar. Klik card untuk masuk ke daftarnya.',
        }),
        stepWithSelector('[data-tour-id="admin-sidebar"]', {
          title: 'Menu Navigasi',
          description:
            'Sidebar berisi shortcut ke semua data master. Klik panah untuk ciutkan jika perlu ruang lebih.',
        }),
      ];

    default:
      return [];
  }
}
