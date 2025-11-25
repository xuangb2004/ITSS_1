const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Đăng ký (Sign Up)
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu nhập lại không khớp" });
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // 3. Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo user mới
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Đăng nhập (Sign In)
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra dữ liệu
    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    // 2. Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // 3. So sánh mật khẩu nhập vào với mật khẩu đã mã hoá
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    // 4. Tạo JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // hết hạn sau 1 ngày
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
