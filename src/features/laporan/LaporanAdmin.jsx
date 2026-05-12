import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

export default function LaporanAdmin() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader
        title="Laporan Keseluruhan"
        subtitle="Rekap bulanan semua desa & posyandu"
      />
      <div style={{ padding: 'var(--space-lg)', maxWidth: 960, margin: '0 auto' }}>
        <Card title="Informasi">
          <p style={{ marginBottom: 'var(--space-md)' }}>
            Rekap per-desa tersedia di dashboard masing-masing akun Desa.
          </p>
          <p style={{ color: 'var(--color-muted)' }}>
            Agregasi lintas-desa untuk role Admin akan ditambahkan pada rilis berikutnya
            setelah backend menyediakan endpoint rekap admin{' '}
            (<code>GET /api/admin/laporan/bulanan</code>). Saat ini, silakan gunakan menu
            "Desa" untuk melihat data per desa.
          </p>
        </Card>
      </div>
    </div>
  );
}
