const mongoose = require('mongoose');

const casefolderSchema = new mongoose.Schema({
    folderName: {
        type: String
    },
    userId:{
        type: String
    },
    isDeleted: {
        type: String
    }
}, { timestamps: true })

const Casefolder = mongoose.model('Casefolder', casefolderSchema);
module.exports = Casefolder;