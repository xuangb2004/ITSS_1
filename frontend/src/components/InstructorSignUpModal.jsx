import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

function InstructorSignUpModal({ isOpen, onClose, onSwitchToSignIn }) {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', confirmPassword: '', bio: '', expertise: '' 
  });
  const [error, setError] = useState('');
  const { signin } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("パスワード確認が一致しません");
      return;
    }

    try {
      // 講師登録APIを呼び出す
      const data = await authService.instructorSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        expertise: formData.expertise
      });

      signin(data.user, data.token);
      onClose();
      alert("講師としてのご登録を歓迎します！");
    } catch (err) {
      setError(err.response?.data?.message || "登録に失敗しました");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <div className="modal-header">
          <h2>講師登録</h2>
          <p>あなたの知識を世界と共有しましょう</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input 
              type="text"
              placeholder="氏名"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <input 
              type="email"
              placeholder="メールアドレス"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <input 
              type="text"
              placeholder="専門分野（例：Webデザイン、Python など）"
              required
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
            />
          </div>

          <div className="form-group">
            <textarea 
              placeholder="自己紹介（経験・資格など）"
              required
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd'
              }}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="form-group">
            <input 
              type="password"
              placeholder="パスワード"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="form-group">
            <input 
              type="password"
              placeholder="パスワード確認"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
          
          <button type="submit" className="btn-login-primary">
            今すぐ登録
          </button>
        </form>

        <div className="modal-footer">
          <p>
            すでにアカウントをお持ちですか？{' '}
            <a href="#" onClick={onSwitchToSignIn}>ログイン</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default InstructorSignUpModal;
