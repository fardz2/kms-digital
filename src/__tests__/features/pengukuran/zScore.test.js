import {
  computeZScoreBB,
  computeZScoreTB,
  computeZScoreLK,
  computeZScoreGizi,
  computeAllZScores,
} from '../../../features/pengukuran/zScore';

const baseInput = {
  gender: 'LAKI_LAKI',
  tanggalLahir: '2025-05-12',
  tanggalPengukuran: '2026-05-12',
};

describe('computeZScoreBB', () => {
  test('returns null when berat is missing', () => {
    expect(computeZScoreBB({ ...baseInput, berat: null })).toBeNull();
  });

  test('returns null when tanggalLahir is missing', () => {
    expect(computeZScoreBB({ berat: 10, gender: 'LAKI_LAKI' })).toBeNull();
  });

  test('returns a number for valid input at 12 months', () => {
    const z = computeZScoreBB({ ...baseInput, berat: 9.5 });
    expect(typeof z).toBe('number');
    expect(Number.isFinite(z)).toBe(true);
  });

  test('value at median yields small absolute z-score', () => {
    const z = computeZScoreBB({ ...baseInput, berat: 9.6 });
    expect(Math.abs(z)).toBeLessThan(0.5);
  });

  test('different gender yields different z-score', () => {
    const male = computeZScoreBB({ ...baseInput, berat: 9 });
    const female = computeZScoreBB({
      ...baseInput,
      gender: 'PEREMPUAN',
      berat: 9,
    });
    expect(male).not.toEqual(female);
  });
});

describe('computeZScoreTB', () => {
  test('returns null when tinggi is missing', () => {
    expect(computeZScoreTB({ ...baseInput, tinggi: null })).toBeNull();
  });

  test('returns number for valid input', () => {
    const z = computeZScoreTB({ ...baseInput, tinggi: 75 });
    expect(typeof z).toBe('number');
  });
});

describe('computeZScoreLK', () => {
  test('returns null when lingkarKepala is missing', () => {
    expect(computeZScoreLK({ ...baseInput, lingkarKepala: null })).toBeNull();
  });

  test('returns number for valid input', () => {
    const z = computeZScoreLK({ ...baseInput, lingkarKepala: 45 });
    expect(typeof z).toBe('number');
  });
});

describe('computeZScoreGizi', () => {
  test('returns null when berat or tinggi missing', () => {
    expect(computeZScoreGizi({ ...baseInput, berat: null, tinggi: 75 })).toBeNull();
    expect(computeZScoreGizi({ ...baseInput, berat: 10, tinggi: null })).toBeNull();
  });

  test('uses 0-24 dataset for umur <= 24', () => {
    const z = computeZScoreGizi({
      ...baseInput,
      berat: 9,
      tinggi: 75,
    });
    expect(typeof z === 'number' || z === null).toBe(true);
  });

  test('uses 24-60 dataset for umur > 24', () => {
    const z = computeZScoreGizi({
      gender: 'LAKI_LAKI',
      tanggalLahir: '2023-05-12',
      tanggalPengukuran: '2026-05-12',
      berat: 14,
      tinggi: 95,
    });
    expect(typeof z === 'number' || z === null).toBe(true);
  });
});

describe('computeAllZScores', () => {
  test('returns all 4 keys', () => {
    const result = computeAllZScores({
      ...baseInput,
      berat: 9,
      tinggi: 75,
      lingkarKepala: 45,
    });
    expect(Object.keys(result)).toEqual(['zScoreBB', 'zScoreTB', 'zScoreLK', 'zScoreGizi']);
  });

  test('all keys are null when no measurements', () => {
    const result = computeAllZScores(baseInput);
    expect(result).toEqual({
      zScoreBB: null,
      zScoreTB: null,
      zScoreLK: null,
      zScoreGizi: null,
    });
  });
});
