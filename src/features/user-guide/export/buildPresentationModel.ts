import type { GuideRole, GuideStep } from '../types';
import { getSectionShots } from './screenshotStages';

export type PresentationCoverSlide = {
  kind: 'cover';
  title: string;
  subtitle: string;
  roleCount: number;
  sectionCount: number;
  accentColors: string[];
};

export type PresentationRoleSlide = {
  kind: 'role';
  roleId: GuideRole['id'];
  title: string;
  summary: string;
  accentColor?: string;
  sectionCount: number;
  sections: Array<{
    id: string;
    title: string;
    route: string;
  }>;
};

export type PresentationSectionSlide = {
  kind: 'section';
  roleId: GuideRole['id'];
  roleTitle: string;
  sectionId: string;
  title: string;
  route: string;
  screenshotFile: string;
  purpose?: string;
  expectedResult: string;
  steps: GuideStep[];
  tips: string[];
  stageTitle: string;
  stageDescription: string;
  stageKind: string;
  stageIndex: number;
  stageCount: number;
};

export type PresentationStageSlide = {
  kind: 'stage';
  roleId: GuideRole['id'];
  roleTitle: string;
  sectionId: string;
  sectionTitle: string;
  route: string;
  screenshotFile: string;
  stageTitle: string;
  stageDescription: string;
  stageKind: string;
  stageIndex: number;
  stageCount: number;
};

export type PresentationSlide =
  | PresentationCoverSlide
  | PresentationRoleSlide
  | PresentationSectionSlide
  | PresentationStageSlide;

export type PresentationDeck = {
  fileName: string;
  cover: PresentationCoverSlide;
  slides: PresentationSlide[];
};

export function buildPresentationModel(guideContent: GuideRole[]): PresentationDeck {
  const sections = guideContent.flatMap((role) => role.sections);
  const cover: PresentationCoverSlide = {
    kind: 'cover',
    title: 'Panduan Penggunaan KMS Digital',
    subtitle: 'Satu sumber data untuk halaman web, screenshot, dan presentasi PPTX.',
    roleCount: guideContent.length,
    sectionCount: sections.length,
    accentColors: guideContent.map((role) => role.accentColor ?? '#334155'),
  };

  const slides: PresentationSlide[] = [
    cover,
    ...guideContent.flatMap((role) => [
      {
        kind: 'role' as const,
        roleId: role.id,
        title: role.title,
        summary: role.summary,
        accentColor: role.accentColor,
        sectionCount: role.sections.length,
        sections: role.sections.map((section) => ({
          id: section.id,
          title: section.title,
          route: section.route,
        })),
      },
      ...role.sections.flatMap((section) => {
        const shots = getSectionShots(section.id);
        const [firstShot, ...restShots] = shots;

        const sectionSlide: PresentationSectionSlide = {
          kind: 'section',
          roleId: role.id,
          roleTitle: role.title,
          sectionId: section.id,
          title: section.title,
          route: firstShot?.route ?? section.route,
          screenshotFile: section.screenshotFile,
          purpose: section.purpose,
          expectedResult: section.expectedResult,
          steps: section.steps,
          tips: section.tips,
          stageTitle: firstShot?.title ?? section.title,
          stageDescription: firstShot?.description ?? section.purpose ?? section.expectedResult,
          stageKind: firstShot?.kind ?? 'page',
          stageIndex: 0,
          stageCount: shots.length,
        };

        const stageSlides: PresentationStageSlide[] = restShots.map((shot, index) => ({
          kind: 'stage',
          roleId: role.id,
          roleTitle: role.title,
          sectionId: section.id,
          sectionTitle: section.title,
          route: shot.route ?? section.route,
          screenshotFile:
            section.screenshotFile.replace(/\.png$/i, '') + `-${shot.id}.png`,
          stageTitle: shot.title,
          stageDescription: shot.description,
          stageKind: shot.kind,
          stageIndex: index + 1,
          stageCount: shots.length,
        }));

        return [sectionSlide, ...stageSlides];
      }),
    ]),
  ];

  return {
    fileName: 'KMS-Digital-User-Guide.pptx',
    cover,
    slides,
  };
}
