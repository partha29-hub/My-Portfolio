
const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    technologies: {
      type: [String],
      default: []
    },
    icon: {
      type: String,
      default: "code"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", experienceSchema);
