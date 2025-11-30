import axios from 'axios'

const BASE_URL = 'http://localhost:5001/api'

// Tạo instance axios chung
const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Thêm token vào header nếu có
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  return instance
}

// API instances
const authApi = createApiInstance(`${BASE_URL}/auth`)
const coursesApi = createApiInstance(`${BASE_URL}/courses`)
const categoriesApi = createApiInstance(`${BASE_URL}/categories`)

// Auth Service
export const authService = {
  // Đăng ký
  signup: async (data) => {
    const response = await authApi.post('/signup', data)
    return response.data
  },

  // Đăng nhập
  signin: async (data) => {
    const response = await authApi.post('/signin', data)
    return response.data
  },
}

// Course Service
export const courseService = {
  // Lấy tất cả khóa học
  getAllCourses: async (params = {}) => {
    const response = await coursesApi.get('/', { params })
    return response.data
  },

  // Lấy khóa học được đề xuất
  getRecommendedCourses: async (limit = 4) => {
    const response = await coursesApi.get('/recommended', { params: { limit } })
    return response.data
  },

  // Lấy khóa học trending
  getTrendingCourses: async (limit = 4) => {
    const response = await coursesApi.get('/trending', { params: { limit } })
    return response.data
  },

  // Tìm kiếm khóa học
  searchCourses: async (query, params = {}) => {
    const response = await coursesApi.get('/search', { 
      params: { q: query, ...params } 
    })
    return response.data
  },

  // Lấy chi tiết khóa học
  getCourseById: async (id) => {
    const response = await coursesApi.get(`/${id}`)
    return response.data
  },
}

// Category Service
export const categoryService = {
  // Lấy tất cả danh mục
  getAllCategories: async () => {
    const response = await categoriesApi.get('/')
    return response.data
  },

  // Lấy danh mục theo slug
  getCategoryBySlug: async (slug) => {
    const response = await categoriesApi.get(`/${slug}`)
    return response.data
  },
}

export default authApi
