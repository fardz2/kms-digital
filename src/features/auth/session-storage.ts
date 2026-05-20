import type { Session } from '../../types';

const STORAGE_KEY = 'kms_session_v1';
const LEGACY_KEY = 'login_data';
export const SESSION_CHANGE_EVENT = 'kms_session_v1:change';

function emitSessionChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
}

export function readSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Session;
      if (parsed?.token?.value && parsed?.user?.role) return parsed;
      return null;
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as Session;
      if (parsed?.token?.value && parsed?.user?.role) {
        localStorage.setItem(STORAGE_KEY, legacy);
        localStorage.removeItem(LEGACY_KEY);
        return parsed;
      }
    }
    return null;
  } catch (e) {
    console.error('readSession parse error:', e);
    return null;
  }
}

export function writeSession(data: Session): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    emitSessionChange();
  } catch (e) {
    console.error('writeSession error:', e);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_KEY);
    emitSessionChange();
  } catch (e) {
    console.error('clearSession error:', e);
  }
}
