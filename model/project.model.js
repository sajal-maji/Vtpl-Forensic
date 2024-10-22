const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String
    },
    pointerFrom: {
        type: String,
    },
    pointerTo: {
        type: String,
    },
    catId: {
        type: String,
        required: true,
    },
    catName: {
        type: String,
        required: true,
    },
    filesName: {
        type: String,
    },
    userId:{
        type: String,
        required: true,
    },
    undolimit:{
        type: Number,
        default: 8
    },
    projectDetails: {
        type: String,
    },
    isDeleted: {
        type: String
    }
}, { timestamps: true })

const project = mongoose.model('project', projectSchema);
module.exports = project;