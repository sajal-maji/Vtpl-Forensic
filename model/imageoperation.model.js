const mongoose = require('mongoose');

const imageoperationSchema = new mongoose.Schema({
    projectId: {
        type: String
    },
    processIndex: {
        type: Number, default: 1 
    },
    processType: {
        type: String,
    },
    processName: {
        type: String,
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