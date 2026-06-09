import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/comment.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

interface Comment {
  comment_id?: number;
  id?: number;
  user_id: number;
  post_id: number;
  content: string;
  nama?: string;
  role?: string;
  time?: string;
}

interface CreateCommentPayload {
  user_id: number | undefined;
  post_id: number | string;
  content: string;
}

export function useCommentList(postId: number | string | undefined) {
  const { isAuthenticated } = useSession();
  return useQuery<Comment[]>({
    queryKey: qk.comment.byPost(postId),
    queryFn: async () => {
      const res = await commentApi.listByPost(postId);
      const list: Comment[] = res.data ?? [];
      return list.toSorted((a, b) =>
        (b.time ?? '').localeCompare(a.time ?? '')
      );
    },
    enabled: isAuthenticated && !!postId,
    staleTime: 30 * 1000,
  });
}

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
      qc.invalidateQueries({ queryKey: qk.post.all });
    },
  });
}
