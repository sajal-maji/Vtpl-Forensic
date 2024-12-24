const User = require('../model/user.model');
const { channelServiceClient } = require('../grpcClient')
const fs = require('fs');
const path = require('path');

const getDetails = async (id) => {
    const user = await User.findById(id, { password: 0 });

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        user
    };
};

const updateDetails = async (userId, email, userName, profileImage) => {
    const updates = {};
    if (email) {
        updates.email = email;
    }
    if (userName) {
        updates.userName = userName;
    }
    if (profileImage) {
        const matches = profileImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const imageType = matches[1];
            const imageData = matches[2];
            const buffer = Buffer.from(imageData, 'base64');

            const fileName = `profile.${imageType}`; // Same filename to overwrite the previous image
            const basePath = process.env.MEDIA_BASE_PATH;

            const directoryPath = path.join(basePath, `${userId}/profile`); // Create a 'profile' folder inside the 'media/username' folder
            const uploadPath = path.join(directoryPath, fileName);

            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath, { recursive: true });
            }
            fs.writeFileSync(uploadPath, buffer);
            updates.profileImage = path.join(`${userId}/profile/${fileName}`);
        } else {
            return { message: 'Invalid image format' };
        }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true
    });

    if (!updatedUser) {
        return { message: 'User not found' };
    }

    return {
        message: 'User details updated successfully',
        user: updatedUser
    };
};

const getUserList = async (req) => {
    const user = await User.find({id : { $ne: req.user.id }}).select('_id name');

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        user
    };
};


module.exports = {
    getDetails,
    updateDetails,
    getUserList
};