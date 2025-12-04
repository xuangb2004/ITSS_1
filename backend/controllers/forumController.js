const db = require("../config/db");

// 1. Lấy danh sách chủ đề (Topics) 
exports.getTopics = async (req, res) => {
  try {
    // Sửa câu truy vấn: Chỉ lấy các topic có course_id LÀ NULL
    const sql = `
      SELECT t.*, u.name as author_name, 
      (SELECT COUNT(*) FROM forum_posts p WHERE p.topic_id = t.topic_id) as reply_count
      FROM forum_topics t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.course_id IS NULL
      ORDER BY t.created_at DESC
    `;
    const [topics] = await db.query(sql);
    res.json(topics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 2. Tạo chủ đề mới (Kèm file đính kèm)
exports.createTopic = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;
    
    // Lấy đường dẫn file nếu có
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      // Insert Topic
      const [topicRes] = await conn.query(
        "INSERT INTO forum_topics (course_id, user_id, title) VALUES (NULL, ?, ?)",
        [userId, title]
      );
      const topicId = topicRes.insertId;

      // Insert Post đầu tiên (kèm attachment_url)
      await conn.query(
        "INSERT INTO forum_posts (topic_id, user_id, content, attachment_url) VALUES (?, ?, ?, ?)",
        [topicId, userId, content, attachmentUrl]
      );

      await conn.commit();
      res.status(201).json({ message: "Tạo chủ đề thành công", topicId });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 3. Lấy chi tiết chủ đề và các bài trả lời
exports.getTopicDetails = async (req, res) => {
  try {
    const { topicId } = req.params;
    const currentUserId = req.user ? req.user.userId : 0;

    // Lấy thông tin Topic
    const [topics] = await db.query(
      "SELECT t.*, u.name as author_name FROM forum_topics t JOIN users u ON t.user_id = u.user_id WHERE t.topic_id = ?",
      [topicId]
    );
    if (topics.length === 0) return res.status(404).json({ message: "Chủ đề không tồn tại" });

    // Lấy danh sách bài viết (Posts/Replies) kèm trạng thái Like
    const sqlPosts = `
      SELECT p.*, u.name as author_name,
      (SELECT COUNT(*) FROM forum_post_likes l WHERE l.post_id = p.post_id) as like_count,
      (SELECT COUNT(*) FROM forum_post_likes l WHERE l.post_id = p.post_id AND l.user_id = ?) as is_liked
      FROM forum_posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.topic_id = ?
      ORDER BY p.created_at ASC
    `;
    const [posts] = await db.query(sqlPosts, [currentUserId, topicId]);

    res.json({ topic: topics[0], posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 4. Trả lời (Kèm file đính kèm + TẠO THÔNG BÁO)
exports.replyToTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId; // Người đang trả lời
    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // 1. Lưu câu trả lời (Post)
    await db.query(
      "INSERT INTO forum_posts (topic_id, user_id, content, attachment_url) VALUES (?, ?, ?, ?)",
      [topicId, userId, content, attachmentUrl]
    );

    // 2. LOGIC TẠO THÔNG BÁO
    // Lấy thông tin chủ topic
    const [topics] = await db.query("SELECT user_id, title FROM forum_topics WHERE topic_id = ?", [topicId]);
    
    if (topics.length > 0) {
      const ownerId = topics[0].user_id;
      const topicTitle = topics[0].title;

      // Chỉ tạo thông báo nếu người trả lời KHÔNG PHẢI là chủ topic
      if (ownerId != userId) {
        // Lấy tên người vừa trả lời để thông báo chi tiết hơn
        const [replier] = await db.query("SELECT name FROM users WHERE user_id = ?", [userId]);
        const replierName = replier[0].name || "Ai đó";

        const notifTitle = "新しい返信があります"; // "Có phản hồi mới"
        const notifMessage = `${replierName} さんがあなたのトピック「${topicTitle}」に返信しました。`; // "A đã trả lời bài viết B của bạn"

        await db.query(
          "INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)",
          [ownerId, notifTitle, notifMessage]
        );
      }
    }

    res.status(201).json({ message: "Đã gửi trả lời" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 5. Thích bài viết (Like)
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Kiểm tra đã like chưa
    const [check] = await db.query(
      "SELECT * FROM forum_post_likes WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    if (check.length > 0) {
      // Unlike
      await db.query("DELETE FROM forum_post_likes WHERE user_id = ? AND post_id = ?", [userId, postId]);
      res.json({ message: "Unliked", status: false });
    } else {
      // Like
      await db.query("INSERT INTO forum_post_likes (user_id, post_id) VALUES (?, ?)", [userId, postId]);
      res.json({ message: "Liked", status: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// 6. Xóa chủ đề (Chỉ người tạo mới được xóa)
exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.userId;

    // Kiểm tra quyền sở hữu
    const [topics] = await db.query("SELECT user_id FROM forum_topics WHERE topic_id = ?", [topicId]);
    
    if (topics.length === 0) return res.status(404).json({ message: "Chủ đề không tồn tại" });
    if (topics[0].user_id !== userId) return res.status(403).json({ message: "Bạn không có quyền xóa bài này" });

    // Xóa topic (Các post con sẽ tự động bị xóa nhờ ON DELETE CASCADE trong SQL)
    await db.query("DELETE FROM forum_topics WHERE topic_id = ?", [topicId]);

    res.json({ message: "Đã xóa chủ đề" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// 7. Xóa câu trả lời (Chỉ người viết mới được xóa)
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Kiểm tra quyền sở hữu
    const [posts] = await db.query("SELECT user_id FROM forum_posts WHERE post_id = ?", [postId]);

    if (posts.length === 0) return res.status(404).json({ message: "Bài viết không tồn tại" });
    if (posts[0].user_id !== userId) return res.status(403).json({ message: "Bạn không có quyền xóa bài này" });

    await db.query("DELETE FROM forum_posts WHERE post_id = ?", [postId]);

    res.json({ message: "Đã xóa câu trả lời" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};