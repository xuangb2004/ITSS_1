import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function SignInModal({ onClose, onSwitchToSignUp }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signin } = useAuth()
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
    if (!formData.email || !formData.password) {
      setError('すべての情報を入力してください')
      setLoading(false)
      return
    }

    const result = await signin(formData)

    if (result.success) {
      onClose()
      navigate('/dashboard')
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
            <label htmlFor="email">メールアドレス</label>
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
            <label htmlFor="password">パスワード</label>
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login-primary" disabled={loading}>
            {loading ? '処理中...' : 'ログイン'}
          </button>
        </form>

        <div className="divider">
          <span>または</span>
        </div>

        <div className="social-login">
          <button type="button" className="btn-social btn-facebook">
            <i className="fa-brands fa-facebook-f"></i>
            <span>Facebookで続行</span>
          </button>
          <button type="button" className="btn-social btn-apple">
            <i className="fa-brands fa-apple"></i>
            <span>Appleで続行</span>
          </button>
          <button type="button" className="btn-social btn-google">
            <i className="fa-brands fa-google"></i>
            <span>Googleで続行</span>
          </button>
        </div>

        <p className="auth-link-bottom">
          アカウントをお持ちでないですか?{' '}
          <span className="link-button" onClick={onSwitchToSignUp}>
            新規登録
          </span>
        </p>
      </div>
    </div>
  )
}

export default SignInModal

