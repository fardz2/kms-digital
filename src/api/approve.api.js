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
