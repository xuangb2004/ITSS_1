const dotenv = require("dotenv");
dotenv.config(); 

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db"); // Import để đảm bảo DB kết nối

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- ĐĂNG KÝ ROUTES ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/forum", require("./routes/forumRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));

app.use("/api/search", require("./routes/searchRoutes"));

app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});