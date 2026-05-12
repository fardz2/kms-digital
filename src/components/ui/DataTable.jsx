import React from 'react';
import Table from '../layout/Table';

export default function DataTable({ columns, data, loading, emptyText = 'Tidak ada data' }) {
  if (!loading && (!data || data.length === 0)) {
    return (
      <div
        style={{
          padding: 'var(--space-xl)',
          textAlign: 'center',
          color: 'var(--color-muted)',
          fontSize: 'var(--text-base)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        {emptyText}
      </div>
    );
  }

  return <Table columns={columns} data={data || []} loading={loading} />;
}
