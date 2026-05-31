import { api } from './client';

export const authApi = {
  login: (credentials) =>
    api.post('/api/auth/login', {
      login: credentials.login,
      password: credentials.password,
    }),
};
