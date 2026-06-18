import dayjs from 'dayjs';
import {
  overallStatus,
  STATUS,
  normalizeBBU,
  normalizeTBU,
  normalizeLKU,
  overallStatusFromStrings,
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
      // "Ikuti API saja": gunakan object gizi dari backend
      const status = Object.keys(anak.gizi ?? {}).find((k) => (anak.gizi as any)[k] > 0) || STATUS.UNKNOWN;
      if (distribusi[status] != null) distribusi[status] += 1;
    }

    // "Perlu Perhatian" memakai pengukuran TERAKHIR kapan saja (konsisten
    // dengan halaman /kader/balita), bukan hanya bulan terpilih.
    if (pengukuran.length > 0) {
      const latestEver = pengukuran.reduce((a, b) =>
        (a.date ?? '').localeCompare(b.date ?? '') > 0 ? a : b
      );
      const statusEver = Object.keys(anak.gizi ?? {}).find((k) => (anak.gizi as any)[k] > 0) || STATUS.UNKNOWN;
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
const GIZI_ORDER = [STATUS.NORMAL, STATUS.KURANG, STATUS.STUNTING, STATUS.OBESITAS];

// Rekap distribusi per-indikator (BB/U, TB/U, LK/U) memakai pengukuran
// TERAKHIR tiap balita. Dipakai untuk tabel rekap posyandu (scope 1 posyandu),
// sejajar dengan tabel rekap Pemerintah Desa.
export function aggregateKaderRekap({ anakList }) {
  const safeAnak = anakList ?? [];

  const beratBadan = emptyCount(BBU_ORDER);
  const tinggiBadan = emptyCount(TBU_ORDER);
  const lingkarKepala = emptyCount(LKU_ORDER);
  const gizi = emptyCount(GIZI_ORDER);
  let totalDiukur = 0;

  safeAnak.forEach((anak) => {
    if (anak.tanggal_ukur_terakhir || anak.status_berat_terakhir) {
      totalDiukur += 1;
    }

    Object.entries(anak.berat_badan ?? {}).forEach(([k, v]) => {
      const mapped = normalizeBBU(k);
      if (beratBadan[mapped] != null) beratBadan[mapped] += Number(v || 0);
    });

    Object.entries(anak.tinggi_badan ?? {}).forEach(([k, v]) => {
      const mapped = normalizeTBU(k);
      if (tinggiBadan[mapped] != null) tinggiBadan[mapped] += Number(v || 0);
    });

    Object.entries(anak.lingkar_kepala ?? {}).forEach(([k, v]) => {
      const mapped = normalizeLKU(k);
      if (lingkarKepala[mapped] != null) lingkarKepala[mapped] += Number(v || 0);
    });

    Object.entries(anak.gizi ?? {}).forEach(([k, v]) => {
      // API keys are already "normal", "kurang", "stunting", "obesitas" matching STATUS enum
      if (gizi[k] != null) {
        gizi[k] += Number(v || 0);
      } else {
        gizi[k] = Number(v || 0);
      }
    });
  });

  return {
    totalDiukur,
    totalBalita: safeAnak.length,
    beratBadan,
    tinggiBadan,
    lingkarKepala,
    gizi,
  };
}

// Rekap per-balita (per nama) memakai pengukuran TERAKHIR tiap balita.
// Tiap baris = 1 balita, dengan klasifikasi BB/U, TB/U, LK/U, dan Gizi (BB/TB).
export function aggregateKaderPerBalita({ anakList, pengukuranByAnak }) {
  const safeAnak = anakList ?? [];

  return safeAnak
    .map((anak) => {
      const pengukuran = pengukuranByAnak?.[anak.id] ?? [];
      if (pengukuran.length === 0) {
        return {
          id: anak.id,
          nama: anak.nama,
          tanggalUkur: null,
          bbu: BBU.UNKNOWN,
          tbu: TBU.UNKNOWN,
          lku: LKU.UNKNOWN,
          gizi: 'unknown',
        };
      }

      const latest = pengukuran.reduce((a, b) =>
        (a.date ?? '').localeCompare(b.date ?? '') > 0 ? a : b
      );

      return {
        id: anak.id,
        nama: anak.nama,
        tanggalUkur: latest.date ?? null,
        bbu: normalizeBBU(anak.status_berat_terakhir),
        tbu: normalizeTBU(anak.status_tinggi_terakhir),
        lku: normalizeLKU(anak.status_lingkaran_kepala_terakhir),
        gizi: Object.keys(anak.gizi ?? {}).find((k) => (anak.gizi as any)[k] > 0) || STATUS.UNKNOWN,
      };
    })
    .sort((a, b) =>
      (a.nama ?? '').localeCompare(b.nama ?? '', 'id', { sensitivity: 'base' })
    );
}
