import {
  STATUS,
  BBU,
  TBU,
  BBTB,
  LKU,
  classifyBBU,
  classifyTBU,
  classifyBBTB,
  classifyLKU,
  classifyAll,
  overallStatus,
  STATUS_LABEL,
  INDICATOR_LABEL,
} from '../../../features/pengukuran/statusGizi';

describe('classifyBBU (Berat Badan menurut Umur)', () => {
  test('null or NaN returns unknown', () => {
    expect(classifyBBU(null)).toBe(BBU.UNKNOWN);
    expect(classifyBBU(NaN)).toBe(BBU.UNKNOWN);
  });

  test('z < -3 is sangat kurang', () => {
    expect(classifyBBU(-3.1)).toBe(BBU.SANGAT_KURANG);
  });

  test('-3 <= z < -2 is kurang', () => {
    expect(classifyBBU(-3)).toBe(BBU.KURANG);
    expect(classifyBBU(-2.1)).toBe(BBU.KURANG);
  });

  test('-2 <= z <= 1 is normal', () => {
    expect(classifyBBU(-2)).toBe(BBU.NORMAL);
    expect(classifyBBU(0)).toBe(BBU.NORMAL);
    expect(classifyBBU(1)).toBe(BBU.NORMAL);
  });

  test('z > 1 is risiko lebih', () => {
    expect(classifyBBU(1.1)).toBe(BBU.LEBIH);
  });
});

describe('classifyTBU (Tinggi menurut Umur)', () => {
  test('z < -3 is sangat pendek', () => {
    expect(classifyTBU(-3.1)).toBe(TBU.SANGAT_PENDEK);
  });

  test('-3 <= z < -2 is pendek', () => {
    expect(classifyTBU(-2.5)).toBe(TBU.PENDEK);
  });

  test('-2 <= z <= 3 is normal', () => {
    expect(classifyTBU(-2)).toBe(TBU.NORMAL);
    expect(classifyTBU(3)).toBe(TBU.NORMAL);
  });

  test('z > 3 is tinggi', () => {
    expect(classifyTBU(3.1)).toBe(TBU.TINGGI);
  });
});

describe('classifyBBTB (Berat menurut Tinggi)', () => {
  test('z < -3 is gizi buruk', () => {
    expect(classifyBBTB(-3.1)).toBe(BBTB.GIZI_BURUK);
  });

  test('-3 <= z < -2 is gizi kurang', () => {
    expect(classifyBBTB(-2.5)).toBe(BBTB.GIZI_KURANG);
  });

  test('-2 <= z <= 1 is gizi baik', () => {
    expect(classifyBBTB(0)).toBe(BBTB.GIZI_BAIK);
    expect(classifyBBTB(1)).toBe(BBTB.GIZI_BAIK);
  });

  test('1 < z <= 2 is berisiko gizi lebih', () => {
    expect(classifyBBTB(1.5)).toBe(BBTB.BERISIKO_LEBIH);
    expect(classifyBBTB(2)).toBe(BBTB.BERISIKO_LEBIH);
  });

  test('2 < z <= 3 is gizi lebih', () => {
    expect(classifyBBTB(2.5)).toBe(BBTB.GIZI_LEBIH);
    expect(classifyBBTB(3)).toBe(BBTB.GIZI_LEBIH);
  });

  test('z > 3 is obesitas', () => {
    expect(classifyBBTB(3.1)).toBe(BBTB.OBESITAS);
  });
});

describe('classifyLKU (Lingkar Kepala)', () => {
  test('z < -2 is mikrosefali', () => {
    expect(classifyLKU(-2.1)).toBe(LKU.MIKROSEFALI);
  });

  test('-2 <= z <= 2 is normal', () => {
    expect(classifyLKU(0)).toBe(LKU.NORMAL);
  });

  test('z > 2 is makrosefali', () => {
    expect(classifyLKU(2.1)).toBe(LKU.MAKROSEFALI);
  });
});

describe('classifyAll', () => {
  test('returns category per indicator', () => {
    expect(
      classifyAll({ zScoreBB: -2.5, zScoreTB: -2.5, zScoreLK: 0, zScoreGizi: -2.5 })
    ).toEqual({
      bbu: BBU.KURANG,
      tbu: TBU.PENDEK,
      bbtb: BBTB.GIZI_KURANG,
      lku: LKU.NORMAL,
    });
  });
});

describe('overallStatus', () => {
  test('returns unknown when all scores null', () => {
    expect(
      overallStatus({ zScoreBB: null, zScoreTB: null, zScoreLK: null, zScoreGizi: null })
    ).toBe(STATUS.UNKNOWN);
  });

  test('returns normal when all indicators normal', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: 0.5, zScoreLK: -0.5, zScoreGizi: 1 })
    ).toBe(STATUS.NORMAL);
  });

  test('stunting comes from TB/U only', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: -3.1, zScoreLK: 0, zScoreGizi: 0 })
    ).toBe(STATUS.STUNTING);
  });

  test('high TB/U is not obesitas', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: 4, zScoreLK: 0, zScoreGizi: 0 })
    ).toBe(STATUS.NORMAL);
  });

  test('obesitas comes from BB/TB above +2', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: 0, zScoreLK: 0, zScoreGizi: 2.5 })
    ).toBe(STATUS.OBESITAS);
  });

  test('BB/TB between +1 and +2 is not obesitas', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: 0, zScoreLK: 0, zScoreGizi: 1.5 })
    ).toBe(STATUS.NORMAL);
  });

  test('stunting beats obesitas', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: -3.2, zScoreLK: 0, zScoreGizi: 2.5 })
    ).toBe(STATUS.STUNTING);
  });

  test('underweight (BB/U < -2) is kurang', () => {
    expect(
      overallStatus({ zScoreBB: -2.5, zScoreTB: 0, zScoreLK: null, zScoreGizi: null })
    ).toBe(STATUS.KURANG);
  });

  test('LK/U does not affect gizi status', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: 0, zScoreLK: -3, zScoreGizi: 0 })
    ).toBe(STATUS.NORMAL);
  });
});

describe('labels', () => {
  test('STATUS_LABEL has Indonesian labels', () => {
    expect(STATUS_LABEL[STATUS.NORMAL]).toBe('Normal');
    expect(STATUS_LABEL[STATUS.KURANG]).toBe('Kurang');
    expect(STATUS_LABEL[STATUS.STUNTING]).toBe('Stunting');
    expect(STATUS_LABEL[STATUS.OBESITAS]).toBe('Obesitas');
  });

  test('INDICATOR_LABEL covers each indicator category', () => {
    expect(INDICATOR_LABEL[TBU.SANGAT_PENDEK]).toBe('Sangat Pendek');
    expect(INDICATOR_LABEL[BBTB.OBESITAS]).toBe('Obesitas');
    expect(INDICATOR_LABEL[BBU.LEBIH]).toBe('Risiko BB Lebih');
  });
});
