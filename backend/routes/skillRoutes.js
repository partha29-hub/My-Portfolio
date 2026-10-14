
const express = require("express");
const Skill = require("../models/Skill");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET: Publicly fetch skills
router.get("/", async (req, res) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      skills
    });
  } catch (error) {
    console.error("Fetch skills error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch skills."
    });
  }
});

// POST: Add skill (admin only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    
const { name, category, level, icon, type, percentage } = req.body;

if (!name || !name.trim()) {
  return res.status(400).json({
    success: false,
    message: "Skill name is required."
  });
}

const validTypes = ["category", "technical", "tool"];
const selectedType = validTypes.includes(type) ? type : "category";

const parsedPercentage =
  percentage === "" || percentage === null || percentage === undefined
    ? null
    : Number(percentage);

if (
  selectedType === "technical" &&
  (parsedPercentage === null ||
    !Number.isFinite(parsedPercentage) ||
    parsedPercentage < 0 ||
    parsedPercentage > 100)
) {
  return res.status(400).json({
    success: false,
    message: "Technical skill percentage must be between 0 and 100."
  });
}

const skill = await Skill.create({
  name: name.trim(),
  category: category?.trim() || "Other",
  type: selectedType,
  percentage: selectedType === "technical" ? parsedPercentage : null,
  level,
  icon: icon?.trim() || ""
});

res.status(201).json({
  success: true,
  message: "Skill added successfully.",
  skill
});
  } catch (error) {
    console.error("Add skill error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to add skill."
    });
  }
});


router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body };

    const validTypes = ["category", "technical", "tool"];

    if (updates.type !== undefined && !validTypes.includes(updates.type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill type."
      });
    }

    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || !updates.name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Skill name is required."
        });
      }
      updates.name = updates.name.trim();
    }

    if (updates.category !== undefined) {
      updates.category = updates.category.trim() || "Other";
    }

    if (updates.icon !== undefined) {
      updates.icon = updates.icon.trim();
    }

    const existingSkill = await Skill.findById(req.params.id);

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found."
      });
    }

    const selectedType = updates.type ?? existingSkill.type;
    const percentageValue =
      updates.percentage !== undefined
        ? updates.percentage
        : existingSkill.percentage;

    if (selectedType === "technical") {
      const percentage = Number(percentageValue);

      if (
        percentageValue === null ||
        percentageValue === "" ||
        !Number.isFinite(percentage) ||
        percentage < 0 ||
        percentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Technical skill percentage must be between 0 and 100."
        });
      }

      updates.percentage = percentage;
    } else if (
      updates.type !== undefined ||
      updates.percentage !== undefined
    ) {
      updates.percentage = null;
    }

    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: "after", runValidators: true }
    );

    res.json({
      success: true,
      message: "Skill updated successfully.",
      skill
    });
  } catch (error) {
    console.error("Update skill error:", error);
    res.status(400).json({
      success: false,
      message: "Unable to update skill."
    });
  }
});

/* DELETE: Remove skill (admin only) */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid skill ID."
      });
    }

    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found."
      });
    }

    return res.json({
      success: true,
      message: "Skill deleted successfully.",
      skill
    });
  } catch (error) {
    console.error("Delete skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete skill."
    });
  }
});


module.exports = router;
