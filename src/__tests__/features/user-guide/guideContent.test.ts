import { describe, expect, test } from 'vitest';
import { guideContent } from '../../../features/user-guide/data/guideContent';

const expectedStepIdsBySection = {
  'admin-dashboard-ringkas': ['open-admin-dashboard', 'review-summary-cards', 'open-admin-sidebar', 'review-activity-feed'],
  'admin-desa': ['open-desa-module', 'add-village', 'fill-village-form', 'review-village-table'],
  'admin-posyandu': ['open-posyandu-module', 'choose-village-for-posyandu', 'save-posyandu', 'review-posyandu-table'],
  'admin-kader-posyandu': ['open-kader-module', 'filter-kader-status', 'register-kader', 'fill-kader-form', 'save-kader'],
  'admin-tenaga-kesehatan': ['open-nakes-module', 'register-nakes', 'fill-nakes-form', 'remove-nakes'],
  'admin-artikel': [
    'open-article-module',
    'review-article-list',
    'search-article-list',
    'edit-article-item',
    'delete-article-item',
    'open-new-article-link',
  ],
  'admin-artikel-baru': ['open-new-article-form', 'select-article-category', 'fill-article-fields', 'publish-article'],
  'desa-beranda': ['open-village-home', 'export-village-report', 'review-village-info', 'fill-village-event'],
  'kader-balita': ['open-child-list', 'filter-child-list', 'open-child-detail', 'fill-measurement-form', 'create-new-child'],
  'kader-balita-detail': ['open-child-detail-as-kader', 'review-child-history-as-kader', 'edit-child-measurement', 'delete-child-measurement'],
  'kader-orangtua': ['open-parent-data', 'switch-parent-tab', 'review-parent-account', 'fill-parent-form'],
  'kader-laporan': ['open-monthly-report', 'choose-report-month', 'review-report-summary', 'complete-report-data'],
  'tenkes-forum': ['open-health-forum', 'select-relevant-discussion', 'review-forum-details', 'reply-forum-thread'],
  'tenkes-balita-detail': ['open-forum-detail-page', 'review-forum-context', 'reply-to-forum'],
  'orangtua-balita': ['open-child-summary', 'fill-new-child-form', 'review-growth-summary'],
  'orangtua-forum': ['open-parent-forum', 'switch-forum-tab', 'find-discussion-topic', 'write-new-question'],
  'orangtua-forum-detail': ['open-forum-topic', 'read-existing-replies', 'post-followup-comment'],
  'orangtua-balita-detail': ['open-child-detail-from-list', 'verify-child-data', 'review-child-history'],
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
        expect(section.route).not.toContain(':');
        expect(section.screenshotFile).toMatch(/\.png$/);
        expect(section.purpose ?? section.screenshotHint).toBeTruthy();
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

  test('includes presentation metadata for roles', () => {
    guideContent.forEach((role) => {
      expect(role.accentColor).toBeTruthy();
    });
  });
});
