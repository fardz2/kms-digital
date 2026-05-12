import { useQuery } from '@tanstack/react-query';
import { artikelApi } from '../api/artikel.api';
import { qk } from './keys';

export function useArtikelList() {
  return useQuery({
    queryKey: qk.artikel.list,
    queryFn: async () => {
      const res = await artikelApi.list();
      return res.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useArtikelDetail(id) {
  return useQuery({
    queryKey: qk.artikel.detail(id),
    queryFn: async () => {
      const res = await artikelApi.detail(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}
