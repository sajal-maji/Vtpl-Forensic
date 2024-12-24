const mongoose = require('mongoose');

const casefolderSchema = new mongoose.Schema({
    folderName: {
        type: String
    },
    userId:{
        type: String
    },
    slag:{
        type: String,
        default: 'others' 
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'deleted'], // Allowed values
        default: 'active', // Default value
    }
}, { timestamps: true })

const Casefolder = mongoose.model('Casefolder', casefolderSchema);
module.exports = Casefolder;