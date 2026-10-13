
const express = require("express");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public: show projects on portfolio
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    console.error("Fetch projects error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch projects."
    });
  }
});

// Admin only: add project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title, description, technologies,
      image, liveLink, githubLink, featured
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required."
      });
    }

    const project = await Project.create({
      title,
      description,
      technologies: Array.isArray(technologies) ? technologies : [],
      image,
      liveLink,
      githubLink,
      featured
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create project."
    });
  }
});

// Admin only: update project
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found."
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully.",
      project
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to update project. Check the project ID and fields."
    });
  }
});

// Admin only: delete project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found."
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully."
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to delete project. Check the project ID."
    });
  }
});

module.exports = router;
