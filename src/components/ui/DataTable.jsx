import React from 'react';
import Table from '../layout/Table';

export default function DataTable({ columns, data, loading, emptyText = 'Tidak ada data' }) {
  if (!loading && (!data || data.length === 0)) {
    return (
      <div className="p-8 text-center text-neutral-500 text-base bg-primary-50 rounded-card">
        {emptyText}
      </div>
    );
  }
  return <Table columns={columns} data={data || []} loading={loading} />;
}
