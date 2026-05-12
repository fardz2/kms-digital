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
};
