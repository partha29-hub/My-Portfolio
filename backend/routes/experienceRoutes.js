
const express = require("express");
const mongoose = require("mongoose");
const Experience = require("../models/Experience");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public: fetch experience records
router.get("/", async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });

    res.json({ success: true, experiences });
  } catch (error) {
    console.error("Fetch experiences error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch experience records."
    });
  }
});

// Admin only: add experience
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { role, company, duration, description, technologies, icon } = req.body;

    if (
      !role?.trim() ||
      !company?.trim() ||
      !duration?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Role, company, duration and description are required."
      });
    }

    const experience = await Experience.create({
      role: role.trim(),
      company: company.trim(),
      duration: duration.trim(),
      description: description.trim(),
      technologies: Array.isArray(technologies)
        ? technologies.filter(item => typeof item === "string").map(item => item.trim()).filter(Boolean)
        : [],
      icon: typeof icon === "string" ? icon.trim() : "code"
    });

    res.status(201).json({
      success: true,
      message: "Experience added successfully.",
      experience
    });
  } catch (error) {
    console.error("Create experience error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to add experience."
    });
  }
});

// Admin only: edit experience
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID."
      });
    }

    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found."
      });
    }

    res.json({
      success: true,
      message: "Experience updated successfully.",
      experience
    });
  } catch (error) {
    console.error("Update experience error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to update experience."
    });
  }
});

// Admin only: delete experience
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID."
      });
    }

    const experience = await Experience.findByIdAndDelete(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found."
      });
    }

    res.json({
      success: true,
      message: "Experience deleted successfully."
    });
  } catch (error) {
    console.error("Delete experience error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete experience."
    });
  }
});

module.exports = router;
