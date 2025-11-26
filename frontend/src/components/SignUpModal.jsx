import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SignUpModal({ onClose, onSwitchToSignIn }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('すべての情報を入力してください')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上である必要があります')
      setLoading(false)
      return
    }

    const result = await signup(formData)

    if (result.success) {
      alert(result.message)
      onClose()
      // Chuyển sang form đăng nhập
      onSwitchToSignIn()
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-logo">
            <i className="fa-solid fa-cloud"></i>
            <span>MyCourse.io</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="modal-intro">
          <p>私たちに参加して、もっと多くの特典を手に入れましょう。</p>
          <p>あなたのデータは安全に保護します。</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group-icon">
            <label htmlFor="name">お名前（任意）</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="お名前を入力"
              />
              <i className="fa-regular fa-user input-icon"></i>
            </div>
          </div>

          <div className="form-group-icon">
            <label htmlFor="email">メールアドレス *</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="メールアドレスを入力"
                required
              />
              <i className="fa-regular fa-envelope input-icon"></i>
            </div>
          </div>

          <div className="form-group-icon">
            <label htmlFor="password">パスワード *</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="パスワードを入力"
                required
              />
              <i className="fa-solid fa-lock input-icon"></i>
            </div>
          </div>

          <div className="form-group-icon">
            <label htmlFor="confirmPassword">パスワード確認 *</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="パスワードを再入力"
                required
              />
              <i className="fa-solid fa-lock input-icon"></i>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login-primary" disabled={loading}>
            {loading ? '処理中...' : '新規登録'}
          </button>
        </form>

        <p className="auth-link-bottom">
          アカウントをお持ちですか？{' '}
          <span className="link-button" onClick={onSwitchToSignIn}>
            ログイン
          </span>
        </p>
      </div>
    </div>
  )
}

export default SignUpModal

