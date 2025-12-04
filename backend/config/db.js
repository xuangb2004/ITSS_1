const mysql = require("mysql2/promise");
require("dotenv").config();

// Tạo pool kết nối với thông tin từ file .env 
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,      // Đã sửa thành DB_USERNAME
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_DATABASE,  // Đã sửa thành DB_DATABASE
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối khi khởi động
pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL connected successfully to " + process.env.DB_DATABASE);
    conn.release();
  })
  .catch(err => {
    console.error("❌ MySQL connection failed:", err.message);
  });

module.exports = pool;