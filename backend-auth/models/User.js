const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true, // không cho trùng email
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // tự động lưu createdAt, updatedAt
);

module.exports = mongoose.model("User", userSchema);
