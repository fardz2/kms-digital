import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useSession } from '../features/auth/useSession';

export function useLogin() {
  const { login } = useSession();

  return useMutation({
    mutationFn: async (credentials) => {
      const res = await authApi.login(credentials);
      return res.data;
    },
    onSuccess: (data) => {
      login(data);
    },
  });
}
