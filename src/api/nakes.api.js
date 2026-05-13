import { api } from './client';

export const nakesApi = {
  list: () => api.get('/api/posyandu/tenaga-kesehatan'),
};
