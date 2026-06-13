import dayjs from 'dayjs';
import {
  overallStatus,
  STATUS,
  classifyBBU,
  classifyTBU,
  classifyLKU,
  BBU,
  TBU,
  LKU,
} from '../pengukuran/statusGizi';

function matchesBulan(date, bulan) {
  if (!date) return false;
  return dayjs(date).format('YYYY-MM') === bulan;
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
        ? dayjs().diff(dayjs(anak.tanggal_lahir), 'month')
        : null;
      belumDiukurList.push({ id: anak.id, nama: anak.nama, umurBulan });
    } else {
      sudahDiukur += 1;
      const latest = inBulan.reduce((a, b) =>
        (a.date ?? '').localeCompare(b.date ?? '') > 0 ? a : b
      );
      const status = computePengukuranStatus(latest);
      if (distribusi[status] != null) distribusi[status] += 1;
    }

    // "Perlu Perhatian" memakai pengukuran TERAKHIR kapan saja (konsisten
    // dengan halaman /kader/balita), bukan hanya bulan terpilih.
    if (pengukuran.length > 0) {
      const latestEver = pengukuran.reduce((a, b) =>
        (a.date ?? '').localeCompare(b.date ?? '') > 0 ? a : b
      );
      const statusEver = computePengukuranStatus(latestEver);
      if (statusEver !== STATUS.NORMAL && statusEver !== STATUS.UNKNOWN) {
        perluPerhatian.push({ id: anak.id, nama: anak.nama, status: statusEver });
      }
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

const BBU_ORDER = [BBU.SANGAT_KURANG, BBU.KURANG, BBU.NORMAL, BBU.LEBIH];
const TBU_ORDER = [TBU.SANGAT_PENDEK, TBU.PENDEK, TBU.NORMAL, TBU.TINGGI];
const LKU_ORDER = [LKU.MIKROSEFALI, LKU.NORMAL, LKU.MAKROSEFALI];

function emptyCount(order) {
  return order.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

const toZ = (v) => (v == null || v === '' ? null : Number(v));

// Rekap distribusi per-indikator (BB/U, TB/U, LK/U) memakai pengukuran
// TERAKHIR tiap balita. Dipakai untuk tabel rekap posyandu (scope 1 posyandu),
// sejajar dengan tabel rekap Pemerintah Desa.
export function aggregateKaderRekap({ anakList, pengukuranByAnak }) {
  const safeAnak = anakList ?? [];

  const beratBadan = emptyCount(BBU_ORDER);
  const tinggiBadan = emptyCount(TBU_ORDER);
  const lingkarKepala = emptyCount(LKU_ORDER);
  let totalDiukur = 0;

  safeAnak.forEach((anak) => {
    const pengukuran = pengukuranByAnak?.[anak.id] ?? [];
    if (pengukuran.length === 0) return;

    const latest = pengukuran.reduce((a, b) =>
      (a.date ?? '').localeCompare(b.date ?? '') > 0 ? a : b
    );
    totalDiukur += 1;

    const bbu = classifyBBU(toZ(latest.z_score_berat));
    const tbu = classifyTBU(toZ(latest.z_score_tinggi));
    const lku = classifyLKU(toZ(latest.z_score_lingkar_kepala));

    if (beratBadan[bbu] != null) beratBadan[bbu] += 1;
    if (tinggiBadan[tbu] != null) tinggiBadan[tbu] += 1;
    if (lingkarKepala[lku] != null) lingkarKepala[lku] += 1;
  });

  return {
    totalDiukur,
    totalBalita: safeAnak.length,
    beratBadan,
    tinggiBadan,
    lingkarKepala,
  };
}
