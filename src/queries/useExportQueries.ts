import { useMutation } from '@tanstack/react-query';
import { laporanApi } from '../api/laporan.api';

interface ExportCsvDesaPayload {
  desa: number | string;
  bulan: number | string;
  tahun: number | string;
  id?: number | string;
}

function downloadBlob(blob: Blob, filename: string): void {
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
    mutationFn: ({ desa, bulan, tahun, id }: ExportCsvDesaPayload) =>
      laporanApi.exportCsvDesa({ desa, bulan, tahun, id }) as unknown as Promise<Blob>,
    onSuccess: (blob, variables) => {
      const name = `data-anak-${variables.tahun}-${variables.bulan}.csv`;
      downloadBlob(blob as Blob, name);
    },
  });
}

export function useExportCsvKader() {
  return useMutation({
    mutationFn: () => laporanApi.exportCsvKader() as unknown as Promise<Blob>,
    onSuccess: (blob) => {
      downloadBlob(blob as Blob, 'data-anak.csv');
    },
  });
}
