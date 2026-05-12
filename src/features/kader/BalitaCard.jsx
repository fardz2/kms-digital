import React, { useMemo } from 'react';
import moment from 'moment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { overallStatus, STATUS } from '../pengukuran/statusGizi';

const toZ = (v) => (v == null || v === '' ? null : Number(v));

function classifyBalita(pengukuranList, currentBulan) {
  const safe = pengukuranList ?? [];
  const latest = safe
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];

  const bulanIni = safe.filter(
    (p) => moment(p.date).format('YYYY-MM') === currentBulan
  );
  const latestBulanIni = bulanIni
    .slice()
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];

  const status = latest
    ? overallStatus({
        zScoreBB: toZ(latest.z_score_berat),
        zScoreTB: toZ(latest.z_score_tinggi),
        zScoreLK: toZ(latest.z_score_lingkar_kepala),
        zScoreGizi: toZ(latest.z_score_gizi),
      })
    : STATUS.UNKNOWN;

  const sudahDiukur = !!latestBulanIni;
  const perluPerhatian =
    status !== STATUS.NORMAL && status !== STATUS.UNKNOWN;

  return { latest, latestBulanIni, status, sudahDiukur, perluPerhatian };
}

export default function BalitaCard({
  anak,
  pengukuranList,
  currentBulan,
  onUkur,
  onUlang,
  onLihat,
}) {
  const { latest, latestBulanIni, status, sudahDiukur, perluPerhatian } =
    useMemo(() => classifyBalita(pengukuranList, currentBulan), [
      pengukuranList,
      currentBulan,
    ]);

  const icon = perluPerhatian ? '\u26A0\uFE0F' : sudahDiukur ? '\u2705' : '\u26AA';
  const umurBulan = anak.tanggal_lahir
    ? moment().diff(moment(anak.tanggal_lahir), 'month')
    : null;
  const genderLabel = anak.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan';

  return (
    <Card style={{ padding: 'var(--space-md)' }}>
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
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              marginBottom: 'var(--space-xs)',
            }}
          >
            <span style={{ fontSize: 'var(--text-xl)' }} aria-hidden="true">
              {icon}
            </span>
            <span
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-bold)',
              }}
            >
              {anak.nama}
            </span>
            {perluPerhatian && <StatusBadge status={status} />}
          </div>
          <div
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-muted)',
            }}
          >
            {umurBulan != null ? `${umurBulan} bulan · ` : ''}
            {genderLabel}
          </div>
          {latest && (
            <div
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-muted)',
                marginTop: 'var(--space-xs)',
              }}
            >
              {sudahDiukur ? (
                <>
                  {moment(latestBulanIni.date).format('DD MMM')} · {latestBulanIni.berat}kg · TB{' '}
                  {latestBulanIni.tinggi}cm
                </>
              ) : (
                <>
                  Terakhir: {moment(latest.date).format('DD MMM YYYY')} · {latest.berat}kg
                </>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-xs)',
            alignItems: 'stretch',
          }}
        >
          {sudahDiukur ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onLihat?.(anak)}
              >
                Lihat riwayat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUlang?.(anak, latestBulanIni)}
              >
                Ulang
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => onUkur?.(anak, latest)}
            >
              ✏️ UKUR
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
