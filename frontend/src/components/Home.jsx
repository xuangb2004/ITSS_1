import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SignUpModal from './SignUpModal'
import SignInModal from './SignInModal'

function Home() {
  const [showSignUp, setShowSignUp] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Nếu đã đăng nhập, chuyển đến dashboard
  if (user) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="home-wrapper">
      <header className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <i className="fa-solid fa-cloud"></i>
            <span>MyCourse.io</span>
          </div>
          
          <div className="search-bar">
            <input type="text" placeholder="コースを検索" />
            <button><i className="fa-solid fa-search"></i></button>
          </div>

          <div className="nav-actions">
            <button className="nav-btn">インストラクターになる</button>
            <button className="nav-icon"><i className="fa-solid fa-cart-shopping"></i></button>
            <button className="nav-btn btn-login" onClick={() => setShowSignIn(true)}>
              ログイン
            </button>
            <button className="nav-btn btn-signup" onClick={() => setShowSignUp(true)}>
              新規登録
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h1>毎日新し</h1>
            <h2>プロになって、世界</h2>
            <p>コースを最後までやり</p>
            <p>君にぴったりのベストを知</p>
          </div>
        </div>
      </main>

      {showSignUp && (
        <SignUpModal 
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={() => {
            setShowSignUp(false)
            setShowSignIn(true)
          }}
        />
      )}

      {showSignIn && (
        <SignInModal 
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false)
            setShowSignUp(true)
          }}
        />
      )}
    </div>
  )
}

export default Home

