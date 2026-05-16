import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../api/post.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function usePostList() {
  const { user, role, isAuthenticated } = useSession();
  const userId = user?.id;

  return useQuery({
    queryKey: qk.post.list(role, userId),
    queryFn: async () => {
      const res =
        role === 'ORANG_TUA'
          ? await postApi.listByOrangTua(userId)
          : await postApi.listByTenkes(userId);
      const list = res.data ?? [];
      return [...list].sort((a, b) =>
        (b.time ?? '').localeCompare(a.time ?? '')
      );
    },
    enabled: isAuthenticated && !!userId && !!role,
    staleTime: 60 * 1000,
  });
}

export function usePostDetail(id) {
  const { isAuthenticated } = useSession();
  return useQuery({
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
    mutationFn: (payload) => postApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.post.all }),
  });
}
