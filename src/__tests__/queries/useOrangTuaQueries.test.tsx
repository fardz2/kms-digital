import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useUpdateOrangTua,
  useDeleteOrangTua,
} from '../../queries/useOrangTuaQueries';
import { qk } from '../../queries/keys';

vi.mock('../../features/auth/useSession', () => ({
  useSession: () => ({ isAuthenticated: true }),
}));

vi.mock('../../api/approve.api', () => ({
  orangTuaApi: {
    list: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: {} })),
    update: vi.fn(() => Promise.resolve({ data: {} })),
    remove: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

import { orangTuaApi } from '../../api/approve.api';

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const spy = vi.spyOn(qc, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, wrapper, spy };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUpdateOrangTua (optimistic)', () => {
  test('patches the cached item and invalidates orangTua + approve', async () => {
    const { qc, wrapper, spy } = makeWrapper();
    qc.setQueryData(qk.orangTua.list, [
      { id: 1, nama: 'Lama', status: false },
      { id: 2, nama: 'Tetap' },
    ]);

    const { result } = renderHook(() => useUpdateOrangTua(), { wrapper });
    result.current.mutate({ id: 1, payload: { nama: 'Baru', status: true } });

    await waitFor(() => {
      const list = qc.getQueryData(qk.orangTua.list) as any[];
      expect(list.find((x) => x.id === 1)?.nama).toBe('Baru');
    });
    const list = qc.getQueryData(qk.orangTua.list) as any[];
    expect(list.find((x) => x.id === 1)?.status).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orangTuaApi.update).toHaveBeenCalledWith(1, {
      nama: 'Baru',
      status: true,
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.orangTua.all });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.approve.orangTua });
  });

  test('rolls back on error', async () => {
    (orangTuaApi.update as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    const { qc, wrapper } = makeWrapper();
    qc.setQueryData(qk.orangTua.list, [{ id: 1, nama: 'Lama' }]);

    const { result } = renderHook(() => useUpdateOrangTua(), { wrapper });
    result.current.mutate({ id: 1, payload: { nama: 'Baru' } });

    await waitFor(() => expect(result.current.isError).toBe(true));
    const list = qc.getQueryData(qk.orangTua.list) as any[];
    expect(list[0].nama).toBe('Lama');
  });
});

describe('useDeleteOrangTua (optimistic)', () => {
  test('removes the cached item and invalidates orangTua + approve', async () => {
    const { qc, wrapper, spy } = makeWrapper();
    qc.setQueryData(qk.orangTua.list, [{ id: 1 }, { id: 2 }]);

    const { result } = renderHook(() => useDeleteOrangTua(), { wrapper });
    result.current.mutate(1);

    await waitFor(() => {
      const list = qc.getQueryData(qk.orangTua.list) as any[];
      expect(list.find((x) => x.id === 1)).toBeUndefined();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orangTuaApi.remove).toHaveBeenCalledWith(1);
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.orangTua.all });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.approve.orangTua });
  });

  test('rolls back on error', async () => {
    (orangTuaApi.remove as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    const { qc, wrapper } = makeWrapper();
    qc.setQueryData(qk.orangTua.list, [{ id: 1 }, { id: 2 }]);

    const { result } = renderHook(() => useDeleteOrangTua(), { wrapper });
    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));
    const list = qc.getQueryData(qk.orangTua.list) as any[];
    expect(list).toHaveLength(2);
  });
});
