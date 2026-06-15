import { useQueries } from '@tanstack/react-query';
import { useAnakList } from './useAnakQueries';
import { pengukuranApi } from '../api/pengukuran.api';
import { useSession } from '../features/auth/useSession';
import { qk } from './keys';
import type { Pengukuran } from '../types';

export function usePengukuranBulananDesa() {
  const { role, isAuthenticated } = useSession();
  const {
    data: anakList,
    isLoading: anakLoading,
    isError: anakError,
    refetch: refetchAnak,
  } = useAnakList();

  const queries = useQueries({
    queries: (anakList ?? []).map((anak) => ({
      queryKey: qk.pengukuran.byAnak(anak.id, role),
      queryFn: async () => {
        const res = await pengukuranApi.list(anak.id, role);
        return res.data ?? [];
      },
      staleTime: 5 * 60 * 1000,
      enabled: isAuthenticated && !!role && !!anak.id,
      retry: false,
    })),
  });

  const isFetchingPengukuran = queries.some((q) => q.isLoading);
  const isError = anakError;

  const refetch = () => {
    refetchAnak();
    queries.forEach((q) => q.refetch());
  };

  const pengukuranByAnak: Record<number, Pengukuran[]> = {};
  (anakList ?? []).forEach((anak, idx) => {
    pengukuranByAnak[anak.id] = (queries[idx]?.data ?? []).toSorted((a, b) =>
      (a.date ?? '').localeCompare(b.date ?? '')
    );
  });

  return {
    anakList: anakList ?? [],
    pengukuranByAnak,
    isLoading: anakLoading || isFetchingPengukuran,
    isError,
    refetch,
  };
}
