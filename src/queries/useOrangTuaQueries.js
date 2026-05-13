import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orangTuaApi } from '../api/approve.api';
import { useSession } from '../features/auth/useSession';

const OT_LIST_KEY = ['orangTua', 'list'];

export function useOrangTuaList(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: OT_LIST_KEY,
    queryFn: async () => {
      const res = await orangTuaApi.list();
      return res.data ?? [];
    },
    enabled: enabled && isAuthenticated,
    staleTime: 30 * 1000,
  });
}

export function useCreateOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => orangTuaApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OT_LIST_KEY });
      qc.invalidateQueries({ queryKey: ['approve', 'orangTua'] });
    },
  });
}

export function useUpdateOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => orangTuaApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OT_LIST_KEY });
    },
  });
}

export function useDeleteOrangTua() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => orangTuaApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OT_LIST_KEY });
    },
  });
}
