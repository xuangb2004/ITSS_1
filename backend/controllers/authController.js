const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    // MySQL dùng ? thay vì $1
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email này đã được đăng ký" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // MySQL Insert
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

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    // MySQL Select
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET, 
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
exports.instructorSignup = async (req, res) => {
  const { name, email, password, bio, expertise } = req.body;

  if (!name || !email || !password || !bio || !expertise) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }

  const connection = await db.getConnection(); // Lấy connection để dùng transaction

  try {
    await connection.beginTransaction(); // Bắt đầu giao dịch

    // 1. Kiểm tra email tồn tại
    const [existing] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      await connection.release();
      return res.status(400).json({ message: "Email này đã được sử dụng" });
    }

    // 2. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo User với role = 'instructor'
    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'instructor')",
      [name, email, hashedPassword]
    );
    const newUserId = userResult.insertId;

    // 4. Tạo Instructor Profile (Bio & Expertise)
    await connection.query(
      "INSERT INTO instructors (user_id, bio, expertise) VALUES (?, ?, ?)",
      [newUserId, bio, expertise]
    );

    await connection.commit(); // Xác nhận giao dịch thành công

    // 5. Tạo Token để tự động đăng nhập luôn
    const token = jwt.sign({ userId: newUserId, role: 'instructor' }, process.env.JWT_SECRET || 'secret', {
      expiresIn: "24h",
    });

    res.status(201).json({ 
      message: "Đăng ký giảng viên thành công", 
      token,
      user: { id: newUserId, name, email, role: 'instructor', avatar: null }
    });

  } catch (err) {
    await connection.rollback(); // Nếu lỗi thì hoàn tác
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    connection.release(); // Trả kết nối về pool
  }
};