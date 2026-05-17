import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials) => {
      const res = await authApi.login(credentials);
      return res.data;
    },
  });
}
