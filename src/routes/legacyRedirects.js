export const LEGACY_REDIRECTS = [
  { from: '/sign-in', to: '/masuk' },
  { from: '/sign-in/admin', to: '/masuk?role=ADMIN' },
  { from: '/sign-in/desa', to: '/masuk?role=DESA' },
  { from: '/sign-in/tenaga-kesehatan', to: '/masuk?role=TENAGA_KESEHATAN' },
  { from: '/sign-in/kader-posyandu', to: '/masuk?role=KADER_POSYANDU' },
  { from: '/dashboard', to: '/orangtua/balita' },
  { from: '/tanya-jawab', to: '/orangtua/forum' },
  { from: '/my-forum', to: '/orangtua/forum/saya' },
  { from: '/kader-posyandu/dashboard', to: '/kader/beranda' },
  { from: '/desa/dashboard', to: '/desa/beranda' },
  { from: '/desa/reminder', to: '/desa/acara' },
  { from: '/tenaga-kesehatan/dashboard', to: '/tenkes/forum' },
];
