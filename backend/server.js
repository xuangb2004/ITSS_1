const dotenv = require("dotenv");
dotenv.config(); // MUST BE THE FIRST THING

const express = require("express");
const cors = require("cors");
const path = require("path");
// remove connectDB line if it exists, since we use the pool in controller directly

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/forum", require("./routes/forumRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});