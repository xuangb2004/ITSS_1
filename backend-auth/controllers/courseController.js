const Course = require("../models/Course");
const Instructor = require("../models/Instructor");

// Lấy tất cả khóa học (có thể filter)
exports.getAllCourses = async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const courses = await Course.find(query)
      .populate("instructor_id", "studio")
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await Course.countDocuments(query);
    
    return res.json({
      courses,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy khóa học được đề xuất
exports.getRecommendedCourses = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    const courses = await Course.find({ isRecommended: true })
      .populate("instructor_id", "studio")
      .limit(parseInt(limit))
      .sort({ rating: -1, reviewCount: -1 });
    
    return res.json({ courses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy khóa học trending
exports.getTrendingCourses = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    const courses = await Course.find({ isTrending: true })
      .populate("instructor_id", "studio")
      .limit(parseInt(limit))
      .sort({ rating: -1, reviewCount: -1 });
    
    return res.json({ courses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Tìm kiếm khóa học
exports.searchCourses = async (req, res) => {
  try {
    const { q, category, limit = 20, page = 1 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
    }
    
    const query = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
    };
    
    if (category) {
      query.category = category;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const courses = await Course.find(query)
      .populate("instructor_id", "studio")
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ rating: -1 });
    
    const total = await Course.countDocuments(query);
    
    return res.json({
      courses,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy chi tiết một khóa học
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findById(id)
      .populate("instructor_id");
    
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    
    return res.json({ course });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

