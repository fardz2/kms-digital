import { api } from './client';

export const authApi = {
  login: (credentials) =>
    api.post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    }),
};
