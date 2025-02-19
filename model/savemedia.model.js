const mongoose = require('mongoose');

const projectsSchema = new mongoose.Schema({
    fileName: {
        type: String
    },
    projectId: {
        type: String
    },
    userId: {
        type: String,
        required: true,
    }
}, { timestamps: true })

const savemedia = mongoose.model('savemedia', projectsSchema);
module.exports = savemedia;