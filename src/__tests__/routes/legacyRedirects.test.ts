import { LEGACY_REDIRECTS } from '../../routes/legacyRedirects';

describe('legacy redirects', () => {
  test('contains expected number of routes', () => {
    expect(LEGACY_REDIRECTS.length).toBeGreaterThanOrEqual(12);
  });

  test('all entries have from and to', () => {
    LEGACY_REDIRECTS.forEach((entry) => {
      expect(entry.from).toMatch(/^\//);
      expect(entry.to).toMatch(/^\//);
    });
  });

  test('no duplicate from paths', () => {
    const froms = LEGACY_REDIRECTS.map((e) => e.from);
    const unique = new Set(froms);
    expect(unique.size).toEqual(froms.length);
  });

  test('covers all four sign-in variants', () => {
    const froms = LEGACY_REDIRECTS.map((e) => e.from);
    expect(froms).toContain('/sign-in');
    expect(froms).toContain('/sign-in/admin');
    expect(froms).toContain('/sign-in/desa');
    expect(froms).toContain('/sign-in/tenaga-kesehatan');
    expect(froms).toContain('/sign-in/kader-posyandu');
  });

  test('sign-in variants carry role query param', () => {
    const adminEntry = LEGACY_REDIRECTS.find((e) => e.from === '/sign-in/admin');
    expect(adminEntry.to).toEqual('/masuk?role=ADMIN');

    const kaderEntry = LEGACY_REDIRECTS.find((e) => e.from === '/sign-in/kader-posyandu');
    expect(kaderEntry.to).toEqual('/masuk?role=KADER_POSYANDU');
  });

  test('maps old role dashboards to new paths', () => {
    const map = Object.fromEntries(LEGACY_REDIRECTS.map((e) => [e.from, e.to]));
    expect(map['/dashboard']).toEqual('/orangtua/balita');
    expect(map['/kader-posyandu/dashboard']).toEqual('/kader/balita');
    expect(map['/desa/dashboard']).toEqual('/desa/beranda');
    expect(map['/tenaga-kesehatan/dashboard']).toEqual('/tenkes/forum');
  });

  test('includes tenkes detail redirect', () => {
    const entry = LEGACY_REDIRECTS.find((e) => e.from === '/tenaga-kesehatan/detail/:id');
    expect(entry).toBeDefined();
    expect(entry.to).toEqual('/tenkes/balita/:id');
  });

  test('includes kader beranda shortcut redirect', () => {
    const entry = LEGACY_REDIRECTS.find((e) => e.from === '/kader/beranda');
    expect(entry).toBeDefined();
    expect(entry.to).toEqual('/kader/balita');
  });

  test('redirects forum saya, desa acara, tenkes beranda to new locations', () => {
    const map = Object.fromEntries(LEGACY_REDIRECTS.map((r) => [r.from, r.to]));
    expect(map['/orangtua/forum/saya']).toEqual('/orangtua/forum?tab=saya');
    expect(map['/desa/acara']).toEqual('/desa/beranda#acara');
    expect(map['/tenkes/beranda']).toEqual('/tenkes/forum');
  });

  test('my-forum and desa reminder skip intermediate redirects', () => {
    const map = Object.fromEntries(LEGACY_REDIRECTS.map((r) => [r.from, r.to]));
    expect(map['/my-forum']).toEqual('/orangtua/forum?tab=saya');
    expect(map['/desa/reminder']).toEqual('/desa/beranda#acara');
  });

  test('no redirect target points at another redirect source (no chains)', () => {
    const sources = new Set(LEGACY_REDIRECTS.map((r) => r.from));
    const violators = LEGACY_REDIRECTS
      .filter((r) => {
        const basePath = r.to.split('?')[0].split('#')[0];
        return sources.has(basePath);
      })
      .map((r) => `${r.from} -> ${r.to}`);
    expect(violators).toEqual([]);
  });
});
