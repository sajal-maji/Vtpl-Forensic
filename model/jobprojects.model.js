const mongoose = require('mongoose');

const projectsSchema = new mongoose.Schema({
    jobId: {
        type: String
    },
    currentFrameId: {
        type: String,
    },
    videoFolInPtr: {
        type: String,
        default: 1,
    },
    imageFolInPtr: {
        type: Number,
        default: 1,
    },
    videoPossibleUndoCount: {
        type: Number,
        default: 0,
    },
    imagePossibleUndoCount: {
        type: Number,
        default: 0,
    },
    videoPossibleRedoCount: {
        type: Number,
        default: 0,
    },
    imagePossibleRedoCount: {
        type: Number,
        default: 0,
    },
    curDisplayThumbnailFolType: {
        type: String,
        default: 'video',
    },
    curDisplayThumbnailFolPtr: {
        type: Number,
        default: 1,
    },
    curDisplayPreviewFolType: {
        type: String,
        default: 'video',
    },
    curDisplayPreviewFolPtr: {
        type: Number,
        default: 1,
    },
    curProcessingSourceFolType: {
        type: String,
        default: 'video',
    },
    curProcessingSourceFolPtr: {
        type: Number,
        default: 0,
    },
    curProcessingDestinationFolType: {
        type: String,
        default: 'video',
    },
    curProcessingDestinationFolPtr: {
        type: Number,
        default: 0,
    },
    curProcessingPreviewSourceFolType: {
        type: String,
        default: 'video',
    },
    curProcessingPreviewSourceFolPtr: {
        type: Number,
        default: 1,
    },
    curProcessingPreviewDestinationFolType: {
        type: String,
        default: 'temp',
    },
    curProcessingPreviewDestinationFolPtr: {
        type: Number,
        default: 1,
    },
    operatePossibleOnVideoFlag: {
        type: Boolean,
        default: true
    },
    handoverPossibleImageToVideoFlag: {
        type: Boolean,
        default: true
    },
    processingGoingOnVideoOrFrameFlag: {
        type: Boolean,
        default: false,
    },
    processingGoingOnVideoNotFrame: {
        type: String,
    },
    refreshThumbnailFlag: {
        type: Boolean,
        default: true
    },
    videoToFrameWarningPopUp: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: String
    }
}, { timestamps: true })

const jobprojects = mongoose.model('jobprojects', projectsSchema);
module.exports = jobprojects;