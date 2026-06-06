# Optimistic Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimistic update untuk komentar forum (useCreateComment) dan approve/reject (4 hook), agar UI terasa instan dengan rollback bila gagal.

**Architecture:** Pola TanStack Query v5: onMutate (cancel + snapshot + setQueryData) -> onError (rollback) -> onSettled (invalidate). Toast tetap di komponen.

**Tech Stack:** React 19, TanStack Query v5, Vitest, Testing Library.

---

## File Structure

- Modify: `src/queries/useCommentQueries.ts` (optimistic create comment)
- Modify: `src/queries/useApproveQueries.ts` (optimistic approve/reject)
- Test: `src/__tests__/queries/useCommentQueries.test.tsx`
- Test: `src/__tests__/queries/useApproveQueries.test.tsx`

Reference shapes:
- `useSession()` returns `{ user, role, isAuthenticated, ... }`; `user` has `{ id, role, name }`.
- `qk.comment.byPost(postId)` = ['comment','by-post',postId]; list sorted newest-first.
- `qk.approve.orangTua` = ['approve','orangTua']; `qk.approve.anak` = ['approve','anak']; items have `.id`.
- `qk.anak.all` = ['anak'].

---

## Task 1: Optimistic create comment

**Files:**
- Modify: `src/queries/useCommentQueries.ts`
- Test: `src/__tests__/queries/useCommentQueries.test.tsx`

Current `useCreateComment`:
```ts
export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => commentApi.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: qk.comment.byPost(variables.post_id) });
    },
  });
}
```

- [ ] **Step 1: Write the test**

Create `src/__tests__/queries/useCommentQueries.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, test, vi, beforeEach } from 'vitest';
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/queries/useCommentQueries.test.tsx`
Expected: FAIL — the optimistic insert test fails because the current hook only invalidates (does not insert into cache synchronously).

- [ ] **Step 3: Implement optimistic create**

In `src/queries/useCommentQueries.ts`:
1. Add import: `import { useSession } from '../features/auth/useSession';` (already imported — confirm; it is used by useCommentList).
2. Replace `useCreateComment` with:

```ts
export function useCreateComment() {
  const qc = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => commentApi.create(payload),
    onMutate: async (payload: CreateCommentPayload) => {
      const key = qk.comment.byPost(payload.post_id);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Comment[]>(key);
      const optimistic: Comment = {
        comment_id: `temp-${Date.now()}` as unknown as number,
        user_id: payload.user_id as number,
        post_id: payload.post_id as number,
        content: payload.content,
        nama: user?.name,
        role: user?.role,
        time: new Date().toISOString(),
      };
      qc.setQueryData<Comment[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous, key };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(ctx.key, ctx.previous);
      }
    },
    onSettled: (_data, _err, payload) => {
      qc.invalidateQueries({ queryKey: qk.comment.byPost(payload.post_id) });
    },
  });
}
```

Note: the existing `Comment` interface already allows these fields (comment_id, user_id, post_id, content, nama, role, time). The `as unknown as number` cast on the temp id keeps the type happy without changing the interface.

- [ ] **Step 4: Run test to verify it passes**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/queries/useCommentQueries.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```
git add src/queries/useCommentQueries.ts src/__tests__/queries/useCommentQueries.test.tsx
git commit -m "feat(comment): optimistic update on create"
```

---

## Task 2: Optimistic approve/reject

**Files:**
- Modify: `src/queries/useApproveQueries.ts`
- Test: `src/__tests__/queries/useApproveQueries.test.tsx`

All four mutations remove an item (by id) from a pending list. We add a shared optimistic-remove helper inside the file.

- [ ] **Step 1: Write the test**

Create `src/__tests__/queries/useApproveQueries.test.tsx`:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, test, vi, beforeEach } from 'vitest';
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
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, wrapper };
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/queries/useApproveQueries.test.tsx`
Expected: FAIL — current hooks only invalidate (no synchronous optimistic removal).

- [ ] **Step 3: Implement optimistic removal**

In `src/queries/useApproveQueries.ts`, add a helper near the top (after imports):

```ts
function optimisticRemove(qc, listKey, id, extraInvalidate) {
  return {
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: listKey });
      const previous = qc.getQueryData(listKey);
      qc.setQueryData(listKey, (old) =>
        Array.isArray(old) ? old.filter((x) => x.id !== id) : old
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(listKey, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listKey });
      if (extraInvalidate) qc.invalidateQueries({ queryKey: extraInvalidate });
    },
  };
}
```

Then rewrite the four hooks to use it. Important: `id` is the mutate variable, so build the options inside the mutationFn closure via the mutation's variables. Since the helper needs `id`, implement each hook by passing the id through onMutate using the mutation variable. Use this pattern per hook:

```ts
export function useApproveOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => approveApi.approveOrangTua(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.approve.orangTua });
      const previous = qc.getQueryData(qk.approve.orangTua);
      qc.setQueryData(qk.approve.orangTua, (old) =>
        Array.isArray(old) ? old.filter((x) => x.id !== id) : old
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(qk.approve.orangTua, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.approve.orangTua });
      qc.invalidateQueries({ queryKey: qk.anak.all });
    },
  });
}
```

Apply the same pattern to:
- `useRejectOrangTua`: list key `qk.approve.orangTua`, NO extra invalidate (matches current behavior which only invalidates orangTua).
- `useApproveAnak`: list key `qk.approve.anak`, extra invalidate `qk.anak.all`.
- `useRejectAnak`: list key `qk.approve.anak`, extra invalidate `qk.anak.all`.

(The standalone `optimisticRemove` helper above is optional; if it complicates typing, inline the pattern per-hook as shown. Either is fine — prefer whichever is cleaner. Do NOT change the queryKeys or which extra keys are invalidated vs current behavior.)

- [ ] **Step 4: Run test to verify it passes**

Run: `& "C:\Program Files\nodejs\node.exe" node_modules\vitest\vitest.mjs run src/__tests__/queries/useApproveQueries.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify full suite + lint + build**

Run: `npm run lint` — 0 errors.
Run: `npm test` — all green.
Run: `npm run build` — success.

- [ ] **Step 6: Commit**

```
git add src/queries/useApproveQueries.ts src/__tests__/queries/useApproveQueries.test.tsx
git commit -m "feat(approve): optimistic remove on approve/reject"
```

---

## Final Verification

- [ ] `npm run lint` — 0 errors (1 pre-existing warning OK)
- [ ] `npm test` — all green (added: comment 2, approve 2)
- [ ] `npm run build` — success

## Catatan
- onSettled tetap invalidate, jadi data server selalu jadi sumber kebenaran final.
- Tidak mengubah queryKey atau daftar key yang di-invalidate dibanding perilaku sekarang.
- YAGNI: mutation lain tidak disentuh.
