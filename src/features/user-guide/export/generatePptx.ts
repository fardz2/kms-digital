import fs from 'node:fs';
import path from 'node:path';

import PptxGenJS from 'pptxgenjs';

import type {
  PresentationDeck,
  PresentationRoleSlide,
  PresentationSectionSlide,
  PresentationStageSlide,
} from './buildPresentationModel';

type GeneratePptxOptions = {
  deck: PresentationDeck;
  screenshotsDir: string;
  outputFile: string;
};

const SLIDE_WIDTH = 13.333;
const SLIDE_HEIGHT = 7.5;

function formatStepLine(step: { label: string; action: string }, index: number): string {
  return `${index + 1}. ${step.label}: ${step.action}`;
}

function addCoverSlide(pptx: PptxGenJS, deck: PresentationDeck): void {
  const slide = pptx.addSlide();
  const cover = deck.cover;

  slide.background = { color: '0F172A' };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_WIDTH,
    h: SLIDE_HEIGHT,
    fill: { color: '0F172A' },
    line: { color: '0F172A' },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.2,
    h: SLIDE_HEIGHT,
    fill: { color: cover.accentColors[0] ?? '38BDF8' },
    line: { color: cover.accentColors[0] ?? '38BDF8' },
  });

  slide.addText(cover.title, {
    x: 0.8,
    y: 1.1,
    w: 8.6,
    h: 1.1,
    fontFace: 'Aptos',
    fontSize: 28,
    bold: true,
    color: 'FFFFFF',
    margin: 0,
  });
  slide.addText(cover.subtitle, {
    x: 0.8,
    y: 2.25,
    w: 8.4,
    h: 0.8,
    fontFace: 'Aptos',
    fontSize: 13,
    color: 'CBD5E1',
    margin: 0,
  });

  slide.addText(`${cover.roleCount} role`, {
    x: 0.82,
    y: 3.35,
    w: 1.8,
    h: 0.45,
    fontFace: 'Aptos',
    fontSize: 12,
    bold: true,
    color: '0F172A',
    align: 'center',
    fill: { color: 'E2E8F0' },
    margin: 0.08,
    valign: 'middle',
  });
  slide.addText(`${cover.sectionCount} section`, {
    x: 2.75,
    y: 3.35,
    w: 2.0,
    h: 0.45,
    fontFace: 'Aptos',
    fontSize: 12,
    bold: true,
    color: '0F172A',
    align: 'center',
    fill: { color: 'E2E8F0' },
    margin: 0.08,
    valign: 'middle',
  });

  slide.addText('Sumber konten sama dengan halaman web dan asset screenshot.', {
    x: 0.82,
    y: 4.25,
    w: 5.6,
    h: 0.6,
    fontFace: 'Aptos',
    fontSize: 11,
    italic: true,
    color: '94A3B8',
    margin: 0,
  });
}

function addRoleSlide(pptx: PptxGenJS, slideModel: PresentationRoleSlide): void {
  const slide = pptx.addSlide();
  const accent = slideModel.accentColor ?? '38BDF8';

  slide.background = { color: 'F8FAFC' };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_WIDTH,
    h: 0.16,
    fill: { color: accent },
    line: { color: accent },
  });

  slide.addText(slideModel.title, {
    x: 0.65,
    y: 0.55,
    w: 6.2,
    h: 0.6,
    fontFace: 'Aptos',
    fontSize: 24,
    bold: true,
    color: '0F172A',
    margin: 0,
  });
  slide.addText(slideModel.summary, {
    x: 0.65,
    y: 1.2,
    w: 6.6,
    h: 0.75,
    fontFace: 'Aptos',
    fontSize: 12,
    color: '334155',
    margin: 0,
  });

  slide.addText(`Role ID: ${slideModel.roleId}`, {
    x: 0.68,
    y: 2.1,
    w: 2.6,
    h: 0.35,
    fontFace: 'Aptos',
    fontSize: 10,
    color: accent,
    bold: true,
    margin: 0,
  });
  slide.addText(`${slideModel.sectionCount} section`, {
    x: 2.95,
    y: 2.1,
    w: 1.6,
    h: 0.35,
    fontFace: 'Aptos',
    fontSize: 10,
    color: accent,
    bold: true,
    margin: 0,
  });

  slideModel.sections.forEach((section, index) => {
    const row = index % 4;
    const col = Math.floor(index / 4);
    const x = 0.7 + col * 3.0;
    const y = 2.65 + row * 0.86;

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 2.5,
      h: 0.62,
      rectRadius: 0.08,
      fill: { color: 'FFFFFF' },
      line: { color: 'CBD5E1', pt: 1 },
    });
    slide.addText(section.title, {
      x: x + 0.12,
      y: y + 0.08,
      w: 2.26,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 10,
      bold: true,
      color: '0F172A',
      margin: 0,
    });
    slide.addText(section.route, {
      x: x + 0.12,
      y: y + 0.32,
      w: 2.2,
      h: 0.16,
      fontFace: 'Aptos',
      fontSize: 8,
      color: '475569',
      margin: 0,
    });
  });
}

function addSectionSlide(
  pptx: PptxGenJS,
  slideModel: PresentationSectionSlide,
  screenshotsDir: string
): void {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_WIDTH,
    h: 0.18,
    fill: { color: '0F172A' },
    line: { color: '0F172A' },
  });

  slide.addText(slideModel.roleTitle, {
    x: 0.65,
    y: 0.45,
    w: 2.4,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 9.5,
    bold: true,
    color: '64748B',
    margin: 0,
  });
  slide.addText(slideModel.title, {
    x: 0.65,
    y: 0.72,
    w: 7.6,
    h: 0.42,
    fontFace: 'Aptos',
    fontSize: 22,
    bold: true,
    color: '0F172A',
    margin: 0,
  });
  slide.addText(
    `${slideModel.stageIndex + 1} / ${slideModel.stageCount} - ${slideModel.stageTitle}`,
    {
      x: 0.68,
      y: 1.22,
      w: 6.0,
      h: 0.28,
      fontFace: 'Aptos',
      fontSize: 10,
      color: '2563EB',
      bold: true,
      margin: 0,
    }
  );
  slide.addText(slideModel.route, {
    x: 0.68,
    y: 1.48,
    w: 5.2,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 9.5,
    color: '475569',
    margin: 0,
  });

  if (slideModel.purpose) {
    slide.addText('Tujuan halaman', {
      x: 0.68,
      y: 1.75,
      w: 1.6,
      h: 0.18,
      fontFace: 'Aptos',
      fontSize: 9,
      bold: true,
      color: '64748B',
      margin: 0,
    });
    slide.addText(slideModel.purpose, {
      x: 0.68,
      y: 1.94,
      w: 5.8,
      h: 0.68,
      fontFace: 'Aptos',
      fontSize: 12,
      color: '334155',
      margin: 0,
      fit: 'shrink',
    });
  }

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.65,
    y: 1.95,
    w: 5.8,
    h: 4.85,
    rectRadius: 0.08,
    fill: { color: 'F8FAFC' },
    line: { color: 'E2E8F0', pt: 1 },
  });

  slide.addText('Langkah', {
    x: 0.88,
    y: 2.18,
    w: 1.4,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 11,
    bold: true,
    color: '0F172A',
    margin: 0,
  });
  slide.addText(
    slideModel.steps.map((step, index) => formatStepLine(step, index)).join('\n'),
    {
      x: 0.9,
      y: 2.45,
      w: 5.2,
      h: 1.55,
      fontFace: 'Aptos',
      fontSize: 9.5,
      color: '334155',
      margin: 0,
      valign: 'top',
      fit: 'shrink',
    }
  );

  slide.addText('Hasil yang diharapkan', {
    x: 0.88,
    y: 4.2,
    w: 2.6,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 11,
    bold: true,
    color: '0F172A',
    margin: 0,
  });
  slide.addText(slideModel.expectedResult, {
    x: 0.9,
    y: 4.46,
    w: 5.1,
    h: 0.6,
    fontFace: 'Aptos',
    fontSize: 10,
    color: '334155',
    margin: 0,
  });

  if (slideModel.tips.length > 0) {
    slide.addText('Tips', {
      x: 0.88,
      y: 5.42,
      w: 1.2,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 11,
      bold: true,
      color: '0F172A',
      margin: 0,
    });
    slide.addText(slideModel.tips.map((tip) => `- ${tip}`).join('\n'), {
      x: 0.9,
      y: 5.68,
      w: 5.1,
      h: 0.9,
      fontFace: 'Aptos',
      fontSize: 9,
      color: '475569',
      margin: 0,
      valign: 'top',
    });
  }

  const screenshotPath = path.join(screenshotsDir, slideModel.screenshotFile);
  if (fs.existsSync(screenshotPath)) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.85,
      y: 0.92,
      w: 5.9,
      h: 5.95,
      rectRadius: 0.08,
      fill: { color: 'E2E8F0' },
      line: { color: 'CBD5E1', pt: 1 },
    });
    slide.addImage({
      path: screenshotPath,
      x: 6.95,
      y: 1.02,
      w: 5.7,
      h: 5.75,
    });
  } else {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.85,
      y: 0.92,
      w: 5.9,
      h: 5.95,
      rectRadius: 0.08,
      fill: { color: 'F8FAFC' },
      line: { color: 'CBD5E1', pt: 1 },
    });
    slide.addText(`Screenshot missing\n${slideModel.screenshotFile}`, {
      x: 7.15,
      y: 3.0,
      w: 5.3,
      h: 0.8,
      fontFace: 'Aptos',
      fontSize: 14,
      bold: true,
      align: 'center',
      color: 'EF4444',
      margin: 0,
    });
  }
}

function addStageSlide(
  pptx: PptxGenJS,
  slideModel: PresentationStageSlide,
  screenshotsDir: string
): void {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_WIDTH,
    h: 0.18,
    fill: { color: '0F172A' },
    line: { color: '0F172A' },
  });

  slide.addText(slideModel.roleTitle, {
    x: 0.65,
    y: 0.45,
    w: 2.4,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 9.5,
    bold: true,
    color: '64748B',
    margin: 0,
  });
  slide.addText(slideModel.sectionTitle, {
    x: 0.65,
    y: 0.72,
    w: 7.6,
    h: 0.42,
    fontFace: 'Aptos',
    fontSize: 22,
    bold: true,
    color: '0F172A',
    margin: 0,
  });
  slide.addText(
    `${slideModel.stageIndex + 1} / ${slideModel.stageCount} - ${slideModel.stageTitle}`,
    {
      x: 0.68,
      y: 1.22,
      w: 6.0,
      h: 0.28,
      fontFace: 'Aptos',
      fontSize: 10,
      color: '2563EB',
      bold: true,
      margin: 0,
    }
  );
  slide.addText(slideModel.route, {
    x: 0.68,
    y: 1.48,
    w: 5.2,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 9.5,
    color: '475569',
    margin: 0,
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.65,
    y: 1.82,
    w: 5.8,
    h: 4.98,
    rectRadius: 0.08,
    fill: { color: 'F8FAFC' },
    line: { color: 'E2E8F0', pt: 1 },
  });

  slide.addText('Tahap ini', {
    x: 0.88,
    y: 2.04,
    w: 1.4,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 11,
    bold: true,
    color: '0F172A',
    margin: 0,
  });
  slide.addText(slideModel.stageDescription, {
    x: 0.9,
    y: 2.3,
    w: 5.15,
    h: 1.0,
    fontFace: 'Aptos',
    fontSize: 10.5,
    color: '334155',
    margin: 0,
    fit: 'shrink',
  });

  slide.addText('Apa yang harus terlihat', {
    x: 0.88,
    y: 3.54,
    w: 2.8,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 11,
    bold: true,
    color: '0F172A',
    margin: 0,
  });
  slide.addText(
    slideModel.stageKind === 'logout'
      ? 'Perhatikan tombol keluar atau dialog konfirmasi logout.'
      : slideModel.stageKind === 'delete'
      ? 'Perhatikan dialog konfirmasi hapus sebelum data dihapus.'
      : slideModel.stageKind === 'create' || slideModel.stageKind === 'edit' || slideModel.stageKind === 'fill'
      ? 'Perhatikan form input yang sudah terbuka dan terisi contoh data.'
      : slideModel.stageKind === 'reply'
      ? 'Perhatikan form komentar untuk mengirim jawaban.'
      : slideModel.stageKind === 'month'
      ? 'Perhatikan month picker untuk mengganti periode laporan.'
      : slideModel.stageKind === 'tab'
      ? 'Perhatikan tab yang sedang aktif agar daftar yang tampil sesuai.'
      : slideModel.stageKind === 'history'
      ? 'Perhatikan riwayat data yang tersusun dari yang terbaru.'
      : slideModel.stageKind === 'summary'
      ? 'Perhatikan kartu ringkasan untuk membaca statistik utama.'
      : slideModel.stageKind === 'export'
      ? 'Perhatikan bagian ekspor CSV dan PDF yang siap dipakai.'
      : 'Perhatikan area penting yang disorot pada layar.',
    {
      x: 0.9,
      y: 3.79,
      w: 5.1,
      h: 0.55,
      fontFace: 'Aptos',
      fontSize: 10,
      color: '475569',
      margin: 0,
      fit: 'shrink',
    }
  );

  slide.addText('Hasil tahap ini', {
    x: 0.88,
    y: 4.56,
    w: 2.2,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 11,
    bold: true,
    color: '0F172A',
    margin: 0,
  });
  slide.addText(
    slideModel.stageKind === 'page'
      ? 'Pengguna melihat halaman utama tanpa modal atau dialog.'
      : slideModel.stageKind === 'list'
      ? 'Pengguna fokus pada daftar data yang sudah tersimpan.'
      : slideModel.stageKind === 'create'
      ? 'Pengguna melihat form tambah data yang siap diisi.'
      : slideModel.stageKind === 'edit'
      ? 'Pengguna melihat form edit dengan data lama yang sudah terisi.'
      : slideModel.stageKind === 'delete'
      ? 'Pengguna melihat konfirmasi hapus sebelum data benar-benar hilang.'
      : slideModel.stageKind === 'logout'
      ? 'Pengguna tahu lokasi tombol keluar atau konfirmasi logout.'
      : slideModel.stageKind === 'reply'
      ? 'Pengguna tahu lokasi untuk membalas pertanyaan.'
      : slideModel.stageKind === 'detail'
      ? 'Pengguna bisa membuka detail data untuk peninjauan.'
      : slideModel.stageKind === 'history'
      ? 'Pengguna bisa membaca riwayat data yang sudah tersimpan.'
      : slideModel.stageKind === 'month'
      ? 'Pengguna tahu cara mengganti periode laporan.'
      : slideModel.stageKind === 'summary'
      ? 'Pengguna melihat ringkasan yang siap dibaca.'
      : slideModel.stageKind === 'export'
      ? 'Pengguna tahu lokasi unduh CSV dan PDF.'
      : slideModel.stageKind === 'tab'
      ? 'Pengguna tahu tab mana yang sedang aktif.'
      : 'Pengguna melihat langkah berikutnya dengan jelas.',
    {
      x: 0.9,
      y: 4.82,
      w: 5.1,
      h: 0.65,
      fontFace: 'Aptos',
      fontSize: 10,
      color: '334155',
      margin: 0,
      fit: 'shrink',
    }
  );

  const screenshotPath = path.join(screenshotsDir, slideModel.screenshotFile);
  if (fs.existsSync(screenshotPath)) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.85,
      y: 0.92,
      w: 5.9,
      h: 5.95,
      rectRadius: 0.08,
      fill: { color: 'E2E8F0' },
      line: { color: 'CBD5E1', pt: 1 },
    });
    slide.addImage({
      path: screenshotPath,
      x: 6.95,
      y: 1.02,
      w: 5.7,
      h: 5.75,
    });
  } else {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.85,
      y: 0.92,
      w: 5.9,
      h: 5.95,
      rectRadius: 0.08,
      fill: { color: 'F8FAFC' },
      line: { color: 'CBD5E1', pt: 1 },
    });
    slide.addText(`Screenshot missing\n${slideModel.screenshotFile}`, {
      x: 7.15,
      y: 3.0,
      w: 5.3,
      h: 0.8,
      fontFace: 'Aptos',
      fontSize: 14,
      bold: true,
      align: 'center',
      color: 'EF4444',
      margin: 0,
    });
  }
}

export async function generatePptx({
  deck,
  screenshotsDir,
  outputFile,
}: GeneratePptxOptions): Promise<void> {
  await fs.promises.mkdir(path.dirname(outputFile), { recursive: true });

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'KMS Digital';
  pptx.company = 'KMS Digital';
  pptx.subject = 'User guide export';
  pptx.title = deck.fileName;

  addCoverSlide(pptx, deck);

  deck.slides.forEach((slideModel) => {
    if (slideModel.kind === 'role') {
      addRoleSlide(pptx, slideModel);
      return;
    }
    if (slideModel.kind === 'section') {
      addSectionSlide(pptx, slideModel, screenshotsDir);
      return;
    }
    if (slideModel.kind === 'stage') {
      addStageSlide(pptx, slideModel, screenshotsDir);
    }
  });

  await pptx.writeFile({ fileName: outputFile });
}
