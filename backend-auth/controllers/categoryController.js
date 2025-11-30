const Category = require("../models/Category");

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json({ categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh mục theo slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    
    return res.json({ category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

