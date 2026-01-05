const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const upload = require("../middleware/uploadMiddleware");
const jwt = require("jsonwebtoken");

// Đảm bảo khóa bí mật khớp với file authController.js
const JWT_SECRET = process.env.JWT_SECRET || "bi_mat_khong_the_bat_mi_123456";

// Middleware xác thực BẮT BUỘC
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware xác thực TÙY CHỌN
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    req.user = null; 
    return next();
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) req.user = null; 
    else req.user = user;
    next();
  });
};

// --- CÁC ROUTE ---

router.get("/search", courseController.searchCourses); // Đưa Search lên đầu nhóm
router.get("/", courseController.getAllCourses);
router.get("/recommended", courseController.getRecommendedCourses);
router.get("/trending", courseController.getTrendingCourses);
router.get("/:id", optionalVerifyToken, courseController.getCourseById);

// Route cần login
router.post("/progress", verifyToken, courseController.markLessonComplete);
router.get("/my-published", verifyToken, courseController.getInstructorCourses);
router.put("/:id", verifyToken, courseController.updateCourse);
router.delete("/:id", verifyToken, courseController.deleteCourse);

// 👇👇 2 ROUTE MỚI CHO REVIEW (Thêm vào đây) 👇👇
router.get("/:id/reviews", courseController.getCourseReviews);
router.post("/:id/reviews", verifyToken, courseController.addCourseReview);
// ------------------------------------------------

// Route chi tiết (Đặt cuối cùng)
router.get("/:id", optionalVerifyToken, courseController.getCourseById);

router.post("/", verifyToken, upload.single('thumbnail'), courseController.createCourse);

module.exports = router;