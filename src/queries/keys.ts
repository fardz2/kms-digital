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
  admin: {
    list: (entity) => ['admin', 'list', entity],
    stats: () => ['admin', 'stats'],
    activity: () => ['admin', 'activity'],
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
};
