import type { GuideSection } from '../types';

export type GuideShotKind =
  | 'page'
  | 'list'
  | 'create'
  | 'edit'
  | 'delete'
  | 'logout'
  | 'detail'
  | 'reply'
  | 'filter'
  | 'tab'
  | 'month'
  | 'export'
  | 'fill'
  | 'publish'
  | 'history'
  | 'summary';

export type GuideShot = {
  id: string;
  kind: GuideShotKind;
  title: string;
  description: string;
  route?: string;
  focusSelectors?: string[];
};

const shot = (
  id: string,
  kind: GuideShotKind,
  title: string,
  description: string,
  focusSelectors: string[] = []
): GuideShot => ({
  id,
  kind,
  title,
  description,
  focusSelectors,
});

const DEFAULT_SHOTS: GuideShot[] = [
  shot(
    'page',
    'page',
    'Halaman bersih',
    'Tampilan awal halaman tanpa modal atau dialog. Fokuskan perhatian pada struktur utama dan daftar data yang terlihat.'
  ),
];

const SECTION_SHOTS: Record<string, GuideShot[]> = {
  'admin-dashboard-ringkas': [
    shot(
      'page',
      'page',
      'Dashboard bersih',
      'Dashboard admin tampil tanpa dialog. Ringkasan, statistik, dan sidebar harus terlihat jelas.',
      ['[data-tour-id="admin-dashboard-header"]', '[data-tour-id="admin-stats"]']
    ),
    shot(
      'logout',
      'logout',
      'Keluar akun admin',
      'Tampilkan posisi tombol keluar di sidebar agar user tahu di mana proses logout dimulai.',
      ['[data-tour-id="admin-sidebar"] button:has-text("Keluar")']
    ),
  ],
  'admin-desa': [
    shot(
      'page',
      'page',
      'Halaman desa bersih',
      'Halaman Desa terbuka tanpa modal. Header, statistik, dan tabel daftar desa tampil di layar.',
      ['[data-tour-id="admin-desa-header"]', 'table']
    ),
    shot(
      'list',
      'list',
      'Daftar desa',
      'Sorot tabel agar user melihat daftar desa yang sudah tersimpan.',
      ['table']
    ),
    shot(
      'create',
      'create',
      'Tambah desa',
      'Buka modal Tambah Desa lalu isi data contoh supaya field input terlihat jelas.',
      ['button:has-text("Tambah Desa")', 'form[name="tambah_desa"]']
    ),
    shot(
      'delete',
      'delete',
      'Hapus desa',
      'Tampilkan dialog konfirmasi saat tombol Hapus ditekan pada salah satu baris.',
      ['button:has-text("Hapus")', '[role="dialog"]']
    ),
  ],
  'admin-posyandu': [
    shot(
      'page',
      'page',
      'Halaman posyandu bersih',
      'Halaman Posyandu terbuka lengkap dengan statistik dan tabel data.',
      ['[data-tour-id="admin-posyandu-header"]', 'table']
    ),
    shot(
      'list',
      'list',
      'Daftar posyandu',
      'Fokus pada tabel daftar posyandu yang sudah terhubung dengan desa.',
      ['table']
    ),
    shot(
      'create',
      'create',
      'Tambah posyandu',
      'Buka form tambah posyandu agar field desa, nama, dan alamat terlihat.',
      ['button:has-text("Tambah Posyandu")', 'form[name="input_posyandu"]']
    ),
    shot(
      'edit',
      'edit',
      'Ubah posyandu',
      'Buka modal edit untuk memperlihatkan form yang sudah terisi data lama.',
      ['button:has-text("Edit")', '[role="dialog"]']
    ),
    shot(
      'delete',
      'delete',
      'Hapus posyandu',
      'Tampilkan dialog konfirmasi hapus untuk satu baris data posyandu.',
      ['button:has-text("Hapus")', '[role="dialog"]']
    ),
  ],
  'admin-kader-posyandu': [
    shot(
      'page',
      'page',
      'Halaman kader bersih',
      'Halaman Kader Posyandu terbuka dengan statistik dan tabel data.',
      ['[data-tour-id="admin-kader-header"]', 'table']
    ),
    shot(
      'list',
      'list',
      'Daftar kader',
      'Sorot tabel untuk menunjukkan akun kader yang sudah tersimpan.',
      ['table']
    ),
    shot(
      'create',
      'create',
      'Registrasi kader',
      'Buka form registrasi dan isi contoh data agar user melihat field yang dipakai.',
      ['button:has-text("Tambah Kader Posyandu")', 'form[name="input_kader"]']
    ),
    shot(
      'edit',
      'edit',
      'Ubah kader',
      'Buka form edit supaya user melihat data lama yang bisa diperbarui.',
      ['button:has-text("Edit")', '[role="dialog"]']
    ),
    shot(
      'delete',
      'delete',
      'Hapus kader',
      'Tampilkan konfirmasi hapus sebelum akun kader dihapus.',
      ['button:has-text("Hapus")', '[role="dialog"]']
    ),
  ],
  'admin-tenaga-kesehatan': [
    shot(
      'page',
      'page',
      'Halaman nakes bersih',
      'Halaman Tenaga Kesehatan terbuka tanpa dialog tambahan.',
      ['[data-tour-id="admin-tenkes-header"]', 'table']
    ),
    shot(
      'list',
      'list',
      'Daftar tenaga kesehatan',
      'Sorot tabel agar user melihat seluruh akun nakes yang tersedia.',
      ['table']
    ),
    shot(
      'create',
      'create',
      'Tambah tenaga kesehatan',
      'Buka form registrasi lalu isi nama, email, password, dan desa.',
      ['button:has-text("Tambah Tenaga Kesehatan")', 'form[name="register_nakes"]']
    ),
    shot(
      'delete',
      'delete',
      'Hapus tenaga kesehatan',
      'Tampilkan dialog hapus untuk memperlihatkan langkah konfirmasi.',
      ['button:has-text("Hapus")', '[role="dialog"]']
    ),
  ],
  'admin-artikel': [
    shot(
      'page',
      'page',
      'Halaman artikel bersih',
      'Halaman daftar artikel terbuka dengan statistik dan tombol tulis artikel.',
      ['[data-tour-id="admin-artikel-header"]', '[data-tour-id="admin-artikel-table"]']
    ),
    shot(
      'list',
      'list',
      'Daftar artikel',
      'Fokus pada tabel artikel agar user paham daftar konten yang sudah terbit.',
      ['[data-tour-id="admin-artikel-table"] table']
    ),
    shot(
      'edit',
      'edit',
      'Ubah artikel',
      'Buka modal edit agar field judul, kategori, dan konten yang lama terlihat.',
      [
        '[data-tour-id="admin-artikel-table"] [data-tour-id="admin-artikel-edit-button"]',
        '[role="dialog"]',
      ]
    ),
    shot(
      'delete',
      'delete',
      'Hapus artikel',
      'Tampilkan konfirmasi hapus sebelum artikel dihapus dari daftar.',
      [
        '[data-tour-id="admin-artikel-table"] [data-tour-id="admin-artikel-delete-button"]',
        '[role="dialog"]',
      ]
    ),
    shot(
      'create',
      'create',
      'Buat artikel baru',
      'Arahkan user ke form artikel baru untuk menulis konten edukasi.',
      ['[data-tour-id="admin-artikel-new-button"]', 'a[href*="/admin/dashboard/artikel/baru"]']
    ),
  ],
  'admin-artikel-baru': [
    shot(
      'page',
      'page',
      'Form artikel bersih',
      'Form artikel baru terbuka tanpa gangguan dan siap diisi.',
      ['[data-tour-id="admin-artikel-baru-header"]', 'form[name="input_artikel"]']
    ),
    shot(
      'fill',
      'fill',
      'Isi artikel',
      'Isi kategori, judul, penulis, cover, dan konten agar form terlihat seperti saat dipakai.',
      ['form[name="input_artikel"]']
    ),
    shot(
      'publish',
      'publish',
      'Siap terbit',
      'Tampilkan form yang sudah lengkap sebelum tombol Terbitkan Artikel ditekan.',
      ['button:has-text("Terbitkan Artikel")']
    ),
  ],
  'desa-beranda': [
    shot(
      'page',
      'page',
      'Beranda desa bersih',
      'Halaman desa terbuka dengan header, ekspor data, dan laporan yang siap dibaca.',
      ['[data-tour-id="desa-header"]', '[data-tour-id="desa-export"]']
    ),
    shot(
      'export',
      'export',
      'Ekspor data',
      'Sorot bagian ekspor CSV dan PDF agar user paham alur unduh laporan.',
      ['[data-tour-id="desa-export"]']
    ),
    shot(
      'summary',
      'summary',
      'Ringkasan laporan',
      'Fokus pada kartu statistik agar user melihat rekap gizi dan progres per posyandu.',
      ['[data-tour-id="desa-laporan"]']
    ),
    shot(
      'create',
      'create',
      'Tambah acara',
      'Buka form acara dan isi judul, deskripsi, dan tanggal contoh.',
      ['[data-tour-id="desa-acara"] form', 'button:has-text("Simpan Acara")']
    ),
    shot(
      'delete',
      'delete',
      'Hapus acara',
      'Tampilkan dialog konfirmasi hapus pada salah satu acara.',
      ['[data-tour-id="desa-acara"] button:has-text("Hapus")', '[role="dialog"]']
    ),
    shot(
      'logout',
      'logout',
      'Keluar akun desa',
      'Perlihatkan tombol keluar di navbar agar user tahu lokasi logout.',
      ['button:has-text("Keluar")']
    ),
  ],
  'kader-balita': [
    shot(
      'page',
      'page',
      'Mode posyandu bersih',
      'Halaman kerja kader terbuka dengan progres, pencarian, dan filter yang siap dipakai.',
      ['[data-tour-id="kader-progress"]', '[data-tour-id="kader-search"]']
    ),
    shot(
      'list',
      'list',
      'Daftar balita',
      'Sorot daftar balita yang terurut agar user melihat data yang akan dikerjakan.',
      ['[data-tour-id="kader-search"]', '[data-tour-id="kader-filter"]']
    ),
    shot(
      'filter',
      'filter',
      'Filter balita',
      'Tampilkan pilihan Semua, Belum, dan Perhatian untuk memudahkan penyaringan data.',
      ['[data-tour-id="kader-filter"]']
    ),
    shot(
      'create',
      'create',
      'Tambah balita baru',
      'Buka form tambah balita supaya user melihat langkah pendaftaran anak baru.',
      ['button:has-text("Tambah Balita Baru")', '[role="dialog"]']
    ),
    shot(
      'logout',
      'logout',
      'Keluar akun kader',
      'Perlihatkan tombol keluar pada header posyandu.',
      ['button:has-text("Keluar")']
    ),
  ],
  'kader-balita-detail': [
    shot(
      'page',
      'page',
      'Detail balita bersih',
      'Halaman detail balita terbuka dengan riwayat pengukuran yang siap ditinjau.',
      ['[data-tour-id="anak-detail-riwayat"]', 'button:has-text("+ Ukur Pengukuran Baru")']
    ),
    shot(
      'history',
      'history',
      'Riwayat pengukuran',
      'Sorot kartu pengukuran agar user melihat data lama dan status gizi.',
      ['[data-tour-id="anak-detail-riwayat"]']
    ),
    shot(
      'edit',
      'edit',
      'Ubah pengukuran',
      'Buka form edit pengukuran supaya user melihat data yang bisa diperbaiki.',
      ['button:has-text("Ubah")', '[role="dialog"]']
    ),
    shot(
      'delete',
      'delete',
      'Hapus pengukuran',
      'Tampilkan dialog hapus untuk menjelaskan konfirmasi penghapusan data.',
      ['button:has-text("Hapus")', '[role="dialog"]']
    ),
  ],
  'kader-orangtua': [
    shot(
      'page',
      'page',
      'Akun orang tua bersih',
      'Halaman akun orang tua terbuka pada tab persetujuan dengan header yang jelas.',
      ['[data-tour-id="kader-orangtua-header"]', '[data-tour-id="kader-akunortu-tabs"]']
    ),
    shot(
      'tab',
      'tab',
      'Pindah ke daftar aktif',
      'Gunakan tab Daftar Aktif agar user melihat akun orang tua yang sudah disetujui.',
      ['[data-tour-id="kader-akunortu-tabs"]']
    ),
    shot(
      'list',
      'list',
      'Daftar orang tua aktif',
      'Sorot tabel aktif agar user melihat daftar akun yang bisa diubah atau dihapus.',
      ['[data-tour-id="kader-akunortu-table"] table']
    ),
    shot(
      'create',
      'create',
      'Tambah orang tua',
      'Buka form tambah orang tua dan isi contoh data agar flow pendaftaran jelas.',
      ['button:has-text("Tambah Orang Tua")', '[role="dialog"]']
    ),
    shot(
      'edit',
      'edit',
      'Ubah orang tua',
      'Buka form edit untuk menunjukkan data yang sudah terisi sebelumnya.',
      ['button:has-text("Ubah")', '[role="dialog"]']
    ),
    shot(
      'delete',
      'delete',
      'Hapus orang tua',
      'Tampilkan dialog konfirmasi hapus pada salah satu baris aktif.',
      ['button:has-text("Hapus")', '[role="dialog"]']
    ),
    shot(
      'logout',
      'logout',
      'Keluar akun kader',
      'Perlihatkan tombol keluar di header halaman kader.',
      ['button:has-text("Keluar")']
    ),
  ],
  'kader-laporan': [
    shot(
      'page',
      'page',
      'Laporan bulanan bersih',
      'Halaman laporan bulanan terbuka dengan ringkasan yang mudah dibaca.',
      ['[data-tour-id="kader-laporan-header"]', '[data-tour-id="kader-laporan-stats"]']
    ),
    shot(
      'month',
      'month',
      'Pilih bulan laporan',
      'Sorot month picker agar user tahu cara mengganti periode laporan.',
      ['[data-tour-id="kader-laporan-picker"]']
    ),
    shot(
      'summary',
      'summary',
      'Ringkasan laporan',
      'Fokus pada stat card dan progres agar user membaca hasil rekap bulan ini.',
      ['[data-tour-id="kader-laporan-stats"]']
    ),
  ],
  'tenkes-forum': [
    shot(
      'page',
      'page',
      'Forum nakes bersih',
      'Forum tenaga kesehatan terbuka dengan daftar pertanyaan yang siap dijawab.',
      ['[data-tour-id="tenkes-forum-list"]']
    ),
    shot(
      'list',
      'list',
      'Daftar pertanyaan',
      'Sorot daftar thread agar user langsung melihat pertanyaan masuk.',
      ['[data-tour-id="tenkes-forum-list"]']
    ),
    shot(
      'logout',
      'logout',
      'Keluar akun nakes',
      'Perlihatkan tombol keluar di navbar aplikasi.',
      ['button:has-text("Keluar")']
    ),
  ],
  'tenkes-balita-detail': [
    shot(
      'page',
      'page',
      'Detail forum bersih',
      'Halaman detail forum terbuka dan form komentar terlihat jelas.',
      ['[data-tour-id="tenkes-forum-detail-post"]', '[data-tour-id="tenkes-forum-detail-form"]']
    ),
    shot(
      'detail',
      'detail',
      'Buka detail forum',
      'Tampilkan konteks pertanyaan sebelum jawaban dikirim.',
      ['[data-tour-id="tenkes-forum-detail-post"]']
    ),
    shot(
      'reply',
      'reply',
      'Balas pertanyaan',
      'Sorot form komentar agar user tahu lokasi untuk menulis jawaban.',
      ['[data-tour-id="tenkes-forum-detail-form"]']
    ),
    shot(
      'history',
      'history',
      'Lihat komentar',
      'Sorot daftar komentar agar user melihat diskusi yang sudah berjalan.',
      ['[data-tour-id="tenkes-forum-detail-form"]']
    ),
  ],
  'orangtua-balita': [
    shot(
      'page',
      'page',
      'Beranda anak bersih',
      'Halaman orang tua terbuka dengan kartu anak dan quick action yang terlihat jelas.',
      ['[data-tour-id="ot-home-anak-area"]', '[data-tour-id="ot-tambah-anak"]']
    ),
    shot(
      'list',
      'list',
      'Daftar anak',
      'Sorot kartu anak agar user memahami daftar anak yang terdaftar.',
      ['[data-tour-id="ot-home-anak-area"]']
    ),
    shot(
      'create',
      'create',
      'Tambah anak',
      'Buka form tambah anak dan isi contoh data agar alur pendaftaran terlihat.',
      ['[data-tour-id="ot-tambah-anak"]', '[role="dialog"]']
    ),
    shot(
      'detail',
      'detail',
      'Buka detail anak',
      'Tunjukkan lokasi untuk membuka detail balita dari halaman daftar.',
      ['[data-tour-id="ot-home-anak-area"]']
    ),
    shot(
      'logout',
      'logout',
      'Keluar akun orang tua',
      'Perlihatkan tombol keluar di navbar.',
      ['button:has-text("Keluar")']
    ),
  ],
  'orangtua-forum': [
    shot(
      'page',
      'page',
      'Forum orang tua bersih',
      'Forum orang tua terbuka dengan tab, daftar diskusi, dan tombol tulis pertanyaan.',
      ['[data-tour-id="ot-forum-header"]', '[data-tour-id="ot-forum-list"]']
    ),
    shot(
      'list',
      'list',
      'Daftar forum',
      'Sorot daftar thread agar user melihat semua diskusi yang tersedia.',
      ['[data-tour-id="ot-forum-list"]']
    ),
    shot(
      'tab',
      'tab',
      'Filter forum',
      'Tampilkan tab Semua dan Punya Saya untuk membedakan daftar publik dan milik sendiri.',
      ['[data-tour-id="ot-forum-tabs"]']
    ),
    shot(
      'create',
      'create',
      'Tulis pertanyaan',
      'Buka form pertanyaan agar user melihat judul dan isi pertanyaan.',
      ['button:has-text("Tulis Pertanyaan")', '[role="dialog"]']
    ),
    shot(
      'detail',
      'detail',
      'Buka detail forum',
      'Tampilkan halaman detail diskusi untuk membaca jawaban dan balasan.',
      ['[data-tour-id="ot-forum-detail-form"]']
    ),
    shot(
      'logout',
      'logout',
      'Keluar akun orang tua',
      'Perlihatkan tombol keluar di navbar.',
      ['button:has-text("Keluar")']
    ),
  ],
  'orangtua-forum-detail': [
    shot(
      'page',
      'page',
      'Detail forum bersih',
      'Halaman detail forum terbuka dan form komentar terlihat jelas.',
      ['[data-tour-id="ot-forum-detail-form"]']
    ),
    shot(
      'reply',
      'reply',
      'Balas diskusi',
      'Sorot form komentar agar user tahu cara menambahkan balasan.',
      ['[data-tour-id="ot-forum-detail-form"]']
    ),
    shot(
      'logout',
      'logout',
      'Keluar akun orang tua',
      'Perlihatkan tombol keluar di navbar.',
      ['button:has-text("Keluar")']
    ),
  ],
  'orangtua-balita-detail': [
    shot(
      'page',
      'page',
      'Detail balita bersih',
      'Halaman detail balita terbuka sebelum riwayat dan grafik ditinjau.',
      ['[data-tour-id="anak-detail-riwayat"]', '[data-tour-id="anak-detail-chart"]']
    ),
    shot(
      'history',
      'history',
      'Riwayat balita',
      'Sorot kartu pengukuran dan grafik WHO untuk meninjau perkembangan anak.',
      ['[data-tour-id="anak-detail-riwayat"]', '[data-tour-id="anak-detail-chart"]']
    ),
  ],
};

export function getSectionShots(sectionId: string): GuideShot[] {
  return SECTION_SHOTS[sectionId] ?? DEFAULT_SHOTS;
}

export function getShotFileName(section: GuideSection, shot: GuideShot, index: number): string {
  if (index === 0) return section.screenshotFile;
  const base = section.screenshotFile.replace(/\.png$/i, '');
  return `${base}-${shot.id}.png`;
}
