const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController"); 
const upload = require("../middleware/uploadMiddleware"); 
const jwt = require("jsonwebtoken");

// Middleware xác thực (Kiểm tra token đăng nhập)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  const JWT_SECRET = process.env.JWT_SECRET || "bi_mat_khong_the_bat_mi_123456"; 
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- CÁC ROUTE ---

// GET /api/courses - Lấy tất cả khóa học
router.get("/", courseController.getAllCourses);

// GET /api/courses/recommended - Lấy khóa học được đề xuất
router.get("/recommended", courseController.getRecommendedCourses);

// GET /api/courses/trending - Lấy khóa học trending
router.get("/trending", courseController.getTrendingCourses);

// GET /api/courses/search - Tìm kiếm khóa học
router.get("/search", courseController.searchCourses);

// POST /api/courses/progress - Lưu tiến độ học tập (Cần đăng nhập)
router.post("/progress", verifyToken, courseController.markLessonComplete);
// ----------------------------------------

// GET /api/courses/:id - Lấy chi tiết khóa học
router.get("/:id", courseController.getCourseById);

// POST /api/courses - Tạo khóa học
router.post("/", verifyToken, upload.single('thumbnail'), courseController.createCourse);

module.exports = router;