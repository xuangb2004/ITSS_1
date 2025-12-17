const db = require("../config/db");

// Lấy thông tin profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Chỉ lấy các trường an toàn, không lấy password
    const sql = "SELECT user_id, name, email, role, avatar, bio, created_at FROM users WHERE user_id = ?";
    const [rows] = await db.query(sql, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Cập nhật thông tin profile (Tên, Bio, Avatar)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, bio } = req.body;
    let avatarPath = null;

    // Nếu có file ảnh được upload
    if (req.file) {
      // Đường dẫn ảnh để lưu vào DB (ví dụ: /uploads/filename.jpg)
      avatarPath = `/uploads/${req.file.filename}`;
    }

    // Xây dựng câu query động (chỉ update trường nào có dữ liệu)
    let sql = "UPDATE users SET name = ?, bio = ?";
    const params = [name, bio];

    if (avatarPath) {
      sql += ", avatar = ?";
      params.push(avatarPath);
    }

    sql += " WHERE user_id = ?";
    params.push(userId);

    await db.query(sql, params);

    // Trả về thông tin mới nhất sau khi update
    const [updatedUser] = await db.query("SELECT user_id, name, email, role, avatar, bio FROM users WHERE user_id = ?", [userId]);

    res.json({ 
      message: "Cập nhật thành công", 
      user: updatedUser[0] 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};