
const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "Other",
      trim: true
    },
    type: {
      type: String,
      enum: ["category", "technical", "tool"],
      default: "category"
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    level: {
      type: String,
      default: "Intermediate",
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"]
    },
    icon: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Skill", skillSchema);
