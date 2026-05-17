import {
  STATUS,
  classifyZScore,
  overallStatus,
  STATUS_LABEL,
} from '../../../features/pengukuran/statusGizi';

describe('classifyZScore', () => {
  test('null or NaN returns unknown', () => {
    expect(classifyZScore(null)).toBe(STATUS.UNKNOWN);
    expect(classifyZScore(undefined)).toBe(STATUS.UNKNOWN);
    expect(classifyZScore(NaN)).toBe(STATUS.UNKNOWN);
  });

  test('z <= -3 is stunting', () => {
    expect(classifyZScore(-3)).toBe(STATUS.STUNTING);
    expect(classifyZScore(-4)).toBe(STATUS.STUNTING);
  });

  test('z between -3 and -2 is kurang', () => {
    expect(classifyZScore(-2.5)).toBe(STATUS.KURANG);
  });

  test('z between -2 and 2 is normal', () => {
    expect(classifyZScore(0)).toBe(STATUS.NORMAL);
    expect(classifyZScore(-1.9)).toBe(STATUS.NORMAL);
    expect(classifyZScore(1.9)).toBe(STATUS.NORMAL);
  });

  test('z > 2 is obesitas', () => {
    expect(classifyZScore(2.5)).toBe(STATUS.OBESITAS);
    expect(classifyZScore(3.5)).toBe(STATUS.OBESITAS);
  });
});

describe('overallStatus', () => {
  test('returns unknown when all scores null', () => {
    expect(
      overallStatus({
        zScoreBB: null,
        zScoreTB: null,
        zScoreLK: null,
        zScoreGizi: null,
      })
    ).toBe(STATUS.UNKNOWN);
  });

  test('returns normal when all scores are normal', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: 0.5, zScoreLK: -0.5, zScoreGizi: 1 })
    ).toBe(STATUS.NORMAL);
  });

  test('picks worst status when mixed', () => {
    expect(
      overallStatus({ zScoreBB: 0, zScoreTB: -3.1, zScoreLK: 0, zScoreGizi: 0 })
    ).toBe(STATUS.STUNTING);
  });

  test('stunting beats obesitas', () => {
    expect(
      overallStatus({ zScoreBB: 3.5, zScoreTB: -3.2, zScoreLK: 0, zScoreGizi: 0 })
    ).toBe(STATUS.STUNTING);
  });

  test('ignores unknown scores', () => {
    expect(
      overallStatus({
        zScoreBB: -2.5,
        zScoreTB: null,
        zScoreLK: null,
        zScoreGizi: null,
      })
    ).toBe(STATUS.KURANG);
  });
});

describe('STATUS_LABEL', () => {
  test('has Indonesian labels for each status', () => {
    expect(STATUS_LABEL[STATUS.NORMAL]).toBe('Normal');
    expect(STATUS_LABEL[STATUS.KURANG]).toBe('Kurang');
    expect(STATUS_LABEL[STATUS.STUNTING]).toBe('Stunting');
    expect(STATUS_LABEL[STATUS.OBESITAS]).toBe('Obesitas');
  });
});
