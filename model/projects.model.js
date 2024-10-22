const mongoose = require('mongoose');

const projectsSchema = new mongoose.Schema({
    projectName: {
        type: String
    },
    catName: {
        type: String,
        required: true,
    },
    catId: {
        type: String,
        required: true,
    },
    currentFrameId: {
        type: String,
    },
    undoVideoLimit: {
        type: Number,
        default: 3
    },
    undoImageLimit: {
        type: Number,
        default: 8
    },
    totalVideoFolderSet: {
        type: Number,
        default: 5
    },
    totalImageFolderSet: {
        type: Number,
        default: 10
    },
    videoFolInPtr:{
        type: String,
        default: 1,
    },
    imageFolInPtr:{
        type: Number,
        default: 1,
    },
    TempFolInPtr:{
        type: Number,
        default: 1,
    },
    videoPossibleUndoCount:{
        type: Number,
        default: 0,
    },
    imagePossibleUndoCount:{
        type: Number,
        default: 0,
    },
    videoPossibleRedoCount:{
        type: Number,
        default: 0,
    },
    imagePossibleRedoCount:{
        type: Number,
        default: 0,
    },
    operatePossibleOnVideoFlag:{
        type: Boolean,
        default: true
    },
    handoverPossibleImageToVideoFlag:{
        type: Boolean,
        default: true
    },
    userId:{
        type: String,
        required: true,
    },
    projectDetails: {
        type: String,
    },
    filesName: {
        type: String,
    },
    srcFolType: {
        type: String,
    },
    srcFolPtr: {
        type: Number,
        default: 0,
    },
    dstFolType: {
        type: String,
    },
    dstFolPtr: {
        type: Number,
        default: 0,
    },
    curThumbFolPtr: {
        type: Number,
        default: 1,
    },
    curThumbFolType: {
        type: String,
        default: 'video',
    },
    curFrameFolPtr: {
        type: Number,
        default: 1,
    },
    curFrameFolType: {
        type: String,
        default: 'video',
    },
    isProcessingGoingOn: {
        type: Boolean,
        default: false,
    },
    refreshThumbnail: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: String
    }
}, { timestamps: true })

const projects = mongoose.model('projects', projectsSchema);
module.exports = projects;