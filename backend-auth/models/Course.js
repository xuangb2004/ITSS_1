const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    instructor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    price: {
      type: Number,
      default: 0,
    },
    originalPrice: {
      type: Number,
    },
    thumbnail: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [{
      type: String,
    }],
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number, // hours
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);

