const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,

  // ⭐ FIX LỖI AUTH PLUGIN
  authPlugins: {
    mysql_native_password: () => () => Buffer.from(process.env.DB_PASSWORD)
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test kết nối
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL connected successfully to", process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
})();

module.exports = pool;
