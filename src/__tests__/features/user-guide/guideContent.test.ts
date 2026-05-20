import { describe, expect, test } from 'vitest';
import { guideContent } from '../../../features/user-guide/data/guideContent';

describe('guideContent', () => {
  test('covers the five required roles in the expected order', () => {
    expect(guideContent.map((role) => role.id)).toEqual([
      'ADMIN',
      'DESA',
      'KADER_POSYANDU',
      'TENAGA_KESEHATAN',
      'ORANG_TUA',
    ]);
  });

  test('gives every role at least one section with route, screenshot file, steps, expected result, and tips', () => {
    guideContent.forEach((role) => {
      expect(role.title).toBeTruthy();
      expect(role.summary).toBeTruthy();
      expect(role.sections.length).toBeGreaterThan(0);

      role.sections.forEach((section) => {
        expect(section.route.startsWith('/')).toBe(true);
        expect(section.screenshotFile).toMatch(/\.png$/);
        expect(section.steps.length).toBeGreaterThan(0);
        expect(section.expectedResult).toBeTruthy();
        expect(section.tips.length).toBeGreaterThan(0);
      });
    });
  });
});
