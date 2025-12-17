const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware"); // Middleware upload ảnh bạn đã có
const jwt = require("jsonwebtoken");

// Middleware xác thực JWT (dùng lại logic verify)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  const JWT_SECRET = process.env.JWT_SECRET || "bi_mat_khong_the_bat_mi"; // Đảm bảo khớp .env
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// GET /api/user/profile - Xem hồ sơ
router.get("/profile", verifyToken, userController.getProfile);

// PUT /api/user/profile - Cập nhật hồ sơ (có upload ảnh)
// 'avatar' là tên field trong FormData ở frontend
router.put("/profile", verifyToken, upload.single('avatar'), userController.updateProfile);

module.exports = router;