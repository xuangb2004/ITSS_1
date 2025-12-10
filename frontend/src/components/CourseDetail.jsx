import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService, cartService, enrollmentService } from '../services/api'; // Import thêm service
import { useAuth } from '../context/AuthContext'; // Để kiểm tra đăng nhập
import './css/CourseDetail.css';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy user hiện tại
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseById(id);
        setCourse(data.course);
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Xử lý thêm vào giỏ
  const handleAddToCart = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    try {
      await cartService.addToCart(course.course_id);
      alert("Đã thêm khóa học vào giỏ hàng!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi thêm vào giỏ");
    }
  };

  // Xử lý Mua ngay
  const handleBuyNow = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để mua khóa học");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn mua khóa học "${course.title}"?`)) {
      try {
        await enrollmentService.enroll(course.course_id);
        alert("Đăng ký thành công! Bạn có thể bắt đầu học ngay.");
        navigate('/my-courses'); // Chuyển hướng đến trang khóa học của tôi
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi thanh toán");
      }
    }
  };

  if (loading) return <div className="loading" style={{padding: '40px', textAlign: 'center'}}>Đang tải...</div>;
  if (error) return <div className="error-message" style={{padding: '40px', textAlign: 'center', color: 'red'}}>{error}</div>;
  if (!course) return null;

  return (
    <div className="course-detail-container">
      {/* ... (Phần Hero giữ nguyên) ... */}
      <div className="hero">
        <div className="hero-left">
          <h1>{course.title}</h1>
          <p className="hero-subtitle">{course.description}</p>
          <div className="hero-meta">
            <span>Trình độ: {course.level || 'Beginner'}</span> • 
            <span> Cập nhật: {new Date(course.created_at).toLocaleDateString()}</span>
          </div>
          <div className="hero-rating">
            <span className="score">{Number(course.rating || 0).toFixed(1)}</span>
            <span className="stars">★★★★★</span>
            <span>({course.reviewCount || 0} đánh giá)</span>
          </div>
          <div style={{marginTop: '15px', fontSize: '14px'}}>
            Giảng viên: <strong>{course.instructor_name || 'Unknown Instructor'}</strong>
          </div>
        </div>
        <div className="hero-right"></div>
      </div>

      <div className="course-main-content">
        <div className="content-col">
          {/* ... (Nội dung chi tiết giữ nguyên) ... */}
          <section className="block-section">
            <h2>Mô tả khóa học</h2>
            <p style={{lineHeight: '1.6', color: '#374151'}}>{course.description}</p>
          </section>
          
          <section className="block-section">
            <h2>Nội dung khóa học</h2>
            <div className="curriculum">
              {course.curriculum && course.curriculum.length > 0 ? (
                course.curriculum.map((lesson, index) => (
                  <div key={lesson.lesson_id} className="lesson-item">
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <i className="fa-regular fa-circle-play" style={{color: '#6b7280'}}></i>
                        <span>Bài {lesson.position || index + 1}: {lesson.title}</span>
                    </div>
                    <span style={{color: '#6b7280'}}>10:00</span>
                  </div>
                ))
              ) : (
                <p style={{color: '#666', fontStyle: 'italic'}}>Chưa có bài học nào được cập nhật.</p>
              )}
            </div>
          </section>
        </div>

        {/* Cột Sidebar - CẬP NHẬT NÚT BẤM */}
        <div className="sidebar-col">
          <div className="course-card-sidebar">
            <img src={course.thumbnail || "https://via.placeholder.com/400x200"} alt={course.title} />
            <div className="course-card-body">
              <div className="course-detail-price">
                {Number(course.price) === 0 ? "Miễn phí" : `$${Number(course.price).toFixed(2)}`}
              </div>
              
              <div className="course-card-buttons">
                {/* Sự kiện onClick */}
                <button className="btn primary" onClick={handleBuyNow}>
                  Mua ngay
                </button>
                <button className="btn secondary" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng
                </button>
              </div>
              
              <p style={{fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '15px'}}>
                Đảm bảo hoàn tiền trong 30 ngày
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;