import { describe, expect, test, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateComment } from '../../queries/useCommentQueries';
import { qk } from '../../queries/keys';

vi.mock('../../features/auth/useSession', () => ({
  useSession: () => ({
    isAuthenticated: true,
    user: { id: 5, name: 'Bu Ani', role: 'ORANG_TUA' },
  }),
}));

vi.mock('../../api/comment.api', () => ({
  commentApi: {
    create: vi.fn(() => Promise.resolve({ data: { comment_id: 1 } })),
    listByPost: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

import { commentApi } from '../../api/comment.api';

const POST_ID = 42;

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, wrapper };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreateComment (optimistic)', () => {
  test('inserts an optimistic comment at the top of the cached list', async () => {
    const { qc, wrapper } = makeWrapper();
    qc.setQueryData(qk.comment.byPost(POST_ID), [
      { comment_id: 99, content: 'lama', time: '2026-01-01T00:00:00Z' },
    ]);

    const { result } = renderHook(() => useCreateComment(), { wrapper });
    result.current.mutate({ user_id: 5, post_id: POST_ID, content: 'halo' });

    await waitFor(() => {
      const list = qc.getQueryData(qk.comment.byPost(POST_ID)) as any[];
      expect(list[0].content).toBe('halo');
    });
    const list = qc.getQueryData(qk.comment.byPost(POST_ID)) as any[];
    expect(list[0].nama).toBe('Bu Ani');
    expect(commentApi.create).toHaveBeenCalledWith({
      user_id: 5,
      post_id: POST_ID,
      content: 'halo',
    });
  });

  test('rolls back on error', async () => {
    (commentApi.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom'),
    );
    const { qc, wrapper } = makeWrapper();
    const seed = [{ comment_id: 99, content: 'lama', time: '2026-01-01T00:00:00Z' }];
    qc.setQueryData(qk.comment.byPost(POST_ID), seed);

    const { result } = renderHook(() => useCreateComment(), { wrapper });
    result.current.mutate({ user_id: 5, post_id: POST_ID, content: 'gagal' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    const list = qc.getQueryData(qk.comment.byPost(POST_ID)) as any[];
    expect(list).toHaveLength(1);
    expect(list[0].content).toBe('lama');
  });
});
