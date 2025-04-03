const mongoose = require('mongoose');

const projectsSchema = new mongoose.Schema({
    jobId: {
        type: String
    },
    projectId: {
        type: String
    },
    completionPercentage: {
        type: Number,
        default: null, // Default value is null
        required: false, // Optional field
    },
    JobStatus : {
        type: String,
        enum: ['complete', 'incomplete', 'abort'], // Allowed values
        default: 'incomplete', // Default value
    }
}, { timestamps: true })

const jobprojects = mongoose.model('jobprojects', projectsSchema);
module.exports = jobprojects;