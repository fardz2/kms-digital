import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { readSession, writeSession, clearSession } from './session-storage';

const STORAGE_KEY = 'kms_session_v1';

export function useSession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(() => readSession());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      setSession(readSession());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback((data) => {
    writeSession(data);
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
    setSession(null);
  }, [queryClient]);

  return {
    session,
    login,
    logout,
    isAuthenticated: !!session?.token?.value,
    role: session?.user?.role ?? null,
    user: session?.user ?? null,
  };
}
