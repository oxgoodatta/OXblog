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

// Add Search API functions
export const searchAPI = {
  // Unified search (users + posts)
  searchAll: (query, type = 'all', page = 1, per_page = 10) => 
    api.get(`/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}&per_page=${per_page}`),
  
  // Search only users
  searchUsers: (query, page = 1, per_page = 10) => 
    api.get(`/search/users?q=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`),
  
  // Search only posts
  searchPosts: (query, page = 1, per_page = 10) => 
    api.get(`/search/posts?q=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`),
};

// Add Follow API functions
export const followAPI = {
  // Follow a user
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  
  // Unfollow a user
  unfollowUser: (userId) => api.post(`/users/${userId}/unfollow`),
  
  // Get follow status and counts
  getFollowStatus: (userId) => api.get(`/users/${userId}/follow-status`),
  
  // Get user's followers list
  getFollowers: (userId, page = 1) => api.get(`/users/${userId}/followers?page=${page}`),
  
  // Get who user is following
  getFollowing: (userId, page = 1) => api.get(`/users/${userId}/following?page=${page}`),
};

// Add User API functions (includes updated profile with follow counts)
export const usersAPI = {
  getUserProfile: (username) => api.get(`/users/${username}`),
};

export default api;