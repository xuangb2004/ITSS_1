const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getRecommendedCourses,
  getTrendingCourses,
  searchCourses,
  getCourseById,
} = require("../controllers/courseController");

// GET /api/courses - Lấy tất cả khóa học
router.get("/", getAllCourses);

// GET /api/courses/recommended - Lấy khóa học được đề xuất
router.get("/recommended", getRecommendedCourses);

// GET /api/courses/trending - Lấy khóa học trending
router.get("/trending", getTrendingCourses);

// GET /api/courses/search - Tìm kiếm khóa học
router.get("/search", searchCourses);

// GET /api/courses/:id - Lấy chi tiết khóa học
router.get("/:id", getCourseById);

module.exports = router;

