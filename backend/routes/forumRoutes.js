const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const jwt = require("jsonwebtoken");

// Import middleware upload vừa tạo
const upload = require("../middleware/uploadMiddleware");

// --- Middleware xác thực ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  const JWT_SECRET = process.env.JWT_SECRET || "bi_mat_khong_the_bat_mi_123456";
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Các Routes ---

router.get("/topics", forumController.getTopics); 
router.get("/topic/:topicId", verifyToken, forumController.getTopicDetails); 
router.get("/search", forumController.searchForum);
router.get('/categories', forumController.getCategories);
// QUAN TRỌNG: Thêm 'upload.single("attachment")' vào route này
router.post("/topic", verifyToken, upload.single("attachment"), forumController.createTopic); 

// VÀ route này nữa
router.post("/topic/:topicId/reply", verifyToken, upload.single("attachment"), forumController.replyToTopic); 

router.post("/post/:postId/like", verifyToken, forumController.toggleLike); 
router.delete("/topic/:topicId", verifyToken, forumController.deleteTopic);
router.delete("/post/:postId", verifyToken, forumController.deletePost);

module.exports = router;