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
    mutationFn: (payload: CreateCommentPayload) => commentApi.create(payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: qk.comment.byPost(variables.post_id) });
    },
  });
}
