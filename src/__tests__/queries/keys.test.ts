import { qk } from '../../queries/keys';

describe('query key factory (qk)', () => {
  test('anak.all is a stable tuple', () => {
    expect(qk.anak.all).toEqual(['anak']);
    expect(qk.anak.all).toBe(qk.anak.all);
  });

  test('anak.list scopes by role', () => {
    expect(qk.anak.list('KADER_POSYANDU')).toEqual([
      'anak',
      'list',
      'KADER_POSYANDU',
    ]);
    expect(qk.anak.list('ORANG_TUA')).toEqual(['anak', 'list', 'ORANG_TUA']);
    expect(qk.anak.list('KADER_POSYANDU')).not.toEqual(qk.anak.list('ORANG_TUA'));
  });

  test('anak.detail includes id and role', () => {
    expect(qk.anak.detail(42, 'ORANG_TUA')).toEqual([
      'anak',
      'detail',
      42,
      'ORANG_TUA',
    ]);
  });

  test('pengukuran.byAnak includes anakId and role', () => {
    expect(qk.pengukuran.byAnak(7, 'KADER_POSYANDU')).toEqual([
      'pengukuran',
      'by-anak',
      7,
      'KADER_POSYANDU',
    ]);
  });

  test('laporan keys are scoped by id and bulan', () => {
    expect(qk.laporan.kader(3, '2026-05')).toEqual([
      'laporan',
      'kader',
      3,
      '2026-05',
    ]);
    expect(qk.laporan.desa(1, '2026-05')).toEqual([
      'laporan',
      'desa',
      1,
      '2026-05',
    ]);
    expect(qk.laporan.admin('2026-05')).toEqual(['laporan', 'admin', '2026-05']);
  });

  test('laporan keys differ between scopes for same bulan', () => {
    expect(qk.laporan.kader(1, '2026-05')).not.toEqual(qk.laporan.desa(1, '2026-05'));
  });

  test('artikel.list is static, artikel.detail is dynamic', () => {
    expect(qk.artikel.list).toEqual(['artikel', 'list']);
    expect(qk.artikel.detail(99)).toEqual(['artikel', 'detail', 99]);
  });

  test('all keys start with namespace prefix', () => {
    const namespaces = [
      qk.auth.all[0],
      qk.anak.all[0],
      qk.pengukuran.all[0],
      qk.laporan.all[0],
      qk.artikel.all[0],
      qk.post.all[0],
      qk.comment.all[0],
      qk.profile.all[0],
      qk.kategori.all[0],
    ];
    expect(namespaces).toEqual([
      'auth',
      'anak',
      'pengukuran',
      'laporan',
      'artikel',
      'post',
      'comment',
      'profile',
      'kategori',
    ]);
  });

  test('post.list scopes by role and userId', () => {
    expect(qk.post.list('ORANG_TUA', 7)).toEqual([
      'post',
      'list',
      'ORANG_TUA',
      7,
    ]);
    expect(qk.post.list('TENAGA_KESEHATAN', 7)).not.toEqual(
      qk.post.list('ORANG_TUA', 7)
    );
  });

  test('post.detail includes id', () => {
    expect(qk.post.detail(99)).toEqual(['post', 'detail', 99]);
  });

  test('comment.byPost includes postId', () => {
    expect(qk.comment.byPost(7)).toEqual(['comment', 'by-post', 7]);
    expect(qk.comment.byPost(7)).not.toEqual(qk.comment.byPost(8));
  });

  test('profile.me is static', () => {
    expect(qk.profile.me).toEqual(['profile', 'me']);
  });

  test('kategori.list is static', () => {
    expect(qk.kategori.list).toEqual(['kategori', 'list']);
  });

  test('approve namespace keys', () => {
    expect(qk.approve.all).toEqual(['approve']);
    expect(qk.approve.orangTua).toEqual(['approve', 'orangTua']);
    expect(qk.approve.anak).toEqual(['approve', 'anak']);
  });

  test('reminder namespace keys', () => {
    expect(qk.reminder.all).toEqual(['reminder']);
    expect(qk.reminder.list).toEqual(['reminder', 'list']);
  });

  test('orangTua namespace keys', () => {
    expect(qk.orangTua.all).toEqual(['orangTua']);
    expect(qk.orangTua.list).toEqual(['orangTua', 'list']);
  });
});
