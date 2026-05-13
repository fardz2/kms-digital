import React from 'react';
import moment from 'moment';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';

export default function PosyanduHeader({
  userName,
  posyanduName,
  sudahCount,
  totalCount,
  pendingCount = 0,
  onApprove,
  onLaporan,
  onKeluar,
}) {
  const bulanLabel = moment().format('MMMM YYYY');

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--color-primary)',
        color: '#FFFFFF',
        padding: 'var(--space-md) var(--space-lg)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-md)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
            }}
          >
            Halo, {userName ?? 'Kader'}
          </div>
          <div style={{ fontSize: 'var(--text-base)', opacity: 0.9 }}>
            {posyanduName ? `Posyandu ${posyanduName} · ` : ''}
            {bulanLabel}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {pendingCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onApprove}
              style={{
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              ✔ Perlu Approve ({pendingCount})
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onLaporan} style={{ color: '#FFFFFF' }}>
            📊 Laporan
          </Button>
          <Button variant="ghost" size="sm" onClick={onKeluar} style={{ color: '#FFFFFF' }}>
            Keluar
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-md)' }}>
        <ProgressBar
          value={sudahCount}
          max={totalCount || 1}
          label={`Sudah diukur`}
          color="#FFFFFF"
        />
      </div>
    </div>
  );
}
