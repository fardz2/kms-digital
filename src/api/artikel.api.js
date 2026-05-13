import { api } from './client';

export const artikelApi = {
  list: () => api.get('/api/artikel'),
  detail: (id) => api.get(`/api/artikel/${id}`),
  remove: (id) => api.delete(`/api/artikel/${id}`),
};
