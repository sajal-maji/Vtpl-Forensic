const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type: String
    },
    profileImage: {
        type: String
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String
    },
    isDeleted: {
        type: String
    }
}, { timestamps: true })

const User = mongoose.model('User', userSchema);
module.exports = User;