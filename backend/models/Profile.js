
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },
        about: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000
        },
        profileImage: {
            type: String,
            default: "main.jpeg"
        },
        linkedin: {
            type: String,
            default: ""
        },
        github: {
            type: String,
            default: ""
        },
        twitter: {
            type: String,
            default: ""
        },
        instagram: {
            type: String,
            default: ""
        },
        resume: {
            type: String,
            default: "Btech27p_CSE(AI)_Partha Goudu.pdf"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Profile", profileSchema);
