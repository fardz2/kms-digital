import fs from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

import { guideContent } from '../../src/features/user-guide/data/guideContent';
import { buildPresentationModel } from '../../src/features/user-guide/export/buildPresentationModel';
import { buildScreenshotPlan } from '../../src/features/user-guide/export/buildScreenshotPlan';
import { generatePptx } from '../../src/features/user-guide/export/generatePptx';
import type { GuideRoleId } from '../../src/features/user-guide/types';
import type { Session } from '../../src/types/session';

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'user-guide');
const ASSETS_DIR = path.join(OUTPUT_DIR, 'assets');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'KMS-Digital-User-Guide.pptx');

function readBaseUrl(argv: string[]): string {
  const flagIndex = argv.findIndex((arg) => arg === '--baseUrl' || arg === '--base-url');
  if (flagIndex >= 0 && argv[flagIndex + 1]) {
    return argv[flagIndex + 1];
  }

  const inlineFlag = argv.find((arg) => arg.startsWith('--baseUrl=') || arg.startsWith('--base-url='));
  if (inlineFlag) {
    return inlineFlag.split('=')[1] ?? DEFAULT_BASE_URL;
  }

  return DEFAULT_BASE_URL;
}

function buildSession(roleId: GuideRoleId, roleName: string, index: number): Session {
  return {
    user: {
      id: index + 1,
      name: `${roleName} Guide`,
      role: roleId,
    },
    token: {
      value: `guide-token-${roleId.toLowerCase()}`,
    },
  };
}

async function prepareOutputDirectories(): Promise<void> {
  await fs.rm(ASSETS_DIR, { recursive: true, force: true });
  await fs.mkdir(ASSETS_DIR, { recursive: true });
  await fs.rm(OUTPUT_FILE, { force: true });
}

async function captureScreenshots(baseUrl: string): Promise<void> {
  const screenshotPlan = buildScreenshotPlan(guideContent);
  const browser = await chromium.launch({ headless: true });

  try {
    for (const [index, role] of guideContent.entries()) {
      const roleJobs = screenshotPlan.filter((job) => job.roleId === role.id);
      if (roleJobs.length === 0) continue;

      const context = await browser.newContext({
        viewport: { width: 1440, height: 1200 },
        deviceScaleFactor: 1,
      });
      await context.addInitScript((session) => {
        localStorage.setItem('kms_session_v1', JSON.stringify(session));
      }, buildSession(role.id, role.title, index));

      const page = await context.newPage();

      try {
        for (const job of roleJobs) {
          await page.goto(`${baseUrl}${job.route}`, {
            waitUntil: 'domcontentloaded',
          });
          await page.locator('main').waitFor({ state: 'attached' });
          await page.waitForTimeout(500);
          await page.locator('main').screenshot({
            path: job.outputPath,
            fullPage: true,
          });
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  const baseUrl = readBaseUrl(process.argv.slice(2));
  await prepareOutputDirectories();
  await captureScreenshots(baseUrl);

  const deck = buildPresentationModel(guideContent);
  await generatePptx({
    deck,
    screenshotsDir: ASSETS_DIR,
    outputFile: OUTPUT_FILE,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
