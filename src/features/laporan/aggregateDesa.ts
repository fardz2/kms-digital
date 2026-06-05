export interface PosyanduStat {
  id_posyandu?: number;
  nama_posyandu?: string;
  berat_badan?: Record<string, number>;
  tinggi_badan?: Record<string, number>;
  lingkar_kepala?: Record<string, number>;
}

export interface PerPosyanduSummary {
  id?: number;
  nama?: string;
  total: number;
}

export interface AggregatedDesa {
  totalBalita: number;
  perPosyandu: PerPosyanduSummary[];
  distribusiBB: Record<string, number>;
  distribusiTB: Record<string, number>;
  distribusiLK: Record<string, number>;
}

function sumCategory(cat: Record<string, number> | undefined): number {
  if (!cat || typeof cat !== 'object') return 0;
  return Object.values(cat).reduce((acc: number, v) => acc + Number(v || 0), 0);
}

export function aggregateDesa(statistik: PosyanduStat[] | unknown): AggregatedDesa {
  if (!Array.isArray(statistik) || statistik.length === 0) {
    return {
      totalBalita: 0,
      perPosyandu: [],
      distribusiBB: {},
      distribusiTB: {},
      distribusiLK: {},
    };
  }

  const perPosyandu: PerPosyanduSummary[] = statistik.map((p: PosyanduStat) => ({
    id: p.id_posyandu,
    nama: p.nama_posyandu,
    total: sumCategory(p.berat_badan),
  }));
  const totalBalita = perPosyandu.reduce((acc, x) => acc + x.total, 0);

  const reduceCategory = (key: 'berat_badan' | 'tinggi_badan' | 'lingkar_kepala') => {
    const acc: Record<string, number> = {};
    statistik.forEach((p: PosyanduStat) => {
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
  };
}
