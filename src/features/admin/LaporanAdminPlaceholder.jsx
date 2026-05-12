import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

export default function LaporanAdminPlaceholder() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)' }}>
      <PageHeader
        title="Laporan Keseluruhan"
        subtitle="Rekap bulanan semua desa & posyandu"
      />
      <div style={{ padding: 'var(--space-lg)', maxWidth: 720, margin: '0 auto' }}>
        <Card>
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-lg)',
              color: 'var(--color-muted)',
            }}
          >
            Fitur laporan sedang disiapkan. Akan tersedia pada rilis berikutnya.
          </div>
        </Card>
      </div>
    </div>
  );
}
