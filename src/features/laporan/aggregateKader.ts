import moment from 'moment';
import { overallStatus, STATUS } from '../pengukuran/statusGizi';

function matchesBulan(date, bulan) {
  if (!date) return false;
  return moment(date).format('YYYY-MM') === bulan;
}

function computePengukuranStatus(p) {
  const toZ = (v) => (v == null || v === '' ? null : Number(v));
  return overallStatus({
    zScoreBB: toZ(p.z_score_berat),
    zScoreTB: toZ(p.z_score_tinggi),
    zScoreLK: toZ(p.z_score_lingkar_kepala),
    zScoreGizi: toZ(p.z_score_gizi),
  });
}

export function aggregateKaderLaporan({ anakList, pengukuranByAnak, bulan }) {
  const safeAnak = anakList ?? [];
  const totalBalita = safeAnak.length;

  let sudahDiukur = 0;
  const belumDiukurList = [];
  const perluPerhatian = [];
  const distribusi = {
    [STATUS.NORMAL]: 0,
    [STATUS.KURANG]: 0,
    [STATUS.STUNTING]: 0,
    [STATUS.OBESITAS]: 0,
  };

  safeAnak.forEach((anak) => {
    const pengukuran = pengukuranByAnak?.[anak.id] ?? [];
    const inBulan = pengukuran.filter((p) => matchesBulan(p.date, bulan));

    if (inBulan.length === 0) {
      const umurBulan = anak.tanggal_lahir
        ? moment().diff(moment(anak.tanggal_lahir), 'month')
        : null;
      belumDiukurList.push({ id: anak.id, nama: anak.nama, umurBulan });
      return;
    }

    sudahDiukur += 1;
    const latest = inBulan.reduce((a, b) =>
      (a.date ?? '').localeCompare(b.date ?? '') > 0 ? a : b
    );
    const status = computePengukuranStatus(latest);
    if (distribusi[status] != null) distribusi[status] += 1;
    if (status !== STATUS.NORMAL && status !== STATUS.UNKNOWN) {
      perluPerhatian.push({ id: anak.id, nama: anak.nama, status });
    }
  });

  return {
    totalBalita,
    sudahDiukur,
    belumDiukur: totalBalita - sudahDiukur,
    belumDiukurList,
    perluPerhatian,
    distribusi,
  };
}
