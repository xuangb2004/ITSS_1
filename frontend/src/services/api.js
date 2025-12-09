import axios from 'axios';

// Chúng ta trỏ về '/api' để có thể gọi được cả /auth, /forum, /courses...
const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm Token vào header mỗi khi gọi API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Service cho xác thực (Auth)
export const authService = {
  signup: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  signin: async (data) => {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },
};

// Service cho diễn đàn (Forum)
export const forumService = {
  getTopics: async () => {
    const response = await api.get('/forum/topics');
    return response.data;
  },
  getTopicDetails: async (topicId) => {
    const response = await api.get(`/forum/topic/${topicId}`);
    return response.data;
  },
  createTopic: async (formData) => {
    const response = await api.post('/forum/topic', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  reply: async (topicId, formData) => {
    const response = await api.post(`/forum/topic/${topicId}/reply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  toggleLike: async (postId) => {
    const response = await api.post(`/forum/post/${postId}/like`);
    return response.data;
  },
  deleteTopic: async (topicId) => {
    const response = await api.delete(`/forum/topic/${topicId}`);
    return response.data;
  },
  deletePost: async (postId) => {
    const response = await api.delete(`/forum/post/${postId}`);
    return response.data;
  }
};

// Service cho thông báo (Notification)
export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markRead: async (notifId) => {
    const response = await api.put(`/notifications/${notifId}/read`);
    return response.data;
  }
};

// Service cho Khóa học (Courses) - QUAN TRỌNG CHO TRANG HOME
export const courseService = {
  getRecommendedCourses: async (limit = 4) => {
    const response = await api.get(`/courses/recommended?limit=${limit}`);
    return response.data; 
  },
  getTrendingCourses: async (limit = 4) => {
    const response = await api.get(`/courses/trending?limit=${limit}`);
    return response.data;
  },
  searchCourses: async (query) => {
    // API search dùng param 'search' như đã sửa trong controller
    const response = await api.get(`/courses/search?search=${query}`);
    return response.data; 
  }
};

// Service cho Danh mục (Categories)
export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

export default api;