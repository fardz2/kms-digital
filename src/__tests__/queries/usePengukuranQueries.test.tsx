import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import {
  useCreatePengukuran,
  useUpdatePengukuran,
  useDeletePengukuran,
} from '../../queries/usePengukuranQueries';
import { qk } from '../../queries/keys';

vi.mock('../../features/auth/useSession', () => ({
  useSession: () => ({ role: 'KADER_POSYANDU', isAuthenticated: true }),
}));

vi.mock('../../api/pengukuran.api', () => ({
  pengukuranApi: {
    create: vi.fn(() => Promise.resolve({ data: { id: 99 } })),
    update: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
    remove: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

import { pengukuranApi } from '../../api/pengukuran.api';

const ANAK_ID = 7;

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const spy = vi.spyOn(qc, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { wrapper, spy };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreatePengukuran', () => {
  test('calls api.create with role and invalidates byAnak + laporan', async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useCreatePengukuran(ANAK_ID), { wrapper });

    const payload = {
      id_anak: ANAK_ID,
      date: '2026-05-01',
      berat: 9,
      tinggi: 75,
      lingkar_kepala: 46,
    };
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pengukuranApi.create).toHaveBeenCalledWith(payload, 'KADER_POSYANDU');
    expect(spy).toHaveBeenCalledWith({
      queryKey: qk.pengukuran.byAnak(ANAK_ID, 'KADER_POSYANDU'),
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.laporan.all });
  });

  test('surfaces error on failure', async () => {
    (pengukuranApi.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCreatePengukuran(ANAK_ID), { wrapper });
    result.current.mutate({
      id_anak: ANAK_ID,
      date: '2026-05-01',
      berat: 9,
      tinggi: 75,
      lingkar_kepala: 46,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useUpdatePengukuran', () => {
  test('calls api.update and invalidates byAnak + laporan', async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useUpdatePengukuran(ANAK_ID), { wrapper });

    result.current.mutate({ id: 1, payload: { berat: 10 } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pengukuranApi.update).toHaveBeenCalledWith(1, { berat: 10 });
    expect(spy).toHaveBeenCalledWith({
      queryKey: qk.pengukuran.byAnak(ANAK_ID, 'KADER_POSYANDU'),
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.laporan.all });
  });

  test('optimistically patches the cached measurement', async () => {
    const { wrapper } = makeWrapper();
    const { result, rerender } = renderHook(
      () => {
        const qc = useQueryClient();
        return { qc, mutation: useUpdatePengukuran(ANAK_ID) };
      },
      { wrapper },
    );
    const key = qk.pengukuran.byAnak(ANAK_ID, 'KADER_POSYANDU');
    result.current.qc.setQueryData(key, [
      { id: 1, berat: 8 },
      { id: 2, berat: 9 },
    ]);
    rerender();

    result.current.mutation.mutate({ id: 1, payload: { berat: 12 } });

    await waitFor(() => {
      const list = result.current.qc.getQueryData(key) as any[];
      expect(list.find((x) => x.id === 1)?.berat).toBe(12);
    });
  });
});

describe('useDeletePengukuran', () => {
  test('calls api.remove and invalidates byAnak + laporan', async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useDeletePengukuran(ANAK_ID), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pengukuranApi.remove).toHaveBeenCalledWith(1);
    expect(spy).toHaveBeenCalledWith({
      queryKey: qk.pengukuran.byAnak(ANAK_ID, 'KADER_POSYANDU'),
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.laporan.all });
  });

  test('optimistically removes the cached measurement and rolls back on error', async () => {
    (pengukuranApi.remove as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    const { wrapper } = makeWrapper();
    const { result, rerender } = renderHook(
      () => {
        const qc = useQueryClient();
        return { qc, mutation: useDeletePengukuran(ANAK_ID) };
      },
      { wrapper },
    );
    const key = qk.pengukuran.byAnak(ANAK_ID, 'KADER_POSYANDU');
    result.current.qc.setQueryData(key, [{ id: 1 }, { id: 2 }]);
    rerender();

    result.current.mutation.mutate(1);

    await waitFor(() => expect(result.current.mutation.isError).toBe(true));
    const list = result.current.qc.getQueryData(key) as any[];
    expect(list).toHaveLength(2);
  });
});
