import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import '../components/css/dashboard.css'; 

function Dashboard() {
  const { signout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State cho form
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
        previewUrl: data.avatar ? `http://localhost:5001${data.avatar}` : "https://via.placeholder.com/150"
      });
    } catch (error) {
      console.error("Lỗi tải profile:", error);
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
      alert("Cập nhật thành công!");
    } catch (error) {
      alert("Lỗi cập nhật profile");
    }
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Đang tải dữ liệu...</div>;

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Tài khoản</h2>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <i className="fa-regular fa-user"></i> Hồ sơ cá nhân
          </button>
          <button className="nav-item" onClick={() => navigate('/my-courses')}>
            <i className="fa-solid fa-book-open"></i> Khóa học của tôi
          </button>
          <button className="nav-item" onClick={() => navigate('/cart')}>
            <i className="fa-solid fa-cart-shopping"></i> Giỏ hàng
          </button>
          <button className="nav-item logout" onClick={handleSignOut}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <div className="profile-header">
          <h1>Hồ sơ của tôi</h1>
          {!isEditing && (
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              <i className="fa-solid fa-pen"></i> Chỉnh sửa
            </button>
          )}
        </div>

        <div className="profile-card">
          {/* Cột trái: Avatar */}
          <div className="profile-avatar-section">
            <img 
              src={formData.previewUrl || "https://via.placeholder.com/150"} 
              alt="Avatar" 
              className="profile-avatar-large"
            />
            {isEditing && (
              <div className="file-upload-wrapper">
                <label htmlFor="avatar-upload" className="btn-upload">
                  <i className="fa-solid fa-camera"></i> Đổi ảnh
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{display: 'none'}}
                />
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin */}
          <div className="profile-info-section">
            {isEditing ? (
              // FORM CHỈNH SỬA
              <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giới thiệu bản thân (Bio)</label>
                  <textarea 
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows="5"
                    placeholder="Hãy viết vài dòng về bạn..."
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => {
                    setIsEditing(false);
                    // Reset lại form về dữ liệu gốc
                    setFormData({
                      ...formData,
                      name: profile.name,
                      bio: profile.bio || '',
                      avatarFile: null,
                      previewUrl: profile.avatar ? `http://localhost:5001${profile.avatar}` : "https://via.placeholder.com/150"
                    });
                  }}>Hủy bỏ</button>
                  <button type="submit" className="btn-save">Lưu thay đổi</button>
                </div>
              </form>
            ) : (
              // HIỂN THỊ THÔNG TIN
              <div className="info-display">
                <div className="info-item">
                  <label>Họ và tên</label>
                  <p>{profile?.name}</p>
                </div>
                
                <div className="info-item">
                  <label>Email đăng nhập</label>
                  <p>{profile?.email}</p>
                </div>

                <div className="info-item">
                  <label>Vai trò hệ thống</label>
                  <span className={`role-badge ${profile?.role}`}>
                    {profile?.role === 'instructor' ? 'Giảng viên' : 'Học viên'}
                  </span>
                </div>

                <div className="info-item">
                  <label>Giới thiệu</label>
                  <p className="bio-text">
                    {profile?.bio ? profile.bio : <em style={{color: '#9ca3af'}}>Chưa cập nhật giới thiệu...</em>}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;