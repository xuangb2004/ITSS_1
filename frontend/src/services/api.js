import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const response = await api.get(`/courses/search?search=${query}`);
    return response.data; 
  },
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  }
};

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

// --- MỚI THÊM ---
export const cartService = {
  addToCart: async (courseId) => {
    const response = await api.post('/cart', { courseId });
    return response.data;
  },
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  removeFromCart: async (courseId) => {
    const response = await api.delete(`/cart/${courseId}`);
    return response.data;
  }
};

export const enrollmentService = {
  enroll: async (courseId) => {
    const response = await api.post('/enrollments', { courseId });
    return response.data;
  },
  getMyCourses: async () => {
    const response = await api.get('/enrollments');
    return response.data;
  }
};
export const userService = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  updateProfile: async (formData) => {
    // Lưu ý: Vì có upload file nên content-type sẽ tự động được set bởi axios khi gửi FormData
    const response = await api.put('/user/profile', formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
};
export default api;