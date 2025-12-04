const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    nameJa: {
      type: String, // Tên tiếng Nhật
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    subcategories: [{
      name: String,
      nameJa: String,
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);

