import { useNavigate } from 'react-router-dom';

function CourseCard({ course }) {
  const navigate = useNavigate();

  const renderStars = (rating) => {
    const validRating = Number(rating) || 0;
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fa-solid fa-star"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fa-solid fa-star-half-stroke"></i>);
    }
    const emptyStars = 5 - Math.ceil(validRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="fa-regular fa-star"></i>);
    }

    return stars;
  }

  // Xử lý giá tiền (chuyển từ string sang number)
  const price = Number(course.price) || 0;
  const originalPrice = course.originalPrice ? Number(course.originalPrice) : null;

  // Lấy ID để điều hướng (ưu tiên course_id của SQL)
  const courseId = course.course_id || course._id;

  return (
    <div 
      className="course-card"
      onClick={() => navigate(`/course/${courseId}`)}
    >
      <div className="course-thumbnail">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} />
        ) : (
          <div className="course-thumbnail-placeholder">
            <i className="fa-solid fa-image"></i>
          </div>
        )}
      </div>
      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">
          {/* Hiển thị tên giảng viên từ SQL (instructor_name) hoặc MongoDB (instructor_id.studio) */}
          {course.instructor_name || course.instructor_id?.studio || 'Instructor'}
        </p>
        <p className="course-description">
          {course.description?.substring(0, 100)}
          {course.description?.length > 100 ? '...' : ''}
        </p>
        <div className="course-rating">
          <div className="stars">
            {renderStars(course.rating)}
          </div>
          <span className="rating-text">
            {Number(course.rating || 0).toFixed(1)} ({course.reviewCount || 0})
          </span>
        </div>
        <div className="course-price">
          {originalPrice && originalPrice > price ? (
            <>
              <span className="price-current">${price.toFixed(2)}</span>
              <span className="price-original">${originalPrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="price-current">
              {price === 0 ? "Miễn phí" : `$${price.toFixed(2)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseCard;