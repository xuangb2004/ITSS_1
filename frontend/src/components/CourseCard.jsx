import { useNavigate } from 'react-router-dom';

function CourseCard({ course }) {
  const navigate = useNavigate();

  // 1. ĐỊNH NGHĨA LINK BACKEND (Thay đúng link Render của bạn vào đây)
  const API_BASE_URL = "https://itss-1-pz9y.onrender.com";

  const handleClick = () => {
    const id = course.course_id || course.id; 
    navigate(`/course/${id}`);
  };

  const isFree = Number(course.price) === 0;
  const rating = Number(course.average_rating) || 5; 
  const reviewCount = Number(course.review_count) || 0;

  // 2. HÀM XỬ LÝ ẢNH THÔNG MINH (Mới thêm)
  const getImageUrl = (thumbnailPath) => {
    // Nếu không có dữ liệu ảnh -> Trả về ảnh giữ chỗ
    if (!thumbnailPath) return "https://placehold.co/300x170?text=No+Image";

    // Nếu là link ảnh online (VD: https://imgur.com/...) -> Giữ nguyên
    if (thumbnailPath.startsWith("http")) return thumbnailPath;

    // Nếu là đường dẫn từ server (VD: /uploads/abc.jpg) -> Ghép link Backend vào
    // Kiểm tra xem có dấu gạch chéo đầu chưa để ghép cho đúng
    const cleanPath = thumbnailPath.startsWith("/") ? thumbnailPath : `/${thumbnailPath}`;
    
    return `${API_BASE_URL}${cleanPath}`;
  };

  const renderStars = (score) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= score) {
            stars.push(<i key={i} className="fa-solid fa-star" style={{color: '#f59e0b'}}></i>);
        } else if (i === Math.ceil(score) && !Number.isInteger(score)) {
            stars.push(<i key={i} className="fa-solid fa-star-half-stroke" style={{color: '#f59e0b'}}></i>);
        } else {
            stars.push(<i key={i} className="fa-regular fa-star" style={{color: '#f59e0b'}}></i>);
        }
    }
    return stars;
  };

  return (
    <div className="course-card" onClick={handleClick}>
      <img 
        // 3. GỌI HÀM XỬ LÝ ẢNH Ở ĐÂY
        src={getImageUrl(course.thumbnail)} 
        alt={course.title} 
        className="course-image"
        // Thêm chút style để ảnh không bị méo
        style={{ width: '100%', height: '170px', objectFit: 'cover' }}
        onError={(e) => {
            e.target.onerror = null; 
            e.target.src="https://placehold.co/300x170?text=No+Image";
        }} 
      />
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">{course.instructor_name || "Unknown Instructor"}</p>
        
        <div className="course-rating">
          <span className="rating-score">{rating.toFixed(1)}</span>
          <div className="stars">
            {renderStars(rating)}
          </div>
          <span className="review-count">({reviewCount})</span>
        </div>
        
        <div className="course-price" style={{color: isFree ? '#16a34a' : '#333'}}>
          {isFree ? "無料" : `$${Number(course.price).toFixed(2)}`}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;