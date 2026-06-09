import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useApproveOrangTua,
  useRejectAnak,
} from '../../queries/useApproveQueries';
import { qk } from '../../queries/keys';

vi.mock('../../features/auth/useSession', () => ({
  useSession: () => ({ isAuthenticated: true }),
}));

vi.mock('../../api/approve.api', () => ({
  approveApi: {
    approveOrangTua: vi.fn(() => Promise.resolve({ data: {} })),
    rejectOrangTua: vi.fn(() => Promise.resolve({ data: {} })),
    approveAnak: vi.fn(() => Promise.resolve({ data: {} })),
    rejectAnak: vi.fn(() => Promise.resolve({ data: {} })),
    listOrangTua: vi.fn(() => Promise.resolve({ data: [] })),
    listAnakBelumApprove: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

import { approveApi } from '../../api/approve.api';

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

describe('useApproveOrangTua (optimistic)', () => {
  test('removes the approved item from the pending list', async () => {
    const { qc, wrapper } = makeWrapper();
    qc.setQueryData(qk.approve.orangTua, [{ id: 1 }, { id: 2 }]);

    const { result } = renderHook(() => useApproveOrangTua(), { wrapper });
    result.current.mutate(1);

    await waitFor(() => {
      const list = qc.getQueryData(qk.approve.orangTua) as any[];
      expect(list.find((x) => x.id === 1)).toBeUndefined();
    });
    expect(approveApi.approveOrangTua).toHaveBeenCalledWith(1);
  });

  test('refreshes the admin orangTua list after approval', async () => {
    const { wrapper, spy } = makeWrapper();
    const { result } = renderHook(() => useApproveOrangTua(), { wrapper });
    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledWith({ queryKey: qk.orangTua.all });
  });
});

describe('useRejectAnak (optimistic)', () => {
  test('rolls back on error', async () => {
    (approveApi.rejectAnak as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    const { qc, wrapper } = makeWrapper();
    qc.setQueryData(qk.approve.anak, [{ id: 7 }, { id: 8 }]);

    const { result } = renderHook(() => useRejectAnak(), { wrapper });
    result.current.mutate(7);

    await waitFor(() => expect(result.current.isError).toBe(true));
    const list = qc.getQueryData(qk.approve.anak) as any[];
    expect(list).toHaveLength(2);
  });
});
