import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { readSession, writeSession, clearSession } from './session-storage';

export function useSession() {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(() => readSession());

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
