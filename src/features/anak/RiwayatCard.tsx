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

  const toZ = (v) => (v == null || v === '' ? null : Number(v));
  const status = overallStatus({
    zScoreBB: toZ(z_score_berat),
    zScoreTB: toZ(z_score_tinggi),
    zScoreLK: toZ(z_score_lingkar_kepala),
    zScoreGizi: toZ(z_score_gizi),
  });

  return (
    <Card>
      <div className="flex justify-between items-start gap-3 mb-3 flex-wrap">
        <div className="text-heading-sm font-semibold text-deep-slate">
          {date ? moment(date).format('DD MMMM YYYY') : '-'}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mb-3 text-base">
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
        <div className="px-[17px] py-[13px] bg-polar-mist rounded-default text-body-sm text-deep-slate mb-[13px]">
          📝 {catatan}
        </div>
      )}

      {canEdit && (
        <div className="flex gap-2 justify-end">
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
