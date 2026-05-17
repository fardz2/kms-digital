import { useQuery } from '@tanstack/react-query';
import { laporanApi } from '../api/laporan.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useStatistikGiziDesa(idDesa) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: qk.laporan.desa(idDesa, 'all'),
    queryFn: async () => {
      const res = await laporanApi.statistikGizi(idDesa);
      return res.data ?? [];
    },
    enabled: isAuthenticated && !!idDesa,
    staleTime: 5 * 60 * 1000,
  });
}
