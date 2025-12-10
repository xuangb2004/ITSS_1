const db = require("../config/db");

// Lấy giỏ hàng của User
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sql = `
      SELECT c.*, u.name as instructor_name 
      FROM cart ca
      JOIN courses c ON ca.course_id = c.course_id
      JOIN users u ON c.instructor_id = u.user_id /* Lưu ý: instructor_id trong courses trỏ tới bảng instructors, cần join tiếp nếu muốn chính xác, ở đây join tắt qua users cho nhanh nếu logic cho phép, hoặc sửa lại join instructors -> users */
      WHERE ca.user_id = ?
    `;
    // Query sửa lại cho chuẩn schema:
    const sqlCorrect = `
        SELECT c.*, ins_u.name as instructor_name
        FROM cart ca
        JOIN courses c ON ca.course_id = c.course_id
        LEFT JOIN instructors ins ON c.instructor_id = ins.instructor_id
        LEFT JOIN users ins_u ON ins.user_id = ins_u.user_id
        WHERE ca.user_id = ?
    `;
    
    const [items] = await db.query(sqlCorrect, [userId]);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Thêm vào giỏ
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.body;

    // Kiểm tra đã có chưa
    const [exists] = await db.query("SELECT * FROM cart WHERE user_id = ? AND course_id = ?", [userId, courseId]);
    if (exists.length > 0) {
      return res.status(400).json({ message: "Khóa học đã có trong giỏ hàng" });
    }

    // Kiểm tra đã mua chưa (đã enroll chưa)
    const [enrolled] = await db.query("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", [userId, courseId]);
    if (enrolled.length > 0) {
      return res.status(400).json({ message: "Bạn đã sở hữu khóa học này rồi" });
    }

    await db.query("INSERT INTO cart (user_id, course_id) VALUES (?, ?)", [userId, courseId]);
    res.json({ message: "Đã thêm vào giỏ hàng" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Xóa khỏi giỏ
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.params;
    await db.query("DELETE FROM cart WHERE user_id = ? AND course_id = ?", [userId, courseId]);
    res.json({ message: "Đã xóa khỏi giỏ" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};