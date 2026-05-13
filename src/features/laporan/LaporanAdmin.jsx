import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

export default function LaporanAdmin() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader
        title="Laporan Keseluruhan"
        subtitle="Rekap bulanan semua desa & posyandu"
      />
      <div className="px-4 py-6 max-w-3xl mx-auto">
        <Card title="Informasi">
          <p className="mb-[17px] text-body-sm text-deep-slate">
            Rekap per-desa tersedia di dashboard masing-masing akun Desa.
          </p>
          <p className="text-neutral-500 text-base">
            Agregasi lintas-desa untuk role Admin akan ditambahkan pada rilis
            berikutnya setelah backend menyediakan endpoint rekap admin (
            <code className="text-caption bg-neutral-100 px-1.5 py-0.5 rounded">
              GET /api/admin/laporan/bulanan
            </code>
            ). Saat ini, silakan gunakan menu "Desa" untuk melihat data per desa.
          </p>
        </Card>
      </div>
    </div>
  );
}
