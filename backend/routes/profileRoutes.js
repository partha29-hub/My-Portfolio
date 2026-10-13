const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const Profile = require("../models/Profile");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const prefix = file.fieldname === "resume" ? "resume" : "profile";
        cb(null, `${prefix}-${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "resume" && file.mimetype === "application/pdf") {
        return cb(null, true);
    }

    if (
        file.fieldname === "profileImage" &&
        ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
    ) {
        return cb(null, true);
    }

    cb(new Error("Use a PDF for resume or JPG, PNG, WEBP for profile photo."));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Public profile data for the portfolio
router.get("/public", async (req, res) => {
    try {
        const profile = await Profile.findOne().lean();

        res.json({
            success: true,
            profile: profile || null
        });
    } catch (error) {
        console.error("Public profile error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load profile."
        });
    }
});

 // Protected profile data for admin
router.get("/", authMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne().lean();

        res.json({
            success: true,
            profile: profile || null
        });
    } catch (error) {
        console.error("Profile load error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load profile."
        });
    }
});

// Update profile text and social links
router.put("/", authMiddleware, async (req, res) => {
    try {
        const fields = [
            "name", "title", "about",
            "linkedin", "github", "twitter", "instagram"
        ];

        const updates = {};

        for (const field of fields) {
            if (typeof req.body[field] === "string") {
                updates[field] = req.body[field].trim();
            }
        }

        for (const field of ["name", "title", "about"]) {
            if (
                Object.prototype.hasOwnProperty.call(updates, field) &&
                !updates[field]
            ) {
                return res.status(400).json({
                    success: false,
                    message: `${field} cannot be empty.`
                });
            }
        }

        for (const field of ["linkedin", "github", "twitter", "instagram"]) {
            if (updates[field]) {
                let url;

                try {
                    url = new URL(updates[field]);
                } catch {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid URL for ${field}.`
                    });
                }

                if (!["http:", "https:"].includes(url.protocol)) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid URL for ${field}.`
                    });
                }
            }
        }

        let profile = await Profile.findOne();

        if (!profile) {
            profile = new Profile({
                name: "Partha Goudu",
                title: "AI/ML Developer and MERN Stack Developer",
                about: "Passionate AI/ML Developer and MERN Stack Web Developer.",
                ...updates
            });
        } else {
            Object.assign(profile, updates);
        }

        await profile.save();

        res.json({
            success: true,
            message: "Profile updated successfully.",
            profile
        });
    } catch (error) {
        console.error("PROFILE UPDATE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Unable to update profile."
        });
    }
});

 // Upload profile photo or resume PDF
router.post(
    "/upload",
    authMiddleware,
    upload.fields([
        { name: "profileImage", maxCount: 1 },
        { name: "resume", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            if (!req.files || (!req.files.profileImage && !req.files.resume)) {
                return res.status(400).json({
                    success: false,
                    message: "Choose a photo or resume file."
                });
            }

            const updates = {};

            if (req.files.profileImage) {
                updates.profileImage =
                    `/uploads/${req.files.profileImage[0].filename}`;
            }

            if (req.files.resume) {
                updates.resume =
                    `/uploads/${req.files.resume[0].filename}`;
            }

            let profile = await Profile.findOne();

            if (!profile) {
                profile = new Profile({
                    name: "Partha Goudu",
                    title: "AI/ML Developer and MERN Stack Developer",
                    about: "Passionate AI/ML Developer and MERN Stack Web Developer.",
                    ...updates
                });
            } else {
                Object.assign(profile, updates);
            }

            await profile.save();

            res.json({
                success: true,
                message: "File uploaded successfully.",
                profile
            });
        } catch (error) {
            console.error("Profile upload error:", error);

            res.status(400).json({
                success: false,
                message: error.message || "Upload failed."
            });
        }
    }
);


module.exports = router;