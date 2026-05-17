import {
  readSession,
  writeSession,
  clearSession,
} from '../../../features/auth/session-storage';

describe('session-storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validSession = {
    token: { value: 'abc123' },
    user: { id: 1, role: 'KADER_POSYANDU', name: 'Bu Siti' },
  };

  describe('readSession', () => {
    test('returns null when no session', () => {
      expect(readSession()).toBeNull();
    });

    test('reads session from kms_session_v1 key', () => {
      localStorage.setItem('kms_session_v1', JSON.stringify(validSession));
      expect(readSession()).toEqual(validSession);
    });

    test('returns null when session is missing token', () => {
      localStorage.setItem(
        'kms_session_v1',
        JSON.stringify({ user: { role: 'KADER_POSYANDU' } })
      );
      expect(readSession()).toBeNull();
    });

    test('returns null when session is missing role', () => {
      localStorage.setItem(
        'kms_session_v1',
        JSON.stringify({ token: { value: 'abc' }, user: {} })
      );
      expect(readSession()).toBeNull();
    });

    test('returns null when JSON is malformed', () => {
      localStorage.setItem('kms_session_v1', 'not-json');
      expect(readSession()).toBeNull();
    });

    test('migrates from legacy login_data key', () => {
      localStorage.setItem('login_data', JSON.stringify(validSession));
      const result = readSession();
      expect(result).toEqual(validSession);
      expect(localStorage.getItem('kms_session_v1')).toEqual(
        JSON.stringify(validSession)
      );
      expect(localStorage.getItem('login_data')).toBeNull();
    });

    test('does not migrate invalid legacy data', () => {
      localStorage.setItem('login_data', JSON.stringify({ token: null }));
      expect(readSession()).toBeNull();
      expect(localStorage.getItem('kms_session_v1')).toBeNull();
    });

    test('prefers kms_session_v1 over legacy when both exist', () => {
      const newer = { ...validSession, user: { ...validSession.user, name: 'Newer' } };
      localStorage.setItem('kms_session_v1', JSON.stringify(newer));
      localStorage.setItem('login_data', JSON.stringify(validSession));
      expect(readSession()).toEqual(newer);
      expect(localStorage.getItem('login_data')).toEqual(JSON.stringify(validSession));
    });
  });

  describe('writeSession', () => {
    test('writes session to kms_session_v1', () => {
      writeSession(validSession);
      expect(localStorage.getItem('kms_session_v1')).toEqual(
        JSON.stringify(validSession)
      );
    });

    test('overwrites existing session', () => {
      localStorage.setItem('kms_session_v1', JSON.stringify({ old: true }));
      writeSession(validSession);
      expect(readSession()).toEqual(validSession);
    });
  });

  describe('clearSession', () => {
    test('removes both kms_session_v1 and legacy login_data', () => {
      localStorage.setItem('kms_session_v1', JSON.stringify(validSession));
      localStorage.setItem('login_data', JSON.stringify(validSession));
      clearSession();
      expect(localStorage.getItem('kms_session_v1')).toBeNull();
      expect(localStorage.getItem('login_data')).toBeNull();
    });

    test('is safe to call when nothing is stored', () => {
      expect(() => clearSession()).not.toThrow();
    });
  });
});
