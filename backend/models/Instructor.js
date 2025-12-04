const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bio: {
      type: String,
    },
    expertise: [{
      type: String,
    }],
    studio: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Instructor", instructorSchema);

