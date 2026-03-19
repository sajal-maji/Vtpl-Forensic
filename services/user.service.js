const User = require('../model/user.model');
const Setting = require('../model/setting.model');
const { channelServiceClient } = require('../grpcClient')
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");

const getDetails = async (id) => {
    const user = await User.findById(id, { password: 0 });

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        user
    };
};

// const updateDetails = async (email, userName, profileImage,name,password,undoVideoLimit,undoImageLimit,totalVideoFolderSet,totalImageFolderSet) => {
//     const updates = {};
//     if (email) {
//         updates.email = email;
//     }
//     if (userName) {
//         updates.userName = userName;
//     }
//     if (profileImage) {
//         const matches = profileImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
//         if (matches && matches.length === 3) {
//             const imageType = matches[1];
//             const imageData = matches[2];
//             const buffer = Buffer.from(imageData, 'base64');

//             const fileName = `profile.${imageType}`; // Same filename to overwrite the previous image
//             const basePath = process.env.MEDIA_BASE_PATH;

//             const directoryPath = path.join(basePath, `${userId}/profile`); // Create a 'profile' folder inside the 'media/username' folder
//             const uploadPath = path.join(directoryPath, fileName);

//             if (!fs.existsSync(directoryPath)) {
//                 fs.mkdirSync(directoryPath, { recursive: true });
//             }
//             fs.writeFileSync(uploadPath, buffer);
//             updates.profileImage = path.join(`${userId}/profile/${fileName}`);
//         } else {
//             return { message: 'Invalid image format' };
//         }
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, updates, {
//         new: true,
//         runValidators: true
//     });

//     if (!updatedUser) {
//         return { message: 'User not found' };
//     }

//     return {
//         message: 'User details updated successfully',
//         user: updatedUser
//     };
// };

const updateDetails = async (
        userId,
        email,
        userName,
        profileImage,
        name,
        phoneNumber,
        password
    ) => {

        const updates = {};

        // ✅ Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email !== undefined && email !== null) {

                email = email.trim().toLowerCase();

                if (!emailRegex.test(email)) {
                    return { message: "Invalid email format" };
                }

                updates.email = email;
            }

            const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers

                if (phoneNumber !== undefined && phoneNumber !== null) {

                    // phoneNumber = phoneNumber.trim();

                    // if (!phoneRegex.test(phoneNumber)) {
                    //     return { message: "Invalid phone number" };
                    // }

                    updates.phoneNumber = phoneNumber;
                }



        // ✅ Username (check duplicate)
        if (userName !== undefined && userName !== null) {

            const existingUser = await User.findOne({
                userName: userName,
                _id: { $ne: userId }
            });

            if (existingUser) {
                return { message: "Username already exists" };
            }

            updates.userName = userName;
        }

        // ✅ Name
        if (name !== undefined && name !== null) {
            updates.name = name;
        }
        let isPasswordChanged=false
        // ✅ Password hashing
        if (password !== undefined && password !== null && password.trim() !== "") {

            const salt = await bcrypt.genSalt(10);
            const encPassword = await bcrypt.hash(password, salt);
            isPasswordChanged=true
            updates.password = encPassword;
        }

        

        // ✅ Profile Image
        if (profileImage) {

            const matches = profileImage.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);

            if (matches && matches.length === 3) {

                const imageType = matches[1];
                const imageData = matches[2];
                const buffer = Buffer.from(imageData, 'base64');

                const fileName = `profile.${imageType}`;
                const basePath = process.env.MEDIA_BASE_PATH;

                const directoryPath = path.join(basePath, `${userId}/profile`);
                const uploadPath = path.join(directoryPath, fileName);

                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, { recursive: true });
                }

                fs.writeFileSync(uploadPath, buffer);

                updates.profileImage = `${userId}/profile/${fileName}`;

            } else {
                return { message: 'Invalid image format' };
            }
        }

        // ❗ Prevent empty update
        if (Object.keys(updates).length === 0) {
            return { message: "No valid fields to update" };
        }

        // ✅ Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return { message: 'User not found' };
        }

        return {
            message: 'User details updated successfully',
            user: {
                ...updatedUser.toObject(),   // convert mongoose doc to plain object
                isPasswordChanged
            }
        };
    };

    const getSetting = async (req, res) => {
        try {
            const setting = await Setting.findOne();

            if (!setting) {
                return {
                    message: "Settings not found"
                };
            }

            return {
                message: "Settings fetched successfully",
                data: setting
            };

        } catch (err) {
            return {
                message: err.message
            };
        }
    };



    const updateSetting = async (
            undoVideoLimit,
            undoImageLimit,
            siteName,
            siteLogo,
            siteUrl,
            version
        ) => {

            const updates = {};

            if (undoVideoLimit !== undefined && undoVideoLimit !== null) {
                updates.undoVideoLimit = Number(undoVideoLimit);
            }

            if (undoImageLimit !== undefined && undoImageLimit !== null) {
                updates.undoImageLimit = Number(undoImageLimit);
            }

            if (siteName !== undefined && siteName !== null) {
                updates.siteName = siteName;
            }

            if (siteUrl !== undefined && siteUrl !== null) {
                updates.siteUrl = siteUrl;
            }

            if (version !== undefined && version !== null) {
                updates.version = version;
            }

            // ✅ Profile Image
            if (siteLogo) {

                const matches = siteLogo.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);

                if (matches && matches.length === 3) {

                    const imageType = matches[1];
                    const imageData = matches[2];
                    const buffer = Buffer.from(imageData, 'base64');

                    const fileName = `setting.${imageType}`;
                    const basePath = process.env.MEDIA_BASE_PATH;

                    const directoryPath = path.join(basePath, `setting`);
                    const uploadPath = path.join(directoryPath, fileName);

                    if (!fs.existsSync(directoryPath)) {
                        fs.mkdirSync(directoryPath, { recursive: true });
                    }

                    fs.writeFileSync(uploadPath, buffer);

                    updates.siteLogo = `setting/${fileName}`;

                } else {
                    return { message: 'Invalid image format' };
                }
            }

            if (Object.keys(updates).length === 0) {
                return { message: "No valid fields to update" };
            }

            // ✅ Update single setting document
            const updatedSetting = await Setting.findOneAndUpdate(
                {},
                { $set: updates },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!updatedSetting) {
                return { message: 'Setting not found' };
            }

            return {
                message: 'Settings updated successfully',
                data: updatedSetting
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
    getUserList,
    getSetting,
    updateSetting
};