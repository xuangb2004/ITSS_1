const db = require("../config/db");

// Lấy danh sách thông báo của user
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sql = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
    const [notifs] = await db.query(sql, [userId]);
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { notifId } = req.params;
    const userId = req.user.userId;
    
    // Chỉ update nếu thông báo đó thuộc về user này
    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?",
      [notifId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};