const mongoose = require('mongoose');

const imageoperationSchema = new mongoose.Schema({
    processIndex: {
        type: Number, default: 0 
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

const Imageoperation = mongoose.model('Imageoperation', imageoperationSchema);
module.exports = Imageoperation;