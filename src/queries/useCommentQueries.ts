// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '../api/comment.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useCommentList(postId) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.comment.byPost(postId),
    queryFn: async () => {
      const res = await commentApi.listByPost(postId);
      const list = res.data ?? [];
      return [...list].sort((a, b) =>
        (b.time ?? '').localeCompare(a.time ?? '')
      );
    },
    enabled: isAuthenticated && !!postId,
    staleTime: 30 * 1000,
  });
}

export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => commentApi.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: qk.comment.byPost(variables.post_id) });
    },
  });
}
