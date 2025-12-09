const db = require("../config/db");

exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query("SELECT * FROM categories ORDER BY name ASC");
    return res.json({ categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getCategoryBySlug = async (req, res) => {
    // Lưu ý: Bảng categories trong file SQL của bạn chưa có cột 'slug'.
    // Bạn nên thêm cột slug vào DB hoặc query theo ID/Name.
    // Tạm thời query theo name
    try {
        const { slug } = req.params; 
        // Giả sử slug chính là name
        const [rows] = await db.query("SELECT * FROM categories WHERE name = ?", [slug]);
        if (rows.length === 0) return res.status(404).json({ message: "Not found" });
        return res.json({ category: rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi server" });
    }
};