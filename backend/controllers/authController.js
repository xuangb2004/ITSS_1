const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng ký Học viên
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email này đã được đăng ký" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'student')",
      [name, email, hashedPassword]
    );

    return res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

// Đăng nhập (Chung cho cả 2)
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const user = users[0];

    // Lưu ý: Sửa lại tên cột password cho khớp database của bạn (password_hash hoặc password)
    // Trong file seedData.sql bạn dùng 'password_hash', nhưng code cũ có lúc dùng 'password'
    // Ở đây tôi dùng 'password_hash' theo hàm signup bên trên
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET || "secret", 
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

// 👇 HÀM MỚI: Đăng ký Giảng viên 👇
exports.instructorSignup = async (req, res) => {
  const { name, email, password, bio, expertise } = req.body;

  if (!name || !email || !password || !bio || !expertise) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }

  const connection = await db.getConnection(); // Dùng transaction

  try {
    await connection.beginTransaction();

    // 1. Kiểm tra email
    const [existing] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      await connection.release();
      return res.status(400).json({ message: "Email này đã được sử dụng" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo User (role='instructor')
    // Lưu ý: DB của bạn dùng cột 'password_hash'
    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'instructor')",
      [name, email, hashedPassword]
    );
    const newUserId = userResult.insertId;

    // 4. Tạo Instructor Profile
    await connection.query(
      "INSERT INTO instructors (user_id, bio, expertise) VALUES (?, ?, ?)",
      [newUserId, bio, expertise]
    );

    await connection.commit();

    // 5. Tạo Token đăng nhập luôn
    const token = jwt.sign(
      { userId: newUserId, role: 'instructor' }, 
      process.env.JWT_SECRET || "secret", 
      { expiresIn: "1d" }
    );

    res.status(201).json({ 
      message: "Đăng ký giảng viên thành công", 
      token,
      user: { id: newUserId, name, email, role: 'instructor' }
    });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    connection.release();
  }
};