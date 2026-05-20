import type { GuideRole } from '../types';

export const guideContent: GuideRole[] = [
  {
    id: 'ADMIN',
    title: 'Admin',
    summary: 'Mengelola data master, konten, dan konfigurasi operasional aplikasi dari dashboard pusat.',
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
          {
            id: 'open-admin-sidebar',
            label: 'Buka menu',
            action: 'Gunakan sidebar untuk masuk ke modul desa, posyandu, kader, nakes, atau artikel.',
            result: 'Menu navigasi siap dipakai untuk berpindah halaman.',
          },
          {
            id: 'review-activity-feed',
            label: 'Baca aktivitas',
            action: 'Lihat aktivitas terbaru untuk mengetahui data apa yang baru diubah atau ditambahkan.',
            result: 'Riwayat aktivitas operasional terlihat lebih jelas.',
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
        id: 'admin-desa',
        title: 'Kelola data desa',
        route: '/admin/dashboard/desa',
        screenshotFile: 'admin-desa.png',
        purpose: 'Menambah dan menghapus data desa yang terdaftar di sistem.',
        steps: [
          {
            id: 'open-desa-module',
            label: 'Buka modul desa',
            action: 'Buka menu Data Master lalu masuk ke halaman Desa.',
            result: 'Daftar desa dan form tambah desa terlihat.',
          },
          {
            id: 'add-village',
            label: 'Tambah desa',
            action: 'Klik Tambah Desa untuk membuka modal input data desa.',
            result: 'Form tambah desa muncul di tengah layar.',
          },
          {
            id: 'fill-village-form',
            label: 'Isi detail desa',
            action:
              'Isi nama desa, kata sandi, dan konfirmasi kata sandi sebelum menyimpan.',
            result: 'Data desa siap divalidasi dan disimpan.',
          },
          {
            id: 'review-village-table',
            label: 'Simpan dan cek daftar',
            action: 'Klik Simpan lalu cek tabel untuk memastikan desa baru muncul.',
            result: 'Daftar desa terbarui setelah penyimpanan.',
          },
        ],
        expectedResult:
          'Admin dapat menambah atau menghapus desa dan melihat daftar yang selalu mutakhir.',
        tips: [
          'Pastikan nama desa konsisten agar tidak muncul data ganda.',
          'Gunakan pencarian tabel jika daftar desa sudah banyak.',
        ],
      },
      {
        id: 'admin-posyandu',
        title: 'Kelola data posyandu',
        route: '/admin/dashboard/posyandu',
        screenshotFile: 'admin-posyandu.png',
        purpose: 'Menghubungkan posyandu dengan desa dan menjaga detail alamat tetap akurat.',
        steps: [
          {
            id: 'open-posyandu-module',
            label: 'Buka modul posyandu',
            action: 'Masuk ke halaman Posyandu dari data master admin.',
            result: 'Daftar posyandu tampil bersama statistik ringkas.',
          },
          {
            id: 'choose-village-for-posyandu',
            label: 'Pilih desa',
            action: 'Pilih desa yang sesuai pada field dropdown di form posyandu.',
            result: 'Posyandu terhubung dengan desa yang benar.',
          },
          {
            id: 'save-posyandu',
            label: 'Simpan posyandu',
            action: 'Isi nama posyandu dan alamat lengkap lalu klik Simpan.',
            result: 'Data posyandu masuk ke daftar terdaftar.',
          },
          {
            id: 'review-posyandu-table',
            label: 'Tinjau daftar',
            action: 'Periksa tabel untuk memastikan posyandu baru tampil sesuai desa.',
            result: 'Daftar posyandu menampilkan data terbaru.',
          },
        ],
        expectedResult:
          'Admin dapat menambah, mengubah, dan menghapus data posyandu per desa dengan aman.',
        tips: [
          'Periksa alamat posyandu sebelum menyimpan.',
          'Gunakan fitur edit bila ada perubahan nama atau lokasi.',
        ],
      },
      {
        id: 'admin-kader-posyandu',
        title: 'Kelola kader posyandu',
        route: '/admin/dashboard/kader-posyandu',
        screenshotFile: 'admin-kader-posyandu.png',
        purpose: 'Mengelola akun kader posyandu dan status persetujuannya.',
        steps: [
          {
            id: 'open-kader-module',
            label: 'Buka modul kader',
            action: 'Masuk ke halaman Kader Posyandu untuk melihat daftar akun.',
            result: 'Daftar kader dan filter status muncul di layar.',
          },
          {
            id: 'filter-kader-status',
            label: 'Filter status',
            action: 'Gunakan filter untuk melihat kader yang disetujui atau masih menunggu.',
            result: 'Daftar kader menyaring status yang dipilih.',
          },
          {
            id: 'register-kader',
            label: 'Registrasi kader',
            action: 'Klik Tambah Kader Posyandu untuk membuka form registrasi akun baru.',
            result: 'Form registrasi kader terbuka.',
          },
          {
            id: 'fill-kader-form',
            label: 'Isi data kader',
            action:
              'Isi nama, email, kata sandi, pilih desa, pilih posyandu, lalu tentukan status akun.',
            result: 'Data kader siap disimpan dengan relasi desa dan posyandu yang benar.',
          },
          {
            id: 'save-kader',
            label: 'Simpan kader',
            action: 'Klik Simpan untuk menyelesaikan registrasi atau pembaruan data kader.',
            result: 'Akun kader masuk ke daftar dan statusnya terbarui.',
          },
        ],
        expectedResult:
          'Admin dapat memantau, menyetujui, menambah, dan menghapus akun kader posyandu.',
        tips: [
          'Cek kecocokan desa dan posyandu sebelum menyimpan akun kader.',
          'Gunakan status menunggu untuk akun yang belum diverifikasi.',
        ],
      },
      {
        id: 'admin-tenaga-kesehatan',
        title: 'Kelola tenaga kesehatan',
        route: '/admin/dashboard/tenaga-kesehatan',
        screenshotFile: 'admin-tenaga-kesehatan.png',
        purpose: 'Menambahkan dan memelihara daftar tenaga kesehatan per desa.',
        steps: [
          {
            id: 'open-nakes-module',
            label: 'Buka modul nakes',
            action: 'Masuk ke halaman Tenaga Kesehatan dari menu admin.',
            result: 'Daftar tenaga kesehatan dan statistik ringkas tampil.',
          },
          {
            id: 'register-nakes',
            label: 'Registrasi tenaga kesehatan',
            action: 'Klik Tambah Tenaga Kesehatan lalu isi data akun baru.',
            result: 'Form registrasi tenaga kesehatan terbuka.',
          },
          {
            id: 'fill-nakes-form',
            label: 'Isi data nakes',
            action: 'Isi nama, email, kata sandi, dan pilih desa yang sesuai.',
            result: 'Data tenaga kesehatan siap disimpan.',
          },
          {
            id: 'remove-nakes',
            label: 'Hapus akun',
            action: 'Gunakan tombol hapus jika akun tenaga kesehatan tidak lagi aktif.',
            result: 'Daftar tenaga kesehatan tetap terjaga kebersihannya.',
          },
        ],
        expectedResult:
          'Admin dapat mengelola akun tenaga kesehatan yang terhubung dengan desa masing-masing.',
        tips: [
          'Pastikan data desa sudah benar sebelum menambahkan akun baru.',
          'Gunakan hapus hanya untuk akun yang memang tidak aktif lagi.',
        ],
      },
      {
        id: 'admin-artikel',
        title: 'Kelola daftar artikel',
        route: '/admin/dashboard/artikel',
        screenshotFile: 'admin-artikel.png',
        purpose: 'Memeriksa daftar artikel, mengubah konten lama, menghapus artikel yang tidak dipakai, dan membuka form penulisan baru.',
        steps: [
          {
            id: 'open-article-module',
            label: 'Buka modul artikel',
            action: 'Masuk ke halaman Artikel untuk melihat daftar konten yang terbit.',
            result: 'Daftar artikel, statistik, dan aksi cepat terlihat.',
          },
          {
            id: 'review-article-list',
            label: 'Tinjau daftar',
            action: 'Cek judul dan tanggal upload untuk memastikan konten terbaru ada di daftar.',
            result: 'Daftar artikel siap dipantau.',
          },
          {
            id: 'search-article-list',
            label: 'Cari artikel',
            action: 'Gunakan pencarian tabel jika ingin menemukan artikel tertentu lebih cepat.',
            result: 'Daftar artikel menyaring hasil sesuai kata kunci.',
          },
          {
            id: 'edit-article-item',
            label: 'Ubah artikel',
            action: 'Klik Ubah pada salah satu baris artikel untuk membuka modal edit yang sudah terisi.',
            result: 'Form edit artikel terbuka dengan data lama yang siap diperbarui.',
          },
          {
            id: 'delete-article-item',
            label: 'Hapus artikel',
            action: 'Klik Hapus pada salah satu baris artikel lalu konfirmasi sebelum data dihapus.',
            result: 'Dialog konfirmasi hapus muncul sebelum artikel dihapus.',
          },
          {
            id: 'open-new-article-link',
            label: 'Buka artikel baru',
            action: 'Klik Tulis Artikel untuk masuk ke form pembuatan konten baru.',
            result: 'Halaman artikel baru siap dibuka.',
          },
        ],
        expectedResult:
          'Admin dapat memantau, mengubah, menghapus, dan menulis artikel baru dari satu halaman daftar.',
        tips: [
          'Gunakan muat ulang setelah perubahan konten dari sesi lain.',
          'Periksa tanggal upload, judul, dan status artikel sebelum mengubah atau menghapus.',
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
            id: 'select-article-category',
            label: 'Pilih kategori',
            action: 'Pilih kategori artikel atau tambahkan kategori baru jika perlu.',
            result: 'Kategori artikel sudah siap dipakai.',
          },
          {
            id: 'fill-article-fields',
            label: 'Isi detail artikel',
            action: 'Isi judul, nama penulis, unggah cover, lalu tulis isi artikel.',
            result: 'Detail artikel siap disimpan.',
          },
          {
            id: 'publish-article',
            label: 'Terbitkan artikel',
            action: 'Klik Terbitkan Artikel untuk menyimpan dan mempublikasikan konten.',
            result: 'Artikel baru terbit di daftar artikel.',
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
    summary: 'Memantau beranda desa, membaca rekap gizi, dan menyiapkan laporan layanan yang ditampilkan untuk masyarakat.',
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
            id: 'export-village-report',
            label: 'Pilih periode ekspor',
            action: 'Pilih bulan dan posyandu sebelum mengunduh CSV atau PDF.',
            result: 'Parameter ekspor siap dipakai.',
          },
          {
            id: 'review-village-info',
            label: 'Tinjau laporan',
            action: 'Tinjau ringkasan layanan, statistik, dan daftar pengingat acara yang tampil.',
            result: 'Informasi layanan dan ringkasan aktivitas terlihat jelas.',
          },
          {
            id: 'fill-village-event',
            label: 'Isi acara',
            action: 'Isi judul acara, deskripsi, dan tanggal lalu simpan untuk publikasi.',
            result: 'Acara baru siap muncul di daftar acara desa.',
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
    summary: 'Mencatat data balita, mengelola data orang tua, dan menyusun laporan bulanan posyandu.',
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
            id: 'filter-child-list',
            label: 'Cari dan filter',
            action: 'Gunakan kotak cari dan filter status untuk menemukan balita yang ditangani.',
            result: 'Daftar balita menyempit sesuai pencarian dan status.',
          },
          {
            id: 'open-child-detail',
            label: 'Tinjau entri',
            action: 'Pilih salah satu entri untuk membuka detail atau riwayat balita.',
            result: 'Detail balita dapat ditinjau atau diperbarui.',
          },
          {
            id: 'fill-measurement-form',
            label: 'Input pengukuran',
            action: 'Klik UKUR lalu isi tanggal, berat, tinggi, lingkar kepala, dan catatan.',
            result: 'Form pengukuran siap disimpan.',
          },
          {
            id: 'create-new-child',
            label: 'Tambah balita',
            action: 'Klik Tambah Balita Baru lalu isi identitas anak dan data orang tua.',
            result: 'Form pendaftaran balita baru terbuka.',
          },
        ],
        expectedResult: 'Daftar balita tampil lengkap dan kader dapat melanjutkan ke detail data.',
        tips: [
          'Periksa identitas anak sebelum menyimpan perubahan.',
          'Gunakan pencarian daftar jika jumlah data balita sudah banyak.',
        ],
      },
      {
        id: 'kader-balita-detail',
        title: 'Buka detail balita',
        route: '/kader/balita/1',
        screenshotFile: 'kader-balita-detail.png',
        purpose: 'Meninjau riwayat balita dan memperbarui pengukuran yang sudah ada.',
        steps: [
          {
            id: 'open-child-detail-as-kader',
            label: 'Buka detail balita',
            action: 'Pilih salah satu balita dari daftar untuk membuka halaman detailnya.',
            result: 'Halaman detail balita terbuka bersama riwayat pengukuran.',
          },
          {
            id: 'review-child-history-as-kader',
            label: 'Tinjau riwayat',
            action: 'Periksa kartu pengukuran terbaru dan grafik pertumbuhan sebelum mengubah data.',
            result: 'Riwayat pengukuran terlihat lengkap.',
          },
          {
            id: 'edit-child-measurement',
            label: 'Ubah pengukuran',
            action: 'Klik Ubah pada pengukuran terbaru untuk memperbaiki tanggal, berat, atau tinggi.',
            result: 'Form pengukuran terbuka dalam mode edit.',
          },
          {
            id: 'delete-child-measurement',
            label: 'Hapus pengukuran',
            action: 'Gunakan Hapus bila data pengukuran memang perlu dihapus dari riwayat.',
            result: 'Konfirmasi hapus muncul sebelum data dihapus.',
          },
        ],
        expectedResult:
          'Kader dapat meninjau, mengubah, dan menghapus riwayat pengukuran balita dengan jelas.',
        tips: [
          'Periksa kembali data lama sebelum menyimpan perubahan.',
          'Hapus pengukuran hanya jika memang ada kesalahan input.',
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
            id: 'switch-parent-tab',
            label: 'Pindah tab',
            action: 'Buka tab Daftar Aktif untuk melihat akun orang tua yang sudah disetujui.',
            result: 'Daftar akun aktif muncul di layar.',
          },
          {
            id: 'review-parent-account',
            label: 'Tinjau akun',
            action: 'Tinjau akun orang tua yang sudah terhubung dengan data balita.',
            result: 'Keterhubungan akun orang tua dengan balita terlihat.',
          },
          {
            id: 'fill-parent-form',
            label: 'Input data orang tua',
            action: 'Klik Tambah Orang Tua atau Ubah, lalu isi nama, email, password, alamat, dan status.',
            result: 'Form orang tua siap disimpan.',
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
            id: 'choose-report-month',
            label: 'Pilih bulan',
            action: 'Gunakan month picker untuk memilih periode laporan yang ingin dilihat.',
            result: 'Laporan berpindah ke bulan yang dipilih.',
          },
          {
            id: 'review-report-summary',
            label: 'Tinjau ringkasan',
            action: 'Periksa stat card, progres, dan daftar balita yang belum diukur.',
            result: 'Data laporan bulanan terbaca lengkap.',
          },
          {
            id: 'complete-report-data',
            label: 'Lengkapi laporan',
            action: 'Lengkapi catatan yang diperlukan sebelum laporan dibagikan.',
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
    summary: 'Berinteraksi di forum, meninjau detail balita, dan memberi tindak lanjut medis yang ringkas.',
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
            action: 'Buka thread dari daftar untuk membaca percakapan yang relevan.',
            result: 'Percakapan yang relevan siap dibaca atau ditanggapi.',
          },
          {
            id: 'review-forum-details',
            label: 'Baca detail',
            action: 'Periksa detail pertanyaan, identitas pengirim, dan jawaban yang sudah ada.',
            result: 'Konteks forum terbaca sebelum membalas.',
          },
          {
            id: 'reply-forum-thread',
            label: 'Balas pertanyaan',
            action: 'Tulis jawaban singkat dan kirim lewat form komentar di detail forum.',
            result: 'Jawaban terkirim ke thread forum.',
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
        title: 'Buka detail pertanyaan',
        route: '/tenkes/balita/1',
        screenshotFile: 'tenkes-balita-detail.png',
        purpose: 'Membaca detail pertanyaan sebelum memberi jawaban atau saran medis.',
        steps: [
          {
            id: 'open-forum-detail-page',
            label: 'Buka detail pertanyaan',
            action: 'Masuk ke halaman detail forum dari daftar pertanyaan tenaga kesehatan.',
            result: 'Halaman detail forum terbuka.',
          },
          {
            id: 'review-forum-context',
            label: 'Tinjau konteks',
            action: 'Baca identitas pengirim, isi pertanyaan, dan riwayat jawaban yang sudah ada.',
            result: 'Konteks diskusi terlihat lebih lengkap.',
          },
          {
            id: 'reply-to-forum',
            label: 'Kirim jawaban',
            action: 'Isi form komentar untuk memberi jawaban atau saran kesehatan yang relevan.',
            result: 'Jawaban siap dikirim ke thread forum.',
          },
        ],
        expectedResult:
          'Detail forum terbuka sehingga tenaga kesehatan dapat membaca konteks lalu memberi jawaban.',
        tips: [
          'Baca semua komentar yang sudah ada sebelum menulis jawaban baru.',
          'Gunakan bahasa singkat, jelas, dan berbasis saran medis yang aman.',
        ],
      },
    ],
  },
  {
    id: 'ORANG_TUA',
    title: 'Orang Tua',
    summary: 'Memantau data balita, mengirim pertanyaan ke forum, dan membuka artikel edukasi yang relevan.',
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
            id: 'fill-new-child-form',
            label: 'Tambah anak',
            action: 'Klik Tambah Anak lalu isi nama, panggilan, jenis kelamin, tanggal lahir, dan alamat.',
            result: 'Form pendaftaran anak siap dikirim.',
          },
          {
            id: 'review-growth-summary',
            label: 'Tinjau ringkasan',
            action: 'Tinjau kartu anak dan pastikan data tumbuh kembang yang tampil sudah benar.',
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
            id: 'switch-forum-tab',
            label: 'Pilih tab',
            action: 'Gunakan tab Semua atau Punya Saya untuk melihat daftar yang sesuai.',
            result: 'Forum tersaring sesuai pilihan tab.',
          },
          {
            id: 'find-discussion-topic',
            label: 'Cari topik',
            action: 'Cari topik diskusi yang sesuai dengan kebutuhan atau pertanyaan Anda.',
            result: 'Topik diskusi yang relevan ditemukan.',
          },
          {
            id: 'write-new-question',
            label: 'Tulis pertanyaan',
            action: 'Klik Tulis Pertanyaan lalu isi judul dan pertanyaan sebelum menyimpan.',
            result: 'Form pertanyaan siap diposting.',
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
          {
            id: 'post-followup-comment',
            label: 'Tulis komentar',
            action: 'Isi kolom komentar dan kirim bila masih perlu klarifikasi tambahan.',
            result: 'Balasan baru terkirim ke percakapan.',
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
            action: 'Tinjau data identitas, riwayat, dan hasil pengukuran untuk memastikan semuanya cocok.',
            result: 'Data anak dapat diverifikasi.',
          },
          {
            id: 'review-child-history',
            label: 'Cek riwayat',
            action: 'Bandingkan data terbaru dengan riwayat sebelumnya sebelum menindaklanjuti.',
            result: 'Riwayat perkembangan anak terlihat lebih lengkap.',
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
