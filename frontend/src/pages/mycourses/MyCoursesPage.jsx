import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatusTabs from "./StatusTabs";
import SortSelect from "./SortSelect";
import CourseCard from "./CourseCard";
import { enrollmentService } from "../../services/api"; // Import API
import "./MyCoursesPage.css";

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("learning");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const data = await enrollmentService.getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error("Lỗi tải khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  const visibleCourses = useMemo(() => {
    let list = courses.filter((c) => c.status === statusTab);
    // Logic sort giữ nguyên như cũ
    list = [...list];
    switch (sortBy) {
      case "recent":
        list.sort((a, b) => new Date(b.lastAccess).getTime() - new Date(a.lastAccess).getTime());
        break;
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      // ... các case khác
    }
    return list;
  }, [courses, statusTab, sortBy]);

  const handleContinue = (course) => {
    navigate(`/course/${course.id}`); // Chuyển về trang chi tiết để học
  };

  return (
    <div className="mycourses-page">
      <div className="mycourses-header">
        <div>
          <h1 className="mycourses-title">マイコース</h1>
          <p className="mycourses-subtitle">購入済み・受講中のコース一覧です。</p>
        </div>
        <div className="mycourses-controls">
          <StatusTabs value={statusTab} onChange={setStatusTab} />
          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      <div className="mycourses-content">
        {loading ? (
          <p>読み込み中...</p>
        ) : visibleCourses.length === 0 ? (
          <p className="mycourses-empty">
            {statusTab === "learning" ? "受講中のコースはありません。" : "修了済みのコースはありません。"}
          </p>
        ) : (
          <div className="mycourses-grid">
            {visibleCourses.map((course) => (
              <CourseCard key={course.id} course={course} onContinue={handleContinue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}