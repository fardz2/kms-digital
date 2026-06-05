import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  readSession,
  writeSession,
  clearSession,
  SESSION_CHANGE_EVENT,
} from './session-storage';

const STORAGE_KEY = 'kms_session_v1';

export function useSession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(() => readSession());

  useEffect(() => {
    const syncSession = () => {
      setSession(readSession());
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      syncSession();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(SESSION_CHANGE_EVENT, syncSession);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(SESSION_CHANGE_EVENT, syncSession);
    };
  }, []);

  const login = (data) => {
    writeSession(data);
    setSession(data);
  };

  const logout = () => {
    clearSession();
    queryClient.clear();
    setSession(null);
  };

  return {
    session,
    login,
    logout,
    isAuthenticated: !!session?.token?.value,
    role: session?.user?.role ?? null,
    user: session?.user ?? null,
  };
}
