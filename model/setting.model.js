const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    singleton: {
        type: String,
        default: "SETTING",
        unique: true
    },
    siteName: {
        type: String,
        default: "Forensic Tools",
    },
    siteLogo: {
        type: String,
    },
    siteUrl: {
        type: String,
    },
    version: {
        type: String,
    },
    undoVideoLimit: {
    type: Number,   // ✅ change
    default: 3,
    required: true
    },
    undoImageLimit: {
        type: Number,
        default: 8,
        required: true
    }
}, { timestamps: true })


const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;