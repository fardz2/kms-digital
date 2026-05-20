import { describe, expect, test } from 'vitest';
import { guideContent } from '../../../features/user-guide/data/guideContent';
import { buildPresentationModel } from '../../../features/user-guide/export/buildPresentationModel';
import { buildScreenshotPlan } from '../../../features/user-guide/export/buildScreenshotPlan';

describe('user guide export models', () => {
  test('buildScreenshotPlan produces staged jobs per section', () => {
    const jobs = buildScreenshotPlan(guideContent);

    expect(jobs.length).toBeGreaterThan(guideContent.reduce((sum, role) => sum + role.sections.length, 0));
    expect(jobs[0].outputFile).toMatch(/\.png$/);
    expect(jobs.some((job) => job.stageId === 'create' && job.outputFile.includes('admin-desa-create'))).toBe(true);
    expect(jobs.some((job) => job.stageId === 'logout' && job.sectionId === 'kader-balita')).toBe(true);
    expect(jobs.some((job) => job.route === '/admin/dashboard/artikel/baru')).toBe(true);
    expect(jobs.some((job) => job.route === '/kader/balita/1')).toBe(true);
    expect(jobs.some((job) => job.route === '/orangtua/forum/1')).toBe(true);
    expect(jobs.some((job) => job.route === '/tenkes/balita/1')).toBe(true);
  });

  test('buildPresentationModel creates a cover slide plus role, section, and stage slides', () => {
    const deck = buildPresentationModel(guideContent);

    expect(deck.fileName).toBe('KMS-Digital-User-Guide.pptx');
    expect(deck.slides[0].kind).toBe('cover');
    expect(deck.slides.some((slide) => slide.kind === 'role' && slide.title.includes('Admin'))).toBe(
      true
    );
    expect(deck.slides.some((slide) => slide.kind === 'section' && slide.route === '/orangtua/forum')).toBe(
      true
    );
    expect(deck.slides.some((slide) => slide.kind === 'stage' && slide.route === '/tenkes/balita/1')).toBe(
      true
    );
  });
});
