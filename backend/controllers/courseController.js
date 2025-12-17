const db = require("../config/db");

// Lấy tất cả khóa học
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

// Lấy chi tiết khóa học (Bao gồm cả bài học - Curriculum)
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Lấy thông tin cơ bản
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

    // 2. Lấy danh sách bài học (Lessons)
    const lessonsSql = `SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC`;
    const [lessons] = await db.query(lessonsSql, [id]);

    // Gán danh sách bài học vào object course
    course.curriculum = lessons;

    res.json({ course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tạo khóa học mới (Có xử lý thêm bài học)
exports.createCourse = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { title, description, price, category_id, level, lessons } = req.body;
    const userId = req.user.userId;
    let thumbnail = null;

    if (req.file) {
      thumbnail = `/uploads/${req.file.filename}`;
    }

    // 1. Lấy instructor_id
    const [instructors] = await connection.query("SELECT instructor_id FROM instructors WHERE user_id = ?", [userId]);
    if (instructors.length === 0) {
      await connection.release();
      return res.status(403).json({ message: "Bạn chưa đăng ký làm giảng viên" });
    }
    const instructorId = instructors[0].instructor_id;

    // 2. Insert Course
    const [courseResult] = await connection.query(
      `INSERT INTO courses (title, description, price, thumbnail, instructor_id, category_id, level, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, price || 0, thumbnail, instructorId, category_id || 1, level || 'Beginner']
    );
    const newCourseId = courseResult.insertId;

    // 3. Insert Lessons (Nếu có)
    if (lessons) {
      // Vì gửi qua FormData, lessons có thể là chuỗi JSON, cần parse ra
      let parsedLessons = [];
      try {
        parsedLessons = typeof lessons === 'string' ? JSON.parse(lessons) : lessons;
      } catch (e) {
        parsedLessons = [];
      }

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

// Các hàm khác giữ nguyên (chỉ cần export nếu file cũ có)
exports.getRecommendedCourses = async (req, res) => {
    // ... logic cũ hoặc query đơn giản
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
    // Logic search đã làm ở bước trước, giữ nguyên hoặc import từ file cũ
    res.json({ results: [] }); 
};