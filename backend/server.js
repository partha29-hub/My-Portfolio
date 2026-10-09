const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


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
// CONTACT SCHEMA
// ===============================

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);


// ===============================
// CONTACT MODEL
// ===============================

const Contact = mongoose.model("Contact", contactSchema);


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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});