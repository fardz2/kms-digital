import { describe, expect, test } from 'vitest';
import { guideContent } from '../../../features/user-guide/data/guideContent';

const expectedStepIdsBySection = {
  'admin-dashboard-ringkas': ['open-admin-dashboard', 'review-summary-cards'],
  'admin-artikel-baru': ['open-new-article-form', 'fill-article-fields'],
  'desa-beranda': ['open-village-home', 'review-village-info'],
  'kader-balita': ['open-child-list', 'open-child-detail'],
  'kader-orangtua': ['open-parent-data', 'review-parent-account'],
  'kader-laporan': ['open-monthly-report', 'complete-report-data'],
  'tenkes-forum': ['open-health-forum', 'select-relevant-discussion'],
  'tenkes-balita-detail': ['open-child-detail-page', 'review-supporting-info'],
  'orangtua-balita': ['open-child-summary', 'review-growth-summary'],
  'orangtua-forum': ['open-parent-forum', 'find-discussion-topic'],
  'orangtua-forum-detail': ['open-forum-topic', 'read-existing-replies'],
  'orangtua-balita-detail': ['open-child-detail-from-list', 'verify-child-data'],
} as const;

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

  test('gives every role at least one section with route, screenshot file, structured steps, expected result, and tips', () => {
    guideContent.forEach((role) => {
      expect(role.title).toBeTruthy();
      expect(role.summary).toBeTruthy();
      expect(role.sections.length).toBeGreaterThan(0);

      role.sections.forEach((section) => {
        const expectedStepIds = expectedStepIdsBySection[section.id as keyof typeof expectedStepIdsBySection];

        expect(section.route.startsWith('/')).toBe(true);
        expect(section.screenshotFile).toMatch(/\.png$/);
        expect(section.steps.map((step) => step.id)).toEqual(expectedStepIds);
        expect(section.expectedResult).toBeTruthy();
        expect(section.tips.length).toBeGreaterThan(0);

        section.steps.forEach((step) => {
          expect(step).toEqual({
            id: expect.any(String),
            label: expect.any(String),
            action: expect.any(String),
            result: expect.any(String),
          });
          expect(Object.keys(step).sort()).toEqual(['action', 'id', 'label', 'result']);
        });
      });
    });
  });
});
