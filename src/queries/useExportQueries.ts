// @ts-nocheck
import { useMutation } from '@tanstack/react-query';
import { laporanApi } from '../api/laporan.api';

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function useExportCsvDesa() {
  return useMutation({
    mutationFn: ({ desa, bulan, tahun, id }) =>
      laporanApi.exportCsvDesa({ desa, bulan, tahun, id }),
    onSuccess: (blob, variables) => {
      const name = `data-anak-${variables.tahun}-${variables.bulan}.csv`;
      downloadBlob(blob, name);
    },
  });
}

export function useExportCsvKader() {
  return useMutation({
    mutationFn: () => laporanApi.exportCsvKader(),
    onSuccess: (blob) => {
      downloadBlob(blob, 'data-anak.csv');
    },
  });
}
