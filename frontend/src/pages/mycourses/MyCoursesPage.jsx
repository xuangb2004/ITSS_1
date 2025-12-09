import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusTabs from "./StatusTabs";
import SortSelect from "./SortSelect";
import CourseCard from "./CourseCard";
import "./MyCoursesPage.css";

// デモ用のコースデータ（まだ MySQL は使っていません）
const MOCK_COURSES = [
  {
    id: 1,
    title: "JavaScript 入門講座",
    instructor: "山田 太郎",
    thumbnail:
      "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
    description:
      "JavaScript の基礎文法から実用的なサンプルまで、初心者向けにやさしく解説します。",
    rating: 4.5,
    ratingCount: 124,
    progress: 45,
    totalLessons: 40,
    completedLessons: 18,
    status: "learning", // "learning" | "completed"
    lastAccess: "2025-12-08T21:30:00Z",
    lastLessonUrl: "/courses/1/lessons/19",
  },
  {
    id: 2,
    title: "はじめての UI デザイン",
    instructor: "佐藤 花子",
    thumbnail:
      "https://images.pexels.com/photos/4348404/pexels-photo-4348404.jpeg",
    description:
      "Web とモバイルアプリのためのレイアウト・配色・タイポグラフィの基本を学びます。",
    rating: 4.7,
    ratingCount: 98,
    progress: 10,
    totalLessons: 20,
    completedLessons: 2,
    status: "learning",
    lastAccess: "2025-12-09T14:45:00Z",
    lastLessonUrl: "/courses/2/lessons/3",
  },
  {
    id: 3,
    title: "React & フロントエンド応用",
    instructor: "高橋 健",
    thumbnail:
      "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg",
    description:
      "コンポーネント設計、状態管理、API 連携など、実務レベルの React 開発を身につけます。",
    rating: 4.8,
    ratingCount: 210,
    progress: 100,
    totalLessons: 30,
    completedLessons: 30,
    status: "completed",
    lastAccess: "2025-12-01T09:10:00Z",
    lastLessonUrl: "/courses/3/lessons/30",
  },
];

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState("learning"); // 受講中 or 修了済み
  const [sortBy, setSortBy] = useState("recent");

  // タブとソートに応じてコースをフィルタリング
  const visibleCourses = useMemo(() => {
    let list = MOCK_COURSES.filter((c) => c.status === statusTab);

    list = [...list];
    switch (sortBy) {
      case "recent":
        list.sort(
          (a, b) =>
            new Date(b.lastAccess).getTime() -
            new Date(a.lastAccess).getTime()
        );
        break;
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title, "ja"));
        break;
      case "progress_desc":
        list.sort((a, b) => b.progress - a.progress);
        break;
      case "progress_asc":
        list.sort((a, b) => a.progress - b.progress);
        break;
      default:
        break;
    }
    return list;
  }, [statusTab, sortBy]);

  // 「学習を続ける」ボタン
  const handleContinue = (course) => {
    if (course.lastLessonUrl) {
      navigate(course.lastLessonUrl, { state: { courseId: course.id } });
    } else {
      navigate(`/courses/${course.id}`);
    }
  };

  return (
    <div className="mycourses-page">
      <div className="mycourses-header">
        <div>
          <h1 className="mycourses-title">マイコース</h1>
          <p className="mycourses-subtitle">
            購入済み・受講中のコース一覧です。学習状況を確認して、すぐに続きから再開できます。
          </p>
        </div>

        <div className="mycourses-controls">
          <StatusTabs value={statusTab} onChange={setStatusTab} />
          <SortSelect value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      <div className="mycourses-content">
        {visibleCourses.length === 0 ? (
          <p className="mycourses-empty">
            現在、
            {statusTab === "learning" ? "受講中のコースはありません。" : "修了済みのコースはありません。"}
          </p>
        ) : (
          <div className="mycourses-grid">
            {visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onContinue={handleContinue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
