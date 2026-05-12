import { ROLE_HOME } from '../../../features/auth/roleHome';

describe('ROLE_HOME', () => {
  test('maps all 5 roles to a route', () => {
    expect(ROLE_HOME.ORANG_TUA).toEqual('/orangtua/balita');
    expect(ROLE_HOME.KADER_POSYANDU).toEqual('/kader/beranda');
    expect(ROLE_HOME.TENAGA_KESEHATAN).toEqual('/tenkes/forum');
    expect(ROLE_HOME.DESA).toEqual('/desa/beranda');
    expect(ROLE_HOME.ADMIN).toEqual('/admin/dashboard/desa');
  });

  test('all paths start with slash', () => {
    Object.values(ROLE_HOME).forEach((path) => {
      expect(path).toMatch(/^\//);
    });
  });

  test('has exactly 5 roles', () => {
    expect(Object.keys(ROLE_HOME)).toHaveLength(5);
  });
});
