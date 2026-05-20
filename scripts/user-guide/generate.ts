import fs from 'node:fs/promises';
import path from 'node:path';

import dayjs from 'dayjs';
import { chromium } from 'playwright';

import { guideContent } from '../../src/features/user-guide/data/guideContent';
import { buildPresentationModel } from '../../src/features/user-guide/export/buildPresentationModel';
import {
  buildScreenshotPlan,
  type ScreenshotJob,
} from '../../src/features/user-guide/export/buildScreenshotPlan';
import { getSectionShots } from '../../src/features/user-guide/export/screenshotStages';
import { generatePptx } from '../../src/features/user-guide/export/generatePptx';
import type { GuideRoleId } from '../../src/features/user-guide/types';
import type { Session } from '../../src/types/session';

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'user-guide');
const ASSETS_DIR = path.join(OUTPUT_DIR, 'assets');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'KMS-Digital-User-Guide.pptx');
const TOUR_COMPLETED_KEYS: GuideRoleId[] = [
  'ADMIN',
  'DESA',
  'KADER_POSYANDU',
  'TENAGA_KESEHATAN',
  'ORANG_TUA',
];
const ONLY_STAGE = process.env.USER_GUIDE_ONLY_STAGE;

const TODAY = dayjs();

function iso(daysOffset = 0): string {
  return TODAY.add(daysOffset, 'day').toISOString();
}

function ymd(daysOffset = 0): string {
  return TODAY.add(daysOffset, 'day').format('YYYY-MM-DD');
}

function currentMonthDate(daysOffset = 0): string {
  return TODAY.add(daysOffset, 'day').format('YYYY-MM-DD');
}

const DEMO_DESA = [
  { id: 1, name: 'Lebakwangi', created_at: iso(-8) },
  { id: 2, name: 'Sukamaju', created_at: iso(-18) },
];

const DEMO_POSYANDU = [
  {
    id: 11,
    nama: 'Posyandu Mawar',
    alamat: 'RW 01 Lebakwangi',
    id_desa: 1,
    desa: { id: 1, name: 'Lebakwangi' },
    created_at: iso(-6),
  },
  {
    id: 12,
    nama: 'Posyandu Melati',
    alamat: 'RW 03 Lebakwangi',
    id_desa: 1,
    desa: { id: 1, name: 'Lebakwangi' },
    created_at: iso(-14),
  },
  {
    id: 21,
    nama: 'Posyandu Cempaka',
    alamat: 'RW 02 Sukamaju',
    id_desa: 2,
    desa: { id: 2, name: 'Sukamaju' },
    created_at: iso(-22),
  },
];

const DEMO_KADER = [
  {
    id: 101,
    nama: 'Siti Rahma',
    email: 'siti.rahma@demo.id',
    status: true,
    id_desa: 1,
    desa: { id: 1, name: 'Lebakwangi' },
    id_posyandu: 11,
    posyandu: { id: 11, nama: 'Posyandu Mawar' },
    created_at: iso(-4),
  },
  {
    id: 102,
    nama: 'Dini Lestari',
    email: 'dini.lestari@demo.id',
    status: false,
    id_desa: 1,
    desa: { id: 1, name: 'Lebakwangi' },
    id_posyandu: 12,
    posyandu: { id: 12, nama: 'Posyandu Melati' },
    created_at: iso(-10),
  },
];

const DEMO_NAKES = [
  {
    id: 201,
    nama: 'dr. Andika',
    email: 'andika@demo.id',
    status: true,
    id_desa: 1,
    desa: { id: 1, name: 'Lebakwangi' },
    created_at: iso(-3),
  },
  {
    id: 202,
    nama: 'Bidan Rani',
    email: 'rani@demo.id',
    status: true,
    id_desa: 2,
    desa: { id: 2, name: 'Sukamaju' },
    created_at: iso(-12),
  },
];

const DEMO_ORANG_TUA = [
  {
    id: 401,
    nama: 'Faridz Ot',
    email: 'faridztot@demo.id',
    alamat: 'Lebakwangi, RT 02/RW 01',
    status: true,
    id_desa: 1,
    id_posyandu: 11,
    created_at: iso(-5),
  },
  {
    id: 402,
    nama: 'Maya Sari',
    email: 'maya.sari@demo.id',
    alamat: 'Lebakwangi, RT 05/RW 03',
    status: false,
    id_desa: 1,
    id_posyandu: 12,
    created_at: iso(-2),
  },
];

const DEMO_PENDING_ANAK = [
  {
    id: 501,
    nama: 'Alya Putri',
    tanggal_lahir: currentMonthDate(-680),
    gender: 'PEREMPUAN',
    nama_ortu: 'Faridz Ot',
    created_at: iso(-1),
  },
  {
    id: 502,
    nama: 'Bima Arga',
    tanggal_lahir: currentMonthDate(-730),
    gender: 'LAKI_LAKI',
    nama_ortu: 'Maya Sari',
    created_at: iso(-2),
  },
];

const DEMO_ANAK = [
  {
    id: 1,
    nama: 'Bima Pratama',
    panggilan: 'Bima',
    tanggal_lahir: currentMonthDate(-760),
    gender: 'LAKI_LAKI',
    alamat: 'Lebakwangi, RT 02/RW 01',
    nama_ortu: 'Faridz Ot',
    id_orang_tua: 401,
    id_posyandu: 11,
    status: true,
    created_at: iso(-9),
  },
  {
    id: 2,
    nama: 'Alya Nabila',
    panggilan: 'Alya',
    tanggal_lahir: currentMonthDate(-690),
    gender: 'PEREMPUAN',
    alamat: 'Lebakwangi, RT 02/RW 01',
    nama_ortu: 'Faridz Ot',
    id_orang_tua: 401,
    id_posyandu: 11,
    status: true,
    created_at: iso(-7),
  },
  {
    id: 3,
    nama: 'Cakra Pratama',
    panggilan: 'Cakra',
    tanggal_lahir: currentMonthDate(-530),
    gender: 'LAKI_LAKI',
    alamat: 'Sukamaju, RT 04/RW 02',
    nama_ortu: 'Maya Sari',
    id_orang_tua: 402,
    id_posyandu: 12,
    status: true,
    created_at: iso(-6),
  },
];

const DEMO_PENGUKURAN_BY_ANAK: Record<number, Array<Record<string, any>>> = {
  1: [
    {
      id: 9001,
      id_anak: 1,
      date: currentMonthDate(-3),
      berat: 8.4,
      tinggi: 71,
      lingkar_kepala: 45,
      lila: 13.2,
      catatan: 'Kondisi stabil, nafsu makan baik.',
      z_score_berat: -0.4,
      z_score_tinggi: 0.1,
      z_score_lingkar_kepala: 0.0,
      z_score_gizi: 0.2,
      created_at: iso(-3),
    },
    {
      id: 9002,
      id_anak: 1,
      date: TODAY.subtract(1, 'month').date(12).format('YYYY-MM-DD'),
      berat: 8.0,
      tinggi: 70,
      lingkar_kepala: 44.6,
      lila: 13.0,
      catatan: 'Riwayat bulan lalu.',
      z_score_berat: -0.6,
      z_score_tinggi: -0.1,
      z_score_lingkar_kepala: -0.2,
      z_score_gizi: -0.1,
      created_at: iso(-30),
    },
  ],
  2: [
    {
      id: 9003,
      id_anak: 2,
      date: currentMonthDate(-5),
      berat: 9.1,
      tinggi: 74,
      lingkar_kepala: 46,
      lila: 13.5,
      catatan: 'Perlu pemantauan asupan makan.',
      z_score_berat: -2.6,
      z_score_tinggi: -1.9,
      z_score_lingkar_kepala: -1.0,
      z_score_gizi: -2.7,
      created_at: iso(-5),
    },
  ],
  3: [],
};

const DEMO_STATISTIK_GIZI = [
  {
    id_posyandu: 11,
    nama_posyandu: 'Posyandu Mawar',
    berat_badan: { normal: 8, kurus: 2, sangat_kurus: 1 },
    tinggi_badan: { normal: 9, pendek: 1, sangat_pendek: 1 },
    lingkar_kepala: { normal: 10, mikrosefali: 1 },
  },
  {
    id_posyandu: 12,
    nama_posyandu: 'Posyandu Melati',
    berat_badan: { normal: 6, gemuk: 1 },
    tinggi_badan: { normal: 5, tinggi: 2 },
    lingkar_kepala: { normal: 7, makrosefali: 1 },
  },
];

const DEMO_KATEGORI = [
  { id: 1, name: 'Gizi Anak' },
  { id: 2, name: 'Tumbuh Kembang' },
  { id: 3, name: 'Imunisasi' },
];

const DEMO_ARTIKEL = [
  {
    id: 1,
    judul: 'Pentingnya Pemantauan Gizi Balita',
    penulis: 'Admin KMS',
    kategori: 'Gizi Anak',
    created_at: iso(-2),
    updated_at: iso(-2),
    content: '<p>Konten artikel demo.</p>',
  },
  {
    id: 2,
    judul: 'Tips Menjaga Pola Makan Anak',
    penulis: 'Dinas Kesehatan',
    kategori: 'Gizi Anak',
    created_at: iso(-11),
    updated_at: iso(-11),
    content: '<p>Konten artikel demo kedua.</p>',
  },
];

const DEMO_REMINDERS = [
  {
    id: 1,
    judul: 'Posyandu Bulan Ini',
    deskripsi: 'Pelaksanaan penimbangan balita dan pembagian vitamin.',
    tanggal_reminder: currentMonthDate(2),
  },
  {
    id: 2,
    judul: 'Rapat Evaluasi',
    deskripsi: 'Evaluasi hasil posyandu dan tindak lanjut data.',
    tanggal_reminder: currentMonthDate(7),
  },
];

const DEMO_POSTS = [
  {
    post_id: 1,
    title: 'Anak demam setelah imunisasi, apa yang harus dilakukan?',
    content: 'Setelah imunisasi tadi malam, anak saya rewel dan hangat.',
    nama: 'Faridz Ot',
    posyandu: 'Posyandu Mawar',
    role: 'ORANG_TUA',
    time: iso(-1),
    user_id: 401,
    jawaban_tenaga_kesehatan: [
      {
        comment_id: 1,
        nama: 'dr. Andika',
        content: 'Bila demam ringan, kompres hangat dan pantau suhu tubuh.',
        role: 'TENAGA_KESEHATAN',
        time: iso(-1),
      },
    ],
  },
  {
    post_id: 2,
    title: 'Balita sulit makan pagi, ada saran menu?',
    content: 'Anak saya selalu menolak sarapan.',
    nama: 'Maya Sari',
    posyandu: 'Posyandu Melati',
    role: 'ORANG_TUA',
    time: iso(-3),
    user_id: 402,
    jawaban_tenaga_kesehatan: [],
  },
];

const DEMO_COMMENTS_BY_POST: Record<number, Array<Record<string, any>>> = {
  1: [
    {
      comment_id: 1001,
      user_id: 31,
      post_id: 1,
      nama: 'dr. Andika',
      role: 'TENAGA_KESEHATAN',
      content: 'Pantau suhu dan beri cairan cukup.',
      time: iso(-1),
    },
    {
      comment_id: 1002,
      user_id: 401,
      post_id: 1,
      nama: 'Faridz Ot',
      role: 'ORANG_TUA',
      content: 'Terima kasih, dok.',
      time: iso(0),
    },
  ],
  2: [
    {
      comment_id: 1003,
      user_id: 31,
      post_id: 2,
      nama: 'Bidan Rani',
      role: 'TENAGA_KESEHATAN',
      content: 'Coba variasikan sarapan dengan porsi kecil yang menarik.',
      time: iso(-2),
    },
  ],
};

function buildRoleDemoProfile(roleId: GuideRoleId, session: Session) {
  return {
    id: session.user.id,
    name: session.user.name,
    email:
      roleId === 'ORANG_TUA'
        ? 'faridztot@demo.id'
        : roleId === 'KADER_POSYANDU'
        ? 'siti.rahma@demo.id'
        : roleId === 'TENAGA_KESEHATAN'
        ? 'andika@demo.id'
        : roleId === 'DESA'
        ? 'desa@demo.id'
        : 'admin@demo.id',
    role: roleId,
    id_desa: session.user.id_desa ?? 1,
    id_posyandu: session.user.id_posyandu ?? 11,
    desa_name: session.user.desa_name ?? 'Lebakwangi',
    nama_desa: session.user.nama_desa ?? 'Lebakwangi',
    posyandu_name: session.user.posyandu_name ?? 'Posyandu Mawar',
  };
}

function getChildrenForSession(session: Session) {
  if (session.user.role === 'ORANG_TUA') {
    return DEMO_ANAK.filter((anak) => anak.id_orang_tua === session.user.id);
  }
  return DEMO_ANAK;
}

function getChildById(id: string | number | undefined) {
  const key = Number(id);
  return DEMO_ANAK.find((anak) => anak.id === key) ?? DEMO_ANAK[0];
}

function getPengukuranByAnak(id: string | number | undefined) {
  const key = Number(id);
  return DEMO_PENGUKURAN_BY_ANAK[key] ?? [];
}

function getPostById(id: string | number | undefined) {
  const key = Number(id);
  return DEMO_POSTS.find((post) => post.post_id === key) ?? DEMO_POSTS[0];
}

function jsonResponse(data: unknown, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify({ data }),
  };
}

function textResponse(body: string, contentType = 'text/plain') {
  return {
    status: 200,
    contentType,
    body,
  };
}

function resolveApiMock(session: Session, pathname: string, method: string) {
  if (pathname === '/api/desa' && method === 'GET') return jsonResponse(DEMO_DESA);
  if (pathname === '/api/desa' && method !== 'GET') return jsonResponse({ ok: true });
  if (pathname.startsWith('/api/desa/') && method !== 'GET') return jsonResponse({ ok: true });

  if (pathname === '/api/posyandu' && method === 'GET') return jsonResponse(DEMO_POSYANDU);
  if (pathname === '/api/posyandu' && method !== 'GET') return jsonResponse({ ok: true });
  if (pathname.startsWith('/api/posyandu/') && method !== 'GET') {
    return jsonResponse({ ok: true });
  }

  if (pathname === '/api/posyandu/kader-posyandu' && method === 'GET') return jsonResponse(DEMO_KADER);
  if (pathname === '/api/posyandu/tenaga-kesehatan' && method === 'GET') return jsonResponse(DEMO_NAKES);
  if (pathname === '/api/posyandu/orang-tua' && method === 'GET') return jsonResponse(DEMO_ORANG_TUA.filter((ot) => ot.status));
  if (pathname === '/api/posyandu/orang-tua/list' && method === 'GET') return jsonResponse(DEMO_ORANG_TUA);
  if (pathname === '/api/posyandu/belum-approve' && method === 'GET') return jsonResponse(DEMO_PENDING_ANAK);
  if (pathname === '/api/posyandu/data-anak' && method === 'GET') return jsonResponse(getChildrenForSession(session));
  if (pathname === '/api/orang-tua/data-anak' && method === 'GET') return jsonResponse(getChildrenForSession(session));

  if (pathname === '/api/kategori' && method === 'GET') return jsonResponse(DEMO_KATEGORI);
  if (pathname === '/api/artikel' && method === 'GET') return jsonResponse(DEMO_ARTIKEL);
  if (pathname.startsWith('/api/artikel/') && method === 'GET') {
    const id = pathname.split('/').pop();
    return jsonResponse(DEMO_ARTIKEL.find((artikel) => String(artikel.id) === String(id)) ?? DEMO_ARTIKEL[0]);
  }
  if (pathname === '/api/artikel' && method !== 'GET') return jsonResponse({ ok: true });
  if (pathname.startsWith('/api/artikel/') && method !== 'GET') return jsonResponse({ ok: true });

  if (pathname === '/api/reminder' && method === 'GET') return jsonResponse(DEMO_REMINDERS);
  if (pathname === '/api/reminder' && method !== 'GET') return jsonResponse({ ok: true });
  if (pathname.startsWith('/api/reminder/') && method !== 'GET') return jsonResponse({ ok: true });

  if (pathname.startsWith('/api/statistik-gizi/') && method === 'GET') return jsonResponse(DEMO_STATISTIK_GIZI);

  if (pathname.startsWith('/api/posyandu/data-anak/export-data-anak-csv') && method === 'GET') {
    return textResponse('id,nama,tanggal_lahir\n1,Bima Pratama,2024-03-01\n');
  }
  if (pathname.startsWith('/api/export-data-anak-csv') && method === 'GET') {
    return textResponse('id,nama,tanggal_lahir\n1,Bima Pratama,2024-03-01\n');
  }

  if (pathname.startsWith('/api/posyandu/data-anak/') && method === 'GET') {
    const id = pathname.split('/').pop();
    return jsonResponse(getChildById(id));
  }
  if (pathname.startsWith('/api/orang-tua/data-anak/') && method === 'GET') {
    const id = pathname.split('/').pop();
    return jsonResponse(getChildById(id));
  }

  if (pathname.startsWith('/api/posyandu/statistik-anak/') && method === 'GET') {
    const id = pathname.split('/').pop();
    return jsonResponse(getPengukuranByAnak(id));
  }
  if (pathname.startsWith('/api/orang-tua/statistik-anak/') && method === 'GET') {
    const id = pathname.split('/').pop();
    return jsonResponse(getPengukuranByAnak(id));
  }

  if (pathname.startsWith('/api/post/orang-tua/') && method === 'GET') {
    const id = pathname.split('/').pop();
    const ownerId = Number(id);
    const list =
      ownerId === session.user.id
        ? DEMO_POSTS.filter((post) => post.user_id === ownerId)
        : DEMO_POSTS;
    return jsonResponse(list);
  }
  if (pathname.startsWith('/api/post/tenaga-kesehatan/') && method === 'GET') {
    return jsonResponse(DEMO_POSTS);
  }
  if (pathname.startsWith('/api/post/') && method === 'GET') {
    const id = pathname.split('/').pop();
    return jsonResponse(getPostById(id));
  }
  if (pathname === '/api/post' && method !== 'GET') return jsonResponse({ ok: true });

  if (pathname.startsWith('/api/comment/') && method === 'GET') {
    const id = pathname.split('/').pop();
    return jsonResponse(DEMO_COMMENTS_BY_POST[Number(id)] ?? []);
  }
  if (pathname === '/api/comment' && method !== 'GET') return jsonResponse({ ok: true });

  if (pathname === '/api/profile' && method === 'GET') return jsonResponse(buildRoleDemoProfile(session.user.role, session));
  if (pathname === '/api/profile' && method !== 'GET') return jsonResponse({ ok: true });

  if (pathname.startsWith('/api/auth/')) return jsonResponse({ ok: true });

  return null;
}

async function setupApiMocks(context: import('playwright').BrowserContext, session: Session): Promise<void> {
  await context.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (!['xhr', 'fetch'].includes(request.resourceType())) {
      await route.continue();
      return;
    }
    if (process.env.USER_GUIDE_DEBUG === '1') {
      console.log(`[route] ${request.resourceType()} ${request.method()} ${url.pathname}`);
    }
    const mock = resolveApiMock(session, url.pathname, request.method());
    if (mock) {
      await route.fulfill(mock);
      return;
    }
    if (request.method() === 'GET') {
      await route.fulfill(jsonResponse([]));
      return;
    }
    await route.fulfill(jsonResponse({ ok: true }));
  });
}

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
  const session: Session = {
    user: {
      id: index + 1,
      name: `${roleName} Guide`,
      role: roleId,
    },
    token: {
      value: `guide-token-${roleId.toLowerCase()}`,
    },
  };

  if (roleId === 'DESA') {
    session.user.id = 11;
    session.user.id_desa = 1;
    session.user.desa_name = 'Lebakwangi';
    session.user.nama_desa = 'Lebakwangi';
  }

  if (roleId === 'KADER_POSYANDU') {
    session.user.id = 21;
    session.user.id_desa = 1;
    session.user.id_posyandu = 11;
    session.user.desa_name = 'Lebakwangi';
    session.user.posyandu_name = 'Posyandu Mawar';
  }

  if (roleId === 'TENAGA_KESEHATAN') {
    session.user.id = 31;
    session.user.id_desa = 1;
    session.user.desa_name = 'Lebakwangi';
  }

  if (roleId === 'ORANG_TUA') {
    session.user.id = 401;
    session.user.id_desa = 1;
    session.user.id_posyandu = 11;
    session.user.desa_name = 'Lebakwangi';
    session.user.nama_desa = 'Lebakwangi';
    session.user.posyandu_name = 'Posyandu Mawar';
  }

  return session;
}

async function prepareOutputDirectories(): Promise<void> {
  await fs.rm(ASSETS_DIR, { recursive: true, force: true });
  await fs.mkdir(ASSETS_DIR, { recursive: true });
  await fs.rm(OUTPUT_FILE, { force: true });
}

async function seedSession(
  context: import('playwright').BrowserContext,
  session: Session
): Promise<void> {
  await context.addInitScript(
    ({ sessionKey, dismissedKey, tourKeys, value }) => {
      localStorage.setItem(sessionKey, JSON.stringify(value));
      localStorage.setItem(dismissedKey, Date.now().toString());
      for (const key of tourKeys) {
        localStorage.setItem(key, '1');
      }
    },
    {
      sessionKey: 'kms_session_v1',
      dismissedKey: 'kms_pwa_install_dismissed',
      tourKeys: TOUR_COMPLETED_KEYS.map((role) => `kms_tour_completed_${role}`),
      value: session,
    }
  );
}

async function clickButtonByName(
  page: import('playwright').Page,
  buttonName: string
): Promise<boolean> {
  const button = page.getByRole('button', { name: buttonName }).first();
  if ((await button.count()) === 0) return false;
  await button.click().catch(() => undefined);
  return true;
}

async function hoverButtonByName(
  page: import('playwright').Page,
  buttonName: string
): Promise<boolean> {
  const button = page.getByRole('button', { name: buttonName }).first();
  if ((await button.count()) === 0) return false;
  await button.hover().catch(() => undefined);
  return true;
}

async function fillByLabel(
  page: import('playwright').Page,
  label: string,
  value: string
): Promise<boolean> {
  const field = page.getByLabel(label, { exact: false }).first();
  if ((await field.count()) === 0) return false;
  await field.fill(value).catch(() => undefined);
  return true;
}

async function selectByLabel(
  page: import('playwright').Page,
  label: string,
  option: string
): Promise<boolean> {
  const field = page.getByLabel(label, { exact: false }).first();
  if ((await field.count()) === 0) return false;
  await field.click().catch(() => undefined);
  await page.getByRole('option', { name: option }).first().click().catch(() => undefined);
  return true;
}

async function typeIntoEditor(page: import('playwright').Page, selector: string, value: string) {
  const editor = page.locator(selector).first();
  if ((await editor.count()) === 0) return;
  await editor.click().catch(() => undefined);
  await page.keyboard.type(value);
}

async function highlightSelectors(
  page: import('playwright').Page,
  selectors: string[] = []
): Promise<void> {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0) continue;
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await locator.evaluate((element) => {
      const el = element as HTMLElement;
      el.style.outline = '4px solid rgba(37, 99, 235, 0.95)';
      el.style.outlineOffset = '2px';
      el.style.borderRadius = '10px';
      el.dataset.userGuideHighlighted = '1';
    }).catch(() => undefined);
  }
}

async function waitForSectionReady(page: import('playwright').Page, sectionId: string): Promise<void> {
  const selectors: Record<string, string[]> = {
    'admin-dashboard-ringkas': ['[data-tour-id="admin-dashboard-header"]', '[data-tour-id="admin-stats"]'],
    'admin-desa': ['[data-tour-id="admin-desa-header"]'],
    'admin-posyandu': ['[data-tour-id="admin-posyandu-header"]'],
    'admin-kader-posyandu': ['[data-tour-id="admin-kader-header"]'],
    'admin-tenaga-kesehatan': ['[data-tour-id="admin-tenkes-header"]'],
    'admin-artikel': ['[data-tour-id="admin-artikel-header"]', '[data-tour-id="admin-artikel-table"]'],
    'admin-artikel-baru': ['[data-tour-id="admin-artikel-baru-header"]'],
    'desa-beranda': ['[data-tour-id="desa-header"]', '[data-tour-id="desa-export"]', '[data-tour-id="desa-laporan"]'],
    'kader-balita': ['[data-tour-id="kader-progress"]', '[data-tour-id="kader-search"]'],
    'kader-balita-detail': ['[data-tour-id="anak-detail-riwayat"]'],
    'kader-orangtua': ['[data-tour-id="kader-akunortu-table"]'],
    'kader-laporan': ['[data-tour-id="kader-laporan-header"]'],
    'tenkes-forum': ['[data-tour-id="tenkes-forum-list"]'],
    'tenkes-balita-detail': ['[data-tour-id="tenkes-forum-detail-post"]', '[data-tour-id="tenkes-forum-detail-form"]'],
    'orangtua-balita': ['[data-tour-id="ot-home-anak-area"]'],
    'orangtua-forum': ['[data-tour-id="ot-forum-list"]'],
    'orangtua-forum-detail': ['[data-tour-id="ot-forum-detail-form"]'],
    'orangtua-balita-detail': ['[data-tour-id="anak-detail-riwayat"]'],
  };

  const chosen = selectors[sectionId] ?? [];
  for (const selector of chosen) {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => undefined);
  }
}

async function prepareScreenshotState(
  page: import('playwright').Page,
  job: ScreenshotJob
): Promise<void> {
  const shot = getSectionShots(job.sectionId).find((item) => item.id === job.stageId);

  switch (job.sectionId) {
    case 'admin-dashboard-ringkas':
      if (job.stageKind === 'logout') {
        await clickButtonByName(page, 'Keluar');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      }
      return;
    case 'admin-desa':
      if (job.stageKind === 'create') {
        await clickButtonByName(page, 'Tambah Desa');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await fillByLabel(page, 'Nama Desa', 'Desa Panorama');
        await fillByLabel(page, 'Kata Sandi', '12345678');
        await fillByLabel(page, 'Konfirmasi Kata Sandi', '12345678');
      } else if (job.stageKind === 'delete') {
        await clickButtonByName(page, 'Hapus');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      }
      return;
    case 'admin-posyandu':
      if (job.stageKind === 'create') {
        await clickButtonByName(page, 'Tambah Posyandu');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await selectByLabel(page, 'Pilih Desa', 'Lebakwangi');
        await fillByLabel(page, 'Nama Posyandu', 'Posyandu Cempaka');
        await fillByLabel(page, 'Alamat', 'RW 04 Lebakwangi');
      } else if (job.stageKind === 'edit') {
        await clickButtonByName(page, 'Edit');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      } else if (job.stageKind === 'delete') {
        await clickButtonByName(page, 'Hapus');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      }
      return;
    case 'admin-kader-posyandu':
      if (job.stageKind === 'create') {
        await clickButtonByName(page, 'Tambah Kader Posyandu');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await fillByLabel(page, 'Nama', 'Siti Rahma');
        await fillByLabel(page, 'Email', 'siti.rahma@demo.id');
        await fillByLabel(page, 'Kata Sandi', '12345678');
        await fillByLabel(page, 'Konfirmasi Kata Sandi', '12345678');
        await selectByLabel(page, 'Desa', 'Lebakwangi');
        await selectByLabel(page, 'Posyandu', 'Posyandu Mawar');
        await selectByLabel(page, 'Status', 'Disetujui');
      } else if (job.stageKind === 'edit') {
        await clickButtonByName(page, 'Edit');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      } else if (job.stageKind === 'delete') {
        await clickButtonByName(page, 'Hapus');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      }
      return;
    case 'admin-tenaga-kesehatan':
      if (job.stageKind === 'create') {
        await clickButtonByName(page, 'Tambah Tenaga Kesehatan');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await fillByLabel(page, 'Nama', 'dr. Andika');
        await fillByLabel(page, 'Email', 'andika@demo.id');
        await fillByLabel(page, 'Kata Sandi', '12345678');
        await fillByLabel(page, 'Konfirmasi Kata Sandi', '12345678');
        await selectByLabel(page, 'Desa', 'Lebakwangi');
      } else if (job.stageKind === 'delete') {
        await clickButtonByName(page, 'Hapus');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      }
      return;
    case 'admin-artikel':
      if (job.stageKind === 'edit') {
        await page
          .locator('[data-tour-id="admin-artikel-table"] [data-tour-id="admin-artikel-edit-button"]')
          .first()
          .click()
          .catch(() => undefined);
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      } else if (job.stageKind === 'delete') {
        await page
          .locator('[data-tour-id="admin-artikel-table"] [data-tour-id="admin-artikel-delete-button"]')
          .first()
          .click()
          .catch(() => undefined);
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      } else if (job.stageKind === 'create') {
        await page
          .locator('[data-tour-id="admin-artikel-new-button"]')
          .first()
          .hover()
          .catch(() => undefined);
      }
      return;
    case 'admin-artikel-baru':
      if (job.stageKind === 'fill' || job.stageKind === 'publish') {
        await selectByLabel(page, 'Kategori', 'Gizi Anak').catch(() => undefined);
        await fillByLabel(page, 'Judul', 'Panduan Gizi Balita');
        await fillByLabel(page, 'Nama Penulis', 'Admin KMS');
        await typeIntoEditor(page, '.ql-editor', 'Konten artikel demo untuk user guide.');
      }
      return;
    case 'desa-beranda':
      if (job.stageKind === 'export') {
        await highlightSelectors(page, ['[data-tour-id="desa-export"]']);
      } else if (job.stageKind === 'summary') {
        await highlightSelectors(page, ['[data-tour-id="desa-laporan"]']);
      } else if (job.stageKind === 'create') {
        await fillByLabel(page, 'Judul Acara', 'Posyandu Bulan Ini');
        await fillByLabel(page, 'Deskripsi', 'Penimbangan balita dan pembagian vitamin.');
      } else if (job.stageKind === 'delete') {
        await clickButtonByName(page, 'Hapus');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      } else if (job.stageKind === 'logout') {
        await hoverButtonByName(page, 'Keluar');
      }
      return;
    case 'kader-balita':
      if (job.stageKind === 'create') {
        await clickButtonByName(page, 'Tambah Balita Baru');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await fillByLabel(page, 'Nama', 'Alya Putri');
        await fillByLabel(page, 'Panggilan', 'Alya');
        await selectByLabel(page, 'Jenis Kelamin', 'Perempuan');
        await fillByLabel(page, 'Alamat', 'Lebakwangi, RW 01');
      } else if (job.stageKind === 'logout') {
        await clickButtonByName(page, 'Keluar');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      }
      return;
    case 'kader-balita-detail':
      if (job.stageKind === 'edit') {
        await clickButtonByName(page, 'Ubah');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      } else if (job.stageKind === 'delete') {
        await clickButtonByName(page, 'Hapus');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      }
      return;
    case 'kader-orangtua':
      if (job.stageKind === 'tab') {
        await clickButtonByName(page, 'Daftar Aktif');
      } else if (job.stageKind === 'create') {
        await clickButtonByName(page, 'Tambah Orang Tua');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await fillByLabel(page, 'Nama', 'Faridz Ot');
        await fillByLabel(page, 'Email', 'faridztot@demo.id');
        await fillByLabel(page, 'Kata Sandi', '12345678');
        await fillByLabel(page, 'Alamat', 'Lebakwangi, RT 02/RW 01');
        await selectByLabel(page, 'Status', 'Disetujui');
      } else if (job.stageKind === 'edit') {
        await clickButtonByName(page, 'Ubah');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      } else if (job.stageKind === 'delete') {
        await clickButtonByName(page, 'Hapus');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      } else if (job.stageKind === 'logout') {
        await clickButtonByName(page, 'Keluar');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
      }
      return;
    case 'kader-laporan':
      if (job.stageKind === 'month') {
        await highlightSelectors(page, ['[data-tour-id="kader-laporan-picker"]']);
      } else if (job.stageKind === 'summary') {
        await highlightSelectors(page, ['[data-tour-id="kader-laporan-stats"]']);
      }
      return;
    case 'tenkes-forum':
      if (job.stageKind === 'detail') {
        await highlightSelectors(page, ['[data-tour-id="tenkes-forum-list"]']);
      } else if (job.stageKind === 'reply') {
        await page.getByRole('textbox').first().fill('Pantau kondisi anak dan beri cairan cukup.').catch(() => undefined);
      } else if (job.stageKind === 'logout') {
        await hoverButtonByName(page, 'Keluar');
      }
      return;
    case 'tenkes-balita-detail':
      if (job.stageKind === 'page') {
        await highlightSelectors(page, ['[data-tour-id="tenkes-forum-detail-post"]', '[data-tour-id="tenkes-forum-detail-form"]']);
      } else if (job.stageKind === 'detail') {
        await highlightSelectors(page, ['[data-tour-id="tenkes-forum-detail-post"]']);
      } else if (job.stageKind === 'reply') {
        await page
          .locator('textarea[placeholder="Bagikan jawaban atau tanggapan..."]')
          .fill('Pantau kondisi anak dan beri cairan cukup.')
          .catch(() => undefined);
      } else if (job.stageKind === 'history') {
        await highlightSelectors(page, ['[data-tour-id="tenkes-forum-detail-form"]']);
      }
      return;
    case 'orangtua-balita':
      if (job.stageKind === 'create') {
        await clickButtonByName(page, 'Tambah Anak');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await fillByLabel(page, 'Nama', 'Alya Putri');
        await fillByLabel(page, 'Panggilan', 'Alya');
        await selectByLabel(page, 'Jenis Kelamin', 'Perempuan');
        await fillByLabel(page, 'Alamat', 'Lebakwangi, RT 02/RW 01');
      } else if (job.stageKind === 'detail') {
        await highlightSelectors(page, ['[data-tour-id="ot-home-anak-area"]']);
      } else if (job.stageKind === 'logout') {
        await hoverButtonByName(page, 'Keluar');
      }
      return;
    case 'orangtua-forum':
      if (job.stageKind === 'tab') {
        await clickButtonByName(page, 'Punya Saya');
      } else if (job.stageKind === 'create') {
        await clickButtonByName(page, 'Tulis Pertanyaan');
        await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
        await fillByLabel(page, 'Judul', 'Anak demam setelah imunisasi');
        await fillByLabel(page, 'Pertanyaan', 'Apa yang harus saya lakukan jika demam ringan?');
      } else if (job.stageKind === 'detail') {
        await highlightSelectors(page, ['[data-tour-id="ot-forum-list"]']);
      } else if (job.stageKind === 'logout') {
        await hoverButtonByName(page, 'Keluar');
      }
      return;
    case 'orangtua-forum-detail':
      if (job.stageKind === 'reply') {
        await page
          .locator('textarea[placeholder="Bagikan jawaban atau tanggapan..."]')
          .fill('Terima kasih, dok. Saya akan pantau suhu anak.')
          .catch(() => undefined);
      } else if (job.stageKind === 'logout') {
        await hoverButtonByName(page, 'Keluar');
      }
      return;
    case 'orangtua-balita-detail':
      if (job.stageKind === 'history') {
        await highlightSelectors(page, ['[data-tour-id="anak-detail-riwayat"]', '[data-tour-id="anak-detail-chart"]']);
      }
      return;
    default:
      break;
  }

  if (shot?.focusSelectors?.length) {
    await highlightSelectors(page, shot.focusSelectors);
  }
}

async function captureScreenshots(baseUrl: string): Promise<void> {
  const screenshotPlan = buildScreenshotPlan(guideContent);
  const browser = await chromium.launch({ headless: true });
  const onlySection = process.env.USER_GUIDE_ONLY_SECTION;

  try {
    for (const [index, role] of guideContent.entries()) {
      const roleJobs = screenshotPlan.filter(
        (job) =>
          job.roleId === role.id &&
          (!onlySection || job.sectionId === onlySection) &&
          (!ONLY_STAGE || job.stageId === ONLY_STAGE)
      );
      if (roleJobs.length === 0) continue;

      const context = await browser.newContext({
        viewport: { width: 1440, height: 1200 },
        deviceScaleFactor: 1,
      });
      const session = buildSession(role.id, role.title, index);
      await seedSession(context, session);
      await setupApiMocks(context, session);
      const page = await context.newPage();
      if (process.env.USER_GUIDE_DEBUG === '1') {
        const roleId = role.id;
        page.on('console', (message) => {
          const type = message.type();
          if (type === 'error' || type === 'warning') {
            console.log(`[${roleId}] console:${type} ${message.text()}`);
          }
        });
        page.on('pageerror', (error) => {
          console.log(`[${roleId}] pageerror ${error.message}`);
        });
      }

      try {
        for (const job of roleJobs) {
          await page.goto(`${baseUrl}${job.route}`, {
            waitUntil: 'domcontentloaded',
          });
          await page.waitForLoadState('networkidle').catch(() => undefined);
          await waitForSectionReady(page, job.sectionId);
          await prepareScreenshotState(page, job);
          if (process.env.USER_GUIDE_DEBUG === '1') {
            const preview = await page.evaluate(
              () => document.body.innerText.replace(/\s+/g, ' ').slice(0, 600)
            );
            console.log(`[${job.sectionId}] ${page.url()}`);
            console.log(preview);
          }
          await page.waitForTimeout(1200);
          await page.screenshot({
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
