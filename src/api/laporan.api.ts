import { api } from './client';

export const laporanApi = {
  statistikGizi: (idDesa) => api.get(`/api/statistik-gizi/${idDesa}`),

  exportCsvDesa: ({ desa, bulan, tahun, id }) =>
    api.get(`/api/export-data-anak-csv`, {
      params: { desa, bulan, tahun, id },
      responseType: 'blob',
    }),

  exportCsvKader: () =>
    api.get(`/api/posyandu/data-anak/export-data-anak-csv`, {
      responseType: 'blob',
    }),
};
