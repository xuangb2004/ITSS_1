const express = require("express");
const router = express.Router();
const notifController = require("../controllers/notificationController");
const jwt = require("jsonwebtoken");

// Middleware xác thực (Copy lại từ forumRoutes hoặc tách ra file riêng thì tốt hơn)
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

router.get("/", verifyToken, notifController.getMyNotifications);
router.put("/:notifId/read", verifyToken, notifController.markAsRead);

module.exports = router;