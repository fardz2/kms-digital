import moment from 'moment';
import { overallStatus, STATUS } from '../pengukuran/statusGizi';

const toZ = (v) => (v == null || v === '' ? null : Number(v));

function compareByDateDesc(a, b) {
  const cmp = (b.date ?? '').localeCompare(a.date ?? '');
  if (cmp !== 0) return cmp;
  // same p.date → tiebreak by created_at desc (most recently entered wins)
  return (b.created_at ?? '').localeCompare(a.created_at ?? '');
}

export function classifyBalita(pengukuranList, currentBulan) {
  const safe = pengukuranList ?? [];
  const latest = safe.slice().sort(compareByDateDesc)[0];

  const bulanIni = safe.filter(
    (p) => moment(p.date).format('YYYY-MM') === currentBulan
  );
  const latestBulanIni = bulanIni.slice().sort(compareByDateDesc)[0];

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

export function priority(meta) {
  if (meta.perluPerhatian) return 0;
  if (!meta.sudahDiukur) return 1;
  return 2;
}
