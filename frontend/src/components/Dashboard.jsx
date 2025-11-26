import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user, signout } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signout()
    navigate('/')
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>ようこそ！</h1>
        <div className="user-info">
          <h2>アカウント情報</h2>
          {user?.name && (
            <p>
              <strong>お名前：</strong> {user.name}
            </p>
          )}
          <p>
            <strong>メールアドレス：</strong> {user?.email}
          </p>
          <p>
            <strong>ID：</strong> {user?.id}
          </p>
        </div>
        <button onClick={handleSignOut} className="btn-secondary">
          ログアウト
        </button>
      </div>
    </div>
  )
}

export default Dashboard
