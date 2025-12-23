import { useEffect, useState } from 'react';
import { courseService } from '../services/api';
import { useNavigate } from 'react-router-dom';

function PublishedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal Chỉnh sửa
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', price: 0, level: '' });

  // State cho Modal Thống kê
  const [statsCourse, setStatsCourse] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseService.getPublishedCourses();
      setCourses(data.courses);
    } catch (error) {
      console.error("Lỗi tải khóa học", error);
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ XÓA ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.")) {
      try {
        await courseService.deleteCourse(id);
        alert("Đã xóa khóa học");
        loadCourses(); // Load lại danh sách
      } catch (error) {
        alert("Lỗi khi xóa");
      }
    }
  };

  // --- XỬ LÝ SỬA ---
  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await courseService.updateCourse(editingCourse.course_id, formData);
      alert("Cập nhật thành công!");
      setEditingCourse(null);
      loadCourses();
    } catch (error) {
      alert("Lỗi cập nhật");
    }
  };

  if (loading) return <div style={{padding: '20px'}}>Đang tải...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2>📚 Các khóa học đã đăng</h2>
        <button onClick={() => navigate('/create-course')} className="btn-login-primary" style={{width: 'auto'}}>
          <i className="fa-solid fa-plus"></i> Đăng khóa mới
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {courses.length === 0 ? <p>Bạn chưa đăng khóa học nào.</p> : courses.map(course => (
          <div key={course.course_id} style={{ 
            background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
          }}>
            {/* Thông tin cơ bản */}
            <div style={{flex: 1, minWidth: '300px'}}>
              <h3 style={{margin: '0 0 5px 0', color: '#111827'}}>{course.title}</h3>
              <p style={{margin: 0, color: '#6b7280', fontSize: '14px'}}>
                 Giá: {course.price == 0 ? 'Miễn phí' : `$${course.price}`} • Trình độ: {course.level}
              </p>
            </div>

            {/* Các nút chức năng */}
            <div style={{display: 'flex', gap: '10px'}}>
              {/* Nút Xem Thống Kê */}
              <button 
                onClick={() => setStatsCourse(course)}
                style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}
              >
                <i className="fa-solid fa-chart-simple"></i> Thống kê
              </button>

              {/* Nút Chỉnh Sửa */}
              <button 
                onClick={() => openEditModal(course)}
                style={{ background: '#f3f4f6', color: '#4b5563', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}
              >
                <i className="fa-solid fa-pen-to-square"></i> Sửa
              </button>

              {/* Nút Xóa */}
              <button 
                onClick={() => handleDelete(course.course_id)}
                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL THỐNG KÊ --- */}
      {statsCourse && (
        <div className="modal-overlay" onClick={() => setStatsCourse(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '400px', textAlign: 'center'}}>
            <h3>📊 Thống kê: {statsCourse.title}</h3>
            <div style={{display: 'flex', justifyContent: 'space-around', margin: '30px 0'}}>
                <div>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#2563eb'}}>{statsCourse.student_count || 0}</div>
                    <div style={{color: '#6b7280'}}>Học viên đăng ký</div>
                </div>
                <div>
                    <div style={{fontSize: '32px', fontWeight: 'bold', color: '#10b981'}}>{statsCourse.views || 0}</div>
                    <div style={{color: '#6b7280'}}>Lượt truy cập</div>
                </div>
            </div>
            <button onClick={() => setStatsCourse(null)} className="btn-login-primary">Đóng</button>
          </div>
        </div>
      )}

      {/* --- MODAL CHỈNH SỬA --- */}
      {editingCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>✏️ Chỉnh sửa khóa học</h3>
            <form onSubmit={handleUpdate}>
              <div className="form-group-icon">
                <label>Tên khóa học</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group-icon">
                <label>Mô tả</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width: '100%', padding: '10px'}} required />
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                  <div className="form-group-icon" style={{flex: 1}}>
                    <label>Giá ($)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div className="form-group-icon" style={{flex: 1}}>
                    <label>Trình độ</label>
                    <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} style={{width: '100%', padding: '10px'}}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                  </div>
              </div>
              
              <div style={{display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end'}}>
                <button type="button" onClick={() => setEditingCourse(null)} style={{padding: '10px 20px', border:'none', cursor:'pointer', background:'#eee', borderRadius: '5px'}}>Hủy</button>
                <button type="submit" className="btn-login-primary" style={{width: 'auto'}}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublishedCourses;