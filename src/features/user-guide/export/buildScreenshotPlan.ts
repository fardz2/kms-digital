import path from 'node:path';

import type { GuideRole } from '../types';
import { getSectionShots, getShotFileName, type GuideShotKind } from './screenshotStages';

export type ScreenshotJob = {
  roleId: GuideRole['id'];
  roleTitle: string;
  sectionId: string;
  sectionTitle: string;
  route: string;
  stageId: string;
  stageKind: GuideShotKind;
  stageTitle: string;
  stageDescription: string;
  outputFile: string;
  outputPath: string;
};

const SCREENSHOT_DIR = path.join('public', 'user-guide', 'assets');

export function buildScreenshotPlan(guideContent: GuideRole[]): ScreenshotJob[] {
  return guideContent.flatMap((role) =>
    role.sections.flatMap((section) =>
      getSectionShots(section.id).map((shot, index) => {
        const outputFile = getShotFileName(section, shot, index);
        return {
          roleId: role.id,
          roleTitle: role.title,
          sectionId: section.id,
          sectionTitle: section.title,
          route: shot.route ?? section.route,
          stageId: shot.id,
          stageKind: shot.kind,
          stageTitle: shot.title,
          stageDescription: shot.description,
          outputFile,
          outputPath: path.join(SCREENSHOT_DIR, outputFile),
        };
      })
    )
  );
}
