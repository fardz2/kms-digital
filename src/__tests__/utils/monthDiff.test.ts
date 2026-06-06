import { describe, expect, test } from 'vitest';
import { monthDiff } from '../../utils/monthDiff';

describe('monthDiff', () => {
  test('returns whole months between two dates', () => {
    expect(monthDiff('2024-01-01', '2024-07-01')).toBe(6);
  });

  test('returns 0 within the same month', () => {
    expect(monthDiff('2024-01-01', '2024-01-20')).toBe(0);
  });

  test('returns negative when end is before start (no Math.abs)', () => {
    expect(monthDiff('2024-07-01', '2024-01-01')).toBe(-6);
  });

  test('measurement date before birth date yields negative age', () => {
    const birth = '2024-05-10';
    const measured = '2024-03-10';
    expect(monthDiff(birth, measured)).toBeLessThan(0);
  });
});
