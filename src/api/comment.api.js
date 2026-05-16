import { api } from './client';

export const commentApi = {
  listByPost: (postId) => api.get(`/api/comment/${postId}`),
  create: (payload) => api.post('/api/comment', payload),
};
