// backend-auth/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5001; // Đảm bảo PORT khớp với frontend (5001)
app.listen(PORT, () => {
  console.log(`🚀 Server chạy trên cổng ${PORT} (SQL Mode)`);
});