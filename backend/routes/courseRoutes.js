const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const upload = require("../middleware/uploadMiddleware");
const jwt = require("jsonwebtoken");

// Middleware xác thực
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

// 1. Các route lấy danh sách chung
router.get("/", courseController.getAllCourses);
router.get("/recommended", courseController.getRecommendedCourses);
router.get("/trending", courseController.getTrendingCourses);
router.get("/search", courseController.searchCourses);

// 2. Route Tiến độ học tập (Cần đăng nhập)
router.post("/progress", verifyToken, courseController.markLessonComplete);

//  3. CÁC ROUTE QUẢN LÝ KHÓA HỌC (THÊM MỚI Ở ĐÂY) 
router.get("/my-published", verifyToken, courseController.getInstructorCourses);
router.put("/:id", verifyToken, courseController.updateCourse);
router.delete("/:id", verifyToken, courseController.deleteCourse);
// -------------------------------------------------------------

// 4. Lấy chi tiết khóa học (Đặt cuối cùng vì nó bắt mọi ID)
router.get("/:id", courseController.getCourseById);

// 5. Tạo khóa học
router.post("/", verifyToken, upload.single('thumbnail'), courseController.createCourse);

module.exports = router;