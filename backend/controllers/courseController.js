const db = require("../config/db");

// --- HÀM HELPER: Tính % tiến độ ---
const calculateCourseProgress = async (userId, courseId) => {
    // 1. Đếm tổng số bài học
    const [totalRows] = await db.query("SELECT COUNT(*) as total FROM lessons WHERE course_id = ?", [courseId]);
    const totalLessons = totalRows[0].total;
    if (totalLessons === 0) return 0;

    // 2. Đếm số bài đã học
    const sqlCount = `
        SELECT COUNT(*) as completed FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.lesson_id
        WHERE lp.user_id = ? AND l.course_id = ? AND lp.is_completed = 1
    `;
    const [completedRows] = await db.query(sqlCount, [userId, courseId]);
    
    // 3. Tính %
    return Math.round((completedRows[0].completed / totalLessons) * 100);
};

// --- API 1: Lấy chi tiết khóa học (ĐÃ SỬA LỖI SQL) ---
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : 0;

    // 1. Lấy thông tin cơ bản (Câu lệnh SQL đầy đủ)
    const courseSql = `
      SELECT c.*, u.name as instructor_name, u.avatar_url as instructor_avatar, i.bio, i.expertise
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
      LEFT JOIN users u ON i.user_id = u.user_id
      WHERE c.course_id = ?
    `;
    const [courses] = await db.query(courseSql, [id]);

    if (courses.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    const course = courses[0];

    // 2. Lấy danh sách bài học
    const lessonsSql = `SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC`;
    const [lessons] = await db.query(lessonsSql, [id]);
    course.curriculum = lessons;

    // 3. Lấy tiến độ (Nếu user đã đăng nhập)
    let progress = 0;
    let completedLessonIds = [];
    
    if (userId) {
        progress = await calculateCourseProgress(userId, id);
        
        // Lấy danh sách ID các bài đã học để hiện tick xanh
        const [completedRows] = await db.query(
            `SELECT lp.lesson_id FROM lesson_progress lp 
             JOIN lessons l ON lp.lesson_id = l.lesson_id
             WHERE lp.user_id = ? AND l.course_id = ? AND lp.is_completed = 1`, 
            [userId, id]
        );
        completedLessonIds = completedRows.map(r => r.lesson_id);
    }

    res.json({ course, progress, completedMap: completedLessonIds }); 
  } catch (err) {
    console.error("Lỗi getCourseById:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// --- API 2: Đánh dấu hoàn thành bài học ---
exports.markLessonComplete = async (req, res) => {
  try {
    const { lessonId, courseId } = req.body;
    const userId = req.user.userId;

    // Lưu vào DB (ON DUPLICATE KEY UPDATE để tránh lỗi trùng lặp)
    const sql = `
      INSERT INTO lesson_progress (user_id, lesson_id, is_completed, last_watched_at)
      VALUES (?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE is_completed = 1, last_watched_at = NOW()
    `;
    await db.query(sql, [userId, lessonId]);

    // Tính lại % mới trả về cho Frontend
    const progress = await calculateCourseProgress(userId, courseId);
    
    res.json({ message: "Đã cập nhật tiến độ", progress });
  } catch (err) {
    console.error("Lỗi markLessonComplete:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// --- CÁC HÀM KHÁC (GIỮ NGUYÊN) ---
exports.getAllCourses = async (req, res) => {
  try {
    const sql = `
      SELECT c.*, u.name as instructor_name, cat.name as category_name
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
      LEFT JOIN users u ON i.user_id = u.user_id
      LEFT JOIN categories cat ON c.category_id = cat.category_id
      ORDER BY c.created_at DESC
    `;
    const [courses] = await db.query(sql);
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.createCourse = async (req, res) => {
    // ... (Code cũ của bạn, giữ nguyên nếu không lỗi) ...
    // Để ngắn gọn, bạn hãy giữ nguyên phần logic createCourse cũ ở đây
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { title, description, price, category_id, level, lessons } = req.body;
        const userId = req.user.userId;
        let thumbnail = null;
        if (req.file) thumbnail = `/uploads/${req.file.filename}`;

        const [instructors] = await connection.query("SELECT instructor_id FROM instructors WHERE user_id = ?", [userId]);
        if (instructors.length === 0) {
        await connection.release();
        return res.status(403).json({ message: "Bạn chưa đăng ký làm giảng viên" });
        }
        const instructorId = instructors[0].instructor_id;

        const [courseResult] = await connection.query(
        `INSERT INTO courses (title, description, price, thumbnail, instructor_id, category_id, level, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [title, description, price || 0, thumbnail, instructorId, category_id || 1, level || 'Beginner']
        );
        const newCourseId = courseResult.insertId;

        if (lessons) {
        let parsedLessons = [];
        try { parsedLessons = typeof lessons === 'string' ? JSON.parse(lessons) : lessons; } catch (e) { parsedLessons = []; }
        if (Array.isArray(parsedLessons) && parsedLessons.length > 0) {
            for (let i = 0; i < parsedLessons.length; i++) {
            const lesson = parsedLessons[i];
            await connection.query(
                `INSERT INTO lessons (course_id, title, video_url, position) VALUES (?, ?, ?, ?)`,
                [newCourseId, lesson.title, lesson.video_url, i + 1]
            );
            }
        }
        }
        await connection.commit();
        res.status(201).json({ message: "Tạo khóa học thành công!", courseId: newCourseId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: "Lỗi server khi tạo khóa học" });
    } finally {
        connection.release();
    }
};

exports.getRecommendedCourses = async (req, res) => {
    const sql = `SELECT * FROM courses ORDER BY RAND() LIMIT 4`;
    const [courses] = await db.query(sql);
    res.json({ courses });
};

exports.getTrendingCourses = async (req, res) => {
    const sql = `SELECT * FROM courses ORDER BY created_at DESC LIMIT 4`;
    const [courses] = await db.query(sql);
    res.json({ courses });
};

exports.searchCourses = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) return res.json({ results: [] });
        const sql = `SELECT * FROM courses WHERE title LIKE ? OR description LIKE ?`;
        const [results] = await db.query(sql, [`%${search}%`, `%${search}%`]);
        res.json({ results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi tìm kiếm" });
    }
};
exports.getInstructorCourses = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Tìm instructor_id từ user_id
    const [instructors] = await db.query("SELECT instructor_id FROM instructors WHERE user_id = ?", [userId]);
    if (instructors.length === 0) {
      return res.status(403).json({ message: "Bạn không phải là giảng viên" });
    }
    const instructorId = instructors[0].instructor_id;

    // Query lấy khóa học + đếm số học viên (student_count) + số lượt xem (views)
    const sql = `
      SELECT c.*, 
      (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) as student_count
      FROM courses c
      WHERE c.instructor_id = ?
      ORDER BY c.created_at DESC
    `;
    const [courses] = await db.query(sql, [instructorId]);

    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//  Cập nhật khóa học
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, level } = req.body;
    const userId = req.user.userId;

    // Kiểm tra quyền sở hữu (Phải join bảng để chắc chắn user này là chủ khóa học)
    const checkSql = `
      SELECT c.course_id FROM courses c
      JOIN instructors i ON c.instructor_id = i.instructor_id
      WHERE c.course_id = ? AND i.user_id = ?
    `;
    const [check] = await db.query(checkSql, [id, userId]);
    if (check.length === 0) return res.status(403).json({ message: "Bạn không có quyền sửa khóa học này" });

    // Update
    await db.query(
      "UPDATE courses SET title = ?, description = ?, price = ?, level = ? WHERE course_id = ?",
      [title, description, price, level, id]
    );

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

//  Xóa khóa học
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Kiểm tra quyền sở hữu
    const checkSql = `
      SELECT c.course_id FROM courses c
      JOIN instructors i ON c.instructor_id = i.instructor_id
      WHERE c.course_id = ? AND i.user_id = ?
    `;
    const [check] = await db.query(checkSql, [id, userId]);
    if (check.length === 0) return res.status(403).json({ message: "Bạn không có quyền xóa khóa học này" });

    // Xóa (Các bảng liên quan như lessons, enrollments sẽ tự xóa nếu có ON DELETE CASCADE trong DB)
    // Nếu DB chưa set Cascade, bạn phải xóa lessons trước. Ở đây giả định DB đã chuẩn.
    await db.query("DELETE FROM courses WHERE course_id = ?", [id]);

    res.json({ message: "Đã xóa khóa học" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};