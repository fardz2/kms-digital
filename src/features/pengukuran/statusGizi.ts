export const STATUS = {
  NORMAL: 'normal',
  KURANG: 'kurang',
  STUNTING: 'stunting',
  OBESITAS: 'obesitas',
  UNKNOWN: 'unknown',
};

const isZ = (z) => z != null && Number.isFinite(z);

// --- Klasifikasi per-indikator sesuai WHO / Permenkes No. 2 Tahun 2020 ---

// BB/U: Berat Badan menurut Umur
export const BBU = {
  SANGAT_KURANG: 'bb_sangat_kurang',
  KURANG: 'bb_kurang',
  NORMAL: 'bb_normal',
  LEBIH: 'bb_lebih',
  UNKNOWN: 'unknown',
};

export function classifyBBU(z) {
  if (!isZ(z)) return BBU.UNKNOWN;

  if (z > 2) return BBU.LEBIH;
  if (z > -2 && z <= 2) return BBU.NORMAL;
  if (z >= -3 && z <= -2) return BBU.KURANG;

  return BBU.SANGAT_KURANG;
}

// TB/U (atau PB/U): Tinggi/Panjang Badan menurut Umur
export const TBU = {
  SANGAT_PENDEK: 'sangat_pendek',
  PENDEK: 'pendek',
  NORMAL: 'tb_normal',
  TINGGI: 'tinggi',
  UNKNOWN: 'unknown',
};

export function classifyTBU(z) {
  if (!isZ(z)) return TBU.UNKNOWN;
  if (z < -3) return TBU.SANGAT_PENDEK;
  if (z < -2) return TBU.PENDEK;
  if (z <= 3) return TBU.NORMAL;
  return TBU.TINGGI;
}

// BB/TB (atau BB/PB): Berat Badan menurut Tinggi/Panjang Badan
export const BBTB = {
  GIZI_BURUK: 'gizi_buruk',
  GIZI_KURANG: 'gizi_kurang',
  GIZI_BAIK: 'gizi_baik',
  BERISIKO_LEBIH: 'berisiko_gizi_lebih',
  GIZI_LEBIH: 'gizi_lebih',
  OBESITAS: 'obesitas',
  UNKNOWN: 'unknown',
};

export function classifyBBTB(z) {
  if (!isZ(z)) return BBTB.UNKNOWN;
  if (z < -3) return BBTB.GIZI_BURUK;
  if (z < -2) return BBTB.GIZI_KURANG;
  if (z <= 1) return BBTB.GIZI_BAIK;
  if (z <= 2) return BBTB.BERISIKO_LEBIH;
  if (z <= 3) return BBTB.GIZI_LEBIH;
  return BBTB.OBESITAS;
}

// LK/U: Lingkar Kepala menurut Umur (indikator perkembangan, bukan status gizi)
export const LKU = {
  MIKROSEFALI: 'mikrosefali',
  NORMAL: 'lk_normal',
  MAKROSEFALI: 'makrosefali',
  UNKNOWN: 'unknown',
};

export function classifyLKU(z) {
  if (!isZ(z)) return LKU.UNKNOWN;
  if (z < -2) return LKU.MIKROSEFALI;
  if (z <= 2) return LKU.NORMAL;
  return LKU.MAKROSEFALI;
}

// --- Normalisasi string dari backend → enum lokal ---
// Dipakai saat endpoint mengirim status dalam bentuk teks (e.g. "Kurus", "Pendek")
// agar konsisten dengan enum lokal yang dipakai tabel & chart.

export function normalizeBBU(s: string | null | undefined): string {
  if (!s) return BBU.UNKNOWN;
  const map: Record<string, string> = {
    'Sangat Kurus': BBU.SANGAT_KURANG,
    'Kurus': BBU.KURANG,
    'Normal': BBU.NORMAL,
    'Gemuk': BBU.LEBIH,
  };
  return map[s] ?? BBU.UNKNOWN;
}

export function normalizeTBU(s: string | null | undefined): string {
  if (!s) return TBU.UNKNOWN;
  const map: Record<string, string> = {
    'Sangat Pendek': TBU.SANGAT_PENDEK,
    'Pendek': TBU.PENDEK,
    'Normal': TBU.NORMAL,
    'Tinggi': TBU.TINGGI,
  };
  return map[s] ?? TBU.UNKNOWN;
}

export function normalizeLKU(s: string | null | undefined): string {
  if (!s) return LKU.UNKNOWN;
  const map: Record<string, string> = {
    'Mikrosefali': LKU.MIKROSEFALI,
    'Normal': LKU.NORMAL,
    'Makrosefali': LKU.MAKROSEFALI,
  };
  return map[s] ?? LKU.UNKNOWN;
}

export function classifyAll({ zScoreBB, zScoreTB, zScoreLK, zScoreGizi }) {
  return {
    bbu: classifyBBU(zScoreBB),
    tbu: classifyTBU(zScoreTB),
    bbtb: classifyBBTB(zScoreGizi),
    lku: classifyLKU(zScoreLK),
  };
}

export const INDICATOR_LABEL = {
  [BBU.SANGAT_KURANG]: 'BB Sangat Kurang',
  [BBU.KURANG]: 'BB Kurang',
  [BBU.NORMAL]: 'BB Normal',
  [BBU.LEBIH]: 'Risiko BB Lebih',
  [TBU.SANGAT_PENDEK]: 'Sangat Pendek',
  [TBU.PENDEK]: 'Pendek',
  [TBU.NORMAL]: 'Tinggi Normal',
  [TBU.TINGGI]: 'Tinggi',
  [BBTB.GIZI_BURUK]: 'Gizi Buruk',
  [BBTB.GIZI_KURANG]: 'Gizi Kurang',
  [BBTB.GIZI_BAIK]: 'Gizi Baik',
  [BBTB.BERISIKO_LEBIH]: 'Berisiko Gizi Lebih',
  [BBTB.GIZI_LEBIH]: 'Gizi Lebih',
  [BBTB.OBESITAS]: 'Obesitas',
  [LKU.MIKROSEFALI]: 'Mikrosefali',
  [LKU.NORMAL]: 'LK Normal',
  [LKU.MAKROSEFALI]: 'Makrosefali',
  unknown: '-',
};

// Tone untuk pewarnaan badge per kategori indikator.
export const INDICATOR_TONE = {
  [BBU.SANGAT_KURANG]: 'danger',
  [BBU.KURANG]: 'warning',
  [BBU.NORMAL]: 'normal',
  [BBU.LEBIH]: 'warning',
  [TBU.SANGAT_PENDEK]: 'danger',
  [TBU.PENDEK]: 'warning',
  [TBU.NORMAL]: 'normal',
  [TBU.TINGGI]: 'normal',
  [BBTB.GIZI_BURUK]: 'danger',
  [BBTB.GIZI_KURANG]: 'warning',
  [BBTB.GIZI_BAIK]: 'normal',
  [BBTB.BERISIKO_LEBIH]: 'warning',
  [BBTB.GIZI_LEBIH]: 'warning',
  [BBTB.OBESITAS]: 'danger',
  [LKU.MIKROSEFALI]: 'warning',
  [LKU.NORMAL]: 'normal',
  [LKU.MAKROSEFALI]: 'warning',
  unknown: 'unknown',
};

// --- Ringkasan status (4 kategori) untuk badge tunggal & distribusi laporan ---
// Sumber tiap kategori mengikuti standar WHO:
//   STUNTING  ← TB/U  (z < -2)
//   OBESITAS  ← BB/TB (z > +2)
//   KURANG    ← BB/TB (z < -2) atau BB/U (z < -2)
//   LK/U tidak menentukan status gizi.
const SEVERITY = {
  [STATUS.STUNTING]: 4,
  [STATUS.OBESITAS]: 3,
  [STATUS.KURANG]: 2,
  [STATUS.NORMAL]: 1,
  [STATUS.UNKNOWN]: 0,
};

export function overallStatus({ zScoreBB, zScoreTB, zScoreGizi }: {
  zScoreBB?: number | null;
  zScoreTB?: number | null;
  zScoreGizi?: number | null;
  zScoreLK?: number | null;
}) {
  const candidates = [];

  if (isZ(zScoreTB)) {
    candidates.push(zScoreTB < -2 ? STATUS.STUNTING : STATUS.NORMAL);
  }
  if (isZ(zScoreGizi)) {
    if (zScoreGizi > 2) candidates.push(STATUS.OBESITAS);
    else if (zScoreGizi < -2) candidates.push(STATUS.KURANG);
    else candidates.push(STATUS.NORMAL);
  }
  if (isZ(zScoreBB)) {
    candidates.push(zScoreBB < -2 ? STATUS.KURANG : STATUS.NORMAL);
  }

  if (candidates.length === 0) return STATUS.UNKNOWN;

  return candidates.reduce((worst, current) =>
    SEVERITY[current] > SEVERITY[worst] ? current : worst
  );
}

export const STATUS_LABEL = {
  [STATUS.NORMAL]: 'Normal',
  [STATUS.KURANG]: 'Kurang',
  [STATUS.STUNTING]: 'Stunting',
  [STATUS.OBESITAS]: 'Obesitas',
  [STATUS.UNKNOWN]: '-',
};
