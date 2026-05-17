import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';
import { qk } from './keys';
import { useSession } from '../features/auth/useSession';

export function useProfile(enabled = true) {
  const { isAuthenticated, role } = useSession();
  return useQuery({
    queryKey: qk.profile.me,
    queryFn: async () => {
      const res = await profileApi.get();
      return res.data ?? null;
    },
    enabled: enabled && isAuthenticated && role !== 'ADMIN',
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => profileApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.profile.all }),
  });
}
