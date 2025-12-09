const db = require("../config/db");

// Lấy tất cả khóa học (có phân trang & lọc)
exports.getAllCourses = async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    
    let sql = `
      SELECT c.*, i.bio as instructor_bio, u.name as instructor_name 
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.instructor_id
      JOIN users u ON i.user_id = u.user_id
      WHERE 1=1
    `;

    if (category) {
      // Giả sử category truyền vào là ID hoặc Name, ở đây demo theo text đơn giản
      // Trong thực tế bạn nên join bảng categories
      // sql += " AND c.category_id = ?"; 
      // params.push(category);
    }

    if (search) {
      sql += " AND (c.title LIKE ? OR c.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY c.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [courses] = await db.query(sql, params);
    
    // Đếm tổng để phân trang
    const [countResult] = await db.query("SELECT COUNT(*) as total FROM courses");
    const total = countResult[0].total;

    return res.json({
      courses,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy khóa học đề xuất (Giả lập lấy ngẫu nhiên hoặc theo tiêu chí)
exports.getRecommendedCourses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const sql = `
      SELECT c.*, u.name as instructor_name 
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.instructor_id
      JOIN users u ON i.user_id = u.user_id
      ORDER BY RAND() LIMIT ?
    `;
    const [courses] = await db.query(sql, [limit]);
    return res.json({ courses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy khóa học Trending (Dựa trên view course_popularity trong file SQL của bạn)
exports.getTrendingCourses = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    // Join với view popularity hoặc bảng enrollments
    const sql = `
        SELECT c.*, u.name as instructor_name, COUNT(e.enrollment_id) as enroll_count
        FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
        JOIN instructors i ON c.instructor_id = i.instructor_id
        JOIN users u ON i.user_id = u.user_id
        GROUP BY c.course_id
        ORDER BY enroll_count DESC
        LIMIT ?
    `;
    const [courses] = await db.query(sql, [limit]);
    return res.json({ courses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Tìm kiếm (Đã có route search riêng, nhưng nếu dùng function này)
exports.searchCourses = async (req, res) => {
    // Logic tương tự getAllCourses
};

// Chi tiết khóa học
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT c.*, u.name as instructor_name, i.bio, i.expertise
      FROM courses c
      JOIN instructors i ON c.instructor_id = i.instructor_id
      JOIN users u ON i.user_id = u.user_id
      WHERE c.course_id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    
    // Lấy thêm bài học (Lessons)
    const [lessons] = await db.query("SELECT * FROM lessons WHERE course_id = ? ORDER BY position ASC", [id]);

    return res.json({ course: { ...rows[0], curriculum: lessons } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};