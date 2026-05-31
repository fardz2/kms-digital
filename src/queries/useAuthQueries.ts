import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';

interface LoginCredentials {
  login: string;
  password: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await authApi.login(credentials);
      return res.data;
    },
  });
}
