import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, beforeEach } from 'vitest';
import { useSession } from '../../../features/auth/useSession';
import { clearSession, writeSession } from '../../../features/auth/session-storage';

const validSession = {
  token: { value: 'abc123' },
  user: { id: 1, role: 'KADER_POSYANDU' as const, name: 'Bu Siti' },
};

function createWrapper() {
  const queryClient = new QueryClient();

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('reacts to same-tab clearSession changes', () => {
    writeSession(validSession);

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBe('KADER_POSYANDU');

    act(() => {
      clearSession();
    });

    expect(result.current.role).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test('reacts to same-tab writeSession changes', () => {
    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    expect(result.current.role).toBeNull();

    act(() => {
      writeSession(validSession);
    });

    expect(result.current.role).toBe('KADER_POSYANDU');
    expect(result.current.isAuthenticated).toBe(true);
  });
});
