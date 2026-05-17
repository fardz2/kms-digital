import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAnakList } from './useAnakQueries';
import { pengukuranApi } from '../api/pengukuran.api';
import { useSession } from '../features/auth/useSession';
import { qk } from './keys';

export function usePengukuranBulananKader() {
  const { role, isAuthenticated } = useSession();
  const { data: anakList, isLoading: anakLoading } = useAnakList();

  const queries = useQueries({
    queries: (anakList ?? []).map((anak) => ({
      queryKey: qk.pengukuran.byAnak(anak.id, role),
      queryFn: async () => {
        const res = await pengukuranApi.list(anak.id, role);
        return res.data ?? [];
      },
      staleTime: 5 * 60 * 1000,
      enabled: isAuthenticated && !!role && !!anak.id,
    })),
  });

  const isFetchingPengukuran = queries.some((q) => q.isLoading);

  const pengukuranByAnak = useMemo(() => {
    const map = {};
    (anakList ?? []).forEach((anak, idx) => {
      map[anak.id] = queries[idx]?.data ?? [];
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anakList, queries.map((q) => q.dataUpdatedAt).join(',')]);

  return {
    anakList: anakList ?? [],
    pengukuranByAnak,
    isLoading: anakLoading || isFetchingPengukuran,
  };
}
