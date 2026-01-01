const mysql = require("mysql2"); // Đảm bảo bạn đang dùng mysql2
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0')
  }
});

// Chuyển pool thành promise để dùng async/await
const promisePool = pool.promise();

// Test kết nối khi khởi động
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Lỗi kết nối Database:", err.message);
  } else {
    console.log("✅ Đã kết nối Database thành công!");
    connection.release();
  }
});

module.exports = promisePool;