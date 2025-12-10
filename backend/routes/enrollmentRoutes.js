const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const jwt = require("jsonwebtoken");

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

router.post("/", verifyToken, enrollmentController.enrollCourse);
router.get("/", verifyToken, enrollmentController.getMyEnrollments);

module.exports = router;