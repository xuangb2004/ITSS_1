import { useNavigate } from 'react-router-dom'; // 1. BẮT BUỘC IMPORT

function CourseCard({ course }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Dùng course.course_id nếu lấy từ API thật, hoặc course.id nếu mock
    const id = course.course_id || course.id; 
    navigate(`/course/${id}`);
  };

  const isFree = Number(course.price) === 0;

  // 2. Lấy dữ liệu động (Nếu chưa có trong DB thì mặc định là 0 hoặc 5)
  const rating = Number(course.average_rating) || 5; 
  const reviewCount = Number(course.review_count) || 0;

  // Hàm render sao động
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
        src={course.thumbnail || "https://placehold.co/300x170?text=No+Image"} 
        alt={course.title} 
        className="course-image"
        onError={(e) => {e.target.onerror = null; e.target.src="https://placehold.co/300x170?text=No+Image"}} 
      />
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">{course.instructor_name || "Unknown Instructor"}</p>
        
        {/* 3. Phần đánh giá động */}
        <div className="course-rating">
          <span className="rating-score">{rating.toFixed(1)}</span>
          <div className="stars">
            {renderStars(rating)}
          </div>
          <span className="review-count">({reviewCount})</span>
        </div>
        
        <div className="course-price" style={{color: isFree ? '#16a34a' : '#333'}}>
          {isFree ? "Miễn phí" : `$${Number(course.price).toFixed(2)}`}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;