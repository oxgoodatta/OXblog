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
  createPost: (content, mediaFiles = []) => {
    if (mediaFiles.length > 0) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('content', content);
      mediaFiles.forEach(file => {
        formData.append('media', file);
      });
      
      return api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Regular JSON request for text-only posts
      return api.post('/posts', { content });
    }
  },
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