import { api } from './client';

export const approveApi = {
  listOrangTua: () =>
    api.get(`/api/posyandu/orang-tua/list?_=${Date.now()}`),

  listAnakBelumApprove: () => api.get('/api/posyandu/belum-approve'),

  approveOrangTua: (id) =>
    api.put(`/api/auth/users/${id}`, { status: 1 }),

  approveAnak: (id) =>
    api.put(`/api/posyandu/belum-approve/${id}/approve`),

  rejectOrangTua: (id) => api.delete(`/api/auth/users/${id}`),

  rejectAnak: (id) => api.delete(`/api/posyandu/data-anak/${id}`),
};

export const orangTuaApi = {
  list: () => api.get(`/api/posyandu/orang-tua/list?_=${Date.now()}`),
  create: (payload) => api.post('/api/auth/orang-tua/register', payload),
  update: (id, payload) => api.put(`/api/auth/users/${id}`, payload),
  remove: (id) => api.delete(`/api/auth/users/${id}`),
};
