export const qk = {
  auth: {
    all: ['auth'],
    session: ['auth', 'session'],
  },
  anak: {
    all: ['anak'],
    list: (role) => ['anak', 'list', role],
    detail: (id, role) => ['anak', 'detail', id, role],
  },
  pengukuran: {
    all: ['pengukuran'],
    byAnak: (anakId, role) => ['pengukuran', 'by-anak', anakId, role],
  },
  laporan: {
    all: ['laporan'],
    kader: (posyanduId, bulan) => ['laporan', 'kader', posyanduId, bulan],
    desa: (desaId, bulan) => ['laporan', 'desa', desaId, bulan],
    admin: (bulan) => ['laporan', 'admin', bulan],
  },
  artikel: {
    all: ['artikel'],
    list: ['artikel', 'list'],
    detail: (id) => ['artikel', 'detail', id],
  },
  desa: {
    all: ['desa'],
    list: ['desa', 'list'],
  },
  posyandu: {
    all: ['posyandu'],
    list: ['posyandu', 'list'],
  },
  kader: {
    all: ['kader'],
    list: ['kader', 'list'],
  },
  nakes: {
    all: ['nakes'],
    list: ['nakes', 'list'],
  },
  post: {
    all: ['post'],
    list: (role, userId) => ['post', 'list', role, userId],
    detail: (id) => ['post', 'detail', id],
  },
  comment: {
    all: ['comment'],
    byPost: (postId) => ['comment', 'by-post', postId],
  },
  profile: {
    all: ['profile'],
    me: ['profile', 'me'],
  },
  kategori: {
    all: ['kategori'],
    list: ['kategori', 'list'],
  },
  approve: {
    all: ['approve'],
    orangTua: ['approve', 'orangTua'],
    anak: ['approve', 'anak'],
  },
  reminder: {
    all: ['reminder'],
    list: ['reminder', 'list'],
  },
  orangTua: {
    all: ['orangTua'],
    list: ['orangTua', 'list'],
    forKader: ['orangTua', 'for-kader'],
  },
};
