import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra token trong localStorage khi app khởi động
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const signup = async (formData) => {
    try {
      const response = await authService.signup(formData)
      return { success: true, message: response.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登録に失敗しました',
      }
    }
  }

  const signin = async (formData) => {
    try {
      const response = await authService.signin(formData)
      const { token, user } = response
      
      // Lưu token và user vào localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      setUser(user)
      return { success: true, message: response.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'ログインに失敗しました',
      }
    }
  }

  const signout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    signup,
    signin,
    signout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
