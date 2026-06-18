import dayjs from 'dayjs';
import { overallStatus, STATUS } from '../pengukuran/statusGizi';

const toZ = (v) => (v == null || v === '' ? null : Number(v));

function compareByDateDesc(a, b) {
  const cmp = (b.date ?? '').localeCompare(a.date ?? '');
  if (cmp !== 0) return cmp;
  // same p.date → tiebreak by created_at desc (most recently entered wins)
  return (b.created_at ?? '').localeCompare(a.created_at ?? '');
}

function mostRecent(list) {
  return list.reduce(
    (best, item) => (best == null || compareByDateDesc(item, best) < 0 ? item : best),
    null
  );
}

export function classifyBalita(anak, pengukuranList, currentBulan) {
  const safe = pengukuranList ?? [];
  const latest = mostRecent(safe);

  const bulanIni = safe.filter(
    (p) => dayjs(p.date).format('YYYY-MM') === currentBulan
  );
  const latestBulanIni = mostRecent(bulanIni);

  // Ikuti API: Gunakan data gizi dari backend alih-alih menghitung dari z-score
  let status = STATUS.UNKNOWN;
  if (anak && anak.gizi) {
    status = Object.keys(anak.gizi).find((k) => (anak.gizi as any)[k] > 0) || STATUS.UNKNOWN;
  } else if (latest) {
    // Fallback jika tidak ada data gizi (misalnya di tes lama yang belum dimock)
    status = overallStatus({
      zScoreBB: toZ(latest.z_score_berat),
      zScoreTB: toZ(latest.z_score_tinggi),
      zScoreLK: toZ(latest.z_score_lingkar_kepala),
      zScoreGizi: toZ(latest.z_score_gizi),
    });
  }

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
