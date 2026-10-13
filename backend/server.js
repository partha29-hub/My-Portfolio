const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");
const projectRoutes = require("./routes/projectRoutes");
const skillRoutes = require("./routes/skillRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const educationRoutes = require("./routes/educationRoutes");
const Contact = require("./models/Contact");
const profileRoutes = require("./routes/profileRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));
app.use("/api/profile", profileRoutes);
// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully ✅");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error ❌");
        console.error(error);
    });



// ===============================
// HOME / TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.send("Portfolio Backend is Running 🚀");
});


// ===============================
// CONTACT FORM API
// ===============================

app.post("/api/contact", async (req, res) => {

    try {

        const { name, email, subject, message } = req.body;

        // Check all fields
        if (!name || !email || !subject || !message) {

            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });

        }


        // Create new contact
        const newContact = new Contact({
            name,
            email,
            subject,
            message
        });


        // Save to MongoDB
        await newContact.save();


        // Success response
        res.status(201).json({
            success: true,
            message: "Message sent successfully! ✅"
        });


    } catch (error) {

        console.error("Contact Error ❌");
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });

    }

});


// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/education", educationRoutes);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});