import React from 'react';
import moment from 'moment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { overallStatus } from '../pengukuran/statusGizi';

export default function RiwayatCard({ pengukuran, onEdit, onDelete, canEdit = true }) {
  const {
    date,
    berat,
    tinggi,
    lingkar_kepala: lingkarKepala,
    lila,
    catatan,
    z_score_berat,
    z_score_tinggi,
    z_score_lingkar_kepala,
    z_score_gizi,
  } = pengukuran;

  const status = overallStatus({
    zScoreBB: Number(z_score_berat),
    zScoreTB: Number(z_score_tinggi),
    zScoreLK: Number(z_score_lingkar_kepala),
    zScoreGizi: Number(z_score_gizi),
  });

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--space-sm)',
        }}
      >
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
          {date ? moment(date).format('DD MMMM YYYY') : '-'}
        </div>
        <StatusBadge status={status} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-sm)',
        }}
      >
        <div>
          <strong>⚖️ BB:</strong> {berat} kg
        </div>
        <div>
          <strong>📏 TB:</strong> {tinggi} cm
        </div>
        <div>
          <strong>🧠 LK:</strong> {lingkarKepala} cm
        </div>
        {lila != null && (
          <div>
            <strong>💪 LILA:</strong> {lila} cm
          </div>
        )}
      </div>

      {catatan && (
        <div
          style={{
            padding: 'var(--space-sm) var(--space-md)',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-button)',
            fontSize: 'var(--text-base)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          📝 {catatan}
        </div>
      )}

      {canEdit && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => onEdit?.(pengukuran)}>
            Ubah
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete?.(pengukuran)}>
            Hapus
          </Button>
        </div>
      )}
    </Card>
  );
}
