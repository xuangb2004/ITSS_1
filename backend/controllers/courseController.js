const db = require("../config/db");

// --- HÀM HELPER: Tính % tiến độ ---
const calculateCourseProgress = async (userId, courseId) => {
    const [totalRows] = await db.query("SELECT COUNT(*) as total FROM lessons WHERE course_id = ?", [courseId]);
    const totalLessons = totalRows[0].total;
    if (totalLessons === 0) return 0;

    const sqlCount = `
        SELECT COUNT(*) as completed FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.lesson_id
        WHERE lp.user_id = ? AND l.course_id = ? AND lp.is_completed = 1
    `;
    const [completedRows] = await db.query(sqlCount, [userId, courseId]);
    return Math.round((completedRows[0].completed / totalLessons) * 100);
};

// --- 1. Lấy tất cả khóa học ---
exports.getAllCourses = async (req, res) => {
  try {
    // Nhận category_id từ đường dẫn (nếu có)
    const { category_id } = req.query;

    let sql = `
      SELECT c.*, u.name as instructor_name, cat.name as category_name 
      FROM courses c 
      LEFT JOIN users u ON c.instructor_id = u.user_id 
      LEFT JOIN categories cat ON c.category_id = cat.category_id
    `;
    
    const params = [];

    // Nếu có category_id thì thêm điều kiện WHERE
    if (category_id && category_id !== 'all') {
      sql += ` WHERE c.category_id = ?`;
      params.push(category_id);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const [courses] = await db.query(sql, params);

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

// --- 2. Khóa học đề xuất ---
exports.getRecommendedCourses = async (req, res) => {
    const sql = `
        SELECT c.*, u.name as instructor_name,
               CAST(COALESCE(AVG(r.rating), 0) AS DECIMAL(2,1)) as average_rating,
               COUNT(r.review_id) as review_count
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
        LEFT JOIN users u ON i.user_id = u.user_id
        LEFT JOIN reviews r ON c.course_id = r.course_id
        GROUP BY c.course_id
        ORDER BY RAND() LIMIT 4
    `;
    const [courses] = await db.query(sql);
    res.json({ courses });
};

// --- 3. Khóa học nổi bật ---
exports.getTrendingCourses = async (req, res) => {
    const sql = `
        SELECT c.*, u.name as instructor_name,
               CAST(COALESCE(AVG(r.rating), 0) AS DECIMAL(2,1)) as average_rating,
               COUNT(r.review_id) as review_count
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
        LEFT JOIN users u ON i.user_id = u.user_id
        LEFT JOIN reviews r ON c.course_id = r.course_id
        GROUP BY c.course_id
        ORDER BY c.created_at DESC LIMIT 4
    `;
    const [courses] = await db.query(sql);
    res.json({ courses });
};

// --- 4. Tìm kiếm khóa học ---
exports.searchCourses = async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) return res.json({ results: [] });
        const sql = `
            SELECT c.*, u.name as instructor_name,
                   CAST(COALESCE(AVG(r.rating), 0) AS DECIMAL(2,1)) as average_rating,
                   COUNT(r.review_id) as review_count
            FROM courses c
            LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
            LEFT JOIN users u ON i.user_id = u.user_id
            LEFT JOIN reviews r ON c.course_id = r.course_id
            WHERE c.title LIKE ? OR c.description LIKE ?
            GROUP BY c.course_id
        `;
        const [results] = await db.query(sql, [`%${search}%`, `%${search}%`]);
        res.json({ results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi tìm kiếm" });
    }
};

// --- 5. Lấy khóa học của giảng viên ---
exports.getInstructorCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [instructors] = await db.query("SELECT instructor_id FROM instructors WHERE user_id = ?", [userId]);
    if (instructors.length === 0) {
      return res.status(403).json({ message: "Bạn không phải là giảng viên" });
    }
    const instructorId = instructors[0].instructor_id;

    const sql = `
      SELECT c.*, 
      (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) as student_count,
      CAST(COALESCE(AVG(r.rating), 0) AS DECIMAL(2,1)) as average_rating,
      COUNT(r.review_id) as review_count
      FROM courses c
      LEFT JOIN reviews r ON c.course_id = r.course_id
      WHERE c.instructor_id = ?
      GROUP BY c.course_id
      ORDER BY c.created_at DESC
    `;
    const [courses] = await db.query(sql, [instructorId]);

    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 6. Lấy chi tiết khóa học ---
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.userId : 0;

    const courseSql = `
      SELECT c.*, u.name as instructor_name, u.avatar_url as instructor_avatar, i.bio, i.expertise,
             CAST(COALESCE(AVG(r.rating), 0) AS DECIMAL(2,1)) as average_rating,
             COUNT(r.review_id) as review_count
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
      LEFT JOIN users u ON i.user_id = u.user_id
      LEFT JOIN reviews r ON c.course_id = r.course_id
      WHERE c.course_id = ?
      GROUP BY c.course_id
    `;
    const [courses] = await db.query(courseSql, [id]);

    if (courses.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    const course = courses[0];

    const lessonsSql = `SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC`;
    const [lessons] = await db.query(lessonsSql, [id]);
    course.curriculum = lessons;

    let progress = 0;
    let completedLessonIds = [];
    let isEnrolled = false;
    
    if (userId) {
        const [enrollmentCheck] = await db.query(
            "SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", 
            [userId, id]
        );
        if (enrollmentCheck.length > 0 || String(course.instructor_id) === String(userId)) { 
             isEnrolled = true;
        }

        if (isEnrolled) {
            progress = await calculateCourseProgress(userId, id);
            const [completedRows] = await db.query(
                `SELECT lp.lesson_id FROM lesson_progress lp 
                 JOIN lessons l ON lp.lesson_id = l.lesson_id
                 WHERE lp.user_id = ? AND l.course_id = ? AND lp.is_completed = 1`, 
                [userId, id]
            );
            completedLessonIds = completedRows.map(r => r.lesson_id);
        }
    }

    res.json({ course, progress, completedMap: completedLessonIds, isEnrolled }); 
  } catch (err) {
    console.error("Lỗi getCourseById:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 7. Đánh dấu hoàn thành bài học (ĐÃ BỔ SUNG LẠI) ---
exports.markLessonComplete = async (req, res) => {
  try {
    const { lessonId, courseId } = req.body;
    const userId = req.user.userId;

    const sql = `
      INSERT INTO lesson_progress (user_id, lesson_id, is_completed, last_watched_at)
      VALUES (?, ?, 1, NOW())
      ON DUPLICATE KEY UPDATE is_completed = 1, last_watched_at = NOW()
    `;
    await db.query(sql, [userId, lessonId]);

    const progress = await calculateCourseProgress(userId, courseId);
    
    res.json({ message: "Đã cập nhật tiến độ", progress });
  } catch (err) {
    console.error("Lỗi markLessonComplete:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 8. Tạo khóa học ---
exports.createCourse = async (req, res) => {
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
            if (Array.isArray(parsedLessons)) {
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

// --- 9. Cập nhật khóa học ---
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, level } = req.body;
    const userId = req.user.userId;

    const checkSql = `SELECT c.course_id FROM courses c JOIN instructors i ON c.instructor_id = i.instructor_id WHERE c.course_id = ? AND i.user_id = ?`;
    const [check] = await db.query(checkSql, [id, userId]);
    if (check.length === 0) return res.status(403).json({ message: "Bạn không có quyền sửa khóa học này" });

    await db.query("UPDATE courses SET title = ?, description = ?, price = ?, level = ? WHERE course_id = ?", [title, description, price, level, id]);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 10. Xóa khóa học ---
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const checkSql = `SELECT c.course_id FROM courses c JOIN instructors i ON c.instructor_id = i.instructor_id WHERE c.course_id = ? AND i.user_id = ?`;
    const [check] = await db.query(checkSql, [id, userId]);
    if (check.length === 0) return res.status(403).json({ message: "Bạn không có quyền xóa khóa học này" });

    await db.query("DELETE FROM courses WHERE course_id = ?", [id]);
    res.json({ message: "Đã xóa khóa học" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// --- 11. Lấy đánh giá ---
exports.getCourseReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT r.*, u.name as user_name, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.user_id WHERE r.course_id = ? ORDER BY r.created_at DESC`;
    const [reviews] = await db.query(sql, [id]);
    res.json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy đánh giá" });
  }
};

// --- 12. Thêm đánh giá ---
exports.addCourseReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const [enrollment] = await db.query("SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?", [userId, id]);
    const [course] = await db.query("SELECT instructor_id FROM courses WHERE course_id = ?", [id]);
    
    // Check quyền: Phải mua rồi hoặc là giảng viên
    const isInstructor = course.length > 0 && 
       (await db.query("SELECT user_id FROM instructors WHERE instructor_id = ?", [course[0].instructor_id]))[0][0]?.user_id === userId;

    if (enrollment.length === 0 && !isInstructor) {
      return res.status(403).json({ message: "Bạn phải đăng ký khóa học mới được bình luận." });
    }

    await db.query("INSERT INTO reviews (user_id, course_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())", [userId, id, rating || 5, comment]);
    res.json({ message: "Đã gửi đánh giá!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};