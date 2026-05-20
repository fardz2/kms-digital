import type { GuideRole } from '../types';

export const guideContent: GuideRole[] = [
  {
    id: 'ADMIN',
    title: 'Admin',
    summary: 'Mengelola data master, konten, dan konfigurasi operasional aplikasi.',
    accentColor: '#1D4ED8',
    sections: [
      {
        id: 'admin-dashboard-ringkas',
        title: 'Tinjau ringkasan dashboard',
        route: '/admin/dashboard',
        screenshotFile: 'admin-dashboard-home.png',
        purpose: 'Memulai pemantauan operasional dari ringkasan utama.',
        steps: [
          {
            id: 'open-admin-dashboard',
            label: 'Buka dashboard',
            action: 'Buka menu Admin lalu masuk ke dashboard utama.',
            result: 'Halaman dashboard utama terbuka.',
          },
          {
            id: 'review-summary-cards',
            label: 'Tinjau ringkasan',
            action: 'Periksa kartu ringkasan untuk melihat status data terbaru.',
            result: 'Status data terbaru terlihat pada kartu ringkasan.',
          },
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
        purpose: 'Membuat konten baru untuk publikasi aplikasi.',
        steps: [
          {
            id: 'open-new-article-form',
            label: 'Buka form artikel',
            action: 'Buka menu Artikel lalu pilih aksi untuk membuat artikel baru.',
            result: 'Form artikel baru terbuka.',
          },
          {
            id: 'fill-article-fields',
            label: 'Isi detail artikel',
            action: 'Isi judul, konten, dan informasi pendukung sebelum menyimpan.',
            result: 'Detail artikel siap disimpan.',
          },
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
    accentColor: '#0F766E',
    sections: [
      {
        id: 'desa-beranda',
        title: 'Lihat beranda desa',
        route: '/desa/beranda',
        screenshotFile: 'desa-beranda.png',
        purpose: 'Meninjau informasi layanan yang tampil untuk warga.',
        steps: [
          {
            id: 'open-village-home',
            label: 'Buka beranda',
            action: 'Masuk ke halaman beranda desa dari navigasi yang tersedia.',
            result: 'Halaman beranda desa tampil.',
          },
          {
            id: 'review-village-info',
            label: 'Tinjau informasi',
            action: 'Tinjau informasi layanan, pengumuman, dan ringkasan aktivitas yang tampil.',
            result: 'Informasi layanan dan ringkasan aktivitas terlihat jelas.',
          },
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
    accentColor: '#B45309',
    sections: [
      {
        id: 'kader-balita',
        title: 'Kelola daftar balita',
        route: '/kader/balita',
        screenshotFile: 'kader-balita.png',
        purpose: 'Memeriksa dan memperbarui daftar balita terdaftar.',
        steps: [
          {
            id: 'open-child-list',
            label: 'Buka daftar balita',
            action: 'Buka halaman daftar balita untuk melihat data yang sudah terdaftar.',
            result: 'Daftar balita tampil di layar.',
          },
          {
            id: 'open-child-detail',
            label: 'Tinjau entri',
            action: 'Pilih salah satu entri untuk meninjau atau memperbarui detailnya.',
            result: 'Detail balita dapat ditinjau atau diperbarui.',
          },
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
        purpose: 'Memastikan data orang tua terhubung dengan balita.',
        steps: [
          {
            id: 'open-parent-data',
            label: 'Buka data orang tua',
            action: 'Masuk ke halaman data orang tua dari menu Kader.',
            result: 'Halaman data orang tua terbuka.',
          },
          {
            id: 'review-parent-account',
            label: 'Tinjau akun',
            action: 'Tinjau akun orang tua yang sudah terhubung dengan data balita.',
            result: 'Keterhubungan akun orang tua dengan balita terlihat.',
          },
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
        purpose: 'Menyusun rekap kegiatan posyandu bulanan.',
        steps: [
          {
            id: 'open-monthly-report',
            label: 'Buka laporan bulanan',
            action: 'Buka halaman laporan bulanan untuk melihat rekap kegiatan.',
            result: 'Rekap kegiatan bulanan tampil.',
          },
          {
            id: 'complete-report-data',
            label: 'Lengkapi laporan',
            action: 'Lengkapi data yang dibutuhkan sebelum mengirim laporan.',
            result: 'Laporan siap dikirim setelah data terisi.',
          },
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
    accentColor: '#DB2777',
    sections: [
      {
        id: 'tenkes-forum',
        title: 'Ikuti forum tenaga kesehatan',
        route: '/tenkes/forum',
        screenshotFile: 'tenkes-forum.png',
        purpose: 'Mengoordinasikan diskusi tindak lanjut di forum.',
        steps: [
          {
            id: 'open-health-forum',
            label: 'Buka forum',
            action: 'Buka forum tenaga kesehatan dari navigasi utama.',
            result: 'Forum tenaga kesehatan terbuka.',
          },
          {
            id: 'select-relevant-discussion',
            label: 'Pilih diskusi',
            action: 'Pilih diskusi yang relevan untuk membaca atau menanggapi percakapan.',
            result: 'Percakapan yang relevan siap dibaca atau ditanggapi.',
          },
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
        route: '/tenkes/balita/1',
        screenshotFile: 'tenkes-balita-detail.png',
        purpose: 'Membuka profil balita untuk peninjauan medis.',
        steps: [
          {
            id: 'open-child-detail-page',
            label: 'Buka detail balita',
            action: 'Masuk ke halaman detail balita dari daftar atau tautan forum.',
            result: 'Halaman detail balita terbuka.',
          },
          {
            id: 'review-supporting-info',
            label: 'Tinjau informasi',
            action: 'Tinjau informasi yang dibutuhkan untuk mendukung penanganan lanjutan.',
            result: 'Informasi pendukung untuk tindak lanjut terlihat.',
          },
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
    accentColor: '#0369A1',
    sections: [
      {
        id: 'orangtua-balita',
        title: 'Lihat data balita',
        route: '/orangtua/balita',
        screenshotFile: 'orangtua-balita.png',
        purpose: 'Memantau ringkasan data tumbuh kembang anak.',
        steps: [
          {
            id: 'open-child-summary',
            label: 'Buka data balita',
            action: 'Buka halaman balita milik orang tua yang sedang login.',
            result: 'Ringkasan data balita tampil.',
          },
          {
            id: 'review-growth-summary',
            label: 'Tinjau ringkasan',
            action: 'Tinjau ringkasan data tumbuh kembang yang tersedia di halaman tersebut.',
            result: 'Data tumbuh kembang dapat dipantau.',
          },
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
        purpose: 'Membaca dan mengikuti diskusi komunitas orang tua.',
        steps: [
          {
            id: 'open-parent-forum',
            label: 'Buka forum',
            action: 'Buka halaman forum orang tua dari menu utama.',
            result: 'Forum orang tua terbuka.',
          },
          {
            id: 'find-discussion-topic',
            label: 'Cari topik',
            action: 'Cari topik diskusi yang sesuai dengan kebutuhan atau pertanyaan Anda.',
            result: 'Topik diskusi yang relevan ditemukan.',
          },
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
        route: '/orangtua/forum/1',
        screenshotFile: 'orangtua-forum-detail.png',
        purpose: 'Meninjau percakapan topik forum secara lengkap.',
        steps: [
          {
            id: 'open-forum-topic',
            label: 'Buka topik',
            action: 'Pilih salah satu topik forum untuk melihat isi percakapan lengkap.',
            result: 'Halaman detail forum terbuka.',
          },
          {
            id: 'read-existing-replies',
            label: 'Baca jawaban',
            action: 'Baca jawaban yang sudah tersedia sebelum menambahkan balasan baru.',
            result: 'Konteks percakapan siap ditinjau sebelum membalas.',
          },
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
        route: '/orangtua/balita/1',
        screenshotFile: 'orangtua-balita-detail.png',
        purpose: 'Memeriksa detail anak sebelum melakukan tindak lanjut.',
        steps: [
          {
            id: 'open-child-detail-from-list',
            label: 'Buka detail anak',
            action: 'Buka detail salah satu balita dari halaman daftar anak.',
            result: 'Halaman detail balita terbuka.',
          },
          {
            id: 'verify-child-data',
            label: 'Periksa detail',
            action: 'Tinjau informasi detail untuk memastikan data anak yang tampil sudah benar.',
            result: 'Data anak dapat diverifikasi.',
          },
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
