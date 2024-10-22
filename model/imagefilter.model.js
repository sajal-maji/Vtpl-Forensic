const mongoose = require('mongoose');

const imagefilterSchema = new mongoose.Schema({
    projectId: {
        type: String
    },
    pointerPosition: {
        type: Number,
        default: 1
    },
    pointerFrom: {
        type: String,
    },
    pointerTo: {
        type: String,
    },
    jsonData: {
        type: String,
    },
    filesName: {
        type: String,
    },
    userId:{
        type: String,
        required: true,
    },
    filterType:{
        type: String,
    },
    defaultImg:{
        type: String
    }
}, { timestamps: true })

const imagefilter = mongoose.model('imagefilter', imagefilterSchema);
module.exports = imagefilter;