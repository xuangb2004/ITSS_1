import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'
import axios from 'axios' // Nhớ import axios

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
    const userData = localStorage.getItem('user')
    // Nếu bạn dùng Cookie (HttpOnly) thì không cần check 'token' ở localStorage
    // Nhưng nếu logic cũ cần thì giữ nguyên check
    
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
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
        message: error.response?.data?.message || 'Đăng ký thất bại',
      }
    }
  }

  const signin = async (formData) => {
    try {
      const response = await authService.signin(formData)
      // Lưu ý: Backend của bạn trả về object User hay {token, user}?
      // Code dưới đây giả định response trả về đúng format.
      // Nếu backend set cookie, bạn chỉ cần lưu user info.
      
      const data = response.data || response; // Xử lý tùy vào authService trả về gì
      
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
      
      return { success: true, message: "Đăng nhập thành công" }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data || 'Đăng nhập thất bại',
      }
    }
  }

  // --- THÊM HÀM NÀY ĐỂ FIX LỖI ---
  const loginWithGoogle = async (token) => {
    try {
      // Gọi trực tiếp API backend
      const res = await axios.post("http://localhost:8800/api/auth/google", { token });
      
      // Lưu thông tin user vào state và localStorage
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      
      // Nếu backend trả về token string (ngoài cookie), hãy lưu nó:
      // localStorage.setItem("token", res.data.token);

      return { success: true };
    } catch (error) {
      console.error("Google Auth Error:", error);
      return { 
        success: false, 
        message: error.response?.data || "Đăng nhập Google thất bại" 
      };
    }
  };
  // --------------------------------

  const signout = async () => {
    try {
        await axios.post("http://localhost:8800/api/auth/logout");
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    } catch (err) {
        console.log(err);
    }
  }

  const value = {
    user,
    loading,
    signup,
    signin,
    signout,
    loginWithGoogle, // <-- Nhớ export hàm này ra
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}