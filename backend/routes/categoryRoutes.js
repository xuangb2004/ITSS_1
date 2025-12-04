const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategoryBySlug,
} = require("../controllers/categoryController");

// GET /api/categories - Lấy tất cả danh mục
router.get("/", getAllCategories);

// GET /api/categories/:slug - Lấy danh mục theo slug
router.get("/:slug", getCategoryBySlug);

module.exports = router;

