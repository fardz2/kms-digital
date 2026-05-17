import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kategoriApi } from '../api/kategori.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useKategoriList(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.kategori.list,
    queryFn: async () => {
      const res = await kategoriApi.list();
      return res.data ?? [];
    },
    enabled: enabled && isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateKategori() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => kategoriApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.kategori.all }),
  });
}
