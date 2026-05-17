import { api } from './client';

export const postApi = {
  listByOrangTua: (id) => api.get(`/api/post/orang-tua/${id}`),
  listByTenkes: (id) => api.get(`/api/post/tenaga-kesehatan/${id}`),
  detail: (id) => api.get(`/api/post/${id}`),
  create: (payload) => api.post('/api/post', payload),
};
