const express = require("express");
const router = express.Router();
const { signup, signin } = require("../controllers/authController");

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/signin
router.post("/signin", signin);

module.exports = router;
