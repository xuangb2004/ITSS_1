import { Link } from 'react-router-dom'

function CourseCard({ course }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fa-solid fa-star"></i>)
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fa-solid fa-star-half-stroke"></i>)
    }
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="fa-regular fa-star"></i>)
    }

    return stars
  }

  return (
    <div className="course-card">
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
          & {course.instructor_id?.studio || 'Instructor'}
        </p>
        <p className="course-description">
          {course.description?.substring(0, 100)}
          {course.description?.length > 100 ? '...' : ''}
        </p>
        <div className="course-rating">
          <div className="stars">
            {renderStars(course.rating || 0)}
          </div>
          <span className="rating-text">
            {course.rating?.toFixed(1) || '0.0'} ({course.reviewCount || 0})
          </span>
        </div>
        <div className="course-price">
          {course.originalPrice && course.originalPrice > course.price ? (
            <>
              <span className="price-current">${course.price?.toFixed(2) || '0.00'}</span>
              <span className="price-original">${course.originalPrice?.toFixed(2)}</span>
            </>
          ) : (
            <span className="price-current">${course.price?.toFixed(2) || '0.00'}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseCard

