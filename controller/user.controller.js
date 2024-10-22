const User = require('../model/user.model');
const {channelServiceClient} = require('../grpcClient')
const fs = require('fs');
const path = require('path');
exports.getUserDetails = async (req, res, next) => {
    try {
        const {id} = req.user;

        const user = await User.findById(id, {password: 0});

        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            user
        })
    } catch (error) {
        next(error);
    }
    
}


exports.updateUserDetails = async (req, res, next) => {
    try {
        const { email, userName, profileImage } = req.body; 

        const updates = {};
        if (email) updates.email = email;
        if (userName) updates.userName = userName;

        // If an image is provided in base64 format, decode and process it
        if (profileImage) {
            const matches = profileImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const imageType = matches[1];
                const imageData = matches[2];
                const buffer = Buffer.from(imageData, 'base64');

                const fileName = `profile.${imageType}`; // Same filename to overwrite the previous image
                
                // Get the base path for media from environment variables
                const basePath = process.env.MEDIA_BASE_PATH;
                
                const directoryPath = path.join(basePath, `${req.user.id}/profile`); // Create a 'profile' folder inside the 'media/username' folder
                const uploadPath = path.join(directoryPath, fileName);

                // Ensure the 'profile' directory exists, create it if not
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, { recursive: true });
                }

                // Write the buffer to the file (overwrites if it exists)
                fs.writeFileSync(uploadPath, buffer);

                // Save the relative image path in the updates object
                updates.profileImage = path.join(`${req.user.id}/profile/${fileName}`);
            } else {
                return res.status(400).json({ message: 'Invalid image format' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true, 
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the updated user details
        res.status(200).json({
            message: 'User details updated successfully',
            user: updatedUser
        });
    } catch (error) {
        // Error handling
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
