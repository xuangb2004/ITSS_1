const dotenv = require("dotenv");
dotenv.config(); 

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db"); // Import để đảm bảo DB kết nối

const http = require("http");
const { Server } = require("socket.io");

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

// Create HTTP server and attach Socket.IO
const PORT = process.env.PORT || 5001;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Simple logging
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_user_room', (userId) => {
    // client can join a room named by userId to receive personal notifications
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    // console.log('Socket disconnected', socket.id);
  });
});

// Expose io via a small module setter so controllers can emit
require('./utils/notificationEmitter').setIO(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});