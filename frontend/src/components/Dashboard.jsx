import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import PublishedCourses from './PublishedCourses'; 
import '../components/css/dashboard.css'; 

function Dashboard() {
  const { signout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 👇 State mới để quản lý Tab (profile | courses)
  const [activeTab, setActiveTab] = useState('profile');

  // フォーム用のState
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarFile: null,
    previewUrl: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        name: data.name,
        bio: data.bio || '',
        avatarFile: null,
        previewUrl: data.avatar
          ? `http://localhost:5001${data.avatar}`
          : "https://placehold.co/150"
      });
    } catch (error) {
      console.error("プロフィールの読み込みエラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signout();
    navigate('/');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        avatarFile: file,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('bio', formData.bio);
      if (formData.avatarFile) {
        data.append('avatar', formData.avatarFile);
      }

      const res = await userService.updateProfile(data);
      setProfile(res.user);
      setIsEditing(false);
      alert("更新が完了しました！");
    } catch (error) {
      alert("プロフィール更新エラー");
    }
  };

  if (loading)
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        データを読み込み中...
      </div>
    );

  return (
    <div className="dashboard-container">
      {/* サイドバー */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>アカウント</h2>
        </div>
        <nav className="sidebar-nav">
          
          {/* 1. Nút Hồ sơ (Luôn hiện) */}
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fa-regular fa-user"></i> プロフィール
          </button>

          {/* 2. Logic phân quyền Sidebar */}
          {profile?.role === 'instructor' ? (
            // --- GIAO DIỆN GIẢNG VIÊN (Thay thế MyCourses/Cart bằng Quản lý khóa học) ---
            <button 
                className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
            >
                <i className="fa-solid fa-chalkboard-user"></i> コース管理 
            </button>
          ) : (
            // --- GIAO DIỆN HỌC VIÊN (Giữ nguyên) ---
            <>
                <button className="nav-item" onClick={() => navigate('/my-courses')}>
                    <i className="fa-solid fa-book-open"></i> マイコース
                </button>
                <button className="nav-item" onClick={() => navigate('/cart')}>
                    <i className="fa-solid fa-cart-shopping"></i> カート
                </button>
            </>
          )}

           {/* Chỉ hiển thị nút Đăng khóa học nếu role là instructor */}
           {profile?.role === 'instructor' && (
            <button 
              className="nav-item" 
              style={{ backgroundColor: '#e6fffa', color: '#0d9488', fontWeight: 'bold' }}
              onClick={() => navigate('/create-course')}
            >
              <i className="fa-solid fa-plus-circle" style={{ marginRight: '5px' }}></i> 
              新規コース作成
            </button>
          )}

          <button className="nav-item logout" onClick={handleSignOut}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> ログアウト
          </button>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="dashboard-main">
        
        {/* TRƯỜNG HỢP 1: TAB PROFILE */}
        {activeTab === 'profile' && (
            <>
                <div className="profile-header">
                <h1>マイプロフィール</h1>
                {!isEditing && (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                    <i className="fa-solid fa-pen"></i> 編集
                    </button>
                )}
                </div>

                <div className="profile-card">
                {/* 左カラム：アバター */}
                <div className="profile-avatar-section">
                    <img
                    src={formData.previewUrl || "https://via.placeholder.com/150"}
                    alt="Avatar"
                    className="profile-avatar-large"
                    />
                    {isEditing && (
                    <div className="file-upload-wrapper">
                        <label htmlFor="avatar-upload" className="btn-upload">
                        <i className="fa-solid fa-camera"></i> 写真を変更
                        </label>
                        <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        />
                    </div>
                    )}
                </div>

                {/* 右カラム：情報 */}
                <div className="profile-info-section">
                    {isEditing ? (
                    // 編集フォーム
                    <form onSubmit={handleSubmit} className="edit-form">
                        <div className="form-group">
                        <label>氏名</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                        </div>

                        <div className="form-group">
                        <label>自己紹介（Bio）</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                            }
                            rows="5"
                            placeholder="あなたについて数行で紹介してください..."
                        />
                        </div>

                        <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => {
                            setIsEditing(false);
                            // フォームを元のデータにリセット
                            setFormData({
                                ...formData,
                                name: profile.name,
                                bio: profile.bio || '',
                                avatarFile: null,
                                previewUrl: profile.avatar
                                ? `http://localhost:5001${profile.avatar}`
                                : "https://via.placeholder.com/150"
                            });
                            }}
                        >
                            キャンセル
                        </button>
                        <button type="submit" className="btn-save">
                            変更を保存
                        </button>
                        </div>
                    </form>
                    ) : (
                    // 情報表示
                    <div className="info-display">
                        <div className="info-item">
                        <label>氏名</label>
                        <p>{profile?.name}</p>
                        </div>

                        <div className="info-item">
                        <label>ログインメール</label>
                        <p>{profile?.email}</p>
                        </div>

                        <div className="info-item">
                        <label>システム権限</label>
                        <span className={`role-badge ${profile?.role}`}>
                            {profile?.role === 'instructor'
                            ? '講師'
                            : '受講生'}
                        </span>
                        </div>

                        <div className="info-item">
                        <label>自己紹介</label>
                        <p className="bio-text">
                            {profile?.bio ? (
                            profile.bio
                            ) : (
                            <em style={{ color: '#9ca3af' }}>
                                まだ自己紹介が設定されていません...
                            </em>
                            )}
                        </p>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </>
        )}

        {/* TRƯỜNG HỢP 2: TAB QUẢN LÝ KHÓA HỌC (CHỈ GIẢNG VIÊN) */}
        {activeTab === 'courses' && profile?.role === 'instructor' && (
            <PublishedCourses />
        )}

      </main>
    </div>
  );
}

export default Dashboard;