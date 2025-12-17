import { useNavigate } from 'react-router-dom';

function CourseCard({ course }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Dùng course.course_id nếu lấy từ API thật, hoặc course.id nếu mock
    const id = course.course_id || course.id; 
    navigate(`/course/${id}`);
  };

  const isFree = Number(course.price) === 0;

  return (
    <div className="course-card" onClick={handleClick}>
      <img src={course.thumbnail || "https://via.placeholder.com/300x170"} alt={course.title} className="course-image" />
      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">{course.instructor_name || "Unknown"}</p>
        
        <div className="course-rating">
          <span className="rating-score">4.8</span>
          <div className="stars">
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
          </div>
          <span className="review-count">(120)</span>
        </div>
        
        <div className="course-price" style={{color: isFree ? '#16a34a' : '#333'}}>
          {isFree ? "Miễn phí" : `$${Number(course.price).toFixed(2)}`}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;