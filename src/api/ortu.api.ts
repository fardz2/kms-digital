import { api } from './client';

export const ortuApi = {
  list: () => api.get(`/api/posyandu/orang-tua/list?_=${Date.now()}`),
  forKader: () => api.get('/api/posyandu/orang-tua'),
  register: (payload) => api.post('/api/auth/orang-tua/register', payload),
};
