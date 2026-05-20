# User Guide PPTX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `/user-guide` page that renders role-based walkthroughs from one data source and lets users download a matching `.pptx`.

**Architecture:** This repo is frontend-only, so the export pipeline will be a Node build-time generator, not an HTTP API. Guide content lives in TypeScript, the web page renders that data into a role-first walkthrough, and a Playwright-based script captures screenshots from the running Vite app and writes both PNG assets and the generated PPTX into `public/user-guide/` so the site can serve them statically.

**Tech Stack:** React 19, React Router, Vite, TypeScript, Vitest, Playwright, PptxGenJS, `tsx`.

---

## File Map

- `src/features/user-guide/types.ts` - shared guide data types for roles, sections, steps, and generated asset names.
- `src/features/user-guide/data/guideContent.ts` - source of truth for every role walkthrough and the screenshot file names it expects.
- `src/features/user-guide/components/GuideSidebar.tsx` - sticky role navigation for the web guide page.
- `src/features/user-guide/components/GuideRoleSection.tsx` - renders one role block with overview, sections, and tips.
- `src/features/user-guide/components/GuideSectionCard.tsx` - renders one section card with steps, screenshot, and expected result.
- `src/features/user-guide/components/GuideScreenshot.tsx` - image wrapper with a fallback state when an asset is missing.
- `src/features/user-guide/components/GuideDownloadButton.tsx` - download CTA that points to the generated PPTX in `public/user-guide/`.
- `src/features/user-guide/export/buildScreenshotPlan.ts` - pure mapping from guide content to screenshot jobs.
- `src/features/user-guide/export/buildPresentationModel.ts` - pure mapping from guide content + screenshots to slide descriptors.
- `src/features/user-guide/export/generatePptx.ts` - PptxGenJS assembly logic.
- `scripts/user-guide/generate.ts` - executable script that launches Playwright, captures screenshots, and writes the PPTX.
- `src/pages/UserGuide/index.tsx` - page route that renders the full guide.
- `src/routes/AppRoutes.tsx` - adds the `/user-guide` route.
- `src/pages/LandingPage/index.tsx` - adds a CTA into the landing page so users can reach the guide.
- `src/__tests__/features/user-guide/guideContent.test.ts` - content schema coverage tests.
- `src/__tests__/features/user-guide/export.test.ts` - pure export model tests.
- `src/__tests__/pages/UserGuide/index.test.tsx` - page render test.
- `src/__tests__/pages/LandingPage/userGuideCta.test.tsx` - landing page CTA test.
- `docs/user-guide/README.md` - regeneration instructions and output locations.
- `package.json` - new dependencies and scripts for the guide build pipeline.
- `public/user-guide/` - generated output directory for screenshots and `KMS-Digital-User-Guide.pptx`.

## Task 1: Define the guide schema and source content

**Files:**
- Create: `src/features/user-guide/types.ts`
- Create: `src/features/user-guide/data/guideContent.ts`
- Create: `src/__tests__/features/user-guide/guideContent.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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

  test('gives every role at least one section with route, screenshot file, steps, and expected result', () => {
    guideContent.forEach((role) => {
      expect(role.title).toBeTruthy();
      expect(role.summary).toBeTruthy();
      expect(role.sections.length).toBeGreaterThan(0);

      role.sections.forEach((section) => {
        expect(section.route.startsWith('/')).toBe(true);
        expect(section.screenshotFile).toMatch(/\.png$/);
        expect(section.steps.length).toBeGreaterThan(0);
        expect(section.expectedResult).toBeTruthy();
      });
    });
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails for missing schema**

Run: `rtk vitest run src/__tests__/features/user-guide/guideContent.test.ts`

Expected: fail with TypeScript or assertion errors until the schema and content exist.

- [ ] **Step 3: Implement the minimal schema and content**

```ts
export type GuideRoleId =
  | 'ADMIN'
  | 'DESA'
  | 'KADER_POSYANDU'
  | 'TENAGA_KESEHATAN'
  | 'ORANG_TUA';

export type GuideStep = {
  id: string;
  label: string;
  action: string;
  result: string;
};

export type GuideSection = {
  id: string;
  title: string;
  purpose: string;
  route: string;
  screenshotFile: string;
  steps: GuideStep[];
  expectedResult: string;
  tips: string[];
};

export type GuideRole = {
  id: GuideRoleId;
  title: string;
  summary: string;
  accentColor: string;
  sections: GuideSection[];
};
```

Populate `guideContent.ts` with the five roles in the spec. Keep the role order stable and make every section point to a real route in the app, with screenshot file names that will later be generated into `public/user-guide/assets/`.

- [ ] **Step 4: Run the test again and confirm it passes**

Run: `rtk vitest run src/__tests__/features/user-guide/guideContent.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/user-guide/types.ts src/features/user-guide/data/guideContent.ts src/__tests__/features/user-guide/guideContent.test.ts
git commit -m "feat: add user guide content schema"
```

## Task 2: Build the `/user-guide` web page and route entry points

**Files:**
- Create: `src/features/user-guide/components/GuideSidebar.tsx`
- Create: `src/features/user-guide/components/GuideRoleSection.tsx`
- Create: `src/features/user-guide/components/GuideSectionCard.tsx`
- Create: `src/features/user-guide/components/GuideScreenshot.tsx`
- Create: `src/features/user-guide/components/GuideDownloadButton.tsx`
- Create: `src/pages/UserGuide/index.tsx`
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/pages/LandingPage/index.tsx`
- Create: `src/__tests__/pages/UserGuide/index.test.tsx`
- Create: `src/__tests__/pages/LandingPage/userGuideCta.test.tsx`

- [ ] **Step 1: Write the failing page tests**

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { UserGuidePage } from '../../../pages/UserGuide';

describe('UserGuidePage', () => {
  test('renders the guide heading, role navigation, and download link', () => {
    render(
      <MemoryRouter initialEntries={['/user-guide']}>
        <Routes>
          <Route path="/user-guide" element={<UserGuidePage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /panduan penggunaan kms digital/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download pptx/i })).toHaveAttribute(
      'href',
      '/user-guide/KMS-Digital-User-Guide.pptx'
    );
    expect(screen.getByRole('link', { name: /admin/i })).toBeInTheDocument();
  });
});
```

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { LandingPage } from '../../../pages/LandingPage';

describe('LandingPage user guide CTA', () => {
  test('links to the user guide route', () => {
    render(<LandingPage />);

    expect(screen.getByRole('link', { name: /user guide/i })).toHaveAttribute(
      'href',
      '/user-guide'
    );
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail while the route and components are missing**

Run: `rtk vitest run src/__tests__/pages/UserGuide/index.test.tsx src/__tests__/pages/LandingPage/userGuideCta.test.tsx`

Expected: fail with missing route, missing components, or missing link assertions.

- [ ] **Step 3: Implement the page and wire the route**

```tsx
export function UserGuidePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-8 lg:px-6">
      <aside className="sticky top-6 hidden w-64 shrink-0 lg:block">
        <GuideSidebar roles={guideContent} />
      </aside>

      <section className="min-w-0 flex-1 space-y-12">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            User Guide
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Panduan Penggunaan KMS Digital
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Baca alur kerja per role langsung di web, lalu unduh versi PPTX yang
            sama dari data sumber yang sama.
          </p>

          <div className="mt-5">
            <GuideDownloadButton />
          </div>
        </header>

        {guideContent.map((role) => (
          <GuideRoleSection key={role.id} role={role} />
        ))}
      </section>
    </main>
  );
}
```

Add the route in `src/routes/AppRoutes.tsx`:

```tsx
<Route path="/user-guide" element={<UserGuidePage />} />
```

Add a landing-page CTA in `src/pages/LandingPage/index.tsx` that points to `/user-guide` with the same label used in the test.

- [ ] **Step 4: Run the tests and confirm the page renders**

Run: `rtk vitest run src/__tests__/pages/UserGuide/index.test.tsx src/__tests__/pages/LandingPage/userGuideCta.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/user-guide/components src/pages/UserGuide/index.tsx src/routes/AppRoutes.tsx src/pages/LandingPage/index.tsx src/__tests__/pages/UserGuide/index.test.tsx src/__tests__/pages/LandingPage/userGuideCta.test.tsx
git commit -m "feat: add user guide page and entry points"
```

## Task 3: Add the screenshot and PPTX generation pipeline

**Files:**
- Create: `src/features/user-guide/export/buildScreenshotPlan.ts`
- Create: `src/features/user-guide/export/buildPresentationModel.ts`
- Create: `src/features/user-guide/export/generatePptx.ts`
- Create: `scripts/user-guide/generate.ts`
- Modify: `package.json`
- Create: `src/__tests__/features/user-guide/export.test.ts`

- [ ] **Step 1: Write the failing export-model tests**

```ts
import { describe, expect, test } from 'vitest';
import { guideContent } from '../../../features/user-guide/data/guideContent';
import { buildScreenshotPlan } from '../../../features/user-guide/export/buildScreenshotPlan';
import { buildPresentationModel } from '../../../features/user-guide/export/buildPresentationModel';

describe('user guide export models', () => {
  test('buildScreenshotPlan produces one job per section', () => {
    const jobs = buildScreenshotPlan(guideContent);

    expect(jobs[0].outputFile).toMatch(/\.png$/);
    expect(jobs.some((job) => job.route === '/admin/dashboard/artikel/baru')).toBe(true);
    expect(jobs.length).toBeGreaterThan(10);
  });

  test('buildPresentationModel creates a cover slide plus role slides', () => {
    const deck = buildPresentationModel(guideContent);

    expect(deck.fileName).toBe('KMS-Digital-User-Guide.pptx');
    expect(deck.slides[0].kind).toBe('cover');
    expect(deck.slides.some((slide) => slide.title.includes('Admin'))).toBe(true);
    expect(deck.slides.some((slide) => slide.route === '/orangtua/forum')).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests and confirm the pure export layer is still missing**

Run: `rtk vitest run src/__tests__/features/user-guide/export.test.ts`

Expected: fail until the pure export helpers exist.

- [ ] **Step 3: Implement the pure builders, then wire the Playwright script and PptxGenJS writer**

```ts
const screenshotPlan = buildScreenshotPlan(guideContent);
const deck = buildPresentationModel(guideContent);

for (const job of screenshotPlan) {
  await page.goto(`${baseUrl}${job.route}`, { waitUntil: 'networkidle' });
  await page.locator('main').screenshot({ path: job.outputPath, fullPage: true });
}

await generatePptx({
  deck,
  screenshotsDir: outputDir,
  outputFile: join(outputDir, 'KMS-Digital-User-Guide.pptx'),
});
```

Use `playwright` for browser capture, `pptxgenjs` for slide assembly, and `tsx` to run `scripts/user-guide/generate.ts`. The script should accept a base URL argument, default to `http://127.0.0.1:3000`, and write assets to `public/user-guide/assets/` plus `public/user-guide/KMS-Digital-User-Guide.pptx`.

Update `package.json` with these dependencies and scripts:

```json
{
  "devDependencies": {
    "playwright": "^1.x",
    "pptxgenjs": "^4.x",
    "tsx": "^4.x"
  },
  "scripts": {
    "guide:build": "tsx scripts/user-guide/generate.ts",
    "guide:build:local": "tsx scripts/user-guide/generate.ts --baseUrl http://127.0.0.1:3000"
  }
}
```

Run `npx playwright install chromium` once after adding the dependency so the generator has a browser binary.

- [ ] **Step 4: Run the export tests and a local generation pass**

Run:

```bash
rtk vitest run src/__tests__/features/user-guide/export.test.ts
rtk npm run guide:build -- --baseUrl http://127.0.0.1:3000
```

Expected:
- `src/__tests__/features/user-guide/export.test.ts` passes.
- `public/user-guide/assets/` contains PNG screenshots for every guide section.
- `public/user-guide/KMS-Digital-User-Guide.pptx` exists and opens as a valid deck.

- [ ] **Step 5: Commit**

```bash
git add src/features/user-guide/export src/__tests__/features/user-guide/export.test.ts scripts/user-guide/generate.ts package.json
git commit -m "feat: add user guide pptx generator"
```

## Task 4: Add operator docs and run the final verification pass

**Files:**
- Create: `docs/user-guide/README.md`

- [ ] **Step 1: Write the operator notes**

```md
# User Guide Build

## Regenerate assets

1. Start the app: `npm run dev`
2. Generate screenshots and the PPTX: `npm run guide:build -- --baseUrl http://127.0.0.1:3000`
3. Open the guide in the browser: `/user-guide`

## Generated output

- `public/user-guide/assets/`
- `public/user-guide/KMS-Digital-User-Guide.pptx`
```

- [ ] **Step 2: Run the full verification suite**

Run:

```bash
rtk vitest run src/__tests__/features/user-guide/guideContent.test.ts src/__tests__/features/user-guide/export.test.ts src/__tests__/pages/UserGuide/index.test.tsx src/__tests__/pages/LandingPage/userGuideCta.test.tsx
rtk npm test
rtk tsc --noEmit
rtk npm run build
```

Expected:
- tests pass
- TypeScript passes
- production build passes
- the generated guide assets are included in the build output

- [ ] **Step 3: Manual browser smoke test**

Open the app in the browser, visit `/user-guide`, and confirm:
- every role section is visible
- the sidebar anchors jump to the right role block
- the download button resolves to `/user-guide/KMS-Digital-User-Guide.pptx`
- the page still renders if one screenshot is missing, because the fallback state displays a clear placeholder instead of a broken layout

- [ ] **Step 4: Commit**

```bash
git add docs/user-guide/README.md
git commit -m "docs: add user guide build instructions"
```

## Spec Coverage Check

- One source of truth for the guide content: Task 1.
- Web guide accessible from a URL: Task 2.
- PPTX download from the same content: Task 3.
- Screenshots generated from the actual UI: Task 3.
- Detail per role, aligned with the app routes: Tasks 1 and 2.
- Verification for content, page, export, and build output: Task 4.
