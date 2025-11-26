import axios from 'axios'

const API_URL = 'http://localhost:5001/api/auth'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Thêm token vào header nếu có
api.interceptors.request.use(
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

export const authService = {
  // Đăng ký
  signup: async (data) => {
    const response = await api.post('/signup', data)
    return response.data
  },

  // Đăng nhập
  signin: async (data) => {
    const response = await api.post('/signin', data)
    return response.data
  },
}

export default api
