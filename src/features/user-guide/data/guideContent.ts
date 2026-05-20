import type { GuideRole } from '../types';

export const guideContent: GuideRole[] = [
  {
    id: 'ADMIN',
    title: 'Admin',
    summary: 'Mengelola data master, konten, dan konfigurasi operasional aplikasi.',
    sections: [
      {
        id: 'admin-dashboard-ringkas',
        title: 'Tinjau ringkasan dashboard',
        route: '/admin/dashboard',
        screenshotFile: 'admin-dashboard-home.png',
        steps: [
          'Buka menu Admin lalu masuk ke dashboard utama.',
          'Periksa kartu ringkasan untuk melihat status data terbaru.',
        ],
        expectedResult:
          'Dashboard menampilkan ringkasan operasional dan akses cepat ke area administrasi.',
        tips: [
          'Gunakan dashboard sebagai titik awal sebelum berpindah ke modul lain.',
          'Perbarui data master terlebih dahulu jika angka ringkasan terlihat tidak sesuai.',
        ],
      },
      {
        id: 'admin-artikel-baru',
        title: 'Buat artikel baru',
        route: '/admin/dashboard/artikel/baru',
        screenshotFile: 'admin-artikel-baru.png',
        steps: [
          'Buka menu Artikel lalu pilih aksi untuk membuat artikel baru.',
          'Isi judul, konten, dan informasi pendukung sebelum menyimpan.',
        ],
        expectedResult:
          'Form artikel baru terbuka dan admin dapat menyimpan konten untuk publikasi.',
        tips: [
          'Pakai judul yang singkat dan jelas agar mudah dibaca di beranda.',
          'Pastikan isi artikel relevan dengan kebutuhan pengguna desa, kader, dan orang tua.',
        ],
      },
    ],
  },
  {
    id: 'DESA',
    title: 'Desa',
    summary: 'Memantau beranda desa dan informasi layanan yang ditampilkan untuk masyarakat.',
    sections: [
      {
        id: 'desa-beranda',
        title: 'Lihat beranda desa',
        route: '/desa/beranda',
        screenshotFile: 'desa-beranda.png',
        steps: [
          'Masuk ke halaman beranda desa dari navigasi yang tersedia.',
          'Tinjau informasi layanan, pengumuman, dan ringkasan aktivitas yang tampil.',
        ],
        expectedResult:
          'Beranda desa terbuka dengan informasi ringkas yang siap dipantau oleh petugas desa.',
        tips: [
          'Cek pengumuman terbaru sebelum menindaklanjuti kebutuhan warga.',
          'Pastikan data yang tampil konsisten dengan informasi operasional di lapangan.',
        ],
      },
    ],
  },
  {
    id: 'KADER_POSYANDU',
    title: 'Kader Posyandu',
    summary: 'Mencatat data balita, mengelola data orang tua, dan menyusun laporan bulanan.',
    sections: [
      {
        id: 'kader-balita',
        title: 'Kelola daftar balita',
        route: '/kader/balita',
        screenshotFile: 'kader-balita.png',
        steps: [
          'Buka halaman daftar balita untuk melihat data yang sudah terdaftar.',
          'Pilih salah satu entri untuk meninjau atau memperbarui detailnya.',
        ],
        expectedResult: 'Daftar balita tampil lengkap dan kader dapat melanjutkan ke detail data.',
        tips: [
          'Periksa identitas anak sebelum menyimpan perubahan.',
          'Gunakan pencarian daftar jika jumlah data balita sudah banyak.',
        ],
      },
      {
        id: 'kader-orangtua',
        title: 'Kelola data orang tua',
        route: '/kader/orangtua',
        screenshotFile: 'kader-orangtua.png',
        steps: [
          'Masuk ke halaman data orang tua dari menu Kader.',
          'Tinjau akun orang tua yang sudah terhubung dengan data balita.',
        ],
        expectedResult:
          'Data orang tua terlihat dan kader dapat memeriksa keterhubungannya dengan balita.',
        tips: [
          'Pastikan nomor kontak tetap aktif agar komunikasi berjalan lancar.',
          'Cocokkan data orang tua dengan keluarga yang benar sebelum mengubah isian.',
        ],
      },
      {
        id: 'kader-laporan',
        title: 'Susun laporan bulanan',
        route: '/kader/laporan',
        screenshotFile: 'kader-laporan.png',
        steps: [
          'Buka halaman laporan bulanan untuk melihat rekap kegiatan.',
          'Lengkapi data yang dibutuhkan sebelum mengirim laporan.',
        ],
        expectedResult:
          'Laporan bulanan kader siap direkap dan disimpan untuk monitoring berikutnya.',
        tips: [
          'Isi laporan setelah seluruh kegiatan posyandu selesai dicatat.',
          'Periksa kembali angka rekap sebelum mengirimkan laporan.',
        ],
      },
    ],
  },
  {
    id: 'TENAGA_KESEHATAN',
    title: 'Tenaga Kesehatan',
    summary: 'Berinteraksi di forum dan meninjau detail balita untuk dukungan tindak lanjut.',
    sections: [
      {
        id: 'tenkes-forum',
        title: 'Ikuti forum tenaga kesehatan',
        route: '/tenkes/forum',
        screenshotFile: 'tenkes-forum.png',
        steps: [
          'Buka forum tenaga kesehatan dari navigasi utama.',
          'Pilih diskusi yang relevan untuk membaca atau menanggapi percakapan.',
        ],
        expectedResult:
          'Forum tenaga kesehatan tampil dan siap digunakan untuk diskusi serta koordinasi.',
        tips: [
          'Gunakan forum untuk mempercepat klarifikasi kasus yang membutuhkan tindak lanjut.',
          'Jaga jawaban tetap ringkas dan berbasis data.',
        ],
      },
      {
        id: 'tenkes-balita-detail',
        title: 'Buka detail balita',
        route: '/tenkes/balita/:id',
        screenshotFile: 'tenkes-balita-detail.png',
        steps: [
          'Masuk ke halaman detail balita dari daftar atau tautan forum.',
          'Tinjau informasi yang dibutuhkan untuk mendukung penanganan lanjutan.',
        ],
        expectedResult:
          'Detail balita terbuka sehingga tenaga kesehatan dapat meninjau data pendukung.',
        tips: [
          'Fokus pada informasi yang paling relevan untuk tindak lanjut medis.',
          'Gunakan detail balita sebagai referensi sebelum menulis balasan forum.',
        ],
      },
    ],
  },
  {
    id: 'ORANG_TUA',
    title: 'Orang Tua',
    summary: 'Memantau data balita, mengikuti forum, dan membuka detail diskusi atau anak.',
    sections: [
      {
        id: 'orangtua-balita',
        title: 'Lihat data balita',
        route: '/orangtua/balita',
        screenshotFile: 'orangtua-balita.png',
        steps: [
          'Buka halaman balita milik orang tua yang sedang login.',
          'Tinjau ringkasan data tumbuh kembang yang tersedia di halaman tersebut.',
        ],
        expectedResult:
          'Daftar atau ringkasan balita tampil sehingga orang tua dapat memantau data anak.',
        tips: [
          'Periksa apakah semua data anak sudah sesuai dengan kondisi terbaru.',
          'Gunakan halaman ini sebelum berpindah ke forum atau detail anak.',
        ],
      },
      {
        id: 'orangtua-forum',
        title: 'Masuk forum orang tua',
        route: '/orangtua/forum',
        screenshotFile: 'orangtua-forum.png',
        steps: [
          'Buka halaman forum orang tua dari menu utama.',
          'Cari topik diskusi yang sesuai dengan kebutuhan atau pertanyaan Anda.',
        ],
        expectedResult:
          'Forum orang tua terbuka dan siap dipakai untuk membaca atau membuat diskusi.',
        tips: [
          'Gunakan forum untuk bertanya sebelum menghubungi petugas secara langsung.',
          'Periksa topik lama agar pertanyaan yang sama tidak diajukan berulang.',
        ],
      },
      {
        id: 'orangtua-forum-detail',
        title: 'Buka detail forum',
        route: '/orangtua/forum/:id',
        screenshotFile: 'orangtua-forum-detail.png',
        steps: [
          'Pilih salah satu topik forum untuk melihat isi percakapan lengkap.',
          'Baca jawaban yang sudah tersedia sebelum menambahkan balasan baru.',
        ],
        expectedResult:
          'Halaman detail forum menampilkan seluruh percakapan pada topik yang dipilih.',
        tips: [
          'Baca seluruh konteks diskusi agar balasan tetap relevan.',
          'Gunakan detail forum untuk menindaklanjuti jawaban yang sebelumnya diberikan.',
        ],
      },
      {
        id: 'orangtua-balita-detail',
        title: 'Buka detail balita',
        route: '/orangtua/balita/:id',
        screenshotFile: 'orangtua-balita-detail.png',
        steps: [
          'Buka detail salah satu balita dari halaman daftar anak.',
          'Tinjau informasi detail untuk memastikan data anak yang tampil sudah benar.',
        ],
        expectedResult:
          'Halaman detail balita terbuka dan orang tua dapat memeriksa data anak secara lengkap.',
        tips: [
          'Cek detail balita setelah ada pembaruan data dari kader atau tenaga kesehatan.',
          'Gunakan halaman ini untuk memastikan identitas dan informasi anak konsisten.',
        ],
      },
    ],
  },
];
