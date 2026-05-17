import { useCallback, useEffect, useState } from 'react';
import type { Role } from '../../types';

const TOUR_FLAG_PREFIX = 'kms_tour_completed_';

function flagKey(role: Role | null): string | null {
  if (!role) return null;
  return `${TOUR_FLAG_PREFIX}${role}`;
}

function isCompleted(role: Role | null): boolean {
  if (typeof window === 'undefined') return true;
  const key = flagKey(role);
  if (!key) return true;
  return window.localStorage.getItem(key) === '1';
}

function markCompleted(role: Role | null): void {
  if (typeof window === 'undefined') return;
  const key = flagKey(role);
  if (!key) return;
  window.localStorage.setItem(key, '1');
}

function clearFlag(role: Role | null): void {
  if (typeof window === 'undefined') return;
  const key = flagKey(role);
  if (!key) return;
  window.localStorage.removeItem(key);
}

/**
 * useTour — kontrol open/close + flag completed per role.
 *
 * Auto-trigger pertama kali user dengan role tertentu akses page yang call hook ini.
 * Setelah complete/close, flag tersimpan di localStorage agar tidak muncul lagi.
 *
 * Pakai `replay()` untuk memunculkan tour kembali (mis. via tombol "Bantuan").
 */
export function useTour(role: Role | null, autoStart = true) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoStart || !role) return;
    if (isCompleted(role)) return;
    // Delay slight supaya ref target tersedia di DOM
    const timer = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(timer);
  }, [role, autoStart]);

  const close = useCallback(() => {
    setOpen(false);
    markCompleted(role);
  }, [role]);

  const replay = useCallback(() => {
    clearFlag(role);
    setOpen(true);
  }, [role]);

  return { open, close, replay };
}
