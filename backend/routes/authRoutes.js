const express = require("express");
const router = express.Router();
// Dòng này quan trọng: Import toàn bộ object authController
const authController = require("../controllers/authController"); 

// POST /api/auth/signup (Học viên)
router.post("/signup", authController.signup);

// POST /api/auth/signin (Chung)
router.post("/signin", authController.signin);

// POST /api/auth/instructor/signup (Giảng viên)
router.post("/instructor/signup", authController.instructorSignup);

module.exports = router;