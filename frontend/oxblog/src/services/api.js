import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

export const postsAPI = {
  getPosts: (page = 1) => api.get(`/posts?page=${page}&per_page=10`),
  createPost: (content) => api.post('/posts', { content }),
  deletePost: (id) => api.delete(`/posts/${id}`),
};

export const commentsAPI = {
  getComments: (postId) => api.get(`/posts/${postId}/comments?include_replies=true`),
  createComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export const likesAPI = {
  likePost: (postId) => api.post(`/posts/${postId}/like`),
};

export default api;