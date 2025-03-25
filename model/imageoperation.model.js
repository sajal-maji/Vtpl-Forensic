const mongoose = require('mongoose');

const imageoperationSchema = new mongoose.Schema({
    projectId: {
        type: String
    },
    jobId: {
        type: String
    },
    processIndex: {
        type: Number, default: 1 
    },
    sequenceNum: {
        type: Number, default: 1 
    },
    processType: {
        type: String,
    },
    processName: {
        type: String,
    },
    startFrameNumber : {
        type: Number,
    },
    endFrameNumber: {
        type: Number,
    },
    inputImgPath: {
        type: String,
        default: null
    },
    outImgPath: {
        type: String,
        default: null
    },
    exeDetailsAvailFlag: {
        type: Boolean,
        default:true
    },
    exeDetails: {
        type: String
    }
}, { timestamps: true })

const Imageoperation = mongoose.model('imageoperation', imageoperationSchema);
module.exports = Imageoperation;