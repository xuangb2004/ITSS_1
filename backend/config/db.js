const mysql = require("mysql2");
require("dotenv").config();

// Cấu hình Pool kết nối
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  
  // 👇 THÊM DÒNG NÀY ĐỂ BẬT SSL (Sửa lỗi ETIMEDOUT trên Cloud)
  ssl: {
    rejectUnauthorized: false
  },

  // 👇 GIỮ NGUYÊN DÒNG NÀY ĐỂ SỬA LỖI PLUGIN PASSWORD
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0')
  },
  enableKeepAlive: true,
});

const promisePool = pool.promise();

// Test kết nối ngay khi khởi động
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Lỗi kết nối Database:", err.message);
    console.error("👉 Kiểm tra lại DB_HOST xem có thừa http:// hay port không?");
  } else {
    console.log("✅ Đã kết nối Database thành công!");
    connection.release();
  }
});

module.exports = promisePool;