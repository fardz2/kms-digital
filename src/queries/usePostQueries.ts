import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../api/post.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

interface Post {
  post_id: number;
  title: string;
  content?: string;
  nama?: string;
  posyandu?: string;
  role?: string;
  time?: string;
  user_id?: number;
  id_user?: number;
  jawaban_tenaga_kesehatan?: any[];
}

interface CreatePostPayload {
  user_id: number | undefined;
  title: string;
  content: string;
}

export function usePostList() {
  const { user, role, isAuthenticated } = useSession();
  const userId = user?.id;

  return useQuery<Post[]>({
    queryKey: qk.post.list(role, userId),
    queryFn: async () => {
      const res =
        role === 'ORANG_TUA'
          ? await postApi.listByOrangTua(userId)
          : await postApi.listByTenkes(userId);
      const list: Post[] = res.data ?? [];
      return [...list].sort((a, b) =>
        (b.time ?? '').localeCompare(a.time ?? '')
      );
    },
    enabled: isAuthenticated && !!userId && !!role,
    staleTime: 60 * 1000,
  });
}

export function usePostDetail(id: number | string | undefined) {
  const { isAuthenticated } = useSession();
  return useQuery<Post | null>({
    queryKey: qk.post.detail(id),
    queryFn: async () => {
      const res = await postApi.detail(id);
      return res.data;
    },
    enabled: isAuthenticated && !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.post.all }),
  });
}
