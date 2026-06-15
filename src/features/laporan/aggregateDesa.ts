import {
  classifyBBTB,
  classifyBBU,
  classifyLKU,
  classifyTBU,
} from '../pengukuran/statusGizi';

export interface PosyanduStat {
  id_posyandu?: number;
  nama_posyandu?: string;
  berat_badan?: Record<string, number>;
  tinggi_badan?: Record<string, number>;
  lingkar_kepala?: Record<string, number>;
}

export interface AnakDesaStat {
  id: number;
  id_posyandu?: number | null;
}

export interface PengukuranDesaStat {
  date?: string | null;
  z_score_berat?: number | string | null;
  z_score_tinggi?: number | string | null;
  z_score_lingkar_kepala?: number | string | null;
  z_score_gizi?: number | string | null;
}

export interface PerPosyanduSummary {
  id?: number;
  nama?: string;
  total: number;
  beratBadan: Record<string, number>;
  tinggiBadan: Record<string, number>;
  lingkarKepala: Record<string, number>;
  gizi: Record<string, number>;
}

export interface AggregatedDesa {
  totalBalita: number;
  perPosyandu: PerPosyanduSummary[];
  distribusiBB: Record<string, number>;
  distribusiTB: Record<string, number>;
  distribusiLK: Record<string, number>;
  distribusiGizi: Record<string, number>;
}

function sumCategory(cat: Record<string, number> | undefined): number {
  if (!cat || typeof cat !== 'object') return 0;
  return Object.values(cat).reduce((acc: number, v) => acc + Number(v || 0), 0);
}

function makeEmptyCounts(order: string[]): Record<string, number> {
  return order.reduce((acc: Record<string, number>, key) => {
    acc[key] = 0;
    return acc;
  }, {});
}

function isAggregateRow(p: PosyanduStat): boolean {
  const nama = (p.nama_posyandu ?? '').toLowerCase().trim();
  return (
    nama === '' ||
    nama.includes('semua posyandu') ||
    nama.startsWith('total')
  );
}

// Kategori `berat_badan` dari endpoint statistik-gizi memakai istilah BB/TB
// (sangat_kurus / kurus / normal / gemuk), sama seperti klasifikasi status gizi
// di Detail Anak. Petakan ke label status gizi yang eksplisit.
const GIZI_MAP: Record<string, string> = {
  sangat_kurus: 'gizi_buruk',
  kurus: 'gizi_kurang',
  normal: 'gizi_baik',
  gemuk: 'gizi_lebih',
  obesitas: 'obesitas',
};

function toGizi(cat: Record<string, number>): Record<string, number> {
  const acc: Record<string, number> = {};
  Object.entries(cat ?? {}).forEach(([k, v]) => {
    const key = GIZI_MAP[k] ?? k;
    acc[key] = (acc[key] ?? 0) + Number(v || 0);
  });
  return acc;
}

export function aggregateDesa(statistik: PosyanduStat[] | unknown): AggregatedDesa {
  if (!Array.isArray(statistik) || statistik.length === 0) {
    return {
      totalBalita: 0,
      perPosyandu: [],
      distribusiBB: {},
      distribusiTB: {},
      distribusiLK: {},
      distribusiGizi: {},
    };
  }

  const realPosyandu = statistik.filter(
    (p: PosyanduStat) => !isAggregateRow(p)
  );

  const perPosyandu: PerPosyanduSummary[] = realPosyandu
    .map((p: PosyanduStat) => ({
      id: p.id_posyandu,
      nama: p.nama_posyandu,
      total: sumCategory(p.berat_badan),
      beratBadan: p.berat_badan ?? {},
      tinggiBadan: p.tinggi_badan ?? {},
      lingkarKepala: p.lingkar_kepala ?? {},
      gizi: toGizi(p.berat_badan ?? {}),
    }))
    .sort((a, b) =>
      (a.nama ?? '').localeCompare(b.nama ?? '', 'id', { sensitivity: 'base' })
    );
  const totalBalita = perPosyandu.reduce((acc, x) => acc + x.total, 0);

  const reduceCategory = (key: 'berat_badan' | 'tinggi_badan' | 'lingkar_kepala') => {
    const acc: Record<string, number> = {};
    realPosyandu.forEach((p: PosyanduStat) => {
      const cat = p[key] ?? {};
      Object.entries(cat).forEach(([k, v]) => {
        acc[k] = (acc[k] ?? 0) + Number(v || 0);
      });
    });
    return acc;
  };

  return {
    totalBalita,
    perPosyandu,
    distribusiBB: reduceCategory('berat_badan'),
    distribusiTB: reduceCategory('tinggi_badan'),
    distribusiLK: reduceCategory('lingkar_kepala'),
    distribusiGizi: toGizi(reduceCategory('berat_badan')),
  };
}

const BBU_ORDER = ['sangat_kurus', 'kurus', 'normal', 'gemuk'];
const TBU_ORDER = ['sangat_pendek', 'pendek', 'normal', 'tinggi'];
const LKU_ORDER = ['mikrosefali', 'normal', 'makrosefali'];
const BBTB_ORDER = [
  'gizi_buruk',
  'gizi_kurang',
  'gizi_baik',
  'berisiko_gizi_lebih',
  'gizi_lebih',
  'obesitas',
];

function latestPengukuran(
  pengukuran: PengukuranDesaStat[] | undefined
): PengukuranDesaStat | null {
  if (!Array.isArray(pengukuran) || pengukuran.length === 0) return null;
  return pengukuran.reduce((latest, current) =>
    (latest.date ?? '').localeCompare(current.date ?? '') > 0 ? latest : current
  );
}

function toZ(value: number | string | null | undefined): number | null {
  return value == null || value === '' ? null : Number(value);
}

function createSummary(id?: number, nama?: string): PerPosyanduSummary {
  return {
    id,
    nama,
    total: 0,
    beratBadan: makeEmptyCounts(BBU_ORDER),
    tinggiBadan: makeEmptyCounts(TBU_ORDER),
    lingkarKepala: makeEmptyCounts(LKU_ORDER),
    gizi: makeEmptyCounts(BBTB_ORDER),
  };
}

function addCounts(
  target: Record<string, number>,
  source: Record<string, number>
): void {
  Object.entries(source).forEach(([key, value]) => {
    target[key] = (target[key] ?? 0) + Number(value || 0);
  });
}

// Agregasi desa yang benar-benar dihitung dari data anak + pengukuran terakhir.
// Ini dipakai supaya BB/U dan Gizi (BB/TB) bisa berbeda di laporan desa.
export function aggregateDesaDariAnak({
  posyanduStats,
  anakList,
  pengukuranByAnak,
}: {
  posyanduStats?: PosyanduStat[] | unknown;
  anakList?: AnakDesaStat[] | unknown;
  pengukuranByAnak?: Record<number, PengukuranDesaStat[]>;
}): AggregatedDesa {
  const metaPosyandu = Array.isArray(posyanduStats)
    ? posyanduStats.filter((p: PosyanduStat) => !isAggregateRow(p))
    : [];
  const safeAnak = Array.isArray(anakList) ? anakList : [];
  const summaryMap = new Map<number, PerPosyanduSummary>();
  const metaById = new Map(
    metaPosyandu
      .filter((p: PosyanduStat) => p.id_posyandu != null)
      .map((p: PosyanduStat) => [p.id_posyandu as number, p.nama_posyandu] as const)
  );

  metaPosyandu.forEach((p: PosyanduStat) => {
    if (p.id_posyandu == null) return;
    summaryMap.set(
      p.id_posyandu,
      createSummary(p.id_posyandu, p.nama_posyandu)
    );
  });

  safeAnak.forEach((anak: AnakDesaStat) => {
    const latest = latestPengukuran(pengukuranByAnak?.[anak.id]);
    if (!latest) return;

    const bbu = classifyBBU(toZ(latest.z_score_berat));
    const tbu = classifyTBU(toZ(latest.z_score_tinggi));
    const lku = classifyLKU(toZ(latest.z_score_lingkar_kepala));
    const gizi = classifyBBTB(toZ(latest.z_score_gizi));

    if ([bbu, tbu, lku, gizi].some((status) => status === 'unknown')) return;

    const idPosyandu = anak.id_posyandu;
    if (idPosyandu == null) return;

    const row =
      summaryMap.get(idPosyandu) ??
      createSummary(idPosyandu, metaById.get(idPosyandu));

    row.total += 1;
    row.beratBadan[bbu] = (row.beratBadan[bbu] ?? 0) + 1;
    row.tinggiBadan[tbu] = (row.tinggiBadan[tbu] ?? 0) + 1;
    row.lingkarKepala[lku] = (row.lingkarKepala[lku] ?? 0) + 1;
    row.gizi[gizi] = (row.gizi[gizi] ?? 0) + 1;
    summaryMap.set(idPosyandu, row);
  });

  const perPosyandu = Array.from(summaryMap.values()).sort((a, b) =>
    (a.nama ?? '').localeCompare(b.nama ?? '', 'id', { sensitivity: 'base' }) ||
    (a.id ?? 0) - (b.id ?? 0)
  );

  const totalBalita = perPosyandu.reduce((acc, row) => acc + row.total, 0);
  const distribusiBB: Record<string, number> = {};
  const distribusiTB: Record<string, number> = {};
  const distribusiLK: Record<string, number> = {};
  const distribusiGizi: Record<string, number> = {};

  perPosyandu.forEach((row) => {
    addCounts(distribusiBB, row.beratBadan);
    addCounts(distribusiTB, row.tinggiBadan);
    addCounts(distribusiLK, row.lingkarKepala);
    addCounts(distribusiGizi, row.gizi);
  });

  return {
    totalBalita,
    perPosyandu,
    distribusiBB,
    distribusiTB,
    distribusiLK,
    distribusiGizi,
  };
}
