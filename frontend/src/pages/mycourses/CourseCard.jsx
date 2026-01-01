import React from "react";

function ProgressBar({ value }) {
  return (
    <div className="course-progress-bar">
      <div
        className="course-progress-bar-inner"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function RatingStars({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  const stars = [];
  for (let i = 0; i < full; i++) stars.push("full");
  if (hasHalf) stars.push("half");
  for (let i = 0; i < empty; i++) stars.push("empty");

  return (
    <div className="course-rating-stars">
      {stars.map((t, i) => (
        <span
          key={i}
          className={
            t === "full"
              ? "star-full"
              : t === "half"
              ? "star-half"
              : "star-empty"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function CourseCard({ course, onContinue }) {
  const isCompleted = course.status === "completed";

  return (
    <div className="course-card">
      <div className="course-thumbnail-wrapper">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="course-thumbnail"
        />
        {isCompleted && (
          <span className="course-badge-completed">修了済み</span>
        )}
      </div>

      <div className="course-body">
        <h2 className="course-title">{course.title}</h2>
        <p className="course-instructor">{course.instructor}</p>

        {course.description && (
          <p className="course-desc">{course.description}</p>
        )}

        {(course.rating || course.rating === 0) && (
          <div className="course-rating-row">
            <RatingStars rating={course.rating} />
            <span className="course-rating-text">
              {course.rating.toFixed(1)}{" "}
              <span className="course-rating-count">
                （{course.ratingCount || 0} 件の評価）
              </span>
            </span>
          </div>
        )}

        <div className="course-progress-info">
          <span>
            進行状況: <strong>{course.progress}%</strong>
          </span>
          <span>
            {course.completedLessons}/{course.totalLessons} レッスン
          </span>
        </div>

        <ProgressBar value={course.progress} />

        <p className="course-last-access">
          最終アクセス:{" "}
          {new Date(course.lastAccess).toLocaleString("ja-JP")}
        </p>

        <div className="course-footer">
          <button
            className="course-continue-btn"
            onClick={() => onContinue(course)}
          >
            学習を続ける
          </button>

          {!isCompleted && (
            <span className="course-next-lesson">
              次回は レッスン {course.completedLessons + 1} から
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
