import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService, cartService, enrollmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './css/CourseDetail.css';

// Hàm lấy ID video từ link YouTube (Hỗ trợ nhiều định dạng link)
const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Hàm xử lý link ảnh an toàn
const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/400x200?text=No+Image";
    if (path.startsWith('http')) return path;
    // Nếu là đường dẫn file upload từ backend
    return path; 
};

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null); // Bài học đang chọn
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseById(id);
        setCourse(data.course);
        
        // Mặc định chọn bài đầu tiên nếu có danh sách bài học
        if(data.course.curriculum && data.course.curriculum.length > 0) {
            setActiveLesson(data.course.curriculum[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  // Xử lý Thêm vào giỏ
  const handleAddToCart = async () => {
    if (!user) { alert("Vui lòng đăng nhập"); return; }
    try {
      await cartService.addToCart(course.course_id);
      alert("Đã thêm vào giỏ hàng!");
    } catch (err) { alert(err.response?.data?.message || "Lỗi thêm vào giỏ"); }
  };

  // Xử lý Mua ngay / Đăng ký
  const handleBuyNow = async () => {
    if (!user) { alert("Vui lòng đăng nhập"); return; }
    
    const isFree = Number(course.price) === 0;
    const confirmMessage = isFree 
        ? `Bạn có muốn đăng ký miễn phí khóa học "${course.title}" không?`
        : `Bạn có chắc chắn muốn mua khóa học "${course.title}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        await enrollmentService.enroll(course.course_id);
        alert("Đăng ký thành công! Bạn có thể bắt đầu học ngay.");
        navigate('/my-courses');
      } catch (err) { alert(err.response?.data?.message || "Lỗi đăng ký"); }
    }
  };

  if (loading) return <div className="loading" style={{textAlign: 'center', padding: '50px'}}>Đang tải...</div>;
  if (!course) return <div style={{textAlign: 'center', padding: '50px'}}>Không tìm thấy khóa học</div>;

  // Kiểm tra miễn phí
  const isFree = Number(course.price) === 0;
  const priceDisplay = isFree ? "Miễn phí" : `$${Number(course.price).toFixed(2)}`;

  return (
    <div className="course-detail-container">
      {/* --- HERO SECTION --- */}
      <div className="hero">
        <div className="hero-left">
          <h1>{course.title}</h1>
          <p className="hero-subtitle">{course.description}</p>
          <div className="hero-meta">
            <span>Trình độ: {course.level || 'Beginner'}</span> • 
            <span> Cập nhật: {new Date(course.created_at).toLocaleDateString()}</span>
          </div>
          
          {/* TRÌNH PHÁT VIDEO */}
          <div className="video-section" style={{marginTop: '20px'}}>
             {activeLesson && getYouTubeId(activeLesson.video_url) ? (
                 <div className="video-player-wrapper" style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', background: '#000', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'}}>
                    <iframe 
                        style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                        src={`https://www.youtube.com/embed/${getYouTubeId(activeLesson.video_url)}`} 
                        title={activeLesson.title} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                 </div>
             ) : (
                <div style={{
                    padding: '60px 20px', 
                    background: '#1f2937', 
                    color: '#9ca3af', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    border: '1px dashed #4b5563'
                }}>
                    <i className="fa-solid fa-film" style={{fontSize: '32px', marginBottom: '10px'}}></i>
                    <p>{course.curriculum?.length > 0 ? "Chọn bài học bên dưới để xem video" : "Khóa học này chưa có video bài giảng"}</p>
                </div>
             )}
             
             {/* Tiêu đề bài học đang phát */}
             {activeLesson && (
                 <div style={{marginTop: '15px', padding: '10px 15px', background: '#f3f4f6', borderRadius: '4px', borderLeft: '4px solid #2563eb'}}>
                     <h3 style={{margin: 0, fontSize: '16px', color: '#1f2937'}}>
                        Đang phát: <span style={{fontWeight: 'normal'}}>{activeLesson.title}</span>
                     </h3>
                 </div>
             )}
          </div>
        </div>
        <div className="hero-right"></div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="course-main-content">
        <div className="content-col">
          <section className="block-section">
            <h2>Nội dung khóa học</h2>
            <div className="curriculum">
              {course.curriculum && course.curriculum.length > 0 ? (
                course.curriculum.map((lesson, index) => (
                  <div 
                    key={lesson.lesson_id} 
                    className={`lesson-item ${activeLesson?.lesson_id === lesson.lesson_id ? 'active' : ''}`}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                        cursor: 'pointer', 
                        background: activeLesson?.lesson_id === lesson.lesson_id ? '#eff6ff' : 'transparent', 
                        padding: '12px',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background 0.2s'
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <i 
                            className={activeLesson?.lesson_id === lesson.lesson_id ? "fa-solid fa-circle-play" : "fa-regular fa-circle-play"} 
                            style={{color: activeLesson?.lesson_id === lesson.lesson_id ? '#2563eb' : '#9ca3af', fontSize: '18px'}}
                        ></i>
                        <div>
                            <span style={{fontWeight: activeLesson?.lesson_id === lesson.lesson_id ? '600' : '500', color: '#374151'}}>
                                Bài {index + 1}: {lesson.title}
                            </span>
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{color: '#666', fontStyle: 'italic', padding: '10px'}}>Chưa có bài học nào được cập nhật.</p>
              )}
            </div>
          </section>
        </div>

        {/* --- SIDEBAR (Mua hàng) --- */}
        <div className="sidebar-col">
          <div className="course-card-sidebar">
            <img 
                src={getImageUrl(course.thumbnail)} 
                alt={course.title} 
                onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/400x200?text=No+Image"}}
            />
            <div className="course-card-body">
              <div className="course-detail-price" style={{color: isFree ? '#16a34a' : '#111827'}}>
                {priceDisplay}
              </div>
              
              <div className="course-card-buttons">
                {isFree ? (
                    <button className="btn primary" onClick={handleBuyNow} style={{background: '#16a34a'}}>
                      <i className="fa-solid fa-user-plus"></i> Đăng ký học ngay
                    </button>
                ) : (
                    <>
                        <button className="btn primary" onClick={handleBuyNow}>Mua ngay</button>
                        <button className="btn secondary" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
                    </>
                )}
              </div>
              
              <p style={{fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '15px'}}>
                {isFree ? "Truy cập miễn phí trọn đời" : "Đảm bảo hoàn tiền trong 30 ngày"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;