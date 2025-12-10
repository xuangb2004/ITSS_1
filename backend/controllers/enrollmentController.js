const db = require("../config/db");

// Đăng ký học (Mua khóa học)
exports.enrollCourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.body;

    // Kiểm tra đã mua chưa
    const [exists] = await db.query("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", [userId, courseId]);
    if (exists.length > 0) {
      return res.status(400).json({ message: "Bạn đã đăng ký khóa học này rồi" });
    }

    // Bắt đầu transaction (để đảm bảo tính toàn vẹn nếu có thanh toán)
    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      // 1. Thêm vào bảng enrollments
      await conn.query("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)", [userId, courseId]);

      // 2. Thêm vào bảng payments (Giả lập thanh toán thành công)
      // Lấy giá tiền
      const [course] = await conn.query("SELECT price FROM courses WHERE course_id = ?", [courseId]);
      const price = course[0] ? course[0].price : 0;
      
      await conn.query("INSERT INTO payments (user_id, course_id, amount) VALUES (?, ?, ?)", [userId, courseId, price]);

      // 3. Nếu đang có trong giỏ hàng thì xóa đi
      await conn.query("DELETE FROM cart WHERE user_id = ? AND course_id = ?", [userId, courseId]);

      await conn.commit();
      res.json({ message: "Đăng ký thành công! Chúc bạn học tốt." });
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
exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sql = `
      SELECT 
        c.course_id, c.title, c.thumbnail, c.description, c.level,
        e.progress, e.enrolled_at,
        u.name as instructor_name,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.course_id) as total_lessons,
        (SELECT COUNT(*) FROM lesson_progress lp 
         JOIN lessons l ON lp.lesson_id = l.lesson_id 
         WHERE l.course_id = c.course_id AND lp.user_id = ? AND lp.is_completed = TRUE
        ) as completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
      LEFT JOIN users u ON i.user_id = u.user_id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `;
    const [courses] = await db.query(sql, [userId, userId]);
    
    // Format dữ liệu để khớp với Frontend
    const formatted = courses.map(c => ({
      id: c.course_id,
      title: c.title,
      thumbnail: c.thumbnail,
      description: c.description,
      instructor: c.instructor_name || "Unknown",
      progress: c.total_lessons > 0 ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0,
      totalLessons: c.total_lessons,
      completedLessons: c.completed_lessons,
      status: (c.completed_lessons === c.total_lessons && c.total_lessons > 0) ? "completed" : "learning",
      lastAccess: c.enrolled_at // Tạm dùng ngày đăng ký làm lastAccess
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};