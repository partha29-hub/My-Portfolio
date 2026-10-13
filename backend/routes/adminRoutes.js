
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const Contact = require("../models/Contact");
// ADMIN LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        const admin = await Admin.findOne({
            username: username.trim()
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        const token = jwt.sign(
            {
                id: admin._id.toString(),
                username: admin.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.json({
            success: true,
            message: "Login successful.",
            token,
            admin: {
                username: admin.username
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error. Please try again."
        });
    }
});

// PROTECTED DASHBOARD TEST
router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to your admin dashboard!",
        admin: req.admin
    });
});

/* GET ALL CONTACT MESSAGES - ADMIN ONLY */
router.get("/contacts", authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            contacts
        });
    } catch (error) {
        console.error("Fetch contacts error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch contact messages."
        });
    }
});

/* DELETE CONTACT MESSAGE - ADMIN ONLY */
router.delete("/contacts/:id", authMiddleware, async (req, res) => {
    try {
        if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID."
            });
        }

        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found."
            });
        }

        res.json({
            success: true,
            message: "Contact message deleted successfully."
        });
    } catch (error) {
        console.error("Delete contact error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete contact message."
        });
    }
});


module.exports = router;
