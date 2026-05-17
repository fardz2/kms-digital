import { aggregateKaderLaporan } from '../../../features/laporan/aggregateKader';

const anakA = { id: 1, nama: 'Budi', tanggal_lahir: '2025-05-12' };
const anakB = { id: 2, nama: 'Siti', tanggal_lahir: '2025-01-01' };
const anakC = { id: 3, nama: 'Rina', tanggal_lahir: '2024-12-01' };

describe('aggregateKaderLaporan', () => {
  test('empty list returns zeros', () => {
    const r = aggregateKaderLaporan({
      anakList: [],
      pengukuranByAnak: {},
      bulan: '2026-05',
    });
    expect(r.totalBalita).toBe(0);
    expect(r.sudahDiukur).toBe(0);
    expect(r.belumDiukur).toBe(0);
    expect(r.belumDiukurList).toEqual([]);
    expect(r.perluPerhatian).toEqual([]);
  });

  test('all anak tanpa pengukuran bulan ini masuk belumDiukur', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA, anakB],
      pengukuranByAnak: { 1: [], 2: [] },
      bulan: '2026-05',
    });
    expect(r.totalBalita).toBe(2);
    expect(r.sudahDiukur).toBe(0);
    expect(r.belumDiukur).toBe(2);
    expect(r.belumDiukurList.map((x) => x.id)).toEqual([1, 2]);
  });

  test('pengukuran di bulan lain tidak dihitung', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA],
      pengukuranByAnak: {
        1: [{ date: '2026-04-15', z_score_berat: 0 }],
      },
      bulan: '2026-05',
    });
    expect(r.sudahDiukur).toBe(0);
    expect(r.belumDiukur).toBe(1);
  });

  test('normal status tidak masuk perluPerhatian', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA],
      pengukuranByAnak: {
        1: [
          {
            date: '2026-05-10',
            z_score_berat: 0,
            z_score_tinggi: 0,
            z_score_lingkar_kepala: 0,
            z_score_gizi: 0,
          },
        ],
      },
      bulan: '2026-05',
    });
    expect(r.sudahDiukur).toBe(1);
    expect(r.distribusi.normal).toBe(1);
    expect(r.perluPerhatian).toEqual([]);
  });

  test('stunting masuk perluPerhatian dan distribusi', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakB],
      pengukuranByAnak: {
        2: [
          {
            date: '2026-05-10',
            z_score_berat: 0,
            z_score_tinggi: -3.5,
            z_score_lingkar_kepala: 0,
            z_score_gizi: 0,
          },
        ],
      },
      bulan: '2026-05',
    });
    expect(r.distribusi.stunting).toBe(1);
    expect(r.perluPerhatian).toHaveLength(1);
    expect(r.perluPerhatian[0].status).toBe('stunting');
  });

  test('multiple pengukuran di bulan sama pakai yang terbaru', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakC],
      pengukuranByAnak: {
        3: [
          { date: '2026-05-05', z_score_berat: -3.5 },
          { date: '2026-05-20', z_score_berat: 0 },
        ],
      },
      bulan: '2026-05',
    });
    expect(r.distribusi.normal).toBe(1);
    expect(r.distribusi.stunting).toBe(0);
  });

  test('mixed: 3 anak, 1 normal + 1 kurang + 1 belum diukur', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA, anakB, anakC],
      pengukuranByAnak: {
        1: [{ date: '2026-05-01', z_score_berat: 0 }],
        2: [{ date: '2026-05-01', z_score_berat: -2.5 }],
        3: [],
      },
      bulan: '2026-05',
    });
    expect(r.totalBalita).toBe(3);
    expect(r.sudahDiukur).toBe(2);
    expect(r.belumDiukur).toBe(1);
    expect(r.distribusi.normal).toBe(1);
    expect(r.distribusi.kurang).toBe(1);
    expect(r.perluPerhatian).toHaveLength(1);
    expect(r.perluPerhatian[0].status).toBe('kurang');
    expect(r.belumDiukurList[0].id).toBe(3);
  });

  test('null z-scores treated as unknown, not normal', () => {
    const r = aggregateKaderLaporan({
      anakList: [anakA],
      pengukuranByAnak: {
        1: [
          {
            date: '2026-05-01',
            z_score_berat: null,
            z_score_tinggi: null,
            z_score_lingkar_kepala: null,
            z_score_gizi: null,
          },
        ],
      },
      bulan: '2026-05',
    });
    expect(r.distribusi.normal).toBe(0);
    expect(r.perluPerhatian).toEqual([]);
  });
});
