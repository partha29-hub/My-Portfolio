
const express = require("express");
const mongoose = require("mongoose");
const Education = require("../models/Education");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public: list education records
router.get("/", async (req, res) => {
  try {
    const education = await Education.find().sort({ createdAt: -1 });

    res.json({ success: true, education });
  } catch (error) {
    console.error("Fetch education error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch education records."
    });
  }
});

// Admin: add education
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
  degree,
  specialization,
  institution,
  duration,
  description,
  grade
} = req.body;

    if (!degree?.trim() || !institution?.trim() || !duration?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Degree, institution and duration are required."
      });
    }

    const record = await Education.create({
  degree: degree.trim(),
  specialization: specialization?.trim() || "",
  institution: institution.trim(),
  duration: duration.trim(),
  description: description || "",
  grade: grade || ""
});

    res.status(201).json({
      success: true,
      message: "Education added successfully.",
      education: record
    });
  } catch (error) {
    console.error("Create education error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add education."
    });
  }
});

// Admin: update education
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid education ID."
      });
    }

    const record = await Education.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Education record not found."
      });
    }

    res.json({
      success: true,
      message: "Education updated successfully.",
      education: record
    });
  } catch (error) {
    console.error("Update education error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to update education."
    });
  }
});

// Admin: delete education
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid education ID."
      });
    }

    const record = await Education.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Education record not found."
      });
    }

    res.json({
      success: true,
      message: "Education deleted successfully."
    });
  } catch (error) {
    console.error("Delete education error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete education."
    });
  }
});

module.exports = router;
