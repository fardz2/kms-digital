import { api } from './client';

export const kategoriApi = {
  list: () => api.get('/api/kategori'),
  create: (payload) => api.post('/api/kategori', payload),
};
