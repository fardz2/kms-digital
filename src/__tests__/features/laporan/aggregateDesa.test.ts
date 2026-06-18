import { describe, expect, test } from 'vitest';
import { aggregateDesaDariAnak } from '../../../features/laporan/aggregateDesa';

describe('aggregateDesaDariAnak', () => {
  test('menghitung gizi desa ke 4 status ringkas', () => {
    const result = aggregateDesaDariAnak({
      posyanduStats: [
        {
          id_posyandu: 10,
          nama_posyandu: 'Posyandu Melati',
        },
      ],
      anakList: [
        { id: 1, id_posyandu: 10 },
        { id: 2, id_posyandu: 10 },
        { id: 3, id_posyandu: 10 },
      ],
      pengukuranByAnak: {
        1: [
          {
            date: '2026-06-01',
            z_score_berat: 0,
            z_score_tinggi: 0,
            z_score_lingkar_kepala: 0,
            z_score_gizi: 0,
          },
        ],
        2: [
          {
            date: '2026-06-02',
            z_score_berat: 0,
            z_score_tinggi: 0,
            z_score_lingkar_kepala: 0,
            z_score_gizi: 3.2,
          },
        ],
      },
    });

    expect(result.totalBalita).toBe(3);
    expect(result.tanpaPosyandu).toBe(0);
    expect(result.tanpaPosyanduList).toEqual([]);
    expect(result.posyanduTidakDikenal).toBe(0);
    expect(result.posyanduTidakDikenalList).toEqual([]);
    expect(result.perPosyandu).toHaveLength(1);
    expect(result.perPosyandu[0].total).toBe(3);
    expect(result.perPosyandu[0].beratBadan.normal).toBe(2);
    expect(result.perPosyandu[0].gizi.normal).toBe(1);
    expect(result.perPosyandu[0].gizi.obesitas).toBe(1);
    expect(result.distribusiBB.normal).toBe(2);
    expect(result.distribusiGizi.normal).toBe(1);
    expect(result.distribusiGizi.obesitas).toBe(1);
  });

  test('mencatat balita tanpa id_posyandu sebagai temuan audit', () => {
    const result = aggregateDesaDariAnak({
      posyanduStats: [
        {
          id_posyandu: 10,
          nama_posyandu: 'Posyandu Melati',
        },
      ],
      anakList: [
        { id: 1, id_posyandu: 10 },
        { id: 2, id_posyandu: null },
      ],
      pengukuranByAnak: {
        1: [
          {
            date: '2026-06-01',
            z_score_berat: 0,
            z_score_tinggi: 0,
            z_score_lingkar_kepala: 0,
            z_score_gizi: 0,
          },
        ],
        2: [],
      },
    });

    expect(result.totalBalita).toBe(2);
    expect(result.tanpaPosyandu).toBe(1);
    expect(result.tanpaPosyanduList).toEqual([{ id: 2, nama: 'Balita 2' }]);
    expect(result.perPosyandu).toHaveLength(1);
    expect(result.perPosyandu[0].total).toBe(1);
  });

  test('mencatat balita dengan id_posyandu yang tidak dikenal sebagai temuan audit', () => {
    const result = aggregateDesaDariAnak({
      posyanduStats: [
        {
          id_posyandu: 10,
          nama_posyandu: 'Posyandu Melati',
        },
      ],
      anakList: [
        { id: 1, id_posyandu: 10 },
        { id: 2, id_posyandu: 99, nama: 'Balita 99' },
      ],
      pengukuranByAnak: {
        1: [
          {
            date: '2026-06-01',
            z_score_berat: 0,
            z_score_tinggi: 0,
            z_score_lingkar_kepala: 0,
            z_score_gizi: 0,
          },
        ],
        2: [],
      },
    });

    expect(result.totalBalita).toBe(2);
    expect(result.posyanduTidakDikenal).toBe(1);
    expect(result.posyanduTidakDikenalList).toEqual([
      { id: 2, nama: 'Balita 99', idPosyandu: 99 },
    ]);
    expect(result.perPosyandu).toHaveLength(2);
  });
});
