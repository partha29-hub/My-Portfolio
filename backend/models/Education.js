
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
  type: String,
  default: ""
},
    institution: {
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
      default: "",
      trim: true
    },
    grade: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
  
);

module.exports = mongoose.model("Education", educationSchema);
